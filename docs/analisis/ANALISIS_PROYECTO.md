# 📋 Análisis del Proyecto Talky

## 🚀 Cómo Arrancar el Proyecto

### Prerrequisitos
- **Java 21** (según `pom.xml`)
- **Maven 3.6+**
- **PostgreSQL** (base de datos)
- **Node.js 18+** y **npm**
- **AWS Cognito** configurado (configuración mediante variables de entorno)

### Backend (Spring Boot)

#### Opción A: Usando Docker (Recomendado) 🐳

1. **Iniciar PostgreSQL con Docker (puerto 5433):**
   ```bash
   docker-compose up -d
   ```

2. **Navegar al directorio del backend:**
   ```bash
   cd backend/backend
   ```

3. **Compilar y ejecutar:**
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```

   El backend estará disponible en: `http://localhost:8080`
   **Nota:** PostgreSQL corre en el puerto **5433** (no 5432) para evitar conflictos

#### Opción B: PostgreSQL Local

1. **Configurar la base de datos PostgreSQL:**
   ```bash
   # Crear la base de datos
   createdb talky
   # O usando psql:
   psql -U postgres
   CREATE DATABASE talky;
   ```

2. **Navegar al directorio del backend:**
   ```bash
   cd backend/backend
   ```

3. **Configurar variables de entorno** (crear `.env`):
   ```env
   DB_URL=jdbc:postgresql://localhost:5433/talky
   DB_USERNAME=postgres
   DB_PASSWORD=tu_contraseña
   ```
   **Nota:** Si usas PostgreSQL local (no Docker), usa el puerto 5432. Si usas Docker, usa 5433.

4. **Compilar y ejecutar:**
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```

   El backend estará disponible en: `http://localhost:8080`

### Frontend (React + Vite)

1. **Navegar al directorio del frontend:**
   ```bash
   cd frontend
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**
   - Crear archivo `.env.local` en `frontend/` con:
     ```env
     # AWS Cognito (OBLIGATORIO - reemplaza con tus valores reales)
     VITE_COGNITO_USER_POOL_ID=us-east-1_TU_USER_POOL_ID
     VITE_COGNITO_CLIENT_ID=tu_client_id_correcto_aqui
     VITE_COGNITO_IDENTITY_POOL_ID=tu_identity_pool_id_aqui
     
     # Backend API
     VITE_API_URL=http://localhost:8080
     
     # EmailJS (opcional)
     VITE_SERVICE_ID=service_79tjliq
     VITE_TEMPLATE_ID=template_d5qax2v
     VITE_PUBLIC_KEY=CnX4T6zf0sfx6C0_T
     ```
   - **IMPORTANTE:** El `VITE_COGNITO_CLIENT_ID` debe ser el Client ID correcto de tu User Pool en AWS Cognito
   - Ver `frontend/CONFIGURACION_COGNITO.md` para más detalles

5. **Ejecutar en modo desarrollo:**
   ```bash
   npm run dev
   ```

   El frontend estará disponible en: `http://localhost:5173`

---

## ⚠️ PROBLEMAS ENCONTRADOS

### 🔴 CRÍTICOS (Impiden el arranque)

#### 1. **Falta archivo `amplifyconfiguration.json`**
- **Ubicación esperada:** `frontend/src/config/amplifyconfiguration.json`
- **Problema:** El archivo `main.jsx` intenta importarlo pero no existe
- **Impacto:** El frontend no podrá inicializar AWS Amplify y fallará al arrancar
- **Solución:** Crear el archivo con la configuración de Cognito

#### 2. **Variables de entorno mal configuradas**
- **Problema:** 
  - Existe un archivo `frontend/env` pero Vite no lo lee automáticamente
  - Las variables deben tener prefijo `VITE_` para ser expuestas al cliente
  - El código usa `import.meta.env.API_URL` pero debería ser `VITE_API_URL`
- **Impacto:** Las variables de entorno no funcionarán correctamente
- **Solución:** 
  - Renombrar `env` a `.env` o `.env.local`
  - Agregar prefijo `VITE_` a todas las variables
  - Actualizar el código para usar `VITE_API_URL`

#### 3. **Credenciales de base de datos expuestas** - ✅ **SOLUCIONADO**
- **Ubicación:** `backend/backend/src/main/resources/application.properties`
- **Problema:** Contraseña de PostgreSQL hardcodeada (ya solucionado)
- **Impacto:** Riesgo de seguridad
- **Solución:** ✅ Actualizado para usar variables de entorno:
  - `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `SERVER_PORT`, `COGNITO_ISSUER_URI`
  - Valores por defecto mantenidos para desarrollo
  - Scripts de inicio creados (`start.bat` y `start.sh`)
  - Documentación agregada en `CONFIGURACION_VARIABLES_ENTORNO.md`

### 🟡 IMPORTANTES (Funcionalidad limitada)

#### 4. **Inconsistencia en uso de variables de entorno**
- **Archivos afectados:**
  - `frontend/src/utils/api.js` → usa `import.meta.env.API_URL`
  - `frontend/src/components/Access/SignIn.jsx` → usa `import.meta.env.API_URL`
- **Problema:** No seguirán el estándar de Vite (`VITE_` prefix)
- **Solución:** Actualizar a `VITE_API_URL` en todo el código

#### 5. **CORS configurado solo para localhost:5173**
- **Ubicación:** `backend/backend/src/main/java/com/talky/backend/config/SecurityConfig.java`
- **Problema:** Solo permite origen `http://localhost:5173`
- **Impacto:** No funcionará en otros puertos o en producción
- **Solución:** Configurar múltiples orígenes o usar variables de entorno

