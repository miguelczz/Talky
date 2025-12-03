@echo off
REM Script para iniciar el entorno de desarrollo completo
REM Inicia PostgreSQL en Docker y luego el backend

echo ========================================
echo   Iniciando entorno de desarrollo Talky
echo ========================================
echo.

REM Verificar si Docker está corriendo
docker info >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker no esta corriendo o no esta instalado
    echo Por favor, inicia Docker Desktop e intenta de nuevo
    pause
    exit /b 1
)

echo [1/3] Iniciando PostgreSQL en Docker...
docker-compose up -d
if errorlevel 1 (
    echo ERROR: No se pudo iniciar PostgreSQL
    pause
    exit /b 1
)

echo [2/3] Esperando a que PostgreSQL este listo...
timeout /t 5 /nobreak >nul

REM Verificar que PostgreSQL este saludable
docker-compose exec -T postgres pg_isready -U postgres >nul 2>&1
if errorlevel 1 (
    echo ADVERTENCIA: PostgreSQL puede no estar listo aun
    echo Esperando 5 segundos mas...
    timeout /t 5 /nobreak >nul
)

echo [3/3] Iniciando backend Spring Boot...
echo.
cd /d "%~dp0..\backend"

REM Cargar variables de entorno desde .env si existe
if exist .env (
    echo Cargando variables de entorno desde .env...
    for /f "usebackq tokens=1,2 delims==" %%a in (".env") do (
        if not "%%a"=="" (
            if not "%%a"=="#" (
                set "%%a=%%b"
            )
        )
    )
    echo Variables de entorno cargadas.
    echo.
) else (
    echo ADVERTENCIA: No se encontro el archivo .env
    echo Algunas variables de entorno pueden no estar configuradas.
    echo.
)

REM Detectar Java automaticamente
if not "%JAVA_HOME%"=="" (
    if exist "%JAVA_HOME%\bin\java.exe" (
        echo JAVA_HOME detectado: %JAVA_HOME%
        "%JAVA_HOME%\bin\java.exe" -version 2>&1 | findstr /C:"version"
        echo.
        goto :java_ok
    )
)

REM Buscar Java en el PATH
where java >nul 2>&1
if not errorlevel 1 (
    echo Java detectado en PATH
    java -version 2>&1 | findstr /C:"version"
    echo.
    goto :java_ok
)

REM Buscar en ubicaciones comunes
set "JAVA_PATH="
if exist "C:\Program Files\Eclipse Adoptium" (
    for /d %%i in ("C:\Program Files\Eclipse Adoptium\*") do (
        if exist "%%i\bin\java.exe" (
            set "JAVA_PATH=%%i"
            goto :found_java
        )
    )
)
if exist "C:\Program Files\Java" (
    for /d %%i in ("C:\Program Files\Java\*") do (
        if exist "%%i\bin\java.exe" (
            set "JAVA_PATH=%%i"
            goto :found_java
        )
    )
)

:found_java
if not "%JAVA_PATH%"=="" (
    set "JAVA_HOME=%JAVA_PATH%"
    echo Java detectado en: %JAVA_HOME%
    "%JAVA_HOME%\bin\java.exe" -version 2>&1 | findstr /C:"version"
    echo.
    goto :java_ok
)

echo.
echo ERROR: No se encontro Java instalado   
echo.
echo Por favor:
echo   1. Instala Java 21 desde https://adoptium.net/
echo   2. Configura JAVA_HOME ejecutando: scripts\configurar-java.bat
echo   3. O agrega Java al PATH del sistema
echo.
pause
exit /b 1

:java_ok

REM Usar el wrapper de Maven (mvnw) en lugar de mvn
if exist mvnw.cmd (
    call mvnw.cmd spring-boot:run
) else (
    echo ERROR: No se encontró mvnw.cmd
    echo Por favor, asegúrate de estar en el directorio correcto
    pause
    exit /b 1
)

