import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    let filename = searchParams.get('filename') || 'download.pdf';

    if (!url) {
        return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Failed to fetch file from Supabase: ${response.status} ${response.statusText}`, { url });
            throw new Error(`Failed to fetch file: ${response.statusText}`);
        }

        const blob = await response.blob();
        const contentType = response.headers.get('Content-Type') || 'application/octet-stream';
        const headers = new Headers();

        // Adjust filename extension if it's an image but filename says .pdf
        if (contentType.startsWith('image/') && filename.toLowerCase().endsWith('.pdf')) {
            const ext = contentType.split('/')[1] || 'png';
            filename = filename.replace(/\.pdf$/i, `.${ext}`);
        }

        // Force download with the correct filename
        headers.set('Content-Disposition', `attachment; filename="${filename}"`);
        headers.set('Content-Type', contentType);

        return new NextResponse(blob, {
            status: 200,
            headers,
        });
    } catch (error) {
        console.error('Download proxy error:', error);
        return NextResponse.json({
            error: 'Failed to download file',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
