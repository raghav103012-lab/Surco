const MIN_CENTS = 1690;
const STORE = "surco-days";
const LANG_KEY = "surco-lang";

const COPY = {
  en: {
    langName: "English",
    langNote: "The same day. The tongue you say it in.",
    close: "Close",
    weekBtn: "The week",
    messageBtn: "The message",
    tabs: [
      ["today", "Today"],
      ["count", "Count"],
      ["week", "Week"],
      ["rules", "Rules"],
    ],
    lead: "A short check is a quiet kind of theft. Surco turns the hours and the pieces into a sentence you can say, in English or in Spanish, before the day disappears.",
    floorLine: "California’s statewide floor on January 1, 2026 is $16.90 an hour. This count uses that floor.",
    cards: [
      ["count", "The count", "Hours, pieces, and the gap"],
      ["week", "The week", "What this phone remembers"],
      ["rules", "The rules", "The floor, the breaks, the heat"],
    ],
    countTitle: "The count",
    countLead: "Put in the day as it happened. Surco compares it with the state floor, then writes the sentence.",
    hourly: "By the hour",
    piece: "By the piece",
    hours: "Hours on the clock",
    pieces: "Pieces",
    rateHour: "Dollars an hour",
    ratePiece: "Dollars a piece",
    crew: "Crew or contractor, if you want it in the message",
    run: "Count the day",
    save: "Keep this day",
    saved: "Kept on this phone.",
    needHours: "The day needs the hours.",
    short: "Short",
    met: "Met",
    over: "Over",
    pieceLine: "The pieces add up to",
    hourLine: "The hours add up to",
    floorWord: "The floor for those hours",
    gapShort: "Short of the floor by",
    gapMet: "The count meets the floor.",
    rest: "Paid rest is 10 minutes for every 4 hours. On piece rate, that rest is supposed to be paid on top of the pieces. For this day that is about",
    restHour: "Paid rest is 10 minutes for every 4 hours. If the clock kept running, those minutes are already inside the hours. That portion is about",
    hear: "Hear it",
    copy: "Copy",
    text: "Text it",
    copied: "Copied.",
    emptyMessage: "Count a day first. The sentence will wait here.",
    weekTitle: "The week",
    weekLead: "Days you kept on this phone. Daily overtime is already inside each day, so the week line is a check, not a second paycheck.",
    weekEmpty: "No days kept yet.",
    weekHours: "Hours kept",
    past40: "Hours past 40",
    clear: "Clear this phone",
    rulesTitle: "The rules",
    rulesLead: "Plain notes from California’s own pages. This is an estimate, not a wage claim and not a lawyer.",
    rules: [
      ["The floor", "On January 1, 2026 the statewide minimum wage is $16.90 an hour for every employer. A city can set a higher one. Surco uses the state number."],
      ["The piece", "Pay by the box or the vine still has to reach the floor for every hour on the clock. If the pieces come up short, the difference is supposed to be added."],
      ["The extra hours", "Farm work past 8 hours in a day, or 40 in a week, is one and a half times the regular rate. Past 12 hours in a day, it is double. That has been the rule for every size of farm crew since 2025."],
      ["The breaks", "A paid rest is 10 minutes for each 4 hours. A meal break of 30 minutes comes when the day runs past 5 hours, if you are free to leave the row."],
      ["The heat", "At 80 degrees there must be shade. Water is free, and a cool-down rest is yours when you need it. At 95 degrees in agriculture, the crew has to be watched for heat illness."],
      ["The contractor", "A farm labor contractor needs a state license. You can ask for the name and look it up. Asking about your pay is not a reason to be fired."],
    ],
    call: "Labor Commissioner",
    callNote: "833-526-4636. Wage questions and claims.",
    links: [
      ["How to file a wage claim", "https://www.dir.ca.gov/dlse/HowToFileWageClaim.htm"],
      ["Heat illness rules", "https://www.dir.ca.gov/dosh/heatillnessinfo.html"],
      ["Farm labor contractor licenses", "https://www.dir.ca.gov/dlse/flc.htm"],
      ["Offices by the place you worked", "https://www.dir.ca.gov/dlse/DistrictOffices.htm"],
    ],
  },
  es: {
    langName: "Español",
    langNote: "El mismo día. La lengua en que lo dices.",
    close: "Cerrar",
    weekBtn: "La semana",
    messageBtn: "El recado",
    tabs: [
      ["today", "Hoy"],
      ["count", "Cuenta"],
      ["week", "Semana"],
      ["rules", "Reglas"],
    ],
    lead: "Un cheque corto es un robo callado. Surco convierte las horas y las piezas en una frase que puedes decir, en inglés o en español, antes de que se pierda el día.",
    floorLine: "El piso estatal de California desde el 1 de enero de 2026 es $16.90 la hora. Esta cuenta usa ese piso.",
    cards: [
      ["count", "La cuenta", "Horas, piezas y la diferencia"],
      ["week", "La semana", "Lo que guarda este teléfono"],
      ["rules", "Las reglas", "El piso, los descansos, el calor"],
    ],
    countTitle: "La cuenta",
    countLead: "Anota el día como fue. Surco lo compara con el piso del estado y escribe la frase.",
    hourly: "Por hora",
    piece: "Por pieza",
    hours: "Horas en el reloj",
    pieces: "Piezas",
    rateHour: "Dólares por hora",
    ratePiece: "Dólares por pieza",
    crew: "Cuadrilla o contratista, si quieres el nombre en el recado",
    run: "Contar el día",
    save: "Guardar este día",
    saved: "Quedó en este teléfono.",
    needHours: "El día necesita las horas.",
    short: "Falta",
    met: "Alcanza",
    over: "De más",
    pieceLine: "Las piezas suman",
    hourLine: "Las horas suman",
    floorWord: "El piso de esas horas",
    gapShort: "Falta para el piso",
    gapMet: "La cuenta alcanza el piso.",
    rest: "El descanso pagado es 10 minutos por cada 4 horas. En el pago por pieza, ese descanso se paga aparte, no escondido en las piezas. En este día son unos",
    restHour: "El descanso pagado es 10 minutos por cada 4 horas. Si el reloj siguió, esos minutos ya van dentro de las horas. Esa parte son unos",
    hear: "Escuchar",
    copy: "Copiar",
    text: "Mandar texto",
    copied: "Copiado.",
    emptyMessage: "Primero cuenta un día. La frase espera aquí.",
    weekTitle: "La semana",
    weekLead: "Días guardados en este teléfono. El tiempo extra de cada día ya está en esa cuenta. La línea de la semana es una revisión, no un segundo cheque.",
    weekEmpty: "Todavía no hay días guardados.",
    weekHours: "Horas guardadas",
    past40: "Horas después de 40",
    clear: "Borrar este teléfono",
    rulesTitle: "Las reglas",
    rulesLead: "Notas simples de las páginas de California. Esto es un estimado, no un reclamo de salario y no un abogado.",
    rules: [
      ["El piso", "Desde el 1 de enero de 2026 el salario mínimo estatal es $16.90 la hora para todo empleador. Una ciudad puede poner uno más alto. Surco usa el número del estado."],
      ["La pieza", "El pago por caja o por mata también tiene que llegar al piso por cada hora en el reloj. Si las piezas no alcanzan, la diferencia se debe agregar."],
      ["Las horas de más", "En el campo, después de 8 horas en un día, o 40 en una semana, se paga tiempo y medio. Después de 12 horas en un día, se paga doble. Así es para toda cuadrilla desde 2025."],
      ["Los descansos", "El descanso pagado es 10 minutos por cada 4 horas. La comida de 30 minutos llega cuando el día pasa de 5 horas, si puedes salir del surco."],
      ["El calor", "A los 80 grados tiene que haber sombra. El agua es gratis, y el descanso para enfriarte es tuyo cuando lo necesitas. A los 95 grados en la agricultura, la cuadrilla se vigila por enfermedad del calor."],
      ["El contratista", "Un contratista de trabajo agrícola necesita licencia del estado. Puedes pedir el nombre y buscarlo. Preguntar por tu pago no es razón para despedirte."],
    ],
    call: "Comisionado Laboral",
    callNote: "833-526-4636. Preguntas y reclamos de salario.",
    links: [
      ["Cómo presentar un reclamo", "https://www.dir.ca.gov/dlse/HowToFileWageClaim.htm"],
      ["Reglas del calor", "https://www.dir.ca.gov/dosh/heatillnessinfo.html"],
      ["Licencias de contratistas", "https://www.dir.ca.gov/dlse/flc.htm"],
      ["Oficinas según donde trabajaste", "https://www.dir.ca.gov/dlse/DistrictOffices.htm"],
    ],
  },
};

