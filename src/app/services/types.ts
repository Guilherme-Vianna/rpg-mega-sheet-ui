export interface User {
  id: number;
  email: string;
  name: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface CreateUserDto {
  email: string;
  password: string;
  name: string;
}

export interface UpdateUserDto {
  email?: string;
  name?: string;
  password?: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
}

export interface Field {
  id: number;
  sheetId: number;
  name: string;
  value?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFieldDto {
  sheetId: number;
  name: string;
  value?: string;
}

export interface UpdateFieldDto {
  name?: string;
  value?: string;
}