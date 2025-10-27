import { useState, useEffect } from 'react';
import {
    Table, TableHead, TableRow,
    TableBody, TableCell, Paper, TableContainer,
    IconButton,
    Chip,
    Typography,
    Avatar,
    Stack
} from '@mui/material';
import axios from 'axios';
import { Iconify } from 'src/components/iconify';
import { TecnicoFormDialog } from './view/TecnicoFormData';
import { ConfirmDialog } from 'src/components/alerts/ConfirmDialog';
import { MessageSnackbar } from 'src/components/alerts/MessageSnackbar';

interface TecnicoProps {
    id_tecnico: string;
    nombres: string;
    apellidos: string;
    codigo: string;
    telefono: string;
    activo: boolean;
}

interface BasicTableProps {
    openForm: boolean;
    onOpenForm: () => void;
    onCloseForm: () => void;
}

export default function BasicTable({ openForm, onOpenForm, onCloseForm }: BasicTableProps) {
    const [tecnicos, setTecnicos] = useState<TecnicoProps[]>([]);
    const [selectedTecnico, setSelectedTecnico] = useState<TecnicoProps | null>(null);

    // Para la confirmación modal
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [tecnicoToDelete, setTecnicoToDelete] = useState<TecnicoProps | null>(null);

    // Para mensajes Snackbar
    const [msgOpen, setMsgOpen] = useState(false);
    const [msg, setMsg] = useState('');
    const [severity, setSeverity] = useState<'success' | 'error'>('success');

    const getInitials = (nombre: string, apellido: string) => {
        return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
    };

    const obtenerTecnicos = async () => {
        try {
            const response = await axios.get('http://localhost:3000/tecnicos');
            setTecnicos(response.data);
        } catch (error) {
            console.error('Error obteniendo técnicos:', error);
            setMsg('Error obteniendo técnicos');
            setSeverity('error');
            setMsgOpen(true);
        }
    };

    useEffect(() => {
        obtenerTecnicos();
    }, []);

    const handleEdit = (tecnico: TecnicoProps) => {
        setSelectedTecnico(tecnico);
        onOpenForm();
    };

    const handleCreate = () => {
        setSelectedTecnico(null);
        onOpenForm();
    };

    // Aquí abrimos el modal confirmación para eliminar
    const handleDeleteRequest = (tecnico: TecnicoProps) => {
        setTecnicoToDelete(tecnico);
        setConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!tecnicoToDelete) return;

        try {
            await axios.delete(`http://localhost:3000/tecnicos/${tecnicoToDelete.id_tecnico}`);
            setMsg(`Técnico ${tecnicoToDelete.nombres} eliminado correctamente`);
            setSeverity('success');
            setMsgOpen(true);
            setConfirmOpen(false);
            setTecnicoToDelete(null);
            obtenerTecnicos();
        } catch (error) {
            console.error('Error deshabilitando técnico:', error);
            setMsg('Error al eliminar técnico');
            setSeverity('error');
            setMsgOpen(true);
            setConfirmOpen(false);
        }
    };

    const handleCancelDelete = () => {
        setConfirmOpen(false);
        setTecnicoToDelete(null);
    };

    const handleCloseFormInternal = () => {
        setSelectedTecnico(null);
        onCloseForm();
        obtenerTecnicos();
    };

    return (
        <>
            <TableContainer component={Paper} sx={{ mb: 2 }}>
                <Table sx={{ minWidth: 650 }} aria-label="tabla técnicos">
                    <TableHead>
                        <TableRow>
                            <TableCell align="center">Avatar</TableCell>
                            <TableCell align="center">Código</TableCell>
                            <TableCell align="center">Nombres</TableCell>
                            <TableCell align="center">Apellidos</TableCell>
                            <TableCell align="center">Telefono</TableCell>
                            <TableCell align="center">Activo</TableCell>
                            <TableCell align="right">Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {tecnicos.map((tecnico) => (
                            <TableRow key={tecnico.id_tecnico}>
                                <TableCell align="center">
                                    {/* Avatar con iniciales */}
                                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                                        <Avatar sx={{ bgcolor: '#1976d2', width: 40, height: 40 }}>
                                            {getInitials(tecnico.nombres, tecnico.apellidos)}
                                        </Avatar>
                                    </Stack>
                                </TableCell>
                                <TableCell align="center">
                                    <Typography variant="body2">{tecnico.codigo}</Typography>
                                </TableCell>

                                <TableCell align="center">{tecnico.nombres}</TableCell>
                                <TableCell align="center">{tecnico.apellidos}</TableCell>
                                <TableCell align="center">{tecnico.telefono}</TableCell>

                                <TableCell align="center">
                                    {tecnico.activo ? (
                                        <Chip label="Activo" color="success" size="small" />
                                    ) : (
                                        <Chip label="Inactivo" color="error" size="small" />
                                    )}
                                </TableCell>

                                <TableCell align="right">
                                    <IconButton onClick={() => handleEdit(tecnico)}>
                                        <Iconify icon="solar:pen-bold" />
                                    </IconButton>
                                    <IconButton onClick={() => handleDeleteRequest(tecnico)}>
                                        <Iconify icon="solar:trash-bin-trash-bold" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <IconButton
                color="primary"
                onClick={handleCreate}
                sx={{ position: 'fixed', bottom: 16, right: 16, bgcolor: 'background.paper' }}
                size="large"
                aria-label="Nuevo Técnico"
            >
                <Iconify icon="mingcute:add-line" width={32} height={32} />
            </IconButton>

            <TecnicoFormDialog
                open={openForm}
                onClose={handleCloseFormInternal}
                tecnico={selectedTecnico ?? undefined}
                titulo={selectedTecnico ? `Editar Técnico: ${selectedTecnico.nombres}` : 'Nuevo Técnico'}
            />

            {/* Confirmación modal */}
            <ConfirmDialog
                open={confirmOpen}
                title="Confirmar eliminación"
                description={`¿Estás seguro que quieres eliminar al técnico ${tecnicoToDelete?.nombres}?`}
                onCancel={handleCancelDelete}
                onConfirm={handleConfirmDelete}
            />

            {/* Mensajes Snackbar */}
            <MessageSnackbar
                open={msgOpen}
                onClose={() => setMsgOpen(false)}
                message={msg}
                severity={severity}
            />
        </>
    );
}
