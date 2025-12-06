import { CONFIG } from 'src/config-global';
import ProveedorView from 'src/sections/proveedor/view/proveedor-view';

export default function ProveedorPage() {
  return (
    <>
      <title>{`Proveedores - ${CONFIG.appName}`}</title>
      <h1>Módulo de Proveedores</h1>
      <ProveedorView/>
    </>
  );
}