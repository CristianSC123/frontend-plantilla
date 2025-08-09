import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import MenuList from '@mui/material/MenuList';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { UserDTO } from './view/usuarioDto';
import axios from 'axios';
import { UserEditDialog } from './user-edit-dialog';


export type UserProps = {
  id: string;
  name: string;
  email: string;
  role: string;
  password: string;
  status: string;
  company: string;
  avatarUrl?: string;
  isVerified?: boolean;
};

type UserTableRowProps = {
  row: UserDTO;
  selected: boolean;
  onSelectRow: () => void;
  onClose: () => void;
  actualizarEditar : ()=>void
};

export function UserTableRow({ row, selected, onSelectRow, onClose,actualizarEditar }: UserTableRowProps) {
  const [openPopover, setOpenPopover] = useState<HTMLElement | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [actualizar, setActualizar] = useState(false);
  const [idUsuario, setIdUsuario] = useState<string | null>(null);

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = () => {
    setOpenPopover(null);
  };

  const eliminarUsuario = async () => {
    try {
      await axios.delete(`http://localhost:3000/users/${row.id}`, {
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json'
        }
      });
      alert('Usuario eliminado');
      onClose();
    } catch (error) {
      console.error('Error eliminando usuario:', error);
    } finally {
      handleClosePopover();
    }
  };

  const handleEditarUsuario = () => {
    setIdUsuario(row.id);
    setOpenForm(true);
    handleClosePopover();
  };

  return (
    <>
      <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox disableRipple checked={selected} onChange={onSelectRow} />
        </TableCell>

        <TableCell component="th" scope="row">
          <Box
            sx={{
              gap: 2,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Avatar alt={row.name} src={`/assets/images/avatar/avatar-${row.id}.webp`} />
            {row.name}
          </Box>
        </TableCell>

        <TableCell>{row.email}</TableCell>
        <TableCell>{row.role || 'usuario'}</TableCell>

        <TableCell align="center">
          <Iconify width={22} icon="solar:check-circle-bold" sx={{ color: 'success.main' }} />
        </TableCell>

        <TableCell>
          <Label color={(row.status === 'banned' && 'error') || 'success'}>
            {row.status || 'ACTIVO'}
          </Label>
        </TableCell>

        <TableCell align="right">
          <IconButton onClick={handleOpenPopover}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <Popover
        open={!!openPopover}
        anchorEl={openPopover}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuList
          disablePadding
          sx={{
            p: 0.5,
            gap: 0.5,
            width: 140,
            display: 'flex',
            flexDirection: 'column',
            [`& .${menuItemClasses.root}`]: {
              px: 1,
              gap: 2,
              borderRadius: 0.75,
              [`&.${menuItemClasses.selected}`]: { bgcolor: 'action.selected' },
            },
          }}
        >
          <MenuItem onClick={handleEditarUsuario}>
            <Iconify icon="solar:pen-bold" />
            Editar
          </MenuItem>

          <MenuItem onClick={eliminarUsuario} sx={{ color: 'error.main' }}>
            <Iconify icon="solar:trash-bin-trash-bold" />
            Eliminar
          </MenuItem>
        </MenuList>
      </Popover>

      {idUsuario && (
        <UserEditDialog
          open={openForm}
          onClose={() => {
            setOpenForm(false);
            setActualizar(!actualizar);
          }}
          titulo="Editar Usuario"
          userId={idUsuario}
          actualizarEditar={()=> actualizarEditar()}
        />
      )}
    </>
  );
}