const state = {
  lang: localStorage.getItem(LANG_KEY) === "es" ? "es" : "en",
  tab: "today",
  mode: "piece",
  last: null,
};

const panel = document.getElementById("panel");
const tabsEl = document.getElementById("tabs");

function t() { return COPY[state.lang]; }

function money(cents) {
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(Math.round(cents));
  return sign + "$" + (abs / 100).toFixed(2);
}

function splitHours(hours) {
  const h = Math.max(0, Number(hours) || 0);
  return {
    reg: Math.min(h, 8),
    ot: Math.min(Math.max(h - 8, 0), 4),
    dt: Math.max(h - 12, 0),
    all: h,
  };
}

function floorCents(hours) {
  const parts = splitHours(hours);
  return Math.round(parts.reg * MIN_CENTS) + Math.round(parts.ot * MIN_CENTS * 1.5) + Math.round(parts.dt * MIN_CENTS * 2);
}

function loadDays() {
  try { return JSON.parse(localStorage.getItem(STORE) || "[]"); }
  catch { return []; }
}

function saveDays(days) {
  localStorage.setItem(STORE, JSON.stringify(days));
}

function sentence(day) {
  const es = state.lang === "es";
  const who = day.crew ? (es ? ` Cuadrilla: ${day.crew}.` : ` Crew: ${day.crew}.`) : "";
  const earned = money(day.earned);
  const floor = money(day.floor);
  const gap = money(day.floor - day.earned);
  if (es) {
    const how = day.mode === "piece"
      ? `Hoy trabajé ${day.hours} horas y las piezas sumaron ${earned}.`
      : `Hoy trabajé ${day.hours} horas y el pago suma ${earned}.`;
    const tail = day.earned + 1 < day.floor
      ? ` El piso de California para esas horas es ${floor}. Faltan ${gap}.`
      : ` El piso de California para esas horas es ${floor}. La cuenta lo alcanza.`;
    return how + tail + who;
  }
  const how = day.mode === "piece"
    ? `Today I worked ${day.hours} hours and the pieces came to ${earned}.`
    : `Today I worked ${day.hours} hours and the pay comes to ${earned}.`;
  const tail = day.earned + 1 < day.floor
    ? ` The California floor for those hours is ${floor}. The count is short by ${gap}.`
    : ` The California floor for those hours is ${floor}. The count meets it.`;
  return how + tail + who;
}

