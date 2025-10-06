const API = "https://tenderai-backend.onrender.com";
const qEl = document.getElementById("q");
const srcEl = document.getElementById("source");
const tbody = document.getElementById("tbody");
const statsEl = document.getElementById("stats");
const tabs = document.getElementById("tabs");
const searchBtn = document.getElementById("searchBtn");

let currentCat = ""; // '', 'goods', 'works', 'services'
let cache = []; // все элементы из API

// простая классификация категории по тексту (если в Excel нет явной колонки)
function classify(item) {
  const txt = `${item.title || ""} ${item.description || ""}`.toLowerCase();
  if (/(работ|строител|ремонт|монтаж|проектн|строит)/.test(txt)) return "works";
  if (/(услуг|обслужив|аутсорс|консультац|техподдерж)/.test(txt)) return "services";
  return "goods";
}
function catLabel(c){ return c==="works"?"Работы":c==="services"?"Услуги":"Товары"; }

async function fetchData() {
  tbody.innerHTML = `<tr><td colspan="8" class="muted">Загрузка…</td></tr>`;
  statsEl.textContent = "";
  const params = new URLSearchParams();
  if (qEl.value.trim()) params.set("q", qEl.value.trim());
  if (srcEl.value) params.set("source", srcEl.value);

  const res = await fetch(`${API}/api/tenders?${params.toString()}`);
  const data = await res.json();
  cache = (data.items || []).map(x => ({...x, _cat: classify(x)}));
  render();
}

function render() {
  let rows = cache;
  if (currentCat) rows = rows.filter(x => x._cat === currentCat);

  const total = rows.length;
  const sum = rows.reduce((acc, x) => {
    const n = parseFloat(String(x.amount||"").replace(/[^\d.,]/g,"").replace(",", "."));
    return acc + (isFinite(n) ? n : 0);
  }, 0);
  statsEl.textContent = `Найдено: ${total} • Сумма (прибл.): ${sum.toLocaleString("ru-RU")} ₸`;

  if (!total) {
    tbody.innerHTML = `<tr><td class="muted" colspan="8">Нет данных по текущим фильтрам</td></tr>`;
    return;
  }

  tbody.innerHTML = rows.map(x => {
    const badge = `<span class="badge ${x._cat}">${catLabel(x._cat)}</span>`;
    const title = (x.title||"").replace(/\s+/g," ").trim();
    const url = x.url ? `<a href="${x.url}" target="_blank">Открыть</a>` : `<span class="muted">—</span>`;
    return `<tr>
      <td>${badge}</td>
      <td><strong>${title}</strong><div class="muted">${(x.description||"").slice(0,140)}</div></td>
      <td>${x.customer||""}</td>
      <td>${x.published_date||""}</td>
      <td>${x.deadline||""}</td>
      <td>${x.amount||""}</td>
      <td>${x.source||""}</td>
      <td>${url}</td>
    </tr>`;
  }).join("");
}

tabs.addEventListener("click", (e)=>{
  const btn = e.target.closest("button.tab");
  if (!btn) return;
  [...tabs.querySelectorAll(".tab")].forEach(b=>b.classList.remove("active"));
  btn.classList.add("active");
  currentCat = btn.dataset.cat || "";
  render();
});

searchBtn.addEventListener("click", fetchData);
window.addEventListener("load", fetchData);
