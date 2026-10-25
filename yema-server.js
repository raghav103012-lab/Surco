const https = require("https");

const LANG = {
  en: "English", es: "Spanish", fr: "French", hi: "Hindi", ta: "Tamil", te: "Telugu",
  kn: "Kannada", ml: "Malayalam", sa: "Sanskrit", ar: "Arabic", ur: "Urdu",
};

function post(body) {
  const data = JSON.stringify(body);
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: "text.pollinations.ai",
      path: "/openai",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data),
        "User-Agent": "SurcoYema/1.0",
      },
    }, (res) => {
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve({ status: res.statusCode, buf: Buffer.concat(chunks) }));
    });
    req.on("error", reject);
    req.setTimeout(40000, () => req.destroy(new Error("timeout")));
    req.write(data);
    req.end();
  });
}

function pull(payload) {
  const message = payload && payload.choices && payload.choices[0] && payload.choices[0].message;
  if (!message) return "";
  if (typeof message.content === "string") return message.content;
  if (Array.isArray(message.content)) return message.content.map((part) => part.text || part.content || "").join(" ");
  return "";
}

function prompt(lang, hint) {
  return [
    "You are Yema, a gardener in Manteca, California's Central Valley.",
    "Answer the question they actually asked. You can talk about any gardening need: when to plant, water, soil, heat, frost, shade, pots, compost, pests, what a leaf spot might be, pruning, harvest, and storage.",
    "A missing plant is not a reason to refuse. If a book line is included, use it and then answer the rest of the question. Do not say you only know the book.",
    "Talk in short sentences a person can say out loud. No headings, no bullet lists, no asterisks, no emoji.",
    "Summers are hot and dry. Winters are cool. Water deep and tell them to check the soil a few inches down. Do not invent a pesticide dose or a spray rate.",
    "Reply in " + (LANG[lang] || "English") + ". Three to six sentences.",
    hint ? "Book:\n" + hint : "No stored line. Answer from gardening practice.",
  ].join(" ");
}

async function yemaReply(body) {
  const text = String((body && body.text) || "").trim().slice(0, 2000);
  if (!text) throw new Error("empty");
  const hint = String((body && body.hint) || "").slice(0, 1400);
  const history = Array.isArray(body && body.history) ? body.history.slice(-8) : [];
  const messages = [
    { role: "system", content: prompt(body && body.lang, hint) },
    ...history.filter((item) => item && (item.role === "user" || item.role === "assistant") && item.content).map((item) => ({
      role: item.role,
      content: String(item.content).slice(0, 2000),
    })),
    { role: "user", content: text },
  ];
  let last = "";
  for (let attempt = 0; attempt < 2; attempt++) {
    const response = await post({
      model: attempt === 0 ? "openai" : "openai-fast",
      messages,
      max_tokens: 320,
      temperature: 0.5,
      private: true,
    });
    last = response.buf.toString("utf8");
    if (response.status !== 200) continue;
    let payload = null;
    try { payload = JSON.parse(last); } catch (error) { continue; }
    const clean = pull(payload).replace(/\s*\n+\s*/g, " ").trim();
    if (clean && !/^need to answer/i.test(clean)) return clean;
  }
  throw new Error(last.slice(0, 180) || "yema");
}

module.exports = { yemaReply };
