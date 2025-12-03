# 🧪 Guía de Pruebas - Sistema de Cursos, Lecciones y Exámenes

Esta guía te ayudará a probar todas las funcionalidades implementadas del sistema educativo Talky.

## 📋 Pre-requisitos

1. **Backend funcionando**: Asegúrate de que el backend esté corriendo en `http://localhost:8080` (o la URL configurada)
2. **Frontend funcionando**: El frontend debe estar corriendo en `http://localhost:5173`
3. **Usuarios de prueba**: Necesitas al menos un usuario de cada rol:
   - **STUDENT**: Un estudiante (puede o no tener curso asignado)
   - **TEACHER**: Un profesor
   - **ADMIN**: Un administrador

## 🔐 Paso 1: Verificar Autenticación

### 1.1 Iniciar Sesión
- Ve a `http://localhost:5173/signin`
- Inicia sesión con un usuario de prueba
- Verifica que te redirija correctamente después del login

### 1.2 Verificar Rol
- Abre la consola del navegador (F12)
- Verifica que el usuario tenga el rol correcto
- Revisa que el Navbar muestre las opciones correctas según el rol

## 📚 Paso 2: Probar Gestión de Cursos

### 2.1 Como PROFESOR o ADMIN

#### Ver Lista de Cursos
1. Navega a `/courses` desde el menú "Académico" → "Cursos"
2. **Esperado**: Deberías ver:
   - Si eres TEACHER: Solo tus cursos
   - Si eres ADMIN: Todos los cursos del sistema
   - Si no hay cursos: Mensaje "No hay cursos disponibles"

#### Crear Nuevo Curso
1. Haz clic en el botón "Nuevo Curso"
2. **Esperado**: Se abre un formulario
3. Completa el formulario:
   - Título: "Inglés Básico" (requerido)
   - Descripción: "Curso de inglés para principiantes" (opcional)
   - Si eres ADMIN: Selecciona un profesor del dropdown
4. Haz clic en "Crear"
5. **Esperado**: 
   - El curso se crea exitosamente
   - Aparece en la lista de cursos
   - El formulario se cierra

#### Ver Detalle de Curso
1. Haz clic en una tarjeta de curso
2. **Esperado**: 
   - Navega a `/courses/{id}`
   - Muestra el título, descripción y estadísticas del curso
   - Muestra la lista de lecciones (vacía si no hay)

#### Editar Curso
1. En la lista de cursos, haz hover sobre una tarjeta
2. Haz clic en el icono de editar (lápiz)
3. **Esperado**: 
   - Navega a `/courses/{id}/edit` (si implementaste esta ruta)
   - O muestra el formulario de edición
4. Modifica el título o descripción
5. Guarda los cambios
6. **Esperado**: Los cambios se reflejan en la lista

#### Eliminar Curso
1. Haz hover sobre una tarjeta de curso
2. Haz clic en el icono de eliminar (papelera)
3. **Esperado**: 
   - Aparece un diálogo de confirmación
   - Si confirmas: El curso se elimina
   - Si el curso tiene estudiantes: Muestra error apropiado

### 2.2 Como ESTUDIANTE

#### Ver Mi Curso
1. Navega a `/courses`
2. **Esperado**: 
   - Si tienes curso asignado: Ves solo tu curso
   - Si no tienes curso: Mensaje "Aún no tienes un curso asignado"
   - NO ves el botón "Nuevo Curso"
   - NO ves botones de editar/eliminar

## 📖 Paso 3: Probar Gestión de Lecciones

### 3.1 Ver Lecciones

#### Como ESTUDIANTE
1. Navega a `/lessons` desde el menú "Académico" → "Lecciones"
2. **Esperado**: 
   - Ves las lecciones de tu curso asignado
   - Cada lección muestra una barra de progreso (0-100%)
   - Puedes hacer clic para ver detalles

#### Como PROFESOR o ADMIN
1. Navega a `/lessons`
2. **Esperado**: 
   - Ves todas las lecciones (filtradas por rol)
   - Puedes ver/editar/eliminar lecciones

### 3.2 Crear Lección (TEACHER/ADMIN)
1. Ve al detalle de un curso (`/courses/{id}`)
2. Haz clic en "Nueva Lección"
3. **Esperado**: 
   - Se abre formulario de creación
   - El cursoId está pre-seleccionado
4. Completa:
   - Título: "Presente Simple"
   - Descripción: "Aprende a usar el presente simple"
5. Guarda
6. **Esperado**: 
   - La lección aparece en la lista del curso
   - Aparece en `/lessons`

### 3.3 Actualizar Progreso (ESTUDIANTE)
1. Como estudiante, ve a una lección
2. **Esperado**: Puedes actualizar el progreso (0-100%)
3. Marca progreso al 50%
4. **Esperado**: 
   - La barra de progreso se actualiza
   - El progreso se guarda en el backend

## 📝 Paso 4: Verificar Servicios API

### 4.1 Probar en Consola del Navegador

Abre la consola (F12) y prueba:

```javascript
// Importar servicios (si están disponibles globalmente)
// O prueba desde la interfaz

// Verificar que los endpoints respondan:
// - GET /api/courses
// - GET /api/lessons
// - GET /api/exams
```

