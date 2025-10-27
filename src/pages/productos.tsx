import { CONFIG } from 'src/config-global';
import ProductoView from 'src/sections/product/view/producto-view';


// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Products - ${CONFIG.appName}`}</title>
      <ProductoView />
    </>
  );
}
