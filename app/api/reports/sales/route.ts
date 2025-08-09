import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { z } from "zod";

// Validation schema for sales
const createSaleSchema = z.object({
    diproses_oleh: z.string().uuid(),
    items: z.array(z.object({
        id_obat: z.string().uuid(),
        jumlah_terjual: z.number().positive(),
        harga: z.number().positive(),
        nomor_batch: z.string().min(1)
    })).min(1)
});

const querySchema = z.object({
    page: z.string().optional().default("1"),
    limit: z.string().optional().default("10"),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    userId: z.string().optional()
});

// GET /api/reports/sales - Get sales transactions
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const query = querySchema.parse(Object.fromEntries(searchParams));

        const page = parseInt(query.page);
        const limit = parseInt(query.limit);
        const offset = (page - 1) * limit;

        const supabase = await createClient();

        // Build query with filters
        let salesQuery = supabase
            .from("penjualan")
            .select(`
        id,
        dibuat_pada,
        total,
        pengguna!inner(
          id,
          full_name
        ),
        detail_penjualan(
          id,
          jumlah_terjual,
          harga,
          nomor_batch,
          obat(
            id,
            nama_obat,
            kategori
          )
        )
      `)
            .order("dibuat_pada", { ascending: false })
            .range(offset, offset + limit - 1);

        // Apply filters
        if (query.startDate) {
            salesQuery = salesQuery.gte("dibuat_pada", query.startDate);
        }
        if (query.endDate) {
            salesQuery = salesQuery.lte("dibuat_pada", query.endDate);
        }
        if (query.userId) {
            salesQuery = salesQuery.eq("diproses_oleh", query.userId);
        }

        const { data: sales, error: salesError } = await salesQuery;

        if (salesError) {
            console.error("Error fetching sales:", salesError);
            return NextResponse.json({
                success: false,
                error: salesError.message,
                data: null
            }, { status: 500 });
        }

        console.log("Fetched sales data:", sales?.length || 0, "records");
        console.log("Sample sales record:", sales?.[0]);
        if (sales?.[0]?.detail_penjualan) {
            console.log("Sample detail_penjualan:", sales[0].detail_penjualan);
        }

        // Get total count for pagination
        let countQuery = supabase
            .from("penjualan")
            .select("*", { count: "exact", head: true });

        if (query.startDate) {
            countQuery = countQuery.gte("dibuat_pada", query.startDate);
        }
        if (query.endDate) {
            countQuery = countQuery.lte("dibuat_pada", query.endDate);
        }
        if (query.userId) {
            countQuery = countQuery.eq("diproses_oleh", query.userId);
        }

        const { count, error: countError } = await countQuery;

        if (countError) {
            console.error("Error counting sales:", countError);
            return NextResponse.json({
                success: false,
                error: countError.message,
                data: null
            }, { status: 500 });
        }

        const totalPages = Math.ceil((count || 0) / limit);

        return NextResponse.json({
            success: true,
            data: {
                data: sales,
                pagination: {
                    page,
                    limit,
                    total: count || 0,
                    totalPages
                }
            },
            error: null
        });

    } catch (error) {
        console.error("Error in GET /api/reports/sales:", error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : "Internal server error",
            data: null
        }, { status: 500 });
    }
}