### 4.2 Verificar Errores

1. **Error 401 (No autenticado)**:
   - Cierra sesión
   - Intenta acceder a `/courses`
   - **Esperado**: Redirige a login

2. **Error 403 (Sin permisos)**:
   - Como estudiante, intenta crear un curso
   - **Esperado**: No ves el botón o muestra error

3. **Error 404 (No encontrado)**:
   - Navega a `/courses/00000000-0000-0000-0000-000000000000`
   - **Esperado**: Muestra mensaje de error apropiado

## 🎯 Paso 5: Verificar Navegación

### 5.1 Rutas Principales
Verifica que estas rutas funcionen:
- ✅ `/courses` - Lista de cursos
- ✅ `/courses/:id` - Detalle de curso
- ✅ `/lessons` - Lista de lecciones
- ✅ `/chat` - Chat (ya existente)
- ✅ `/verbs` - Verbos (ya existente)
- ✅ `/glossary` - Glosario (ya existente)

### 5.2 Navegación desde Navbar
1. Verifica que el menú "Académico" muestre:
   - **STUDENT**: Lecciones, Exámenes, Curso, Calificaciones
   - **TEACHER**: Exámenes, Cursos, Lecciones, Calificaciones
   - **ADMIN**: Cursos, Lecciones

2. Verifica que los enlaces funcionen correctamente

## 🐛 Paso 6: Verificar Errores Comunes

### 6.1 Problemas de Carga
- **Síntoma**: Página en blanco o "Cargando..." infinito
- **Solución**: 
  - Verifica la consola del navegador
  - Verifica que el backend esté corriendo
  - Verifica la URL de la API en `.env`

### 6.2 Errores de CORS
- **Síntoma**: Error en consola sobre CORS
- **Solución**: Verifica configuración del backend

### 6.3 Token Expirado
- **Síntoma**: Errores 401 después de un tiempo
- **Solución**: Cierra sesión y vuelve a iniciar

## 📊 Paso 7: Verificar Funcionalidades por Rol

### Como ESTUDIANTE:
- ✅ Ver mi curso asignado
- ✅ Ver lecciones de mi curso
- ✅ Ver progreso de lecciones
- ✅ Actualizar progreso
- ❌ NO puedo crear/editar/eliminar cursos
- ❌ NO puedo crear/editar/eliminar lecciones

### Como PROFESOR:
- ✅ Ver mis cursos
- ✅ Crear nuevos cursos
- ✅ Editar mis cursos
- ✅ Eliminar mis cursos (si no tienen estudiantes)
- ✅ Ver lecciones de mis cursos
- ✅ Crear/editar/eliminar lecciones de mis cursos
- ❌ NO puedo modificar cursos de otros profesores

### Como ADMIN:
- ✅ Ver todos los cursos
- ✅ Crear cursos (puede asignar cualquier profesor)
- ✅ Editar cualquier curso
- ✅ Eliminar cualquier curso
- ✅ Ver todas las lecciones
- ✅ Crear/editar/eliminar cualquier lección

## 🔍 Checklist de Pruebas Rápidas

### Funcionalidades Básicas
- [ ] Puedo iniciar sesión
- [ ] Veo el menú correcto según mi rol
- [ ] Puedo navegar a `/courses`
- [ ] Puedo ver la lista de cursos (filtrada por rol)
- [ ] Puedo crear un curso (si tengo permisos)
- [ ] Puedo ver el detalle de un curso
- [ ] Puedo navegar a `/lessons`
- [ ] Puedo ver las lecciones (filtradas por rol)

### Interacciones
- [ ] Los botones de hover funcionan (editar/eliminar)
- [ ] Los formularios validan correctamente
- [ ] Los mensajes de error se muestran apropiadamente
- [ ] Los estados de carga funcionan
- [ ] Las confirmaciones de eliminación funcionan

### Responsive
- [ ] La interfaz se ve bien en desktop
- [ ] La interfaz se ve bien en móvil
- [ ] Los grids se adaptan correctamente

## 🚨 Problemas Conocidos y Soluciones

### Problema: "Usuario no autenticado"
**Solución**: Verifica que el token JWT esté siendo enviado correctamente. Revisa `src/utils/api.js`

### Problema: Los cursos no se cargan
**Solución**: 
1. Verifica la consola del navegador
2. Verifica que el backend esté corriendo
3. Verifica la URL de la API: `import.meta.env.API_URL`

### Problema: No puedo crear cursos como profesor
**Solución**: Verifica que tu usuario tenga el rol TEACHER en el backend

## 📝 Notas Adicionales

- Los tipos TypeScript están en `src/types/` pero no se usan en runtime (son solo documentación)
- Los servicios API están en `src/services/`
- Los componentes están en `src/components/`
- Las páginas están en `src/pages/`

## 🎉 Próximos Pasos

Una vez que verifiques que todo funciona:
1. Implementar páginas de exámenes
2. Implementar formularios de lecciones
3. Implementar sistema de calificaciones
4. Agregar más validaciones
5. Mejorar manejo de errores

---

**¿Encontraste algún problema?** Revisa la consola del navegador y los logs del backend para más detalles.

