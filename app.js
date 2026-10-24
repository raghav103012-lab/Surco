const data = window.SURCO_DATA;
const panel = document.getElementById("panel");
const tabsEl = document.getElementById("tabs");

const TABS = [
  { id: "home", label: "Home" },
  { id: "orchard", label: "Orchard" },
  { id: "garden", label: "Garden" },
  { id: "stand", label: "Stand" },
  { id: "field", label: "Field" },
  { id: "check", label: "Check" },
  { id: "score", label: "Score" },
];

const GROUPS = {
  orchard: ["Walnut", "Almond", "Apple", "Pear", "Peach", "Cherry", "Fig", "Orange", "Lemon", "Avocado", "Grape", "Pomegranate"],
  garden: ["Tomato", "Strawberry", "Pepper", "Chili", "Eggplant", "Blueberry", "Basil", "Lettuce", "Spinach", "Cabbage", "Broccoli", "Asparagus", "Cucumber", "Okra", "Watermelon", "Carrot", "Beet", "Potato", "Garlic", "Pumpkin", "Kale", "Onion"],
  stand: ["Pineapple", "Banana", "Kiwi", "Mango", "Papaya"],
  field: ["Corn", "Wheat", "Sunflower"],
};

const PREVIEW = ["Walnut", "Peach", "Apple", "Orange", "Grape", "Fig", "Cherry", "Almond", "Tomato", "Strawberry", "Eggplant", "Lettuce", "Garlic", "Beet", "Corn", "Sunflower", "Papaya", "Mango"];

const GROUP_BLURB = {
  orchard: "Trees and vines. Shake the nuts when the hull says so. Taste citrus and stone fruit before you pick the tree.",
  garden: "Rows you can reach. Most of these want a look every day or two, or the fruit gets away from you.",
  stand: "Fruit that finishes in a bowl as often as on the plant. Smell and a little give beat color.",
  field: "The big crops. Corn, wheat, and the sunflower row.",
};

const state = {
  ready: false,
  status: { key: "reading" },
  lang: "en",
  threshold: 0,
  model: null,
  stream: null,
  tab: "home",
  screen: "tab",
  last: null,
};

const LABELS = { pick: "Pick", wait: "Wait", flag: "Flag", ask: "Ask" };
const RTL = new Set(["ar", "ur", "ks"]);
const VOICE_LANG = {
  en: "en-US", es: "es-ES", fr: "fr-FR", ta: "ta-IN", te: "te-IN", kn: "kn-IN", ml: "ml-IN",
  hi: "hi-IN", bn: "bn-IN", brx: "hi-IN", doi: "hi-IN", gu: "gu-IN", ks: "ur-PK", kok: "hi-IN",
  mai: "hi-IN", mr: "mr-IN", ne: "ne-NP", pa: "pa-IN", sa: "hi-IN", ar: "ar-SA", ur: "ur-PK",
};
let voiceOn = false;
let hearing = false;
let recognition = null;
let submitLine = function () {};

function t(key, vars) {
  const pack = window.SURCO_I18N && window.SURCO_I18N[state.lang] && window.SURCO_I18N[state.lang].ui;
  const en = window.SURCO_I18N && window.SURCO_I18N.en && window.SURCO_I18N.en.ui;
  let text = (pack && pack[key]) || (en && en[key]) || key;
  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      text = text.split("{" + name + "}").join(String(value));
    }
  }
  return text;
}

function statusText() {
  if (state.status && state.status.key) return t(state.status.key, state.status.vars);
  return state.status || "";
}

function cropName(name) {
  const pack = window.SURCO_I18N && window.SURCO_I18N[state.lang];
  return (pack && pack.crops && pack.crops[name]) || name;
}

function note(photo) {
  if (state.lang === "es") return { call: photo.es, care: photo.careEs };
  if (state.lang === "en") return { call: photo.en, care: photo.care };
  const row = window.SURCO_NOTES && window.SURCO_NOTES[state.lang] && window.SURCO_NOTES[state.lang][photo.id];
  if (!row) return { call: photo.en, care: photo.care };
  return { call: row[0], care: row[1] };
}

function labelWord(label) {
  return t("label_" + label);
}

