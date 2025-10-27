import { MdDashboard, MdPerson, MdPeople, MdLocalShipping, MdPointOfSale, MdShoppingBag, MdShoppingCart, MdSettings, MdError } from 'react-icons/md';
import { Label } from 'src/components/label'; 

export const navData = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: <MdDashboard size={36}/>,
  },
  {
    title: 'Usuarios',
    path: '/user',
    icon: <MdPerson size={36}/>,
  },
  {
    title: 'Técnicos',
    path: '/tecnicos',
    icon: <MdPeople size={36}/>,
  },
  {
    title: 'Proveedores',
    path: '/proveedores',
    icon: <MdLocalShipping size={36}/>,
  },
  {
    title: 'Ventas',
    path: '/ventas',
    icon: <MdPointOfSale size={36}/>,
  },
  {
    title: 'Compras',
    path: '/compras',
    icon: <MdShoppingBag size={36}/>,
  },
  /*{
    title: 'Productos',
    path: '/articulos',
    icon: <MdShoppingCart size={36}/>,
    info: (
      <Label color="error" variant="inverted">
        +3
      </Label>
    ),
  },*/
  {
    title: 'Productos',
    path: '/productos',
    icon: <MdShoppingCart size={36}/>,
    info: (
      <Label color="error" variant="inverted">
        +3
      </Label>
    ),
  },
  {
    title: 'Configuración',
    path: '/configuracion',
    icon: <MdSettings size={36}/>,
  },
  {
    title: 'Not found',
    path: '/364',
    icon: <MdError size={36}/>,
  },
];
