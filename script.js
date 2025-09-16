
// --- Config ---
const ALLOWED_USERS = ["Mand001","Mand002","Mand003"];
const LS_PREFIX = 'minianki';

// --- Base Decks (sample content) ---
const baseDecks = {
  HSK2: [
    { front: '什么时候 (shénme shíhou)', back: 'when' },
    { front: '因为 (yīnwèi)', back: 'because' },
    { front: '一起 (yìqǐ)', back: 'together' },
    { front: '正在 (zhèngzài)', back: 'in the process of' },
    { front: '比 (bǐ)', back: 'compare; than' }
  ],
  HSK3: [
    { front: '必须 (bìxū)', back: 'must' },
    { front: '突然 (tūrán)', back: 'suddenly' },
    { front: '决定 (juédìng)', back: 'decide; decision' },
    { front: '明白 (míngbai)', back: 'understand; clear' },
    { front: '提高 (tígāo)', back: 'improve; raise' }
  ],
  Full: [] // computed later as union of HSK2 + HSK3
};

// Add stable ids to base decks and build Full
(function initBaseIds(){
  const hash = (s)=>{
    // simple hash
    let h=2166136261>>>0; for (let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=(h*16777619)>>>0; } return ('b'+h.toString(16));
  };
  const tag = (c)=> ({ id: hash(c.front+'|'+c.back), front:c.front, back:c.back });
  baseDecks.HSK2 = baseDecks.HSK2.map(tag);
  baseDecks.HSK3 = baseDecks.HSK3.map(tag);
  const seen = new Set();
  const add = (c)=>{ if(!seen.has(c.id)){ seen.add(c.id); baseDecks.Full.push({...c}); } };
  [...baseDecks.HSK2, ...baseDecks.HSK3].forEach(add);
})();

// --- State ---
let currentUser = null;
let currentDeckName = 'HSK2';
let currentDeck = [];
let currentIndex = 0; // index in currentDeck
let isFlipped = false;
let dueIndexes = []; // indexes of due cards in currentDeck
let duePos = 0; // position in dueIndexes

// Timing/Session
let cardStartMs = null;
let session = null; // { startedAt, reviewed, correct, incorrect, totalMs }

// --- DOM ---
const loginSection = document.getElementById('login');
const appSection = document.getElementById('app');
const userIdInput = document.getElementById('userId');
const startBtn = document.getElementById('startBtn');
const whoEl = document.getElementById('who');
const logoutBtn = document.getElementById('logoutBtn');
const deckSelect = document.getElementById('deckSelect');
const settingsBtn = document.getElementById('settingsBtn');
const dueCountEl = document.getElementById('dueCount');

const flashcard = document.getElementById('flashcard');
const cardFront = document.getElementById('cardFront');
const cardBack = document.getElementById('cardBack');

const prevBtn = document.getElementById('prevBtn');
const flipBtn = document.getElementById('flipBtn');
const nextBtn = document.getElementById('nextBtn');
const againBtn = document.getElementById('againBtn');
const hardBtn = document.getElementById('hardBtn');
const goodBtn = document.getElementById('goodBtn');
const easyBtn = document.getElementById('easyBtn');
const endSessionBtn = document.getElementById('endSessionBtn');

const progressText = document.getElementById('progressText');
const dots = document.getElementById('dots');
const themeToggle = document.getElementById('themeToggle');
const emptyState = document.getElementById('emptyState');

// Modal
const settingsModal = document.getElementById('settingsModal');
const closeSettings = document.getElementById('closeSettings');
const tabs = document.querySelectorAll('.tab');
const tabManage = document.getElementById('tab-manage');
const tabStats = document.getElementById('tab-stats');
const newFront = document.getElementById('newFront');
const newBack = document.getElementById('newBack');
const addCardBtn = document.getElementById('addCardBtn');
const cardsList = document.getElementById('cardsList');
const statsOverview = document.getElementById('statsOverview');
const sessionsList = document.getElementById('sessionsList');
const resetStatsBtn = document.getElementById('resetStatsBtn');
const streakNowEl = document.getElementById('streakNow');
const streakBestEl = document.getElementById('streakBest');
const reviewsChart = document.getElementById('reviewsChart');
const timeChart = document.getElementById('timeChart');

// --- Utilities (LocalStorage) ---
function lsKey(...parts){ return [LS_PREFIX, ...parts].join(':'); }
function deepClone(x){ return JSON.parse(JSON.stringify(x)); }

