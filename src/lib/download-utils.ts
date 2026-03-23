import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export interface PhotoToDownload {
    url: string;
    filename: string;
}

/**
 * Downloads multiple photos as a single ZIP file.
 * @param photos Array of photo objects with url and desired filename in the zip.
 * @param zipFilename Name of the zip file to save (e.g., 'photos.zip').
 * @param onProgress Optional callback for progress updates.
 */
export async function downloadPhotosAsZip(
    photos: PhotoToDownload[],
    zipFilename: string,
    onProgress?: (current: number, total: number) => void
): Promise<void> {
    const zip = new JSZip();
    const total = photos.length;
    let successCount = 0;
    let failCount = 0;

    const downloadPromises = photos.map(async (photo, index) => {
        try {
            const response = await fetch(photo.url);
            if (!response.ok) throw new Error(`Failed to fetch ${photo.url}`);
            
            const blob = await response.blob();
            // Get file extension from URL or content-type if missing
            let filename = photo.filename;
            if (!filename.includes('.')) {
                const extension = blob.type.split('/')[1] || 'jpg';
                filename = `${filename}.${extension}`;
            }

            zip.file(filename, blob);
            successCount++;
        } catch (error) {
            console.error(`Error downloading photo ${photo.url}:`, error);
            failCount++;
        } finally {
            if (onProgress) {
                onProgress(successCount + failCount, total);
            }
        }
    });

    await Promise.all(downloadPromises);

    if (successCount === 0) {
        throw new Error('No photos were successfully downloaded.');
    }

    if (failCount > 0) {
        console.warn(`${failCount} photos failed to download and were skipped.`);
    }

    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, zipFilename);
}