// POST /api/reports/sales - Create new sale
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validatedData = createSaleSchema.parse(body);

        const supabase = await createClient();

        // Calculate total
        const total = validatedData.items.reduce((sum, item) =>
            sum + (item.jumlah_terjual * item.harga), 0
        );

        // Consolidate items with same id_obat and nomor_batch BEFORE creating the sale
        const consolidatedItems = new Map();

        // Consolidate items with same id_obat and nomor_batch
        validatedData.items.forEach(item => {
            const key = `${item.id_obat}_${item.nomor_batch}`;
            if (consolidatedItems.has(key)) {
                const existing = consolidatedItems.get(key);
                existing.jumlah_terjual += item.jumlah_terjual;
                // Use weighted average for price if different
                existing.harga = ((existing.harga * existing.originalCount) + (item.harga * 1)) / (existing.originalCount + 1);
                existing.originalCount += 1;
            } else {
                consolidatedItems.set(key, {
                    ...item,
                    originalCount: 1
                });
            }
        });

        // VALIDATE EVERYTHING FIRST before creating any database records
        const validatedItems = [];
        const stockValidationErrors = [];

        for (const item of Array.from(consolidatedItems.values())) {
            console.log(`Validating batch: ${item.nomor_batch} for product: ${item.id_obat}`);

            const { data: batchExists, error: batchError } = await supabase
                .from("detail_obat")
                .select("nomor_batch, stok_sekarang, id_obat")
                .eq("nomor_batch", item.nomor_batch)
                .eq("id_obat", item.id_obat)
                .single();

            if (batchError || !batchExists) {
                console.error(`Batch ${item.nomor_batch} not found in detail_obat for product ${item.id_obat}`);
                console.error('Error details:', batchError);

                // Debug: List available batches for this product
                const { data: availableBatches } = await supabase
                    .from("detail_obat")
                    .select("nomor_batch, stok_sekarang, id_obat")
                    .eq("id_obat", item.id_obat)
                    .gt("stok_sekarang", 0)
                    .order("tanggal_expired", { ascending: true });

                console.log(`Available batches for product ${item.id_obat}:`, availableBatches);

                // Try to find any available batch for this product with sufficient stock
                if (availableBatches && availableBatches.length > 0) {
                    const availableBatch = availableBatches.find(b => b.stok_sekarang >= item.jumlah_terjual);
                    if (availableBatch) {
                        console.log(`Using alternative batch: ${availableBatch.nomor_batch}`);
                        item.nomor_batch = availableBatch.nomor_batch;
                        validatedItems.push(item);
                        continue;
                    }
                }

                stockValidationErrors.push(`Batch ${item.nomor_batch} not found for product ${item.id_obat}. Available batches: ${availableBatches?.map(b => `${b.nomor_batch} (stock: ${b.stok_sekarang})`).join(', ') || 'none'}`);
                continue;
            }

            // Check stock availability
            if (batchExists.stok_sekarang < item.jumlah_terjual) {
                stockValidationErrors.push(`Insufficient stock for batch ${item.nomor_batch}. Available: ${batchExists.stok_sekarang}, Requested: ${item.jumlah_terjual}`);
                continue;
            }

            validatedItems.push(item);
        }

        // If validation failed, return error WITHOUT creating any database records
        if (stockValidationErrors.length > 0) {
            return NextResponse.json({
                success: false,
                error: `Stock validation failed: ${stockValidationErrors.join('; ')}`,
                data: null
            }, { status: 400 });
        }

        // Only create the sale AFTER all validations pass
        const { data: sale, error: saleError } = await supabase
            .from("penjualan")
            .insert([{
                diproses_oleh: validatedData.diproses_oleh,
                total: total,
                dibuat_pada: new Date().toISOString()
            }])
            .select()
            .single();

        if (saleError) {
            console.error("Error creating sale:", saleError);
            return NextResponse.json({
                success: false,
                error: saleError.message,
                data: null
            }, { status: 500 });
        } const saleDetails = validatedItems.map(item => ({
            id_penjualan: sale.id,
            id_obat: item.id_obat,
            jumlah_terjual: item.jumlah_terjual,
            harga: item.harga,
            nomor_batch: item.nomor_batch
        })); const { data: details, error: detailsError } = await supabase
            .from("detail_penjualan")
            .insert(saleDetails)
            .select();

        if (detailsError) {
            console.error("Error creating sale details:", detailsError);
            // Rollback: delete the sale
            await supabase.from("penjualan").delete().eq("id", sale.id);

            return NextResponse.json({
                success: false,
                error: detailsError.message,
                data: null
            }, { status: 500 });
        }

        // Update stock for each validated item (we already checked availability above)
        const stockUpdates = [];

        for (const item of validatedItems) {
            // Get current stock
            const { data: currentStock, error: stockError } = await supabase
                .from("detail_obat")
                .select("stok_sekarang")
                .eq("nomor_batch", item.nomor_batch)
                .eq("id_obat", item.id_obat)
                .single();

            if (stockError) {
                console.error(`Error getting stock for batch ${item.nomor_batch}:`, stockError);
                continue;
            }

            const oldStock = currentStock.stok_sekarang;
            const newStock = oldStock - item.jumlah_terjual;

            // Update stock (no need to check again since we validated above)
            const { error: updateError } = await supabase
                .from("detail_obat")
                .update({ stok_sekarang: newStock })
                .eq("nomor_batch", item.nomor_batch)
                .eq("id_obat", item.id_obat);

            if (updateError) {
                console.error(`Error updating stock for batch ${item.nomor_batch}:`, updateError);
                continue;
            }

            stockUpdates.push({
                nomor_batch: item.nomor_batch,
                old_stock: oldStock,
                new_stock: newStock,
                difference: -item.jumlah_terjual
            });
        }

        return NextResponse.json({
            success: true,
            data: {
                penjualan: sale,
                details: details,
                stock_updates: stockUpdates
            },
            error: null,
            message: "Penjualan berhasil diproses"
        });

    } catch (error) {
        console.error("Error in POST /api/reports/sales:", error);

        if (error instanceof z.ZodError) {
            return NextResponse.json({
                success: false,
                error: "Validation error",
                details: error.issues,
                data: null
            }, { status: 400 });
        }

        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : "Internal server error",
            data: null
        }, { status: 500 });
    }
}

