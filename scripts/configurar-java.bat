@echo off
REM Script consolidado para configurar Java
REM Busca Java automáticamente y permite configurarlo

echo ========================================
echo   Configuración de Java para Talky
echo ========================================
echo.

set "JAVA_FOUND=0"
set "JAVA_PATH="

REM Buscar en ubicaciones comunes
echo [1/3] Buscando instalaciones de Java...
echo.

REM C:\Program Files\Java
if exist "C:\Program Files\Java" (
    echo [✓] Encontrado: C:\Program Files\Java
    for /d %%i in ("C:\Program Files\Java\*") do (
        if exist "%%i\bin\java.exe" (
            echo    - %%i
            if "%JAVA_PATH%"=="" set "JAVA_PATH=%%i"
        )
    )
    echo.
    set "JAVA_FOUND=1"
)

REM C:\Program Files\Eclipse Adoptium
if exist "C:\Program Files\Eclipse Adoptium" (
    echo [✓] Encontrado: C:\Program Files\Eclipse Adoptium
    for /d %%i in ("C:\Program Files\Eclipse Adoptium\*") do (
        if exist "%%i\bin\java.exe" (
            echo    - %%i
            if "%JAVA_PATH%"=="" set "JAVA_PATH=%%i"
        )
    )
    echo.
    set "JAVA_FOUND=1"
)

REM Verificar si está en el PATH
where java >nul 2>&1
if not errorlevel 1 (
    echo [✓] Java encontrado en PATH
    where java
    java -version 2>&1 | findstr /C:"version"
    echo.
    set "JAVA_FOUND=1"
)

if "%JAVA_FOUND%"=="0" (
    echo [✗] No se encontró Java en las ubicaciones comunes
    echo.
    echo Por favor, ingresa la ruta completa a tu instalación de Java:
    echo (Ejemplo: C:\Program Files\Java\jdk-21)
    echo.
    set /p JAVA_PATH=
    
    if not exist "%JAVA_PATH%" (
        echo [✗] Error: La ruta no existe: %JAVA_PATH%
        pause
        exit /b 1
    )
    
    if not exist "%JAVA_PATH%\bin\java.exe" (
        echo [✗] Error: No se encontró java.exe en: %JAVA_PATH%\bin\
        pause
        exit /b 1
    )
) else (
    if "%JAVA_PATH%"=="" (
            echo.
        echo Se encontraron múltiples instalaciones de Java.
        echo Por favor, ingresa la ruta completa que deseas usar:
        echo (Ejemplo: C:\Program Files\Eclipse Adoptium\jdk-21.0.3.9-hotspot)
        echo.
        set /p JAVA_PATH="Ruta de Java: "
    )
)

echo.
echo [2/3] Verificando Java...
if exist "%JAVA_PATH%\bin\java.exe" (
    echo [✓] Java encontrado en: %JAVA_PATH%
    "%JAVA_PATH%\bin\java.exe" -version
    echo.
) else (
    echo [✗] Error: No se encontró Java en: %JAVA_PATH%
    pause
    exit /b 1
)

echo [3/3] Configurando JAVA_HOME...
echo.
echo ¿Configurar JAVA_HOME permanentemente? (S/N)
echo (Requiere permisos de administrador)
set /p configurar=

if /i "%configurar%"=="S" (
    echo.
    echo Configurando JAVA_HOME...
    setx JAVA_HOME "%JAVA_PATH%" /M
    if errorlevel 1 (
        echo [✗] Error: No se pudo configurar JAVA_HOME
        echo Asegúrate de ejecutar este script como Administrador
        pause
        exit /b 1
    )
    
    echo.
    echo ¿Agregar Java al PATH? (S/N)
    set /p agregar_path=
    if /i "%agregar_path%"=="S" (
        echo Configurando PATH...
        for /f "tokens=2*" %%a in ('reg query "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Environment" /v PATH') do set "CURRENT_PATH=%%b"
        
        REM Verificar si ya está en el PATH
        echo %CURRENT_PATH% | findstr /C:"%JAVA_PATH%\bin" >nul
        if not errorlevel 1 (
            echo [✓] Java ya está en el PATH
        ) else (
            setx PATH "%CURRENT_PATH%;%JAVA_PATH%\bin" /M
            if errorlevel 1 (
                echo [✗] Error al configurar PATH
            ) else (
                echo [✓] PATH configurado exitosamente
            )
        )
    )
    
    echo.
    echo [✓] JAVA_HOME configurado exitosamente
    echo.
    echo IMPORTANTE: Cierra y vuelve a abrir todas las ventanas de terminal
    echo para que los cambios surtan efecto.
    echo.
) else (
    echo.
    echo Configuración temporal (solo esta sesión):
    set JAVA_HOME=%JAVA_PATH%
    set PATH=%PATH%;%JAVA_PATH%\bin
    echo JAVA_HOME=%JAVA_HOME%
    echo.
    echo Para configurarlo permanentemente, ejecuta:
    echo setx JAVA_HOME "%JAVA_PATH%" /M
    echo.
)

echo ========================================
echo   Configuración Completada
echo ========================================
echo.
pause
