// API functions for users management

export interface UserResponse {
    id: string;
    nama: string;
    username: string;
    email: string;
    role: string;
    tanggal_dibuat: string;
}

export interface CreateUserData {
    nama: string;
    username: string;
    password: string;
    role?: string;
}

export interface UpdateUserData {
    nama?: string;
    username?: string;
    password?: string;
}

// Fetch users with optional role filter
export const fetchUsers = async (role?: string): Promise<UserResponse[]> => {
    try {
        const url = new URL('/api/users', window.location.origin);
        if (role) {
            url.searchParams.append('role', role);
        }

        const response = await fetch(url.toString());

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch users');
        }

        const result = await response.json();
        return result.data || [];
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
};

// Fetch pegawai specifically
export const fetchPegawai = async (): Promise<UserResponse[]> => {
    return fetchUsers('Pegawai');
};

// Create new user
export const createUser = async (userData: CreateUserData): Promise<UserResponse> => {
    try {
        const response = await fetch('/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create user');
        }

        const result = await response.json();
        return result.data;
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
};

// Update user
export const updateUser = async (id: string, userData: UpdateUserData): Promise<UserResponse> => {
    try {
        const response = await fetch(`/api/users/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update user');
        }

        const result = await response.json();
        return result.data;
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
};

// Delete user
export const deleteUser = async (id: string): Promise<void> => {
    try {
        const response = await fetch(`/api/users/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to delete user');
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
};
