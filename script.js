
// --- Config ---
const ALLOWED_USERS = ["Mand1106","Mand1409","Mand1434","Mand1488","Mand1520","Mand2424","Mand2535","Mand2679","Mand2824","Mand3286","Mand3547","Mand3615","Mand4257","Mand4527","Mand4582","Mand4611","Mand4657","Mand4811","Mand5012","Mand5506","Mand5552","Mand5557","Mand6574","Mand7873","Mand7912","Mand7924","Mand8359","Mand9279","Mand9928","Mand9935"];
const LS_PREFIX = 'mand12';
const DAILY_NEW_LIMIT = 20;
const DAILY_TOTAL_LIMIT = 50;
// Intra-day reinsertion offsets (card positions later)
const AGAIN_OFFSET = [2,5];
const HARD_OFFSET  = [6,12]; // stickier HARD
// Inter-day review windows (days from today)
const GOOD_WINDOW  = [1,3];
const EASY_WINDOW  = [7,14]; // Easy pushes out more

// Base decks
const baseDecks = {
  HSK2: [
    {id:"什么时候|shénme shíhou", front:"\u4ec0\u4e48\u65f6\u5019", back:"sh\u00e9nme sh\u00edhou \u2014 when"},
    {id:"因为|yīnwèi", front:"\u56e0\u4e3a", back:"y\u012bnw\u00e8i \u2014 because"},
    {id:"一起|yìqǐ", front:"\u4e00\u8d77", back:"y\u00ecq\u01d0 \u2014 together"},
    {id:"正在|zhèngzài", front:"\u6b63\u5728", back:"zh\u00e8ngz\u00e0i \u2014 in the process of"},
    {id:"比|bǐ", front:"\u6bd4", back:"b\u01d0 \u2014 compare; than"},
    {id:"必须|bìxū", front:"\u5fc5\u987b", back:"b\u00ecx\u016b \u2014 must"},
    {id:"突然|tūrán", front:"\u7a81\u7136", back:"t\u016br\u00e1n \u2014 suddenly"},
    {id:"决定|juédìng", front:"\u51b3\u5b9a", back:"ju\u00e9d\u00ecng \u2014 decide; decision"},
    {id:"明白|míngbai", front:"\u660e\u767d", back:"m\u00edngbai \u2014 understand; clear"},
    {id:"提高|tígāo", front:"\u63d0\u9ad8", back:"t\u00edg\u0101o \u2014 improve; raise"},
    {id:"已经|yǐjīng", front:"\u5df2\u7ecf", back:"y\u01d0j\u012bng \u2014 already"},
    {id:"再|zài", front:"\u518d", back:"z\u00e0i \u2014 again"},
    {id:"就|jiù", front:"\u5c31", back:"ji\u00f9 \u2014 at once"},
    {id:"因为…所以…|yīnwèi…suǒyǐ…", front:"\u56e0\u4e3a\u2026\u6240\u4ee5\u2026", back:"y\u012bnw\u00e8i\u2026su\u01d2y\u01d0\u2026 \u2014 because\u2026so\u2026"},
    {id:"虽然…但是…|suīrán…dànshì…", front:"\u867d\u7136\u2026\u4f46\u662f\u2026", back:"su\u012br\u00e1n\u2026d\u00e0nsh\u00ec\u2026 \u2014 although\u2026but"},
    {id:"从|cóng", front:"\u4ece", back:"c\u00f3ng \u2014 from"},
    {id:"往|wǎng", front:"\u5f80", back:"w\u01ceng \u2014 toward"},
    {id:"离|lí", front:"\u79bb", back:"l\u00ed \u2014 distance from"},
    {id:"得|de", front:"\u5f97", back:"de \u2014 (structural particle)"},
    {id:"着|zhe", front:"\u7740", back:"zhe \u2014 (durative aspect)"},
    {id:"过|guo", front:"\u8fc7", back:"guo \u2014 (experiential aspect)"},
    {id:"吧|ba", front:"\u5427", back:"ba \u2014 (modal particle)"},
    {id:"机场|jīchǎng", front:"\u673a\u573a", back:"j\u012bch\u01ceng \u2014 airport"},
    {id:"教室|jiàoshì", front:"\u6559\u5ba4", back:"ji\u00e0osh\u00ec \u2014 classroom"},
    {id:"房间|fángjiān", front:"\u623f\u95f4", back:"f\u00e1ngji\u0101n \u2014 room"},
    {id:"路|lù", front:"\u8def", back:"l\u00f9 \u2014 road"},
    {id:"左边|zuǒbiān", front:"\u5de6\u8fb9", back:"zu\u01d2bi\u0101n \u2014 left"},
    {id:"右边|yòubiān", front:"\u53f3\u8fb9", back:"y\u00f2ubi\u0101n \u2014 right"},
    {id:"外|wài", front:"\u5916", back:"w\u00e0i \u2014 outside"},
    {id:"旁边|pángbiān", front:"\u65c1\u8fb9", back:"p\u00e1ngbi\u0101n \u2014 side"},
    {id:"早上|zǎoshang", front:"\u65e9\u4e0a", back:"z\u01ceoshang \u2014 morning"},
    {id:"晚上|wǎnshang", front:"\u665a\u4e0a", back:"w\u01censhang \u2014 night"},
    {id:"小时|xiǎoshí", front:"\u5c0f\u65f6", back:"xi\u01ceosh\u00ed \u2014 hour"},
    {id:"时间|shíjiān", front:"\u65f6\u95f4", back:"sh\u00edji\u0101n \u2014 time"},
    {id:"去年|qùnián", front:"\u53bb\u5e74", back:"q\u00f9ni\u00e1n \u2014 last year"},
    {id:"号|hào", front:"\u53f7", back:"h\u00e0o \u2014 date; number"},
    {id:"生日|shēngrì", front:"\u751f\u65e5", back:"sh\u0113ngr\u00ec \u2014 birthday"},
    {id:"哥哥|gēge", front:"\u54e5\u54e5", back:"g\u0113ge \u2014 older brother"},
    {id:"姐姐|jiějie", front:"\u59d0\u59d0", back:"ji\u011bjie \u2014 older sister"},
    {id:"弟弟|dìdi", front:"\u5f1f\u5f1f", back:"d\u00ecdi \u2014 younger brother"},
    {id:"妹妹|mèimei", front:"\u59b9\u59b9", back:"m\u00e8imei \u2014 younger sister"},
    {id:"丈夫|zhàngfu", front:"\u4e08\u592b", back:"zh\u00e0ngfu \u2014 husband"},
    {id:"妻子|qīzi", front:"\u59bb\u5b50", back:"q\u012bzi \u2014 wife"},
    {id:"孩子|háizi", front:"\u5b69\u5b50", back:"h\u00e1izi \u2014 child"},
    {id:"男人|nánrén", front:"\u7537\u4eba", back:"n\u00e1nr\u00e9n \u2014 man"},
    {id:"女人|nǚrén", front:"\u5973\u4eba", back:"n\u01dar\u00e9n \u2014 woman"},
    {id:"服务员|fúwùyuán", front:"\u670d\u52a1\u5458", back:"f\u00faw\u00f9yu\u00e1n \u2014 waiter"},
    {id:"鱼|yú", front:"\u9c7c", back:"y\u00fa \u2014 fish"},
    {id:"羊肉|yángròu", front:"\u7f8a\u8089", back:"y\u00e1ngr\u00f2u \u2014 mutton"},
    {id:"牛奶|niúnǎi", front:"\u725b\u5976", back:"ni\u00fan\u01cei \u2014 milk"},
    {id:"鸡蛋|jīdàn", front:"\u9e21\u86cb", back:"j\u012bd\u00e0n \u2014 egg"},
    {id:"西瓜|xīguā", front:"\u897f\u74dc", back:"x\u012bgu\u0101 \u2014 watermelon"},
    {id:"咖啡|kāfēi", front:"\u5496\u5561", back:"k\u0101f\u0113i \u2014 coffee"},
    {id:"雪|xuě", front:"\u96ea", back:"xu\u011b \u2014 snow"},
    {id:"药|yào", front:"\u836f", back:"y\u00e0o \u2014 medicine"},
    {id:"手机|shǒujī", front:"\u624b\u673a", back:"sh\u01d2uj\u012b \u2014 cellphone"},
    {id:"手表|shǒubiǎo", front:"\u624b\u8868", back:"sh\u01d2ubi\u01ceo \u2014 watch"},
    {id:"眼睛|yǎnjing", front:"\u773c\u775b", back:"y\u01cenjing \u2014 eye"},
    {id:"身体|shēntǐ", front:"\u8eab\u4f53", back:"sh\u0113nt\u01d0 \u2014 body"},
    {id:"公共汽车|gōnggòngqìchē", front:"\u516c\u5171\u6c7d\u8f66", back:"g\u014dngg\u00f2ngq\u00ecch\u0113 \u2014 bus"},
    {id:"报纸|bàozhǐ", front:"\u62a5\u7eb8", back:"b\u00e0ozh\u01d0 \u2014 newspaper"},
    {id:"题|tí", front:"\u9898", back:"t\u00ed \u2014 topic; item"},
    {id:"课|kè", front:"\u8bfe", back:"k\u00e8 \u2014 lesson"},
    {id:"姓|xìng", front:"\u59d3", back:"x\u00ecng \u2014 surname"},
    {id:"问题|wèntí", front:"\u95ee\u9898", back:"w\u00e8nt\u00ed \u2014 question"},
    {id:"事情|shìqing", front:"\u4e8b\u60c5", back:"sh\u00ecqing \u2014 matter"},
    {id:"考试|kǎoshì", front:"\u8003\u8bd5", back:"k\u01ceosh\u00ec \u2014 exam"},
    {id:"票|piào", front:"\u7968", back:"pi\u00e0o \u2014 ticket"},
    {id:"意思|yìsi", front:"\u610f\u601d", back:"y\u00ecsi \u2014 meaning"},
    {id:"颜色|yánsè", front:"\u989c\u8272", back:"y\u00e1ns\u00e8 \u2014 color"},
    {id:"欢迎|huānyíng", front:"\u6b22\u8fce", back:"hu\u0101ny\u00edng \u2014 welcome"},
    {id:"说话|shuōhuà", front:"\u8bf4\u8bdd", back:"shu\u014dhu\u00e0 \u2014 to speak"},
    {id:"看见|kànjiàn", front:"\u770b\u89c1", back:"k\u00e0nji\u00e0n \u2014 to see"},
    {id:"回|huí", front:"\u56de", back:"hu\u00ed \u2014 return"},
    {id:"睡觉|shuìjiào", front:"\u7761\u89c9", back:"shu\u00ecji\u00e0o \u2014 sleep"},
    {id:"打电话|dǎdiànhuà", front:"\u6253\u7535\u8bdd", back:"d\u01cedi\u00e0nhu\u00e0 \u2014 to call"},
    {id:"坐|zuò", front:"\u5750", back:"zu\u00f2 \u2014 sit"},
    {id:"住|zhù", front:"\u4f4f", back:"zh\u00f9 \u2014 live"},
    {id:"学习|xuéxí", front:"\u5b66\u4e60", back:"xu\u00e9x\u00ed \u2014 study"},
    {id:"下雨|xiàyǔ", front:"\u4e0b\u96e8", back:"xi\u00e0y\u01d4 \u2014 to rain"},
    {id:"走|zǒu", front:"\u8d70", back:"z\u01d2u \u2014 walk"},
    {id:"进|jìn", front:"\u8fdb", back:"j\u00ecn \u2014 enter"},
    {id:"出|chū", front:"\u51fa", back:"ch\u016b \u2014 exit; go out"},
    {id:"跑步|pǎobù", front:"\u8dd1\u6b65", back:"p\u01ceob\u00f9 \u2014 run"},
    {id:"到|dào", front:"\u5230", back:"d\u00e0o \u2014 arrive"},
    {id:"穿|chuān", front:"\u7a7f", back:"chu\u0101n \u2014 wear"},
    {id:"洗|xǐ", front:"\u6d17", back:"x\u01d0 \u2014 wash"},
    {id:"给|gěi", front:"\u7ed9", back:"g\u011bi \u2014 give"},
    {id:"找|zhǎo", front:"\u627e", back:"zh\u01ceo \u2014 find"},
    {id:"懂|dǒng", front:"\u61c2", back:"d\u01d2ng \u2014 understand"},
    {id:"笑|xiào", front:"\u7b11", back:"xi\u00e0o \u2014 smile"},
    {id:"回答|huídá", front:"\u56de\u7b54", back:"hu\u00edd\u00e1 \u2014 answer"},
    {id:"告诉|gàosu", front:"\u544a\u8bc9", back:"g\u00e0osu \u2014 tell"},
    {id:"准备|zhǔnbèi", front:"\u51c6\u5907", back:"zh\u01d4nb\u00e8i \u2014 prepare"},
    {id:"开始|kāishǐ", front:"\u5f00\u59cb", back:"k\u0101ish\u01d0 \u2014 begin"},
    {id:"介绍|jièshào", front:"\u4ecb\u7ecd", back:"ji\u00e8sh\u00e0o \u2014 introduce"},
    {id:"帮助|bāngzhù", front:"\u5e2e\u52a9", back:"b\u0101ngzh\u00f9 \u2014 help"},
    {id:"玩|wán", front:"\u73a9", back:"w\u00e1n \u2014 play"},
    {id:"送|sòng", front:"\u9001", back:"s\u00f2ng \u2014 send; give"},
    {id:"等|děng", front:"\u7b49", back:"d\u011bng \u2014 wait"},
    {id:"让|ràng", front:"\u8ba9", back:"r\u00e0ng \u2014 let; allow"},
    {id:"起床|qǐchuáng", front:"\u8d77\u5e8a", back:"q\u01d0chu\u00e1ng \u2014 get up"},
    {id:"唱歌|chànggē", front:"\u5531\u6b4c", back:"ch\u00e0ngg\u0113 \u2014 sing"},
    {id:"跳舞|tiàowǔ", front:"\u8df3\u821e", back:"ti\u00e0ow\u01d4 \u2014 dance"},
    {id:"旅游|lǚyóu", front:"\u65c5\u6e38", back:"l\u01day\u00f3u \u2014 travel"},
    {id:"上班|shàngbān", front:"\u4e0a\u73ed", back:"sh\u00e0ngb\u0101n \u2014 go to work"},
    {id:"生病|shēngbìng", front:"\u751f\u75c5", back:"sh\u0113ngb\u00ecng \u2014 get sick"},
    {id:"休息|xiūxi", front:"\u4f11\u606f", back:"xi\u016bxi \u2014 rest"},
    {id:"运动|yùndòng", front:"\u8fd0\u52a8", back:"y\u00f9nd\u00f2ng \u2014 exercise"},
    {id:"游泳|yóuyǒng", front:"\u6e38\u6cf3", back:"y\u00f3uy\u01d2ng \u2014 swim"},
    {id:"踢足球|tī zúqiú", front:"\u8e22\u8db3\u7403", back:"t\u012b z\u00faqi\u00fa \u2014 play football"},
    {id:"打篮球|dǎ lánqiú", front:"\u6253\u7bee\u7403", back:"d\u01ce l\u00e1nqi\u00fa \u2014 play basketball"},
    {id:"完|wán", front:"\u5b8c", back:"w\u00e1n \u2014 finish"},
    {id:"爱|ài", front:"\u7231", back:"\u00e0i \u2014 love"},
    {id:"喜欢|xǐhuān", front:"\u559c\u6b22", back:"x\u01d0hu\u0101n \u2014 like"},
    {id:"想|xiǎng", front:"\u60f3", back:"xi\u01ceng \u2014 want; think"},
    {id:"认识|rènshi", front:"\u8ba4\u8bc6", back:"r\u00e8nshi \u2014 know (somebody)"},
    {id:"觉得|juéde", front:"\u89c9\u5f97", back:"ju\u00e9de \u2014 feel; think"},
    {id:"知道|zhīdào", front:"\u77e5\u9053", back:"zh\u012bd\u00e0o \u2014 know"},
    {id:"希望|xīwàng", front:"\u5e0c\u671b", back:"x\u012bw\u00e0ng \u2014 hope"},
    {id:"可以|kěyǐ", front:"\u53ef\u4ee5", back:"k\u011by\u01d0 \u2014 may; can"},
    {id:"要|yào", front:"\u8981", back:"y\u00e0o \u2014 want"},
    {id:"可能|kěnéng", front:"\u53ef\u80fd", back:"k\u011bn\u00e9ng \u2014 possibly; may"},
    {id:"好吃|hǎochī", front:"\u597d\u5403", back:"h\u01ceoch\u012b \u2014 delicious"},
    {id:"累|lèi", front:"\u7d2f", back:"l\u00e8i \u2014 tired"},
    {id:"长|cháng", front:"\u957f", back:"ch\u00e1ng \u2014 long"},
    {id:"新|xīn", front:"\u65b0", back:"x\u012bn \u2014 new"},
    {id:"贵|guì", front:"\u8d35", back:"gu\u00ec \u2014 expensive"},
    {id:"便宜|piányi", front:"\u4fbf\u5b9c", back:"pi\u00e1nyi \u2014 cheap"},
    {id:"晴|qíng", front:"\u6674", back:"q\u00edng \u2014 clear (weather)"},
    {id:"阴|yīn", front:"\u9634", back:"y\u012bn \u2014 overcast"},
    {id:"错|cuò", front:"\u9519", back:"cu\u00f2 \u2014 wrong"},
    {id:"快乐|kuàilè", front:"\u5feb\u4e50", back:"ku\u00e0il\u00e8 \u2014 happy"}
  ],
  HSK3: [
    {id:"必须|bìxū", front:"\u5fc5\u987b", back:"b\u00ecx\u016b \u2014 must"},
    {id:"突然|tūrán", front:"\u7a81\u7136", back:"t\u016br\u00e1n \u2014 suddenly"},
    {id:"决定|juédìng", front:"\u51b3\u5b9a", back:"ju\u00e9d\u00ecng \u2014 decide; decision"},
    {id:"明白|míngbai", front:"\u660e\u767d", back:"m\u00edngbai \u2014 understand; clear"},
    {id:"提高|tígāo", front:"\u63d0\u9ad8", back:"t\u00edg\u0101o \u2014 improve; raise"}
  ],
  Full: []
};
(function buildFull(){
  const seen = new Set();
  for (const d of [baseDecks.HSK2, baseDecks.HSK3]){
    for (const c of d) if (!seen.has(c.id)) { seen.add(c.id); baseDecks.Full.push({...c}); }
  }
})();

