import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Property } from './types';

export const generatePropertyPDF = (property: Property) => {
    const doc = new jsPDF();
    const data = property.data;

    // Header
    doc.setFontSize(22);
    doc.setTextColor(220, 53, 69); // Red color matching logo
    doc.text('Premium Booking', 14, 20);

    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(data.info?.propertyName || 'Property Details', 14, 30);

    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 36);

    let finalY = 40;

    // 1. Basic Info
    autoTable(doc, {
        startY: finalY,
        head: [['Basic Info', 'Details']],
        body: [
            ['Type', data.info?.type || '-'],
            ['Address', data.info?.address || '-'],
            ['Floor', data.info?.floorNumber || '-'],
            ['Size', data.info?.size || '-'],
            ['Rooms', `${data.info?.numRooms || 0} Bed / ${data.info?.numBathrooms || 0} Bath`],
        ],
        theme: 'grid',
        headStyles: { fillColor: [220, 53, 69] }
    });

    finalY = (doc as any).lastAutoTable.finalY + 10;

    // 2. Rules & Fees
    autoTable(doc, {
        startY: finalY,
        head: [['Rules & Fees', 'Value']],
        body: [
            ['Smoking Allowed', data.rules?.smoking ? 'Yes' : 'No'],
            ['Pets Allowed', data.rules?.pets ? `Yes (Max: ${data.rules.maxPets || 'Any'})` : 'No'],
            ['Events Allowed', data.rules?.events ? 'Yes' : 'No'],
            ['Cleaning Fee', data.rules?.cleaningFee ? `$${data.rules.cleaningFee}` : '$0'],

            ['Max Guests', data.rules?.maxGuests?.toString() || 'N/A'],
            ['Quiet Hours', data.rules?.quietHours || 'None'],
        ],
        theme: 'grid',
        headStyles: { fillColor: [70, 70, 70] }
    });

    finalY = (doc as any).lastAutoTable.finalY + 10;

    // 3. Amenities
    if (data.amenities?.length) {
        doc.text('Amenities:', 14, finalY);
        finalY += 5;
        const amenities = data.amenities.join(', ');
        const splitAmenities = doc.splitTextToSize(amenities, 180);
        doc.text(splitAmenities, 14, finalY);
        finalY += (splitAmenities.length * 5) + 10;
    }

    // 4. Access & Guide
    if (data.access?.instructions) {
        doc.text('Access Instructions:', 14, finalY);
        finalY += 5;
        const instructions = doc.splitTextToSize(data.access.instructions, 180);
        doc.text(instructions, 14, finalY);
        finalY += (instructions.length * 5) + 10;
    }

    // Save
    doc.save(`${data.info?.propertyName || 'property'}_details.pdf`);
};

export const downloadRemoteFile = async (url: string, filename: string) => {
    try {
        // Use our server-side proxy to bypass CORS and force download
        const proxyUrl = `/api/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`;

        const response = await fetch(proxyUrl);

        if (!response.ok) {
            throw new Error(`Proxy error! status: ${response.status}`);
        }

        const blob = await response.blob();

        if (blob.size < 100) {
            throw new Error('Downloaded blob is too small.');
        }

        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
        console.error('Proxy download failed:', error);
        // Final fallback: Just open the URL.
        window.open(url, '_blank');
    }
};
