import { randomUUID } from 'node:crypto';
import path from 'path';
import { getDB } from './db.js';

export const MAX_FILE_SIZE = 2 * 1024 * 1024;

function uploadsCollection() {
    return getDB().collection('uploads');
}

export async function initUploads() {
    await uploadsCollection().createIndex({ id: 1 }, { unique: true });
}

// Don't trust the client's declared type; check the magic bytes.
function detectImageType(buf) {
    if (buf.length >= 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
        return 'image/png';
    }
    if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
        return 'image/jpeg';
    }
    const head = buf.subarray(0, 6).toString('ascii');
    if (head === 'GIF87a' || head === 'GIF89a') {
        return 'image/gif';
    }
    return null;
}

// Returns { url, type, size } or null if the bytes aren't a supported image.
export async function saveImage(buf) {
    const type = detectImageType(buf);
    if (!type) return null;

    const id = randomUUID();
    await uploadsCollection().insertOne({ id, type, size: buf.length, data: buf, date: Date.now() });

    return { url: '/uploads/' + id, type, size: buf.length };
}

export async function deleteUpload(url) {
    try {
        await uploadsCollection().deleteOne({ id: path.basename(url) });
    } catch (err) {
        console.error('failed to delete upload:', err);
    }
}

// Express handler for GET /uploads/:id
export async function serveUpload(req, res) {
    const doc = await uploadsCollection().findOne({ id: req.params.id }, { projection: { _id: 0 } });
    if (!doc) {
        res.status(404).end();
        return;
    }

    // Mongo returns Binary; unwrap it to a Buffer
    const bytes = Buffer.from(doc.data.buffer.subarray(0, doc.data.length()));

    res.set({
        'Content-Type': doc.type,
        'Content-Length': bytes.length,
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'public, max-age=31536000, immutable',   // ids are random and never change
    });
    res.send(bytes);
}