// --- State & DOM ---
let currentUser=null, currentDeckName=null, currentDeck=[]; let idToIndex=new Map(); let isFlipped=false; let daily=null; let cardStartMs=null; let session=null;
const loginSection=document.getElementById('login'); const deckSelectPanel=document.getElementById('deckSelectPanel'); const reviewPanel=document.getElementById('review');
const userIdInput=document.getElementById('userId'); const startBtn=document.getElementById('startBtn'); const whoEl=document.getElementById('who'); const logoutBtn=document.getElementById('logoutBtn');
const deckButtons=document.querySelectorAll('.deck-btn'); const backToDecks=document.getElementById('backToDecks'); const deckNameEl=document.getElementById('deckName'); const settingsBtn=document.getElementById('settingsBtn'); const dueCountEl=document.getElementById('dueCount');
const flashcard=document.getElementById('flashcard'); const cardFront=document.getElementById('cardFront'); const cardBack=document.getElementById('cardBack');
const flipRow=document.getElementById('flipRow'); const rateRow=document.getElementById('rateRow'); const flipBtn=document.getElementById('flipBtn'); const againBtn=document.getElementById('againBtn'); const hardBtn=document.getElementById('hardBtn'); const goodBtn=document.getElementById('goodBtn'); const easyBtn=document.getElementById('easyBtn'); const endSessionBtn=document.getElementById('endSessionBtn');
const settingsModal=document.getElementById('settingsModal'); const closeSettings=document.getElementById('closeSettings'); const tabs=document.querySelectorAll('.tab'); const tabManage=document.getElementById('tab-manage'); const tabStats=document.getElementById('tab-stats'); const newFront=document.getElementById('newFront'); const newBack=document.getElementById('newBack'); const addCardBtn=document.getElementById('addCardBtn'); const cardsList=document.getElementById('cardsList'); const statsOverview=document.getElementById('statsOverview'); const sessionsList=document.getElementById('sessionsList'); const streakNowEl=document.getElementById('streakNow'); const streakBestEl=document.getElementById('streakBest'); const reviewsChart=document.getElementById('reviewsChart'); const timeChart=document.getElementById('timeChart'); const resetStatsBtn=document.getElementById('resetStatsBtn'); const themeToggle=document.getElementById('themeToggle');

