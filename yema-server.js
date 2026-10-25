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
    "Reply in " + (LANG[lang] || "English") + ". Two or three short sentences.",
    hint ? "Book:\n" + hint : "No stored line. Answer from gardening practice.",
  ].join(" ");
}

function messagesFor(body) {
  const text = String((body && body.text) || "").trim().slice(0, 2000);
  if (!text) throw new Error("empty");
  const hint = String((body && body.hint) || "").slice(0, 1400);
  const history = Array.isArray(body && body.history) ? body.history.slice(-8) : [];
  return [
    { role: "system", content: prompt(body && body.lang, hint) },
    ...history.filter((item) => item && (item.role === "user" || item.role === "assistant") && item.content).map((item) => ({
      role: item.role,
      content: String(item.content).slice(0, 2000),
    })),
    { role: "user", content: text },
  ];
}

function streamOnce(model, messages, onText) {
  const data = JSON.stringify({
    model,
    messages,
    max_tokens: 220,
    temperature: 0.5,
    private: true,
    stream: true,
  });
  return new Promise((resolve, reject) => {
    let got = "";
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
      if (res.statusCode !== 200) {
        res.resume();
        resolve("");
        return;
      }
      let buf = "";
      res.on("data", (chunk) => {
        buf += chunk.toString("utf8");
        const lines = buf.split(/\r?\n/);
        buf = lines.pop();
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const payload = trimmed.slice(5).trim();
          if (!payload || payload === "[DONE]") continue;
          let json = null;
          try { json = JSON.parse(payload); } catch (error) { continue; }
          const choice = json.choices && json.choices[0];
          const delta = choice && (choice.delta || choice.message);
          let text = "";
          if (delta && typeof delta.content === "string") text = delta.content;
          else if (delta && Array.isArray(delta.content)) text = delta.content.map((part) => part.text || "").join("");
          text = text.replace(/\s*\n+\s*/g, " ");
          if (!text) continue;
          got += text;
          onText(text);
        }
      });
      res.on("end", () => resolve(got));
    });
    req.on("error", reject);
    req.setTimeout(25000, () => req.destroy(new Error("timeout")));
    req.write(data);
    req.end();
  });
}

async function yemaReply(body) {
  const messages = messagesFor(body);
  let last = "";
  for (const model of ["openai-fast", "openai"]) {
    const response = await post({
      model,
      messages,
      max_tokens: 220,
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

async function yemaStream(body, onText) {
  const messages = messagesFor(body);
  let streamed = false;
  let got = "";
  try {
    got = await streamOnce("openai-fast", messages, (piece) => {
      streamed = true;
      onText(piece);
    });
  } catch (error) {
    got = "";
  }
  const clean = String(got || "").replace(/\s+/g, " ").trim();
  if (clean && !/^need to answer/i.test(clean)) return clean;
  if (streamed) return clean;
  const full = await yemaReply(body);
  onText(full);
  return full;
}

module.exports = { yemaReply, yemaStream };
