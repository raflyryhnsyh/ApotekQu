// Base API client with error handling
class ApiClient {
    private baseUrl = '/api'

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<{ data: T | null; error: string | null; success: boolean }> {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
                ...options,
            })

            const result = await response.json()

            if (!response.ok) {
                return {
                    data: null,
                    error: result.error || `HTTP ${response.status}`,
                    success: false
                }
            }

            return {
                data: result.data,
                error: null,
                success: result.success
            }
        } catch (error) {
            return {
                data: null,
                error: error instanceof Error ? error.message : 'Network error',
                success: false
            }
        }
    }

    // GET request
    async get<T>(endpoint: string, params?: Record<string, string>) {
        const url = params
            ? `${endpoint}?${new URLSearchParams(params)}`
            : endpoint

        return this.request<T>(url)
    }

    // POST request
    async post<T>(endpoint: string, data?: any) {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        })
    }

    // PUT request
    async put<T>(endpoint: string, data?: any) {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
        })
    }

    // DELETE request
    async delete<T>(endpoint: string) {
        return this.request<T>(endpoint, {
            method: 'DELETE',
        })
    }
}

export const apiClient = new ApiClient()
