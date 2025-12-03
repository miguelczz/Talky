# 🔐 Configuración de AWS Cognito en el Frontend

El frontend ahora usa variables de entorno para configurar AWS Cognito, lo que permite cambiar la configuración sin modificar el código.

## 📋 Variables Requeridas

Crea un archivo `.env.local` en el directorio `frontend/` con las siguientes variables:

```env
# AWS Cognito Configuration (OBLIGATORIO)
# IMPORTANTE: Reemplaza estos valores con los de tu configuración de AWS Cognito
VITE_COGNITO_USER_POOL_ID=us-east-1_TU_USER_POOL_ID
VITE_COGNITO_CLIENT_ID=tu_client_id_correcto_aqui

# Identity Pool ID (OPCIONAL)
# Solo necesario si usas Identity Pool para acceso a recursos AWS (S3, etc.)
# Si no lo usas, puedes omitir esta línea o dejarla vacía
VITE_COGNITO_IDENTITY_POOL_ID=tu_identity_pool_id_aqui

# Backend API
VITE_API_URL=http://localhost:8080

# EmailJS (opcional)
VITE_SERVICE_ID=service_79tjliq
VITE_TEMPLATE_ID=template_d5qax2v
VITE_PUBLIC_KEY=CnX4T6zf0sfx6C0_T
```

## 🔍 Cómo Obtener los Valores Correctos

### 1. User Pool ID
- Ve a AWS Console → Cognito → User Pools
- Selecciona tu User Pool
- El User Pool ID está en la parte superior (formato: `us-east-1_XXXXXXXXX`)

### 2. Client ID
- En el mismo User Pool, ve a la pestaña **App integration**
- Busca la sección **App clients and analytics**
- Selecciona tu App Client
- El **Client ID** está visible en la lista

### 3. Identity Pool ID (OPCIONAL)
- **Nota:** Solo es necesario si usas Identity Pool para acceso a recursos AWS (S3, etc.)
- Si solo usas autenticación básica, puedes omitir esta variable
- Para obtenerlo:
  - Ve a AWS Console → Cognito → Identity Pools
  - Selecciona tu Identity Pool
  - El Identity Pool ID está en la parte superior (formato: `us-east-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

## ⚠️ Solución del Error "Invalid identity pool id provided"

Este error ocurre cuando:
1. El `VITE_COGNITO_IDENTITY_POOL_ID` está configurado pero no es válido
2. El Identity Pool no existe en AWS Cognito
3. El Identity Pool ID no coincide con el de AWS

### Solución:

**Opción 1: Omitir Identity Pool (Recomendado si no lo usas)**
Si solo necesitas autenticación básica, simplemente **no configures** `VITE_COGNITO_IDENTITY_POOL_ID` o déjalo vacío en `.env.local`:

```env
VITE_COGNITO_USER_POOL_ID=us-east-1_TU_USER_POOL_ID
VITE_COGNITO_CLIENT_ID=tu_client_id_correcto_aqui
# VITE_COGNITO_IDENTITY_POOL_ID=  (comentado o omitido)
```

**Opción 2: Configurar el Identity Pool ID correcto**
1. Ve a AWS Console → Cognito → Identity Pools
2. Selecciona tu Identity Pool (o créalo si no existe)
3. Copia el Identity Pool ID exacto
4. Actualiza `.env.local` con el ID correcto
5. Reinicia el servidor de desarrollo

## ⚠️ Solución del Error "User pool client does not exist"

Este error ocurre cuando:
1. El `VITE_COGNITO_CLIENT_ID` no coincide con un Client ID válido en tu User Pool
2. El archivo `.env.local` no existe o no se está cargando correctamente
3. El servidor de desarrollo no se reinició después de crear/actualizar `.env.local`

### Pasos para solucionarlo:

1. **Verifica que el archivo `.env.local` existe** en `frontend/`:
   ```bash
   cd frontend
   ls -la .env.local  # Linux/Mac
   dir .env.local     # Windows
   ```

2. **Verifica que el Client ID es correcto**:
   - Ve a AWS Console → Cognito
   - Confirma que el Client ID en `.env.local` coincide exactamente con el de AWS

3. **Reinicia el servidor de desarrollo**:
   ```bash
   # Detén el servidor (Ctrl+C)
   # Luego inicia de nuevo
   npm run dev
   ```

4. **Verifica que las variables se están cargando**:
   Agrega temporalmente esto en `main.jsx` para debug:
   ```javascript
   console.log('Cognito Config:', {
     userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
     clientId: import.meta.env.VITE_COGNITO_CLIENT_ID
   });
   ```

## 🔄 Cambios Realizados

El archivo `main.jsx` ahora construye la configuración de Amplify dinámicamente desde variables de entorno en lugar de usar un archivo JSON estático:

```javascript
const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID || "valor_por_defecto",
      userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID || "valor_por_defecto",
      // ...
    }
  }
};
```

## 📝 Notas Importantes

- **El archivo `.env.local` está en `.gitignore`** y no se subirá al repositorio
- **Las variables deben tener el prefijo `VITE_`** para que Vite las exponga al código del cliente
- **Reinicia el servidor de desarrollo** después de cambiar las variables de entorno
- Los valores por defecto en el código solo se usan si las variables no están definidas

## 🚀 Verificación Rápida

Después de configurar `.env.local`, verifica que todo funciona:

1. Reinicia el servidor: `npm run dev`
2. Intenta registrarte o iniciar sesión
3. Si ves el error, verifica los logs de la consola del navegador (F12)

## 🔒 Seguridad

- **NUNCA** subas el archivo `.env.local` al repositorio
- Usa diferentes User Pools/Client IDs para desarrollo, staging y producción
- En producción, configura estas variables en tu plataforma de despliegue (Vercel, Netlify, etc.)

