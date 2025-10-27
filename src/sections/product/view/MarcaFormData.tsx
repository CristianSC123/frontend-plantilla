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

export interface MarcaProps {
    id_marca?: string;
    nombre_marca: string;
}

interface Props {
    open: boolean;
    onClose: () => void;
    marca?: MarcaProps;
    titulo: string;
    onSuccess?: () => void;
}

export function MarcaFormDialog({ open, onClose, marca, titulo, onSuccess }: Props) {
    const [form, setForm] = useState<MarcaProps>({
        id_marca: '',
        nombre_marca: '',
    });

    useEffect(() => {
        if (marca) {
            setForm(marca);
        } else {
            setForm({
                id_marca: '',
                nombre_marca: '',
            });
        }
    }, [marca, open]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({ ...prev, nombre_marca: event.target.value }));
    };

    const handleSubmit = async () => {
        try {
            const payload = {
                nombre_marca: form.nombre_marca,
            };

            if (form.id_marca) {
                // PATCH: actualizar
                await axios.patch(`http://localhost:3000/marcas/${form.id_marca}`, payload);
            } else {
                // POST: crear
                await axios.post('http://localhost:3000/marcas', payload);
            }

            onClose();
            onSuccess?.();
        } catch (error) {
            console.error('Error guardando marca:', error);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>{titulo}</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ mt: 1 }}>
                    <TextField
                        label="Nombre de la Marca"
                        value={form.nombre_marca}
                        onChange={handleChange}
                        fullWidth
                        placeholder="Ej: SAMSUNG"
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