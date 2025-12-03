# 🔧 Solución de Errores de Red y Autenticación

## Problema: "Network Error" al iniciar sesión

Si ves un error de "Network Error" después de autenticarte con Cognito, sigue estos pasos para diagnosticar:

## ✅ Verificación 1: Backend está corriendo

Ejecuta el script de verificación:
```bash
scripts\verificar-backend.bat
```

Deberías ver:
- HTTP Status: 200
- Respuesta: pong

Si no ves esto, el backend no está corriendo. Inícialo con:
```bash
scripts\start-dev.bat
```

## ✅ Verificación 2: Variables de entorno del backend

Verifica que el archivo `backend/.env` existe y tiene `COGNITO_ISSUER_URI`:

```env
COGNITO_ISSUER_URI=https://cognito-idp.us-east-1.amazonaws.com/us-east-1_TU_USER_POOL_ID
DB_URL=jdbc:postgresql://localhost:5433/talky
DB_USERNAME=postgres
DB_PASSWORD=tu_contraseña
SERVER_PORT=8080
```

**Importante:** El `COGNITO_ISSUER_URI` debe coincidir exactamente con tu User Pool ID de AWS Cognito.

## ✅ Verificación 3: Consola del navegador

1. Abre la consola del navegador (F12 → Console)
2. Intenta iniciar sesión
3. Busca estos mensajes:
   - ✅ "Autenticación con Cognito exitosa"
   - ✅ "Token obtenido, longitud: XXXX"
   - ✅ "Intentando sincronizar con backend..."
   - ❌ Cualquier error en rojo

## 🔍 Errores comunes y soluciones

### Error: "Network Error" o "ERR_NETWORK"

**Causa:** El backend no está corriendo o no es accesible.

**Solución:**
1. Verifica que el backend esté corriendo: `scripts\verificar-backend.bat`
2. Verifica que el puerto 8080 no esté bloqueado por firewall
3. Verifica la URL en `frontend/.env.local`: `VITE_API_URL=http://localhost:8080`

### Error: "401 Unauthorized" o "Invalid token"

**Causa:** El token JWT no es válido o el `COGNITO_ISSUER_URI` no coincide.

**Solución:**
1. Verifica que `COGNITO_ISSUER_URI` en `backend/.env` sea correcto
2. El formato debe ser: `https://cognito-idp.us-east-1.amazonaws.com/us-east-1_XXXXXXXXX`
3. Reinicia el backend después de cambiar `.env`

### Error: "CORS policy" o "Access-Control-Allow-Origin"

**Causa:** Problema de CORS entre frontend y backend.

**Solución:**
1. Verifica que el backend tenga la configuración de CORS actualizada (ya está configurado para permitir cualquier puerto de localhost)
2. Reinicia el backend después de cambios en `SecurityConfig.java`
3. Verifica que el frontend esté usando el puerto correcto (normalmente 5173 para Vite)

### Error: "500 Internal Server Error"

**Causa:** Error en el backend al procesar la petición.

**Solución:**
1. Revisa los logs del backend en la terminal donde está corriendo
2. Verifica que la base de datos esté corriendo: `docker-compose ps`
3. Verifica que las migraciones de Flyway se hayan ejecutado correctamente

## 🧪 Prueba manual del endpoint

Puedes probar manualmente si el endpoint `/api/auth/sync` funciona:

1. Obtén un token JWT válido de Cognito (desde la consola del navegador después de iniciar sesión)
2. Usa este comando (reemplaza `TU_TOKEN` con el token real):

```bash
powershell -Command "$headers = @{'Authorization'='Bearer TU_TOKEN'; 'Content-Type'='application/json'}; Invoke-WebRequest -Uri 'http://localhost:8080/api/auth/sync' -Method POST -Headers $headers -Body '{}'"
```

Si esto funciona, el problema está en el frontend. Si no funciona, el problema está en el backend o en la configuración.

## 📝 Logs útiles

### Frontend (Consola del navegador)
- Busca mensajes que empiecen con ✅ o ❌
- Revisa la pestaña "Network" para ver las peticiones HTTP y sus respuestas

### Backend (Terminal)
- Busca errores relacionados con JWT
- Busca errores de conexión a la base de datos
- Busca errores de CORS

## 🔄 Reiniciar todo

Si nada funciona, reinicia todo en este orden:

1. **Detén el backend** (Ctrl+C en la terminal donde está corriendo)
2. **Detén Docker** (si está corriendo): `docker-compose down`
3. **Inicia Docker**: `docker-compose up -d`
4. **Espera 5 segundos** para que PostgreSQL esté listo
5. **Inicia el backend**: `scripts\start-dev.bat`
6. **Espera a que el backend esté listo** (verás "Started TalkyBackendApplication")
7. **Inicia el frontend**: `cd frontend && npm run dev`
8. **Intenta iniciar sesión de nuevo**

## 💡 Consejos adicionales

- Siempre reinicia el backend después de cambiar variables de entorno
- Siempre reinicia el frontend después de cambiar `.env.local`
- Usa la consola del navegador para ver errores detallados
- Los logs del backend te dirán exactamente qué está fallando

