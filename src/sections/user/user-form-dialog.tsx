import { useState } from 'react';
import axios from 'axios';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

export interface FormData {
  username: string;
  email: string;
  role: string;
  password: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export function UserFormDialog({ open, onClose }: Props) {
  const [form, setForm] = useState<FormData>({
    username: '',
    email: '',
    role: '',
    password: '',
  });

  const handleChange = (field: keyof FormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async () => {
    try {
      await axios.post('http://localhost:3000/users', {
        username: form.username,
        email: form.email,
        role: form.role,
        password: form.password
      }, {
        headers: {
          'accept': '*/*',
          'Content-Type': 'application/json'
        }
      });
      onClose();
    } catch (error) {
      console.error('Error creating user:', error);
      // You might want to add error handling here (e.g., show a snackbar/alert)
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>New User</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Username"
            value={form.username}
            onChange={handleChange('username')}
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
            label="Password"
            type="password"
            value={form.password}
            onChange={handleChange('password')}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}