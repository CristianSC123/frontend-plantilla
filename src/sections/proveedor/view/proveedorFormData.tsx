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
} from '@mui/material';

export interface ProveedorProps {
    id_proveedor: string;
    nombre_proveedor: string;
    correo_proveedor: string;
    telefono_proveedor: string;
    activo: boolean;
}
interface Props {
    open: boolean;
    onClose: () => void;
    proveedor?: ProveedorProps;
    titulo: string;
    onSuccess?: () => void; // Opcional: para recargar la lista luego
}

export function ProveedorFormDialog({ open, onClose, proveedor, titulo, onSuccess }: Props) {
    const [form, setForm] = useState<ProveedorProps>({
        id_proveedor: '',
        nombre_proveedor: '',
        correo_proveedor: '',
        telefono_proveedor: '',
        activo: true,
    });

    useEffect(() => {
        if (proveedor) {
            setForm(proveedor);
        } else {
            setForm({
                id_proveedor: '',
                nombre_proveedor: '',
                correo_proveedor: '',
                telefono_proveedor: '',
                activo: true,
            });
        }
    }, [proveedor, open]);

    const handleChange =
        (field: keyof ProveedorProps) =>
            (event: React.ChangeEvent<HTMLInputElement>) => {
                const value =
                    field === 'activo' ? event.target.checked : event.target.value;
                setForm((prev) => ({ ...prev, [field]: value }));
            };

    const handleSubmit = async () => {
        try {
            const payload = {
                nombre_proveedor: form.nombre_proveedor,
                correo_proveedor: form.correo_proveedor,
                telefono_proveedor: form.telefono_proveedor,
                activo: form.activo, // opcional si backend tiene default
            };

            if (form.id_proveedor) {
                // PATCH: actualizar
                await axios.patch(`http://localhost:3000/proveedores/${form.id_proveedor}`, payload);
            } else {
                // POST: crear
                await axios.post('http://localhost:3000/proveedores', payload);
            }

            onClose();
            onSuccess?.();
        } catch (error) {
            console.error('Error guardando técnico:', error);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{titulo}</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ mt: 1 }}>
                    <TextField
                        label="Nombre Completo"
                        placeholder='John Doe'
                        value={form.nombre_proveedor}
                        onChange={handleChange('nombre_proveedor')}
                        fullWidth
                    />
                    <TextField
                        label="Correo"
                        placeholder='johndoe@gmail.com'
                        value={form.correo_proveedor}
                        onChange={handleChange('correo_proveedor')}
                        fullWidth
                    />
                    <TextField
                        label="Teléfono"
                        placeholder='65673891'
                        value={form.telefono_proveedor}
                        onChange={handleChange('telefono_proveedor')}
                        fullWidth
                    />
                    {form.id_proveedor && (
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
