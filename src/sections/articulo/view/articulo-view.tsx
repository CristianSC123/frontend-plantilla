import BasicTable from '../lista';
import { Button } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import axios from 'axios';

export default function ArticuloView() {
  const getBase64FromUrl = async (url: string) => {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  };
  interface ArticuloProps {
    id: number;
    nombre: string;
    imagen: string;
    sigla: string;
    stock: number;
    descripcion: string;
    precio: number;
  }
  const [openForm, setOpenForm] = useState(false);

  const handleCreate = () => setOpenForm(true);
  const handleCloseForm = () => setOpenForm(false);

  const generarReporte = async () => {
    const { data } = await axios.get<ArticuloProps[]>('http://localhost:3000/articulos');
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Reporte de Artículos', 14, 20);

    doc.setFontSize(11);
    doc.text(`Fecha: ${new Date().toLocaleString()}`, 14, 30);
    doc.text('Creado por: admin', 14, 36);

    // 🔹 Convertir imágenes a base64 y obtener dimensiones reales
    const base64Imgs = await Promise.all(
      data.map(async (art) => {
        const imgUrl = `http://localhost:3000${art.imagen}`;
        const res = await fetch(imgUrl);
        const blob = await res.blob();

        return new Promise<{ base64: string; height: number }>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const img = new Image();
            img.src = reader.result as string;
            img.onload = () => {
              const aspectRatio = img.width / img.height;
              const targetWidth = 20; // ancho fijo en la celda
              const targetHeight = targetWidth / aspectRatio; // calcular alto proporcional
              resolve({ base64: reader.result as string, height: targetHeight + 4 }); // +4 margen
            };
          };
          reader.readAsDataURL(blob);
        });
      })
    );

    autoTable(doc, {
      startY: 45,
      head: [['ID', 'Imagen', 'Nombre', 'Sigla', 'Stock', 'Precio']],
      body: data.map((p) => [
        p.id,
        'img', // placeholder
        p.nombre,
        p.sigla,
        p.stock,
        `Bs ${p.precio}`,
      ]),
      theme: 'striped',
      styles: { halign: 'center', fontSize: 11 },
      headStyles: { fillColor: [0, 174, 239], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [245, 245, 245] },

      // 🔹 Ajustar alto de cada fila según la imagen
      didParseCell: (dataCell) => {
        if (dataCell.column.index === 1 && dataCell.cell.raw === 'img') {
          const idx = dataCell.row.index;
          dataCell.cell.height = base64Imgs[idx].height;
        }
      },

      // 🔹 Dibujar la imagen sin deformarla
      didDrawCell: (dataCell) => {
        if (dataCell.column.index === 1 && dataCell.cell.raw === 'img') {
          const idx = dataCell.row.index;
          const img = base64Imgs[idx];
          if (img) {
            doc.addImage(
              img.base64,
              'JPEG',
              dataCell.cell.x + 2,
              dataCell.cell.y + 2,
              20, // ancho fijo
              img.height - 4 // alto proporcional al ancho
            );
          }
        }
      },
    });

    doc.save('reporte_articulos.pdf');
  };

  return (
    <div>
      <Button
        variant="contained"
        color="inherit"
        startIcon={<Iconify icon="mingcute:add-line" />}
        onClick={handleCreate}
        sx={{ mb: 2 }}
      >
        Nuevo artículo
      </Button>

      <Button variant="contained" color="inherit" onClick={generarReporte} sx={{ mb: 2, ml: 2 }}>
        Generar Reporte
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
