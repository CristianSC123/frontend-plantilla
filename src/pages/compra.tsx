import { CONFIG } from 'src/config-global';
import CompraView from 'src/sections/compra/view/compra-view';
import ProductoView from 'src/sections/product/view/producto-view';


// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Products - ${CONFIG.appName}`}</title>
      <CompraView />
    </>
  );
}