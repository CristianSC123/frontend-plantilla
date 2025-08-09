import { useState, useEffect } from 'react'
import axios from 'axios'

import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'

export interface FormData {
    name: string
    email: string
    role: string
    password: string
}

interface Props {
    open: boolean
    onClose: () => void
    titulo: string
    userId: string // ID del usuario a editar
    actualizarEditar: ()=>void
}

export function UserEditDialog({ open, onClose, titulo, userId , actualizarEditar}: Props) {
    const [form, setForm] = useState<FormData>({
        name: '',
        email: '',
        role: '',
        password: '',
    })

    // Cargar datos del usuario al abrir el modal

    const buscarUsuarioPorId = () => {
        if (open && userId) {
            axios.get(`http://localhost:3000/users/${userId}`)
                .then((res) => {
                    setForm({
                        name: res.data.name,
                        email: res.data.email,
                        role: res.data.role,
                        password: res.data.password
                    })
                })
                .catch((err) => {
                    console.error('Error fetching user data:', err)
                })
        }
    }

    useEffect(() => {
        buscarUsuarioPorId()
    }, [open, userId])

    const handleChange = (field: keyof FormData) => (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setForm((prev) => ({ ...prev, [field]: event.target.value }))
    }

    const handleSubmit = async () => {
        try {
            await axios.put(`http://localhost:3000/users/${userId}`, {
                name: form.name,
                email: form.email,
                role: form.role,
                password: form.password || undefined, // solo si se cambia
            }, {
                headers: {
                    'accept': '*/*',
                    'Content-Type': 'application/json'
                }
            })
            actualizarEditar()
            onClose()
        } catch (error) {
            console.error('Error updating user:', error)
        }
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                {titulo}
            </DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ mt: 1 }}>
                    <TextField
                        label="Nombre usuario"
                        value={form.name}
                        onChange={handleChange('name')}
                        fullWidth
                    />
                    <TextField
                        label="Email"
                        value={form.email}
                        onChange={handleChange('email')}
                        fullWidth
                    />
                    <TextField
                        label="Role"
                        value={form.role}
                        onChange={handleChange('role')}
                        fullWidth
                    />
                    <TextField
                        label="Password (opcional)"
                        type="password"
                        value={form.password}
                        onChange={handleChange('password')}
                        fullWidth
                        helperText="Déjalo vacío para no cambiar la contraseña"
                    />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button variant="contained" onClick={handleSubmit}>
                    Actualizar
                </Button>
            </DialogActions>
        </Dialog>
    )
}
