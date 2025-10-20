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
} from '@mui/material';

export interface ArticuloFormData {
  nombre: string;
  descripcion: string;
  sigla: string;
  stock: number;
  precio: number;
  imagen?: File | null; // ahora es archivo
}

interface Props {
  open: boolean;
  onClose: () => void;
  articulo?: (Omit<ArticuloFormData, 'imagen'> & { id?: number; imagen?: string });
  titulo: string;
}

export function ArticuloFormDialog({ open, onClose, articulo, titulo }: Props) {
  const [form, setForm] = useState<ArticuloFormData>({
    nombre: '',
    descripcion: '',
    sigla: '',
    stock: 0,
    precio: 0,
    imagen: null,
  });

  useEffect(() => {
    if (articulo) {
      setForm({
        nombre: articulo.nombre || '',
        descripcion: articulo.descripcion || '',
        sigla: articulo.sigla || '',
        stock: articulo.stock || 0,
        precio: articulo.precio || 0,
        imagen: null, // en edición no precargamos archivo
      });
    } else {
      setForm({
        nombre: '',
        descripcion: '',
        sigla: '',
        stock: 0,
        precio: 0,
        imagen: null,
      });
    }
  }, [articulo, open]);

  const handleChange =
    (field: keyof Omit<ArticuloFormData, 'imagen'>) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value =
        field === 'stock' || field === 'precio'
          ? Number(event.target.value)
          : event.target.value;
      setForm((prev) => ({ ...prev, [field]: value }));
    };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setForm((prev) => ({ ...prev, imagen: file }));
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append('nombre', form.nombre);
      formData.append('descripcion', form.descripcion);
      formData.append('sigla', form.sigla);
      formData.append('stock', String(form.stock));
      formData.append('precio', String(form.precio));

      if (form.imagen) {
        formData.append('imagen', form.imagen);
      }

      if (articulo?.id) {
        await axios.put(`http://localhost:3000/articulos/${articulo.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await axios.post('http://localhost:3000/articulos', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      onClose();
    } catch (error) {
      console.error('Error guardando artículo:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{titulo}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Nombre" value={form.nombre} onChange={handleChange('nombre')} fullWidth />
          <TextField
            label="Descripción"
            value={form.descripcion}
            onChange={handleChange('descripcion')}
            fullWidth
            multiline
            rows={3}
          />
          <TextField label="Sigla" value={form.sigla} onChange={handleChange('sigla')} fullWidth />
          <TextField label="Stock" type="number" value={form.stock} onChange={handleChange('stock')} fullWidth />
          <TextField label="Precio" type="number" value={form.precio} onChange={handleChange('precio')} fullWidth />

          <Button variant="outlined" component="label">
            {form.imagen ? form.imagen.name : 'Seleccionar imagen'}
            <input type="file" hidden accept="image/*" onChange={handleFileChange} />
          </Button>

          {articulo?.imagen && (
            <img
              src={`http://localhost:3000${articulo.imagen}`}
              alt="Vista previa"
              style={{ width: '150px', marginTop: '10px', borderRadius: '8px' }}
            />
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
