import { useState, useCallback } from 'react';
import axios from 'axios';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';

import { useRouter } from 'src/routes/hooks';
import { Iconify } from 'src/components/iconify';

export function SignInView() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  // Estados para guardar valores del formulario
  const [usuario, setUsuario] = useState('');
  const [contrasenia, setContrasenia] = useState('');

  const handleSignIn = useCallback(async () => {
    try {
      const response = await axios.post('http://localhost:3000/usuarios/login', {
        usuario,
        contrasenia,
      });

      const userData = response.data;
      localStorage.setItem('id_usuario', userData.id_usuario);
      localStorage.setItem('id_rol', userData.rol.id_rol);
      localStorage.setItem('nombres', userData.nombres);
      localStorage.setItem('apellidos', userData.apellidos);
      localStorage.setItem('usuario', userData.usuario);
      localStorage.setItem('token', 'true');


      // Redireccionar al dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      alert('Credenciales inválidas');
    }
  }, [usuario, contrasenia, router]);

  const renderForm = (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-end',
        flexDirection: 'column',
      }}
    >
      <TextField
        fullWidth
        name="usuario"
        label="Usuario"
        value={usuario}
        onChange={(e) => setUsuario(e.target.value)}
        sx={{ mb: 3 }}
        slotProps={{
          inputLabel: { shrink: true },
        }}
      />

      <TextField
        fullWidth
        name="contrasenia"
        label="Contrasenia"
        value={contrasenia}
        onChange={(e) => setContrasenia(e.target.value)}
        type={showPassword ? 'text' : 'password'}
        slotProps={{
          inputLabel: { shrink: true },
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  <Iconify icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
        sx={{ mb: 3 }}
      />

      <Button
        fullWidth
        size="large"
        type="submit"
        color="inherit"
        variant="contained"
        onClick={handleSignIn}
      >
        Iniciar Sesión
      </Button>
    </Box>
  );

  return (
    <>
      <Box
        sx={{
          gap: 1.5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mb: 5,
        }}
      >
        <Typography variant="h5">Iniciar Sesión</Typography>
        <img src="./Essiet.png" height={150} width={150} />
      </Box>
      {renderForm}
      <Divider sx={{ my: 3, '&::before, &::after': { borderTopStyle: 'dashed' } }}></Divider>
    </>
  );
}
