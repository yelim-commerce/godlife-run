/* ============================================================
   슈퍼 갓생런 (SUPER GODLIFE RUN) — 60초 커리어 성장 플랫포머
   ------------------------------------------------------------
   · 고전 횡스크롤 플랫포머 문법: 자동 달리기 · 점프 · ?블록 · 밟기
   · 화장품 / 옷 아이템을 모을수록 신입 → 대리 → 과장 → 팀장 → 대표로 성장
     (성장할 때마다 캐릭터가 커지고 옷차림이 바뀐다)
   · 최종 직급이 할인율을 결정한다 — 누구나 당첨
   · BGM: 스콧 조플린 〈The Entertainer〉(1902) — 퍼블릭 도메인 (연주 CC0)
   ============================================================ */

/* ---------------- 1. 설정 ---------------- */
const CONFIG = {
  brandName: '갓생런',
  couponPrefix: 'RUN',          // 쿠폰 코드 접두어 (RUN-8P6G)
  duration: 60,
  couponMinutes: 10,
  leadBonusPercent: 5,          // 이름·이메일 입력 시 추가 할인
  legendaryBonus: 5,            // 💎 시크릿 주얼리 획득 시 추가 할인
  maxPercent: 40,
  idleReturn: 60,               // 결과 화면 방치 시 대기 화면 복귀(초)

  /* 모을 수 있는 아이템 — 뷰티 5 + 패션 5 + 레전더리 1
     rarity: common(+1 성장) / rare(+2) / legendary(+3, ?블록에서만)        */
  products: [
    { id:'lip',     cat:'beauty',  emoji:'💄', name:'벨벳 립스틱',   short:'립스틱', rarity:'common', color:'#ff4f7b' },
    { id:'serum',   cat:'beauty',  emoji:'🧴', name:'글로우 세럼',   short:'세럼',   rarity:'common', color:'#48b8ff' },
    { id:'cushion', cat:'beauty',  emoji:'🪞', name:'커버 쿠션',     short:'쿠션',   rarity:'common', color:'#ff9f6e' },
    { id:'nail',    cat:'beauty',  emoji:'💅', name:'젤 네일',       short:'네일',   rarity:'common', color:'#ff6fd0' },
    { id:'perfume', cat:'beauty',  emoji:'🌸', name:'시그니처 향수', short:'향수',   rarity:'rare',   color:'#a57bff' },
    { id:'dress',   cat:'fashion', emoji:'👗', name:'오피스 원피스', short:'원피스', rarity:'common', color:'#3f8cff' },
    { id:'heels',   cat:'fashion', emoji:'👠', name:'레드 힐',       short:'힐',     rarity:'common', color:'#ff3355' },
    { id:'coat',    cat:'fashion', emoji:'🧥', name:'트렌치코트',    short:'코트',   rarity:'common', color:'#c98d4f' },
    { id:'shades',  cat:'fashion', emoji:'🕶️', name:'선글라스',      short:'선글',   rarity:'common', color:'#6b6b85' },
    { id:'bag',     cat:'fashion', emoji:'👜', name:'시그니처 백',   short:'핸드백', rarity:'rare',   color:'#b8743a' },
    { id:'jewel',   cat:'fashion', emoji:'💎', name:'시크릿 주얼리', short:'주얼리', rarity:'legendary', color:'#25c9d9' }
  ],
  rarityWeight: { common:1, rare:0.35, legendary:0.12 },
  growthBy:     { common:1, rare:2, legendary:3 },
  coinsPerGrowth: 10,           // 코인 10개마다 성장 +1

  /* 성장 단계 = 할인 등급. min = 필요한 성장 포인트 */
  stages: [
    { title:'신입', en:'ROOKIE',    min:0,  look:'첫 출근룩',              percent:5,  perk:'뷰티 샘플 1종 증정' },
    { title:'대리', en:'ASSOCIATE', min:5,  look:'블라우스 + 레드 립',     percent:10, perk:'뷰티 샘플 3종 증정' },
    { title:'과장', en:'MANAGER',   min:12, look:'핑크 블레이저 + 핸드백', percent:15, perk:'미니어처 2종 증정' },
    { title:'팀장', en:'LEADER',    min:21, look:'트렌치코트 + 선글라스',  percent:20, perk:'미니어처 키트 증정' },
    { title:'대표', en:'CEO',       min:34, look:'골드 드레스 + 티아라',   percent:30, perk:'정품 풀사이즈 1종 증정' }
  ],

  /* 월드 — 60초를 4구간으로 나눠 배경이 바뀐다 */
  worlds: [
    { name:'출근길',   sub:'월요일 아침 08:59', sky:['#6cc6ff','#d6f1ff'], far:'#a7cbe6', near:'#86b3d6', win:'#eaf7ff',
      ground:'#c98a5a', top:'#7dd35f', line:'#a4683f', box:'#d9a066', boxLine:'#9c6532', crate:'📦', stars:false },
    { name:'오피스',   sub:'점심시간 12:30',    sky:['#4aa8f0','#c4e8ff'], far:'#8aa9c9', near:'#6788ad', win:'#d8efff',
      ground:'#8e98ad', top:'#d3d9e4', line:'#6f788c', box:'#f4efe2', boxLine:'#a59c86', crate:'📁', stars:false },
    { name:'쇼핑거리', sub:'퇴근 후 18:40',     sky:['#ff8aa1','#ffd9a8'], far:'#e89ab4', near:'#c96b8f', win:'#fff0b8',
      ground:'#b5577a', top:'#ffb3cb', line:'#8f3d5e', box:'#ff78b4', boxLine:'#b53d78', crate:'🛍️', stars:false },
    { name:'레드카펫', sub:'올해의 인물 시상식 21:00', sky:['#1c1244','#5b2a8c'], far:'#35286b', near:'#271d55', win:'#ffd76a',
      ground:'#c21d4e', top:'#ffd23f', line:'#8e1238', box:'#ffd23f', boxLine:'#b8860b', crate:'🎁', stars:true }
  ],

  /* 물리 — 단위: 타일(블록 1칸) / 초 */
  physics: {
    gravity: 52, jumpV: 17, doubleJumpV: 14,
    holdGravity: 0.45, holdMax: 0.24,     // 길게 누르면 상승 중 중력이 약해져 더 높이 뛴다
    maxFall: 24, coyote: 0.09, buffer: 0.14
  },
  runSpeedStart: 5.2,           // 시작 속도 (타일/초)
  runSpeedEnd: 7.2,             // 종료 직전 속도
  star:  { time: 5.5, speed: 1.25, musicRate: 1.1 },   // 💸 월급날 러시 (무적)
  hurt:  { growth: 2, invincible: 1.6, stun: 0.3 },     // 방해꾼에 부딪히면
  points:{ coin: 10, common: 100, rare: 250, legendary: 500, stomp: 200 }
};

/* ============ BGM ============
   1순위: 실제 음원 (audio/entertainer.mp3)
     · 스콧 조플린 〈The Entertainer〉(1902) — 작곡 퍼블릭 도메인
     · 연주 James Brigham (2018) — CC0 1.0 (퍼블릭 도메인 헌정)
     · 출처: Wikimedia Commons / 원본 5분 6초 → 앞 70초만 잘라 끝 3초 페이드아웃
   2순위: 파일이 없거나 재생이 막히면 같은 곡을 칩튠 합성으로 자동 폴백          */
const AUDIO = { src:'audio/entertainer.mp3', startAt:0, volume:0.55 };

/* 폴백 합성 — 〈The Entertainer〉 주선율 (작곡 퍼블릭 도메인). [MIDI, 16분음표 길이] */
const SONG = (() => {
  const A = [[74,2],[75,2],[76,2],[84,4],[76,2],[84,4],[76,2],[84,14]];
  const B = [[84,2],[86,2],[87,2],[88,2],[84,2],[86,2],[88,4],[83,2],[86,4],[84,10]];
  const C = [[81,2],[79,2],[78,2],[81,2],[84,2],[88,4],[86,2],[84,2],[81,2],[86,12]];
  const lead = [...A, ...B, ...A, ...C, ...A, ...B];
  const at = [];                       // 16분음표 위치 → [midi, len]
  let u = 0;
  for (const [m, len] of lead){ at[u] = [m, len]; u += len; }
  return {
    bpm: 96, length: u, at,
    bars: ['C','C','C','G','C','C','F','D','C','C','G','C'],
    chords: { C:[48,[60,64,67]], G:[43,[59,62,65]], F:[41,[57,60,65]], D:[50,[54,57,60]] }
  };
})();

/* ============ 응모 정보 웹훅 ============
   ../coupon-pop (그리고 기존 price-slasher-game) 과 동일한 Make.com 웹훅입니다.
   기존 시나리오가 쓰는 필드명(date/time/email/code/score/cleared/discount/
   agreedAt/source)을 그대로 보내고, 이 게임 전용 값만 덧붙입니다.
   source 로 어느 게임에서 온 응모인지 구분하세요.

   전송은 application/x-www-form-urlencoded 입니다.
   JSON 으로 보내면 CORS preflight(OPTIONS)가 발생해 Make 웹훅이 거부합니다.     */
const WEBHOOK = {
  url: 'https://hook.eu1.make.com/iv6p47wuoc7rqnh1fb8884y0n5l6buuf',
  provider: 'make',              // make | web3forms | formspree | formsubmit | json
  accessKey: '',                 // Web3Forms 전용
  subject: '갓생런 쿠폰 응모',
  source: 'godlife-run-game',    // 쿠폰팝은 'coupon-pop-game', 기존 게임은 'price-slasher-game'
  clearStage: 3,                 // 몇 단계부터 cleared=true 로 볼지 (3 = 팀장 이상, 0부터 셈)
  timeoutMs: 8000,
  retrySec: 45
};

const STORE_RUNS   = 'godlife_run_runs';
const STORE_LEADS  = 'godlife_run_leads';
const STORE_OUTBOX = 'godlife_run_outbox';

/* 테스트·시연용 URL 파라미터: ?autoplay=1 (봇이 바로 플레이) &dur=15 (플레이 시간) */
const PARAMS = new URLSearchParams(location.search);
const AUTOPLAY = PARAMS.has('autoplay');
if (PARAMS.get('dur')) CONFIG.duration = Math.max(5, +PARAMS.get('dur') || CONFIG.duration);

/* ---------------- 2. DOM ---------------- */
const $ = id => document.getElementById(id);
const app = $('app'), canvas = $('stage'), ctx = canvas.getContext('2d');
const el = {
  hud:$('hud'), hudLv:$('hudLv'), hudTitle:$('hudTitle'), hudLvBox:$('hudLvBox'),
  growthFill:$('growthFill'), growthLabel:$('growthLabel'), time:$('time'), timefill:$('timefill'),
  coins:$('coins'), collection:$('collection'),
  levelCallout:$('levelCallout'), itemCallout:$('itemCallout'), dangerCallout:$('dangerCallout'),
  worldBanner:$('worldBanner'), finishBanner:$('finishBanner'), hitFlash:$('hitFlash'),
  nowPlaying:$('nowPlaying'), npPerformer:$('npPerformer'),
  scAttract:$('scAttract'), scCount:$('scCount'), scResult:$('scResult'),
  countNum:$('countNum'), ticker:$('ticker'), lineup:$('lineup'), ladder:$('ladder'),
  rGrade:$('rGrade'), rHero:$('rHero'), rTitle:$('rTitle'), rLook:$('rLook'), rPath:$('rPath'),
  rGrowth:$('rGrowth'), rItems:$('rItems'), rCoins:$('rCoins'), rStomps:$('rStomps'),
  rColGrid:$('rColGrid'), rNear:$('rNear'), coupon:$('coupon'), rPercent:$('rPercent'),
  rPerk:$('rPerk'), rCode:$('rCode'), rExpire:$('rExpire'), leadBox:$('leadBox'), board:$('board'),
  toast:$('toast')
};