// --- Storage helpers ---
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

// --- Dates ---
const todayStart=(d=new Date())=> new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays=(d,days)=> { const nd=new Date(d); nd.setDate(nd.getDate()+days); return nd; };
const isoDate=(d)=> new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().slice(0,10);

// --- Seed decks for ALL allowed users (first-load only) ---
(function seedDecksForAllUsers(){
  for (const uid of ALLOWED_USERS){
    const o = getDeckOverrides(uid);
    let changed = false;
    if (!Array.isArray(o.HSK2)) { o.HSK2 = clone(baseDecks.HSK2); changed = true; }
    if (!Array.isArray(o.HSK3)) { o.HSK3 = clone(baseDecks.HSK3); changed = true; }
    if (changed) setDeckOverrides(uid, o);
  }
})();

// --- Build/restore today's queue ---
function rebuildIndexMap(){ idToIndex=new Map(); for(let i=0;i<currentDeck.length;i++) idToIndex.set(currentDeck[i].id,i); }

function ensureDailyQueue(){
  const todayISO=isoDate(new Date());
  daily = getDaily(currentUser, currentDeckName);
  if (daily && daily.dateISO===todayISO) {
    const validIds=new Set(currentDeck.map(c=>c.id));
    daily.queue = daily.queue.filter(id=>validIds.has(id));
    daily.completed = Array.isArray(daily.completed)? daily.completed.filter(id=>validIds.has(id)) : [];
    if (daily.cursor>daily.queue.length) daily.cursor=daily.queue.length;
    setDaily(currentUser,currentDeckName,daily);
    return;
  }
  const srs=getSrs(currentUser,currentDeckName);
  const newIds=[], reviewDue=[], reviewNotDue=[];
  const tKey=todayISO;
  for(const c of currentDeck){
    const meta=srs[c.id];
    if (!meta) newIds.push(c.id);
    else {
      const due=(meta.dueISO||'1970-01-01');
      if (due<=tKey) reviewDue.push(c.id); else reviewNotDue.push(c.id);
    }
  }
  const shuffle=(a)=>{ const b=a.slice(); for(let i=b.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [b[i],b[j]]=[b[j],b[i]];} return b; };
  const newSh=shuffle(newIds), revDueSh=shuffle(reviewDue), revNSh=shuffle(reviewNotDue);
  const n=Math.min(DAILY_NEW_LIMIT,newSh.length);
  const r1=Math.min(revDueSh.length, Math.max(0, DAILY_TOTAL_LIMIT-n));
  const remaining=Math.max(0, DAILY_TOTAL_LIMIT-n-r1);
  const r2=Math.min(revNSh.length, remaining);
  const chosenNew=newSh.slice(0,n);
  const chosenRev=revDueSh.slice(0,r1).concat(revNSh.slice(0,r2));
  const queue=[]; let i=0,j=0; let turn=chosenRev.length>0?'rev':'new';
  while(i<chosenNew.length || j<chosenRev.length){ if(turn==='rev'&&j<chosenRev.length) queue.push(chosenRev[j++]); else if(turn==='new'&&i<chosenNew.length) queue.push(chosenNew[i++]); else if(j<chosenRev.length) queue.push(chosenRev[j++]); else if(i<chosenNew.length) queue.push(chosenNew[i++]); turn=(turn==='rev')?'new':'rev'; }
  daily={dateISO:todayISO, queue, cursor:0, completed:[]};
  setDaily(currentUser,currentDeckName,daily);
}

