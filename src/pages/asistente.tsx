import { CONFIG } from 'src/config-global';
import AsistenteView from 'src/sections/asistente/view/asistente-view';

export default function AsistentePage() {
  return (
    <>
      <title>{`Técnicos - ${CONFIG.appName}`}</title>
      <AsistenteView />
    </>
  );
}