/* ---------------- 3. 상태 ---------------- */
const S = { ATTRACT:'attract', COUNT:'count', PLAY:'play', FINISH:'finish', RESULT:'result' };
let state = S.ATTRACT;

let W = 0, H = 0, DPR = 1, T = 48, groundY = 0, camX = 0;
const solids = [], items = [], enemies = [], particles = [], pops = [], fx = [], confetti = [];

const player = {
  x:1, y:0, w:0.62, h:1.25, vy:0, onGround:true, jumps:0, coyote:0, buffer:0,
  holdT:0, holding:false, inv:0, stun:0, dist:0, blocked:false
};
const input = { held:false };
const bot = { holdT:0, cool:0 };

const G = {
  elapsed:0, score:0, coins:0, growth:0, stageIdx:0, items:0, stomps:0,
  col:new Map(), star:0, freeze:0, freezeFrom:0, worldIdx:0,
  starSpawned:false, finishT:0, demoT:0,
  percent:5, code:'', couponEnd:0, idleAt:0, leadDone:false
};
const PRODUCT_BY_ID = new Map(CONFIG.products.map(p => [p.id, p]));
const FIELD_POOL = CONFIG.products.filter(p => p.rarity !== 'legendary');   // 길 위에 놓이는 아이템

const rand  = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp  = (a, b, t) => a + (b - a) * t;
const progress = () => state === S.ATTRACT ? 0.4 : clamp(G.elapsed / CONFIG.duration, 0, 1);

/* ---------------- 4. 캔버스 ---------------- */
function resize(){
  DPR = Math.min(window.devicePixelRatio || 1, 2);
  W = window.innerWidth; H = window.innerHeight;
  canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
  canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.imageSmoothingEnabled = false;
  // 블록 한 칸 크기: 세로 11칸 / 가로 8.2칸 중 작은 쪽 → 휴대폰 세로에서도 앞이 보이게
  T = clamp(Math.min(H / 11, W / 8.2), 30, 108);
  groundY = Math.round(H - Math.max(T * 1.9, H * 0.15));
  emojiCache.clear();
}
const emojiCache = new Map();
window.addEventListener('resize', resize);
window.addEventListener('orientationchange', () => setTimeout(resize, 120));
resize();

