
// --- Config ---
const ALLOWED_USERS = ["Mand1106","Mand1409","Mand1434","Mand1488","Mand1520","Mand2424","Mand2535","Mand2679","Mand2824","Mand3286","Mand3615","Mand4257","Mand4582","Mand4611","Mand4657","Mand4811","Mand5012","Mand5506","Mand5552","Mand5557","Mand6574","Mand7873","Mand7912","Mand7924","Mand8359","Mand9279","Mand9928","Mand9935"]; // Teacher not here; admin login is private
const LS_PREFIX = 'mand12';
const DAILY_NEW_LIMIT = 20;
const DAILY_TOTAL_LIMIT = 50;
const AGAIN_OFFSET = [2,5];
const HARD_OFFSET  = [6,12];
const GOOD_WINDOW  = [1,3];
const EASY_WINDOW  = [7,14];

// Base decks
const baseDecks = { HSK2: [], HSK3: [], Full: [] }; // Full stays EMPTY
const fallbackHSK2 = [{"id": "比如|bǐrú", "front": "比如", "back": "bǐrú — for example"}, {"id": "或者|huòzhě", "front": "或者", "back": "huòzhě — or"}, {"id": "但是|dànshì", "front": "但是", "back": "dànshì — but"}, {"id": "必须|bìxū", "front": "必须", "back": "bìxū — must"}, {"id": "应该|yīnggāi", "front": "应该", "back": "yīnggāi — should"}];
const fallbackHSK3 = [{"id": "变化|biànhuà", "front": "变化", "back": "biànhuà — change; to change"}, {"id": "成功|chénggōng", "front": "成功", "back": "chénggōng — success"}, {"id": "方式|fāngshì", "front": "方式", "back": "fāngshì — way; method"}, {"id": "关系|guānxi", "front": "关系", "back": "guānxi — relationship"}, {"id": "过程|guòchéng", "front": "过程", "back": "guòchéng — process"}];

// --- State ---
let currentUser=null, currentDeckName=null, currentDeck=[];
let idToIndex=new Map();
let isFlipped=false, daily=null, cardStartMs=null, session=null;
let teacherMode=false, impersonating=null;

// --- DOM ---
const loginSection=document.getElementById('login');
const deckSelectPanel=document.getElementById('deckSelectPanel');
const reviewPanel=document.getElementById('review');
const teacherPanel=document.getElementById('teacherPanel');
const userIdInput=document.getElementById('userId');
const startBtn=document.getElementById('startBtn');
const whoEl=document.getElementById('who');
const whoTeacher=document.getElementById('whoTeacher');
const logoutBtn=document.getElementById('logoutBtn');
const logoutBtnTeacher=document.getElementById('logoutBtnTeacher');
const deckButtons=document.querySelectorAll('.deck-btn');
const backToDecks=document.getElementById('backToDecks');
const deckNameEl=document.getElementById('deckName');
const settingsBtn=document.getElementById('settingsBtn');
const dueCountEl=document.getElementById('dueCount');
const flashcard=document.getElementById('flashcard');
const cardFront=document.getElementById('cardFront');
const cardBack=document.getElementById('cardBack');
const flipRow=document.getElementById('flipRow');
const rateRow=document.getElementById('rateRow');
const flipBtn=document.getElementById('flipBtn');
const againBtn=document.getElementById('againBtn');
const hardBtn=document.getElementById('hardBtn');
const goodBtn=document.getElementById('goodBtn');
const easyBtn=document.getElementById('easyBtn');
const endSessionBtn=document.getElementById('endSessionBtn');
const emptyState=document.getElementById('emptyState');
const brand=document.getElementById('brand');

// Settings modal DOM
const settingsModal=document.getElementById('settingsModal');
const closeSettingsBtn=document.getElementById('closeSettingsBtn');
const settingsTabs=document.querySelectorAll('#settingsModal .tab');
const managePanel=document.getElementById('m-manage');
const statsPanel=document.getElementById('m-stats');
const addHanzi=document.getElementById('addHanzi');
const addPinyin=document.getElementById('addPinyin');
const addEnglish=document.getElementById('addEnglish');
const addCardBtn=document.getElementById('addCardBtn');
const addToToday=document.getElementById('addToToday');
const resetProgressBtn=document.getElementById('resetProgressBtn');
const cardsList=document.getElementById('cardsList');
const exportDeckBtn=document.getElementById('exportDeckBtn');
const importDeckFile=document.getElementById('importDeckFile');
const statsGrid=document.getElementById('statsGrid');
const statsNote=document.getElementById('statsNote');

