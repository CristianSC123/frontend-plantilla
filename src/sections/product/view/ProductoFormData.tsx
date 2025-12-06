import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  IconButton,
  Box,
  Divider,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Autocomplete,
} from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { CalidadFormDialog } from './CalidadFormData';
import { ProductoBasicoFormDialog } from './ProductoBasicoFormData';

interface Marca {
  id_marca: string;
  nombre_marca: string;
}

interface Producto {
  id_producto: string;
  nombre_producto: string;
  marca: Marca;
}

interface Calidad {
  id_calidad: string;
  nombre_calidad: string;
}

interface CalidadAsignada {
  calidad: Calidad;
  precio_venta: number;
  stock: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  titulo: string;
  onSuccess?: () => void;
}

export function ProductoFormDialog({ open, onClose, titulo, onSuccess }: Props) {
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);

  const [productos, setProductos] = useState<Producto[]>([]);
  const [calidades, setCalidades] = useState<Calidad[]>([]);
  const [calidadesAsignadas, setCalidadesAsignadas] = useState<CalidadAsignada[]>([]);

  const [calidadSeleccionada, setCalidadSeleccionada] = useState<Calidad | null>(null);
  const [precioVenta, setPrecioVenta] = useState<number>(0);
  const [stock, setStock] = useState<number>(0);

  const [openCalidadDialog, setOpenCalidadDialog] = useState(false);
  const [openProductoBasicoDialog, setOpenProductoBasicoDialog] = useState(false);

  useEffect(() => {
    if (open) {
      obtenerProductos();
      obtenerCalidades();
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      // Limpiar formulario al cerrar
      setProductoSeleccionado(null);
      setCalidadesAsignadas([]);
      setCalidadSeleccionada(null);
      setPrecioVenta(0);
      setStock(0);
    }
  }, [open]);

  const obtenerProductos = async () => {
    try {
      const response = await axios.get('http://localhost:3000/productos');
      setProductos(response.data);
    } catch (error) {
      console.error('Error obteniendo productos:', error);
    }
  };

  const obtenerCalidades = async () => {
    try {
      const response = await axios.get('http://localhost:3000/calidades');
      setCalidades(response.data);
    } catch (error) {
      console.error('Error obteniendo calidades:', error);
    }
  };

  const handleAgregarCalidad = () => {
    if (!calidadSeleccionada) {
      alert('Debe seleccionar una calidad');
      return;
    }

    // Verificar si la calidad ya fue agregada
    const yaExiste = calidadesAsignadas.some(
      (ca) => ca.calidad.id_calidad === calidadSeleccionada.id_calidad
    );

    if (yaExiste) {
      alert('Esta calidad ya fue agregada');
      return;
    }

    setCalidadesAsignadas((prev) => [
      ...prev,
      {
        calidad: calidadSeleccionada,
        precio_venta: precioVenta,
        stock: stock,
      },
    ]);

    // Limpiar campos
    setCalidadSeleccionada(null);
    setPrecioVenta(0);
    setStock(0);
  };

  const handleEliminarCalidad = (idCalidad: string) => {
    setCalidadesAsignadas((prev) => prev.filter((ca) => ca.calidad.id_calidad !== idCalidad));
  };

  const handleSubmit = async () => {
    try {
      if (!productoSeleccionado) {
        alert('Debe seleccionar un producto');
        return;
      }

      if (calidadesAsignadas.length === 0) {
        alert('Debe agregar al menos una calidad');
        return;
      }

      // Preparar el payload con todas las calidades
      const payload = {
        calidades: calidadesAsignadas.map((ca) => ({
          id_calidad: ca.calidad.id_calidad,
          precio_venta: ca.precio_venta,
          stock: ca.stock,
        })),
      };

      // Asignar todas las calidades al producto en una sola petición
      await axios.post(
        `http://localhost:3000/productos/${productoSeleccionado.id_producto}/asignar-calidades`,
        payload
      );

      onClose();
      onSuccess?.();
    } catch (error) {
      console.error('Error guardando calidades:', error);
      alert('Error al guardar las calidades del producto');
    }
  };

  const handleCloseCalidadDialog = () => {
    setOpenCalidadDialog(false);
    obtenerCalidades();
  };

  const handleCloseProductoBasicoDialog = () => {
    setOpenProductoBasicoDialog(false);
    obtenerProductos();
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>{titulo}</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {/* Sección: Selección de Producto */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Seleccionar Producto
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                  <Autocomplete
                    fullWidth
                    options={productos}
                    groupBy={(option) => option.marca.nombre_marca}
                    getOptionLabel={(option) => option.nombre_producto}
                    value={productoSeleccionado}
                    onChange={(_, newValue) => setProductoSeleccionado(newValue)}
                    renderInput={(params) => <TextField {...params} label="Producto" />}
                    isOptionEqualToValue={(option, value) =>
                      option.id_producto === value.id_producto
                    }
                  />
                  <IconButton
                    color="primary"
                    onClick={() => setOpenProductoBasicoDialog(true)}
                    sx={{ mt: 1 }}
                  >
                    <Iconify icon="mingcute:add-line" width={24} height={24} />
                  </IconButton>
                </Box>
              </Stack>
            </Box>

            <Divider />

            {/* Sección: Agregar Calidades */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Calidades del Producto
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                  <Autocomplete
                    fullWidth
                    options={calidades}
                    getOptionLabel={(option) => option.nombre_calidad}
                    value={calidadSeleccionada}
                    onChange={(_, newValue) => setCalidadSeleccionada(newValue)}
                    renderInput={(params) => <TextField {...params} label="Calidad" />}
                    isOptionEqualToValue={(option, value) => option.id_calidad === value.id_calidad}
                    disabled={!productoSeleccionado}
                  />
                  <IconButton
                    color="primary"
                    onClick={() => setOpenCalidadDialog(true)}
                    sx={{ mt: 1 }}
                  >
                    <Iconify icon="mingcute:add-line" width={24} height={24} />
                  </IconButton>
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    label="Precio de Venta"
                    type="number"
                    value={precioVenta}
                    onChange={(e) => setPrecioVenta(parseFloat(e.target.value) || 0)}
                    fullWidth
                    disabled={!productoSeleccionado}
                    InputProps={{
                      startAdornment: <span style={{ marginRight: 8 }}>Bs.</span>,
                    }}
                  />

                  <TextField
                    label="Stock"
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(parseInt(e.target.value) || 0)}
                    fullWidth
                    disabled={!productoSeleccionado}
                  />
                </Box>

                <Button
                  variant="outlined"
                  onClick={handleAgregarCalidad}
                  startIcon={<Iconify icon="mingcute:add-line" />}
                  fullWidth
                  disabled={!productoSeleccionado}
                >
                  Agregar Calidad
                </Button>
              </Stack>
            </Box>

            {/* Tabla de Calidades Agregadas */}
            {calidadesAsignadas.length > 0 && (
              <Paper variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Calidad</TableCell>
                      <TableCell align="center">Precio</TableCell>
                      <TableCell align="center">Stock</TableCell>
                      <TableCell align="center">Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {calidadesAsignadas.map((ca) => (
                      <TableRow key={ca.calidad.id_calidad}>
                        <TableCell>{ca.calidad.nombre_calidad}</TableCell>
                        <TableCell align="center">Bs. {ca.precio_venta}</TableCell>
                        <TableCell align="center">{ca.stock}</TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={() => handleEliminarCalidad(ca.calidad.id_calidad)}
                          >
                            <Iconify icon="solar:trash-bin-trash-bold" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={!productoSeleccionado}>
            Guardar Calidades
          </Button>
        </DialogActions>
      </Dialog>

      <CalidadFormDialog
        open={openCalidadDialog}
        onClose={handleCloseCalidadDialog}
        titulo="Nueva Calidad"
      />

      <ProductoBasicoFormDialog
        open={openProductoBasicoDialog}
        onClose={handleCloseProductoBasicoDialog}
        titulo="Nuevo Producto"
      />
    </>
  );
}