/* 이모지는 매 프레임 fillText 하면 느리므로 크기별로 캐시 */
function emojiSprite(ch, px){
  px = Math.max(8, Math.round(px));
  const key = ch + '|' + px;
  let cv = emojiCache.get(key);
  if (!cv){
    cv = document.createElement('canvas');
    const s = Math.ceil(px * 1.35 * DPR);
    cv.width = cv.height = s;
    const c = cv.getContext('2d');
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.font = `${px * DPR}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
    c.fillText(ch, s / 2, s / 2 + px * DPR * 0.06);
    cv.css = s / DPR;
    emojiCache.set(key, cv);
  }
  return cv;
}
function drawEmoji(ch, x, y, px){
  const cv = emojiSprite(ch, px);
  ctx.drawImage(cv, x - cv.css / 2, y - cv.css / 2, cv.css, cv.css);
}
function roundRect(c, x, y, w, h, r){
  c.beginPath();
  if (c.roundRect){ c.roundRect(x, y, w, h, r); return; }
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}

/* ---------------- 5. 주인공 픽셀 스프라이트 ----------------
   12×18 픽셀 템플릿 하나에 단계별 팔레트와 액세서리를 덧입힌다.
   H 머리 · S 피부 · E 눈 · L 입술 · T 상의 · B 하의 · K 신발                    */
const HERO_BODY = [
  '....HHHH....',
  '...HHHHHH...',
  '..HHHHHHHH..',
  '..HHSSSSSH..',
  '..HSSSSESS..',
  '..HSSSSSSS..',
  '..HHSSSLS...',
  '..HH.SSS....',
  '....TTTT....',
  '...TTTTTT...',
  '..STTTTTTS..',
  '..S.TTTT.S..',
  '....BBBB....',
  '...BBBBBB...'
];
const HERO_LEGS = {
  stand: ['....SS.SS...', '....SS.SS...', '....SS.SS...', '...KKK.KKK..'],
  runA:  ['...SS..SS...', '..SS....SS..', '..SS....SS..', '.KK.....KKK.'],
  runB:  ['....SSS.....', '....SS.S....', '....SS.S....', '....KKKKK...'],
  jump:  ['...SS..SSS..', '..SS.....SS.', '.SS.........', '.KK.........']
};
const HERO_PAL = [
  { H:'#3a2620', S:'#ffd9c2', E:'#1a1030', L:'#f29a9a', T:'#ffffff', B:'#4a6fb5', K:'#f2f2f2' },
  { H:'#3a2620', S:'#ffd9c2', E:'#1a1030', L:'#e8324a', T:'#ffb3c8', B:'#2c2a40', K:'#2c2a40' },
  { H:'#4a2a20', S:'#ffd9c2', E:'#1a1030', L:'#e8324a', T:'#ffffff', B:'#1f1d30', K:'#1f1d30', J:'#ff4f9a', A:'#7a4bff' },
  { H:'#5a3222', S:'#ffd9c2', E:'#1a1030', L:'#d81b4a', T:'#fff3e0', B:'#c9955a', K:'#ff2d55', J:'#d9a86c', A:'#b0773b', G:'#151515' },
  { H:'#6b3a1f', S:'#ffd9c2', E:'#1a1030', L:'#d81b4a', T:'#8a3dff', B:'#8a3dff', K:'#ffc93c', J:'#ffc93c', A:'#ffffff', G:'#151515', C:'#ffd23f' }
];
const HERO_H = [1.25, 1.42, 1.58, 1.74, 1.9];      // 단계별 키(타일) — 성장하면 커진다
const RAINBOW = ['#ff4f9a', '#ffd23f', '#3ee6c1', '#48b8ff', '#a57bff'];

function drawHero(c, cx, bottom, heightPx, idx, pose, opt = {}){
  const px = heightPx / 18;
  const left = cx - 6 * px, top = bottom - 18 * px;
  const pal = Object.assign({}, HERO_PAL[idx]);
  if (opt.rainbow != null){
    pal.T = RAINBOW[opt.rainbow % 5]; pal.B = RAINBOW[(opt.rainbow + 2) % 5];
    if (pal.J) pal.J = RAINBOW[(opt.rainbow + 1) % 5];
  }
  const P = (col, row, color) => {
    c.fillStyle = color;
    c.fillRect(Math.floor(left + col * px), Math.floor(top + row * px), Math.ceil(px), Math.ceil(px));
  };
  const rows = HERO_BODY.concat(HERO_LEGS[pose] || HERO_LEGS.stand);
  for (let r = 0; r < rows.length; r++){
    const line = rows[r];
    const firstT = line.indexOf('T'), lastT = line.lastIndexOf('T');
    for (let col = 0; col < 12; col++){
      const k = line[col];
      if (k === '.') continue;
      let color = pal[k];
      if (pal.J){
        if (k === 'S' && r === 10) color = pal.J;                                   // 긴 소매
        if (k === 'T' && (col <= firstT || col >= lastT)) color = pal.J;            // 재킷 라펠
      }
      if (idx >= 3 && k === 'B' && r >= 12) color = pal.J;                          // 롱코트 자락
      P(col, r, color);
    }
  }
  if (idx <= 1){ P(1, 3, pal.H); P(1, 4, pal.H); P(0, 5, pal.H); P(0, 6, pal.H); }  // 포니테일
  else { P(2, 8, pal.H); P(3, 8, pal.H); P(2, 9, pal.H); }                         // 긴 웨이브
  if (idx >= 1){ P(8, 5, '#ffb0b8'); }                                             // 블러셔
  if (idx >= 2){                                                                   // 핸드백
    P(10, 11, pal.A); P(9, 12, pal.A); P(10, 12, pal.A); P(11, 12, pal.A);
    P(9, 13, pal.A); P(10, 13, pal.A); P(11, 13, pal.A);
  }
  if (idx >= 3){ for (let col = 5; col <= 9; col++) P(col, 4, pal.G); P(4, 3, pal.G); } // 선글라스
  if (idx >= 4){                                                                   // 티아라 + 귀걸이
    P(4, -1, pal.C); P(5, -1, pal.C); P(6, -1, pal.C); P(7, -1, pal.C);
    P(4, -2, pal.C); P(6, -2, '#ff4f9a'); P(7, -2, pal.C); P(5, -3, pal.C);
    P(4, 7, pal.C);
  }
}

/* ---------------- 6. 오디오 기반 ---------------- */
let actx = null, master = null, musicGain = null, soundOn = true;
function audioOn(){
  if (!actx){
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    actx = new AC();
    master = actx.createGain(); master.gain.value = soundOn ? 1 : 0;
    master.connect(actx.destination);
    musicGain = actx.createGain(); musicGain.gain.value = 1;
    musicGain.connect(master);
  }
  if (actx.state === 'suspended') actx.resume();
}
function toggleSound(){
  soundOn = !soundOn;
  if (master) master.gain.setTargetAtTime(soundOn ? 1 : 0, actx.currentTime, 0.02);
  if (music.el) music.el.volume = soundOn ? AUDIO.volume : 0;
  $('btnSound').textContent = soundOn ? '🔊' : '🔇';
  $('btnSound').classList.toggle('off', !soundOn);
}
const mid2f = m => 440 * Math.pow(2, (m - 69) / 12);

function tone(freq, dur, { type='square', vol=.12, to=null, delay=0, dest=null } = {}){
  if (!actx) return;
  const t0 = actx.currentTime + delay;
  const o = actx.createOscillator(), g = actx.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t0);
  if (to) o.frequency.exponentialRampToValueAtTime(Math.max(40, to), t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + 0.006);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(dest || master);
  o.start(t0); o.stop(t0 + dur + .02);
}
const arp = (notes, gap, opt) => notes.forEach((f, i) => tone(f, opt.dur || .12, { ...opt, delay:i * gap }));
const sfx = {
  jump(){ tone(420, .14, { to:880, vol:.07 }); },
  jump2(){ tone(640, .14, { to:1320, vol:.07 }); },
  coin(){ tone(988, .06, { vol:.08 }); tone(1319, .22, { vol:.08, delay:.06 }); },
  item(){ arp([784, 1046, 1318], .05, { type:'triangle', vol:.14 }); },
  newItem(){ arp([659, 880, 1174, 1568], .06, { type:'triangle', vol:.16, dur:.2 }); },
  levelUp(){ arp([523, 659, 784, 1046, 784, 1046, 1318, 1568], .055, { vol:.08, dur:.1 }); },
  stomp(){ tone(360, .16, { to:90, vol:.12 }); },
  bump(){ tone(170, .08, { to:110, vol:.12 }); },
  block(){ tone(520, .08, { vol:.08 }); tone(780, .16, { vol:.08, delay:.07 }); },
  hurt(){ tone(520, .4, { type:'sawtooth', to:110, vol:.14 }); },
  star(){ arp([523, 659, 784, 1046, 1318, 1568, 2093], .04, { vol:.07, dur:.09 }); },
  tick(){ tone(1046, .07, { type:'sine', vol:.11 }); },
  go(){ tone(1318, .24, { type:'sine', vol:.18, to:1760 }); },
  win(){ arp([523, 659, 784, 1046, 1318], .1, { type:'triangle', vol:.15, dur:.42 }); }
};
function buzz(ms){ if (navigator.vibrate){ try { navigator.vibrate(ms); } catch(e){} } }

/* ---------------- 7. BGM (음원 → 칩튠 폴백) ---------------- */
const music = { mode:'none', el:null, fileBroken:false, on:false, u:0, next:0, timer:0, rate:1 };

function prepareAudioFile(){
  if (music.el || music.fileBroken) return;
  const a = new Audio();
  a.src = AUDIO.src;
  a.preload = 'auto';
  a.loop = true;                   // 70초 트랙 · 60초 플레이라 실제로는 순환하지 않음
  a.volume = soundOn ? AUDIO.volume : 0;
  a.addEventListener('error', () => { music.fileBroken = true; music.el = null; }, { once:true });
  music.el = a;
}
prepareAudioFile();

function musicStart(){
  audioOn();
  music.rate = 1;
  if (music.el && !music.fileBroken){
    music.mode = 'file';
    try { music.el.currentTime = AUDIO.startAt; } catch(e){}
    music.el.playbackRate = 1;
    music.el.volume = soundOn ? AUDIO.volume : 0;
    const p = music.el.play();
    if (p && p.catch) p.catch(() => { music.mode = 'none'; synthStart(); });   // 재생 거부 → 합성으로
    return;
  }
  synthStart();
}
function setMusicRate(r){
  music.rate = r;
  if (music.el && !music.el.paused) music.el.playbackRate = r;
}
function synthStart(){
  if (!actx) return;
  music.mode = 'synth'; music.on = true; music.u = 0;
  music.next = actx.currentTime + 0.1;
  clearInterval(music.timer);
  music.timer = setInterval(musicSchedule, 25);
  musicSchedule();
}
function musicStop(){
  music.on = false; clearInterval(music.timer);
  if (music.el && !music.el.paused){
    const a = music.el, v0 = a.volume;      // 뚝 끊기지 않게 짧게 페이드아웃
    let k = 0;
    const fade = setInterval(() => {
      k++; a.volume = Math.max(0, v0 * (1 - k / 14));
      if (k >= 14){ clearInterval(fade); a.pause(); a.volume = soundOn ? AUDIO.volume : 0; }
    }, 40);
  }
}
function chipNote(midi, t, dur, type, vol){
  const o = actx.createOscillator(), g = actx.createGain();
  o.type = type; o.frequency.setValueAtTime(mid2f(midi), t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.008);
  g.gain.setValueAtTime(vol, t + dur * 0.6);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(musicGain);
  o.start(t); o.stop(t + dur + .02);
}
function musicSchedule(){
  if (!music.on || !actx) return;
  const horizon = actx.currentTime + 0.2;
  let guard = 0;
  while (music.next < horizon && guard++ < 64){
    const step = 60 / (SONG.bpm * music.rate) / 4;
    const u = music.u % SONG.length;
    const n = SONG.at[u];
    if (n) chipNote(n[0], music.next, n[1] * step * 0.9, 'square', 0.05);
    if (u % 4 === 0){                                // 래그타임 쿵-짝 반주
      const [root, chord] = SONG.chords[SONG.bars[(u / 16 | 0) % SONG.bars.length]];
      if (u % 8 === 0) chipNote(root, music.next, step * 3, 'triangle', 0.12);
      else chord.forEach(m => chipNote(m, music.next, step * 2, 'square', 0.018));
    }
    music.next += step;
    music.u++;
  }
}
function showNowPlaying(){
  setTimeout(() => {
    el.npPerformer.textContent = music.mode === 'file'
      ? '스콧 조플린 · 1902 · 래그타임 피아노'
      : '스콧 조플린 · 1902 · 칩튠 합성 연주';
    el.nowPlaying.classList.remove('on'); void el.nowPlaying.offsetWidth; el.nowPlaying.classList.add('on');
  }, 400);
}

/* ---------------- 8. 레벨 생성 ---------------- */
let genX = 0, lastPattern = '';

function pickProduct(pool){
  const list = pool || FIELD_POOL;
  const total = list.reduce((s, p) => s + CONFIG.rarityWeight[p.rarity], 0);
  let r = Math.random() * total;
  for (const p of list){ r -= CONFIG.rarityWeight[p.rarity]; if (r <= 0) return p; }
  return list[0];
}
const addSolid = (x, y, w, h, kind, content) => solids.push({ x, y, w, h, kind, content, used:false, bumpT:0 });
const box    = (x, h, w = 1) => addSolid(x, 0, w, h, 'box');
const brick  = (x, y) => addSolid(x, y, 1, 1, 'brick');
const qBlock = (x, y, content) => addSolid(x, y, 1, 1, 'q', content);
const coin   = (x, y) => items.push({ kind:'coin', x, y, r:0.3, ph:Math.random() * 6, taken:false });
const item   = (x, y, product) => items.push({ kind:'item', x, y, r:0.4, ph:Math.random() * 6, taken:false, product:product || pickProduct() });
function enemy(x, type){
  if (type === 'stress') enemies.push({ type, x, y:1.75, baseY:1.75, w:1.1, h:0.8, vx:-1.2, ph:Math.random() * 6, dead:false, squashT:0 });
  else enemies.push({ type, x, y:0, w:0.9, h:type === 'overtime' ? 1 : 0.85, vx:-1.4, dead:false, squashT:0 });
}

/* 청크 = 몇 칸짜리 지형 조각. 반환값은 길이(타일) */
const PATTERNS = {
  coinTrail(x){ for (let i = 0; i < 5; i++) coin(x + i + 0.5, 1.1); item(x + 2.5, 3.0); return 6; },
  qRow(x){
    brick(x + 1, 3); qBlock(x + 2, 3, 'item'); brick(x + 3, 3);
    qBlock(x + 4, 3, Math.random() < 0.45 ? 'item' : 'coins');
    item(x + 2.5, 4.6); return 6;
  },
  lowBox(x){ box(x + 2, 1); coin(x + 1.2, 1.9); item(x + 2.5, 2.6); coin(x + 3.8, 1.9); return 5; },
  tallBox(x){
    box(x + 2, 2, 1.2);
    coin(x + 1.1, 2.7); coin(x + 2.6, 3.5); coin(x + 4.1, 2.7); item(x + 2.6, 4.7);
    return 6;
  },
  walker(x, d){
    enemy(x + 6, Math.random() < 0.5 + d * 0.3 ? 'overtime' : 'monday');
    coin(x + 5, 2.5); coin(x + 6, 2.9); coin(x + 7, 2.5);
    return 8;
  },
  platform(x, d){
    brick(x + 2, 3); qBlock(x + 3, 3, 'item'); brick(x + 4, 3); brick(x + 5, 3);
    item(x + 4.5, 4.5); coin(x + 2.5, 4.4);
    if (d > 0.3) enemy(x + 8, 'monday');
    return 9;
  },
  stairs(x){
    box(x + 1, 1); box(x + 2, 2); box(x + 3, 3);
    item(x + 3.5, 4.5); coin(x + 5, 3.4); item(x + 6.2, 2.2);
    return 8;
  },
  flyer(x){
    enemy(x + 7, 'stress');
    coin(x + 3, 1); coin(x + 4, 1); item(x + 5.5, 1.2);
    return 9;
  },
  itemArc(x){ item(x + 1, 1.3); item(x + 2.3, 2.7); item(x + 3.6, 1.3); return 5; },
  starBlock(x){
    brick(x + 2, 3); qBlock(x + 3, 3, 'star'); brick(x + 4, 3);
    coin(x + 2.5, 4.4); coin(x + 3.5, 4.4);
    return 7;
  }
};

function genChunk(){
  if (genX < 9){ genX = 9; return; }                     // 출발 직후 활주로
  const d = progress();
  genX += Math.round(rand(1, 3));

  let name;
  if (state !== S.ATTRACT && !G.starSpawned && d > 0.38){ name = 'starBlock'; G.starSpawned = true; }
  else {
    const weights = [
      ['coinTrail', 2.5], ['qRow', 3], ['lowBox', 2.4], ['tallBox', 1.4 + d * 1.4],
      ['walker', 1 + d * 3], ['platform', 2], ['stairs', d > 0.3 ? 1.5 : 0],
      ['flyer', d > 0.45 ? 1 + d * 2 : 0], ['itemArc', 2.4 - d]
    ].filter(([n, w]) => w > 0 && n !== lastPattern);
    let r = Math.random() * weights.reduce((s, [, w]) => s + w, 0);
    for (const [n, w] of weights){ r -= w; if (r <= 0){ name = n; break; } }
    name = name || 'coinTrail';
  }
  lastPattern = name;
  genX += PATTERNS[name](genX, d);
}
function ensureWorld(){
  const viewEnd = camX + W / T + 14;
  let guard = 0;
  while (genX < viewEnd && guard++ < 40) genChunk();
  const cut = camX - 4;
  const prune = arr => { for (let i = arr.length - 1; i >= 0; i--) if (arr[i].x + (arr[i].w || 1) < cut) arr.splice(i, 1); };
  prune(solids); prune(items); prune(enemies);
}

/* ---------------- 9. 물리 · 판정 ---------------- */
const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

function setHeroSize(){
  player.h = HERO_H[G.stageIdx];
  player.w = 0.6 + G.stageIdx * 0.04;
}
function runSpeed(){
  const base = lerp(CONFIG.runSpeedStart, CONFIG.runSpeedEnd, progress());
  return base * (G.star > 0 ? CONFIG.star.speed : 1);
}
function press(){
  input.held = true;
  player.buffer = CONFIG.physics.buffer;
}
function release(){ input.held = false; }

function jump(v, n){
  const p = player;
  p.vy = v; p.jumps = n; p.buffer = 0; p.coyote = 0; p.holdT = 0; p.onGround = false;
  if (n === 2){
    sfx.jump2();
    for (let i = 0; i < 8; i++) spark(p.x + p.w / 2, p.y + 0.1, '#ffffff', rand(-3, 3), rand(-2, 1));
  } else sfx.jump();
}

function stepPlayer(h){
  const p = player, ph = CONFIG.physics;
  // 가로 — 자동 달리기. 벽에 막히면 멈춘다 (시간 손해 = 자연스러운 벌칙)
  const vx = p.stun > 0 ? -2.4 : runSpeed();
  const x0 = p.x;
  p.x += vx * h;
  p.blocked = false;
  for (const s of solids){
    if (!overlap(p, s)) continue;
    if (vx > 0){ p.x = s.x - p.w - 1e-4; p.blocked = true; }
    else p.x = s.x + s.w + 1e-4;
  }
  p.dist += Math.abs(p.x - x0);

  // 점프 입력 (지면 / 코요테 타임 / 2단 점프)
  if (p.buffer > 0){
    if (p.onGround || p.coyote > 0) jump(ph.jumpV, 1);
    else if (p.jumps < 2) jump(ph.doubleJumpV, 2);
  }

  // 세로 — 누르고 있으면 상승 중 중력이 약해진다
  let g = ph.gravity;
  if (p.holding && p.vy > 0 && p.holdT < ph.holdMax){ g *= ph.holdGravity; p.holdT += h; }
  p.vy = Math.max(-ph.maxFall, p.vy - g * h);
  const prevY = p.y;
  p.y += p.vy * h;
  p.onGround = false;
  for (const s of solids){
    if (!overlap(p, s)) continue;
    const top = s.y + s.h;
    if (p.vy <= 0 && prevY >= top - 0.05){ p.y = top; p.vy = 0; p.onGround = true; }
    else if (p.vy > 0 && prevY + p.h <= s.y + 0.05){ p.y = s.y - p.h; p.vy = 0; hitBlock(s); }
    else { p.x = s.x - p.w - 1e-4; p.blocked = true; }
  }
  if (p.y <= 0){ p.y = 0; if (p.vy < 0) p.vy = 0; p.onGround = true; }

  if (p.onGround){ p.jumps = 0; p.coyote = ph.coyote; }
  else { p.coyote -= h; if (p.coyote <= 0 && p.jumps === 0) p.jumps = 1; }
  if (p.buffer > 0) p.buffer -= h;
}

/* ? 블록은 머리로 쳐야 열린다 */
function hitBlock(s){
  s.bumpT = 0.16;
  if (s.kind !== 'q' || s.used){ sfx.bump(); return; }
  s.used = true;
  const cx = s.x + 0.5, top = s.y + 1;
  if (s.content === 'star'){
    fx.push({ emoji:'💸', x:cx, y:top, life:1 });
    startStar();
  } else if (s.content === 'coins'){
    for (let i = 0; i < 3; i++) setTimeout(() => { fx.push({ coin:true, x:cx, y:top, life:1 }); getCoin(cx, top + 1); }, i * 90);
  } else {
    const pool = CONFIG.products;      // ? 블록에서만 💎 레전더리가 나온다
    const product = state === S.ATTRACT ? pickProduct() : pickProduct(pool);
    fx.push({ emoji:product.emoji, x:cx, y:top, life:1 });
    getItem(product, cx, top + 1.2);
  }
  sfx.block();
}

/* ---------------- 10. 수집 · 성장 ---------------- */
function getCoin(x, y){
  G.coins++;
  G.score += CONFIG.points.coin;
  sfx.coin();
  if (G.coins % CONFIG.coinsPerGrowth === 0 && state !== S.ATTRACT){
    popText(x, y + 0.6, `🪙×${CONFIG.coinsPerGrowth} 성장 +1`, '#ffd23f', 18);
    addGrowth(1);
  }
  updateHUD();
}
function getItem(product, x, y){
  const had = G.col.has(product.id);
  G.col.set(product.id, (G.col.get(product.id) || 0) + 1);
  G.items++;
  G.score += CONFIG.points[product.rarity];
  const gain = CONFIG.growthBy[product.rarity];
  for (let i = 0; i < 12; i++) spark(x, y, i % 2 ? product.color : '#ffffff', rand(-4, 4), rand(-1, 5));
  if (state === S.ATTRACT){ return; }

  if (!had){
    showCallout(el.itemCallout, `${product.emoji} ${product.name}`, product.rarity === 'common' ? 'NEW!' : `${product.rarity.toUpperCase()}!`, 1300);
    sfx.newItem(); buzz([12, 30, 12]);
  } else sfx.item();
  popText(x, y + 0.3, `+${gain} ${product.short}`, '#ffffff', 18);
  renderCollection(product.id);
  addGrowth(gain);
  updateHUD();
}
function stageFor(growth){
  let idx = 0;
  CONFIG.stages.forEach((s, i) => { if (growth >= s.min) idx = i; });
  return idx;
}
function addGrowth(n){
  G.growth += n;
  const target = stageFor(G.growth);
  if (target > G.stageIdx) levelUp(target);
  updateHUD();
}
/* 직급은 한 번 오르면 내려가지 않는다 (좌절 방지) — 벌칙은 포인트만 깎는다 */
function levelUp(target){
  G.freezeFrom = G.stageIdx;
  G.stageIdx = target;
  G.freeze = 0.7;                        // 변신 연출 동안 잠깐 멈춤 (고전 파워업 느낌)
  const bottom = player.y;
  setHeroSize();
  player.y = bottom;
  const st = CONFIG.stages[target];
  showCallout(el.levelCallout, `🎉 ${st.title} 승진!`, st.look, 1700);
  sfx.levelUp(); shake(); buzz([20, 40, 20, 40, 80]);
  makeConfetti(70);
  bump(el.hudLvBox);
}

function startStar(){
  G.star = CONFIG.star.time;
  app.classList.add('fever');
  setMusicRate(CONFIG.star.musicRate);
  if (state !== S.ATTRACT) showCallout(el.levelCallout, '💸 월급날 러시!', `${CONFIG.star.time}초 무적 · 코인 자석`, 1500);
  sfx.star(); buzz([20, 40, 20]);
}
function endStar(){
  G.star = 0;
  app.classList.remove('fever');
  setMusicRate(1);
}

function stomp(e){
  e.dead = true; e.squashT = 0.45;
  player.vy = input.held ? 15 : 12;
  player.jumps = 1;
  G.stomps++;
  G.score += CONFIG.points.stomp;
  popText(e.x + e.w / 2, e.y + e.h + 0.4, '스트레스 해소!', '#3ee6c1', 18);
  for (let i = 0; i < 10; i++) spark(e.x + e.w / 2, e.y + e.h / 2, '#ffffff', rand(-4, 4), rand(0, 5));
  sfx.stomp(); buzz(15);
}
function starKill(e){
  e.dead = true; e.squashT = 0.45; e.fly = true;
  G.stomps++; G.score += CONFIG.points.stomp;
  popText(e.x + e.w / 2, e.y + e.h + 0.3, '+200', '#ffd23f', 18);
  sfx.stomp();
}
const ENEMY_NAME = { monday:'😩 월요병', overtime:'📄 야근', stress:'⛈️ 스트레스' };
function hurt(e){
  const p = player;
  p.inv = CONFIG.hurt.invincible;
  if (state === S.ATTRACT) return;
  const lost = Math.min(G.growth, CONFIG.hurt.growth);
  G.growth -= lost;
  p.stun = CONFIG.hurt.stun;
  p.vy = 9;
  showCallout(el.dangerCallout, `${ENEMY_NAME[e.type]} 공격!`, lost ? `성장 포인트 −${lost}` : '휴… 잃을 게 없었어요', 1300);
  popText(p.x + p.w / 2, p.y + p.h + 0.3, `−${CONFIG.hurt.growth}`, '#ff6b81', 22);
  flash(); shake(); sfx.hurt(); buzz([40, 60, 80]);
  updateHUD();
}

/* ---------------- 11. 봇 (대기 화면 시연 · ?autoplay) ---------------- */
function botThink(dt){
  const p = player;
  if (bot.holdT > 0){ bot.holdT -= dt; if (bot.holdT <= 0) release(); }
  if (bot.cool > 0){ bot.cool -= dt; return; }
  if (!p.onGround) return;
  const front = p.x + p.w, look = runSpeed() * 0.2 + 0.55;
  let need = 0;
  for (const s of solids){
    if (s.x > front + look || s.x + s.w < p.x) continue;
    const blocking = s.y < p.y + p.h - 0.05 && s.y + s.h > p.y + 0.05 && s.x >= front - 0.15;
    if (blocking) need = Math.max(need, (s.y + s.h - p.y) > 1.5 ? 0.24 : 0.08);
    if (s.kind === 'q' && !s.used && Math.abs(s.x + 0.5 - (p.x + p.w / 2)) < 0.4) need = Math.max(need, 0.2);
  }
  for (const e of enemies){
    if (e.dead) continue;
    if (e.x > front - 0.3 && e.x < front + look + 0.9 && e.y < p.y + p.h) need = Math.max(need, e.type === 'stress' ? 0.24 : 0.1);
  }
  if (need){ press(); bot.holdT = need; bot.cool = 0.22; }
}

/* ---------------- 12. 이펙트 ---------------- */
function spark(x, y, c, vx, vy){ particles.push({ x, y, vx, vy, c, life:1, decay:rand(1.6, 2.6), s:rand(0.08, 0.16) }); }
function popText(x, y, text, color, size){ pops.push({ x, y, text, color, size:size || 20, life:1 }); }
function makeConfetti(n){
  for (let i = 0; i < (n || 140); i++){
    confetti.push({
      x:rand(0, W), y:rand(-H * 0.6, 0), vx:rand(-40, 40), vy:rand(120, 300),
      w:rand(6, 12), h:rand(8, 16), rot:rand(0, 6.3), vr:rand(-6, 6),
      c:['#ff4f9a', '#ffd23f', '#3ee6c1', '#8a3dff', '#ffffff'][(Math.random() * 5) | 0]
    });
  }
}
function shake(){ app.classList.remove('shake'); void app.offsetWidth; app.classList.add('shake'); }
function flash(){ const f = el.hitFlash; f.classList.remove('on'); void f.offsetWidth; f.classList.add('on'); }
function bump(node){ node.classList.remove('bump'); void node.offsetWidth; node.classList.add('bump'); }
const calloutTimers = new Map();
function showCallout(node, title, detail, ms){
  node.querySelector('b').textContent = title;
  node.querySelector('span').textContent = detail;
  clearTimeout(calloutTimers.get(node));
  node.classList.remove('on'); void node.offsetWidth; node.classList.add('on');
  calloutTimers.set(node, setTimeout(() => node.classList.remove('on'), ms || 1600));
}
function showWorldBanner(idx){
  const w = CONFIG.worlds[idx];
  el.worldBanner.querySelector('em').textContent = `WORLD 1-${idx + 1}`;
  el.worldBanner.querySelector('b').textContent = w.name;
  el.worldBanner.querySelector('span').textContent = w.sub;
  el.worldBanner.classList.remove('on'); void el.worldBanner.offsetWidth; el.worldBanner.classList.add('on');
}

/* ---------------- 13. 렌더링 ---------------- */
const hash = i => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const sx = x => (x - camX) * T;
const sy = y => groundY - y * T;

function drawBackground(w, now){
  const g = ctx.createLinearGradient(0, 0, 0, groundY);
  g.addColorStop(0, w.sky[0]); g.addColorStop(1, w.sky[1]);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, groundY);

  if (w.stars){
    for (let i = 0; i < 60; i++){
      const x = hash(i) * W, y = hash(i + 50) * groundY * 0.7;
      ctx.globalAlpha = 0.4 + 0.6 * Math.abs(Math.sin(now / 600 + i));
      ctx.fillStyle = '#fff'; ctx.fillRect(x, y, 2, 2);
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#fff6cf';
    ctx.beginPath(); ctx.arc(W * 0.8, groundY * 0.2, T * 0.7, 0, Math.PI * 2); ctx.fill();
  } else {
    const off = camX * T * 0.1;                       // 픽셀 구름
    for (let i = Math.floor(off / (T * 6)) - 1; i < Math.floor(off / (T * 6)) + W / (T * 6) + 2; i++){
      const x = i * T * 6 - off + hash(i) * T * 2, y = groundY * (0.12 + hash(i + 9) * 0.3);
      ctx.fillStyle = 'rgba(255,255,255,.9)';
      ctx.fillRect(x, y, T * 1.8, T * 0.45);
      ctx.fillRect(x + T * 0.35, y - T * 0.3, T * 1.0, T * 0.35);
    }
  }
  // 빌딩 2겹 패럴랙스
  [[0.2, 3.2, 3, 6, w.far], [0.45, 4.4, 1.8, 4, w.near]].forEach(([f, sp, hMin, hVar, color], layer) => {
    const off = camX * T * f, step = sp * T;
    const i0 = Math.floor(off / step) - 1, i1 = i0 + Math.ceil(W / step) + 2;
    for (let i = i0; i < i1; i++){
      const seed = i * 13 + layer * 101;
      const bw = (1.4 + hash(seed) * 1.5) * T, bh = (hMin + hash(seed + 3) * hVar) * T;
      const x = i * step - off, y = groundY - bh;
      ctx.fillStyle = color; ctx.fillRect(x, y, bw, bh);
      ctx.fillStyle = w.win; ctx.globalAlpha = layer ? 0.55 : 0.35;
      const ws = T * 0.22;
      for (let wy = y + ws; wy < groundY - ws * 2; wy += ws * 2.2)
        for (let wx = x + ws; wx < x + bw - ws; wx += ws * 2)
          if (hash(seed + wx * 0.7 + wy) > 0.35) ctx.fillRect(wx, wy, ws, ws);
      ctx.globalAlpha = 1;
    }
  });
}

function drawGround(w){
  ctx.fillStyle = w.ground; ctx.fillRect(0, groundY, W, H - groundY);
  ctx.fillStyle = w.top; ctx.fillRect(0, groundY, W, T * 0.26);
  ctx.fillStyle = w.line;
  ctx.fillRect(0, groundY + T * 0.26, W, 3);
  const rowH = T * 0.5;
  for (let r = 0; groundY + T * 0.26 + r * rowH < H; r++){
    const y = groundY + T * 0.26 + r * rowH;
    ctx.fillRect(0, y, W, 2);
    const shift = r % 2 ? 0.5 : 0;
    for (let i = Math.floor(camX) - 1; i < camX + W / T + 1; i++){
      ctx.fillRect(sx(i + shift), y, 2, rowH);
    }
  }
}

function drawSolid(s, w){
  const x = sx(s.x), bw = s.w * T, bh = s.h * T;
  if (x + bw < -4 || x > W + 4) return;
  let y = sy(s.y + s.h);
  if (s.bumpT > 0) y -= Math.sin((1 - s.bumpT / 0.16) * Math.PI) * T * 0.22;
  const b = Math.max(2, T * 0.07);

  if (s.kind === 'box'){
    ctx.fillStyle = w.boxLine; ctx.fillRect(x, y, bw, bh);
    ctx.fillStyle = w.box; ctx.fillRect(x + b, y + b, bw - b * 2, bh - b * 2);
    ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(x + b, y + b, bw - b * 2, b);
    for (let k = 1; k < s.h; k++){ ctx.fillStyle = w.boxLine; ctx.fillRect(x, y + k * T - b / 2, bw, b); }
    drawEmoji(w.crate, x + bw / 2, y + T * 0.5, T * 0.5);
  } else if (s.kind === 'brick' || (s.kind === 'q' && s.used)){
    const used = s.kind === 'q';
    ctx.fillStyle = used ? '#8a5a3c' : '#c8643c'; ctx.fillRect(x, y, bw, bh);
    ctx.fillStyle = used ? '#6b4029' : '#8e3a1c';
    if (used){
      ctx.fillRect(x, y, bw, b); ctx.fillRect(x, y + bh - b, bw, b); ctx.fillRect(x, y, b, bh); ctx.fillRect(x + bw - b, y, b, bh);
      ctx.fillRect(x + bw * 0.2, y + bh * 0.2, b, b); ctx.fillRect(x + bw * 0.8 - b, y + bh * 0.2, b, b);
      ctx.fillRect(x + bw * 0.2, y + bh * 0.8 - b, b, b); ctx.fillRect(x + bw * 0.8 - b, y + bh * 0.8 - b, b, b);
    } else {
      ctx.fillRect(x, y + bh * 0.5 - b / 2, bw, b); ctx.fillRect(x, y + bh - b, bw, b);
      ctx.fillRect(x + bw * 0.5, y, b, bh * 0.5); ctx.fillRect(x + bw * 0.25, y + bh * 0.5, b, bh * 0.5);
      ctx.fillRect(x + bw * 0.75, y + bh * 0.5, b, bh * 0.5);
      ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.fillRect(x, y, bw, b);
    }
  } else if (s.kind === 'q'){
    const pulse = 0.85 + 0.15 * Math.sin(performance.now() / 180);
    ctx.fillStyle = '#9a5a00'; ctx.fillRect(x, y, bw, bh);
    ctx.fillStyle = `rgb(255,${Math.round(190 * pulse + 20)},60)`; ctx.fillRect(x + b, y + b, bw - b * 2, bh - b * 2);
    ctx.fillStyle = '#9a5a00';
    [[0.15, 0.15], [0.85, 0.15], [0.15, 0.85], [0.85, 0.85]].forEach(([u, v]) => ctx.fillRect(x + bw * u - b / 2, y + bh * v - b / 2, b, b));
    ctx.font = `${T * 0.5}px "Press Start 2P",monospace`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = '#9a5a00'; ctx.fillText('?', x + bw / 2 + 2, y + bh / 2 + 3);
    ctx.fillStyle = '#fff'; ctx.fillText('?', x + bw / 2, y + bh / 2 + 1);
  }
}

function drawItem(it, now){
  const x = sx(it.x);
  if (x < -T || x > W + T) return;
  const y = sy(it.y + Math.sin(now / 300 + it.ph) * 0.12);
  if (it.kind === 'coin'){
    const k = Math.abs(Math.cos(now / 220 + it.ph));
    const rw = Math.max(2, it.r * T * k), rh = it.r * T;
    ctx.fillStyle = '#b87a00'; ctx.beginPath(); ctx.ellipse(x, y, rw + 2, rh + 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.ellipse(x, y, rw, rh, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff3a8'; ctx.fillRect(x - rw * 0.25, y - rh * 0.55, Math.max(1, rw * 0.3), rh * 1.1);
    return;
  }
  const p = it.product, r = it.r * T;
  ctx.save();
  ctx.globalAlpha = 0.45 + 0.2 * Math.sin(now / 200 + it.ph);
  ctx.fillStyle = p.color;
  ctx.beginPath(); ctx.arc(x, y, r * 1.25, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#fff'; ctx.strokeStyle = p.color; ctx.lineWidth = Math.max(2, T * 0.06);
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  if (p.rarity !== 'common'){                                   // 레어는 회전하는 반짝이
    const a = now / 300;
    for (let i = 0; i < 4; i++){
      const ang = a + i * Math.PI / 2;
      ctx.fillStyle = p.rarity === 'legendary' ? RAINBOW[i] : '#ffd23f';
      ctx.fillRect(x + Math.cos(ang) * r * 1.45 - 3, y + Math.sin(ang) * r * 1.45 - 3, 6, 6);
    }
  }
  ctx.restore();
  drawEmoji(p.emoji, x, y, r * 1.3);
}

function drawEnemy(e, now){
  const x = sx(e.x), w = e.w * T;
  if (x + w < -T || x > W + T) return;
  const hFull = e.h * T;
  const k = e.dead ? Math.max(0, e.squashT / 0.45) : 1;
  const h = e.dead && !e.fly ? hFull * 0.35 : hFull;
  let bottom = sy(e.y);
  if (e.fly) bottom -= (1 - k) * T * 2;
  const top = bottom - h;
  ctx.save();
  ctx.globalAlpha = e.dead ? k : 1;
  const step = Math.floor(now / 150) % 2;
  const eye = (ex, ey, look) => {
    ctx.fillStyle = '#fff'; ctx.fillRect(ex, ey, w * 0.18, h * 0.2);
    ctx.fillStyle = '#1a1030'; ctx.fillRect(ex + look, ey + h * 0.06, w * 0.09, h * 0.12);
  };

  if (e.type === 'monday'){
    ctx.fillStyle = '#6f78a8'; roundRect(ctx, x, top, w, h, w * 0.3); ctx.fill();
    ctx.fillStyle = '#58608c'; ctx.fillRect(x + w * 0.1, bottom - h * 0.22, w * 0.8, h * 0.12);
    if (!e.dead){
      ctx.fillStyle = '#2d3150';
      ctx.fillRect(x + w * (step ? 0.1 : 0.2), bottom - T * 0.1, w * 0.28, T * 0.1);
      ctx.fillRect(x + w * (step ? 0.62 : 0.52), bottom - T * 0.1, w * 0.28, T * 0.1);
      eye(x + w * 0.2, top + h * 0.28, 0); eye(x + w * 0.56, top + h * 0.28, 0);
      ctx.fillStyle = '#2d3150';                                   // 처진 눈썹
      ctx.fillRect(x + w * 0.16, top + h * 0.2, w * 0.24, h * 0.06);
      ctx.fillRect(x + w * 0.6, top + h * 0.2, w * 0.24, h * 0.06);
      ctx.font = `900 ${T * 0.2}px "Press Start 2P",monospace`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#dfe3ff';
      ctx.fillText('MON', x + w / 2, top + h * 0.7);
    }
  } else if (e.type === 'overtime'){
    for (let i = 0; i < 3; i++){
      ctx.fillStyle = i % 2 ? '#e9e4d6' : '#ffffff';
      ctx.fillRect(x + (i % 2 ? w * 0.05 : 0), top + i * h * 0.12, w - w * 0.05, h - i * h * 0.12);
    }
    ctx.fillStyle = '#b7b0a0';
    for (let i = 0; i < 4; i++) ctx.fillRect(x + w * 0.15, top + h * (0.52 + i * 0.1), w * 0.7, 2);
    if (!e.dead){
      ctx.fillStyle = '#e8324a';
      ctx.fillRect(x + w * 0.18, top + h * 0.2, w * 0.2, h * 0.14);
      ctx.fillRect(x + w * 0.6, top + h * 0.2, w * 0.2, h * 0.14);
      ctx.fillStyle = '#1a1030';
      ctx.fillRect(x + w * 0.12, top + h * 0.12, w * 0.3, h * 0.05);
      ctx.fillRect(x + w * 0.58, top + h * 0.12, w * 0.3, h * 0.05);
      ctx.font = `900 ${T * 0.24}px sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#e8324a';
      ctx.fillText('야근', x + w / 2, top + h * 0.45);
      ctx.fillStyle = '#1a1030';
      ctx.fillRect(x + w * (step ? 0.15 : 0.25), bottom - T * 0.08, w * 0.25, T * 0.08);
      ctx.fillRect(x + w * (step ? 0.6 : 0.5), bottom - T * 0.08, w * 0.25, T * 0.08);
    }
  } else {
    const bob = e.dead ? 0 : Math.sin(now / 180) * T * 0.04;
    ctx.fillStyle = '#5b5670';
    [[0.25, 0.55, 0.3], [0.5, 0.4, 0.38], [0.75, 0.55, 0.3]].forEach(([u, v, r]) => {
      ctx.beginPath(); ctx.arc(x + w * u, top + h * v + bob, w * r, 0, Math.PI * 2); ctx.fill();
    });
    ctx.fillRect(x + w * 0.05, top + h * 0.55 + bob, w * 0.9, h * 0.3);
    if (!e.dead){
      ctx.fillStyle = '#ffd23f';                                     // 번개
      const lx = x + w * 0.45, ly = bottom + bob;
      ctx.beginPath(); ctx.moveTo(lx, ly - 2); ctx.lineTo(lx + w * 0.16, ly - 2); ctx.lineTo(lx + w * 0.06, ly + T * 0.2);
      ctx.lineTo(lx + w * 0.2, ly + T * 0.2); ctx.lineTo(lx - w * 0.04, ly + T * 0.5); ctx.lineTo(lx + w * 0.04, ly + T * 0.26);
      ctx.lineTo(lx - w * 0.08, ly + T * 0.26); ctx.closePath(); ctx.fill();
      eye(x + w * 0.24, top + h * 0.42 + bob, -w * 0.02); eye(x + w * 0.58, top + h * 0.42 + bob, -w * 0.02);
      ctx.fillStyle = '#1a1030';
      ctx.fillRect(x + w * 0.22, top + h * 0.34 + bob, w * 0.22, h * 0.06);
      ctx.fillRect(x + w * 0.56, top + h * 0.34 + bob, w * 0.22, h * 0.06);
    }
  }
  ctx.restore();
}

