
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

## 5️⃣ Resumen del flujo

1. **Crear página** → `src/pages/[nombre].tsx`
2. **Registrar ruta** en `src/routes/sections.tsx`
3. **Agregar módulo** en `nav-config-dashboard.tsx`
4. **Añadir ícono SVG** en la carpeta de íconos
5. **Probar navegación** desde el dashboard

---

✅ Con estos pasos, el nuevo módulo quedará integrado y visible en el dashboard del proyecto.  

---