function applyChrome() {
  document.documentElement.lang = state.lang;
  document.documentElement.dir = RTL.has(state.lang) ? "rtl" : "ltr";
  const current = (window.SURCO_LANGS || []).find((item) => item.id === state.lang);
  const openLang = document.getElementById("open-lang");
  if (openLang && current) openLang.textContent = current.label;
  const title = document.getElementById("lang-title");
  if (title) title.textContent = t("language");
  const note = document.getElementById("lang-note");
  if (note) note.textContent = t("langNote");
  const closeLangBtn = document.getElementById("close-lang");
  if (closeLangBtn) closeLangBtn.textContent = t("chatClose");
  document.getElementById("open-chat").textContent = t("chatButton");
  document.querySelector("#chat .chat-head p").textContent = t("chatTitle");
  document.getElementById("close-chat").textContent = t("chatClose");
  document.getElementById("chat-send").textContent = t("chatSend");
  document.getElementById("chat-input").placeholder = t("chatPlaceholder");
  const voiceBtn = document.getElementById("voice-toggle");
  if (voiceBtn) voiceBtn.textContent = voiceOn ? t("voiceStop") : t("voice");
  const mic = document.getElementById("voice-mic");
  if (mic) mic.setAttribute("aria-label", t("voiceListen"));
  for (const button of document.querySelectorAll("#langs button")) {
    button.setAttribute("aria-selected", String(button.dataset.lang === state.lang));
  }
  const log = document.getElementById("chat-log");
  if (log && log.childElementCount === 1 && log.firstChild.classList.contains("bot")) {
    log.firstChild.textContent = t("chatHello");
  }
}

function openLangSheet() {
  const sheet = document.getElementById("lang-sheet");
  if (!sheet) return;
  sheet.hidden = false;
  document.getElementById("open-lang").setAttribute("aria-expanded", "true");
  const selected = sheet.querySelector("[aria-selected='true']");
  if (selected) selected.focus();
}

function closeLangSheet(focusBack) {
  const sheet = document.getElementById("lang-sheet");
  if (!sheet || sheet.hidden) return;
  sheet.hidden = true;
  const open = document.getElementById("open-lang");
  if (!open) return;
  open.setAttribute("aria-expanded", "false");
  if (focusBack) open.focus();
}

function setLang(id) {
  state.lang = id;
  try { localStorage.setItem("surco-lang", id); } catch (error) { /* private mode */ }
  if (recognition) recognition.lang = VOICE_LANG[id] || "en-US";
  stopTalking();
  applyChrome();
  closeLangSheet(false);
  paint();
}

function setupLang() {
  let saved = "en";
  try { saved = localStorage.getItem("surco-lang") || "en"; } catch (error) { /* private mode */ }
  const known = (window.SURCO_LANGS || []).some((item) => item.id === saved);
  state.lang = known ? saved : "en";
  const nav = document.getElementById("langs");
  const opener = document.getElementById("open-lang");
  if (!nav || !window.SURCO_LANGS || !opener) {
    applyChrome();
    return;
  }
  nav.innerHTML = "";
  window.SURCO_LANGS.forEach((item, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.lang = item.id;
    button.setAttribute("role", "option");
    button.style.setProperty("--i", String(index));
    button.classList.add(["wash-green", "wash-gold", "wash-berry", "wash-blue", "wash-plum"][index % 5]);
    const name = document.createElement("span");
    name.className = "lang-name";
    name.textContent = item.label;
    const latin = document.createElement("span");
    latin.className = "lang-latin";
    latin.textContent = item.latin || "";
    button.append(name, latin);
    button.addEventListener("click", () => setLang(item.id));
    nav.appendChild(button);
  });
  opener.addEventListener("click", () => {
    const sheet = document.getElementById("lang-sheet");
    if (sheet.hidden) openLangSheet();
    else closeLangSheet(false);
  });
  document.getElementById("close-lang").addEventListener("click", () => closeLangSheet(true));
  document.querySelector(".lang-veil").addEventListener("click", () => closeLangSheet(true));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeLangSheet(true);
  });
  applyChrome();
}

function openTab(id) {
  if (state.tab === "check" && id !== "check") stopCamera();
  state.tab = id;
  state.screen = "tab";
  state.last = null;
  paint();
  window.scrollTo(0, 0);
}

function paint() {
  renderTabs();
  panel.innerHTML = "";
  if (state.screen === "verdict" && state.last) {
    renderVerdict(state.last.el, state.last.hit);
    return;
  }
  if (state.tab === "home") renderHome();
  else if (state.tab === "check") renderCheck();
  else if (state.tab === "score") renderScore();
  else renderGroup(state.tab);
}

function renderTabs() {
  tabsEl.innerHTML = "";
  for (const tab of TABS) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = t(tab.id);
    button.setAttribute("aria-selected", String(state.tab === tab.id));
    button.addEventListener("click", () => openTab(tab.id));
    tabsEl.appendChild(button);
  }
}

