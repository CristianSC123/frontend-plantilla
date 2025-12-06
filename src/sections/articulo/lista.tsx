import { useState, useEffect } from 'react';
import { Table, TableHead, TableRow,
  TableBody, TableCell,Paper, TableContainer,
  IconButton
} from '@mui/material';
import axios from 'axios';
import { Iconify } from 'src/components/iconify';
import { ArticuloFormDialog } from './view/ArticuloFormData';

interface ArticuloProps {
  id: number;
  nombre: string;
  descripcion: string;
  sigla: string;
  stock: number;
  precio: number;
  imagen: string;
}

interface BasicTableProps {
  openForm: boolean;
  onOpenForm: () => void;
  onCloseForm: () => void;
}

export default function BasicTable({ openForm, onOpenForm, onCloseForm }: BasicTableProps) {
  const [articulos, setArticulos] = useState<ArticuloProps[]>([]);
  const [selectedArticulo, setSelectedArticulo] = useState<ArticuloProps | null>(null);

  const obtenerArticulos = async () => {
    try {
      const response = await axios.get('http://localhost:3000/articulos');
      setArticulos(response.data);
    } catch (error) {
      console.error('Error obteniendo artículos:', error);
    }
  };

  useEffect(() => {
    obtenerArticulos();
  }, []);

  const handleEdit = (articulo: ArticuloProps) => {
    setSelectedArticulo(articulo);
    onOpenForm();
  };

  const handleCreate = () => {
    setSelectedArticulo(null);
    onOpenForm();
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro que quieres eliminar este artículo?')) return;
    try {
      await axios.delete(`http://localhost:3000/articulos/${id}`);
      obtenerArticulos();
    } catch (error) {
      console.error('Error eliminando artículo:', error);
    }
  };

  const handleCloseFormInternal = () => {
    setSelectedArticulo(null);
    onCloseForm();
    obtenerArticulos();
  };

  return (
    <>
      <TableContainer component={Paper} sx={{ mb: 2 }}>
        <Table sx={{ minWidth: 650 }} aria-label="tabla artículos">
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell align="center">Imagen</TableCell>
              <TableCell align="center">Sigla</TableCell>
              <TableCell align="center">Stock</TableCell>
              <TableCell align="center">Descripción</TableCell>
              <TableCell align="center">Precio</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {articulos.map((articulo) => (
              <TableRow key={articulo.id}>
                <TableCell>{articulo.nombre}</TableCell>
                <TableCell align="center">
                  <img
                    src={articulo.imagen.startsWith('http') ? articulo.imagen : `http://localhost:3000${articulo.imagen}`}
                    alt={articulo.nombre}
                    style={{ width: '100px', height: 'auto' }}
                  />
                </TableCell>
                <TableCell align="center">{articulo.sigla}</TableCell>
                <TableCell align="center">{articulo.stock}</TableCell>
                <TableCell align="center">{articulo.descripcion}</TableCell>
                <TableCell align="center">{articulo.precio}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleEdit(articulo)}>
                    <Iconify icon="solar:pen-bold" />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(articulo.id)}>
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
        aria-label="Nuevo artículo"
      >
        <Iconify icon="mingcute:add-line" width={32} height={32} />
      </IconButton>


      <ArticuloFormDialog
        open={openForm}
        onClose={handleCloseFormInternal}
        articulo={selectedArticulo ?? undefined}
        titulo={selectedArticulo ? `Editar Artículo: ${selectedArticulo.nombre}` : 'Nuevo Artículo'}
      />
    </>
  );
}
