
import { useState, useEffect } from 'react';
import {
    Table, TableHead, TableRow,
    TableBody, TableCell, Paper, TableContainer,
    IconButton,
    Chip,
    Typography,
    Box,
    Stack,
    TextField,
    MenuItem
} from '@mui/material';
import axios from 'axios';
import { Iconify } from 'src/components/iconify';
import { VentaFormData } from './view/VentaFormData';
import { MessageSnackbar } from 'src/components/alerts/MessageSnackbar';
import { generarPDFVenta } from 'src/utils/pdf-generator';

export interface DetalleVenta {
    id_detalle: string;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
    productoCalidad: {
        producto: {
            nombre_producto: string;
            marca: {
                nombre_marca: string;
            };
        };
        calidad: {
            nombre_calidad: string;
        };
    };
}

export interface VentaProps {
    id_venta: string;
    fecha: string;
    total: number;
    estado: string;
    id_usuario: string | null;
    id_tecnico: string | null;
    detalles: DetalleVenta[];
}

interface BasicTableProps {
    openForm: boolean;
    onOpenForm: () => void;
    onCloseForm: () => void;
}

export default function VentasList({ openForm, onOpenForm, onCloseForm }: BasicTableProps) {
    const [ventas, setVentas] = useState<VentaProps[]>([]);
    const [filtroEstado, setFiltroEstado] = useState<string>('todos');

    // Para mensajes Snackbar
    const [msgOpen, setMsgOpen] = useState(false);
    const [msg, setMsg] = useState('');
    const [severity, setSeverity] = useState<'success' | 'error'>('success');

    const obtenerVentas = async () => {
        try {
            const params = filtroEstado !== 'todos' ? { estado: filtroEstado } : {};
            const response = await axios.get('http://localhost:3000/ventas', { params });
            setVentas(response.data.data);
        } catch (error) {
            console.error('Error obteniendo ventas:', error);
            setMsg('Error obteniendo ventas');
            setSeverity('error');
            setMsgOpen(true);
        }
    };

    useEffect(() => {
        obtenerVentas();
    }, [filtroEstado]);

    const handleCreate = () => {
        onOpenForm();
    };

    const handleCloseFormInternal = () => {
        onCloseForm();
        obtenerVentas();
        setMsg('Venta creada exitosamente');
        setSeverity('success');
        setMsgOpen(true);
    };

    const handleGenerarPDF = (venta: VentaProps) => {
        try {
            generarPDFVenta(venta);
            setMsg('PDF generado exitosamente');
            setSeverity('success');
            setMsgOpen(true);
        } catch (error) {
            console.error('Error generando PDF:', error);
            setMsg('Error al generar PDF');
            setSeverity('error');
            setMsgOpen(true);
        }
    };

    const formatearFecha = (fecha: string) => {
        return new Date(fecha).toLocaleString('es-BO', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getEstadoColor = (estado: string): 'success' | 'warning' | 'error' | 'default' => {
        switch (estado) {
            case 'completada':
                return 'success';
            case 'pendiente':
                return 'warning';
            case 'cancelada':
                return 'error';
            default:
                return 'default';
        }
    };

    return (
        <>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4">Ventas</Typography>
                <TextField
                    select
                    label="Filtrar por estado"
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value)}
                    sx={{ minWidth: 200 }}
                    size="small"
                >
                    <MenuItem value="todos">Todos</MenuItem>
                    <MenuItem value="pendiente">Pendiente</MenuItem>
                    <MenuItem value="completada">Completada</MenuItem>
                    <MenuItem value="cancelada">Cancelada</MenuItem>
                </TextField>
            </Box>

            <TableContainer component={Paper} sx={{ mb: 2 }}>
                <Table sx={{ minWidth: 650 }} aria-label="tabla ventas">
                    <TableHead>
                        <TableRow>
                            <TableCell align="center">ID</TableCell>
                            <TableCell align="center">Fecha</TableCell>
                            <TableCell align="center">Total (Bs)</TableCell>
                            <TableCell align="center">Estado</TableCell>
                            <TableCell align="center">Productos</TableCell>
                            <TableCell align="center">Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {ventas.map((venta) => (
                            <TableRow key={venta.id_venta}>
                                <TableCell align="center">
                                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                                        {venta.id_venta.slice(0, 8)}...
                                    </Typography>
                                </TableCell>
                                <TableCell align="center">
                                    <Typography variant="body2">
                                        {formatearFecha(venta.fecha)}
                                    </Typography>
                                </TableCell>
                                <TableCell align="center">
                                    <Typography variant="h6" color="primary">
                                        Bs {venta.total.toFixed(2)}
                                    </Typography>
                                </TableCell>
                                <TableCell align="center">
                                    <Chip
                                        label={venta.estado.toUpperCase()}
                                        color={getEstadoColor(venta.estado)}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell align="center">
                                    <Stack spacing={0.5}>
                                        {venta.detalles.map((detalle) => (
                                            <Typography key={detalle.id_detalle} variant="caption">
                                                {detalle.cantidad}x {detalle.productoCalidad.producto.nombre_producto}
                                                ({detalle.productoCalidad.calidad.nombre_calidad})
                                            </Typography>
                                        ))}
                                    </Stack>
                                </TableCell>
                                <TableCell align="center">
                                    <IconButton 
                                        size="large" 
                                        onClick={() => handleGenerarPDF(venta)}
                                        color="primary"
                                    >
                                        <Iconify icon="solar:printer-bold" />
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
                sx={{
                    position: 'fixed',
                    bottom: 16,
                    right: 16,
                    bgcolor: 'primary.main',
                    color: 'white',
                    width: 56,
                    height: 56,
                    '&:hover': {
                        bgcolor: 'primary.dark',
                    }
                }}
                size="large"
                aria-label="Nueva Venta"
            >
                <Iconify icon="mingcute:add-line" width={32} height={32} />
            </IconButton>

            <VentaFormData
                open={openForm}
                onClose={handleCloseFormInternal}
            />

            <MessageSnackbar
                open={msgOpen}
                onClose={() => setMsgOpen(false)}
                message={msg}
                severity={severity}
            />
        </>
    );
}