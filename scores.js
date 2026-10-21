// FTRPRF – Highscores (opgeslagen in de browser van deze computer)
const STORAGE_KEY = "ftrprf-binair-scores"

function laadScores() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (data && Array.isArray(data.top)) return data
  } catch (e) {}
  return { top: [] }
}

function formatTijd(sec) {
  return Math.floor(sec / 60) + ":" + String(sec % 60).padStart(2, "0")
}

function cel(tekst, klasse) {
  const td = document.createElement("td")
  if (klasse) td.className = klasse
  td.textContent = tekst
  return td
}

function showHighScore() {
  const data = laadScores()
  const tbody = document.getElementById("scorelijst")
  tbody.innerHTML = ""

  if (!data.top.length) {
    const tr = document.createElement("tr")
    const td = cel("Nog geen scores. Wees de eerste! 🚀", "empty")
    td.colSpan = 4
    tr.appendChild(td)
    tbody.appendChild(tr)
  }

  data.top.forEach((s, i) => {
    const tr = document.createElement("tr")
    if (i < 3) tr.className = "top" + (i + 1)
    if (data.laatste && s.datum === data.laatste.datum) tr.classList.add("last")
    const rank = document.createElement("td")
    rank.className = "rank"
    rank.innerHTML = `<span>${i + 1}.</span>`
    tr.append(rank, cel(s.naam), cel(formatTijd(s.tijd), "num"), cel(s.fouten, "num"))
    tbody.appendChild(tr)
  })

  const laatsteDiv = document.getElementById("laatste")
  laatsteDiv.innerHTML = ""
  if (data.laatste) {
    const l = data.laatste
    const box = document.createElement("div")
    box.className = "last-result"
    box.innerHTML = `<div><small>Laatste resultaat</small><div class="naam"></div></div>
      <div>⏱️ ${formatTijd(l.tijd)} &nbsp; ❌ ${l.fouten} fouten</div>`
    box.querySelector(".naam").textContent = l.naam
    laatsteDiv.appendChild(box)
  }
}

document.getElementById("wisBtn").addEventListener("click", () => {
  if (confirm("Weet je zeker dat je alle highscores op deze computer wilt wissen?")) {
    try { localStorage.removeItem(STORAGE_KEY) } catch (e) {}
    showHighScore()
  }
})

showHighScore()
