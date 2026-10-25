const { yemaReply } = require("../yema-server");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "yema" });
    return;
  }
  try {
    const reply = await yemaReply(req.body || {});
    res.status(200).json({ reply });
  } catch (error) {
    res.status(502).json({ error: "yema" });
  }
};
