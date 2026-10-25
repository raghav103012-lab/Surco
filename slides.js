const slides = [...document.querySelectorAll(".slide")];
const bar = document.getElementById("bar");
const count = document.getElementById("count");
let index = 0;

function fit() {
  const stage = document.getElementById("stage");
  const scale = Math.min(window.innerWidth / 1600, window.innerHeight / 900);
  const x = (window.innerWidth - 1600 * scale) / 2;
  const y = (window.innerHeight - 900 * scale) / 2;
  stage.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
}

function arrive(slide) {
  const bits = slide.querySelectorAll("h1, h2, .lede, .title-more, .kicker, .rule, .line, .aside, .way, .way-note, .impact, .method, .giant, .beside, .facts li, .tiles figure, .foot-quiet, .end-copy a, .cameo, .bubbles p, .count-row");
  bits.forEach((el, i) => el.style.setProperty("--n", String(Math.min(i, 8))));
  slide.classList.remove("arrive");
  void slide.offsetWidth;
  slide.classList.add("arrive");
}

function show(next) {
  index = (next + slides.length) % slides.length;
  slides.forEach((slide, i) => slide.classList.toggle("show", i === index));
  bar.style.width = ((index + 1) / slides.length * 100) + "%";
  count.textContent = String(index + 1).padStart(2, "0") + "  /  " + String(slides.length).padStart(2, "0");
  arrive(slides[index]);
}

document.getElementById("next").addEventListener("click", () => show(index + 1));
document.getElementById("prev").addEventListener("click", () => show(index - 1));

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight" || event.key === " " || event.key === "PageDown") {
    event.preventDefault();
    show(index + 1);
  } else if (event.key === "ArrowLeft" || event.key === "PageUp" || event.key === "Backspace") {
    event.preventDefault();
    show(index - 1);
  } else if (event.key === "Home") show(0);
  else if (event.key === "End") show(slides.length - 1);
});

window.addEventListener("resize", fit);
fit();
show(0);
