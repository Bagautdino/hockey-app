import { api } from "./client";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  role: string;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface UserResponse {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

export async function loginApi(body: LoginRequest): Promise<TokenPair> {
  const { data } = await api.post<TokenPair>("/api/v1/auth/login", body);
  return data;
}

export async function registerApi(body: RegisterRequest): Promise<UserResponse> {
  const { data } = await api.post<UserResponse>("/api/v1/auth/register", body);
  return data;
}

export async function fetchCurrentUser(): Promise<UserResponse> {
  const { data } = await api.get<UserResponse>("/api/v1/auth/me");
  return data;
}
