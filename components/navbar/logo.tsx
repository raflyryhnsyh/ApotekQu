import Image from "next/image"

export const Logo = () => (
    <div className="flex items-center space-x-2">
        <Image
            src="/logo.png"
            alt="Apotek Qu Logo"
            width={16}
            height={16}
            className="w-4 h-4 contain-content"
        />
        <span className="text-xl font-bold">Apotek Qu</span>
    </div>
);
