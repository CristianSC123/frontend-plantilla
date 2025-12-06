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
import { ProveedorProps } from 'src/sections/proveedor/view/proveedorFormData';
import { ProveedorFormDialog } from 'src/sections/proveedor/view/proveedorFormData';

interface BasicTableProps {
    openForm: boolean;
    onOpenForm: () => void;
    onCloseForm: () => void;
}

export default function BasicTable({ openForm, onOpenForm, onCloseForm }: BasicTableProps) {
    const [proveedores, setProveedores] = useState<ProveedorProps[]>([]);
    const [selectedProveedor, setSelectedProveedor] = useState<ProveedorProps | null>(null);

    // Para la confirmación modal
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [proveedorToDelete, setTecnicoToDelete] = useState<ProveedorProps | null>(null);

    // Para mensajes Snackbar
    const [msgOpen, setMsgOpen] = useState(false);
    const [msg, setMsg] = useState('');
    const [severity, setSeverity] = useState<'success' | 'error'>('success');

    const getInitials = (nombre: string, apellido: string) => {
        return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
    };

    const obtenerProveedores = async () => {
        try {
            const response = await axios.get('http://localhost:3000/proveedores');
            setProveedores(response.data);
        } catch (error) {
            console.error('Error obteniendo proveedores:', error);
            setMsg('Error obteniendo proveedores');
            setSeverity('error');
            setMsgOpen(true);
        }
    };

    useEffect(() => {
        obtenerProveedores();
    }, []);

    const handleEdit = (proveedor: ProveedorProps) => {
        setSelectedProveedor(proveedor);
        onOpenForm();
    };

    const handleCreate = () => {
        setSelectedProveedor(null);
        onOpenForm();
    };

    // Aquí abrimos el modal confirmación para eliminar
    const handleDeleteRequest = (proveedor: ProveedorProps) => {
        setTecnicoToDelete(proveedor);
        setConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!proveedorToDelete) return;

        try {
            await axios.delete(`http://localhost:3000/proveedores/${proveedorToDelete.id_proveedor}`);
            setMsg(`Proveedor ${proveedorToDelete.nombre_proveedor} eliminado correctamente`);
            setSeverity('success');
            setMsgOpen(true);
            setConfirmOpen(false);
            setTecnicoToDelete(null);
            obtenerProveedores();
        } catch (error) {
            console.error('Error deshabilitando proveedor:', error);
            setMsg('Error al eliminar proveedor');
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
        setSelectedProveedor(null);
        onCloseForm();
        obtenerProveedores();
    };

    return (
        <>
            <TableContainer component={Paper} sx={{ mb: 2 }}>
                <Table sx={{ minWidth: 650 }} aria-label="tabla proveedores">
                    <TableHead>
                        <TableRow>
                            <TableCell align="center">Avatar</TableCell>
                            <TableCell align="center">Nombre</TableCell>
                            <TableCell align="center">Correo Electrónico</TableCell>
                            <TableCell align="center">Teléfono</TableCell>
                            <TableCell align="center">Activo</TableCell>
                            <TableCell align="center">Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {proveedores.map((proveedor) => (
                            <TableRow key={proveedor.id_proveedor}>
                                <TableCell align="center">
                                    {/* Avatar con iniciales */}
                                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                                        <Avatar sx={{ bgcolor: '#1976d2', width: 40, height: 40 }}>
                                            {getInitials(proveedor.nombre_proveedor, proveedor.nombre_proveedor)}
                                        </Avatar>
                                    </Stack>
                                </TableCell>
                                <TableCell align="center">
                                    <Typography variant="body2">{proveedor.nombre_proveedor}</Typography>
                                </TableCell>

                                <TableCell align="center">{proveedor.correo_proveedor}</TableCell>
                                <TableCell align="center">{proveedor.telefono_proveedor}</TableCell>

                                <TableCell align="center">
                                    {proveedor.activo ? (
                                        <Chip label="Activo" color="success" size="small" />
                                    ) : (
                                        <Chip label="Inactivo" color="error" size="small" />
                                    )}
                                </TableCell>

                                <TableCell align="right">
                                    <IconButton onClick={() => handleEdit(proveedor)}>
                                        <Iconify icon="solar:pen-bold" />
                                    </IconButton>
                                    <IconButton onClick={() => handleDeleteRequest(proveedor)}>
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
                aria-label="Nuevo Proveedor"
            >
                <Iconify icon="mingcute:add-line" width={32} height={32} />
            </IconButton>

            <ProveedorFormDialog
                open={openForm}
                onClose={handleCloseFormInternal}
                proveedor={selectedProveedor ?? undefined}
                titulo={selectedProveedor ? `Editar Proveedor: ${selectedProveedor.nombre_proveedor}` : 'Nuevo Proveedor'}
            />

            {/* Confirmación modal */}
            <ConfirmDialog
                open={confirmOpen}
                title="Confirmar eliminación"
                description={`¿Estás seguro que quieres eliminar al proveedor ${proveedorToDelete?.nombre_proveedor}?`}
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
