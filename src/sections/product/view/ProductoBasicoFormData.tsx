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
  Autocomplete,
  IconButton,
  Box,
} from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { MarcaFormDialog } from './MarcaFormData';

interface Marca {
  id_marca: string;
  nombre_marca: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  titulo: string;
  onSuccess?: () => void;
}

export function ProductoBasicoFormDialog({ open, onClose, titulo, onSuccess }: Props) {
  const [nombreProducto, setNombreProducto] = useState<string>('');
  const [marcaSeleccionada, setMarcaSeleccionada] = useState<Marca | null>(null);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [openMarcaDialog, setOpenMarcaDialog] = useState(false);

  useEffect(() => {
    if (open) {
      obtenerMarcas();
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      setNombreProducto('');
      setMarcaSeleccionada(null);
    }
  }, [open]);

  const obtenerMarcas = async () => {
    try {
      const response = await axios.get('http://localhost:3000/marcas');
      setMarcas(response.data);
    } catch (error) {
      console.error('Error obteniendo marcas:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!nombreProducto.trim()) {
        alert('Debe ingresar un nombre de producto');
        return;
      }

      if (!marcaSeleccionada) {
        alert('Debe seleccionar una marca');
        return;
      }

      const payload = {
        nombre_producto: nombreProducto,
        marca: { id_marca: marcaSeleccionada.id_marca },
      };

      await axios.post('http://localhost:3000/productos', payload);

      setNombreProducto('');
      setMarcaSeleccionada(null);
      onClose();
      onSuccess?.();
    } catch (error) {
      console.error('Error guardando producto básico:', error);
      alert('Error al guardar el producto');
    }
  };

  const handleCloseMarcaDialog = () => {
    setOpenMarcaDialog(false);
    obtenerMarcas();
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
        <DialogTitle>{titulo}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
              <Autocomplete
                fullWidth
                options={marcas}
                getOptionLabel={(option) => option.nombre_marca}
                value={marcaSeleccionada}
                onChange={(_, newValue) => setMarcaSeleccionada(newValue)}
                renderInput={(params) => <TextField {...params} label="Marca" />}
                isOptionEqualToValue={(option, value) => option.id_marca === value.id_marca}
              />
              <IconButton
                color="primary"
                onClick={() => setOpenMarcaDialog(true)}
                sx={{ mt: 1 }}
              >
                <Iconify icon="mingcute:add-line" width={24} height={24} />
              </IconButton>
            </Box>

            <TextField
              label="Nombre del Producto"
              value={nombreProducto}
              onChange={(e) => setNombreProducto(e.target.value)}
              fullWidth
              placeholder="Ej: Pantalla A71"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button variant="contained" onClick={handleSubmit}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      <MarcaFormDialog
        open={openMarcaDialog}
        onClose={handleCloseMarcaDialog}
        titulo="Nueva Marca"
      />
    </>
  );
}