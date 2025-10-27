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

export interface TecnicoProps {
    id_tecnico?: string;
    nombres: string;
    apellidos: string;
    codigo: string;
    telefono: string;
    activo: boolean;
}

interface Props {
    open: boolean;
    onClose: () => void;
    tecnico?: TecnicoProps;
    titulo: string;
    onSuccess?: () => void; // Opcional: para recargar la lista luego
}

export function TecnicoFormDialog({ open, onClose, tecnico, titulo, onSuccess }: Props) {
    const [form, setForm] = useState<TecnicoProps>({
        id_tecnico: '',
        nombres: '',
        apellidos: '',
        codigo: '',
        telefono: '',
        activo: true,
    });

    useEffect(() => {
        if (tecnico) {
            setForm(tecnico);
        } else {
            setForm({
                id_tecnico: '',
                nombres: '',
                apellidos: '',
                codigo: '',
                telefono: '',
                activo: true,
            });
        }
    }, [tecnico, open]);

    const handleChange =
        (field: keyof TecnicoProps) =>
            (event: React.ChangeEvent<HTMLInputElement>) => {
                const value =
                    field === 'activo' ? event.target.checked : event.target.value;
                setForm((prev) => ({ ...prev, [field]: value }));
            };

    const handleSubmit = async () => {
        try {
            const payload = {
                nombres: form.nombres,
                apellidos: form.apellidos,
                codigo: form.codigo,
                telefono: form.telefono,
                activo: form.activo, // opcional si backend tiene default
            };

            if (form.id_tecnico) {
                // PATCH: actualizar
                await axios.patch(`http://localhost:3000/tecnicos/${form.id_tecnico}`, payload);
            } else {
                // POST: crear
                await axios.post('http://localhost:3000/tecnicos', payload);
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
                        label="Código"
                        value={form.codigo}
                        onChange={handleChange('codigo')}
                        fullWidth
                    />
                    <TextField
                        label="Teléfono"
                        value={form.telefono}
                        onChange={handleChange('telefono')}
                        fullWidth
                    />
                    {form.id_tecnico && (
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