function renderHome() {
  const intro = document.createElement("div");
  intro.className = "hero";
  const heading = document.createElement("h1");
  heading.textContent = "Surco";
  const lead = document.createElement("p");
  lead.className = "lead";
  lead.textContent = t("lead");
  intro.append(heading, lead);
  panel.appendChild(intro);

  const orbs = document.createElement("div");
  orbs.className = "orbs";
  for (const name of PREVIEW) {
    const photo = data.book.find((item) => item.crop === name);
    if (!photo) continue;
    const orb = document.createElement("button");
    orb.type = "button";
    orb.className = "orb";
    orb.innerHTML = `<img alt="" src="${photo.src}" /><span>${cropName(name)}</span>`;
    const group = Object.keys(GROUPS).find((key) => GROUPS[key].includes(name));
    orb.addEventListener("click", () => {
      openTab(group);
      requestAnimationFrame(() => {
        const el = document.getElementById("plant-" + name);
        if (el) el.scrollIntoView({ block: "start" });
      });
    });
    orbs.appendChild(orb);
  }
  panel.appendChild(orbs);

  const total = Object.values(GROUPS).reduce((sum, names) => sum + names.length, 0);
  const more = document.createElement("p");
  more.className = "more";
  more.textContent = t("more", { n: total - PREVIEW.length });
  panel.appendChild(more);

  const jump = document.createElement("div");
  jump.className = "jump";
  for (const tab of TABS) {
    if (!GROUPS[tab.id]) continue;
    const section = document.createElement("button");
    section.type = "button";
    section.className = "section";
    const title = document.createElement("span");
    title.className = "section-name";
    title.textContent = t(tab.id);
    const count = document.createElement("span");
    count.className = "section-count";
    count.textContent = t("plants", { n: GROUPS[tab.id].length });
    const blurb = document.createElement("span");
    blurb.className = "section-blurb";
    blurb.textContent = t("blurb_" + tab.id);
    section.append(title, count, blurb);
    section.addEventListener("click", () => openTab(tab.id));
    jump.appendChild(section);
  }
  panel.appendChild(jump);

  const go = document.createElement("button");
  go.className = "primary";
  go.id = "open-look";
  go.type = "button";
  go.textContent = state.ready ? t("checkPlant") : t("reading");
  go.disabled = !state.ready;
  go.addEventListener("click", () => openTab("check"));
  const status = document.createElement("p");
  status.className = "status";
  status.textContent = statusText();
  panel.append(go, status);
}

function framesFor(name) {
  return data.book.filter((photo) => photo.crop === name);
}

function renderGroup(id) {
  const title = document.createElement("h1");
  title.textContent = t(id);
  const blurb = document.createElement("p");
  blurb.className = "lead";
  blurb.textContent = t("blurb_" + id);
  panel.append(title, blurb);

  for (const name of GROUPS[id]) {
    const article = document.createElement("article");
    article.className = "plant";
    article.id = "plant-" + name;
    const heading = document.createElement("h2");
    heading.textContent = cropName(name);
    article.appendChild(heading);
    for (const photo of framesFor(name)) {
      const frame = document.createElement("div");
      frame.className = "frame";
      const text = note(photo);
      const where = photo.row ? t("row", { n: photo.row }) : "";
      frame.innerHTML = `
        <img alt="" src="${photo.src}" />
        <div>
          <p class="tag ${photo.label}">${labelWord(photo.label)}${where}</p>
          <p class="call"></p>
          <p class="care"></p>
        </div>`;
      frame.querySelector(".call").textContent = text.call;
      frame.querySelector(".care").textContent = text.care;
      article.appendChild(frame);
    }
    panel.appendChild(article);
  }
}

function renderCheck() {
  const title = document.createElement("h1");
  title.textContent = t("check");
  const blurb = document.createElement("p");
  blurb.className = "lead";
  blurb.textContent = t("checkLead");

  const finder = document.createElement("div");
  finder.className = "finder";
  const video = document.createElement("video");
  video.autoplay = true;
  video.playsInline = true;
  video.muted = true;
  const hint = document.createElement("p");
  hint.className = "hint";
  hint.textContent = t("hold");
  finder.append(video, hint);

  const tools = document.createElement("div");
  tools.className = "tools";
  const fileLabel = document.createElement("label");
  fileLabel.className = "filebtn";
  fileLabel.textContent = t("upload");
  const file = document.createElement("input");
  file.type = "file";
  file.accept = "image/*";
  file.addEventListener("change", () => {
    const chosen = file.files && file.files[0];
    if (!chosen) return;
    const img = new Image();
    img.onload = () => decide(img, img);
    img.src = URL.createObjectURL(chosen);
  });
  fileLabel.appendChild(file);
  const shutter = document.createElement("button");
  shutter.className = "shutter";
  shutter.type = "button";
  shutter.disabled = !state.ready;
  shutter.setAttribute("aria-label", "Take photo");
  shutter.addEventListener("click", () => capture(video));
  tools.append(shutter, fileLabel);

  const note = document.createElement("p");
  note.className = "note";
  note.textContent = t("samples");
  const strip = document.createElement("div");
  strip.className = "samples";
  for (const sample of data.samples) {
    const button = document.createElement("button");
    button.type = "button";
    const sampleLabel = sample.expect === "ask" ? t("tooFar") : cropName(sample.expectCrop || sample.name);
    button.innerHTML = `<img alt="" src="${sample.src}" /><span>${sampleLabel}</span>`;
    button.addEventListener("click", async () => {
      const img = await loadImage(sample.src);
      decide(img, null, sample);
    });
    strip.appendChild(button);
  }

  panel.append(title, blurb, finder, tools, note, strip);
  startCamera(video, hint);
}

