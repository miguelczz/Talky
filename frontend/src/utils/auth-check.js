import { apiFetch } from "./api";

/**
 * Verifica los roles del usuario actual y el estado del JWT
 * Útil para diagnosticar problemas de autenticación/autorización
 */
export async function checkAuthStatus() {
  try {
    const response = await apiFetch("/api/auth/check-roles");
    const data = await response.json();
    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      status: error.status,
    };
  }
}