// Admin modal DOM
const adminModal=document.getElementById('adminModal');
const adminCode=document.getElementById('adminCode');
const adminLoginBtn=document.getElementById('adminLoginBtn');
const closeAdminBtn=document.getElementById('closeAdminBtn');

// --- Helpers & Storage ---
const k = (...parts)=> [LS_PREFIX, ...parts].join(':');
const clone = (x)=> JSON.parse(JSON.stringify(x));
const rngInt=(min,max)=> Math.floor(Math.random()*(max-min+1))+min;

const getDeckOverrides=(u)=> JSON.parse(localStorage.getItem(k('decks',u))||'{}');
const setDeckOverrides=(u,o)=> localStorage.setItem(k('decks',u), JSON.stringify(o));
const getUserDeck=(u,name)=> { const o=getDeckOverrides(u); const src=Array.isArray(o[name])?o[name]:baseDecks[name]; return clone(src); }
const saveUserDeck=(u,name,cards)=> { const o=getDeckOverrides(u); o[name]=cards; setDeckOverrides(u,o); }

const getSrs=(u,name)=> JSON.parse(localStorage.getItem(k('srs',u,name))||'{}');
const setSrs=(u,name,map)=> localStorage.setItem(k('srs',u,name), JSON.stringify(map));

const getDaily=(u,name)=> JSON.parse(localStorage.getItem(k('daily',u,name))||'null');
const setDaily=(u,name,obj)=> localStorage.setItem(k('daily',u,name), JSON.stringify(obj));

const getStats=(u,name)=> JSON.parse(localStorage.getItem(k('stats',u,name))||'[]');
const setStats=(u,name,arr)=> localStorage.setItem(k('stats',u,name), JSON.stringify(arr));

const todayStart=(d=new Date())=> new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays=(d,days)=> { const nd=new Date(d); nd.setDate(nd.getDate()+days); return nd; };
const isoDate=(d)=> new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().slice(0,10);

function rebuildIndexMap(){ idToIndex=new Map(); for(let i=0;i<currentDeck.length;i++) idToIndex.set(currentDeck[i].id,i); }

async function loadDeckJSON(){
  try {
    const r2 = await fetch('data/hsk2_thatsmandarin.json');
    baseDecks.HSK2 = r2.ok ? await r2.json() : fallbackHSK2;
  } catch(e){ baseDecks.HSK2 = fallbackHSK2; }
  try {
    const r3 = await fetch('data/hsk3_thatsmandarin.json');
    baseDecks.HSK3 = r3.ok ? await r3.json() : fallbackHSK3;
  } catch(e){ baseDecks.HSK3 = fallbackHSK3; }
}

function seedDecksForAllUsers(){
  for (const uid of ALLOWED_USERS){
    const o = getDeckOverrides(uid); let changed=false;
    if (!Array.isArray(o.HSK2)) { o.HSK2 = clone(baseDecks.HSK2); changed=true; }
    if (!Array.isArray(o.HSK3)) { o.HSK3 = clone(baseDecks.HSK3); changed=true; }
    if (changed) setDeckOverrides(uid, o);
  }
}

