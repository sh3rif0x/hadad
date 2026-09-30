const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const PORT = 5500;

const TYPES = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".webp": "image/jpeg",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon"
};

function send(res, file, status = 200) {
    fs.readFile(file, (err, data) => {
        if (err) {
            res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
            return res.end("404 Not Found");
        }
        res.writeHead(status, {
            "Content-Type": TYPES[path.extname(file).toLowerCase()] || "application/octet-stream"
        });
        res.end(data);
    });
}

http.createServer((req, res) => {
    const urlPath = decodeURIComponent(req.url.split("?")[0]);
    let file = path.join(ROOT, urlPath);

    if (!file.startsWith(ROOT)) {
        res.writeHead(403);
        return res.end("Forbidden");
    }

    // /services/<slug>  and  /blog/<slug>  ->  that section's index.html
    const match = urlPath.match(/^\/(services|blog)\/[^/.]+\/?$/);
    if (match) {
        return send(res, path.join(ROOT, match[1], "index.html"));
    }

    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
        file = path.join(file, "index.html");
    }

    send(res, file);
}).listen(PORT, () => console.log(`http://localhost:${PORT}`));
