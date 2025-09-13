# 📦 Proyecto Xevent

Este proyecto cuenta con un flujo de trabajo estandarizado para asegurar calidad, consistencia y colaboración eficiente entre el equipo de desarrollo (backend y frontend).



---

## 🔀 Flujo de trabajo con Git

El equipo utiliza un flujo de trabajo basado en **Pull Requests**:

1. **Toda corrección de bug o cambio de estilos se hace SIEMPRE en una rama nueva**.  
2. **Nunca se trabaja directamente en `develop` ni en `main`**.  
3. **Las ramas se integran mediante Pull Request (PR) a `develop`**.  
4. **Cada PR debe ser revisada y aprobada por al menos otro desarrollador antes de mergearse**.  
5. Cuando un sprint o release esté listo, `develop` se integrará en `main`.  

---

## 🌱 Convención de ramas

Las ramas deben seguir un nombre claro y específico:

- **Nueva funcionalidad:**  
  ```
  creacion de entradas
  ```
  Ejemplo: `creacion-de-entradas`


- **Corrección de bug:**  
  ```
  fix/descripcion-del-bug
  ```
  Ejemplo: `fix/error-al-guardar-usuario`

- **Corrección de estilos o mejoras menores:**  
  ```
  style/descripcion-del-cambio
  ```
  Ejemplo: `style/ajustes-en-formulario`

---

## ✅ Pull Requests (PR)

- Se hace **PR de la rama → `develop`**.  
- El título del PR debe ser **claro y descriptivo**:
  - `[Fix] Error al guardar usuario`
  - `[Style] Ajustes en formulario`  

### La PR debe incluir:
- Breve descripción de los cambios.    
- Referencia a tickets/issues relacionados.  

### Reglas de revisión:
- Cada PR debe ser revisada y aprobada por al menos **1 desarrollador distinto**.  
- No se permite el **self-merge**.  
- Los comentarios/revisiones deben ser resueltos antes del merge.  

---

## 📂 Flujo de ramas

```plaintext
main ────► versión estable en producción
   │
   └── develop ───► integración de cambios
           │
           └── funcionalidad nueva
           ├── fix/...   (bugs)
           └── style/... (cambios visuales/menores)
```

---

## 🔧 Buenas prácticas

- Hacer commits pequeños y descriptivos.  
  Ejemplo:  
  - `fix: corregir validación de email en login`  
  - `style: ajustar espaciado en formulario`  

- Antes de crear un PR, actualizar tu rama con `develop`:  
  ```bash
  git fetch
  git checkout tu-rama
  git pull origin develop
  
  **pull request a develop**
  ```

- Verificar que el proyecto corre correctamente antes de enviar la PR.  
- Mantener consistencia en nombres de ramas, PRs y commits.  

---

