import { Button } from "@mui/material";
import { useState } from "react";
import { Iconify } from "src/components/iconify";
import ProductosTable from "../lista";


export default function ProductoView() {
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
                Nuevo Producto
            </Button>

            <ProductosTable
                openForm={openForm}
                onOpenForm={handleCreate}
                onCloseForm={handleCloseForm}
            />
        </div>
    );
}
