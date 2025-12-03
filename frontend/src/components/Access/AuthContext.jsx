import { createContext, useContext, useEffect, useState } from "react";
import { getCurrentUser } from "aws-amplify/auth";
import { baseUrl, getToken } from "../../utils/api";

const AuthContext = createContext();

/**
 * Estructura del usuario con información del backend
 * @typedef {Object} User
 * @property {string} id
 * @property {string} email
 * @property {string} name
 * @property {"STUDENT" | "TEACHER" | "ADMIN"} role
 * @property {string} [courseId]
 * @property {string} [courseTitle]
 * @property {number} [coursesCount]
 * @property {string} [phoneNumber]
 * @property {string} [birthdate]
 * @property {string} [gender]
 * @property {string} [createdAt]
 * @property {string} [updatedAt]
 */

export function AuthProvider({ children }) {
  const [amplifyUser, setAmplifyUser] = useState(null); // Usuario de Amplify
  const [user, setUser] = useState(null); // Usuario del backend con rol
  const [loading, setLoading] = useState(true);

  /**
   * Obtiene la información del usuario desde el backend incluyendo el rol
   */
  const fetchUserData = async () => {
    try {
      const token = await getToken();
      if (!token) {
        setUser(null);
        return;
      }

      const response = await fetch(`${baseUrl}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else if (response.status === 401) {
        // Token inválido o expirado
        setUser(null);
        setAmplifyUser(null);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setUser(null);
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      try {
        // Verificar si hay usuario en Amplify
        const currentUser = await getCurrentUser();
        setAmplifyUser(currentUser);
        
        // Obtener información del backend con rol
        await fetchUserData();
      } catch {
        setAmplifyUser(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  // Refetch user data cuando cambie amplifyUser
  useEffect(() => {
    if (amplifyUser && !user) {
      fetchUserData();
    } else if (!amplifyUser) {
      setUser(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amplifyUser]);

  return (
    <AuthContext.Provider
      value={{
        user, // Usuario del backend con rol
        amplifyUser, // Usuario de Amplify
        setUser,
        setAmplifyUser,
        loading,
        refetchUser: fetchUserData,
        isStudent: user?.role === "STUDENT",
        isTeacher: user?.role === "TEACHER",
        isAdmin: user?.role === "ADMIN",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