// --- Queue ---
function ensureDailyQueue(){
  const todayISO=isoDate(new Date());
  let d = getDaily(currentUser, currentDeckName);
  if (d && d.dateISO===todayISO){
    const valid=new Set(currentDeck.map(c=>c.id));
    d.queue=d.queue.filter(id=>valid.has(id));
    d.completed=Array.isArray(d.completed)? d.completed.filter(id=>valid.has(id)) : [];
    if (d.cursor>d.queue.length) d.cursor=d.queue.length;
    setDaily(currentUser,currentDeckName,d); daily=d; return;
  }
  const srs=getSrs(currentUser,currentDeckName);
  const newIds=[], reviewDue=[], reviewLater=[];
  const tKey=todayISO;
  for(const c of currentDeck){
    const meta=srs[c.id];
    if(!meta) newIds.push(c.id);
    else { const due=(meta.dueISO||'1970-01-01'); if(due<=tKey) reviewDue.push(c.id); else reviewLater.push(c.id); }
  }
  const shuffle=a=>{const b=a.slice(); for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];} return b; };
  const newSh=shuffle(newIds), dueSh=shuffle(reviewDue), latSh=shuffle(reviewLater);
  const n=Math.min(DAILY_NEW_LIMIT,newSh.length);
  const r1=Math.min(dueSh.length, Math.max(0, DAILY_TOTAL_LIMIT-n));
  const leftover=Math.max(0, DAILY_TOTAL_LIMIT-n-r1);
  const r2=Math.min(latSh.length, leftover);
  const chosenNew=newSh.slice(0,n), chosenRev=dueSh.slice(0,r1).concat(latSh.slice(0,r2));
  const queue=[]; let i=0,j=0, turn=chosenRev.length>0?'rev':'new';
  while(i<chosenNew.length || j<chosenRev.length){
    if(turn==='rev'&&j<chosenRev.length) queue.push(chosenRev[j++]);
    else if(turn==='new'&&i<chosenNew.length) queue.push(chosenNew[i++]);
    else if(j<chosenRev.length) queue.push(chosenRev[j++]);
    else if(i<chosenNew.length) queue.push(chosenNew[i++]);
    turn=(turn==='rev')?'new':'rev';
  }
  daily={dateISO:todayISO, queue, cursor:0, completed:[]};
  setDaily(currentUser,currentDeckName,daily);
}

// --- UI ---
function updateDueLeft(){ const left = daily? Math.max(0, daily.queue.length - daily.cursor) : 0; dueCountEl.textContent = `${left} left`; }

function showDoneForToday(){
  isFlipped=false; flashcard.classList.remove('flipped');
  flipRow.classList.add('hidden');
  rateRow.classList.add('hidden');
  emptyState.classList.remove('hidden');
  cardFront.textContent='🎉 All caught up';
  cardBack.textContent='';
}

function showCard(){
  const noMore = !daily || daily.cursor>=daily.queue.length;
  if (noMore){ updateDueLeft(); showDoneForToday(); return; }
  const cid = daily.queue[daily.cursor];
  const idx = idToIndex.get(cid);
  if (idx==null){
    daily.cursor++; setDaily(currentUser,currentDeckName,daily); return showCard();
  }
  emptyState.classList.add('hidden');
  isFlipped=false; flashcard.classList.remove('flipped');
  flipRow.classList.remove('hidden');
  rateRow.classList.add('hidden');
  const card = currentDeck[idx];
  cardFront.textContent = card.front;
  cardBack.textContent  = card.back;
  cardStartMs = Date.now();
  updateDueLeft();
}

function flipCard(){ if(isFlipped) return; isFlipped=true; flashcard.classList.add('flipped'); flipRow.classList.add('hidden'); rateRow.classList.remove('hidden'); }

// --- Scheduling ---
function markCompletedToday(id){ if(!daily.completed.includes(id)) daily.completed.push(id); }
function advanceQueue(){ daily.cursor = Math.min(daily.cursor+1, daily.queue.length); setDaily(currentUser,currentDeckName,daily); }
function insertBackInQueue(id, minOff, maxOff){ const off=rngInt(minOff,maxOff); const ins=Math.min(daily.cursor+off, daily.queue.length); daily.queue.splice(ins,0,id); setDaily(currentUser,currentDeckName,daily); }
function updateSRSFuture(id, minDays, maxDays){ const map=getSrs(currentUser,currentDeckName); const meta=map[id]||{ef:2.5, ivl:0, reps:0, lapses:0}; const d=rngInt(minDays,maxDays); meta.ivl=d; meta.reps=(meta.reps||0)+1; meta.ef=Math.max(1.3,(meta.ef||2.5)); meta.dueISO=isoDate(addDays(todayStart(),d)); map[id]=meta; setSrs(currentUser,currentDeckName,map); }

