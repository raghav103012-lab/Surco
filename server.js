const http = require("http");
const fs = require("fs");
const path = require("path");
const { yemaStream } = require("./yema-server");

const root = __dirname;
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".bin": "application/octet-stream",
};

const server = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split("?")[0]);
  if (req.method === "POST" && url === "/api/yema") {
    const chunks = [];
    req.on("data", (chunk) => {
      chunks.push(chunk);
      if (Buffer.concat(chunks).length > 200000) req.destroy();
    });
    req.on("end", () => {
      let body = {};
      try { body = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}"); } catch (error) { body = {}; }
      let started = false;
      const head = () => {
        if (started) return;
        started = true;
        res.writeHead(200, {
          "Content-Type": "application/x-ndjson; charset=utf-8",
          "Cache-Control": "no-cache",
          "X-Accel-Buffering": "no",
        });
      };
      yemaStream(body, (piece) => {
        head();
        res.write(JSON.stringify({ t: piece }) + "\n");
      }).then((reply) => {
        head();
        res.end(JSON.stringify({ done: true, reply }) + "\n");
      }).catch(() => {
        if (!started) {
          res.writeHead(502, { "Content-Type": "application/x-ndjson; charset=utf-8" });
        }
        res.end(JSON.stringify({ error: "yema" }) + "\n");
      });
    });
    return;
  }
  const rel = url === "/" ? "/index.html" : url;
  const file = path.normalize(path.join(root, rel));
  if (!file.startsWith(root)) {
    res.writeHead(403);
    res.end();
    return;
  }
  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    res.writeHead(200, {
      "Content-Type": types[path.extname(file)] || "application/octet-stream",
      "Cache-Control": "no-cache",
    });
    res.end(data);
  });
});

const port = Number(process.env.PORT) || 5173;
const host = process.env.PORT ? "0.0.0.0" : "127.0.0.1";
server.listen(port, host, () => {
  console.log(`Surco http://${host}:${port}`);
});