function renderVerdict(nowEl, hit) {
  const label = hit.label;
  panel.className = "";
  const wrap = document.createElement("div");
  wrap.className = `verdict ${label}`;
  const word = document.createElement("h1");
  word.className = "word";
  word.textContent = labelWord(label);
  const meta = document.createElement("p");
  meta.className = "meta";
  const sim = hit.similarity.toFixed(2);
  if (hit.accepted) {
    const where = hit.photo.row ? t("row", { n: hit.photo.row }) : "";
    meta.textContent = t("metaMatch", { crop: cropName(hit.photo.crop), where, sim });
  } else {
    meta.textContent = t("metaAsk", { crop: cropName(hit.photo.crop), sim });
  }

  const pair = document.createElement("div");
  pair.className = "pair";
  const nowFig = document.createElement("figure");
  const shot = document.createElement("img");
  shot.alt = "The photo just taken";
  shot.src = nowEl.tagName === "CANVAS" ? nowEl.toDataURL("image/jpeg", 0.85) : nowEl.src;
  const nowCap = document.createElement("figcaption");
  nowCap.textContent = t("now");
  nowFig.append(shot, nowCap);
  pair.appendChild(nowFig);

  if (hit.accepted) {
    const thenFig = document.createElement("figure");
    thenFig.innerHTML = `<img alt="" src="${hit.photo.src}" /><figcaption>${t("inBook")}</figcaption>`;
    pair.appendChild(thenFig);
  }

  const says = document.createElement("p");
  says.className = "says";
  const care = document.createElement("p");
  care.className = "care";
  if (hit.accepted) {
    const text = note(hit.photo);
    says.textContent = text.call;
    care.textContent = text.care;
  } else {
    says.textContent = t("askLine");
  }

  const back = document.createElement("button");
  back.className = "ghost";
  back.type = "button";
  back.textContent = t("back");
  back.addEventListener("click", () => openTab("check"));

  wrap.append(word, meta, pair, says);
  if (hit.accepted) wrap.append(care);
  wrap.appendChild(back);
  panel.appendChild(wrap);
  burst();
}

function renderScore() {
  if (!state.ready) {
    const waiting = document.createElement("h1");
    waiting.textContent = t("score");
    const note = document.createElement("p");
    note.className = "note";
    note.textContent = t("reading");
    panel.append(waiting, note);
    return;
  }
  const queries = data.heldout;
  let matched = 0;
  let asked = 0;
  let held = 0;
  let wrong = 0;
  for (const query of queries) {
    const kind = outcome(query);
    if (kind === "Match") matched += 1;
    else if (kind === "Asked") asked += 1;
    else if (kind === "Held back") held += 1;
    else wrong += 1;
  }
  const head = document.createElement("div");
  const scoreTitle = document.createElement("h1");
  scoreTitle.textContent = t("score");
  const stats = document.createElement("div");
  stats.className = "stats";
  for (const [value, key] of [[matched, "matched"], [asked, "asked"], [held, "held"], [wrong, "wrong"]]) {
    const stat = document.createElement("div");
    stat.className = "stat";
    const strong = document.createElement("b");
    strong.textContent = value;
    const span = document.createElement("span");
    span.textContent = t(key);
    stat.append(strong, span);
    stats.appendChild(stat);
  }
  const scoreNote = document.createElement("p");
  scoreNote.className = "note";
  scoreNote.textContent = t("scoreNote");
  head.append(scoreTitle, stats, scoreNote);
  panel.appendChild(head);

  for (const query of queries) {
    const kind = outcome(query);
    const row = document.createElement("div");
    row.className = "score-row";
    const near = query.nearest;
    const want = query.expect === "ask" ? labelWord("ask") : `${cropName(query.expectCrop)} ${labelWord(query.expect)}`;
    const got = near ? `${cropName(near.crop)} ${labelWord(near.label)} ${query.similarity.toFixed(2)}` : t("noNeighbor");
    const img = document.createElement("img");
    img.alt = "";
    img.src = query.src;
    const copy = document.createElement("p");
    copy.textContent = t("scoreRow", { note: query.note, got, want });
    const badge = document.createElement("span");
    badge.className = "badge";
    badge.textContent = t({ Match: "matched", Asked: "asked", "Held back": "held", Wrong: "wrong" }[kind] || "wrong");
    row.append(img, copy, badge);
    panel.appendChild(row);
  }

  const method = document.createElement("p");
  method.className = "method";
  method.textContent = t("method");
  panel.appendChild(method);
}