function rate(r){
  const cid = (daily && daily.cursor<daily.queue.length) ? daily.queue[daily.cursor] : null; if(!cid) { showDoneForToday(); return; }
  const now=Date.now(); const elapsed=cardStartMs? now-cardStartMs : 0;
  session.reviewed += 1;
  if(r==='again'||r==='hard') session.incorrect += 1; else session.correct += 1;
  session.totalMs += elapsed;
  advanceQueue();
  if (r==='again') insertBackInQueue(cid, AGAIN_OFFSET[0], AGAIN_OFFSET[1]);
  else if (r==='hard') insertBackInQueue(cid, HARD_OFFSET[0], HARD_OFFSET[1]);
  else if (r==='good') { markCompletedToday(cid); updateSRSFuture(cid, GOOD_WINDOW[0], GOOD_WINDOW[1]); }
  else if (r==='easy') { markCompletedToday(cid); updateSRSFuture(cid, EASY_WINDOW[0], EASY_WINDOW[1]); }
  showCard();
}

// --- Session & Navigation ---
function startSession(){ session={ startedAt:new Date().toISOString(), finishedAt:null, reviewed:0, correct:0, incorrect:0, totalMs:0 }; }
function maybeEndSession(save=true){ if(!session) return; if(session.reviewed>0){ session.finishedAt=new Date().toISOString(); if(save){ const list=getStats(currentUser,currentDeckName); list.push(session); setStats(currentUser,currentDeckName, list.slice(-400)); }} session=null; }
function enterReview(name){ currentDeckName=name; deckNameEl.textContent=name; currentDeck=getUserDeck(currentUser,currentDeckName); rebuildIndexMap(); ensureDailyQueue(); startSession(); deckSelectPanel.style.display='none'; reviewPanel.style.display='block'; showCard(); }

function login(){ const uid=userIdInput.value.trim(); if(!ALLOWED_USERS.includes(uid)){ alert('Invalid ID'); return; } localStorage.setItem(k('lastUser'), uid); teacherMode=false; currentUser=uid; whoEl.textContent=uid; deckSelectPanel.style.display='block'; loginSection.style.display='none'; }
function logout(){ maybeEndSession(true); currentUser=null; teacherMode=false; impersonating=null; loginSection.style.display='block'; deckSelectPanel.style.display='none'; reviewPanel.style.display='none'; teacherPanel.style.display='none'; userIdInput.focus(); }

function showTeacher(){ loginSection.style.display='none'; deckSelectPanel.style.display='none'; reviewPanel.style.display='none'; teacherPanel.style.display='block'; renderTeacher(); }

// --- Teacher Dashboard ---
function stat(label,value){ const d=document.createElement('div'); d.className='stat'; d.innerHTML=`<div class="label">${label}</div><div class="value">${value}</div>`; return d; }
function msToReadable(ms){ if(!ms) return '0.0s'; return (ms/1000).toFixed(1)+'s'; }
function pct(n,d){ return d>0? Math.round((n/d)*100) : 0; }
function renderTeacher(){ const users = ALLOWED_USERS.filter(u=>/^Mand\d{4}$/.test(u)); let totalReviewed=0,totalCorrect=0,totalMs=0,days=new Set(); for(const u of users){ for(const deck of ['HSK2','HSK3']){ const ss=getStats(u,deck); for(const s of ss){ totalReviewed+=s.reviewed; totalCorrect+=s.correct; totalMs+=s.totalMs; const t=new Date(s.finishedAt||s.startedAt); days.add(isoDate(t)); } } } teacherSummary.innerHTML=''; teacherSummary.appendChild(stat('Total reviews', String(totalReviewed))); teacherSummary.appendChild(stat('Accuracy', pct(totalCorrect,totalReviewed)+'%')); teacherSummary.appendChild(stat('Active days', String(days.size)));
  studentsList.innerHTML='';
  for(const u of users){ let r=0,c=0,ms=0,last=null; for(const deck of ['HSK2','HSK3']){ const ss=getStats(u,deck); for(const s of ss){ r+=s.reviewed; c+=s.correct; ms+=s.totalMs; const t=new Date(s.finishedAt||s.startedAt); if(!last||t>last) last=t; } } const row=document.createElement('div'); row.className='session-row'; const pill=document.createElement('div'); pill.className='user-pill'; pill.textContent=u; const lastEl=document.createElement('div'); lastEl.className='session-date'; lastEl.textContent= last? last.toLocaleDateString(): '—'; const countEl=document.createElement('div'); countEl.textContent=`${r} cards`; const accEl=document.createElement('div'); accEl.textContent=`${pct(c,r)}%`; const timeEl=document.createElement('div'); timeEl.textContent=msToReadable(r?Math.round(ms/r):0); const act=document.createElement('div'); const btn=document.createElement('button'); btn.className='impersonate'; btn.textContent='Impersonate'; btn.addEventListener('click', ()=>{ impersonating=u; currentUser=u; whoEl.textContent=u; teacherMode=false; deckSelectPanel.style.display='block'; teacherPanel.style.display='none'; }); act.appendChild(btn); row.appendChild(pill); row.appendChild(lastEl); row.appendChild(countEl); row.appendChild(accEl); row.appendChild(timeEl); row.appendChild(act); studentsList.appendChild(row); }
}

