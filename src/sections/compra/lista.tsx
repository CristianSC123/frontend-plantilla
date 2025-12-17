import { useState, useEffect } from 'react';
import {
  Table,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
  Paper,
  TableContainer,
  IconButton,
  Chip,
  Typography,
  Box,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import axios from 'axios';
import { Iconify } from 'src/components/iconify';
import { CompraFormData } from './view/CompraFormData';
import { MessageSnackbar } from 'src/components/alerts/MessageSnackbar';

interface DetalleCompra {
  id_detalle: string;
  cantidad: number;
  precioCompra: number;
  subtotal: number;
  productoCalidad: {
    producto: {
      nombre_producto: string;
      marca: {
        nombre_marca: string;
      };
    };
    calidad: {
      nombre_calidad: string;
    };
  };
}

export interface CompraProps {
  id_compra: string;
  fecha: string;
  total: number;
  estado: string;
  id_usuario: string;
  id_proveedor: string;
  proveedor: {
    nombre_proveedor: string;
    telefono?: string;
  };
  detalles: DetalleCompra[];
}

interface BasicTableProps {
  openForm: boolean;
  onOpenForm: () => void;
  onCloseForm: () => void;
}

interface DetalleDialogProps {
  open: boolean;
  onClose: () => void;
  detalles: DetalleCompra[];
  proveedor?: {
    nombre_proveedor: string;
    telefono?: string;
  };
  total: number;
}

function DetallesDialog({ open, onClose, detalles, proveedor, total }: DetalleDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Detalles de la Compra</DialogTitle>
      <DialogContent>
        {proveedor && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              Proveedor:
            </Typography>
            <Typography variant="body2">{proveedor.nombre_proveedor}</Typography>
            {proveedor.telefono && (
              <Typography variant="body2" color="text.secondary">
                Teléfono: {proveedor.telefono}
              </Typography>
            )}
          </Box>
        )}

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Producto</TableCell>
                <TableCell align="center">Calidad</TableCell>
                <TableCell align="center">Cantidad</TableCell>
                <TableCell align="right">Precio Compra (Bs)</TableCell>
                <TableCell align="right">Subtotal (Bs)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {detalles.map((detalle) => (
                <TableRow key={detalle.id_detalle}>
                  <TableCell>{detalle.productoCalidad.producto.nombre_producto}</TableCell>
                  <TableCell align="center">
                    {detalle.productoCalidad.calidad.nombre_calidad}
                  </TableCell>
                  <TableCell align="center">{detalle.cantidad}</TableCell>
                  <TableCell align="right">{detalle.precioCompra.toFixed(2)}</TableCell>
                  <TableCell align="right">{detalle.subtotal.toFixed(2)}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={4} align="right">
                  <Typography variant="subtitle1" fontWeight="bold">
                    Total:
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="subtitle1" fontWeight="bold" color="primary">
                    Bs {total.toFixed(2)}
                  </Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
}

export default function ComprasList({ openForm, onOpenForm, onCloseForm }: BasicTableProps) {
  const [compras, setCompras] = useState<CompraProps[]>([]);
  const [detallesDialogOpen, setDetallesDialogOpen] = useState(false);
  const [detallesSeleccionados, setDetallesSeleccionados] = useState<DetalleCompra[]>([]);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState<
    | {
        nombre_proveedor: string;
        telefono?: string;
      }
    | undefined
  >(undefined);
  const [totalSeleccionado, setTotalSeleccionado] = useState<number>(0);

  // Para mensajes Snackbar
  const [msgOpen, setMsgOpen] = useState(false);
  const [msg, setMsg] = useState('');
  const [severity, setSeverity] = useState<'success' | 'error'>('success');

  const obtenerCompras = async () => {
    try {
      const response = await axios.get('http://localhost:3000/compras');

      setCompras(response.data || []);
      console.log('Compras obtenidas:', response.data);
    } catch (error) {
      console.error('Error obteniendo compras:', error);
      setMsg('Error obteniendo compras');
      setSeverity('error');
      setMsgOpen(true);
    }
  };

  useEffect(() => {
    obtenerCompras();
  }, []);

  const handleCreate = () => {
    onOpenForm();
  };

  const handleCloseFormInternal = () => {
    onCloseForm();
    obtenerCompras();
    setMsg('Compra registrada exitosamente');
    setSeverity('success');
    setMsgOpen(true);
  };

  const handleVerDetalles = (compra: CompraProps) => {
    setDetallesSeleccionados(compra.detalles);
    setProveedorSeleccionado(compra.proveedor);
    setTotalSeleccionado(compra.total);
    setDetallesDialogOpen(true);
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString('es-BO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getEstadoColor = (estado: string): 'success' | 'warning' | 'error' | 'default' => {
    switch (estado.toLowerCase()) {
      case 'completado':
        return 'success';
      case 'pendiente':
        return 'warning';
      case 'cancelado':
        return 'error';
      default:
        return 'default';
    }
  };

  const getEstadoTexto = (estado: string): string => {
    switch (estado.toLowerCase()) {
      case 'completado':
        return 'COMPLETADO';
      case 'pendiente':
        return 'PENDIENTE';
      case 'cancelado':
        return 'CANCELADO';
      default:
        return estado.toUpperCase();
    }
  };

  return (
    <>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Compras</Typography>
      </Box>

      <TableContainer component={Paper} sx={{ mb: 2 }}>
        <Table sx={{ minWidth: 650 }} aria-label="tabla compras">
          <TableHead>
            <TableRow>
              <TableCell align="center">ID</TableCell>
              <TableCell align="center">Fecha</TableCell>
              <TableCell align="center">Proveedor</TableCell>
              <TableCell align="center">Total (Bs)</TableCell>
              <TableCell align="center">Estado</TableCell>
              <TableCell align="center">Productos</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {compras.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Iconify icon="solar:box-bold" width={48} color="text.disabled" />
                  <Typography color="text.secondary" mt={2}>
                    No hay compras registradas
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              compras.map((compra) => (
                <TableRow key={compra.id_compra}>
                  <TableCell align="center">
                    <Typography
                      variant="body2"
                      sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
                    >
                      {compra.id_compra.slice(0, 8)}...
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2">{formatearFecha(compra.fecha)}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2">
                      {compra.proveedor?.nombre_proveedor || 'Sin proveedor'}
                    </Typography>
                    {compra.proveedor?.telefono && (
                      <Typography variant="caption" color="text.secondary">
                        {compra.proveedor.telefono}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="h6" color="primary">
                      Bs {compra.total.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={getEstadoTexto(compra.estado)}
                      color={getEstadoColor(compra.estado)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Stack spacing={0.5}>
                      {compra.detalles.map((detalle) => (
                        <Typography key={detalle.id_detalle} variant="caption">
                          {detalle.cantidad}x {detalle.productoCalidad.producto.nombre_producto}(
                          {detalle.productoCalidad.calidad.nombre_calidad})
                        </Typography>
                      ))}
                    </Stack>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="large"
                      onClick={() => handleVerDetalles(compra)}
                      color="primary"
                      title="Ver detalles"
                    >
                      <Iconify icon="solar:eye-bold" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <IconButton
        color="primary"
        onClick={handleCreate}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          bgcolor: 'primary.main',
          color: 'white',
          width: 56,
          height: 56,
          '&:hover': {
            bgcolor: 'primary.dark',
          },
        }}
        size="large"
        aria-label="Nueva Compra"
      >
        <Iconify icon="mingcute:add-line" width={32} height={32} />
      </IconButton>

      <CompraFormData open={openForm} onClose={handleCloseFormInternal} />

      <DetallesDialog
        open={detallesDialogOpen}
        onClose={() => setDetallesDialogOpen(false)}
        detalles={detallesSeleccionados}
        proveedor={proveedorSeleccionado}
        total={totalSeleccionado}
      />

      <MessageSnackbar
        open={msgOpen}
        onClose={() => setMsgOpen(false)}
        message={msg}
        severity={severity}
      />
    </>
  );
}
