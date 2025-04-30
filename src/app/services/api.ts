import { API_CONFIG } from './config';
import { CreateUserDto, UpdateUserDto, LoginResponse, User, ApiError, CreateFieldDto, Field } from './types';

// Adicionando tipos para Sheets
export interface Sheet {
  id: number;
  name: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSheetDto {
  name: string;
  userId: number;
}

export interface UpdateSheetDto {
  name?: string;
  userId: number;
}

class ApiService {
  private getHeaders(includeAuth: boolean = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.message || 'An error occurred');
    }

    return response.json();
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`, {
        method: 'POST',
        headers: this.getHeaders(false),
        body: JSON.stringify({ email, password }),
      });

      return this.handleResponse<LoginResponse>(response);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Login failed');
    }
  }

  // User endpoints
  async createUser(userData: CreateUserDto): Promise<User> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS}`, {
        method: 'POST',
        headers: this.getHeaders(false),
        body: JSON.stringify(userData),
      });

      return this.handleResponse<User>(response);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to create user');
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS}`, {
        headers: this.getHeaders(),
      });

      return this.handleResponse<User[]>(response);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch users');
    }
  }

  async getUserById(id: number): Promise<User> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS}/${id}`, {
        headers: this.getHeaders(),
      });

      return this.handleResponse<User>(response);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch user');
    }
  }

  async updateUser(id: number, userData: UpdateUserDto): Promise<User> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS}/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(userData),
      });

      return this.handleResponse<User>(response);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to update user');
    }
  }

  async deleteUser(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS}/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      return this.handleResponse<void>(response);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to delete user');
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.RESET_PASSWORD}`, {
        method: 'POST',
        headers: this.getHeaders(false),
        body: JSON.stringify({ token, newPassword }),
      });

      return this.handleResponse<{ message: string }>(response);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to reset password');
    }
  }

  async createSheet(data: CreateSheetDto): Promise<Sheet> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SHEETS}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });

      return this.handleResponse<Sheet>(response);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to create sheet');
    }
  }

  async getAllSheets(): Promise<Sheet[]> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SHEETS}`, {
        headers: this.getHeaders(),
      });

      return this.handleResponse<Sheet[]>(response);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch sheets');
    }
  }

  async getSheetById(id: number): Promise<Sheet> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SHEETS}/${id}`, {
        headers: this.getHeaders(),
      });

      return this.handleResponse<Sheet>(response);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch sheet');
    }
  }

  async updateSheet(id: number, data: UpdateSheetDto): Promise<Sheet> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SHEETS}/${id}`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });

      return this.handleResponse<Sheet>(response);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to update sheet');
    }
  }

  async deleteSheet(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SHEETS}/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      return this.handleResponse<void>(response);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to delete sheet');
    }
  }

  async createField(data: CreateFieldDto): Promise<Field> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FIELDS}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });

      return this.handleResponse<Field>(response);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to create field');
    }
  }

  async getFieldById(id: number): Promise<Field> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FIELDS}/${id}`, {
        headers: this.getHeaders(),
      });

      return this.handleResponse<Field>(response);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch field');
    }
  }

  async getFieldsBySheetId(sheetId: number): Promise<Field[]> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FIELDS}?sheetId=${sheetId}`, {
        headers: this.getHeaders(),
      });

      return this.handleResponse<Field[]>(response);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch fields');
    }
  }

  async updateField(id: number, data: UpdateFieldDto): Promise<Field> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FIELDS}/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });

      return this.handleResponse<Field>(response);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to update field');
    }
  }

  async deleteField(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FIELDS}/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      return this.handleResponse<void>(response);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to delete field');
    }
  }
}

export const api = new ApiService();