function paint() {
  const copy = t();
  document.documentElement.lang = state.lang;
  document.getElementById("open-lang").textContent = copy.langName;
  document.getElementById("open-account").textContent = copy.weekBtn;
  document.getElementById("open-chat").textContent = copy.messageBtn;
  document.getElementById("chat-title").textContent = copy.messageBtn;
  document.getElementById("voice-toggle").textContent = copy.hear;
  document.getElementById("close-chat").textContent = copy.close;
  document.getElementById("close-lang").textContent = copy.close;
  document.getElementById("lang-title").textContent = state.lang === "es" ? "Lengua" : "Language";
  document.getElementById("lang-note").textContent = copy.langNote;
  document.getElementById("copy-message").textContent = copy.copy;
  document.getElementById("text-message").textContent = copy.text;
  tabsEl.innerHTML = "";
  for (const [id, label] of copy.tabs) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.setAttribute("aria-selected", String(state.tab === id));
    button.addEventListener("click", () => openTab(id));
    tabsEl.appendChild(button);
  }
  panel.innerHTML = "";
  if (state.tab === "today") renderToday();
  else if (state.tab === "count") renderCount();
  else if (state.tab === "week") renderWeek();
  else renderRules();
  fillMessage();
}

function openTab(id) {
  state.tab = id;
  paint();
}

