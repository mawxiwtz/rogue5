import http from 'http';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const hostname = 'localhost';
const port = 3000;

const basedir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'dist');

http.createServer(function (request, response) {
    console.log('request ', request.url);

    response.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    response.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');

    const filePath0 = path.join(basedir, request.url);
    const filePath = filePath0.endsWith('/') ? filePath0 + 'index.html' : filePath0;

    var extname = String(path.extname(filePath)).toLowerCase();
    var mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.mjs': 'text/javascript',
        '.css': 'text/css',
        '.wasm': 'application/wasm',
    };
    var contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, function (error, content) {
        if (error) {
            if (error.code == 'ENOENT') {
                response.writeHead(404, { 'Content-Type': 'text/html' });
                response.end('404 Not Found', 'utf-8');
            } else {
                response.writeHead(500);
                response.end('Sorry, internal server error: ' + error.code + ' ..\n');
            }
        } else {
            response.writeHead(200, { 'Content-Type': contentType });
            response.end(content, 'utf-8');
        }
    });
}).listen(port, hostname);
console.log(`Server running at http://${hostname}:${port}/`);
