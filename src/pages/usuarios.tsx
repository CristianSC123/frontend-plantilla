import { CONFIG } from 'src/config-global';
import TecnicoView from 'src/sections/tecnico/view/tecnico-view';
import UsuarioView from 'src/sections/usuario/view/usuario-view';

export default function UsuarioPage() {
  return (
    <>
      <title>{`Técnicos - ${CONFIG.appName}`}</title>
      <h1>Módulo de Usuarios</h1>
      <UsuarioView />
    </>
  );
}