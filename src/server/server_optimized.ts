
import { setHttpCallback } from '@citizenfx/http-wrapper';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as Koa from 'koa';
import * as Router from 'koa-router';
import * as koaBody from 'koa-body';
import * as mv from 'mv';
import { File } from 'formidable';

const app = new Koa();
const router = new Router();

class UploadData {
    fileName: string;
    cb: (err: string | boolean, data: string) => void;
}

const uploads: { [token: string]: UploadData } = {};

// Improved error handling and logging
function handleUploadError(token: string, err: string) {
    if (uploads[token]) {
        uploads[token].cb(err, '');
        delete uploads[token];
    }
    console.error(`Upload failed for token: ${token} - ${err}`);
}

// Router configuration
router.post('/upload', koaBody({ multipart: true }), async (ctx) => {
    const { files } = ctx.request.body as { files: { [key: string]: File } };
    const token = uuidv4();

    try {
        const file = files.file;
        const fileName = `${token}_${file.name}`;
        const filePath = `/path/to/upload/directory/${fileName}`;

        mv(file.path, filePath, (err) => {
            if (err) {
                handleUploadError(token, err.message);
                ctx.status = 500;
                ctx.body = 'Failed to move file';
                return;
            }

            if (uploads[token]) {
                uploads[token].cb(false, fileName);
                delete uploads[token];
            }

            ctx.status = 200;
            ctx.body = { token, fileName };
        });
    } catch (error) {
        handleUploadError(token, error.message);
        ctx.status = 500;
        ctx.body = 'Upload failed';
    }
});

setHttpCallback(app.callback());

// Example of setting an upload
function setUploadCallback(cb: (err: string | boolean, data: string) => void): string {
    const token = uuidv4();
    uploads[token] = { fileName: '', cb };
    return token;
}
