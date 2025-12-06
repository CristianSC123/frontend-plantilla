import { Button } from "@mui/material";
import { useEffect, useState } from "react";
import { Iconify } from "src/components/iconify";
import BasicTable from "../lista";

export default function ProveedorView(
){

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
        Nuevo Proveedor
      </Button>


      {/* Pasamos el control de abrir/cerrar al BasicTable */}
      <BasicTable
        openForm={openForm}
        onOpenForm={() => setOpenForm(true)}
        onCloseForm={handleCloseForm}
      />
    </div>
  );
}


