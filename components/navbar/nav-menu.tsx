'use client';

import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    NavigationMenuContent,
} from "@/components/ui/navigation-menu";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NavigationMenuProps } from "@radix-ui/react-navigation-menu";
import Link from "next/link";
import { Button } from "../ui/button";
import { ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

// Navbar untuk APA
const APANavMenu = (props: NavigationMenuProps) => (
    <NavigationMenu {...props}>
        <NavigationMenuList className="gap-6 space-x-0 data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-start">
            <NavigationMenuItem>
                <NavigationMenuLink asChild>
                    <Link href="/APA" className="font-medium">Home</Link>
                </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
                <NavigationMenuLink asChild>
                    <Link href="/APA/kelola-pegawai" className="font-medium">Kelola Pegawai</Link>
                </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
                <NavigationMenuLink asChild>
                    <Link href="/APA/laporan-obat" className="font-medium">Laporan</Link>
                </NavigationMenuLink>
            </NavigationMenuItem>
        </NavigationMenuList>
    </NavigationMenu>
);

// Navbar untuk Pegawai
const PegawaiNavMenu = (props: NavigationMenuProps) => (
    <NavigationMenu {...props}>
        <NavigationMenuList className="gap-6 space-x-0 data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-start">
            <NavigationMenuItem>
                <NavigationMenuLink asChild>
                    <Link href="/pegawai" className="font-medium">Home</Link>
                </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
                <NavigationMenuLink asChild>
                    <Link href="/pegawai/obat-master" className="font-medium">Obat Master</Link>
                </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="flex items-center gap-1 px-3 py-2 h-auto font-medium"
                        >
                            Pengadaan
                            <ChevronDown className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48">
                        <DropdownMenuItem asChild>
                            <Link
                                href="/pegawai/pengadaan/buat-po"
                                className="w-full cursor-pointer"
                            >
                                Buat PO
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link
                                href="/pegawai/pengadaan/informasi-po"
                                className="w-full cursor-pointer"
                            >
                                Informasi PO
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </NavigationMenuItem>
            <NavigationMenuItem>
                <NavigationMenuLink asChild>
                    <Link href="/pegawai/pengelolaan" className="font-medium">Pengelolaan</Link>
                </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
                <NavigationMenuLink asChild>
                    <Link href="/pegawai/penjualan" className="font-medium">Penjualan</Link>
                </NavigationMenuLink>
            </NavigationMenuItem>
        </NavigationMenuList>
    </NavigationMenu>
);

// Main component yang menentukan navbar berdasarkan role
export const NavMenu = (props: NavigationMenuProps) => {
    const { user, profile, loading } = useAuth();

    // Jika masih loading atau tidak ada user, tampilkan default navbar
    if (loading || !user || !profile) {
        return null;
    }

    // Render navbar berdasarkan role
    switch (profile.role) {
        case 'APA':
            return <APANavMenu {...props} />;
        case 'Pegawai':
            return <PegawaiNavMenu {...props} />;
        default:
            return null;
    }
};