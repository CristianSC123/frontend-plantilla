import { Button } from "@mui/material";
import { useState } from "react";
import { Iconify } from "src/components/iconify";
import VentasList from "../lista";

export default function VentaView() {
    const [openForm, setOpenForm] = useState(false);
    const handleCreate = () => setOpenForm(true);
    const handleCloseForm = () => setOpenForm(false);

    return (
        <div>
            <Button
                variant="contained"
                color="inherit"
                startIcon={<Iconify icon="mingcute:add-line" />}
                onClick={handleCreate}
                sx={{ mb: 2 }}
            >
                Nueva Venta
            </Button>

            {/* Pasamos el control de abrir/cerrar al VentasList */}
            <VentasList
                openForm={openForm}
                onOpenForm={() => setOpenForm(true)}
                onCloseForm={handleCloseForm}
            />
        </div>
    );
}