// --- UI helpers ---
function updateDueLeft(){ const left = daily? (daily.queue.length - daily.cursor): 0; dueCountEl.textContent = `${left} left`; }

function showCard(){
  isFlipped=false; flashcard.classList.remove('flipped');
  flipRow.classList.remove('hidden'); rateRow.classList.add('hidden');
  const cid = (daily && daily.cursor<daily.queue.length) ? daily.queue[daily.cursor] : null;
  if (!cid) { document.getElementById('emptyState').classList.remove('hidden'); cardFront.textContent='No cards for today'; cardBack.textContent=''; cardStartMs=null; updateDueLeft(); return; }
  document.getElementById('emptyState').classList.add('hidden');
  const card = currentDeck[idToIndex.get(cid)];
  cardFront.textContent = card.front;
  cardBack.textContent  = card.back;
  cardStartMs = Date.now();
  updateDueLeft();
}

function flipCard(){ if(isFlipped) return; isFlipped=true; flashcard.classList.add('flipped'); flipRow.classList.add('hidden'); rateRow.classList.remove('hidden'); }

// --- Scheduling logic ---
function markCompletedToday(id){ if(!daily.completed.includes(id)) daily.completed.push(id); }
function advanceQueue(){ if(!daily) return; daily.cursor += 1; if(daily.cursor>daily.queue.length) daily.cursor=daily.queue.length; setDaily(currentUser,currentDeckName,daily); }
function insertBackInQueue(id, minOff, maxOff){
  const offset = rngInt(minOff, maxOff);
  const insertIndex = Math.min(daily.cursor + offset, daily.queue.length);
  daily.queue.splice(insertIndex, 0, id);
  setDaily(currentUser,currentDeckName,daily);
}

