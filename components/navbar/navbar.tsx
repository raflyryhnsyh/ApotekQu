import { Logo } from "./logo";
import { NavMenu } from "./nav-menu";
import { NavigationSheet } from "./nav-sheet";
import { UserDropdown } from "./user-dropdown";

const NavbarPage = () => {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-background border-b">
            <div className="h-full flex items-center justify-between max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                <Logo />

                <div className="flex items-center gap-3">
                    {/* Desktop Menu */}
                    <NavMenu className="hidden md:block" />
                    <UserDropdown />

                    {/* Mobile Menu */}
                    <div className="md:hidden">
                        <NavigationSheet />
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default NavbarPage;
