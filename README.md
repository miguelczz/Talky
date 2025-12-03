# 🗣️ Talky - Plataforma de Aprendizaje de Inglés

**Talky** es una aplicación web completa para estudiantes de inglés que incluye chat interactivo, lecciones, exámenes y herramientas de aprendizaje.

## 🏗️ Arquitectura

- **Backend:** Java 21 + Spring Boot + PostgreSQL
- **Frontend:** React + Vite + TailwindCSS
- **Autenticación:** AWS Cognito
- **Base de Datos:** PostgreSQL (Docker)

## 🚀 Inicio Rápido

### Prerrequisitos

- Java 21
- Node.js 18+
- Docker Desktop
- Maven (incluido via wrapper)

### Configuración Inicial

1. **Configura Java:**
   ```bash
   # Ver docs/setup/CONFIGURAR_JAVA.md
   ```

2. **Configura Docker:**
   ```bash
   # Ver docs/setup/DOCKER_SETUP.md
   docker-compose up -d
   ```

3. **Configura variables de entorno:**
   - Backend: Crea `backend/.env` (ver `docs/setup/CONFIGURACION_VARIABLES_ENTORNO.md`)
   - Frontend: Crea `frontend/.env.local` (ver `docs/setup/CONFIGURACION_COGNITO.md`)

### Ejecutar el Proyecto

**Opción 1: Script automático (Recomendado)**
```bash
scripts/start-dev.bat
```

**Opción 2: Manual**

Backend:
```bash
cd backend
scripts/start.bat
# O directamente:
mvnw.cmd spring-boot:run
```

Frontend:
```bash
cd frontend
npm install
npm run dev
```

## 📁 Estructura del Proyecto

```
Talky/
├── docs/              # 📚 Documentación centralizada
│   ├── setup/         # Configuración e instalación
│   ├── api/           # Documentación de API
│   ├── desarrollo/    # Documentos de desarrollo
│   └── analisis/      # Análisis y reportes
├── backend/           # 🔧 Backend (Spring Boot)
│   ├── src/
│   ├── scripts/
│   └── pom.xml
├── frontend/          # 🎨 Frontend (React + Vite)
│   ├── src/
│   └── package.json
├── scripts/           # 🚀 Scripts globales
└── docker-compose.yml # 🐳 Configuración Docker
```

## 📚 Documentación

Toda la documentación está en la carpeta `docs/`:

- **Configuración:** `docs/setup/`
- **API:** `docs/api/`
- **Desarrollo:** `docs/desarrollo/`
- **Análisis:** `docs/analisis/`

## 🔧 Scripts Disponibles

- `scripts/start-dev.bat` - Inicia Docker y backend automáticamente
- `backend/scripts/start.bat` - Inicia solo el backend

## 🔒 Seguridad

- Todas las credenciales deben estar en archivos `.env` (no en el código)
- Los archivos `.env` y configuraciones sensibles están en `.gitignore`
- Ver `docs/analisis/CAMBIOS_SEGURIDAD.md` para más detalles
- **Nota:** El `.gitignore` está configurado para ignorar automáticamente todas las variables de entorno y configuraciones sensibles

## 📝 Licencia

[Especificar licencia si aplica]

## 👥 Contribuidores

[Agregar información de contribuidores]

