const { yemaStream } = require("../yema-server");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "yema" });
    return;
  }
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
  try {
    const reply = await yemaStream(req.body || {}, (piece) => {
      head();
      res.write(JSON.stringify({ t: piece }) + "\n");
    });
    head();
    res.end(JSON.stringify({ done: true, reply }) + "\n");
  } catch (error) {
    if (!started) res.writeHead(502, { "Content-Type": "application/x-ndjson; charset=utf-8" });
    res.end(JSON.stringify({ error: "yema" }) + "\n");
  }
};
