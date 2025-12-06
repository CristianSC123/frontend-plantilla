import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface DetalleVenta {
    id_detalle: string;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
    productoCalidad: {
        producto: {
            nombre_producto: string;
            marca: {
                nombre_marca: string;
            };
        };
        calidad: {
            nombre_calidad: string;
        };
    };
}

interface VentaProps {
    id_venta: string;
    fecha: string;
    total: number;
    estado: string;
    id_usuario: string | null;
    id_tecnico: string | null;
    detalles: DetalleVenta[];
}

export const generarPDFVenta = async (venta: VentaProps) => {
    const doc = new jsPDF();

    // Colores
    const primaryColor: [number, number, number] = [33, 150, 243]; // Azul
    const accentColor: [number, number, number] = [255, 152, 0]; // Naranja
    const lightGray: [number, number, number] = [250, 250, 250];
    const darkGray: [number, number, number] = [66, 66, 66];

    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // --- ENCABEZADO ---
    doc.setFillColor(33, 150, 243);
    doc.rect(0, 0, pageWidth, 45, 'F');
    doc.setFillColor(25, 118, 210);
    doc.rect(0, 0, pageWidth, 25, 'F');

    // Logo
    const img = new Image();
    img.src = '/Essiet.png';
    await new Promise<void>((resolve) => {
        img.onload = () => {
            const logoSize = 35;
            const logoX = 15;
            const logoY = 5;

            doc.setFillColor(0, 0, 0);
            doc.setGState(new doc.GState({ opacity: 0.2 }));
            doc.circle(logoX + logoSize / 2 + 1, logoY + logoSize / 2 + 1, logoSize / 2 + 2, 'F');

            doc.setGState(new doc.GState({ opacity: 1 }));
            doc.setFillColor(255, 255, 255);
            doc.circle(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2 + 2, 'F');

            doc.addImage(img, 'PNG', logoX, logoY, logoSize, logoSize);
            resolve();
        };
        img.onerror = () => resolve();
    });

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('RECIBO DE VENTA', pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Essiet - Soluciones Tecnológicas', pageWidth / 2, 28, { align: 'center' });

    doc.setFontSize(9);
    doc.text('NIT: 123456789 | Tel: +591 65673891', pageWidth / 2, 35, { align: 'center' });
    doc.text('Email: ventas@essiet.com | www.essiet.com', pageWidth / 2, 40, { align: 'center' });

    doc.setDrawColor(...accentColor);
    doc.setLineWidth(2);
    doc.line(15, 48, pageWidth - 15, 48);

    // --- INFORMACIÓN DE LA VENTA ---
    const cardY = 55;
    const cardHeight = 35;

    doc.setFillColor(0, 0, 0);
    doc.setGState(new doc.GState({ opacity: 0.1 }));
    doc.roundedRect(17, cardY + 2, pageWidth - 34, cardHeight, 3, 3, 'F');

    doc.setGState(new doc.GState({ opacity: 1 }));
    doc.setFillColor(...lightGray);
    doc.roundedRect(15, cardY, pageWidth - 30, cardHeight, 3, 3, 'F');

    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.roundedRect(15, cardY, pageWidth - 30, cardHeight, 3, 3, 'S');

    doc.setTextColor(...darkGray);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMACIÓN DE LA VENTA', pageWidth / 2, cardY + 8, { align: 'center' });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    const col1X = 25;
    const col2X = pageWidth / 2 + 10;
    let infoY = cardY + 16;

    doc.setFont('helvetica', 'bold');
    doc.text('ID Venta:', col1X, infoY);
    doc.setFont('helvetica', 'normal');
    doc.text(venta.id_venta.slice(0, 13) + '...', col1X + 20, infoY);

    doc.setFont('helvetica', 'bold');
    doc.text('Fecha:', col1X, infoY + 7);
    doc.setFont('helvetica', 'normal');
    doc.text(formatearFechaCorta(venta.fecha), col1X + 20, infoY + 7);

    doc.setFont('helvetica', 'bold');
    doc.text('Estado:', col2X, infoY);
    doc.setFont('helvetica', 'normal');

    const estadoX = col2X + 18;
    if (venta.estado === 'completada') doc.setTextColor(76, 175, 80);
    else if (venta.estado === 'pendiente') doc.setTextColor(255, 152, 0);
    else doc.setTextColor(244, 67, 54);
    doc.setFont('helvetica', 'bold');
    doc.text(venta.estado.toUpperCase(), estadoX, infoY);

    doc.setTextColor(...darkGray);
    doc.setFont('helvetica', 'bold');
    doc.text('Hora:', col2X, infoY + 7);
    doc.setFont('helvetica', 'normal');
    doc.text(formatearHora(venta.fecha), col2X + 18, infoY + 7);

    // --- TABLA DE PRODUCTOS ---
    const tableStartY = cardY + cardHeight + 10;
    doc.setTextColor(...darkGray);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('DETALLE DE PRODUCTOS', 15, tableStartY);

    const tableData = venta.detalles.map(detalle => [
        detalle.cantidad.toString(),
        detalle.productoCalidad.producto.nombre_producto,
        detalle.productoCalidad.producto.marca.nombre_marca,
        detalle.productoCalidad.calidad.nombre_calidad,
        detalle.precioUnitario.toFixed(2),
        detalle.subtotal.toFixed(2)
    ]);

    autoTable(doc, {
        startY: tableStartY + 5,
        head: [['Cant.', 'Producto', 'Marca', 'Calidad', 'P. Unit. (Bs)', 'Subtotal (Bs)']],
        body: tableData,
        theme: 'grid',
        headStyles: {
            fillColor: primaryColor,
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            halign: 'center',
            fontSize: 9
        },
        bodyStyles: {
            fontSize: 9,
            textColor: darkGray
        },
        columnStyles: {
            0: { cellWidth: 15, halign: 'center' },
            1: { cellWidth: 55, halign: 'left' },
            2: { cellWidth: 35, halign: 'left' },
            3: { cellWidth: 30, halign: 'center' },
            4: { cellWidth: 25, halign: 'right' },
            5: { cellWidth: 30, halign: 'right', fontStyle: 'bold' }
        },
        alternateRowStyles: {
            fillColor: lightGray
        },
        margin: { left: 15, right: 15 }
    });

    const finalY = (doc as any).lastAutoTable.finalY || tableStartY + 50;

    // --- TOTAL ---
    const totalBoxY = finalY + 10;
    const totalBoxHeight = 20;
    const totalBoxWidth = 70;
    const totalBoxX = pageWidth - totalBoxWidth - 15;

    doc.setFillColor(0, 0, 0);
    doc.setGState(new doc.GState({ opacity: 0.15 }));
    doc.roundedRect(totalBoxX + 2, totalBoxY + 2, totalBoxWidth, totalBoxHeight, 3, 3, 'F');

    doc.setGState(new doc.GState({ opacity: 1 }));
    doc.setFillColor(...primaryColor);
    doc.roundedRect(totalBoxX, totalBoxY, totalBoxWidth, totalBoxHeight, 3, 3, 'F');

    doc.setDrawColor(...accentColor);
    doc.setLineWidth(1);
    doc.roundedRect(totalBoxX, totalBoxY, totalBoxWidth, totalBoxHeight, 3, 3, 'S');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL A PAGAR', totalBoxX + 5, totalBoxY + 8);

    doc.setFontSize(16);
    doc.text(`Bs ${venta.total.toFixed(2)}`, totalBoxX + totalBoxWidth - 5, totalBoxY + 16, { align: 'right' });

    // --- AGRADECIMIENTO ---
    const thanksY = totalBoxY + totalBoxHeight + 15;

    doc.setFillColor(...accentColor);
    doc.setGState(new doc.GState({ opacity: 0.1 }));
    doc.roundedRect(15, thanksY, pageWidth - 30, 15, 2, 2, 'F');

    doc.setGState(new doc.GState({ opacity: 1 }));
    doc.setTextColor(...primaryColor);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('¡Gracias por su compra!', pageWidth / 2, thanksY + 6, { align: 'center' });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...darkGray);
    doc.text('Su confianza es nuestro mayor compromiso', pageWidth / 2, thanksY + 11, { align: 'center' });

    // --- PIE DE PÁGINA ---
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.line(15, pageHeight - 25, pageWidth - 15, pageHeight - 25);

    doc.setTextColor(128, 128, 128);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text(`Documento generado el: ${formatearFechaCompleta(new Date().toISOString())}`, pageWidth / 2, pageHeight - 18, { align: 'center' });
    doc.text('Este documento es válido como comprobante de venta', pageWidth / 2, pageHeight - 13, { align: 'center' });

    doc.setFontSize(7);
    doc.text('Página 1 de 1', pageWidth / 2, pageHeight - 8, { align: 'center' });

    // --- ABRIR Y DESCARGAR ---
    const nombreArchivo = `venta_${venta.id_venta.slice(0, 8)}_${formatearFechaArchivo(venta.fecha)}.pdf`;
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);

    window.open(pdfUrl, '_blank');

    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = nombreArchivo;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(pdfUrl);
};

const formatearFechaCompleta = (fecha: string): string => {
    return new Date(fecha).toLocaleString('es-BO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const formatearFechaCorta = (fecha: string): string => {
    return new Date(fecha).toLocaleDateString('es-BO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
};

const formatearHora = (fecha: string): string => {
    return new Date(fecha).toLocaleTimeString('es-BO', {
        hour: '2-digit',
        minute: '2-digit'
    });
};

const formatearFechaArchivo = (fecha: string): string => {
    return new Date(fecha).toLocaleDateString('es-BO').replace(/\//g, '-');
};
