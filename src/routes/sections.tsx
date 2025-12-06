import { JSX, lazy, Suspense } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import type { RouteObject } from 'react-router';

import { varAlpha } from 'minimal-shared/utils';
import Box from '@mui/material/Box';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';

import { AuthLayout } from 'src/layouts/auth';
import { DashboardLayout } from 'src/layouts/dashboard';
import ProveedorPage from 'src/pages/proveedores';
import VentaPage from 'src/pages/ventas';
import UsuarioPage from 'src/pages/usuarios';

// Páginas
export const DashboardPage = lazy(() => import('src/pages/dashboard'));
export const BlogPage = lazy(() => import('src/pages/blog'));
export const UserPage = lazy(() => import('src/pages/user'));
export const SignInPage = lazy(() => import('src/pages/sign-in'));
export const ProductsPage = lazy(() => import('src/pages/productos'));
export const Page404 = lazy(() => import('src/pages/page-not-found'));
export const ArticuloPage = lazy(()=> import('src/pages/articulo'));
export const TecnicoPage = lazy(()=> import('src/pages/tecnicos'));
export const ProductoPage = lazy(()=> import('src/pages/productos'));

// Loader
const renderFallback = () => (
  <Box
    sx={{
      display: 'flex',
      flex: '1 1 auto',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <LinearProgress
      sx={{
        width: 1,
        maxWidth: 320,
        bgcolor: (theme) => varAlpha(theme.vars.palette.text.primaryChannel, 0.16),
        [`& .${linearProgressClasses.bar}`]: { bgcolor: 'text.primary' },
      }}
    />
  </Box>
);

// Componente para proteger rutas privadas
function PrivateRoute({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/sign-in" replace />;
}

export const routesSection: RouteObject[] = [
  {
    element: (
      <DashboardLayout>
        <Suspense fallback={renderFallback()}>
          <Outlet />
        </Suspense>
      </DashboardLayout>
    ),
    children: [
      { index: true, element: <Navigate to="/sign-in" replace /> }, 
      { path: 'dashboard', element: <PrivateRoute><DashboardPage /></PrivateRoute> },
      //{ path: 'user', element: <PrivateRoute><UserPage /></PrivateRoute> },
      { path: 'usuarios', element: <PrivateRoute><UsuarioPage /></PrivateRoute>},
      { path: 'products', element: <PrivateRoute><ProductsPage /></PrivateRoute> },
      { path: 'blog', element: <PrivateRoute><BlogPage /></PrivateRoute> },
      { path: 'articulos', element: <PrivateRoute><ArticuloPage /></PrivateRoute>},
      { path: 'proveedores', element: <PrivateRoute><ProveedorPage /></PrivateRoute>},
      { path: 'tecnicos', element: <PrivateRoute><TecnicoPage /></PrivateRoute>},
      { path: 'ventas', element: <PrivateRoute><VentaPage /></PrivateRoute>},
      {
        path: 'productos',
        element: <PrivateRoute><ProductoPage /></PrivateRoute>,
      }

    ],
  },
  {
    path: 'sign-in',
    element: (
      <AuthLayout>
        <SignInPage />
      </AuthLayout>
    ),
  },
  {
    path: '404',
    element: <Page404 />,
  },
  { path: '*', element: <Page404 /> },
];