function renderToday() {
  const copy = t();
  const hero = document.createElement("div");
  hero.className = "hero";
  const h = document.createElement("h1");
  h.textContent = "Surco";
  const lead = document.createElement("p");
  lead.className = "lead";
  lead.textContent = copy.lead;
  hero.append(h, lead);
  const jump = document.createElement("div");
  jump.className = "jump";
  for (const [id, name, blurb] of copy.cards) {
    const section = document.createElement("button");
    section.type = "button";
    section.className = "section";
    section.innerHTML = `<span class="section-name">${name}</span><span class="section-count">${blurb}</span>`;
    section.addEventListener("click", () => openTab(id === "rules" ? "rules" : id));
    jump.appendChild(section);
  }
  const note = document.createElement("p");
  note.className = "status";
  note.textContent = copy.floorLine;
  panel.append(hero, jump, note);
}

function field(label, id, value, step) {
  const wrap = document.createElement("label");
  wrap.className = "field";
  wrap.textContent = label;
  const input = document.createElement("input");
  input.id = id;
  input.type = "number";
  input.min = "0";
  input.step = step;
  input.inputMode = "decimal";
  input.value = value;
  wrap.appendChild(input);
  return wrap;
}

function renderCount() {
  const copy = t();
  const h = document.createElement("h1");
  h.textContent = copy.countTitle;
  const lead = document.createElement("p");
  lead.className = "lead";
  lead.textContent = copy.countLead;
  const modes = document.createElement("div");
  modes.className = "choices";
  for (const [id, label] of [["piece", copy.piece], ["hourly", copy.hourly]]) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = state.mode === id ? "primary" : "ghost";
    button.textContent = label;
    button.addEventListener("click", () => { state.mode = id; paint(); });
    modes.appendChild(button);
  }
  const form = document.createElement("form");
  form.className = "fields";
  form.append(field(copy.hours, "hours", "8", "0.25"));
  if (state.mode === "piece") form.append(field(copy.pieces, "pieces", "", "1"));
  form.append(field(state.mode === "piece" ? copy.ratePiece : copy.rateHour, "rate", state.mode === "piece" ? "1.50" : "16.90", "0.01"));
  const crew = document.createElement("label");
  crew.className = "field wide";
  crew.textContent = copy.crew;
  const crewInput = document.createElement("input");
  crewInput.id = "crew";
  crewInput.type = "text";
  crew.appendChild(crewInput);
  form.appendChild(crew);
  const run = document.createElement("button");
  run.className = "primary";
  run.type = "submit";
  run.textContent = copy.run;
  form.appendChild(run);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const hours = Number(document.getElementById("hours").value);
    if (!hours) {
      showResult(copy.needHours, null);
      return;
    }
    const rate = Math.round(Number(document.getElementById("rate").value || 0) * 100);
    const pieces = state.mode === "piece" ? Number(document.getElementById("pieces").value || 0) : 0;
    const earned = state.mode === "piece" ? Math.round(pieces * rate) : payHourly(hours, rate);
    const floor = floorCents(hours);
    const day = {
      id: Date.now(),
      hours,
      mode: state.mode,
      pieces,
      rate,
      earned,
      floor,
      crew: document.getElementById("crew").value.trim(),
    };
    state.last = day;
    showResult("", day);
    fillMessage();
  });
  const out = document.createElement("div");
  out.id = "result";
  panel.append(h, lead, modes, form, out);
  if (state.last) showResult("", state.last);
}

function payHourly(hours, rate) {
  const parts = splitHours(hours);
  return Math.round(parts.reg * rate) + Math.round(parts.ot * rate * 1.5) + Math.round(parts.dt * rate * 2);
}

