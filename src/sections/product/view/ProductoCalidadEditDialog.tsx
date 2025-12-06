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
  Chip,
} from '@mui/material';

interface Calidad {
  id_calidad: string;
  nombre_calidad: string;
}

interface ProductoCalidad {
  id_producto_calidad: string;
  id_producto: string;
  precio_venta: number;
  stock: number;
  calidad: Calidad;
}

interface Props {
  open: boolean;
  onClose: () => void;
  productoCalidad: ProductoCalidad | null;
  titulo: string;
}

export function ProductoCalidadEditDialog({ open, onClose, productoCalidad, titulo }: Props) {
  const [precioVenta, setPrecioVenta] = useState<number>(0);
  const [stock, setStock] = useState<number>(0);

  useEffect(() => {
    if (productoCalidad) {
      setPrecioVenta(productoCalidad.precio_venta);
      setStock(productoCalidad.stock);
    }
  }, [productoCalidad, open]);

  const handleSubmit = async () => {
    try {
      if (!productoCalidad) {
        alert('No hay producto seleccionado');
        return;
      }

      // Validación de IDs antes de enviar al backend
      if (!productoCalidad.id_producto || !productoCalidad.calidad.id_calidad) {
        alert('Faltan datos de identificación del producto o calidad');
        return;
      }

      const payload = {
        precio_venta: precioVenta,
        stock: stock,
      };

      await axios.patch(
        `http://localhost:3000/productos/actualizar-calidad/${productoCalidad.id_producto_calidad}`,
        payload
      );

      onClose();
    } catch (error) {
      console.error('Error actualizando calidad:', error);
      alert('Error al actualizar la calidad del producto');
    }
  };

  if (!productoCalidad) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{titulo}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {/* Información de solo lectura */}
          <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
              Calidad (No editable)
            </Typography>
            <Chip label={productoCalidad.calidad.nombre_calidad} size="small" color="default" />
          </Box>

          {/* Campos editables */}
          <TextField
            label="Precio de Venta"
            type="number"
            value={precioVenta}
            onChange={(e) => setPrecioVenta(parseFloat(e.target.value) || 0)}
            fullWidth
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
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Guardar Cambios
        </Button>
      </DialogActions>
    </Dialog>
  );
}