function drawPlayer(now){
  const p = player;
  if (p.inv > 0 && G.star <= 0 && Math.floor(now / 70) % 2) return;     // 피격 무적 깜빡임
  const cx = sx(p.x + p.w / 2), bottom = sy(p.y);
  let idx = G.stageIdx;
  let hPx = HERO_H[idx] * T;
  if (G.freeze > 0 && Math.floor(G.freeze * 12) % 2){                     // 변신 중: 이전/새 모습 번갈아
    idx = G.freezeFrom; hPx = HERO_H[idx] * T;
  }
  let pose = 'jump';
  if (p.onGround) pose = (state === S.COUNT || p.blocked && G.freeze <= 0) ? 'stand' : (Math.floor(p.dist * 2.6) % 2 ? 'runA' : 'runB');
  if (state === S.COUNT) pose = 'stand';

  // 그림자
  ctx.fillStyle = 'rgba(0,0,0,.18)';
  ctx.beginPath(); ctx.ellipse(cx, groundY + 3, T * 0.4 * Math.max(0.3, 1 - p.y * 0.15), T * 0.08, 0, 0, Math.PI * 2); ctx.fill();

  if (G.star > 0){
    ctx.save();
    ctx.globalAlpha = 0.35 + 0.2 * Math.sin(now / 60);
    ctx.fillStyle = '#ffd23f';
    ctx.beginPath(); ctx.ellipse(cx, bottom - hPx * 0.5, hPx * 0.45, hPx * 0.6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  drawHero(ctx, cx, bottom, hPx, idx, pose, G.star > 0 ? { rainbow:Math.floor(now / 90) } : {});

  if (G.stageIdx === 4 && Math.random() < 0.3)                                   // 대표는 반짝이는 잔상
    spark(p.x + rand(0, p.w), p.y + rand(0, p.h), Math.random() < 0.5 ? '#ffd23f' : '#ffffff', -2, rand(0, 2));
}

function render(now){
  const w = CONFIG.worlds[G.worldIdx];
  drawBackground(w, now);
  drawGround(w);
  for (const s of solids) drawSolid(s, w);
  for (const it of items) if (!it.taken) drawItem(it, now);
  for (const e of enemies) drawEnemy(e, now);

  for (let i = fx.length - 1; i >= 0; i--){           // ? 블록에서 솟는 보상
    const f = fx[i];
    const y = sy(f.y + (1 - f.life) * 1.6), x = sx(f.x);
    ctx.globalAlpha = Math.min(1, f.life * 2);
    if (f.coin){ ctx.fillStyle = '#ffd23f'; ctx.fillRect(x - T * 0.15, y - T * 0.25, T * 0.3, T * 0.5); }
    else drawEmoji(f.emoji, x, y, T * 0.7);
    ctx.globalAlpha = 1;
  }
  drawPlayer(now);

  for (const p of particles){
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.c;
    const s = p.s * T;
    ctx.fillRect(sx(p.x) - s / 2, sy(p.y) - s / 2, s, s);
  }
  ctx.globalAlpha = 1;

  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (const t of pops){
    ctx.globalAlpha = Math.min(1, t.life * 1.8);
    ctx.font = `900 ${t.size}px "Pretendard Variable","Pretendard",system-ui,sans-serif`;
    const x = sx(t.x), y = sy(t.y) - (1 - t.life) * 40;
    ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(26,16,48,.85)'; ctx.strokeText(t.text, x, y);
    ctx.fillStyle = t.color; ctx.fillText(t.text, x, y);
  }
  ctx.globalAlpha = 1;

  for (const c of confetti){
    ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(c.rot);
    ctx.fillStyle = c.c; ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h); ctx.restore();
  }
}

/* ---------------- 14. 월드 업데이트 ---------------- */
function updateWorld(dt, now){
  if (state === S.PLAY){
    G.elapsed += dt;
    const wi = Math.min(CONFIG.worlds.length - 1, Math.floor(G.elapsed / (CONFIG.duration / CONFIG.worlds.length)));
    if (wi !== G.worldIdx){ G.worldIdx = wi; showWorldBanner(wi); }
    updateTimer();
    if (G.elapsed >= CONFIG.duration){ finish(); }
  } else if (state === S.ATTRACT){
    G.demoT += dt;                                        // 대기 화면: 성장 과정을 자동 시연
    const idx = Math.floor(G.demoT / 3) % CONFIG.stages.length;
    if (idx !== G.stageIdx){ G.stageIdx = idx; setHeroSize(); }
    G.worldIdx = Math.floor(G.demoT / 6) % CONFIG.worlds.length;
  }

  if (G.freeze > 0){ G.freeze -= dt; return; }

  if (state === S.ATTRACT || state === S.FINISH || AUTOPLAY) botThink(dt);
  player.holding = input.held;
  const frameY = player.y;
  const steps = Math.ceil(dt / (1 / 120));
  for (let i = 0; i < steps; i++) stepPlayer(dt / steps);

  if (player.inv > 0) player.inv -= dt;
  if (player.stun > 0) player.stun -= dt;
  if (G.star > 0){ G.star -= dt; if (G.star <= 0) endStar(); }

  const view = camX + W / T + 1;
  for (let i = enemies.length - 1; i >= 0; i--){
    const e = enemies[i];
    if (e.dead){ e.squashT -= dt; if (e.squashT <= 0) enemies.splice(i, 1); continue; }
    if (e.x > view) continue;                             // 화면에 들어오면 움직이기 시작
    e.x += e.vx * dt;
    if (e.type === 'stress') e.y = e.baseY + Math.sin(now / 400 + e.ph) * 0.45;
    else for (const s of solids) if (overlap(e, s)){ e.x -= e.vx * dt; e.vx = -e.vx; break; }

    if (!overlap(player, { x:e.x + 0.08, y:e.y + 0.05, w:e.w - 0.16, h:e.h - 0.1 })) continue;
    if (G.star > 0 || state === S.FINISH) starKill(e);
    else if (player.vy < 0 && frameY >= e.y + e.h * 0.4) stomp(e);
    else if (player.inv <= 0) hurt(e);
  }

  const p = player;
  for (const it of items){
    if (it.taken) continue;
    if (G.star > 0 && Math.abs(it.x - p.x) < 3.5){                 // 러시 중 자석
      it.x += (p.x + p.w / 2 - it.x) * Math.min(1, dt * 7);
      it.y += (p.y + p.h / 2 - it.y) * Math.min(1, dt * 7);
    }
    const cx = clamp(it.x, p.x, p.x + p.w), cy = clamp(it.y, p.y, p.y + p.h);
    if (Math.hypot(it.x - cx, it.y - cy) < it.r + 0.1){
      it.taken = true;
      if (it.kind === 'coin') getCoin(it.x, it.y); else getItem(it.product, it.x, it.y);
    }
  }
  for (let i = items.length - 1; i >= 0; i--) if (items[i].taken) items.splice(i, 1);

  for (const s of solids) if (s.bumpT > 0) s.bumpT -= dt;
  for (let i = fx.length - 1; i >= 0; i--){ fx[i].life -= dt * 1.8; if (fx[i].life <= 0) fx.splice(i, 1); }

  camX = Math.max(camX, p.x - (W * (W > H ? 0.3 : 0.24)) / T);
  ensureWorld();
}

function updateEffects(dt){
  for (let i = particles.length - 1; i >= 0; i--){
    const p = particles[i];
    p.life -= p.decay * dt;
    if (p.life <= 0){ particles.splice(i, 1); continue; }
    p.vy -= 14 * dt; p.x += p.vx * dt; p.y += p.vy * dt;
  }
  for (let i = pops.length - 1; i >= 0; i--){ pops[i].life -= dt * 1.1; if (pops[i].life <= 0) pops.splice(i, 1); }
  for (let i = confetti.length - 1; i >= 0; i--){
    const c = confetti[i];
    c.vy += 90 * dt; c.x += c.vx * dt; c.y += c.vy * dt; c.rot += c.vr * dt;
    if (c.y > H + 40) confetti.splice(i, 1);
  }
}

/* ---------------- 15. HUD ---------------- */
function updateTimer(){
  const left = Math.max(0, CONFIG.duration - G.elapsed);
  const shown = Math.ceil(left);
  if (el.time.textContent !== String(shown)){
    el.time.textContent = shown;
    el.time.classList.toggle('low', shown <= 10);
    if (shown <= 5 && shown > 0){ sfx.tick(); bump(el.time); }
  }
  el.timefill.style.width = (left / CONFIG.duration * 100) + '%';
  el.timefill.classList.toggle('low', left <= 10);
}
function updateHUD(){
  const st = CONFIG.stages[G.stageIdx], next = CONFIG.stages[G.stageIdx + 1];
  el.hudLv.textContent = `LV.${G.stageIdx + 1}`;
  el.hudTitle.textContent = st.title;
  el.coins.textContent = G.coins;
  if (next){
    const ratio = clamp((G.growth - st.min) / (next.min - st.min), 0, 1);
    el.growthFill.style.width = (ratio * 100) + '%';
    el.growthLabel.textContent = `${next.title} 승진까지 ${Math.max(0, next.min - G.growth)}`;
  } else {
    el.growthFill.style.width = '100%';
    el.growthLabel.textContent = `👑 대표 달성! 성장 ${G.growth}`;
  }
}
function renderCollection(highlightId){
  el.collection.innerHTML = CONFIG.products.map(p => {
    const n = G.col.get(p.id) || 0;
    return `<div class="slot ${n ? 'got' : ''} ${p.id === highlightId ? 'pop' : ''}" style="--c:${p.color}" title="${p.name}">
      ${p.emoji}${n > 1 ? `<b class="n">${n}</b>` : ''}</div>`;
  }).join('');
}

/* ---------------- 16. 화면 전환 ---------------- */
function show(screen){
  [el.scAttract, el.scCount, el.scResult].forEach(s => s.classList.remove('show'));
  if (screen) screen.classList.add('show');
}
function resetRun(){
  Object.assign(G, {
    elapsed:0, score:0, coins:0, growth:0, stageIdx:0, items:0, stomps:0,
    col:new Map(), star:0, freeze:0, freezeFrom:0, worldIdx:0,
    starSpawned:false, finishT:0, leadDone:false
  });
  solids.length = items.length = enemies.length = particles.length = pops.length = fx.length = 0;
  genX = 0; lastPattern = ''; camX = 0;
  Object.assign(player, { x:1.5, y:0, vy:0, onGround:true, jumps:0, coyote:0, buffer:0, holdT:0, inv:0, stun:0, dist:0, blocked:false });
  input.held = false; bot.holdT = 0; bot.cool = 0;
  setHeroSize();
  camX = player.x - (W * (W > H ? 0.3 : 0.24)) / T;
  app.classList.remove('fever');
  ensureWorld();
}
function startCountdown(){
  if (state === S.COUNT) return;
  audioOn();
  state = S.COUNT;
  resetRun();
  confetti.length = 0;
  show(el.scCount);
  el.hud.classList.remove('on');
  el.finishBanner.classList.remove('on');
  let n = 3;
  const step = () => {
    const last = n <= 0;
    el.countNum.textContent = last ? 'GO!' : n;
    el.countNum.classList.remove('tick'); void el.countNum.offsetWidth; el.countNum.classList.add('tick');
    if (last){ sfx.go(); setTimeout(startPlay, 450); }
    else { sfx.tick(); n--; setTimeout(step, 620); }
  };
  step();
}
function startPlay(){
  state = S.PLAY;
  show(null);
  el.hud.classList.add('on');
  el.time.classList.remove('low');
  renderCollection();
  updateHUD(); updateTimer();
  musicStart();
  showNowPlaying();
  showWorldBanner(0);
}
function finish(){
  state = S.FINISH;
  G.finishT = 1.6;
  input.held = false;
  player.inv = 99;
  if (G.star > 0) endStar();
  el.finishBanner.classList.remove('on'); void el.finishBanner.offsetWidth; el.finishBanner.classList.add('on');
  sfx.win();
}
function endGame(){
  state = S.RESULT;
  el.hud.classList.remove('on');
  el.finishBanner.classList.remove('on');
  app.classList.remove('fever');
  musicStop();
  buildResult();
  show(el.scResult);
  el.scResult.scrollTop = 0;
  makeConfetti();
  buzz([30, 60, 30, 60, 120]);
  G.idleAt = performance.now();
}
function toAttract(){
  state = S.ATTRACT;
  show(el.scAttract);
  resetRun();
  G.demoT = 0;
  updateTicker();
}

/* ---------------- 17. 입력 ---------------- */
function onDown(e){
  if (e.target.closest && e.target.closest('button, input, label, a, .card, .attract-inner')) return;
  audioOn();
  if (state === S.PLAY && !AUTOPLAY) press();
}
app.addEventListener('pointerdown', onDown);
['pointerup', 'pointercancel'].forEach(t => window.addEventListener(t, () => { if (state === S.PLAY && !AUTOPLAY) release(); }));
window.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT') return;
  if (![' ', 'ArrowUp', 'w', 'W', 'Enter'].includes(e.key)) return;
  e.preventDefault();
  if (e.repeat) return;
  audioOn();
  if (state === S.ATTRACT) startCountdown();
  else if (state === S.PLAY) press();
});
window.addEventListener('keyup', e => { if ([' ', 'ArrowUp', 'w', 'W'].includes(e.key)) release(); });

