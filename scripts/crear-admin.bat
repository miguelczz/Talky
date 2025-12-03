@echo off
setlocal enabledelayedexpansion

echo ========================================
echo   Crear Usuario Administrador
echo ========================================
echo.

echo Este script te ayudará a crear o actualizar un usuario administrador.
echo.

:: Solicitar datos
set /p EMAIL=Ingresa el email del usuario administrador:
set /p SUB=Ingresa el cognito_sub del usuario:
set /p NAME=Ingresa el nombre del administrador (opcional, presiona Enter para omitir):

if "%NAME%"=="" set NAME=NULL

echo.
echo Creando/actualizando usuario administrador...
echo Email: %EMAIL%
echo Cognito Sub: %SUB%
echo Nombre: %NAME%
echo.

echo Ejecutando SQL en PostgreSQL...
echo.

:: Crear archivo SQL temporal
set SQLFILE=%TEMP%\crear_admin_%RANDOM%.sql

echo -- Actualizar usuario existente a ADMIN > "%SQLFILE%"
echo UPDATE users >> "%SQLFILE%"
echo SET role = 'ADMIN', updated_at = now() >> "%SQLFILE%"
echo WHERE email = '%EMAIL%'; >> "%SQLFILE%"
echo. >> "%SQLFILE%"

echo -- Crear usuario si no existe >> "%SQLFILE%"
echo INSERT INTO users (id, cognito_sub, email, name, role, created_at, updated_at) >> "%SQLFILE%"
echo SELECT gen_random_uuid(), '%SUB%', '%EMAIL%', '%NAME%', 'ADMIN', now(), now() >> "%SQLFILE%"
echo WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = '%EMAIL%'); >> "%SQLFILE%"
echo. >> "%SQLFILE%"

echo -- Verificar >> "%SQLFILE%"
echo SELECT id, email, name, role, cognito_sub FROM users WHERE email = '%EMAIL%'; >> "%SQLFILE%"
echo. >> "%SQLFILE%"

:: Verificar que postgres esté corriendo en Docker
docker ps | findstr "postgres" >nul
if errorlevel 1 (
    echo ❌ ERROR: El contenedor de PostgreSQL no está en ejecución.
    echo Ejecuta:  docker compose up -d
    del "%SQLFILE%"
    pause
    exit /b
)

:: Ejecutar SQL
docker exec -i talky-postgres psql -U postgres -d talkydb < "%SQLFILE%"

:: Borrar archivo temporal
del "%SQLFILE%"

echo.
echo ========================================
echo      PROCESO COMPLETADO
echo ========================================
echo.
pause
exit /b