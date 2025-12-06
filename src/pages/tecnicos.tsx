import { CONFIG } from 'src/config-global';
import TecnicoView from 'src/sections/tecnico/view/tecnico-view';

export default function TecnicoPage() {
  return (
    <>
      <title>{`Técnicos - ${CONFIG.appName}`}</title>
      <h1>Módulo de Técnicos</h1>
      <TecnicoView />
    </>
  );
}