// PUT /api/reports/sales/[id] - Update sale status (if needed)
export async function PUT(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({
                success: false,
                error: "Sale ID is required",
                data: null
            }, { status: 400 });
        }

        const body = await request.json();
        const supabase = await createClient();

        const { data: sale, error } = await supabase
            .from("penjualan")
            .update(body)
            .eq("id", id)
            .select()
            .single();

        if (error) {
            console.error("Error updating sale:", error);
            return NextResponse.json({
                success: false,
                error: error.message,
                data: null
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            data: sale,
            error: null,
            message: "Penjualan berhasil diupdate"
        });

    } catch (error) {
        console.error("Error in PUT /api/reports/sales:", error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : "Internal server error",
            data: null
        }, { status: 500 });
    }
}

// DELETE /api/reports/sales/[id] - Delete sale (if needed for admin)
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({
                success: false,
                error: "Sale ID is required",
                data: null
            }, { status: 400 });
        }

        const supabase = await createClient();

        // First, get sale details to restore stock
        const { data: saleDetails, error: detailsError } = await supabase
            .from("detail_penjualan")
            .select("id_obat, jumlah_terjual, nomor_batch")
            .eq("id_penjualan", id);

        if (detailsError) {
            console.error("Error fetching sale details:", detailsError);
            return NextResponse.json({
                success: false,
                error: detailsError.message,
                data: null
            }, { status: 500 });
        }

        // Restore stock for each item
        for (const detail of saleDetails || []) {
            // Get current stock to add back the sold quantity
            const { data: currentStock, error: getStockError } = await supabase
                .from("detail_obat")
                .select("stok_sekarang")
                .eq("nomor_batch", detail.nomor_batch)
                .eq("id_obat", detail.id_obat)
                .single();

            if (getStockError) {
                console.error(`Error getting current stock for batch ${detail.nomor_batch}:`, getStockError);
                continue;
            }

            const newStock = currentStock.stok_sekarang + detail.jumlah_terjual;

            const { error: stockError } = await supabase
                .from("detail_obat")
                .update({ stok_sekarang: newStock })
                .eq("nomor_batch", detail.nomor_batch)
                .eq("id_obat", detail.id_obat);

            if (stockError) {
                console.error(`Error restoring stock for batch ${detail.nomor_batch}:`, stockError);
            }
        }        // Delete sale details first (foreign key constraint)
        const { error: deleteDetailsError } = await supabase
            .from("detail_penjualan")
            .delete()
            .eq("id_penjualan", id);

        if (deleteDetailsError) {
            console.error("Error deleting sale details:", deleteDetailsError);
            return NextResponse.json({
                success: false,
                error: deleteDetailsError.message,
                data: null
            }, { status: 500 });
        }

        // Delete the sale
        const { error: deleteSaleError } = await supabase
            .from("penjualan")
            .delete()
            .eq("id", id);

        if (deleteSaleError) {
            console.error("Error deleting sale:", deleteSaleError);
            return NextResponse.json({
                success: false,
                error: deleteSaleError.message,
                data: null
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            data: null,
            error: null,
            message: "Penjualan berhasil dihapus dan stok dikembalikan"
        });

    } catch (error) {
        console.error("Error in DELETE /api/reports/sales:", error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : "Internal server error",
            data: null
        }, { status: 500 });
    }
}