function getDeckOverrides(user){
  const raw = localStorage.getItem(lsKey('decks', user));
  return raw ? JSON.parse(raw) : {}; // { deckName: [cards] }
}
function setDeckOverrides(user, overrides){
  localStorage.setItem(lsKey('decks', user), JSON.stringify(overrides));
}
function getUserDeck(user, deckName){
  const overrides = getDeckOverrides(user);
  if (Array.isArray(overrides[deckName])) return overrides[deckName];
  return deepClone(baseDecks[deckName]);
}
function saveUserDeck(user, deckName, cards){
  const overrides = getDeckOverrides(user);
  overrides[deckName] = cards;
  setDeckOverrides(user, overrides);
}

// SRS store per user+deck: cardId -> sched
function getSrsMap(user, deckName){
  const raw = localStorage.getItem(lsKey('srs', user, deckName));
  return raw ? JSON.parse(raw) : {}; // id -> {ef, ivl, reps, lapses, dueISO}
}
function saveSrsMap(user, deckName, map){
  localStorage.setItem(lsKey('srs', user, deckName), JSON.stringify(map));
}

// Stats store: array of sessions
function getStats(user, deckName){
  const raw = localStorage.getItem(lsKey('stats', user, deckName));
  return raw ? JSON.parse(raw) : []; // [{startedAt, finishedAt, reviewed, correct, incorrect, totalMs}]
}
function saveStats(user, deckName, arr){
  localStorage.setItem(lsKey('stats', user, deckName), JSON.stringify(arr));
}

