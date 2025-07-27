export default function Loading() {
    return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)]">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
            <p className="mt-4 text-gray-600">Memuat data...</p>
        </div>
    );
}