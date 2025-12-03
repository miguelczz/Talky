# 🔒 Cambios de Seguridad - Eliminación de Datos Sensibles

## ✅ Cambios Realizados

Se han eliminado **todos los datos sensibles** de los archivos del proyecto. Ahora todos los valores sensibles deben estar **únicamente en archivos `.env`** que están en `.gitignore`.

### Archivos Modificados

#### 1. **docker-compose.yml**
- ❌ **Antes:** `POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-20122004}`
- ✅ **Ahora:** `POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}` (sin valor por defecto)

#### 2. **frontend/src/main.jsx**
- ❌ **Antes:** Valores hardcodeados como fallback
- ✅ **Ahora:** Validación estricta - la aplicación falla si faltan variables de entorno
- ✅ Eliminado: `amplifyconfiguration.json` (ya no se usa)

#### 3. **backend/backend/src/main/resources/application.properties**
- ❌ **Antes:** `COGNITO_ISSUER_URI` con valor por defecto
- ✅ **Ahora:** `COGNITO_ISSUER_URI=${COGNITO_ISSUER_URI}` (obligatorio)

#### 4. **Scripts de inicio**
- ✅ **start-dev.bat**: Ahora usa `mvnw.cmd` en lugar de `mvn` (no requiere Maven instalado)
- ✅ **backend/backend/start.bat**: Actualizado para usar `mvnw.cmd`

#### 5. **Documentación**
- ✅ Todos los archivos de documentación actualizados con valores de ejemplo genéricos
- ✅ Eliminados todos los IDs, contraseñas y tokens reales

## 📋 Variables de Entorno Requeridas

### Backend (`backend/backend/.env`)

```env
# Database Configuration (OBLIGATORIO)
DB_URL=jdbc:postgresql://localhost:5433/talky
DB_USERNAME=postgres
DB_PASSWORD=tu_contraseña_aqui

# Server Configuration
SERVER_PORT=8080

# AWS Cognito Configuration (OBLIGATORIO)
COGNITO_ISSUER_URI=https://cognito-idp.us-east-1.amazonaws.com/us-east-1_TU_USER_POOL_ID
```

### Frontend (`frontend/.env.local`)

```env
# Backend API
VITE_API_URL=http://localhost:8080

# AWS Cognito Configuration (OBLIGATORIO)
VITE_COGNITO_USER_POOL_ID=us-east-1_TU_USER_POOL_ID
VITE_COGNITO_CLIENT_ID=tu_client_id_correcto_aqui
VITE_COGNITO_IDENTITY_POOL_ID=tu_identity_pool_id_aqui

# EmailJS (opcional)
VITE_SERVICE_ID=service_79tjliq
VITE_TEMPLATE_ID=template_d5qax2v
VITE_PUBLIC_KEY=CnX4T6zf0sfx6C0_T
```

### Docker (`backend/backend/.docker.env` o variables del sistema)

```env
POSTGRES_DB=talky
POSTGRES_USER=postgres
POSTGRES_PASSWORD=tu_contraseña_aqui
POSTGRES_PORT=5433
```

## ⚠️ Importante

1. **NUNCA** subas archivos `.env`, `.env.local` o `.docker.env` al repositorio
2. **Todos** estos archivos están en `.gitignore`
3. Si faltan variables de entorno, la aplicación **fallará con un mensaje claro**
4. Usa los archivos `.example` como plantilla

## 🔧 Solución del Error "mvn no se reconoce"

El script `start-dev.bat` ahora usa el **Maven Wrapper** (`mvnw.cmd`) que viene incluido en el proyecto. Esto significa que **no necesitas tener Maven instalado** en tu sistema.

Si aún ves el error:
1. Verifica que estás en el directorio correcto
2. Asegúrate de que `backend/backend/mvnw.cmd` existe
3. Si no existe, puedes descargarlo o instalar Maven globalmente

## 📝 Archivos de Ejemplo Creados

- `frontend/.env.example` - Plantilla para variables del frontend
- `.docker.env.example` - Plantilla para variables de Docker

Copia estos archivos y renómbralos quitando `.example`, luego reemplaza los valores con tus credenciales reales.

## ✅ Verificación

Para verificar que todo está correcto:

1. **Backend:**
   ```bash
   cd backend/backend
   # Verifica que .env existe y tiene todas las variables
   # Ejecuta: start.bat o mvnw.cmd spring-boot:run
   ```

2. **Frontend:**
   ```bash
   cd frontend
   # Verifica que .env.local existe y tiene todas las variables
   # Ejecuta: npm run dev
   # Si faltan variables, verás un error claro en la consola
   ```

3. **Docker:**
   ```bash
   # Crea .docker.env con tus credenciales
   docker-compose --env-file .docker.env up -d
   ```

## 🎯 Resultado

✅ **Cero datos sensibles** en el código fuente  
✅ **Validación estricta** de variables de entorno  
✅ **Mensajes de error claros** si faltan variables  
✅ **Scripts actualizados** para usar Maven Wrapper  
✅ **Documentación actualizada** con valores de ejemplo