// Teacher tab switching
const teacherTabs=document.querySelectorAll('#teacherPanel .tab');
teacherTabs.forEach(t=> t.addEventListener('click', ()=>{ teacherTabs.forEach(x=>x.classList.toggle('active', x===t)); document.getElementById('t-dashboard').classList.toggle('hidden', t.dataset.tab!=='t-dashboard'); document.getElementById('t-import').classList.toggle('hidden', t.dataset.tab!=='t-import'); }));

// Import handlers (teacher)
const fileHsk2=document.getElementById('fileHsk2');
const fileHsk3=document.getElementById('fileHsk3');
const btnImportHsk2=document.getElementById('btnImportHsk2');
const btnImportHsk3=document.getElementById('btnImportHsk3');
btnImportHsk2?.addEventListener('click', async ()=>{ const f=fileHsk2.files?.[0]; if(!f) return alert('Choose a JSON file'); try{ const txt=await f.text(); const arr=JSON.parse(txt); baseDecks.HSK2=arr; seedDecksForAllUsers(); alert('HSK 2 imported for all users.'); } catch(e){ alert('Invalid JSON'); }
});
btnImportHsk3?.addEventListener('click', async ()=>{ const f=fileHsk3.files?.[0]; if(!f) return alert('Choose a JSON file'); try{ const txt=await f.text(); const arr=JSON.parse(txt); baseDecks.HSK3=arr; seedDecksForAllUsers(); alert('HSK 3 imported for all users.'); } catch(e){ alert('Invalid JSON'); }
});

function tsvToDeck(tsv){ const lines=tsv.split(/\r?\n/).map(x=>x.trim()).filter(Boolean); const cards=[]; for(const line of lines){ const [hanzi,pinyin,english] = line.split(/\t+/); if(!hanzi||!pinyin||!english) continue; const id=`${hanzi}|${pinyin}`; cards.push({id, front:hanzi, back:`${pinyin} — ${english}`}); } return cards; }

// --- Settings Modal Logic (user deck config) ---
function openSettings(){ settingsModal.classList.add('open'); renderManage(); renderStats(); settingsModal.setAttribute('aria-hidden','false'); }
function closeSettings(){ settingsModal.classList.remove('open'); settingsModal.setAttribute('aria-hidden','true'); }

settingsBtn.addEventListener('click', openSettings);
closeSettingsBtn.addEventListener('click', closeSettings);

settingsTabs.forEach(tab=> tab.addEventListener('click', ()=>{ settingsTabs.forEach(x=>x.classList.toggle('active', x===tab)); managePanel.classList.toggle('hidden', tab.dataset.tab!=='m-manage'); statsPanel.classList.toggle('hidden', tab.dataset.tab!=='m-stats'); if(tab.dataset.tab==='m-stats') renderStats(); }));

function onDeckChanged(save=true){ if(save) saveUserDeck(currentUser,currentDeckName,currentDeck); rebuildIndexMap(); if(daily){ const valid=new Set(currentDeck.map(c=>c.id)); daily.queue=daily.queue.filter(id=>valid.has(id)); daily.completed=daily.completed?.filter(id=>valid.has(id))||[]; if(daily.cursor>daily.queue.length) daily.cursor=daily.queue.length; setDaily(currentUser,currentDeckName,daily); }
  updateDueLeft(); showCard(); renderManage(); }

function makeId(hanzi,pinyin){ return `${hanzi}|${pinyin}`; }