function updateSRSFuture(id, minDays, maxDays){
  const map=getSrs(currentUser,currentDeckName);
  const meta=map[id]||{ef:2.5, ivl:0, reps:0, lapses:0};
  const days = rngInt(minDays, maxDays);
  meta.ivl = days; meta.reps = (meta.reps||0)+1; meta.ef = Math.max(1.3, (meta.ef||2.5));
  meta.dueISO = isoDate(addDays(todayStart(), days));
  map[id]=meta; setSrs(currentUser,currentDeckName,map);
}

function rate(rating){
  const nowMs=Date.now(); const elapsed = cardStartMs? (nowMs-cardStartMs):0;
  const cid = (daily && daily.cursor<daily.queue.length) ? daily.queue[daily.cursor] : null; if(!cid) return;

  session.reviewed += 1;
  if (rating==='again' || rating==='hard') session.incorrect += 1; else session.correct += 1;
  session.totalMs += elapsed;

  advanceQueue();

  if (rating==='again'){
    insertBackInQueue(cid, AGAIN_OFFSET[0], AGAIN_OFFSET[1]);
  } else if (rating==='hard'){
    insertBackInQueue(cid, HARD_OFFSET[0], HARD_OFFSET[1]);
  } else if (rating==='good'){
    markCompletedToday(cid);
    updateSRSFuture(cid, GOOD_WINDOW[0], GOOD_WINDOW[1]);
  } else if (rating==='easy'){
    markCompletedToday(cid);
    updateSRSFuture(cid, EASY_WINDOW[0], EASY_WINDOW[1]);
  }

  showCard();
}