el.scAttract.addEventListener('click', () => { if (state === S.ATTRACT) startCountdown(); });
$('btnStart').addEventListener('click', e => { e.stopPropagation(); if (state === S.ATTRACT) startCountdown(); });
$('btnRetry').addEventListener('click', () => startCountdown());
$('btnSound').addEventListener('click', () => { audioOn(); toggleSound(); });
$('btnFs').addEventListener('click', () => {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
  else document.exitFullscreen?.();
});
$('btnShare').addEventListener('click', share);
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('gesturestart', e => e.preventDefault());

/* ---------------- 18. 결과 ---------------- */
function makeCode(){
  const cs = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = ''; for (let i = 0; i < 4; i++) s += cs[(Math.random() * cs.length) | 0];
  return `${CONFIG.couponPrefix}-${s}`;
}
function todayKey(){ return new Date().toISOString().slice(0, 10); }
function loadRuns(){
  try { const all = JSON.parse(localStorage.getItem(STORE_RUNS) || '{}'); return all[todayKey()] || []; }
  catch(e){ return []; }
}
function saveRun(){
  const entry = { lv:G.stageIdx, g:G.growth, s:G.score, t:Date.now() };
  try {
    const all = JSON.parse(localStorage.getItem(STORE_RUNS) || '{}');
    const day = all[todayKey()] || [];
    day.push(entry);
    day.sort((a, b) => (b.lv - a.lv) || (b.g - a.g) || (b.s - a.s));
    all[todayKey()] = day.slice(0, 50);
    localStorage.setItem(STORE_RUNS, JSON.stringify(all));
  } catch(e){}
  return entry;
}
function drawPortrait(canvasEl, idx){
  const c = canvasEl.getContext('2d');
  c.clearRect(0, 0, canvasEl.width, canvasEl.height);
  c.imageSmoothingEnabled = false;
  const px = Math.floor((canvasEl.height - 6) / 21);          // 티아라 3칸 포함 21줄
  drawHero(c, canvasEl.width / 2, canvasEl.height - 3, px * 18, idx, 'stand');
}

