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
import { ProveedorFormDialog } from 'src/sections/proveedor/view/proveedorFormData';

interface ProductoCalidad {
  id_producto_calidad: string;
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

interface Proveedor {
  id_proveedor: string;
  nombre_proveedor: string;
  telefono?: string;
  email?: string;
  direccion?: string;
}

interface CarritoItem {
  id_producto_calidad: string;
  nombre: string;
  marca: string;
  calidad: string;
  precioCompra: number;
  cantidad: number;
  subtotal: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CompraFormData({ open, onClose }: Props) {
  const [productos, setProductos] = useState<ProductoCalidad[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState<ProductoCalidad | null>(null);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState<Proveedor | null>(null);
  const [cantidad, setCantidad] = useState<number>(1);
  const [precioCompra, setPrecioCompra] = useState<number>(0);
  const [carrito, setCarrito] = useState<CarritoItem[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openProveedorDialog, setOpenProveedorDialog] = useState(false);

  useEffect(() => {
    if (open) {
      obtenerProductos();
      obtenerProveedores();
      setCarrito([]);
      setProductoSeleccionado(null);
      setProveedorSeleccionado(null);
      setCantidad(1);
      setPrecioCompra(0);
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
            producto: {
              id_producto: producto.id_producto,
              nombre_producto: producto.nombre_producto,
              marca: producto.marca,
            },
            calidad: calidad.calidad,
          });
        });
      });