// --- Session & Navigation ---
function startSession(){ session={ startedAt:new Date().toISOString(), finishedAt:null, reviewed:0, correct:0, incorrect:0, totalMs:0 }; }
function maybeEndSession(save=true){ if(!session) return; if(session.reviewed>0){ session.finishedAt=new Date().toISOString(); if(save){ const list=getStats(currentUser,currentDeckName); list.push(session); setStats(currentUser,currentDeckName, list.slice(-200)); }} session=null; }

function enterReview(name){ currentDeckName=name; deckNameEl.textContent=name; currentDeck=getUserDeck(currentUser,currentDeckName); rebuildIndexMap(); ensureDailyQueue(); startSession(); deckSelectPanel.style.display='none'; reviewPanel.style.display='block'; showCard(); }

function login(){ const userId = userIdInput.value.trim(); if(!ALLOWED_USERS.includes(userId)){ alert('Invalid ID'); return; } currentUser=userId; whoEl.textContent=userId; localStorage.setItem(k('lastUser'), userId); deckSelectPanel.style.display='block'; loginSection.style.display='none'; }
function logout(){ maybeEndSession(true); currentUser=null; currentDeck=[]; userIdInput.value=''; loginSection.style.display='block'; deckSelectPanel.style.display='none'; reviewPanel.style.display='none'; userIdInput.focus(); }