// --- Date helpers ---
function todayLocalStart(d=new Date()){
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function addDays(d, days){ const nd = new Date(d); nd.setDate(nd.getDate()+days); return nd; }
function isoDate(d){ return new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().slice(0,10); }

// --- SRS (SM-2 simplified) ---
// Ratings: Again=0, Hard=3, Good=4, Easy=5
function updateSRS(s, rating){
  // s = {ef, ivl, reps, lapses, dueISO}
  if (!s.ef) s.ef = 2.5;
  if (!s.ivl) s.ivl = 0;
  if (!s.reps) s.reps = 0;
  if (!s.lapses) s.lapses = 0;

  // Map rating to q
  let q = 0;
  if (rating==='again') q = 0;
  else if (rating==='hard') q = 3;
  else if (rating==='good') q = 4;
  else if (rating==='easy') q = 5;

  const today = todayLocalStart();

  if (q < 3){
    s.reps = 0;
    s.lapses += 1;
    s.ivl = 1; // 1 day
  } else {
    if (s.reps === 0) s.ivl = 1;
    else if (s.reps === 1) s.ivl = 6;
    else s.ivl = Math.max(1, Math.round(s.ivl * s.ef));
    s.reps += 1;
    // EF adjustment
    s.ef = s.ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
    if (s.ef < 1.3) s.ef = 1.3;
    if (rating==='hard') s.ivl = Math.max(1, Math.round(s.ivl * 0.85)); // slightly shorter for Hard
    if (rating==='easy') s.ivl = Math.round(s.ivl * 1.3);
  }
  s.dueISO = isoDate(addDays(today, s.ivl));
  return s;
}

// Build/refresh list of due indexes
function rebuildDueIndexes(){
  const srs = getSrsMap(currentUser, currentDeckName);
  const todayISO = isoDate(new Date());
  dueIndexes = [];
  for (let i=0;i<currentDeck.length;i++){
    const c = currentDeck[i];
    const meta = srs[c.id];
    if (!meta || !meta.dueISO || meta.dueISO <= todayISO){
      dueIndexes.push(i);
    }
  }
  duePos = 0;
  dueCountEl.textContent = `${dueIndexes.length} due`;
}

function gotoDue(pos){
  if (!dueIndexes.length){
    emptyState.classList.remove('hidden');
    cardFront.textContent = 'No cards due';
    cardBack.textContent = '';
    updateProgressDots(0,1);
    cardStartMs = null;
    return;
  } else {
    emptyState.classList.add('hidden');
  }
  duePos = Math.max(0, Math.min(pos, dueIndexes.length-1));
  currentIndex = dueIndexes[duePos];
  showCard();
}

// --- UI updates ---
function updateProgressDots(position, total){
  dots.innerHTML = '';
  for (let i=0;i<total;i++){
    const dot = document.createElement('span');
    dot.className = 'dot' + (i===position?' active':'');
    dots.appendChild(dot);
  }
}

function updateProgress(){
  if (!dueIndexes.length){
    progressText.textContent = '0 due';
    updateProgressDots(0,1);
    return;
  }
  const pos = duePos+1; const tot = dueIndexes.length;
  progressText.textContent = `Due ${pos} of ${tot}`;
  updateProgressDots(duePos, tot);
}

function showCard(){
  isFlipped = false;
  flashcard.classList.remove('flipped');
  const card = currentDeck[currentIndex];
  if (!card){ cardFront.textContent='No cards'; cardBack.textContent=''; cardStartMs=null; updateProgress(); return; }
  cardFront.textContent = card.front;
  cardBack.textContent = card.back;
  updateProgress();
  cardStartMs = Date.now();
}
function flipCard(){ isFlipped = !isFlipped; flashcard.classList.toggle('flipped', isFlipped); }

function nextCard(){
  if (!dueIndexes.length){ updateProgress(); return; }
  const nextPos = (duePos + 1);
  if (nextPos >= dueIndexes.length){
    rebuildDueIndexes();
    gotoDue(0);
  } else {
    gotoDue(nextPos);
  }
}
function prevCard(){
  if (!dueIndexes.length){ updateProgress(); return; }
  const prevPos = (duePos - 1);
  if (prevPos < 0){ gotoDue(0); } else { gotoDue(prevPos); }
}

function rate(rating){
  const nowMs = Date.now();
  const elapsed = cardStartMs ? (nowMs - cardStartMs) : 0;
  const c = currentDeck[currentIndex];
  if (!c) return;

  // update session totals
  session.reviewed += 1;
  if (rating==='again' || rating==='hard') session.incorrect += 1; else session.correct += 1;
  session.totalMs += elapsed;

  // update SRS
  const map = getSrsMap(currentUser, currentDeckName);
  const meta = map[c.id] || {};
  map[c.id] = updateSRS(meta, rating);
  saveSrsMap(currentUser, currentDeckName, map);

  // remove this index from current due list
  const removed = dueIndexes.splice(duePos, 1);
  if (duePos >= dueIndexes.length) duePos = Math.max(0, dueIndexes.length - 1);
  dueCountEl.textContent = `${dueIndexes.length} due`;

  if (!dueIndexes.length){
    updateProgress();
    gotoDue(0);
  } else {
    gotoDue(duePos);
  }
}

// --- Session helpers ---
function startSession(){
  session = { startedAt: new Date().toISOString(), finishedAt: null, reviewed: 0, correct: 0, incorrect: 0, totalMs: 0 };
}
function maybeEndSession(save=true){
  if (!session) return;
  if (session.reviewed > 0) {
    session.finishedAt = new Date().toISOString();
    if (save) {
      const list = getStats(currentUser, currentDeckName);
      list.push(session);
      saveStats(currentUser, currentDeckName, list.slice(-200)); // keep last 200
    }
  }
  session = null;
}

function refreshAll(){
  rebuildDueIndexes();
  gotoDue(0);
}

function loadDeckByName(deckName){
  maybeEndSession(true);
  currentDeckName = deckName;
  currentDeck = getUserDeck(currentUser, currentDeckName);
  currentIndex = 0;
  refreshAll();
  startSession();
}

// --- Auth ---
function loadDeck(){
  const userId = userIdInput.value.trim();
  if (!ALLOWED_USERS.includes(userId)) { alert('Invalid ID'); return; }
  currentUser = userId;
  whoEl.textContent = userId;
  loginSection.style.display = 'none';
  appSection.style.display = 'block';
  const lastDeck = localStorage.getItem(lsKey('lastDeck', userId)) || 'HSK2';
  deckSelect.value = lastDeck;
  loadDeckByName(deckSelect.value);
  localStorage.setItem(lsKey('lastUser'), userId);
}
function logout(){
  maybeEndSession(true);
  currentUser = null;
  currentDeck = [];
  currentIndex = 0;
  userIdInput.value = '';
  appSection.style.display = 'none';
  loginSection.style.display = 'block';
  userIdInput.focus();
}

// --- Theme ---
function initTheme(){ const saved = localStorage.getItem(lsKey('theme')); if (saved==='light') document.body.setAttribute('data-theme','light'); }
function toggleTheme(){ const isLight = document.body.getAttribute('data-theme')==='light'; document.body.setAttribute('data-theme', isLight?'':'light'); localStorage.setItem(lsKey('theme'), isLight?'dark':'light'); }

// --- Modal & Tabs ---
function openSettings(){
  renderManage();
  renderStats();
  settingsModal.classList.add('open');
  settingsModal.setAttribute('aria-hidden','false');
}
function closeSettingsModal(){ settingsModal.classList.remove('open'); settingsModal.setAttribute('aria-hidden','true'); }
function switchTab(which){
  tabs.forEach(t=>t.classList.toggle('active', t.dataset.tab===which));
  tabManage.classList.toggle('hidden', which!=='manage');
  tabStats.classList.toggle('hidden', which!=='stats');
  if (which==='stats') renderStats();
}

// --- Manage Cards ---
function renderManage(){
  const cards = getUserDeck(currentUser, currentDeckName);
  cardsList.innerHTML = '';
  cards.forEach((c, idx)=>{
    const row = document.createElement('div'); row.className='card-item';
    const f = document.createElement('div'); f.className='card-text'; f.textContent=c.front;
    const b = document.createElement('div'); b.className='card-text'; b.textContent=c.back;
    const actions = document.createElement('div'); actions.className='card-actions';
    const del = document.createElement('button'); del.className='danger'; del.textContent='Delete';
    del.addEventListener('click', ()=>{
      if (!confirm('Delete this card?')) return;
      const updated = getUserDeck(currentUser, currentDeckName);
      const removed = updated.splice(idx,1)[0];
      saveUserDeck(currentUser, currentDeckName, updated);
      // clean srs state for removed card
      const map = getSrsMap(currentUser, currentDeckName);
      if (removed && removed.id) { delete map[removed.id]; saveSrsMap(currentUser, currentDeckName, map); }
      currentDeck = updated;
      refreshAll();
      renderManage();
    });
    actions.appendChild(del);
    row.appendChild(f); row.appendChild(b); row.appendChild(actions);
    cardsList.appendChild(row);
  });
}

addCardBtn.addEventListener('click', ()=>{
  const front = newFront.value.trim();
  const back = newBack.value.trim();
  if (!front || !back) { alert('Please enter both front and back.'); return; }
  const cards = getUserDeck(currentUser, currentDeckName);
  const id = 'u:' + Date.now().toString(36) + Math.random().toString(36).slice(2,8);
  cards.push({id, front, back});
  saveUserDeck(currentUser, currentDeckName, cards);
  newFront.value=''; newBack.value='';
  currentDeck = cards; // immediately use updated deck
  refreshAll();
  renderManage();
});

// --- Stats ---
function msToReadable(ms){ if(!ms) return '0.0s'; return (ms/1000).toFixed(1) + 's'; }
function pct(n,d){ return d>0 ? Math.round((n/d)*100) : 0; }

function buildDailySeries(sessions, days=14){
  const series = [];
  const today = todayLocalStart();
  const map = new Map(); // dateISO -> {reviews, ms}
  for (const s of sessions){
    const ended = s.finishedAt ? new Date(s.finishedAt) : new Date(s.startedAt);
    const key = isoDate(ended);
    const cur = map.get(key) || {reviews:0, ms:0};
    cur.reviews += s.reviewed; cur.ms += s.totalMs;
    map.set(key, cur);
  }
  for (let i=days-1; i>=0; i--){
    const d = addDays(today, -i);
    const key = isoDate(d);
    const v = map.get(key) || {reviews:0, ms:0};
    series.push({ date: key, reviews: v.reviews, minutes: Math.round(v.ms/600)/10 }); // minutes with 0.1 precision
  }
  return series;
}

function calcStreaks(sessions){
  const series = buildDailySeries(sessions, 120); // look back up to ~4 months
  let cur=0, best=0;
  for (let i=series.length-1;i>=0;i--){
    if (series[i].reviews>0){ cur++; if (cur>best) best=cur; }
    else { if (i===series.length-1) cur=0; else { cur=0; } }
  }
  return { current: cur, best };
}

function renderBars(container, series, valueKey, maxAuto=true){
  container.innerHTML = '';
  const maxVal = maxAuto ? Math.max(1, ...series.map(s=>s[valueKey])) : 1;
  series.forEach(s=>{
    const bar = document.createElement('div');
    bar.className = 'bar';
    const h = Math.round((s[valueKey]/maxVal)*100);
    bar.style.height = h + '%';
    const tip = document.createElement('div'); tip.className='tip'; tip.textContent = `${s.date}
${s[valueKey]}${valueKey==='minutes'?' min':''}`;
    bar.appendChild(tip);
    container.appendChild(bar);
  });
}

function renderStats(){
  const sessions = getStats(currentUser, currentDeckName);
  const totalReviewed = sessions.reduce((a,s)=>a+s.reviewed,0);
  const totalCorrect = sessions.reduce((a,s)=>a+s.correct,0);
  const totalMs = sessions.reduce((a,s)=>a+s.totalMs,0);
  const overallAcc = pct(totalCorrect, totalReviewed);
  const avgMs = totalReviewed>0 ? Math.round(totalMs/totalReviewed) : 0;

  statsOverview.innerHTML = '';
  const mk = (label, value)=>{ const d=document.createElement('div'); d.className='stat'; d.innerHTML=`<div class="label">${label}</div><div class="value">${value}</div>`; return d; }
  statsOverview.appendChild(mk('Average time per card', msToReadable(avgMs)));
  statsOverview.appendChild(mk('Accuracy', overallAcc + '%'));
  statsOverview.appendChild(mk('Total reviewed', String(totalReviewed)));

  const last5 = sessions.slice(-5);
  sessionsList.innerHTML = '';
  last5.forEach(s=>{
    const row = document.createElement('div'); row.className='session-row';
    const date = new Date(s.finishedAt || s.startedAt);
    const dateEl = document.createElement('div'); dateEl.className='session-date'; dateEl.textContent = date.toLocaleDateString();
    const countEl = document.createElement('div'); countEl.textContent = `${s.reviewed} cards`;
    const accEl = document.createElement('div'); const p = pct(s.correct, s.reviewed); accEl.textContent = `${p}%`;
    const timeEl = document.createElement('div'); timeEl.textContent = msToReadable(s.reviewed?Math.round(s.totalMs/s.reviewed):0);
    row.appendChild(dateEl); row.appendChild(countEl); row.appendChild(accEl); row.appendChild(timeEl);
    sessionsList.appendChild(row);
  });

  // Streak & charts
  const { current, best } = calcStreaks(sessions);
  streakNowEl.textContent = `${current} ${current===1?'day':'days'}`;
  streakBestEl.textContent = `${best} ${best===1?'day':'days'}`;

  const last14 = buildDailySeries(sessions, 14);
  renderBars(reviewsChart, last14, 'reviews');
  renderBars(timeChart, last14, 'minutes');
}

resetStatsBtn.addEventListener('click', ()=>{
  if (!confirm('Reset all stats for this deck?')) return;
  saveStats(currentUser, currentDeckName, []);
  renderStats();
});

// --- Events ---
startBtn.addEventListener('click', loadDeck);
userIdInput.addEventListener('keydown', (e)=>{ if(e.key==='Enter') loadDeck(); });
logoutBtn.addEventListener('click', logout);

deckSelect.addEventListener('change', ()=>{ localStorage.setItem(lsKey('lastDeck', currentUser), deckSelect.value); loadDeckByName(deckSelect.value); });

flashcard.addEventListener('click', flipCard);
flipBtn.addEventListener('click', flipCard);
nextBtn.addEventListener('click', nextCard);
prevBtn.addEventListener('click', prevCard);

againBtn.addEventListener('click', ()=> rate('again'));
hardBtn.addEventListener('click', ()=> rate('hard'));
goodBtn.addEventListener('click', ()=> rate('good'));
easyBtn.addEventListener('click', ()=> rate('easy'));

endSessionBtn.addEventListener('click', ()=>{ maybeEndSession(true); startSession(); alert('Session saved. New session started.'); renderStats(); });

document.addEventListener('keydown', (e)=>{
  if (appSection.style.display==='none') return;
  if (e.key===' '||e.code==='Space'){ e.preventDefault(); flipCard(); }
  else if (e.key==='ArrowRight') nextCard();
  else if (e.key==='ArrowLeft') prevCard();
  else if (e.key==='1') rate('again');
  else if (e.key==='2') rate('hard');
  else if (e.key==='3') rate('good');
  else if (e.key==='4') rate('easy');
});

// Settings modal
settingsBtn.addEventListener('click', openSettings);
closeSettings.addEventListener('click', closeSettingsModal);
document.getElementById('modalBackdrop').addEventListener('click', closeSettingsModal);
tabs.forEach(t=> t.addEventListener('click', ()=> switchTab(t.dataset.tab)));

// Theme
initTheme();
themeToggle.addEventListener('click', toggleTheme);

// --- Init ---
const lastUser = localStorage.getItem(lsKey('lastUser'));
if (lastUser) userIdInput.value = lastUser;

window.addEventListener('beforeunload', ()=>{ maybeEndSession(true); });
