# 👤 Crear Usuario Administrador

Este documento explica cómo crear o actualizar un usuario para que tenga el rol `ADMIN` en la base de datos.

## 📋 Método 1: Actualizar Usuario Existente (Recomendado)

Si ya tienes un usuario registrado en Cognito y quieres convertirlo en administrador:

### Paso 1: Obtener el cognito_sub

1. Inicia sesión con el usuario en el frontend
2. Abre la consola del navegador (F12 → Console)
3. Ejecuta este comando:
   ```javascript
   (await fetchAuthSession()).tokens?.idToken?.toString()
   ```
4. Copia el token que aparece
5. Ve a https://jwt.io
6. Pega el token en la sección "Encoded"
7. En la sección "Payload", busca el campo `sub`
8. Copia ese valor (es tu `cognito_sub`)

### Paso 2: Actualizar en la base de datos

**Opción A: Usando el script (Windows)**
```bash
scripts\crear-admin.bat
```

**Opción B: Directamente en PostgreSQL**
```bash
docker-compose exec postgres psql -U postgres -d talky
```

Luego ejecuta:
```sql
UPDATE users 
SET role = 'ADMIN', updated_at = now()
WHERE email = 'tu_email@ejemplo.com';
```

**Opción C: Usando una herramienta gráfica**
- Conecta a PostgreSQL (puerto 5433)
- Base de datos: `talky`
- Usuario: `postgres`
- Ejecuta el UPDATE SQL de arriba

## 📋 Método 2: Crear Nuevo Usuario Administrador

Si necesitas crear un usuario administrador desde cero:

### Paso 1: Crear usuario en Cognito

1. Ve a AWS Console → Cognito → User Pools
2. Selecciona tu User Pool
3. Ve a "Users" → "Create user"
4. Completa los datos del usuario
5. **Importante:** Guarda el `cognito_sub` que se genera

### Paso 2: Insertar en la base de datos

**Opción A: Usando el script**
```bash
scripts\crear-admin.bat
```

**Opción B: Directamente en PostgreSQL**
```sql
INSERT INTO users (id, cognito_sub, email, name, role, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'tu_cognito_sub_aqui',
    'admin@talky.com',
    'Administrador',
    'ADMIN',
    now(),
    now()
)
ON CONFLICT (email) DO UPDATE
SET role = 'ADMIN', updated_at = now();
```

## ✅ Verificar que Funcionó

Después de crear/actualizar el usuario:

1. Inicia sesión con ese usuario en el frontend
2. Verifica que puedas acceder a las funciones de administrador
3. O verifica en la base de datos:
   ```sql
   SELECT id, email, name, role, cognito_sub 
   FROM users 
   WHERE role = 'ADMIN';
   ```

## 🔍 Solución de Problemas

### Error: "duplicate key value violates unique constraint"

**Causa:** Ya existe un usuario con ese email o cognito_sub.

**Solución:** Usa el método de actualización (UPDATE) en lugar de INSERT.

### Error: "No se pudo conectar a PostgreSQL"

**Causa:** Docker no está corriendo o PostgreSQL no está iniciado.

**Solución:**
```bash
docker-compose up -d
# Espera 5 segundos
scripts\crear-admin.bat
```

### El usuario no tiene permisos de administrador

**Causa:** El rol no se actualizó correctamente.

**Solución:**
1. Verifica que el rol sea exactamente `'ADMIN'` (en mayúsculas)
2. Reinicia el backend después de actualizar
3. Cierra sesión y vuelve a iniciar sesión en el frontend

## 📝 Notas Importantes

- El `cognito_sub` es único y se genera automáticamente por AWS Cognito
- El email también debe ser único en la base de datos
- Después de cambiar el rol, reinicia el backend y cierra/inicia sesión en el frontend
- El rol se valida en cada petición, así que los cambios son inmediatos después de reiniciar sesión

## 🔒 Seguridad

- **NUNCA** compartas el `cognito_sub` públicamente
- Solo crea usuarios administradores para personas de confianza
- Considera usar grupos de Cognito para gestionar administradores en el futuro

