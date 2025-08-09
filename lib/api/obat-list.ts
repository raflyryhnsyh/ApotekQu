export interface Obat {
    id: string
    nama_obat: string
    kategori?: string
    komposisi?: string
}

export interface ObatResponse {
    success: boolean
    data: Obat[]
    message?: string
}

export async function getObatList(): Promise<ObatResponse> {
    try {
        const response = await fetch('/api/obat', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })

        if (!response.ok) {
            throw new Error('Failed to fetch obat list')
        }

        const data = await response.json()
        return data
    } catch (error) {
        console.error('Error fetching obat list:', error)
        return {
            success: false,
            data: [],
            message: 'Failed to fetch obat list'
        }
    }
}