function cosine(a, b) {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

function rank(vec) {
  const scored = data.book.map((photo) => ({ photo, similarity: cosine(vec, photo.embedding) }));
  scored.sort((a, b) => b.similarity - a.similarity);
  const best = scored[0];
  const rival = scored.find((row) => row.photo.crop !== best.photo.crop) || best;
  const margin = best.similarity - rival.similarity;
  const backed = scored.length > 1 && scored[1].photo.crop === best.photo.crop;
  const accepted = best.similarity >= 0.7 || (backed && best.similarity >= 0.52 && margin >= 0.08);
  return {
    photo: best.photo,
    similarity: best.similarity,
    margin,
    accepted,
    label: accepted ? best.photo.label : "ask",
  };
}

function nearest(vec) {
  return rank(vec);
}

function sameCall(query) {
  if (!query.nearest) return false;
  if (query.nearest.label !== query.expect) return false;
  if (query.expectCrop && query.nearest.crop !== query.expectCrop) return false;
  return true;
}

function tuneThreshold() {
  for (const query of [...data.samples, ...data.heldout]) {
    const hit = rank(query.embedding);
    query.nearest = hit.photo;
    query.similarity = hit.similarity;
    query.accepted = hit.accepted;
    query.margin = hit.margin;
  }
}

function outcome(query) {
  const refused = query.expect === "ask" || !sameCall(query);
  if (!query.accepted && refused) return "Asked";
  if (!query.accepted) return "Held back";
  if (refused) return "Wrong";
  return "Match";
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(src));
    img.src = src;
  });
}

async function embedElement(el) {
  const tensor = state.model.infer(el, true);
  const raw = await tensor.data();
  tensor.dispose();
  let norm = 0;
  for (let i = 0; i < raw.length; i++) norm += raw[i] * raw[i];
  norm = Math.sqrt(norm) || 1;
  const out = new Float32Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw[i] / norm;
  return out;
}

async function startCamera(video, hint) {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    hint.textContent = "No camera here. Use a sample.";
    return;
  }
  try {
    state.stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" } },
      audio: false,
    });
    video.srcObject = state.stream;
  } catch (err) {
    hint.textContent = "Camera is blocked. Use a sample.";
  }
}

function stopCamera() {
  if (!state.stream) return;
  for (const track of state.stream.getTracks()) track.stop();
  state.stream = null;
}

async function capture(video) {
  if (!video.videoWidth) return;
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext("2d").drawImage(video, 0, 0);
  const img = new Image();
  img.onload = () => decide(img, canvas);
  img.src = canvas.toDataURL("image/jpeg", 0.92);
}

async function decide(displayEl, embedEl, sample) {
  if (!state.ready) return;
  const source = embedEl || displayEl;
  const embedding = sample && sample.embedding ? sample.embedding : await embedElement(source);
  const hit = nearest(embedding);
  tick();
  state.screen = "verdict";
  state.last = { el: displayEl.tagName === "CANVAS" ? displayEl : displayEl, hit };
  stopCamera();
  paint();
  window.scrollTo(0, 0);
}

function tick() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;
  const ctx = new AudioCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.value = 196;
  gain.gain.setValueAtTime(0.03, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.08);
}

function makeBubbles() {
  const layer = document.getElementById("bubbles");
  if (!layer || layer.childElementCount) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const tints = ["", "tint-green", "tint-gold", "tint-pink", "tint-blue"];
  for (let i = 0; i < 14; i++) {
    const bubble = document.createElement("span");
    bubble.className = "bubble " + (i % 3 === 0 ? "dew " : "") + tints[i % tints.length];
    const size = i % 3 === 0 ? 7 + (i % 4) * 2 : 14 + ((i * 5) % 18);
    bubble.style.width = size + "px";
    bubble.style.height = size + "px";
    bubble.style.left = (i % 2 === 0 ? (i * 2) % 8 : 90 + ((i * 3) % 8)) + "vw";
    bubble.style.animationDuration = (18 + (i % 6) * 3) + "s";
    bubble.style.animationDelay = (-(i * 2.4)) + "s";
    bubble.style.setProperty("--drift", ((i % 2 ? 1 : -1) * (8 + (i % 4) * 6)) + "px");
    layer.appendChild(bubble);
  }
}

