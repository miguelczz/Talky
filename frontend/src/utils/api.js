import { fetchAuthSession } from "aws-amplify/auth";

/**
 * Obtiene el token JWT del usuario autenticado (idToken).
 */
export async function getToken() {
    const session = await fetchAuthSession();
    return session?.tokens?.idToken?.toString() ?? null;
}

/**
 * Base URL del backend, configurable por env var.
 */
export const baseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

/**
 * apiFetch:
 * Wrapper de fetch que:
 * - agrega el token JWT automáticamente
 * - usa baseUrl
 *
 * @param {string} endpoint - ej: "/api/glossary"
 * @param {object} options - opciones fetch (method, headers, body)
 */
export async function apiFetch(endpoint, options = {}) {
    const token = await getToken();
    if (!token) {
        const error = new Error("Usuario no autenticado");
        error.status = 401;
        throw error;
    }

    // Log para depuración en desarrollo
    if (import.meta.env.DEV && endpoint.includes("/submit")) {
        const bodyData = options.body ? JSON.parse(options.body) : null;
        console.log("Enviando petición:", {
            endpoint: `${baseUrl}${endpoint}`,
            method: options.method || "GET",
            hasToken: !!token,
            tokenLength: token.length,
            tokenPrefix: token.substring(0, 20) + "...",
            body: bodyData,
        });
    }

    const res = await fetch(`${baseUrl}${endpoint}`, {
        ...options,
        headers: {
            ...(options.headers || {}),
            Authorization: `Bearer ${token}`,
            "Content-Type":
                options.headers?.["Content-Type"] ?? "application/json",
        },
    });

    if (!res.ok) {
        let errorMessage = `Error ${res.status}: ${res.statusText || "Error en petición"}`;
        let errorData = null;
        let responseText = "";
        
        try {
            // Leer el texto de la respuesta
            responseText = await res.text();
            
            if (responseText) {
                // Intentar parsear como JSON solo si parece ser JSON válido
                const trimmedText = responseText.trim();
                if (trimmedText.startsWith('{') || trimmedText.startsWith('[')) {
                    try {
                        errorData = JSON.parse(trimmedText);
                        errorMessage = errorData.message || errorData.error || errorData.detail || errorMessage;
                    } catch (parseError) {
                        // Si falla el parseo, usar el texto directamente pero truncado
                        errorMessage = trimmedText.length > 200 
                            ? trimmedText.substring(0, 200) + '...' 
                            : trimmedText || errorMessage;
                    }
                } else {
                    // Si no parece JSON, usar el texto directamente
                    errorMessage = trimmedText.length > 200 
                        ? trimmedText.substring(0, 200) + '...' 
                        : trimmedText || errorMessage;
                }
            }
        } catch (readError) {
            console.error("Error leyendo respuesta del servidor:", readError);
        }
        
        // Log adicional para 403
        if (res.status === 403 && import.meta.env.DEV) {
            console.error("403 Forbidden - Detalles completos:", {
                endpoint,
                status: res.status,
                statusText: res.statusText,
                errorData,
                errorMessage,
                responseText: responseText || "(vacío)",
                responseTextLength: responseText?.length || 0,
                headers: Object.fromEntries(res.headers.entries()),
            });
        }
        
        const error = new Error(errorMessage);
        error.status = res.status;
        error.statusText = res.statusText;
        error.data = errorData;
        error.responseText = responseText;
        throw error;
    }

    return res;
}
