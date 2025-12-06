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
  FormControlLabel,
  Switch,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from '@mui/material';

export interface RolProps {
  id_rol: string;
  nombre_rol: string;
}

export interface UsuarioProps {
  id_usuario?: string;
  nombres: string;
  apellidos: string;
  usuario: string;
  contrasenia: string;
  activo: boolean;
  rol: RolProps;
}

interface Props {
  open: boolean;
  onClose: () => void;
  usuario?: UsuarioProps;
  titulo: string;
  onSuccess?: () => void;
}

export function UsuarioFormDialog({ open, onClose, usuario, titulo, onSuccess }: Props) {
  const [form, setForm] = useState<UsuarioProps>({
    id_usuario: '',
    nombres: '',
    apellidos: '',
    usuario: '',
    contrasenia: '',
    activo: true,
    rol: { id_rol: '', nombre_rol: '' },
  });

  const [roles, setRoles] = useState<RolProps[]>([]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await axios.get('http://localhost:3000/roles');
        setRoles(res.data);
        console.log('Roles obtenidos:', res.data);
      } catch (error) {
        console.error('Error cargando roles:', error);
      }
    };
    fetchRoles();
  }, []);

  useEffect(() => {
    if (usuario) {
      setForm(usuario);
    } else {
      setForm({
        id_usuario: '',
        nombres: '',
        apellidos: '',
        usuario: '',
        contrasenia: '',
        activo: true,
        rol: { id_rol: '', nombre_rol: '' },
      });
    }
  }, [usuario, open]);

  const handleChange =
    (field: keyof UsuarioProps) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | { value: unknown }>) => {
      let value: any;
      if (field === 'activo' && 'checked' in event.target) {
        value = (event.target as HTMLInputElement).checked;
      } else if (field === 'rol') {
        const selectedRol = roles.find((r) => r.id_rol === event.target.value);
        value = selectedRol || { id_rol: '', nombre: '' };
      } else {
        value = event.target.value;
      }
      setForm((prev) => ({ ...prev, [field]: value }));
    };

  const handleSubmit = async () => {
    try {
      const payload = {
        nombres: form.nombres,
        apellidos: form.apellidos,
        usuario: form.usuario,
        contrasenia: form.contrasenia,
        activo: form.activo,
        id_rol: form.rol.id_rol,
      };

      if (form.id_usuario) {
        await axios.patch(`http://localhost:3000/usuarios/${form.id_usuario}`, payload);
      } else {
        await axios.post('http://localhost:3000/usuarios', payload);
      }

      onClose();
      onSuccess?.();
    } catch (error) {
      console.error('Error guardando usuario:', error);
      alert('No se pudo guardar el usuario');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{titulo}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Nombres"
            value={form.nombres}
            onChange={handleChange('nombres')}
            fullWidth
          />
          <TextField
            label="Apellidos"
            value={form.apellidos}
            onChange={handleChange('apellidos')}
            fullWidth
          />
          <TextField
            label="Usuario"
            value={form.usuario}
            onChange={handleChange('usuario')}
            fullWidth
          />
          {!form.id_usuario && (
            <TextField
              label="Contraseña"
              type="password"
              value={form.contrasenia}
              onChange={handleChange('contrasenia')}
              fullWidth
            />
          )}
          <FormControl fullWidth>
            <InputLabel id="rol-label">Rol</InputLabel>
            <Select
              labelId="rol-label"
              value={form.rol.id_rol}
              label="Rol"
              onChange={handleChange('rol')}
            >
              {roles.map((rol) => (
                <MenuItem key={rol.id_rol} value={rol.id_rol}>
                  {rol.nombre_rol}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {form.id_usuario && (
            <FormControlLabel
              control={
                <Switch
                  checked={form.activo}
                  onChange={handleChange('activo')}
                  color="primary"
                />
              }
              label="Activo"
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