function burst() {
  const layer = document.getElementById("bubbles");
  if (!layer || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  for (let i = 0; i < 7; i++) {
    const bubble = document.createElement("span");
    bubble.className = "bubble pop";
    const size = 8 + (i % 5) * 7;
    bubble.style.width = size + "px";
    bubble.style.height = size + "px";
    bubble.style.left = (22 + (i * 4) % 56) + "vw";
    bubble.style.top = (18 + (i * 7) % 36) + "vh";
    bubble.style.setProperty("--dx", ((i % 2 ? 1 : -1) * (30 + i * 8)) + "px");
    bubble.style.setProperty("--dy", (-40 - (i % 6) * 22) + "px");
    layer.appendChild(bubble);
    setTimeout(() => bubble.remove(), 1000);
  }
}

const ALIASES = {
  Walnut: ["walnut", "walnuts", "nuez", "nueces"],
  Almond: ["almond", "almonds", "almendra", "almendras"],
  Apple: ["apple", "apples", "manzana", "manzanas"],
  Pear: ["pear", "pears", "pera", "peras"],
  Peach: ["peach", "peaches", "durazno", "duraznos", "melocoton"],
  Cherry: ["cherry", "cherries", "cereza", "cerezas"],
  Fig: ["fig", "figs", "higo", "higos"],
  Orange: ["orange", "oranges", "naranja", "naranjas"],
  Lemon: ["lemon", "lemons", "limon", "limones"],
  Avocado: ["avocado", "avocados", "aguacate", "aguacates"],
  Grape: ["grape", "grapes", "uva", "uvas"],
  Pomegranate: ["pomegranate", "pomegranates", "granada", "granadas"],
  Tomato: ["tomato", "tomatoes", "tomate", "tomates"],
  Strawberry: ["strawberry", "strawberries", "fresa", "fresas"],
  Pepper: ["pepper", "peppers", "pimiento", "pimientos"],
  Chili: ["chili", "chiles", "chile"],
  Eggplant: ["eggplant", "eggplants", "berenjena", "berenjenas"],
  Blueberry: ["blueberry", "blueberries", "arandano", "arandanos"],
  Basil: ["basil", "albahaca"],
  Lettuce: ["lettuce", "lechuga"],
  Spinach: ["spinach", "espinaca", "espinacas"],
  Cabbage: ["cabbage", "repollo", "col"],
  Broccoli: ["broccoli", "brocoli"],
  Asparagus: ["asparagus", "esparrago", "esparragos"],
  Cucumber: ["cucumber", "cucumbers", "pepino", "pepinos"],
  Okra: ["okra"],
  Watermelon: ["watermelon", "watermelons", "sandia"],
  Carrot: ["carrot", "carrots", "zanahoria", "zanahorias"],
  Beet: ["beet", "beets", "betabel", "remolacha"],
  Potato: ["potato", "potatoes", "papa", "papas", "patata"],
  Garlic: ["garlic", "ajo", "ajos"],
  Pumpkin: ["pumpkin", "pumpkins", "calabaza"],
  Kale: ["kale"],
  Onion: ["onion", "onions", "cebolla", "cebollas"],
  Pineapple: ["pineapple", "pineapples", "pina"],
  Banana: ["banana", "bananas", "platano", "platanos", "banano"],
  Kiwi: ["kiwi", "kiwis"],
  Mango: ["mango", "mangos", "mangoes"],
  Papaya: ["papaya", "papayas"],
  Corn: ["corn", "maiz", "elote"],
  Wheat: ["wheat", "trigo"],
  Sunflower: ["sunflower", "sunflowers", "girasol"],
};

function plain(text) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function wantsSpanish(text) {
  return /[¿¡]/.test(text) || /\b(como|cuando|riego|regar|cortar|hola|cuidados|riega|debo|puedo)\b/.test(plain(text));
}

function cropsIn(text) {
  const q = plain(text);
  const found = [];
  const names = Object.entries(ALIASES).flatMap(([crop, words]) => words.map((word) => ({ crop, word })));
  names.sort((a, b) => b.word.length - a.word.length);
  let rest = q;
  for (const { crop, word } of names) {
    const at = rest.indexOf(word);
    if (at < 0) continue;
    const before = at === 0 || /[^a-z]/.test(rest[at - 1]);
    const after = at + word.length === rest.length || /[^a-z]/.test(rest[at + word.length]);
    if (!before || !after || found.includes(crop)) continue;
    found.push(crop);
  }
  return found;
}

function sentence(text) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return "";
  const capped = clean.charAt(0).toUpperCase() + clean.slice(1);
  return /[.!?]$/.test(capped) ? capped : capped + ".";
}

function spoken(text) {
  return sentence(text)
    .replace(/\bDo not\b/g, "Don't")
    .replace(/\bdo not\b/g, "don't")
    .replace(/\bDoes not\b/g, "Doesn't")
    .replace(/\bdoes not\b/g, "doesn't")
    .replace(/\bIs not\b/g, "Isn't")
    .replace(/\bis not\b/g, "isn't")
    .replace(/\bAre not\b/g, "Aren't")
    .replace(/\bare not\b/g, "aren't")
    .replace(/\bWill not\b/g, "Won't")
    .replace(/\bwill not\b/g, "won't")
    .replace(/\bCannot\b/g, "Can't")
    .replace(/\bcannot\b/g, "can't");
}