function initTheme(){ const saved=localStorage.getItem(k('theme')); if(saved==='light') document.body.setAttribute('data-theme','light'); }
function toggleTheme(){ const isLight=document.body.getAttribute('data-theme')==='light'; document.body.setAttribute('data-theme', isLight?'':'light'); localStorage.setItem(k('theme'), isLight?'dark':'light'); }

function openSettings(){ renderManage(); renderStats(); settingsModal.classList.add('open'); settingsModal.setAttribute('aria-hidden','false'); }
function closeSettingsModal(){ settingsModal.classList.remove('open'); settingsModal.setAttribute('aria-hidden','true'); }
function switchTab(which){ tabs.forEach(t=>t.classList.toggle('active', t.dataset.tab===which)); tabManage.classList.toggle('hidden', which!=='manage'); tabStats.classList.toggle('hidden', which!=='stats'); if(which==='stats') renderStats(); }

function renderManage(){ const cards=getUserDeck(currentUser,currentDeckName); cardsList.innerHTML=''; cards.forEach((c,idx)=>{ const row=document.createElement('div'); row.className='card-item'; const f=document.createElement('div'); f.className='card-text'; f.textContent=c.front; const b=document.createElement('div'); b.className='card-text'; b.textContent=c.back; const actions=document.createElement('div'); actions.className='card-actions'; const del=document.createElement('button'); del.className='danger'; del.textContent='Delete'; del.addEventListener('click',()=>{ if(!confirm('Delete this card?')) return; const updated=getUserDeck(currentUser,currentDeckName); const removed=updated.splice(idx,1)[0]; saveUserDeck(currentUser,currentDeckName,updated); currentDeck=updated; rebuildIndexMap(); if(daily){ daily.queue=daily.queue.filter(id=>id!==removed.id); if(daily.cursor>daily.queue.length) daily.cursor=daily.queue.length; setDaily(currentUser,currentDeckName,daily); } renderManage(); showCard(); }); actions.appendChild(del); row.appendChild(f); row.appendChild(b); row.appendChild(actions); cardsList.appendChild(row); }); }

