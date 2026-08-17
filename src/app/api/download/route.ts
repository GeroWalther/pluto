import { NextResponse } from 'next/server';
import { OrderStatus } from '@prisma/client';
import prisma from '@/db/db';
import { auth } from '@/lib/auth';
import { verifyDownloadToken } from '@/lib/download-token';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * The only way to reach a product file.
 *
 * Two independent checks have to pass: the link must carry a valid, unexpired
 * signature, and the signed-in user must own a PAID order containing that
 * item. A stolen link is therefore useless to anyone else, and a forged one
 * is useless to everyone.
 */
export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get('token');
  if (!token) {
    return NextResponse.json({ error: 'Missing download token.' }, { status: 400 });
  }

  const claim = verifyDownloadToken(token);
  if (!claim) {
    return NextResponse.json(
      { error: 'This download link is invalid or has expired. Open your library for a fresh one.' },
      { status: 403 }
    );
  }

  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Please sign in to download.' }, { status: 401 });
  }

  const item = await prisma.orderItem.findFirst({
    where: {
      id: claim.orderItemId,
      order: { buyerId: session.user.id, status: OrderStatus.PAID },
    },
    select: { fileUrls: true, fileNames: true },
  });

  if (!item) {
    return NextResponse.json(
      { error: 'You do not have access to this file.' },
      { status: 403 }
    );
  }

  const fileUrl = item.fileUrls[claim.fileIndex];
  if (!fileUrl) {
    return NextResponse.json({ error: 'File not found.' }, { status: 404 });
  }

  // Stream from storage through this route so the underlying storage URL is
  // never exposed to the browser.
  const upstream = await fetch(fileUrl);
  if (!upstream.ok || !upstream.body) {
    console.error(`[download] upstream fetch failed (${upstream.status}) for ${fileUrl}`);
    return NextResponse.json(
      { error: 'The file could not be retrieved. Please try again.' },
      { status: 502 }
    );
  }

  const filename = (item.fileNames[claim.fileIndex] ?? 'download').replace(/"/g, '');

  return new NextResponse(upstream.body, {
    headers: {
      'Content-Type':
        upstream.headers.get('content-type') ?? 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${filename}"`,
      ...(upstream.headers.get('content-length')
        ? { 'Content-Length': upstream.headers.get('content-length')! }
        : {}),
      'Cache-Control': 'private, no-store',
    },
  });
}
