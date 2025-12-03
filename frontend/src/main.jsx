import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./components/Access/AuthContext";

import { Amplify } from 'aws-amplify';

// Configuración de Amplify desde variables de entorno
// IMPORTANTE: Todas las variables deben estar definidas en .env.local

// Variables requeridas (obligatorias)
const requiredEnvVars = {
  VITE_COGNITO_USER_POOL_ID: import.meta.env.VITE_COGNITO_USER_POOL_ID,
  VITE_COGNITO_CLIENT_ID: import.meta.env.VITE_COGNITO_CLIENT_ID,
};

// Variable opcional (solo necesaria si usas Identity Pool para acceso a recursos AWS)
const identityPoolId = import.meta.env.VITE_COGNITO_IDENTITY_POOL_ID;

// Validar que las variables requeridas estén definidas
const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error(
    "❌ ERROR: Faltan variables de entorno requeridas:",
    missingVars.join(", ")
  );
  console.error(
    "Por favor, crea un archivo .env.local en frontend/ con las siguientes variables:"
  );
  missingVars.forEach((key) => {
    console.error(`  ${key}=tu_valor_aqui`);
  });
  throw new Error(
    `Variables de entorno faltantes: ${missingVars.join(", ")}`
  );
}

// Construir configuración de Amplify
const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: requiredEnvVars.VITE_COGNITO_USER_POOL_ID,
      userPoolClientId: requiredEnvVars.VITE_COGNITO_CLIENT_ID,
      loginWith: {
        email: true,
        username: true
      },
      signUpVerificationMethod: "code",
      passwordFormat: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireNumbers: true,
        requireSpecialCharacters: true
      }
    }
  }
};

// Agregar Identity Pool ID solo si está configurado (opcional)
// Solo es necesario si usas Identity Pool para acceso a recursos AWS (S3, etc.)
if (identityPoolId) {
  amplifyConfig.Auth.Cognito.identityPoolId = identityPoolId;
} else {
  console.warn(
    "⚠️ ADVERTENCIA: VITE_COGNITO_IDENTITY_POOL_ID no está configurado."
  );
  console.warn(
    "Esto es opcional y solo necesario si usas Identity Pool para acceso a recursos AWS."
  );
  console.warn(
    "Para autenticación básica con User Pool, no es necesario."
  );
}

Amplify.configure(amplifyConfig);

import "./assets/css/index.css";
import './assets/css/base/_global.css';
import "./assets/css/pages/access.css";
import "./assets/css/pages/chat.css";
import "./assets/css/pages/glossary.css";
import "./assets/css/pages/home.css";
import "./assets/css/pages/verbs.css";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <App />
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>
);