function showResult(error, day) {
  const out = document.getElementById("result");
  if (!out) return;
  out.innerHTML = "";
  if (!day) {
    const p = document.createElement("p");
    p.className = "status";
    p.textContent = error;
    out.appendChild(p);
    return;
  }
  const copy = t();
  const wrap = document.createElement("div");
  const short = day.earned + 1 < day.floor;
  wrap.className = "verdict " + (short ? "flag" : "pick");
  const word = document.createElement("h1");
  word.className = "word";
  word.textContent = short ? copy.short : (day.earned > day.floor + 50 ? copy.over : copy.met);
  const says = document.createElement("p");
  says.className = "says";
  says.textContent = sentence(day);
  const meta = document.createElement("p");
  meta.className = "meta";
  const earnedLabel = day.mode === "piece" ? copy.pieceLine : copy.hourLine;
  meta.textContent = `${earnedLabel} ${money(day.earned)}. ${copy.floorWord}: ${money(day.floor)}. ${short ? copy.gapShort + " " + money(day.floor - day.earned) + "." : copy.gapMet}`;
  const parts = splitHours(day.hours);
  const restMin = Math.floor(parts.all / 4) * 10;
  const rest = document.createElement("p");
  rest.className = "care";
  const restPay = money(Math.round(restMin / 60 * MIN_CENTS));
  rest.textContent = `${day.mode === "piece" ? copy.rest : copy.restHour} ${restPay}.`;
  const keep = document.createElement("button");
  keep.className = "ghost";
  keep.type = "button";
  keep.textContent = copy.save;
  keep.addEventListener("click", () => {
    const days = loadDays();
    days.unshift(day);
    saveDays(days.slice(0, 30));
    keep.textContent = copy.saved;
  });
  wrap.append(word, says, meta, rest, keep);
  out.appendChild(wrap);
}

function renderWeek() {
  const copy = t();
  const h = document.createElement("h1");
  h.textContent = copy.weekTitle;
  const lead = document.createElement("p");
  lead.className = "lead";
  lead.textContent = copy.weekLead;
  const days = loadDays();
  panel.append(h, lead);
  if (!days.length) {
    const empty = document.createElement("p");
    empty.className = "note";
    empty.textContent = copy.weekEmpty;
    panel.appendChild(empty);
    return;
  }
  const hours = days.reduce((sum, day) => sum + Number(day.hours || 0), 0);
  const stats = document.createElement("div");
  stats.className = "stats";
  for (const [value, label] of [[hours.toFixed(1), copy.weekHours], [Math.max(0, hours - 40).toFixed(1), copy.past40]]) {
    const stat = document.createElement("div");
    stat.className = "stat";
    stat.innerHTML = `<b>${value}</b><span>${label}</span>`;
    stats.appendChild(stat);
  }
  panel.appendChild(stats);
  for (const day of days) {
    const row = document.createElement("div");
    row.className = "day-row";
    const when = new Date(day.id);
    const short = day.earned + 1 < day.floor;
    row.innerHTML = `<p>${when.toLocaleDateString()} · ${day.hours} h</p><p>${money(day.earned)}</p><span class="badge${short ? " flag" : ""}">${short ? copy.short : copy.met}</span>`;
    panel.appendChild(row);
  }
  const clear = document.createElement("button");
  clear.className = "ghost";
  clear.type = "button";
  clear.textContent = copy.clear;
  clear.addEventListener("click", () => { saveDays([]); paint(); });
  panel.appendChild(clear);
}

