# 🐳 Configuración de Docker para PostgreSQL

Este proyecto incluye una configuración de Docker Compose para ejecutar PostgreSQL de manera fácil y consistente.

## 📋 Requisitos

- **Docker** instalado ([Descargar Docker](https://www.docker.com/get-started))
- **Docker Compose** (incluido en Docker Desktop)

## 🚀 Inicio Rápido

### 1. Iniciar la base de datos

Desde la raíz del proyecto:

```bash
docker-compose up -d
```

Esto iniciará PostgreSQL en segundo plano. **IMPORTANTE:** Debes configurar las variables de entorno en un archivo `.docker.env` o como variables del sistema.

Configuración requerida:
- **Base de datos:** `talky` (configurable)
- **Usuario:** `postgres` (configurable)
- **Contraseña:** *(debe configurarse en .docker.env)*
- **Puerto:** `5433` (mapeado desde el puerto interno 5432)

### 2. Verificar que está corriendo

```bash
docker-compose ps
```

Deberías ver el contenedor `talky-postgres` con estado `Up`.

### 3. Ver los logs

```bash
docker-compose logs -f postgres
```

### 4. Detener la base de datos

```bash
docker-compose down
```

Para eliminar también los volúmenes (y perder los datos):

```bash
docker-compose down -v
```

## ⚙️ Configuración Personalizada

### Opción 1: Variables de entorno del sistema

Puedes sobrescribir los valores por defecto usando variables de entorno:

```bash
# Windows (PowerShell)
$env:POSTGRES_PASSWORD="mi_contraseña_segura"
$env:POSTGRES_DB="talky_dev"
docker-compose up -d

# Linux/Mac
export POSTGRES_PASSWORD="mi_contraseña_segura"
export POSTGRES_DB="talky_dev"
docker-compose up -d
```

### Opción 2: Archivo `.docker.env`

1. Copia el archivo de ejemplo:
   ```bash
   cp .docker.env.example .docker.env
   ```

2. Edita `.docker.env` con tus valores:
   ```env
   POSTGRES_DB=talky
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=mi_contraseña_segura
   POSTGRES_PORT=5432
   ```

3. Inicia Docker Compose con el archivo:
   ```bash
   docker-compose --env-file .docker.env up -d
   ```

## 🔗 Conectar el Backend

Una vez que PostgreSQL esté corriendo en Docker, configura el backend para conectarse:

### Opción 1: Usar valores por defecto

Si usas los valores por defecto del `docker-compose.yml`, el backend se conectará automáticamente sin cambios.

### Opción 2: Configurar variables de entorno del backend

Crea o actualiza `backend/backend/.env`:

```env
DB_URL=jdbc:postgresql://localhost:5433/talky
DB_USERNAME=postgres
DB_PASSWORD=tu_contraseña_aqui
SERVER_PORT=8080
COGNITO_ISSUER_URI=https://cognito-idp.us-east-1.amazonaws.com/us-east-1_TU_USER_POOL_ID
```

Luego ejecuta el backend:
```bash
cd backend/backend
mvn spring-boot:run
```

## 🗄️ Migraciones de Base de Datos

Las migraciones de Flyway se ejecutarán **automáticamente** cuando el backend se conecte a la base de datos por primera vez. El archivo `V1__init_schema.sql` creará todas las tablas necesarias.

**Importante:** No necesitas ejecutar las migraciones manualmente. Solo inicia el backend después de que PostgreSQL esté corriendo y Flyway se encargará del resto.

Si quieres ejecutar las migraciones manualmente o verificar el estado:

```bash
# Conectarse al contenedor
docker-compose exec postgres psql -U postgres -d talky

# O desde fuera del contenedor (si tienes psql instalado)
psql -h localhost -U postgres -d talky
```

## 🔍 Comandos Útiles

### Ver el estado de los contenedores
```bash
docker-compose ps
```

### Ver logs en tiempo real
```bash
docker-compose logs -f postgres
```

### Reiniciar el servicio
```bash
docker-compose restart postgres
```

### Acceder a la consola de PostgreSQL
```bash
docker-compose exec postgres psql -U postgres -d talky
```

### Hacer backup de la base de datos
```bash
docker-compose exec postgres pg_dump -U postgres talky > backup.sql
```

### Restaurar desde backup
```bash
docker-compose exec -T postgres psql -U postgres -d talky < backup.sql
```

### Ver el tamaño de los volúmenes
```bash
docker volume ls
docker volume inspect talky_postgres_data
```

## 🧹 Limpieza

### Detener y eliminar contenedores
```bash
docker-compose down
```

### Eliminar contenedores, volúmenes y datos
```bash
docker-compose down -v
```

**⚠️ ADVERTENCIA:** Esto eliminará todos los datos de la base de datos.

### Eliminar solo los volúmenes (mantener configuración)
```bash
docker volume rm talky_postgres_data
```

## 🔒 Seguridad

- **Nunca** subas el archivo `.docker.env` al repositorio
- Usa contraseñas seguras en producción
- Considera usar Docker Secrets o un gestor de secretos para producción
- El archivo `.docker.env` ya está en `.gitignore` (si lo agregas)

## 🐛 Solución de Problemas

### El puerto 5433 ya está en uso

Si el puerto 5433 ya está en uso, cambia el puerto en `docker-compose.yml`:

```yaml
ports:
  - "5434:5432"  # Usa 5434 en lugar de 5433
```

Y actualiza `DB_URL` en el backend:
```env
DB_URL=jdbc:postgresql://localhost:5434/talky
```

### El contenedor no inicia

Verifica los logs:
```bash
docker-compose logs postgres
```

### No puedo conectarme desde el backend

1. Verifica que el contenedor esté corriendo:
   ```bash
   docker-compose ps
   ```

2. Verifica que el puerto esté expuesto:
   ```bash
   docker-compose port postgres 5432
   ```

3. Prueba la conexión manualmente:
   ```bash
   docker-compose exec postgres psql -U postgres -d talky -c "SELECT version();"
   ```

## 📚 Recursos Adicionales

- [Documentación de Docker Compose](https://docs.docker.com/compose/)
- [Imagen oficial de PostgreSQL en Docker Hub](https://hub.docker.com/_/postgres)
- [Documentación de Flyway](https://flywaydb.org/documentation/)