function splitBits(text, voice) {
  const parts = text.match(/[^.!?]+[.!?]+/g);
  const bits = (parts || [text]).map((part) => voice(part)).filter(Boolean);
  return bits.length ? bits : [voice(text)];
}

function uniqueLines(list) {
  const seen = new Set();
  const out = [];
  for (const line of list) {
    const key = line.toLowerCase();
    if (!line || seen.has(key)) continue;
    seen.add(key);
    out.push(line);
  }
  return out;
}

function bundle(frames) {
  const voice = state.lang === "en" ? spoken : sentence;
  const calls = [];
  const cares = [];
  for (const item of frames) {
    const text = note(item);
    calls.push(flow(splitBits(text.call, voice)).join(" "));
    cares.push(flow(splitBits(text.care, voice)).join(" "));
  }
  return { calls: uniqueLines(calls), cares: uniqueLines(cares) };
}

function lowerFirst(text) {
  return text.charAt(0).toLowerCase() + text.slice(1);
}

function glide(lead, body) {
  if (!body) return lead;
  if (state.lang !== "en" && state.lang !== "es") return lead + " " + body;
  const es = state.lang === "es";
  const comma = lead.replace(/\.$/, ",");
  if (es && /^(Las|Los|El|La|Un|Una|Lo) /.test(body)) return comma + " " + lowerFirst(body);
  if (/^(The|A|An) /.test(body)) return comma + " " + lowerFirst(body);
  if (/^[A-Z][a-z]+s (are|were|stay|look)\b/.test(body)) return comma + " the " + lowerFirst(body);
  if (/^(Fully|Still|Red|Green|Firm|Dark|Dusty|Yellow|Hard|Soft)\b/.test(body)) return comma + " " + lowerFirst(body);
  return lead + " " + body;
}

function flow(lines) {
  const joiner = t("so");
  const es = state.lang === "es";
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const next = lines[i + 1];
    const words = lines[i].replace(/[.!?]$/, "").split(/\s+/).length;
    const nextWords = next ? next.replace(/[.!?]$/, "").split(/\s+/).length : 99;
    if (next && words <= 8 && nextWords <= 4) {
      const head = lines[i].replace(/[.!?]$/, "");
      let tail = lowerFirst(next).replace(/[.!?]$/, "");
      if (!es && /^ready\b/.test(tail)) tail = "it's " + tail;
      if (es && /^lista\b/.test(tail)) tail = "está " + tail;
      out.push(sentence(head + ", " + joiner + " " + tail));
      i += 1;
      continue;
    }
    out.push(lines[i]);
  }
  return out;
}

function speakCrop(crop) {
  const frames = data.book.filter((item) => item.crop === crop);
  const name = cropName(crop);
  const blocks = [];
  const order = [
    ["wait", t("introWait")],
    ["pick", t("introPick")],
    ["flag", t("introFlag")],
  ];
  const present = order.filter(([label]) => frames.some((item) => item.label === label));
  if (present.length > 1) blocks.push(t("introBoth", { name }));
  for (const [label, lead] of present) {
    const pack = bundle(frames.filter((item) => item.label === label));
    const calls = glide(lead, pack.calls.join(" "));
    const cares = pack.cares.join(" ");
    blocks.push(cares ? `${calls}\n\n${cares}` : calls);
  }
  return blocks.join("\n\n");
}

function answer(text) {
  const crops = cropsIn(text);
  if (!crops.length) {
    if (/\b(hello|hi|hey|hola|bonjour|namaste|namaskar|vanakkam|nomoshkar|salaam)\b/.test(plain(text))) return t("chatHi");
    return t("chatMiss");
  }
  return crops.slice(0, 2).map((crop) => speakCrop(crop)).join("\n\n");
}

function stopTalking() {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  const box = document.getElementById("chat");
  if (box) box.classList.remove("speaking");
}

function speakAloud(text) {
  if (!voiceOn || !window.speechSynthesis || !text) return;
  const box = document.getElementById("chat");
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text.replace(/\s*\n+\s*/g, ". "));
  const code = VOICE_LANG[state.lang] || "en-US";
  utter.lang = code;
  utter.rate = 0.98;
  const voices = window.speechSynthesis.getVoices();
  const prefix = code.slice(0, 2).toLowerCase();
  const match = voices.find((voice) => (voice.lang || "").toLowerCase().startsWith(prefix));
  if (match) utter.voice = match;
  box.classList.add("speaking");
  utter.onend = () => box.classList.remove("speaking");
  utter.onerror = () => box.classList.remove("speaking");
  window.speechSynthesis.speak(utter);
}

function stopHearing() {
  hearing = false;
  if (recognition) {
    try { recognition.stop(); } catch (error) { /* already idle */ }
  }
  const box = document.getElementById("chat");
  const mic = document.getElementById("voice-mic");
  if (box) box.classList.remove("hearing");
  if (mic) mic.setAttribute("aria-pressed", "false");
}