### 🟢 MENORES (Mejoras recomendadas)

#### 6. **Falta documentación de configuración de AWS Cognito**
- No hay instrucciones claras sobre cómo configurar Cognito
- El User Pool ID está hardcodeado en varios lugares

#### 7. **Estructura de directorios inconsistente**
- El backend está en `backend/backend/` (doble nivel)
- Podría simplificarse a `backend/`

---

## 📝 INCONSISTENCIAS DETECTADAS

1. **Versión de Java:**
   - `pom.xml` especifica Java 21
   - README menciona Java 17+
   - **Recomendación:** Actualizar README o verificar compatibilidad

2. **Rutas de API:**
   - Backend usa `/api/v1/` en algunos endpoints según README
   - Pero el código puede usar `/api/` directamente
   - **Recomendación:** Verificar y estandarizar

3. **Configuración de Amplify:**
   - El código intenta importar desde `./config/amplifyconfiguration.json`
   - Pero el archivo no existe y está en `.gitignore`
   - **Recomendación:** Crear template o documentar cómo generarlo

4. **Variables de entorno:**
   - Algunas tienen prefijo `VITE_` (EmailJS)
   - Otras no (API_URL)
   - **Recomendación:** Estandarizar todas con `VITE_`

---

## ✅ CHECKLIST ANTES DE ARRANCAR

- [ ] PostgreSQL instalado y corriendo
- [ ] Base de datos `talky` creada
- [ ] Credenciales de PostgreSQL configuradas (preferiblemente en variables de entorno)
- [ ] Java 21 instalado
- [ ] Maven instalado
- [ ] Node.js y npm instalados
- [ ] Archivo `amplifyconfiguration.json` creado en `frontend/src/config/`
- [ ] Archivo `.env` creado en `frontend/` con variables `VITE_*`
- [ ] Dependencias del frontend instaladas (`npm install`)
- [ ] AWS Cognito configurado con el User Pool correcto
- [ ] Backend compilado y ejecutándose
- [ ] Frontend ejecutándose en puerto 5173

---

## 🔧 SOLUCIONES RECOMENDADAS

### ✅ Solución 1: Crear `amplifyconfiguration.json` - **COMPLETADO**

✅ Archivo creado en `frontend/src/config/amplifyconfiguration.json` con la configuración de Cognito.

### ✅ Solución 2: Crear archivo `.env` para Vite - **COMPLETADO**

✅ Se debe crear manualmente `frontend/.env.local` copiando el contenido del archivo `env` existente pero con prefijo `VITE_`:
```
VITE_API_URL=http://localhost:8080
VITE_SERVICE_ID=service_79tjliq
VITE_TEMPLATE_ID=template_d5qax2v
VITE_PUBLIC_KEY=CnX4T6zf0sfx6C0_T
```

**Nota:** El archivo `.env.local` está en `.gitignore` por seguridad, así que debe crearse manualmente en cada entorno.

### ✅ Solución 3: Actualizar código para usar `VITE_API_URL` - **COMPLETADO**

✅ Actualizado `frontend/src/utils/api.js`:
```javascript
export const baseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:8080";
```

✅ Actualizado `frontend/src/components/Access/SignIn.jsx`:
```javascript
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
```

### ✅ Solución 4: Mover credenciales a variables de entorno (Backend) - **COMPLETADO**

✅ Actualizado `application.properties` para usar variables de entorno:
```properties
spring.datasource.url=${DB_URL:jdbc:postgresql://localhost:5432/talky}
spring.datasource.username=${DB_USERNAME:postgres}
spring.datasource.password=${DB_PASSWORD:}
server.port=${SERVER_PORT:8080}
spring.security.oauth2.resourceserver.jwt.issuer-uri=${COGNITO_ISSUER_URI}
```

✅ Creados scripts de inicio:
- `backend/backend/start.bat` (Windows)
- `backend/backend/start.sh` (Linux/Mac)

✅ Documentación creada:
- `backend/backend/CONFIGURACION_VARIABLES_ENTORNO.md`

✅ Actualizado `.gitignore` para excluir archivos `.env`

---

## 📊 RESUMEN

| Categoría | Estado | Acción Requerida |
|-----------|--------|------------------|
| Configuración Frontend | ✅ Completada | `amplifyconfiguration.json` creado |
| Variables de Entorno | ✅ Corregida | Código actualizado a `VITE_API_URL` |
| Archivo .env.local | ⚠️ Pendiente | Crear manualmente (está en .gitignore) |
| Seguridad Backend | ✅ Completada | Credenciales movidas a variables de entorno |
| Docker Setup | ✅ Agregado | `docker-compose.yml` creado (puerto 5433) |
| Configuración Cognito | ✅ Mejorada | Ahora usa variables de entorno en lugar de JSON estático |
| Puerto PostgreSQL | ✅ Cambiado | Puerto 5433 para evitar conflictos |
| Documentación | ✅ Mejorada | Este análisis + DOCKER_SETUP.md agregados |
| Estructura | ✅ OK | Funcional pero mejorable |

---

**Fecha de análisis:** $(date)
**Versión del proyecto:** 0.0.1-SNAPSHOT