      setProductos(productosAplanados);
    } catch (error) {
      console.error('Error obteniendo productos:', error);
      setError('Error al cargar productos');
    }
  };

  const obtenerProveedores = async () => {
    try {
      const response = await axios.get('http://localhost:3000/proveedores');
      setProveedores(response.data);
    } catch (error) {
      console.error('Error obteniendo proveedores:', error);
      setError('Error al cargar proveedores');
    }
  };

  const handleCloseProveedorDialog = () => {
    setOpenProveedorDialog(false);
    obtenerProveedores();
  };

  useEffect(() => {
    // Cuando se selecciona un producto, sugerir un precio
    if (productoSeleccionado) {
      // Aquí podrías implementar lógica para sugerir precio basado en historial
      // Por ahora lo dejamos en 0 para que el usuario ingrese manualmente
      setPrecioCompra(0);
    }
  }, [productoSeleccionado]);

  const agregarAlCarrito = () => {
    if (!productoSeleccionado) {
      setError('Selecciona un producto');
      return;
    }

    if (precioCompra <= 0) {
      setError('Ingresa un precio de compra válido');
      return;
    }

    if (cantidad <= 0) {
      setError('Ingresa una cantidad válida');
      return;
    }

    const itemExistente = carrito.find(
      (item) => item.id_producto_calidad === productoSeleccionado.id_producto_calidad
    );

    if (itemExistente) {
      // Actualizar si ya existe en el carrito
      setCarrito(
        carrito.map((item) =>
          item.id_producto_calidad === productoSeleccionado.id_producto_calidad
            ? {
                ...item,
                cantidad: item.cantidad + cantidad,
                precioCompra: precioCompra, // Actualizar con nuevo precio
                subtotal: (item.cantidad + cantidad) * precioCompra,
              }
            : item
        )
      );
    } else {
      const nuevoItem: CarritoItem = {
        id_producto_calidad: productoSeleccionado.id_producto_calidad,
        nombre: productoSeleccionado.producto.nombre_producto,
        marca: productoSeleccionado.producto.marca.nombre_marca,
        calidad: productoSeleccionado.calidad.nombre_calidad,
        precioCompra,
        cantidad,
        subtotal: cantidad * precioCompra,
      };

      setCarrito([...carrito, nuevoItem]);
    }

    setProductoSeleccionado(null);
    setCantidad(1);
    setPrecioCompra(0);
    setBusqueda('');
    setError('');
  };

  const eliminarDelCarrito = (id_producto_calidad: string) => {
    setCarrito(carrito.filter((item) => item.id_producto_calidad !== id_producto_calidad));
  };

  const actualizarCantidad = (id_producto_calidad: string, nuevaCantidad: number) => {
    if (nuevaCantidad < 1) return;

    setCarrito(
      carrito.map((item) =>
        item.id_producto_calidad === id_producto_calidad
          ? {
              ...item,
              cantidad: nuevaCantidad,
              subtotal: nuevaCantidad * item.precioCompra,
            }
          : item
      )
    );
  };

  const actualizarPrecio = (id_producto_calidad: string, nuevoPrecio: number) => {
    if (nuevoPrecio < 0) return;

    setCarrito(
      carrito.map((item) =>
        item.id_producto_calidad === id_producto_calidad
          ? {
              ...item,
              precioCompra: nuevoPrecio,
              subtotal: item.cantidad * nuevoPrecio,
            }
          : item
      )
    );
  };

  const calcularTotal = () => {
    return carrito.reduce((total, item) => total + item.subtotal, 0);
  };

  const handleSubmit = async () => {
    if (carrito.length === 0) {
      setError('Agrega al menos un producto al carrito');
      return;
    }

    if (!proveedorSeleccionado) {
      setError('Selecciona un proveedor');
      return;
    }

    setLoading(true);
    try {
      const detalles = carrito.map((item) => ({
        id_producto_calidad: item.id_producto_calidad,
        cantidad: item.cantidad,
        precioCompra: item.precioCompra,
      }));

      const compraData = {
        estado: "Completado",
        id_proveedor: proveedorSeleccionado.id_proveedor,
        id_usuario: localStorage.getItem('id_usuario'),
        detalles: detalles
      };

      await axios.post('http://localhost:3000/compras', compraData);

      onClose();
    } catch (error: any) {
      console.error('Error creando compra:', error);
      setError(error.response?.data?.message || 'Error al crear la compra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <Iconify icon="solar:shopping-cart-2-bold" width={28} />
            <Typography variant="h5">Nueva Compra</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {error && (
              <Alert severity="error" onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            {/* Selección de proveedor */}
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Proveedor
                </Typography>
                <Stack>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                    <Autocomplete
                      options={proveedores}
                      value={proveedorSeleccionado}
                      onChange={(_, newValue) => setProveedorSeleccionado(newValue)}
                      getOptionLabel={(option) => option.nombre_proveedor}
                      renderOption={(props, option) => (
                        <Box component="li" {...props}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                              <Iconify icon="solar:users-group-two-rounded-bold" width={20} />
                            </Avatar>
                            <Box>
                              <Typography variant="body2">
                                {option.nombre_proveedor}
                              </Typography>
                              {option.telefono && (
                                <Typography variant="caption" color="text.secondary">
                                  {option.telefono}
                                </Typography>
                              )}
                            </Box>
                          </Stack>
                        </Box>
                      )}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Selecciona un proveedor..."
                          placeholder="Escribe para buscar"
                          required
                        />
                      )}
                      fullWidth
                    />
                    <IconButton
                      color="primary"
                      onClick={() => setOpenProveedorDialog(true)}
                      sx={{ mt: 1 }}
                    >
                      <Iconify icon="mingcute:add-line" width={24} height={24} />
                    </IconButton>
                  </Box>
                </Stack>
              </CardContent>

              {/* Buscador de productos */}
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Agregar Producto
                </Typography>
                <Grid container spacing={2} alignItems="flex-end">
                  <Grid item xs={12} md={4}>
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
                  <Grid item xs={6} md={2}>
                    <TextField
                      label="Cantidad"
                      type="number"
                      value={cantidad}
                      onChange={(e) => setCantidad(Math.max(1, parseInt(e.target.value) || 1))}
                      fullWidth
                      InputProps={{ inputProps: { min: 1 } }}
                    />
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <TextField
                      label="Precio Compra (Bs)"
                      type="number"
                      value={precioCompra}
                      onChange={(e) => setPrecioCompra(parseFloat(e.target.value) || 0)}
                      fullWidth
                      InputProps={{ inputProps: { min: 0, step: 1 } }}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={agregarAlCarrito}
                      disabled={!productoSeleccionado || precioCompra <= 0}
                      startIcon={<Iconify icon="solar:add-circle-bold" />}
                    >
                      Agregar
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Carrito de compras */}
            <Card variant="outlined">
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">
                    Carrito de Compras ({carrito.length} {carrito.length === 1 ? 'producto' : 'productos'})
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
                      El carrito de compras está vacío
                    </Typography>
                  </Box>
                ) : (
                  <Stack spacing={1}>
                    {carrito.map((item) => (
                      <Card key={item.id_producto_calidad} variant="outlined">
                        <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                          <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={4}>
                              <Typography variant="subtitle2">{item.nombre}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {item.marca} • {item.calidad}
                              </Typography>
                            </Grid>
                            <Grid item xs={6} sm={2}>
                              <TextField
                                label="Precio"
                                type="number"
                                value={item.precioCompra}
                                onChange={(e) => 
                                  actualizarPrecio(item.id_producto_calidad, parseFloat(e.target.value) || 0)
                                }
                                size="small"
                                fullWidth
                                InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                              />
                            </Grid>
                            <Grid item xs={6} sm={2}>
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
                            <Grid item xs={6} sm={2}>
                              <Typography variant="subtitle2" align="right" color="primary">
                                Bs {item.subtotal.toFixed(2)}
                              </Typography>
                            </Grid>
                            <Grid item xs={6} sm={1}>
                              <Typography variant="caption" align="right">
                                Bs {item.precioCompra.toFixed(2)} c/u
                              </Typography>
                            </Grid>
                            <Grid item xs={1}>
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
                      <Typography variant="h5">Total de la Compra:</Typography>
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
            disabled={carrito.length === 0 || !proveedorSeleccionado || loading}
            startIcon={<Iconify icon="solar:check-circle-bold" />}
          >
            {loading ? 'Procesando...' : 'Registrar Compra'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialog para agregar nuevo proveedor */}
      <ProveedorFormDialog
        open={openProveedorDialog}
        onClose={handleCloseProveedorDialog}
        titulo="Nuevo Proveedor"
      />
    </>
  );
}