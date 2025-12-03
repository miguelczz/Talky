# ☕ Configuración de Java (JAVA_HOME)

El proyecto requiere **Java 21** para ejecutarse. Si ves el error "JAVA_HOME environment variable is not defined correctly", sigue estas instrucciones.

## 🔍 Verificar si Java está instalado

Abre una terminal (CMD o PowerShell) y ejecuta:

```cmd
java -version
```

Si ves algo como:
```
openjdk version "21.0.x"
```

Entonces Java está instalado. Si no, necesitas instalarlo primero.

## 📥 Instalar Java 21

1. Ve a [Adoptium (Eclipse Temurin)](https://adoptium.net/)
2. Descarga **Java 21 LTS** para Windows
3. Ejecuta el instalador
4. Durante la instalación, marca la opción **"Set JAVA_HOME variable"** si está disponible

## ⚙️ Configurar JAVA_HOME Manualmente

### Opción 1: Configuración Temporal (Solo para esta sesión)

Abre CMD o PowerShell y ejecuta:

```cmd
set JAVA_HOME=C:\Program Files\Java\jdk-21
```

**Nota:** Esto solo funciona para la ventana actual. Si cierras la ventana, se perderá.

### Opción 2: Configuración Permanente (Recomendado)

#### Método A: Usando setx (CMD)

1. Encuentra la ubicación de tu instalación de Java:
   - Generalmente está en: `C:\Program Files\Java\jdk-21` o `C:\Program Files\Eclipse Adoptium\jdk-21.x.x-hotspot`

2. Abre CMD como **Administrador** y ejecuta:

```cmd
setx JAVA_HOME "C:\Program Files\Java\jdk-21" /M
```

3. Agrega Java al PATH (si no está ya):

```cmd
setx PATH "%PATH%;%JAVA_HOME%\bin" /M
```

4. **Cierra y vuelve a abrir** todas las ventanas de terminal

#### Método B: Usando la Interfaz Gráfica

1. Presiona `Win + R` y escribe `sysdm.cpl`, presiona Enter
2. Ve a la pestaña **"Opciones avanzadas"**
3. Haz clic en **"Variables de entorno"**
4. En **"Variables del sistema"**, haz clic en **"Nueva"**
5. Nombre de la variable: `JAVA_HOME`
6. Valor de la variable: La ruta a tu instalación de Java (ej: `C:\Program Files\Java\jdk-21`)
7. Haz clic en **"Aceptar"**
8. Selecciona la variable **"Path"** y haz clic en **"Editar"**
9. Haz clic en **"Nuevo"** y agrega: `%JAVA_HOME%\bin`
10. Haz clic en **"Aceptar"** en todas las ventanas
11. **Cierra y vuelve a abrir** todas las ventanas de terminal

## ✅ Verificar la Configuración

Abre una **nueva** ventana de CMD o PowerShell y ejecuta:

```cmd
echo %JAVA_HOME%
java -version
```

Deberías ver:
- La ruta a tu instalación de Java
- La versión de Java (21.x.x)

## 🚀 Usar los Scripts

Una vez configurado JAVA_HOME, los scripts intentarán detectarlo automáticamente. Si no está configurado, intentarán encontrarlo desde el PATH.

### Scripts Disponibles

- `start-dev.bat` - Inicia Docker y el backend
- `backend/backend/start.bat` - Solo inicia el backend

Ambos scripts ahora:
1. Verifican si JAVA_HOME está configurado
2. Intentan detectarlo automáticamente si no está
3. Muestran instrucciones claras si no se encuentra

## 🐛 Solución de Problemas

### Error: "JAVA_HOME is set but java.exe not found"

1. Verifica que JAVA_HOME apunta al directorio correcto:
   ```cmd
   echo %JAVA_HOME%
   dir "%JAVA_HOME%\bin\java.exe"
   ```

2. Si no existe, busca dónde está Java:
   ```cmd
   where java
   ```

3. Actualiza JAVA_HOME con la ruta correcta (sin `\bin` al final)

### Error: "Java not found in PATH"

1. Verifica que Java está en el PATH:
   ```cmd
   where java
   ```

2. Si no aparece, agrega Java al PATH usando el Método B arriba

### El script detecta Java pero sigue fallando

1. Asegúrate de haber **cerrado y vuelto a abrir** la ventana de terminal después de configurar JAVA_HOME
2. Verifica que estás usando Java 21:
   ```cmd
   java -version
   ```
3. Si tienes múltiples versiones de Java, asegúrate de que JAVA_HOME apunta a Java 21

## 📝 Notas

- **Java 21** es requerido (según `pom.xml`)
- El Maven Wrapper (`mvnw.cmd`) necesita JAVA_HOME para funcionar
- Si instalas Java después de configurar JAVA_HOME, puede que necesites actualizar la ruta
- En Windows, las rutas con espacios (como `Program Files`) funcionan bien si están entre comillas

## 🔗 Enlaces Útiles

- [Descargar Java 21 (Adoptium)](https://adoptium.net/)
- [Documentación de Maven Wrapper](https://maven.apache.org/wrapper/)

