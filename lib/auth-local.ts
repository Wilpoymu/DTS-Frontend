// auth-local.ts
// Simple localStorage-based auth for demo purposes

export interface LocalUser {
  email: string;
  password: string;
  name: string;
}

const USERS_KEY = "users";
const CURRENT_USER_KEY = "currentUser";

export function registerUser(email: string, password: string, name: string): { success: boolean; error?: string } {
  if (typeof window === "undefined") return { success: false, error: "No window" };
  const users: LocalUser[] = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  if (users.find(u => u.email === email)) {
    return { success: false, error: "User already exists" };
  }
  const newUser: LocalUser = { email, password, name };
  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
  return { success: true };
}

export function loginUser(email: string, password: string): { success: boolean; user?: LocalUser; error?: string } {
  if (typeof window === "undefined") return { success: false, error: "No window" };
  const users: LocalUser[] = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    return { success: false, error: "Invalid credentials" };
  }
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  return { success: true, user };
}

export function getCurrentUser(): LocalUser | null {
  if (typeof window === "undefined") return null;
  // Si hay usuario guardado, retornar ese
  const user = localStorage.getItem(CURRENT_USER_KEY);
  if (user) return JSON.parse(user);
  // Si solo hay token en cookie, retornar usuario dummy temporal
  const { getAuthToken } = require('./auth-api');
  if (getAuthToken()) {
    return { email: "", password: "", name: "" };
  }
  return null;
}

export function logoutUser() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CURRENT_USER_KEY);
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  const { getAuthToken } = require('./auth-api');
  const authenticated = !!getAuthToken();
  return authenticated;
} 