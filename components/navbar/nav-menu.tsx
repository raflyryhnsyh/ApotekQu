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

export const NavMenu = (props: NavigationMenuProps) => (
    <NavigationMenu {...props}>
        <NavigationMenuList className="gap-6 space-x-0 data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-start">
            <NavigationMenuItem>
                <NavigationMenuLink asChild>
                    <Link href="/" className="font-medium">Home</Link>
                </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
                <NavigationMenuLink asChild>
                    <Link href="/obat-master" className="font-medium">Obat Master</Link>
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
                                href="/pengadaan/buat-po"
                                className="w-full cursor-pointer"
                            >
                                Buat PO
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link
                                href="/pengadaan/informasi-po"
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
                    <Link href="/pengelolaan" className="font-medium">Pengelolaan</Link>
                </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
                <NavigationMenuLink asChild>
                    <Link href="/penjualan" className="font-medium">Penjualan</Link>
                </NavigationMenuLink>
            </NavigationMenuItem>
        </NavigationMenuList>
    </NavigationMenu>
);