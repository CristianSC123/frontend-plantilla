import { CONFIG } from 'src/config-global';
import VentaView from 'src/sections/venta/view/venta-view';

export default function VentaPage() {
  return (
    <>
      <title>{`Técnicos - ${CONFIG.appName}`}</title>
      <h1>Módulo de Ventas</h1>
      <VentaView />
    </>
  );
}