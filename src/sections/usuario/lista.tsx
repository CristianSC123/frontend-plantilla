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
import { ConfirmDialog } from 'src/components/alerts/ConfirmDialog';
import { MessageSnackbar } from 'src/components/alerts/MessageSnackbar';
import { UsuarioFormDialog, UsuarioProps } from './view/UsuarioFormData';


interface BasicTableProps {
    openForm: boolean;
    onOpenForm: () => void;
    onCloseForm: () => void;
}

export default function BasicTable({ openForm, onOpenForm, onCloseForm }: BasicTableProps) {
    const [usuarios, setusuarios] = useState<UsuarioProps[]>([]);
    const [selectedusuario, setSelectedusuario] = useState<UsuarioProps | null>(null);

    // Para la confirmación modal
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [usuarioToDelete, setusuarioToDelete] = useState<UsuarioProps | null>(null);

    // Para mensajes Snackbar
    const [msgOpen, setMsgOpen] = useState(false);
    const [msg, setMsg] = useState('');
    const [severity, setSeverity] = useState<'success' | 'error'>('success');

    const getInitials = (nombre: string, apellido: string) => {
        return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
    };

    const obtenerusuarios = async () => {
        try {
            const response = await axios.get('http://localhost:3000/usuarios');
            setusuarios(response.data);
            console.log('Usuarios obtenidos:', response.data);
        } catch (error) {
            console.error('Error obteniendo usuarios:', error);
            setMsg('Error obteniendo usuarios');
            setSeverity('error');
            setMsgOpen(true);
        }
    };

    useEffect(() => {
        obtenerusuarios();
    }, []);

    const handleEdit = (usuario: UsuarioProps) => {
        setSelectedusuario(usuario);
        onOpenForm();
    };

    const handleCreate = () => {
        setSelectedusuario(null);
        onOpenForm();
    };

    // Aquí abrimos el modal confirmación para eliminar
    const handleDeleteRequest = (usuario: UsuarioProps) => {
        setusuarioToDelete(usuario);
        setConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!usuarioToDelete) return;

        try {
            await axios.delete(`http://localhost:3000/usuarios/${usuarioToDelete.id_usuario}`);
            setMsg(`usuario ${usuarioToDelete.nombres} eliminado correctamente`);
            setSeverity('success');
            setMsgOpen(true);
            setConfirmOpen(false);
            setusuarioToDelete(null);
            obtenerusuarios();
        } catch (error) {
            console.error('Error deshabilitando usuario:', error);
            setMsg('Error al eliminar usuario');
            setSeverity('error');
            setMsgOpen(true);
            setConfirmOpen(false);
        }
    };

    const handleCancelDelete = () => {
        setConfirmOpen(false);
        setusuarioToDelete(null);
    };

    const handleCloseFormInternal = () => {
        setSelectedusuario(null);
        onCloseForm();
        obtenerusuarios();
    };

    return (
        <>
            <TableContainer component={Paper} sx={{ mb: 2 }}>
                <Table sx={{ minWidth: 650 }} aria-label="tabla usuarios">
                    <TableHead>
                        <TableRow>
                            <TableCell align="center">Avatar</TableCell>
                            <TableCell align="center">Usuario</TableCell>
                            <TableCell align="center">Nombres</TableCell>
                            <TableCell align="center">Apellidos</TableCell>
                            <TableCell align="center">Rol</TableCell>
                            <TableCell align="center">Activo</TableCell>
                            <TableCell align="center">Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {usuarios.map((usuario) => (
                            <TableRow key={usuario.id_usuario}>
                                <TableCell align="center">
                                    {/* Avatar con iniciales */}
                                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                                        <Avatar sx={{ bgcolor: '#1976d2', width: 40, height: 40 }}>
                                            {getInitials(usuario.nombres, usuario.apellidos)}
                                        </Avatar>
                                    </Stack>
                                </TableCell>
                                <TableCell align="center">{usuario.usuario}</TableCell>
                                <TableCell align="center">{usuario.nombres}</TableCell>
                                <TableCell align="center">{usuario.apellidos}</TableCell>
                                <TableCell align="center">{usuario.rol.nombre_rol}</TableCell>

                                <TableCell align="center">
                                    {usuario.activo ? (
                                        <Chip label="Activo" color="success" size="small" />
                                    ) : (
                                        <Chip label="Inactivo" color="error" size="small" />
                                    )}
                                </TableCell>

                                <TableCell align="right">
                                    <IconButton onClick={() => handleEdit(usuario)}>
                                        <Iconify icon="solar:pen-bold" />
                                    </IconButton>
                                    <IconButton onClick={() => handleDeleteRequest(usuario)}>
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
                aria-label="Nuevo usuario"
            >
                <Iconify icon="mingcute:add-line" width={32} height={32} />
            </IconButton>

            <UsuarioFormDialog
                open={openForm}
                onClose={handleCloseFormInternal}
                usuario={selectedusuario ?? undefined}
                titulo={selectedusuario ? `Editar usuario: ${selectedusuario.nombres}` : 'Nuevo usuario'}
            />

            {/* Confirmación modal */}
            <ConfirmDialog
                open={confirmOpen}
                title="Confirmar eliminación"
                description={`¿Estás seguro que quieres eliminar al usuario ${usuarioToDelete?.nombres}?`}
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
