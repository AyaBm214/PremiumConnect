import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    const filename = searchParams.get('filename') || 'download.pdf';

    if (!url) {
        return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch file: ${response.statusText}`);

        const blob = await response.blob();
        const headers = new Headers();

        // Force download with the specified filename
        headers.set('Content-Disposition', `attachment; filename="${filename}"`);
        headers.set('Content-Type', response.headers.get('Content-Type') || 'application/pdf');

        return new NextResponse(blob, {
            status: 200,
            headers,
        });
    } catch (error) {
        console.error('Download proxy error:', error);
        return NextResponse.json({ error: 'Failed to download file' }, { status: 500 });
    }
}
