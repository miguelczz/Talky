import { useState } from "react";
import { signIn, getCurrentUser, fetchAuthSession, signOut } from "aws-amplify/auth";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import axios from "axios";

export default function SignIn() {
    const { setAmplifyUser, refetchUser } = useAuth();
    const [formData, setFormData] = useState({ username: "", password: "" });
    const [message, setMessage] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleLogout = async () => {
        try {
            await signOut();
            setAmplifyUser(null);
            setMessage(null);
            // Recargar la página para limpiar el estado
            window.location.reload();
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
            setMessage("Error al cerrar sesión: " + error.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);

        try {
            // Verificar si ya hay sesión activa
            await getCurrentUser();
            setMessage("Ya hay una sesión iniciada. Por favor, cierra sesión primero.");
            return;
        } catch {
            // No hay sesión activa, continuar
        }

        try {
            // Login con Amplify
            const result = await signIn({
                username: formData.username,
                password: formData.password,
            });

            setAmplifyUser(result);

            // Obtener ID Token de la sesión
            const session = await fetchAuthSession();
            const idToken = session.tokens?.idToken?.toString();

            if (!idToken) {
                throw new Error("No se obtuvo ID Token de la sesión");
            }

            console.log("✅ Autenticación con Cognito exitosa");
            console.log("Token obtenido, longitud:", idToken.length);

            // Solo enviamos el token al backend, sin decodificarlo en el cliente
            const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
            console.log("Intentando sincronizar con backend:", `${API_URL}/api/auth/sync`);
            
            try {
                const syncResponse = await axios.post(
                    `${API_URL}/api/auth/sync`,
                    {}, // No se envian claims, backend los extrae del token
                    {
                        headers: {
                            Authorization: `Bearer ${idToken}`,
                            "Content-Type": "application/json",
                        },
                        timeout: 10000, // 10 segundos de timeout
                    }
                );
                console.log("✅ Sincronización con backend exitosa:", syncResponse.status);
            } catch (syncError) {
                console.error("❌ Error al sincronizar con backend:", syncError);
                console.error("Detalles del error:", {
                    code: syncError.code,
                    message: syncError.message,
                    response: syncError.response ? {
                        status: syncError.response.status,
                        statusText: syncError.response.statusText,
                        data: syncError.response.data
                    } : null,
                    request: syncError.request ? {
                        url: syncError.config?.url,
                        method: syncError.config?.method
                    } : null
                });
                
                // Manejar errores de red o del servidor
                if (axios.isAxiosError(syncError)) {
                    if (syncError.code === 'ECONNABORTED' || syncError.message.includes('timeout')) {
                        throw new Error("El servidor no responde. Verifica que el backend esté corriendo en " + API_URL);
                    } else if (syncError.code === 'ERR_NETWORK' || syncError.message.includes('Network Error')) {
                        throw new Error("Error de conexión. Verifica que el backend esté corriendo en " + API_URL + ". Revisa la consola para más detalles.");
                    } else if (syncError.response) {
                        // El servidor respondió con un código de error
                        const status = syncError.response.status;
                        let message = syncError.response.data?.message || syncError.response.data?.error || syncError.message;
                        
                        // Mensajes más específicos según el código de error
                        if (status === 401) {
                            message = "Token inválido o expirado. Verifica que COGNITO_ISSUER_URI esté configurado correctamente en backend/.env";
                        } else if (status === 403) {
                            message = "No tienes permisos para esta acción";
                        } else if (status === 500) {
                            message = "Error interno del servidor. Revisa los logs del backend";
                        }
                        
                        throw new Error(`Error del servidor (${status}): ${message}`);
                    } else {
                        throw new Error("Error al sincronizar con el backend: " + syncError.message);
                    }
                } else {
                    throw syncError;
                }
            }

            // Obtener información del usuario con rol desde el backend
            console.log("Obteniendo información del usuario...");
            try {
                await refetchUser();
                console.log("✅ Información del usuario obtenida");
            } catch (refetchError) {
                console.error("⚠️ Error al obtener información del usuario:", refetchError);
                // Continuar de todas formas, el usuario ya está autenticado
            }

            // Redirigir al home
            console.log("Redirigiendo al home...");
            navigate("/");
        } catch (error) {
            console.error("Error completo al iniciar sesión:", error);
            const errorMessage = error.message || "Error al iniciar sesión.";
            setMessage(errorMessage);
        }
    };

    return (
        <main className="flex items-center justify-center h-screen overflow-hidden bg-black">
            <form
                onSubmit={handleSubmit}
                className="bg-zinc-900 text-white p-8 rounded-xl shadow-md border border-zinc-700 w-full max-w-sm -mt-28">
                <h1 className="text-2xl font-bold mb-6 text-center">
                    Iniciar sesión
                </h1>

                <div className="mb-4">
                    <label htmlFor="username" className="block mb-2">
                        Correo
                    </label>
                    <input
                        type="text"
                        name="username"
                        id="username"
                        required
                        onChange={handleChange}
                        className="w-full px-4 py-2 mb-6 rounded-md bg-zinc-800 border border-zinc-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="mb-6">
                    <label htmlFor="password" className="block mb-1">
                        Contraseña
                    </label>
                    <input
                        type="password"
                        name="password"
                        id="password"
                        required
                        onChange={handleChange}
                        className="w-full px-4 py-2 mb-5 rounded-md bg-zinc-800 border border-zinc-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 transition font-semibold py-2 rounded-md">
                    Ingresar
                </button>

                <div className="mt-6 text-sm text-center text-zinc-400 space-y-2">
                    <p>
                        ¿Olvidaste tu contraseña?{" "}
                        <Link
                            to="/forgot"
                            className="text-blue-400 hover:text-blue-300 font-medium">
                            Recupérala aquí
                        </Link>
                    </p>
                    <p>
                        ¿No tienes cuenta?{" "}
                        <Link
                            to="/signup"
                            className="text-blue-400 hover:text-blue-300 font-medium">
                            Regístrate
                        </Link>
                    </p>
                </div>

                {message && (
                    <div className="mt-4">
                        <p className="text-red-500 text-sm text-center mb-3">
                            {message}
                        </p>
                        {message.includes("Ya hay una sesión iniciada") && (
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="w-full bg-red-600 hover:bg-red-700 transition font-semibold py-2 rounded-md text-white">
                                Cerrar Sesión Actual
                            </button>
                        )}
                    </div>
                )}
            </form>
        </main>
    );
}