function renderRules() {
  const copy = t();
  const h = document.createElement("h1");
  h.textContent = copy.rulesTitle;
  const lead = document.createElement("p");
  lead.className = "lead";
  lead.textContent = copy.rulesLead;
  const jump = document.createElement("div");
  jump.className = "rule-list";
  for (const [name, blurb] of copy.rules) {
    const card = document.createElement("article");
    card.className = "section";
    card.innerHTML = `<span class="section-name">${name}</span><span class="section-blurb">${blurb}</span>`;
    jump.appendChild(card);
  }
  const call = document.createElement("p");
  call.className = "says";
  call.textContent = `${copy.call}. ${copy.callNote}`;
  const list = document.createElement("div");
  list.className = "links";
  for (const [label, href] of copy.links) {
    const a = document.createElement("a");
    a.href = href;
    a.target = "_blank";
    a.rel = "noreferrer";
    a.textContent = label;
    list.appendChild(a);
  }
  panel.append(h, lead, jump, call, list);
}

function fillMessage() {
  const log = document.getElementById("chat-log");
  const line = document.createElement("p");
  line.className = "bot";
  line.textContent = state.last ? sentence(state.last) : t().emptyMessage;
  log.innerHTML = "";
  log.appendChild(line);
}

function speak() {
  if (!state.last || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(sentence(state.last));
  utter.lang = state.lang === "es" ? "es-MX" : "en-US";
  document.getElementById("chat").classList.add("speaking");
  utter.onend = () => document.getElementById("chat").classList.remove("speaking");
  window.speechSynthesis.speak(utter);
}

function setupChrome() {
  const sheet = document.getElementById("lang-sheet");
  const grid = document.getElementById("langs");
  [["en", "English", "English", "wash-gold"], ["es", "Español", "Spanish", "wash-green"]].forEach(([id, name, latin, wash], index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = wash;
    button.style.setProperty("--i", index);
    button.setAttribute("aria-selected", String(state.lang === id));
    button.innerHTML = `<span class="lang-name">${name}</span><span class="lang-latin">${latin}</span>`;
    button.addEventListener("click", () => {
      state.lang = id;
      localStorage.setItem(LANG_KEY, id);
      sheet.hidden = true;
      document.getElementById("open-lang").setAttribute("aria-expanded", "false");
      paint();
    });
    grid.appendChild(button);
  });
  document.getElementById("open-lang").addEventListener("click", () => {
    sheet.hidden = false;
    document.getElementById("open-lang").setAttribute("aria-expanded", "true");
  });
  document.getElementById("close-lang").addEventListener("click", () => { sheet.hidden = true; });
  document.querySelector(".lang-veil").addEventListener("click", () => { sheet.hidden = true; });
  document.getElementById("open-account").addEventListener("click", () => openTab("week"));
  const chat = document.getElementById("chat");
  document.getElementById("open-chat").addEventListener("click", () => { chat.hidden = false; fillMessage(); });
  document.getElementById("close-chat").addEventListener("click", () => { chat.hidden = true; window.speechSynthesis && window.speechSynthesis.cancel(); });
  document.getElementById("voice-toggle").addEventListener("click", speak);
  document.getElementById("voice-mic").addEventListener("click", speak);
  document.getElementById("copy-message").addEventListener("click", async () => {
    if (!state.last) return;
    const text = sentence(state.last);
    let ok = false;
    try {
      await navigator.clipboard.writeText(text);
      ok = true;
    } catch {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.left = "-999px";
      document.body.appendChild(area);
      area.select();
      ok = document.execCommand("copy");
      area.remove();
    }
    if (ok) document.getElementById("copy-message").textContent = t().copied;
  });
  document.getElementById("chat-form").addEventListener("submit", (event) => {
    event.preventDefault();
    if (!state.last) return;
    const body = encodeURIComponent(sentence(state.last));
    window.location.href = `sms:?&body=${body}`;
  });
}

function bubbles() {
  const root = document.getElementById("bubbles");
  for (let i = 0; i < 10; i += 1) {
    const bubble = document.createElement("span");
    bubble.className = "bubble";
    const size = 18 + (i % 4) * 14;
    bubble.style.width = size + "px";
    bubble.style.height = size + "px";
    bubble.style.left = (4 + (i * 9) % 92) + "%";
    bubble.style.animationDuration = (14 + i) + "s";
    bubble.style.animationDelay = (-i * 1.4) + "s";
    root.appendChild(bubble);
  }
}

bubbles();
setupChrome();
paint();
