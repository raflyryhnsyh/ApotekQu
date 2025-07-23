'use client';

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Menu, ChevronDown } from "lucide-react";
import { Logo } from "./logo";
import Link from "next/link";
import { useState } from "react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export const NavigationSheet = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                    <Menu />
                </Button>
            </SheetTrigger>
            <SheetContent>
                <VisuallyHidden>
                    <SheetTitle>Navigation Menu</SheetTitle>
                    <SheetDescription>Navigate through the application</SheetDescription>
                </VisuallyHidden>

                <Logo />

                <nav className="mt-12 space-y-2">
                    <Link
                        href="/"
                        className="block px-4 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                    >
                        Home
                    </Link>

                    <Link
                        href="/obat-master"
                        className="block px-4 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                    >
                        Obat Master
                    </Link>

                    <div className="space-y-1">
                        <button
                            onClick={toggleDropdown}
                            className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                        >
                            Pengadaan
                            <ChevronDown
                                className={`h-4 w-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''
                                    }`}
                            />
                        </button>

                        {isDropdownOpen && (
                            <div className="ml-4 space-y-1 border-l-2 border-border pl-4">
                                <Link
                                    href="/pengadaan/buat-po"
                                    className="block px-4 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                                >
                                    Buat PO
                                </Link>
                                <Link
                                    href="/pengadaan/informasi-po"
                                    className="block px-4 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                                >
                                    Informasi PO
                                </Link>
                            </div>
                        )}
                    </div>

                    <Link
                        href="/pengelolaan"
                        className="block px-4 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                    >
                        Pengelolaan
                    </Link>

                    <Link
                        href="/penjualan"
                        className="block px-4 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                    >
                        Penjualan
                    </Link>
                </nav>
            </SheetContent>
        </Sheet>
    );
};