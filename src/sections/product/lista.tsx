import { useState, useEffect } from 'react';
import {
  Table,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
  Paper,
  TableContainer,
  IconButton,
  Chip,
  Typography,
} from '@mui/material';
import axios from 'axios';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/alerts/ConfirmDialog';
import { MessageSnackbar } from 'src/components/alerts/MessageSnackbar';
import { ProductoFormDialog } from './view/ProductoFormData';
import { ProductoCalidadEditDialog } from './view/ProductoCalidadEditDialog';

interface Calidad {
  id_calidad: string;
  nombre_calidad: string;
}

interface ProductoCalidad {
  id_producto_calidad: string;
  id_producto: string;
  precio_venta: number;
  stock: number;
  calidad: Calidad;
}

interface Marca {
  id_marca: string;
  nombre_marca: string;
}

interface ProductoProps {
  id_producto: string;
  nombre_producto: string;
  marca: Marca;
  calidades: ProductoCalidad[];
}

interface BasicTableProps {
  openForm: boolean;
  onOpenForm: () => void;
  onCloseForm: () => void;
}

export default function BasicTable({ openForm, onOpenForm, onCloseForm }: BasicTableProps) {
  const [productos, setProductos] = useState<ProductoProps[]>([]);
  const [selectedProductoCalidad, setSelectedProductoCalidad] = useState<ProductoCalidad | null>(
    null
  );
  const [selectedProducto, setSelectedProducto] = useState<ProductoProps | null>(null);


  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [calidadToDelete, setCalidadToDelete] = useState<ProductoCalidad | null>(null);

  const [msgOpen, setMsgOpen] = useState(false);
  const [msg, setMsg] = useState('');
  const [severity, setSeverity] = useState<'success' | 'error'>('success');

  const obtenerProductos = async () => {
    try {
      const response = await axios.get('http://localhost:3000/productos');
      setProductos(response.data);
      console.log('Productos obtenidos: ', response.data);
    } catch (error) {
      console.error('Error obteniendo productos:', error);
      setMsg('Error obteniendo productos');
      setSeverity('error');
      setMsgOpen(true);
    }
  };

  useEffect(() => {
    obtenerProductos();
  }, []);

  const handleEdit = (productoCalidad: ProductoCalidad) => {
    setSelectedProductoCalidad(productoCalidad);
    setOpenEditDialog(true);
  };

  const handleCreate = () => {
    setSelectedProductoCalidad(null);
    onOpenForm();
  };

  const handleDeleteRequest = (productoCalidad: ProductoCalidad) => {
    setCalidadToDelete(productoCalidad);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!calidadToDelete) return;

    try {
      await axios.delete(
        `http://localhost:3000/productos/${calidadToDelete.id_producto}/quitar-calidad/${calidadToDelete.calidad.id_calidad}`
      );
      setMsg(`Calidad ${calidadToDelete.calidad.nombre_calidad} eliminada correctamente`);
      setSeverity('success');
      setMsgOpen(true);
      setConfirmOpen(false);
      setCalidadToDelete(null);
      obtenerProductos();
    } catch (error) {
      console.error('Error eliminando calidad:', error);
      setMsg('Error al eliminar calidad');
      setSeverity('error');
      setMsgOpen(true);
      setConfirmOpen(false);
    }
  };

  const handleCancelDelete = () => {
    setConfirmOpen(false);
    setCalidadToDelete(null);
  };

  const handleCloseFormInternal = () => {
    setSelectedProductoCalidad(null);
    onCloseForm();
    obtenerProductos();
  };

  const handleCloseEditDialog = () => {
    setSelectedProductoCalidad(null);
    setOpenEditDialog(false);
    obtenerProductos();
  };

  return (
    <>
      <TableContainer component={Paper} sx={{ mb: 2 }}>
        <Table sx={{ minWidth: 650 }} aria-label="tabla productos">
          <TableHead>
            <TableRow>
              <TableCell align="center">Producto</TableCell>
              <TableCell align="center">Marca</TableCell>
              <TableCell align="center">Calidad</TableCell>
              <TableCell align="center">Precio</TableCell>
              <TableCell align="center">Stock</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {productos.map((producto, productoIndex) => (
              <>
                {producto.calidades.length > 0 ? (
                  producto.calidades.map((productoCalidad, index) => {
                    const productoCalidadConPadre = {
                      ...productoCalidad,
                      id_producto: producto.id_producto, // inyecta el id del producto padre
                    };

                    return (
                      <TableRow key={productoCalidadConPadre.id_producto_calidad}>
                        {index === 0 && (
                          <>
                            <TableCell
                              align="center"
                              rowSpan={producto.calidades.length}
                              sx={{ borderRight: '1px solid rgba(224, 224, 224, 1)' }}
                            >
                              <Typography variant="body1" fontWeight="medium">
                                {producto.nombre_producto}
                              </Typography>
                            </TableCell>
                            <TableCell
                              align="center"
                              rowSpan={producto.calidades.length}
                              sx={{ borderRight: '1px solid rgba(224, 224, 224, 1)' }}
                            >
                              <Chip
                                label={producto.marca.nombre_marca}
                                color="primary"
                                size="small"
                                variant="outlined"
                              />
                            </TableCell>
                          </>
                        )}

                        <TableCell align="center">
                          <Typography variant="body2">
                            {productoCalidadConPadre.calidad.nombre_calidad}
                          </Typography>
                        </TableCell>

                        <TableCell align="center">
                          <Typography variant="body2" fontWeight="medium">
                            Bs. {productoCalidadConPadre.precio_venta}
                          </Typography>
                        </TableCell>

                        <TableCell align="center">
                          <Chip
                            label={productoCalidadConPadre.stock}
                            color={productoCalidadConPadre.stock > 0 ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>

                        <TableCell align="right">
                          <IconButton onClick={() => handleEdit(productoCalidadConPadre)}>
                            <Iconify icon="solar:pen-bold" />
                          </IconButton>
                          <IconButton onClick={() => handleDeleteRequest(productoCalidadConPadre)}>
                            <Iconify icon="solar:trash-bin-trash-bold" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow key={producto.id_producto}>
                    <TableCell align="center">
                      <Typography variant="body1" fontWeight="medium">
                        {producto.nombre_producto}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={producto.marca.nombre_marca}
                        color="primary"
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center" colSpan={4}>
                      <Typography variant="body2" color="text.secondary">
                        Sin calidades registradas
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}

                {/* Divider después de cada producto */}
                {productoIndex < productos.length - 1 && (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ p: 0, border: 0 }}>
                      <div
                        style={{
                          height: '2px',
                          background:
                            'linear-gradient(to right, transparent, rgba(0,0,0,0.12), transparent)',
                          margin: '8px 0',
                        }}
                      />
                    </TableCell>
                  </TableRow>
                )}
              </>
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
          bgcolor: 'background.paper',
        }}
        size="large"
        aria-label="Nueva Calidad de Producto"
      >
        <Iconify icon="mingcute:add-line" width={32} height={32} />
      </IconButton>

      <ProductoFormDialog
        open={openForm}
        onClose={handleCloseFormInternal}
        titulo="Agregar Calidades a Producto"
      />

      <ProductoCalidadEditDialog
        open={openEditDialog}
        onClose={handleCloseEditDialog}
        productoCalidad={selectedProductoCalidad}
        titulo={
          selectedProductoCalidad
            ? `Editar Calidad: ${selectedProductoCalidad.calidad.nombre_calidad}`
            : 'Editar Calidad'
        }
      />

      <ConfirmDialog
        open={confirmOpen}
        title="Confirmar eliminación"
        description={`¿Estás seguro que quieres eliminar la calidad ${calidadToDelete?.calidad.nombre_calidad}?`}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
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
