export default function Loading() {
    return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-sm text-gray-600">Memuat data...</p>
        </div>
    );
}