function startHearing() {
  const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
  const stateEl = document.getElementById("voice-state");
  if (!Rec) {
    if (stateEl) stateEl.textContent = t("voiceNeed");
    return;
  }
  if (!recognition) {
    recognition = new Rec();
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.onresult = (event) => {
      let finalText = "";
      let interim = "";
      for (let i = 0; i < event.results.length; i++) {
        const piece = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalText += piece;
        else interim += piece;
      }
      if (stateEl) stateEl.textContent = interim || finalText || t("voiceListen");
      if (finalText.trim()) submitLine(finalText.trim());
    };
    recognition.onend = () => {
      hearing = false;
      document.getElementById("chat").classList.remove("hearing");
      document.getElementById("voice-mic").setAttribute("aria-pressed", "false");
    };
    recognition.onerror = () => {
      hearing = false;
      document.getElementById("chat").classList.remove("hearing");
      document.getElementById("voice-mic").setAttribute("aria-pressed", "false");
      if (stateEl) stateEl.textContent = t("voiceNeed");
    };
  }
  recognition.lang = VOICE_LANG[state.lang] || "en-US";
  stopTalking();
  hearing = true;
  document.getElementById("chat").classList.add("hearing");
  document.getElementById("voice-mic").setAttribute("aria-pressed", "true");
  if (stateEl) stateEl.textContent = t("voiceListen");
  try { recognition.start(); } catch (error) { /* already listening */ }
}

function setupChat() {
  const box = document.getElementById("chat");
  const log = document.getElementById("chat-log");
  const form = document.getElementById("chat-form");
  const input = document.getElementById("chat-input");
  const voiceBtn = document.getElementById("voice-toggle");
  const stage = document.getElementById("voice-stage");
  const stateEl = document.getElementById("voice-state");
  if (window.speechSynthesis) window.speechSynthesis.getVoices();
  const say = (role, text, persist) => {
    const line = document.createElement("p");
    line.className = role;
    line.textContent = text;
    log.appendChild(line);
    log.scrollTop = log.scrollHeight;
    if (role === "bot") speakAloud(text);
    if (persist !== false && window.surcoSaveLine) window.surcoSaveLine(role, text);
    return line;
  };
  window.surcoChat = {
    clear() { log.innerHTML = ""; },
    add(role, text) { say(role, text, false); },
    count() { return log.childElementCount; },
  };
  submitLine = (text) => {
    const clean = text.trim();
    if (!clean) return;
    input.value = "";
    say("me", clean);
    say("bot", answer(clean));
  };
  document.getElementById("open-chat").addEventListener("click", () => {
    box.hidden = false;
    if (!log.childElementCount) say("bot", t("chatHello"), false);
    input.focus();
  });
  document.getElementById("close-chat").addEventListener("click", () => {
    stopHearing();
    stopTalking();
    box.hidden = true;
  });
  voiceBtn.addEventListener("click", () => {
    voiceOn = !voiceOn;
    voiceBtn.setAttribute("aria-pressed", String(voiceOn));
    stage.hidden = !voiceOn;
    box.classList.toggle("voice-on", voiceOn);
    if (!voiceOn) {
      stopHearing();
      stopTalking();
      stateEl.textContent = "";
    } else {
      stateEl.textContent = t("voiceListen");
      const last = log.querySelector(".bot:last-child");
      speakAloud(last ? last.textContent : t("chatHello"));
    }
    applyChrome();
  });
  document.getElementById("voice-mic").addEventListener("click", () => {
    if (hearing) stopHearing();
    else startHearing();
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    submitLine(input.value);
  });
}

async function boot() {
  setupLang();
  setupChat();
  makeBubbles();
  paint();
  try {
    state.status = { key: "reading" };
    paint();
    state.model = await mobilenet.load({
      version: 2,
      alpha: 0.5,
      modelUrl: "vendor/mobilenet/model.json",
      inputRange: [0, 1],
    });
    const all = [...data.book, ...data.samples, ...data.heldout];
    const seen = new Map();
    for (const item of all) {
      if (seen.has(item.src)) {
        item.embedding = seen.get(item.src);
        continue;
      }
      const img = await loadImage(item.src);
      item.embedding = await embedElement(img);
      seen.set(item.src, item.embedding);
    }
    tuneThreshold();
    state.ready = true;
    const wrong = data.heldout.filter((query) => outcome(query) === "Wrong").length;
    const n = data.heldout.length;
    state.status = wrong === 0
      ? { key: "statusOk", vars: { n } }
      : { key: "statusBad", vars: { wrong, n } };
    if (state.screen === "tab" && (state.tab === "home" || state.tab === "score")) paint();
  } catch (err) {
    state.status = { key: "statusFail" };
    if (state.tab === "home") paint();
    console.error(err);
  }
}

boot();
