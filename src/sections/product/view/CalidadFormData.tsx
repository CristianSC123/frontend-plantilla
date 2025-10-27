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

export interface CalidadProps {
    id_calidad?: string;
    nombre_calidad: string;
}

interface Props {
    open: boolean;
    onClose: () => void;
    calidad?: CalidadProps;
    titulo: string;
    onSuccess?: () => void;
}

export function CalidadFormDialog({ open, onClose, calidad, titulo, onSuccess }: Props) {
    const [form, setForm] = useState<CalidadProps>({
        id_calidad: '',
        nombre_calidad: '',
    });

    useEffect(() => {
        if (calidad) {
            setForm(calidad);
        } else {
            setForm({
                id_calidad: '',
                nombre_calidad: '',
            });
        }
    }, [calidad, open]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({ ...prev, nombre_calidad: event.target.value }));
    };

    const handleSubmit = async () => {
        try {
            const payload = {
                nombre_calidad: form.nombre_calidad,
            };

            if (form.id_calidad) {
                // PATCH: actualizar
                await axios.patch(`http://localhost:3000/calidades/${form.id_calidad}`, payload);
            } else {
                // POST: crear
                await axios.post('http://localhost:3000/calidades', payload);
            }

            onClose();
            onSuccess?.();
        } catch (error) {
            console.error('Error guardando calidad:', error);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>{titulo}</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ mt: 1 }}>
                    <TextField
                        label="Nombre de la Calidad"
                        value={form.nombre_calidad}
                        onChange={handleChange}
                        fullWidth
                        placeholder="Ej: ORIGINAL"
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
    );
}