function buildResult(){
  const idx = G.stageIdx, st = CONFIG.stages[idx], next = CONFIG.stages[idx + 1];
  const hasLegendary = CONFIG.products.some(p => p.rarity === 'legendary' && G.col.has(p.id));
  G.percent = Math.min(CONFIG.maxPercent, st.percent + (hasLegendary ? CONFIG.legendaryBonus : 0));
  G.code = makeCode();
  G.couponEnd = Date.now() + CONFIG.couponMinutes * 60000;

  el.rGrade.textContent = `LV.${idx + 1} ${st.en}`;
  el.rTitle.textContent = st.title;
  el.rLook.textContent = st.look;
  drawPortrait(el.rHero, idx);
  el.rPath.innerHTML = CONFIG.stages.map((s, i) =>
    `<i class="${i < idx ? 'on' : ''} ${i === idx ? 'me' : ''}">${s.title}</i>`).join('');
  el.rGrowth.textContent = G.growth;
  el.rItems.textContent = G.items;
  el.rCoins.textContent = G.coins;
  el.rStomps.textContent = G.stomps;

  el.rColGrid.innerHTML = CONFIG.products.map((p, i) => {
    const n = G.col.get(p.id) || 0;
    return `<div class="cell ${n ? 'got' : ''}" style="--c:${p.color};animation-delay:${i * 45}ms">
      <div class="e">${p.emoji}</div><span class="n ${n ? '' : 'miss'}">${p.short}</span>
      ${n > 1 ? `<b class="x">${n}</b>` : ''}</div>`;
  }).join('');

  // 한 끗 차이를 이름으로 보여준다 → 재도전 유도
  const missing = CONFIG.products.filter(p => !G.col.has(p.id)).slice(0, 2);
  const missTxt = missing.length ? `<small>놓친 아이템: ${missing.map(p => `${p.emoji} ${p.name}`).join(', ')}</small>` : '';
  if (next){
    const need = Math.max(1, next.min - G.growth);
    el.rNear.innerHTML = `아깝다! 성장 포인트 <b>${need}</b>만 더 모았다면<br><b>${next.title} 승진 · ${next.percent}%</b> 였어요 😭${missTxt}`;
  } else {
    el.rNear.innerHTML = `60초 만에 <b>대표</b> 달성! 오늘의 갓생러 👑${missTxt}`;
  }

  el.rPercent.textContent = G.percent;
  el.rPerk.innerHTML = st.perk + (hasLegendary ? `<br><b>💎 시크릿 주얼리 보너스 +${CONFIG.legendaryBonus}%</b>` : '');
  el.rCode.textContent = G.code;
  el.coupon.classList.remove('dead');

  const me = saveRun();
  const day = loadRuns();
  const myRank = day.findIndex(e => e.t === me.t) + 1;
  const rows = day.slice(0, 5).map((e, i) => {
    const isMe = e.t === me.t;
    return `<li class="${isMe ? 'me' : ''}"><span class="rk">${i + 1}위</span>
      <span>${isMe ? '🙋‍♀️ 나' : '익명의 갓생러'}</span>
      <span class="sc">${CONFIG.stages[e.lv].title} · ${e.g}P</span></li>`;
  }).join('');
  const top = day[0];
  el.board.innerHTML = `<h3>오늘의 승진 랭킹 · 내 순위 ${myRank || '-'}위 / ${day.length}명</h3><ol>${rows}</ol>` +
    (top && top.t !== me.t && top.g > G.growth ? `<p>1위는 <b>${CONFIG.stages[top.lv].title} · ${top.g}P</b> — ${top.g - G.growth}P 차이예요!</p>` : '');

  el.leadBox.innerHTML = leadMarkup();
  bindLead();
}

