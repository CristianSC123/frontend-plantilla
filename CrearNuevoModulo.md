
# UMSA - LASIN
## 📦 Guía para crear un nuevo módulo en el frontend

Esta guía explica cómo añadir un nuevo módulo (por ejemplo, **Artículos**) al proyecto, desde la creación de la página base hasta su integración en el dashboard y la navegación.

---

## 1️⃣ Crear la página base

En el directorio `src/pages/` crea un nuevo archivo para tu módulo.  
Por ejemplo, para **Artículos**:  

**`src/pages/articulo.tsx`**
```tsx
import { CONFIG } from 'src/config-global';

export default function Page() {
  return (
    <>
      <title>{`Artículos - ${CONFIG.appName}`}</title>
      <h1>Módulo de Artículos</h1>
    </>
  );
}
```

> **💡 Consejo:** Usa un título coherente con el nombre del módulo para mantener la consistencia en el SEO y el dashboard.

---

## 2️⃣ Agregar la ruta en `sections.tsx`

Abre el archivo:

```
src/routes/sections.tsx
```

Agrega la importación con **lazy loading** para optimizar el rendimiento:

```ts
export const ArticuloPage = lazy(() => import('src/pages/articulo'));
```

Luego, añade la ruta en el arreglo `children`:

```ts
{ path: 'articulo', element: <ArticuloPage /> },
```

---

## 3️⃣ Integrar el módulo en la configuración del dashboard

Abre el archivo:

```
src/layouts/nav-config-dashboard.tsx
```

Agrega una nueva entrada al menú de navegación:

```ts
{
  title: 'Artículos',
  path: '/articulo',
  icon: icon('ic-articulo'),
},
```

> **📌 Nota:** El valor `ic-articulo` hace referencia al nombre del icono que se definirá o descargará.

---

## 4️⃣ Personalizar el ícono del módulo

Para descargar íconos SVG gratuitos y de calidad, visita:  

🔗 [https://www.svgrepo.com/](https://www.svgrepo.com/)

Una vez descargado el SVG:
- Guárdalo en la carpeta de íconos del proyecto (por ejemplo `src/assets/icons/`).
- Regístralo para que `icon('ic-articulo')` lo pueda usar.

---

## 🛠️ Crear un nuevo componente
Para crear un nuevo componente en el proyecto, sigue esta estructura recomendada para mantener la organización y coherencia.

Estructura de carpetas y archivos
En el directorio src/sections/ crea una carpeta para tu nuevo módulo.
Ejemplo:

```bash
src/sections/articulo/
```
Dentro de esa carpeta, crea una subcarpeta llamada view que contendrá los componentes visuales específicos.

```
src/sections/articulo/view/
```
En la carpeta view, crea dos archivos principales:
```
index.ts — para exportar los componentes del módulo.
articulo-view.tsx — el componente principal que representará la vista del módulo.
```

Ejemplo de archivos
src/sections/articulo/view/index.ts

```ts
export { default as ArticuloView } from './articulo-view';
```

src/sections/articulo/view/articulo-view.tsx

```ts
import React from 'react';

export default function ArticuloView() {
  return (
    <div>
      <h1>Vista del módulo Artículo</h1>
      {/* Aquí va la lógica y componentes específicos */}
    </div>
  );
}
```
Consejos
Mantén los nombres consistentes y descriptivos para facilitar la navegación del proyecto.

Usa el archivo index.ts para centralizar las exportaciones del módulo y facilitar las importaciones.

Sigue las buenas prácticas de React y TypeScript para mantener el código limpio y mantenible.

### Actualizar Page de articulo 

No olvides actualizar tu page de articulo para mostrar tus componentes
```ts

import { CONFIG } from 'src/config-global';
import { ArticuloView } from 'src/sections/articulo/view';

export default function Page() {
  return (
    <>
        <title>{`Articulos - ${CONFIG.appName}`}</title>
        <ArticuloView/>
    </>
  );
}
```

## 5️⃣ Resumen del flujo

1. **Crear página** → `src/pages/[nombre].tsx`
2. **Registrar ruta** en `src/routes/sections.tsx`
3. **Agregar módulo** en `nav-config-dashboard.tsx`
4. **Añadir ícono SVG** en la carpeta de íconos
5. **Probar navegación** desde el dashboard

---

✅ Con estos pasos, el nuevo módulo quedará integrado y visible en el dashboard del proyecto.  

---