function addCard(){ const hanzi=addHanzi.value.trim(); const pinyin=addPinyin.value.trim(); const eng=addEnglish.value.trim(); if(!hanzi||!pinyin||!eng) return alert('Fill all fields'); const id=makeId(hanzi,pinyin); if(idToIndex.has(id)) return alert('This card already exists'); const card={id, front:hanzi, back:`${pinyin} — ${eng}`}; currentDeck.push(card); onDeckChanged(); addHanzi.value=''; addPinyin.value=''; addEnglish.value=''; if(addToToday.checked && daily){ if(daily.queue.length < DAILY_TOTAL_LIMIT){ const ins=Math.min(daily.cursor+1, daily.queue.length); daily.queue.splice(ins,0,id); setDaily(currentUser,currentDeckName,daily); updateDueLeft(); } }
}
addCardBtn.addEventListener('click', addCard);

function editCard(oldId){ const idx=idToIndex.get(oldId); if(idx==null) return; const card=currentDeck[idx]; const hanzi=prompt('Chinese (汉字):', card.front); if(hanzi==null) return; const pinyin=prompt('Pinyin:', card.back.split(' — ')[0]||''); if(pinyin==null) return; const eng=prompt('English:', (card.back.split(' — ')[1]||'').trim()); if(eng==null) return; const newId=makeId(hanzi.trim(), pinyin.trim()); const newCard={id:newId, front:hanzi.trim(), back:`${pinyin.trim()} — ${eng.trim()}`}; // reconcile SRS/daily if id changed
  if(newId!==oldId){ const srs=getSrs(currentUser,currentDeckName); if(srs[oldId]){ srs[newId]=srs[oldId]; delete srs[oldId]; setSrs(currentUser,currentDeckName,srs); }
    if(daily){ daily.queue=daily.queue.map(x=> x===oldId? newId : x); daily.completed=daily.completed.map(x=> x===oldId? newId : x); setDaily(currentUser,currentDeckName,daily); }
  }
  currentDeck[idx]=newCard; onDeckChanged(); }

function deleteCard(id){ if(!confirm('Delete this card?')) return; const idx=idToIndex.get(id); if(idx==null) return; currentDeck.splice(idx,1); // remove from SRS/daily
  const srs=getSrs(currentUser,currentDeckName); if(srs[id]){ delete srs[id]; setSrs(currentUser,currentDeckName,srs); }
  if(daily){ daily.queue=daily.queue.filter(x=>x!==id); daily.completed=daily.completed.filter(x=>x!==id); if(daily.cursor>daily.queue.length) daily.cursor=daily.queue.length; setDaily(currentUser,currentDeckName,daily); }
  onDeckChanged(); }

function renderManage(){ cardsList.innerHTML=''; const frag=document.createDocumentFragment(); currentDeck.forEach(c=>{ const row=document.createElement('div'); row.className='card-item'; const f=document.createElement('div'); f.className='card-text'; f.textContent=c.front; const b=document.createElement('div'); b.className='card-text'; b.textContent=c.back; const act=document.createElement('div'); act.className='card-actions'; const e=document.createElement('button'); e.textContent='Edit'; e.className='outline'; e.addEventListener('click', ()=>editCard(c.id)); const d=document.createElement('button'); d.textContent='Delete'; d.className='outline'; d.addEventListener('click', ()=>deleteCard(c.id)); act.appendChild(e); act.appendChild(d); row.appendChild(f); row.appendChild(b); row.appendChild(act); frag.appendChild(row); }); cardsList.appendChild(frag); }

function renderStats(){ statsGrid.innerHTML=''; const list=getStats(currentUser,currentDeckName); const totalReviews=list.reduce((a,s)=>a+s.reviewed,0); const totalCorrect=list.reduce((a,s)=>a+s.correct,0); const totalMs=list.reduce((a,s)=>a+s.totalMs,0); const acc = totalReviews? Math.round((totalCorrect/totalReviews)*100) : 0; const avgTime = totalReviews? (totalMs/totalReviews/1000).toFixed(1)+'s' : '0.0s';
  function addStat(label,value){ const d=document.createElement('div'); d.className='stat'; d.innerHTML=`<div class="label">${label}</div><div class="value">${value}</div>`; statsGrid.appendChild(d); }
  addStat('Cards in deck', String(currentDeck.length));
  addStat('Due left today', daily? Math.max(0,daily.queue.length-daily.cursor) : 0);
  addStat('Total reviews', String(totalReviews));
  addStat('Accuracy', acc+'%');
  addStat('Avg time/card', avgTime);
  const days=new Set(list.map(s=> (s.finishedAt||s.startedAt).slice(0,10))); addStat('Active days', String(days.size));
  statsNote.textContent = list.length? '' : 'No review history yet.';
}

