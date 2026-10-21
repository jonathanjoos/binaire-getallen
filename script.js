// FTRPRF – Binaire getallen oefening
const STORAGE_KEY = "ftrprf-binair-scores"
const GIF_TIJD = 4000            // hoe lang een gifje getoond wordt (ms)
const NIVEAUS = [8, 32, 128]     // ondergrens per opgave: getal ligt tussen n en 2n-1
const juistgifs = ["https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif","https://media.giphy.com/media/ZtMkorgeyRu5q/giphy.gif","https://media.giphy.com/media/tDFfAG1vTHfGw/giphy.gif","https://media.giphy.com/media/IwAZ6dvvvaTtdI8SD5/giphy.gif","https://media.giphy.com/media/l0amJzVHIAfl7jMDos/giphy.gif","https://media.giphy.com/media/11sBLVxNs7v6WA/giphy.gif","https://media.giphy.com/media/sRFym5lssgcTFrMSac/giphy.gif","https://media.giphy.com/media/atQF1zaSGq8s8/giphy.gif","https://media.giphy.com/media/fAnEC88LccN7a/giphy.gif","https://media.giphy.com/media/K3Sbp8fOgKye4/giphy.gif","https://media.giphy.com/media/bTzFnjHPuVvva/giphy.gif","https://media.giphy.com/media/13hxeOYjoTWtK8/giphy.gif","https://media.giphy.com/media/xT5LMVTPf4zIH3zYk0/giphy.gif","https://media.giphy.com/media/3o7TKoWACSy9jjwjni/giphy.gif","https://media.giphy.com/media/yBwgX64KAPrHW2ltZ2/giphy.gif","https://media.giphy.com/media/l2JdVRfJozpjq70SA/giphy.gif","https://media.giphy.com/media/y4PQTcLTYJwOI/giphy.gif","https://media.giphy.com/media/3oz8xRF0v9WMAUVLNK/giphy.gif","https://media.giphy.com/media/YnBntKOgnUSBkV7bQH/giphy.gif","https://media.giphy.com/media/DhstvI3zZ598Nb1rFf/giphy.gif","https://media.giphy.com/media/rjkJD1v80CjYs/giphy.gif","https://media.giphy.com/media/3f4Tnd6WnetrfBv5DJ/giphy.gif","https://media.giphy.com/media/kyLYXonQYYfwYDIeZl/giphy.gif","https://media.giphy.com/media/14qb1Uhf40ndw4/giphy.gif","https://media.giphy.com/media/tkYpAbKdWj4TS/giphy.gif"]

const $ = id => document.getElementById(id)
const opgaveDiv = $("opgave")
const antwoordInput = $("antwoord")
const feedbackDiv = $("feedback")

let naam = ""
let score = 0
let fouten = 0
let decGetal = 0
let binGetal = ""
let clickable = false
let startTime = 0
let pauzeTijd = 0         // totale tijd dat er gifjes getoond werden
let timerInterval = null

// ---------- Start ----------
$("naamForm").addEventListener("submit", e => {
  e.preventDefault()
  naam = $("naamInput").value.trim() || "Anoniem"
  $("spelerNaam").textContent = naam
  $("naamModal").classList.remove("show")
  newGame()
})
$("naamInput").focus()

$("antwoordForm").addEventListener("submit", e => {
  e.preventDefault()
  controleerAntwoord()
})
$("opnieuwBtn").addEventListener("click", () => {
  $("eindModal").classList.remove("show")
  newGame()
})

function newGame() {
  score = 0
  fouten = 0
  pauzeTijd = 0
  startTime = Date.now()
  clearInterval(timerInterval)
  timerInterval = setInterval(updateTimer, 500)
  updateStatus()
  volgendeOpgave()
}

// ---------- Opgaven ----------
function isBinFase() { return score >= 3 }   // eerste 3 opgaven dec→bin, daarna bin→dec

function volgendeOpgave() {
  const min = NIVEAUS[score % 3]
  decGetal = Math.floor(Math.random() * min + min)
  binGetal = decGetal.toString(2)

  if (isBinFase()) {
    $("opgavetekst").innerHTML = 'Zet dit <span class="tag bin">binaire</span> getal om naar een <span class="tag dec">decimaal</span> getal'
    toonGetal(binGetal)
  } else {
    $("opgavetekst").innerHTML = 'Zet dit <span class="tag dec">decimale</span> getal om naar een <span class="tag bin">binair</span> getal'
    toonGetal(decGetal)
  }
  antwoordInput.value = ""
  antwoordInput.disabled = false
  $("button").disabled = false
  verbergFeedback()
  antwoordInput.focus()
  clickable = true
}

function toonGetal(tekst) {
  opgaveDiv.innerHTML = ""
  const p = document.createElement("div")
  p.className = "number"
  p.textContent = tekst
  opgaveDiv.appendChild(p)
}

// ---------- Controle ----------
function controleerAntwoord() {
  if (!clickable) return
  const antwoord = antwoordInput.value.replace(/\s/g, "")
  if (antwoord === "") { schud(); return }
  if (isBinFase()) controleerDecAntwoord(antwoord)
  else controleerBinAntwoord(antwoord)
}

