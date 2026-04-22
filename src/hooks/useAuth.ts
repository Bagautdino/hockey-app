import { useCallback, useSyncExternalStore } from "react";
import {
  loginApi,
  registerApi,
  fetchCurrentUser,
  type LoginRequest,
  type RegisterRequest,
  type UserResponse,
} from "@/api/auth";

let currentUser: UserResponse | null = null;
let listeners: Array<() => void> = [];

function emitChange() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function getSnapshot(): UserResponse | null {
  return currentUser;
}

export function useCurrentUser() {
  return useSyncExternalStore(subscribe, getSnapshot);
}

export function useIsAuthenticated() {
  try {
    return !!localStorage.getItem("access_token");
  } catch {
    return false;
  }
}

export function useAuth() {
  const user = useCurrentUser();

  const login = useCallback(async (body: LoginRequest) => {
    const tokens = await loginApi(body);
    localStorage.setItem("access_token", tokens.access_token);
    localStorage.setItem("refresh_token", tokens.refresh_token);
    const me = await fetchCurrentUser();
    currentUser = me;
    emitChange();
  }, []);

  const register = useCallback(async (body: RegisterRequest) => {
    await registerApi(body);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    currentUser = null;
    emitChange();
  }, []);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;
    try {
      const me = await fetchCurrentUser();
      currentUser = me;
      emitChange();
    } catch {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      currentUser = null;
      emitChange();
    }
  }, []);

  return { user, login, register, logout, loadUser };
}