function leadMarkup(){
  return `<p class="lead-title">이름 · 이메일을 남기면 <b>추가 ${CONFIG.leadBonusPercent}% 할인</b> 🎁</p>
    <form id="leadForm" autocomplete="off" novalidate>
      <input id="leadName" type="text" placeholder="이름" maxlength="20" autocomplete="name">
      <input id="leadEmail" type="email" inputmode="email" placeholder="이메일 주소"
             maxlength="80" autocapitalize="off" autocorrect="off" spellcheck="false">
      <label class="agree">
        <input type="checkbox" id="leadAgree">
        <span>개인정보 수집·이용에 동의합니다
          <em>이벤트 안내·혜택 제공 목적 / 이름·이메일 / 6개월 보관</em></span>
      </label>
      <button type="submit" class="btn primary small">추가 할인 받기</button>
    </form>
    <small>* 쿠폰은 위 코드로 현장에서 바로 사용하세요.</small>`;
}
function bindLead(){
  const form = $('leadForm'); if (!form) return;
  // 휴대폰 키보드가 올라오면 제출 버튼이 가려진다 → 입력창을 화면 안으로 끌어온다
  ['leadName', 'leadEmail'].forEach(id => {
    $(id).addEventListener('focus', () => setTimeout(() => form.scrollIntoView({ block:'center', behavior:'smooth' }), 320));
  });
  form.addEventListener('submit', e => {
    e.preventDefault();
    const name  = $('leadName').value.trim();
    const email = $('leadEmail').value.trim();
    const agree = $('leadAgree').checked;
    if (!name){ toast('이름을 입력해 주세요'); $('leadName').focus(); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)){ toast('이메일 주소를 확인해 주세요'); $('leadEmail').focus(); return; }
    if (!agree){ toast('개인정보 수집·이용 동의가 필요해요'); return; }
    if (G.leadDone) return;
    G.leadDone = true;

    G.percent = Math.min(CONFIG.maxPercent, G.percent + CONFIG.leadBonusPercent);
    el.rPercent.textContent = G.percent;

    const now = new Date();
    // 기존 게임과 동일하게 KST 기준 날짜/시각을 따로 보낸다
    const kst = new Intl.DateTimeFormat('sv-SE', {
      timeZone:'Asia/Seoul', dateStyle:'short', timeStyle:'medium'
    }).format(now).split(' ');
    const st = CONFIG.stages[G.stageIdx];

    const payload = {
      name, email,
      coupon: G.code,
      percent: G.percent,
      stage: `LV.${G.stageIdx + 1} ${st.title}`,
      growth: G.growth,
      items: G.items,
      kinds: G.col.size,
      collected: CONFIG.products.filter(p => G.col.has(p.id)).map(p => `${p.name} x${G.col.get(p.id)}`).join(', '),
      coins: G.coins,
      cleared: G.stageIdx >= WEBHOOK.clearStage,
      score: G.score,
      date: kst[0], time: kst[1],
      agreedAt: now.toISOString(),
      consent: true,
      tries: 0
    };
    try {
      const leads = JSON.parse(localStorage.getItem(STORE_LEADS) || '[]');
      leads.push(payload); localStorage.setItem(STORE_LEADS, JSON.stringify(leads));
    } catch(err){}

    // 화면은 즉시 보상 처리 — 전송 결과 때문에 손님을 기다리게 하지 않는다
    el.leadBox.innerHTML =
      `<p class="lead-title">✅ ${escapeHtml(name)}님, <b>${G.percent}% 할인</b>으로 업그레이드!</p>
       <small>쿠폰 코드 ${G.code} · 스태프에게 이 화면을 보여주세요.</small>
       <p class="send-status" id="sendStatus">📨 응모 접수 중…</p>`;
    makeConfetti(60); sfx.levelUp(); shake();

    if (!WEBHOOK.url){ setSendStatus('✅ 응모 접수 완료', 'ok'); return; }
    postLead(payload).then(r => {
      if (r.ok){ setSendStatus('✅ 응모 접수 완료', 'ok'); }
      else {
        outboxAdd(payload);
        setSendStatus('📨 저장됨 — 연결되면 자동으로 접수돼요', 'warn');
        setTimeout(outboxFlush, 3000);      // 휴대폰은 몇 초 뒤 페이지를 닫는다
        setTimeout(outboxFlush, 10000);
      }
    });
  });
}
function escapeHtml(s){ return s.replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c])); }
function setSendStatus(text, kind){
  const n = $('sendStatus'); if (!n) return;
  n.textContent = text; n.className = 'send-status ' + (kind || '');
}