function controleerBinAntwoord(antwoord) {
  if (/^[01]+$/.test(antwoord) && parseInt(antwoord, 2) === decGetal) return juist()
  fouten++
  const fouteCijfers = [...new Set(antwoord.replace(/[01]/g, ""))]
  if (fouteCijfers.length) {
    toonFout(`Dit is geen binair getal. Binaire getallen bestaan alleen uit <code>0</code> en <code>1</code>. Jij gebruikte ook: <code>${escapeHtml(fouteCijfers.join(" "))}</code>. Probeer nog eens!`)
  } else {
    toonFout(`Helaas fout. Het binaire getal <code>${antwoord}</code> is gelijk aan het decimale getal <code>${parseInt(antwoord, 2)}</code>. Wij zoeken het binaire getal dat gelijk is aan <code>${decGetal}</code>.`)
  }
}

function controleerDecAntwoord(antwoord) {
  if (/^\d+$/.test(antwoord) && Number(antwoord) === decGetal) return juist()
  fouten++
  if (!/^\d+$/.test(antwoord)) {
    toonFout(`Vul een decimaal getal in, dus enkel cijfers. Wij zoeken de waarde van het binaire getal <code>${binGetal}</code>.`)
  } else {
    toonFout(`Helaas fout. ${Number(antwoord)} geschreven als binair getal is <code>${Number(antwoord).toString(2)}</code>. Wij zoeken de waarde van het binaire getal <code>${binGetal}</code>.`)
  }
}

function juist() {
  clickable = false
  antwoordInput.disabled = true
  $("button").disabled = true
  toonFeedback("ok", "✅ Juist! Super gedaan.")

  opgaveDiv.innerHTML = ""
  const gif = document.createElement("img")
  gif.src = juistgifs[Math.floor(Math.random() * juistgifs.length)]
  gif.alt = "Feestelijk gifje"
  opgaveDiv.appendChild(gif)

  score++
  updateStatus()
  const pauzeStart = Date.now()
  setTimeout(() => {
    pauzeTijd += Date.now() - pauzeStart
    if (score >= 6) gameOver()
    else volgendeOpgave()
  }, GIF_TIJD)
}

// ---------- Weergave ----------
function toonFeedback(soort, html) {
  feedbackDiv.className = "feedback show " + soort
  feedbackDiv.innerHTML = html
}
function toonFout(html) {
  toonFeedback("error", "❌ " + html)
  schud()
  updateStatus()
  antwoordInput.select()
}
function verbergFeedback() { feedbackDiv.className = "feedback" }

function schud() {
  antwoordInput.classList.remove("shake")
  void antwoordInput.offsetWidth
  antwoordInput.classList.add("shake")
}

function updateStatus() {
  $("score").textContent = score
  $("foutenTeller").textContent = fouten
  document.querySelectorAll("#progress span").forEach((s, i) => {
    s.className = i < score ? "done" : i === score ? "current" : ""
  })
}

function speeltijd() {
  return Math.max(0, Math.floor((Date.now() - startTime - pauzeTijd) / 1000))
}
function formatTijd(sec) {
  return Math.floor(sec / 60) + ":" + String(sec % 60).padStart(2, "0")
}
function updateTimer() {
  if (clickable) $("timer").textContent = formatTijd(speeltijd())
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]))
}

// ---------- Einde & highscores ----------
function gameOver() {
  clearInterval(timerInterval)
  clickable = false
  const tijd = speeltijd()
  $("timer").textContent = formatTijd(tijd)
  $("eindNaam").textContent = naam
  $("eindTijd").textContent = formatTijd(tijd)
  $("eindFouten").textContent = fouten
  $("eindModal").classList.add("show")
  logScore({ naam, tijd, fouten, datum: new Date().toISOString() })
}

function logScore(resultaat) {
  let data
  try { data = JSON.parse(localStorage.getItem(STORAGE_KEY)) } catch (e) {}
  if (!data || !Array.isArray(data.top)) data = { top: [] }
  data.laatste = resultaat
  data.top.push(resultaat)
  data.top.sort((a, b) => a.tijd - b.tijd || a.fouten - b.fouten)
  data.top = data.top.slice(0, 10)
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch (e) {}
}

// ---------- Bit-rekenmachine ----------
const bitsDiv = $("bits")
const bitState = Array(8).fill(0)
for (let i = 7; i >= 0; i--) {
  const btn = document.createElement("button")
  btn.type = "button"
  btn.className = "bit-btn"
  btn.innerHTML = `<span class="val">${2 ** i}</span><span class="b">0</span>`
  btn.addEventListener("click", () => {
    bitState[i] ^= 1
    btn.classList.toggle("on", !!bitState[i])
    btn.querySelector(".b").textContent = bitState[i]
    $("bitBin").textContent = bitState.slice().reverse().join("")
    $("bitDec").textContent = bitState.reduce((som, b, j) => som + b * 2 ** j, 0)
  })
  bitsDiv.appendChild(btn)
}
