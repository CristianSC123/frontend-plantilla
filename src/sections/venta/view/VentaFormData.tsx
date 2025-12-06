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
  Box,
  Typography,
  IconButton,
  Card,
  CardContent,
  Divider,
  Autocomplete,
  GridLegacy as Grid,
  Chip,
  Avatar,
  Alert,
} from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { TecnicoFormDialog, TecnicoProps } from 'src/sections/tecnico/view/TecnicoFormData';

interface ProductoCalidad {
  id_producto_calidad: string;
  precio_venta: number;
  stock: number;
  producto: {
    id_producto: string;
    nombre_producto: string;
    marca: {
      id_marca: string;
      nombre_marca: string;
    };
  };
  calidad: {
    id_calidad: string;
    nombre_calidad: string;
  };
}

interface CarritoItem {
  id_producto_calidad: string;
  nombre: string;
  marca: string;
  calidad: string;
  precio: number;
  cantidad: number;
  stock: number;
  subtotal: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export function VentaFormData({ open, onClose }: Props) {
  const [productos, setProductos] = useState<ProductoCalidad[]>([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState<ProductoCalidad | null>(null);
  const [tecnicos, setTecnicos] = useState<TecnicoProps[]>([]);
  const [tecnicoSeleccionado, setTecnicoSeleccionado] = useState<TecnicoProps | null>(null);
  const [cantidad, setCantidad] = useState<number>(1);
  const [carrito, setCarrito] = useState<CarritoItem[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openTecnicoDialog, setOpenTecnicoDialog] = useState(false);

  useEffect(() => {
    if (open) {
      obtenerProductos();
      obtenerTecnicos();
      setCarrito([]);
      setProductoSeleccionado(null);
      setTecnicoSeleccionado(null);
      setCantidad(1);
      setError('');
    }
  }, [open]);

  const obtenerProductos = async () => {
    try {
      const response = await axios.get('http://localhost:3000/productos');

      // Aplanar la estructura: convertir productos con calidades en lista de ProductoCalidad
      const productosAplanados: ProductoCalidad[] = [];

      response.data.forEach((producto: any) => {
        producto.calidades.forEach((calidad: any) => {
          productosAplanados.push({
            id_producto_calidad: calidad.id_producto_calidad,
            precio_venta: calidad.precio_venta,
            stock: calidad.stock,
            producto: {
              id_producto: producto.id_producto,
              nombre_producto: producto.nombre_producto,
              marca: producto.marca,
            },
            calidad: calidad.calidad,
          });
        });
      });

      // Filtrar solo productos con stock
      const productosConStock = productosAplanados.filter((p) => p.stock > 0);
      setProductos(productosConStock);
    } catch (error) {
      console.error('Error obteniendo productos:', error);
      setError('Error al cargar productos');
    }
  };

  const obtenerTecnicos = async () => {
    try {
      const response = await axios.get('http://localhost:3000/tecnicos');
      setTecnicos(response.data);
    } catch (error) {
      console.error('Error obteniendo técnicos:', error);
      setError('Error al cargar técnicos');
    }
  };

  const handleCloseTecnicoDialog = () => {
    setOpenTecnicoDialog(false);
    obtenerTecnicos();
  };

  const agregarAlCarrito = () => {
    if (!productoSeleccionado) return;

    const itemExistente = carrito.find(
      (item) => item.id_producto_calidad === productoSeleccionado.id_producto_calidad
    );

    if (itemExistente) {
      const nuevaCantidad = itemExistente.cantidad + cantidad;
      if (nuevaCantidad > productoSeleccionado.stock) {
        setError(`Stock insuficiente. Disponible: ${productoSeleccionado.stock}`);
        return;
      }

      setCarrito(
        carrito.map((item) =>
          item.id_producto_calidad === productoSeleccionado.id_producto_calidad
            ? {
                ...item,
                cantidad: nuevaCantidad,
                subtotal: nuevaCantidad * item.precio,
              }
            : item
        )
      );
    } else {
      if (cantidad > productoSeleccionado.stock) {
        setError(`Stock insuficiente. Disponible: ${productoSeleccionado.stock}`);
        return;
      }

      const nuevoItem: CarritoItem = {
        id_producto_calidad: productoSeleccionado.id_producto_calidad,
        nombre: productoSeleccionado.producto.nombre_producto,
        marca: productoSeleccionado.producto.marca.nombre_marca,
        calidad: productoSeleccionado.calidad.nombre_calidad,
        precio: productoSeleccionado.precio_venta,
        cantidad,
        stock: productoSeleccionado.stock,
        subtotal: cantidad * productoSeleccionado.precio_venta,
      };

      setCarrito([...carrito, nuevoItem]);
    }

    setProductoSeleccionado(null);
    setCantidad(1);
    setBusqueda('');
    setError('');
  };

  const eliminarDelCarrito = (id_producto_calidad: string) => {
    setCarrito(carrito.filter((item) => item.id_producto_calidad !== id_producto_calidad));
  };

  const actualizarCantidad = (id_producto_calidad: string, nuevaCantidad: number) => {
    if (nuevaCantidad < 1) return;

    const item = carrito.find((i) => i.id_producto_calidad === id_producto_calidad);
    if (!item) return;

    if (nuevaCantidad > item.stock) {
      setError(`Stock insuficiente. Disponible: ${item.stock}`);
      return;
    }

    setCarrito(
      carrito.map((item) =>
        item.id_producto_calidad === id_producto_calidad
          ? {
              ...item,
              cantidad: nuevaCantidad,
              subtotal: nuevaCantidad * item.precio,
            }
          : item
      )
    );
    setError('');
  };

  const calcularTotal = () => {
    return carrito.reduce((total, item) => total + item.subtotal, 0);
  };

  const handleSubmit = async () => {
    if (carrito.length === 0) {
      setError('Agrega al menos un producto al carrito');
      return;
    }

    setLoading(true);
    try {
      const detalles = carrito.map((item) => ({
        id_producto_calidad: item.id_producto_calidad,
        cantidad: item.cantidad,
        precioUnitario: item.precio,
      }));

      await axios.post('http://localhost:3000/ventas', {
        detalles,
        id_tecnico: tecnicoSeleccionado ? tecnicoSeleccionado.id_tecnico : null,
        id_usuario: localStorage.getItem('id_usuario'),
      });

      onClose();
    } catch (error: any) {
      console.error('Error creando venta:', error);
      setError(error.response?.data?.message || 'Error al crear la venta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <Iconify icon="solar:cart-3-bold" width={28} />
            <Typography variant="h5">Nueva Venta</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {error && (
              <Alert severity="error" onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            {/* Buscador de productos */}
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Técnico
                </Typography>
                <Stack>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                    <Autocomplete
                      options={tecnicos}
                      value={tecnicoSeleccionado}
                      onChange={(_, newValue) => setTecnicoSeleccionado(newValue)}
                      getOptionLabel={(option) => option.nombres + ' ' + option.apellidos} // mostrar nombre completo
                      renderOption={(props, option) => (
                        <Box component="li" {...props}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                              <Iconify icon="solar:user-bold" width={20} />
                            </Avatar>
                            <Box>
                              <Typography variant="body2">
                                {option.nombres + ' ' + option.apellidos}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {option.codigo} • {option.telefono}
                              </Typography>
                            </Box>
                          </Stack>
                        </Box>
                      )}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Selecciona un técnico..."
                          placeholder="Escribe para buscar"
                        />
                      )}
                      fullWidth
                    />
                    <IconButton
                      color="primary"
                      onClick={() => setOpenTecnicoDialog(true)}
                      sx={{ mt: 1 }}
                    >
                      <Iconify icon="mingcute:add-line" width={24} height={24} />
                    </IconButton>
                  </Box>
                </Stack>
              </CardContent>

              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Buscar Producto
                </Typography>
                <Grid container spacing={2} alignItems="flex-end">
                  <Grid item xs={20} md={6}>
                    <Autocomplete
                      options={productos}
                      value={productoSeleccionado}
                      onChange={(_, newValue) => setProductoSeleccionado(newValue)}
                      inputValue={busqueda}
                      onInputChange={(_, newValue) => setBusqueda(newValue)}
                      getOptionLabel={(option) =>
                        `${option.producto.nombre_producto} - ${option.producto.marca.nombre_marca} (${option.calidad.nombre_calidad})`
                      }
                      renderOption={(props, option) => (
                        <Box component="li" {...props}>
                          <Stack direction="row" spacing={1} width="100%">
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                              <Iconify icon="solar:box-bold" />
                            </Avatar>
                            <Box flex={1}>
                              <Typography variant="body2">
                                {option.producto.nombre_producto}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {option.producto.marca.nombre_marca} -{' '}
                                {option.calidad.nombre_calidad}
                              </Typography>
                              <Typography variant="caption" color="primary" display="block">
                                Bs {option.precio_venta} | Stock: {option.stock}
                              </Typography>
                            </Box>
                          </Stack>
                        </Box>
                      )}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Buscar producto..."
                          placeholder="Escribe para buscar"
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      label="Cantidad"
                      type="number"
                      value={cantidad}
                      onChange={(e) => setCantidad(Math.max(1, parseInt(e.target.value) || 1))}
                      fullWidth
                      InputProps={{ inputProps: { min: 1 } }}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={agregarAlCarrito}
                      disabled={!productoSeleccionado}
                      startIcon={<Iconify icon="solar:add-circle-bold" />}
                    >
                      Agregar
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Carrito */}
            <Card variant="outlined">
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">
                    Carrito ({carrito.length} {carrito.length === 1 ? 'producto' : 'productos'})
                  </Typography>
                  {carrito.length > 0 && (
                    <Button
                      size="small"
                      color="error"
                      onClick={() => setCarrito([])}
                      startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
                    >
                      Vaciar
                    </Button>
                  )}
                </Box>

                {carrito.length === 0 ? (
                  <Box textAlign="center" py={4}>
                    <Iconify
                      icon="solar:cart-large-2-bold-duotone"
                      width={64}
                      color="text.disabled"
                    />
                    <Typography color="text.secondary" mt={2}>
                      El carrito está vacío
                    </Typography>
                  </Box>
                ) : (
                  <Stack spacing={1}>
                    {carrito.map((item) => (
                      <Card key={item.id_producto_calidad} variant="outlined">
                        <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                          <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={5}>
                              <Typography variant="subtitle2">{item.nombre}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {item.marca} • {item.calidad}
                              </Typography>
                            </Grid>
                            <Grid item xs={4} sm={2}>
                              <Typography variant="body2" color="primary">
                                Bs {item.precio.toFixed(2)}
                              </Typography>
                            </Grid>
                            <Grid item xs={4} sm={3}>
                              <Box
                                display="flex"
                                alignItems="center"
                                gap={0.5}
                                justifyContent="center"
                              >
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    actualizarCantidad(item.id_producto_calidad, item.cantidad - 1)
                                  }
                                >
                                  <Iconify icon="solar:minus-circle-bold" />
                                </IconButton>
                                <Chip label={item.cantidad} size="small" />
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    actualizarCantidad(item.id_producto_calidad, item.cantidad + 1)
                                  }
                                >
                                  <Iconify icon="solar:add-circle-bold" />
                                </IconButton>
                              </Box>
                            </Grid>
                            <Grid item xs={3} sm={1.5}>
                              <Typography variant="subtitle2" align="right">
                                Bs {item.subtotal.toFixed(2)}
                              </Typography>
                            </Grid>
                            <Grid item xs={1} sm={0.5}>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => eliminarDelCarrito(item.id_producto_calidad)}
                              >
                                <Iconify icon="solar:trash-bin-trash-bold" />
                              </IconButton>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    ))}

                    <Divider sx={{ my: 2 }} />

                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="h5">Total:</Typography>
                      <Typography variant="h4" color="primary">
                        Bs {calcularTotal().toFixed(2)}
                      </Typography>
                    </Box>
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={carrito.length === 0 || loading}
            startIcon={<Iconify icon="solar:check-circle-bold" />}
          >
            {loading ? 'Procesando...' : 'Confirmar Venta'}
          </Button>
        </DialogActions>
      </Dialog>
      <TecnicoFormDialog
        open={openTecnicoDialog}
        onClose={handleCloseTecnicoDialog}
        titulo="Nuevo Técnico"
      ></TecnicoFormDialog>
    </>
  );
}