function msToReadable(ms){ if(!ms) return '0.0s'; return (ms/1000).toFixed(1)+'s'; }
function pct(n,d){ return d>0? Math.round((n/d)*100) : 0; }
function buildDailySeries(sessions, days=14){ const series=[]; const today=todayStart(); const map=new Map(); for(const s of sessions){ const ended=s.finishedAt?new Date(s.finishedAt):new Date(s.startedAt); const key=isoDate(ended); const cur=map.get(key)||{reviews:0, ms:0}; cur.reviews+=s.reviewed; cur.ms+=s.totalMs; map.set(key,cur); } for(let i=days-1;i>=0;i--){ const d=addDays(today,-i); const key=isoDate(d); const v=map.get(key)||{reviews:0, ms:0}; series.push({date:key, reviews:v.reviews, minutes: Math.round(v.ms/600)/10}); } return series; }
function calcStreaks(sessions){ const series=buildDailySeries(sessions,120); let cur=0,best=0; for(let i=series.length-1;i>=0;i--){ if(series[i].reviews>0){ cur++; if(cur>best) best=cur; } else cur=0; } return {current:cur,best}; }
function renderBars(container, series, key){ container.innerHTML=''; const maxVal=Math.max(1,...series.map(s=>s[key])); series.forEach(s=>{ const bar=document.createElement('div'); bar.className='bar'; bar.style.height=Math.round((s[key]/maxVal)*100)+'%'; const tip=document.createElement('div'); tip.className='tip'; tip.textContent=`${s.date}\n${s[key]}${key==='minutes'?' min':''}`; bar.appendChild(tip); container.appendChild(bar); }); }
function renderStats(){ const sessions=getStats(currentUser,currentDeckName); const totalReviewed=sessions.reduce((a,s)=>a+s.reviewed,0); const totalCorrect=sessions.reduce((a,s)=>a+s.correct,0); const totalMs=sessions.reduce((a,s)=>a+s.totalMs,0); const overallAcc=pct(totalCorrect,totalReviewed); const avgMs= totalReviewed>0? Math.round(totalMs/totalReviewed):0; statsOverview.innerHTML=''; const mk=(label,value)=>{ const d=document.createElement('div'); d.className='stat'; d.innerHTML=`<div class=\"label\">${label}</div><div class=\"value\">${value}</div>`; return d; }; statsOverview.appendChild(mk('Average time per card', msToReadable(avgMs))); statsOverview.appendChild(mk('Accuracy', overallAcc+'%')); statsOverview.appendChild(mk('Total reviewed', String(totalReviewed))); const last5=sessions.slice(-5); sessionsList.innerHTML=''; last5.forEach(s=>{ const row=document.createElement('div'); row.className='session-row'; const date=new Date(s.finishedAt||s.startedAt); const dateEl=document.createElement('div'); dateEl.className='session-date'; dateEl.textContent=date.toLocaleDateString(); const countEl=document.createElement('div'); countEl.textContent=`${s.reviewed} cards`; const accEl=document.createElement('div'); accEl.textContent=`${pct(s.correct,s.reviewed)}%`; const timeEl=document.createElement('div'); timeEl.textContent=msToReadable(s.reviewed?Math.round(s.totalMs/s.reviewed):0); row.appendChild(dateEl); row.appendChild(countEl); row.appendChild(accEl); row.appendChild(timeEl); sessionsList.appendChild(row); }); const {current,best}=calcStreaks(sessions); document.getElementById('streakNow').textContent=`${current} ${current===1?'day':'days'}`; document.getElementById('streakBest').textContent=`${best} ${best===1?'day':'days'}`; const last14=buildDailySeries(sessions,14); renderBars(reviewsChart,last14,'reviews'); renderBars(timeChart,last14,'minutes'); }

// Keyboard shortcuts
window.addEventListener('keydown', (e)=>{
  if (e.key===' ') { e.preventDefault(); if(!isFlipped) flipCard(); return; }
  if (!rateRow.classList.contains('hidden')){
    if(e.key==='1') rate('again');
    else if(e.key==='2') rate('hard');
    else if(e.key==='3') rate('good');
    else if(e.key==='4') rate('easy');
  }
});

// Events
startBtn.addEventListener('click', login); userIdInput.addEventListener('keydown', e=>{ if(e.key==='Enter') login(); }); logoutBtn.addEventListener('click', logout);
deckButtons.forEach(btn=> btn.addEventListener('click', ()=> enterReview(btn.dataset.deck)));
backToDecks.addEventListener('click', ()=>{ maybeEndSession(true); reviewPanel.style.display='none'; deckSelectPanel.style.display='block'; });
flashcard.addEventListener('click', ()=>{ if(!isFlipped) flipCard(); }); flipBtn.addEventListener('click', flipCard);
againBtn.addEventListener('click', ()=> rate('again')); hardBtn.addEventListener('click', ()=> rate('hard')); goodBtn.addEventListener('click', ()=> rate('good')); easyBtn.addEventListener('click', ()=> rate('easy'));
endSessionBtn.addEventListener('click', ()=>{ maybeEndSession(true); startSession(); alert('Session saved. New session started.'); renderStats(); });
settingsBtn.addEventListener('click', openSettings); closeSettings.addEventListener('click', closeSettingsModal); document.getElementById('modalBackdrop').addEventListener('click', closeSettingsModal); tabs.forEach(t=> t.addEventListener('click', ()=> switchTab(t.dataset.tab)));
initTheme(); themeToggle.addEventListener('click', toggleTheme);
const lastUser=localStorage.getItem(k('lastUser')); if(lastUser) userIdInput.value=lastUser;
window.addEventListener('beforeunload', ()=>{ maybeEndSession(true); });
// Load first screen
loginSection.style.display='block';
