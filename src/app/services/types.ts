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

export interface Section {
  id: number;
  name: string;
}

export interface CreateFieldDto {
  color: string,
  type: string,
  sectionId: number;
  sheetId: number;
  name: string;
  value?: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface UpdateFieldDto {
  color: string,
  type: string,
  sectionId: number;
  name?: string;
  value?: string;
  x: number;
  y: number;
  w: number;
  h: number;
}