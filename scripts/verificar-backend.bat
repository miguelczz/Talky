@echo off
REM Script para verificar que el backend esté corriendo y accesible

echo ========================================
echo   Verificando conexión con el backend
echo ========================================
echo.

REM Obtener la URL del backend desde variables de entorno o usar default
set "API_URL=%VITE_API_URL%"
if "%API_URL%"=="" set "API_URL=http://localhost:8080"

echo URL del backend: %API_URL%
echo.

REM Verificar conectividad con el endpoint público /api/auth/ping usando PowerShell
echo [1/2] Verificando conectividad básica...
powershell -Command "try { $response = Invoke-WebRequest -Uri '%API_URL%/api/auth/ping' -UseBasicParsing -TimeoutSec 5; Write-Host 'HTTP Status:' $response.StatusCode; Write-Host 'Respuesta:' $response.Content } catch { Write-Host 'ERROR:' $_.Exception.Message; exit 1 }"

if errorlevel 1 (
    echo.
    echo ERROR: No se pudo conectar al backend en %API_URL%
    echo.
    echo Posibles causas:
    echo   1. El backend no está corriendo
    echo   2. El puerto es incorrecto (verifica que sea 8080)
    echo   3. Hay un firewall bloqueando la conexión
    echo.
    echo Para iniciar el backend, ejecuta:
    echo   scripts\start-dev.bat
    echo   O desde el directorio backend:
    echo   backend\scripts\start.bat
    echo.
    pause
    exit /b 1
)

echo.
echo.
echo ========================================
echo   Backend está funcionando correctamente
echo ========================================
echo.
pause

