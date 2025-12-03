# 🔐 Configuración de Variables de Entorno

Este proyecto usa variables de entorno para proteger información sensible como credenciales de base de datos.

## 📋 Variables Requeridas

Crea un archivo `.env` en el directorio `backend/backend/` con las siguientes variables:

```env
# Database Configuration
DB_URL=jdbc:postgresql://localhost:5433/talky
DB_USERNAME=postgres
DB_PASSWORD=tu_contraseña_aqui

# Server Configuration
SERVER_PORT=8080

# AWS Cognito Configuration
# IMPORTANTE: Reemplaza con tu User Pool ID real
COGNITO_ISSUER_URI=https://cognito-idp.us-east-1.amazonaws.com/us-east-1_TU_USER_POOL_ID
```

## 🚀 Cómo Cargar las Variables

### Opción 1: Usar un archivo .env (Recomendado para desarrollo)

Spring Boot no carga archivos `.env` automáticamente. Puedes usar una de estas opciones:

#### A) Usar un plugin de Maven (dotenv-java)

Agrega esta dependencia al `pom.xml`:

```xml
<dependency>
    <groupId>io.github.cdimascio</groupId>
    <artifactId>dotenv-java</artifactId>
    <version>3.0.0</version>
</dependency>
```

Y carga el archivo en `TalkyBackendApplication.java`:

```java
import io.github.cdimascio.dotenv.Dotenv;

@SpringBootApplication
public class TalkyBackendApplication {
    public static void main(String[] args) {
        Dotenv dotenv = Dotenv.configure()
            .directory("./")
            .ignoreIfMissing()
            .load();
        
        SpringApplication.run(TalkyBackendApplication.class, args);
    }
}
```

#### B) Usar variables de entorno del sistema

**Windows (PowerShell):**
```powershell
$env:DB_URL="jdbc:postgresql://localhost:5433/talky"
$env:DB_USERNAME="postgres"
$env:DB_PASSWORD="tu_contraseña"
$env:COGNITO_ISSUER_URI="https://cognito-idp.us-east-1.amazonaws.com/us-east-1_TU_USER_POOL_ID"
.\mvnw.cmd spring-boot:run
```

**Windows (CMD):**
```cmd
set DB_URL=jdbc:postgresql://localhost:5433/talky
set DB_USERNAME=postgres
set DB_PASSWORD=tu_contraseña
set COGNITO_ISSUER_URI=https://cognito-idp.us-east-1.amazonaws.com/us-east-1_TU_USER_POOL_ID
mvnw.cmd spring-boot:run
```

**Linux/Mac:**
```bash
export DB_URL=jdbc:postgresql://localhost:5433/talky
export DB_USERNAME=postgres
export DB_PASSWORD=tu_contraseña
export COGNITO_ISSUER_URI=https://cognito-idp.us-east-1.amazonaws.com/us-east-1_TU_USER_POOL_ID
./mvnw spring-boot:run
```

#### C) Usar un script de inicio

Crea un archivo `start.bat` (Windows) o `start.sh` (Linux/Mac) que cargue las variables antes de ejecutar:

**start.bat (Windows):**
```batch
@echo off
set DB_URL=jdbc:postgresql://localhost:5432/talky
set DB_USERNAME=postgres
set DB_PASSWORD=tu_contraseña
set COGNITO_ISSUER_URI=https://cognito-idp.us-east-1.amazonaws.com/us-east-1_ZxCqWwPsV
mvn spring-boot:run
```

**start.sh (Linux/Mac):**
```bash
#!/bin/bash
export DB_URL=jdbc:postgresql://localhost:5432/talky
export DB_USERNAME=postgres
export DB_PASSWORD=tu_contraseña
export COGNITO_ISSUER_URI=https://cognito-idp.us-east-1.amazonaws.com/us-east-1_ZxCqWwPsV
mvn spring-boot:run
```

## ⚠️ Valores por Defecto

**IMPORTANTE:** Las siguientes variables son **OBLIGATORIAS** y no tienen valores por defecto:

- `DB_PASSWORD`: *(OBLIGATORIO - debe configurarse)*
- `COGNITO_ISSUER_URI`: *(OBLIGATORIO - debe configurarse con tu User Pool ID)*

Variables opcionales (con valores por defecto):

- `DB_URL`: `jdbc:postgresql://localhost:5433/talky` (puerto 5433 para Docker)
- `DB_USERNAME`: `postgres`
- `SERVER_PORT`: `8080`

## 🔒 Seguridad

- **NUNCA** subas el archivo `.env` al repositorio
- El archivo `.env` ya está en `.gitignore`
- Usa diferentes credenciales para desarrollo, staging y producción
- En producción, usa un sistema de gestión de secretos (AWS Secrets Manager, HashiCorp Vault, etc.)

## 📝 Notas

- El archivo `application.properties` ahora usa la sintaxis `${VARIABLE:valor_por_defecto}`
- Si una variable no está definida, se usará el valor por defecto
- Para producción, configura las variables de entorno en tu plataforma de despliegue (AWS, Heroku, etc.)

