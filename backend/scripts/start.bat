@echo off
REM Script de inicio para Windows
REM Carga las variables de entorno desde un archivo .env y ejecuta la aplicación

echo Cargando variables de entorno...

REM Verificar si existe el archivo .env
if not exist .env (
    echo ADVERTENCIA: No se encontró el archivo .env
    echo Usando valores por defecto del application.properties
    echo.
    echo Para crear el archivo .env, copia el contenido de este ejemplo:
    echo.
    echo DB_URL=jdbc:postgresql://localhost:5433/talky
    echo DB_USERNAME=postgres
    echo DB_PASSWORD=tu_contraseña_aqui
    echo SERVER_PORT=8080
    echo COGNITO_ISSUER_URI=https://cognito-idp.us-east-1.amazonaws.com/us-east-1_TU_USER_POOL_ID
    echo.
    pause
    goto :run
)

REM Cargar variables desde .env (formato simple)
for /f "usebackq tokens=1,2 delims==" %%a in (".env") do (
    if not "%%a"=="" (
        if not "%%a"=="#" (
            set "%%a=%%b"
        )
    )
)

:run
echo Iniciando aplicación Spring Boot...
echo.

REM Detectar Java automáticamente
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
echo ERROR: No se encontró Java instalado
echo.
echo Por favor:
echo   1. Instala Java 21 desde https://adoptium.net/
echo   2. Configura JAVA_HOME ejecutando: scripts\configurar-java.bat
echo   3. O agrega Java al PATH del sistema
echo.
pause
exit /b 1

:java_ok

REM Cambiar al directorio del backend donde está mvnw.cmd
cd ..

REM Usar el wrapper de Maven (mvnw) en lugar de mvn
if exist mvnw.cmd (
    call mvnw.cmd spring-boot:run
) else (
    echo ERROR: No se encontró mvnw.cmd
    echo Por favor, asegúrate de estar en el directorio correcto
    pause
    exit /b 1
)

