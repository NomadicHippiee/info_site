import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';

const routes = {
    '/': './public/index.html',
    '/about': './public/about.html',
    '/contact-me': './public/contact-me.html',
};

async function buildPage(pagePath) {
    try {
        const header = await readFile('./public/header.html', 'utf8');
        const page = await readFile(pagePath, 'utf8');
        const footer = await readFile('./public/footer.html', 'utf8');
        return header + page + footer;
    } catch (err) {
        throw err;
    }
    
}

async function handleRequest(req, res) {
    try {
        const requestPath = req.url;
        const pagePath = routes[requestPath];

        if (!pagePath) {
            const notFoundHTML = await buildPage('./public/404.html');
            res.writeHead(404, { 'Content-Type': 'text/html'});
            res.end(notFoundHTML);
            return;
        }

        const html = await buildPage(pagePath);
        res.writeHead(200, { 'Content-Type': 'text/html'});
        res.end(html);
    } catch (err) {
        console.error('Error:', err.message);
        res.writeHead(500, { 'Content-Type': 'text/plain'});
        res.end('500 Server Error');
    }
    
}

const server = createServer(handleRequest);
const PORT = 8080;

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log(`Available routes:`, Object.keys(routes));
})