/* ---------------- 19. 응모 정보 웹훅 (coupon-pop 과 동일) ---------------- */
function isFormTransport(){
  // Make / Zapier / n8n 등 범용 웹훅은 CORS preflight 를 못 받으므로 form 인코딩으로 보낸다
  return WEBHOOK.provider === 'make' || WEBHOOK.provider === 'json';
}
function buildBody(p){
  const base = {
    date: p.date, time: p.time,
    email: p.email,
    code: p.coupon,
    score: String(p.score),
    cleared: String(p.cleared),
    discount: String(p.percent),
    agreedAt: p.agreedAt,
    source: WEBHOOK.source,
    // ↓ 이 게임에만 있는 값 (Make 에서 매핑하면 바로 쓸 수 있습니다)
    name: p.name,
    stage: p.stage,
    growth: String(p.growth),
    items: String(p.items),
    kinds: String(p.kinds),
    collected: p.collected,
    coins: String(p.coins)
  };
  switch (WEBHOOK.provider){
    case 'web3forms':  return { ...base, access_key:WEBHOOK.accessKey, subject:WEBHOOK.subject,
                                from_name:CONFIG.brandName, replyto:p.email };
    case 'formspree':  return { ...base, _subject:WEBHOOK.subject, _replyto:p.email };
    case 'formsubmit': return { ...base, _subject:WEBHOOK.subject, _template:'table', _captcha:'false' };
    default:           return base;
  }
}
function postLead(p){
  if (!WEBHOOK.url) return Promise.resolve({ ok:false, reason:'no-url' });
  const data = buildBody(p);

  if (!isFormTransport()){
    // CORS 헤더를 제대로 주는 폼 서비스들은 JSON 그대로
    const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = ctrl ? setTimeout(() => ctrl.abort(), WEBHOOK.timeoutMs) : 0;
    return fetch(WEBHOOK.url, {
        method:'POST',
        headers:{ 'Content-Type':'application/json', 'Accept':'application/json' },
        body: JSON.stringify(data),
        signal: ctrl ? ctrl.signal : undefined
      })
      .then(res => ({ ok:res.ok, status:res.status }))
      .catch(e => ({ ok:false, reason: e && e.name === 'AbortError' ? 'timeout' : 'network' }))
      .finally(() => { if (timer) clearTimeout(timer); });
  }

  // preflight 가 생기지 않는 단순 요청(form-urlencoded)
  const body = new URLSearchParams(data).toString();
  const TYPE = 'application/x-www-form-urlencoded;charset=UTF-8';
  return fetch(WEBHOOK.url, {
      method:'POST', headers:{ 'Content-Type':TYPE }, body, keepalive:true
    })
    .then(res => ({ ok:res.ok, status:res.status }))
    .catch(() => {
      // CORS 로 응답을 못 읽었을 뿐 요청은 갔을 수 있다 → sendBeacon 으로 한 번 더.
      // 성공하면 'sent' 로 보고 재전송 큐에 넣지 않는다 (중복 발송 방지)
      try {
        const sent = navigator.sendBeacon &&
                     navigator.sendBeacon(WEBHOOK.url, new Blob([body], { type:TYPE }));
        return sent ? { ok:true, via:'beacon' } : { ok:false, reason:'network' };
      } catch(e){ return { ok:false, reason:'network' }; }
    });
}

/* 전송 실패분은 기기에 쌓아두고 연결되면 자동 재시도 (부스 와이파이는 자주 끊긴다) */
function outboxLoad(){ try { return JSON.parse(localStorage.getItem(STORE_OUTBOX) || '[]'); } catch(e){ return []; } }
function outboxSave(a){ try { localStorage.setItem(STORE_OUTBOX, JSON.stringify(a.slice(-100))); } catch(e){} }
function outboxAdd(p){ const a = outboxLoad(); a.push(p); outboxSave(a); }
let outboxBusy = false;
function outboxFlush(){
  if (outboxBusy || !WEBHOOK.url) return;
  if (navigator.onLine === false) return;
  const queue = outboxLoad();
  if (!queue.length) return;
  outboxBusy = true;
  const rest = [];
  const step = i => {
    if (i >= queue.length){ outboxSave(rest); outboxBusy = false; return; }
    const item = queue[i];
    postLead(item).then(r => {
      if (!r.ok){
        item.tries = (item.tries || 0) + 1;
        if (item.tries < 5) rest.push(item);   // 5회까지만 재시도 (설정 오류로 무한 반복 방지)
      }
      step(i + 1);
    });
  };
  step(0);
}
/* 페이지가 닫히거나 백그라운드로 갈 때의 마지막 기회.
   fetch 는 이때 중단되지만 sendBeacon 은 브라우저가 대신 끝까지 보내준다. */
function outboxBeacon(){
  if (!WEBHOOK.url || !navigator.sendBeacon) return;
  const queue = outboxLoad();
  if (!queue.length) return;
  const TYPE = 'application/x-www-form-urlencoded;charset=UTF-8';
  const left = [];
  for (const item of queue){
    let sent = false;
    try {
      const body = new URLSearchParams(buildBody(item)).toString();
      sent = navigator.sendBeacon(WEBHOOK.url, new Blob([body], { type:TYPE }));
    } catch(e){}
    if (!sent) left.push(item);
  }
  outboxSave(left);
}
window.addEventListener('pagehide', outboxBeacon);
document.addEventListener('visibilitychange', () => { if (document.hidden) outboxBeacon(); });
setInterval(outboxFlush, WEBHOOK.retrySec * 1000);
window.addEventListener('online', outboxFlush);
outboxFlush();

function share(){
  const emojis = CONFIG.products.filter(p => G.col.has(p.id)).map(p => p.emoji).join('');
  const st = CONFIG.stages[G.stageIdx];
  const text = `SUPER ${CONFIG.brandName}에서 60초 만에 ${st.title}까지 성장! ${emojis} · ${G.percent}% 할인 당첨 🎉`;
  if (navigator.share) navigator.share({ title:CONFIG.brandName, text }).catch(() => {});
  else if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => toast('결과가 복사되었어요!'), () => toast(text));
  else toast(text);
}
let toastT = 0;
function toast(msg){
  el.toast.textContent = msg; el.toast.classList.add('on');
  clearTimeout(toastT); toastT = setTimeout(() => el.toast.classList.remove('on'), 1900);
}

/* ---------------- 20. 대기 화면 ---------------- */
function renderAttract(){
  el.ladder.innerHTML = CONFIG.stages.map((s, i) =>
    `<div class="step"><canvas width="48" height="66" data-i="${i}"></canvas><b>${s.title}</b><span>${s.percent}%</span></div>`).join('');
  el.ladder.querySelectorAll('canvas').forEach(c => drawPortrait(c, +c.dataset.i));
  el.lineup.innerHTML = CONFIG.products.map(p => {
    const tag = p.rarity === 'legendary' ? '<span class="r legendary">+3</span>'
              : p.rarity === 'rare' ? '<span class="r">+2</span>' : '';
    return `<div class="it" style="--c:${p.color}"><div class="e" style="animation-delay:${(Math.random() * 1.2).toFixed(2)}s">${p.emoji}</div>${p.short}${tag}</div>`;
  }).join('');
}
renderAttract();

let tickIdx = 0;
function updateTicker(){
  const day = loadRuns();
  if (!day.length){ el.ticker.hidden = true; return; }
  const e = day[tickIdx++ % Math.min(day.length, 10)];
  const st = CONFIG.stages[e.lv];
  el.ticker.hidden = false;
  el.ticker.textContent = `✨ 방금 한 분이 ${st.title}까지 승진 · ${st.percent}% 당첨! (오늘 ${day.length}명 참여)`;
  el.ticker.style.animation = 'none'; void el.ticker.offsetWidth; el.ticker.style.animation = '';
}
setInterval(() => { if (state === S.ATTRACT) updateTicker(); }, 3200);
updateTicker();

/* ---------------- 21. 메인 루프 ---------------- */
let last = performance.now();
function loop(now){
  // 첫 rAF 타임스탬프는 스크립트 로드 시각보다 이를 수 있다 → 음수 dt 방지
  const dt = clamp((now - last) / 1000, 0, 0.05);
  last = now;

  if (state === S.ATTRACT || state === S.PLAY || state === S.FINISH) updateWorld(dt, now);
  if (state === S.FINISH){
    G.finishT -= dt;
    if (G.finishT <= 0) endGame();
  }
  updateEffects(dt);
  render(now);

  if (state === S.RESULT){
    const ms = G.couponEnd - Date.now();
    if (ms > 0){
      const m = Math.floor(ms / 60000), s = Math.floor((ms % 60000) / 1000);
      el.rExpire.textContent = `${m}:${String(s).padStart(2, '0')}`;
    } else { el.rExpire.textContent = '만료'; el.coupon.classList.add('dead'); }
    if (!AUTOPLAY && performance.now() - G.idleAt > CONFIG.idleReturn * 1000) toAttract();
  }
  requestAnimationFrame(loop);
}

['pointerdown', 'keydown', 'scroll'].forEach(t =>
  el.scResult.addEventListener(t, () => { G.idleAt = performance.now(); }, { passive:true }));
document.addEventListener('visibilitychange', () => {
  last = performance.now();
  if (document.hidden){
    if (music.mode === 'synth'){ music.on = false; clearInterval(music.timer); }
    if (music.el && !music.el.paused) music.el.pause();
  } else if (state === S.PLAY){
    if (music.mode === 'file' && music.el) music.el.play().catch(() => {});
    else if (music.mode === 'synth') synthStart();
  }
});

resetRun();
requestAnimationFrame(loop);
if (AUTOPLAY) startCountdown();
