import { CONFIG } from 'src/config-global';
import {ArticuloView} from 'src/sections/articulo/view';

export default function Page() {
  return (
    <>
      <title>{`Artículos - ${CONFIG.appName}`}</title>
      <h1>Módulo de Artículos</h1>
      <ArticuloView />
    </>
  );
}