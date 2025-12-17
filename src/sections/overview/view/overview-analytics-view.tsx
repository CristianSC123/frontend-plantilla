import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import { DashboardContent } from 'src/layouts/dashboard';
import { _posts, _tasks, _traffic, _timeline } from 'src/_mock';
import { AnalyticsCurrentVisits } from '../analytics-current-visits';
import { AnalyticsWebsiteVisits } from '../analytics-website-visits';
import { AnalyticsWidgetSummary } from '../analytics-widget-summary';
import axios from 'axios';
import { ProveedorProps } from 'src/sections/proveedor/view/proveedorFormData';
import { useEffect, useState } from 'react';
import { VentaProps } from 'src/sections/venta/lista';
import { CompraProps } from 'src/sections/compra/lista';

// ----------------------------------------------------------------------

export function OverviewAnalyticsView() {
  const usuario = localStorage.getItem('usuario');
  const nombreMayus = usuario ? usuario.toUpperCase() : null;
  const [proveedores, setProveedores] = useState<ProveedorProps[]>([]);
  const [ventas, setVentas] = useState<VentaProps[]>([]);
  const [compras, setCompras] = useState<CompraProps[]>([]);
  const [totalCompras, setTotalCompras] = useState(0);
  const [totalVentas, setTotalVentas] = useState(0);
  const [totalProductos, setTotalProductos] = useState(0);
  const [productos, setProductos] = useState([]);

  const obtenerProveedores = async () => {
    try {
      const response = await axios.get('http://localhost:3000/proveedores');
      setProveedores(response.data);
    } catch (error) {
      console.error('Error obteniendo proveedores:', error);
    }
  };

  const obtenerProductos = async () => {
    try {
      const response = await axios.get('http://localhost:3000/productos');
      setProductos(response.data);
      console.log('Productos obtenidos:', response.data.length);
      setTotalProductos(response.data.length);
    } catch (error) {
      console.error('Error obteniendo productos:', error);
    }
  };

  const obtenerCompras = async () => {
    try {
      const response = await axios.get('http://localhost:3000/compras/estadisticas');
      setCompras(response.data);
      setTotalCompras(response.data.totalMonto || 0);
    } catch (error) {
      console.error('Error obteniendo compras:', error);
    }
  };

  const formatFechaParaAPI = (fecha: Date): string => {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  // Función para calcular las fechas de inicio y fin de la semana actual
  const calcularSemanaActual = () => {
    const hoy = new Date();

    // Obtener el primer día de la semana (domingo)
    const inicioSemana = new Date(hoy);
    const diaSemana = hoy.getDay(); // 0 = domingo, 1 = lunes, etc.
    inicioSemana.setDate(hoy.getDate() - diaSemana);
    inicioSemana.setHours(0, 0, 0, 0);

    const finSemana = new Date(inicioSemana);
    finSemana.setDate(inicioSemana.getDate() + 6);
    finSemana.setHours(23, 59, 59, 999);

    return { inicioSemana, finSemana };
  };

  const obtenerVentasSemanales = async () => {
    try {
      // Calcular fechas de la semana actual
      const { inicioSemana, finSemana } = calcularSemanaActual();

      // Formatear fechas para la API
      const fechaDesde = encodeURIComponent(formatFechaParaAPI(inicioSemana));
      const fechaHasta = encodeURIComponent(formatFechaParaAPI(finSemana));
      console.log('Fechas para API:', fechaDesde, fechaHasta);

      // Hacer la petición a la API
      const response = await axios.get(
        `http://localhost:3000/ventas/estadisticas?fechaDesde=${fechaDesde}&fechaHasta=${fechaHasta}`
      );

    
      console.log('Ventas semanales:', response.data.data);
      setTotalVentas(response.data.data.montoTotal || 0);

      return {
        data: response.data,
        fechaDesde: inicioSemana,
        fechaHasta: finSemana,
        periodo: 'semana_actual',
      };
    } catch (error) {
      console.error('Error obteniendo ventas semanales:', error);
      throw error;
    }
  };


  useEffect(() => {
    obtenerProveedores(), obtenerVentasSemanales().then((res) => setVentas(res.data)), obtenerCompras(), obtenerProductos();
  }, []);

  const totalProveedores = proveedores.length;
  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
        Hola, Bienvenido {nombreMayus} 👋
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title="Ventas Semanales"
            percent={1.2}
            total={totalVentas}
            icon={<img alt="Weekly sales" src="/assets/icons/glass/ic-glass-bag.svg" />}
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [22, 8, 35, 50, 82, 84, 77, 12],
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title="Técnicos Registrados"
            percent={+1.2}
            total={totalProveedores}
            color="secondary"
            icon={<img alt="New users" src="/assets/icons/glass/ic-glass-users.svg" />}
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [56, 47, 40, 62, 73, 30, 23, 54],
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title="Compras Realizadas"
            percent={2.8}
            total={totalCompras}
            color="warning"
            icon={<img alt="Purchase orders" src="/assets/icons/glass/ic-glass-buy.svg" />}
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [40, 70, 50, 28, 70, 75, 7, 64],
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title="Pantallas Disponibles"
            percent={3.6}
            total={totalProductos}
            color="error"
            icon={<img alt="Messages" src="/assets/icons/glass/ic-glass-message.svg" />}
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [56, 30, 23, 54, 47, 40, 62, 73],
            }}
          />
        </Grid>

        {/* <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <AnalyticsCurrentVisits
            title="Current visits"
            chart={{
              series: [
                { label: 'America', value: 3500 },
                { label: 'Asia', value: 2500 },
                { label: 'Europe', value: 1500 },
                { label: 'Africa', value: 500 },
              ],
            }}
          />
        </Grid> */}

        {/* <Grid size={{ xs: 12, md: 6, lg: 8 }}>
          <AnalyticsWebsiteVisits
            title="Website visits"
            subheader="(+43%) than last year"
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
              series: [
                { name: 'Team A', data: [43, 33, 22, 37, 67, 68, 37, 24, 55] },
                { name: 'Team B', data: [51, 70, 47, 67, 40, 37, 24, 70, 24] },
              ],
            }}
          />
        </Grid> */}
      </Grid>
    </DashboardContent>
  );
}