exportDeckBtn.addEventListener('click', ()=>{ const data=JSON.stringify(currentDeck,null,2); const blob=new Blob([data], {type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`${currentDeckName.toLowerCase()}_deck.json`; a.click(); URL.revokeObjectURL(a.href); });

importDeckFile.addEventListener('change', async (e)=>{ const f=e.target.files?.[0]; if(!f) return; try{ const txt=await f.text(); const arr=JSON.parse(txt); if(!Array.isArray(arr)) throw new Error('Invalid'); currentDeck=arr; onDeckChanged(); alert('Deck replaced for this user.'); }catch(err){ alert('Invalid JSON'); }
});

resetProgressBtn.addEventListener('click', ()=>{ if(!confirm('Clear scheduling (SRS) for this deck?')) return; setSrs(currentUser,currentDeckName,{}); setDaily(currentUser,currentDeckName,null); ensureDailyQueue(); updateDueLeft(); alert('Progress reset.'); });

// --- Admin/private login ---
function openAdmin(){ adminModal.classList.add('open'); adminModal.setAttribute('aria-hidden','false'); adminCode.value=''; adminCode.focus(); }
function closeAdmin(){ adminModal.classList.remove('open'); adminModal.setAttribute('aria-hidden','true'); }

// Hidden triggers: Ctrl+Alt+T or triple-click brand
window.addEventListener('keydown', (e)=>{ if(e.ctrlKey && e.altKey && (e.key==='t' || e.key==='T')) { e.preventDefault(); openAdmin(); } });
let clickCount=0, clickTimer=null; brand.addEventListener('click', ()=>{ clickCount++; clearTimeout(clickTimer); clickTimer=setTimeout(()=>{ if(clickCount>=3) openAdmin(); clickCount=0; }, 350); });

adminLoginBtn.addEventListener('click', ()=>{ const code=adminCode.value.trim(); if(code!=='WynR29') return alert('Invalid passcode'); teacherMode=true; currentUser='__teacher__'; showTeacher(); closeAdmin(); });
closeAdminBtn.addEventListener('click', closeAdmin);

// Keyboard shortcuts
window.addEventListener('keydown', (e)=>{
  if (e.key===' ') { if(document.activeElement && ['INPUT','TEXTAREA'].includes(document.activeElement.tagName)) return; e.preventDefault(); if(!isFlipped) flipCard(); return; }
  if (!rateRow.classList.contains('hidden')){
    if(e.key==='1') rate('again');
    else if(e.key==='2') rate('hard');
    else if(e.key==='3') rate('good');
    else if(e.key==='4') rate('easy');
  }
});

// Events
startBtn.addEventListener('click', login);
userIdInput.addEventListener('keydown', e=>{ if(e.key==='Enter') login(); });
logoutBtn.addEventListener('click', logout);
logoutBtnTeacher.addEventListener('click', logout);

deckButtons.forEach(btn=> btn.addEventListener('click', ()=> enterReview(btn.dataset.deck)));
backToDecks.addEventListener('click', ()=>{ maybeEndSession(true); reviewPanel.style.display='none'; deckSelectPanel.style.display='block'; if(impersonating){ whoEl.textContent=impersonating; }
});
flashcard.addEventListener('click', ()=>{ if(!isFlipped) flipCard(); });
flipBtn.addEventListener('click', flipCard);
againBtn.addEventListener('click', ()=> rate('again'));
hardBtn.addEventListener('click', ()=> rate('hard'));
goodBtn.addEventListener('click', ()=> rate('good'));
easyBtn.addEventListener('click', ()=> rate('easy'));
endSessionBtn.addEventListener('click', ()=>{ maybeEndSession(true); startSession(); alert('Session saved. New session started.'); });

(async function init(){
  await loadDeckJSON();
  seedDecksForAllUsers();
  const lastUser=localStorage.getItem(k('lastUser')); if(lastUser) userIdInput.value=lastUser;
  loginSection.style.display='block';
})();

window.addEventListener('beforeunload', ()=>{ maybeEndSession(true); });
