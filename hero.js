/* ============================================================
   주인공 픽셀 스프라이트 — 20×32 그리드 + 자동 외곽선
   ------------------------------------------------------------
   레이어를 겹쳐 조합한다: 뒷머리 → 몸(단계별 의상) → 다리(포즈) → 머리(헤어) → 액세서리
   완성된 프레임은 오프스크린 캔버스로 캐시해 매 프레임 drawImage 한 번만 한다.

   키: H 머리 · h 머리 하이라이트 · d 머리 그림자 · S 피부 · s 피부 그림자
       E 눈 · w 흰색(눈 반사광/칼라) · b 볼터치 · L 입술 · o 외곽선색(눈 감기)
       T/t 상의 · J/j 재킷·코트 · B/n 하의 · Q 골반(하의/코트/드레스 자락)
       P/p 다리 · K/k 신발 · A/a 가방 · G 선글라스 · C/c 골드 · X 포인트 컬러
   ============================================================ */

const RAINBOW = ['#ff4f9a', '#ffd23f', '#3ee6c1', '#48b8ff', '#a57bff'];

const HERO_GRID = { w:20, h:32, bodyRows:30 };   // 위 2줄은 티아라 공간

const HEAD = {
  pony: [
    '.......HHHHHH.......',
    '.....HHHhhHHHHH.....',
    '....HHhhHHHHHHHH....',
    '..XHHhHHHHHHHHHHH...',
    '.HHHHHHHHHHHHHHHHH..',
    'HHdHHHHHHHSHHHSHHH..',
    'Hd.dHHHSSSSSSSSSSH..',
    'H..dHHSSSSSSSSSSSS..',
    'd..dHHSSwESSSSwESS..',
    '...dHHSSEESSSSEESS..',
    '...dHSSbEESSSSEEbS..',
    '....dSSSSSSSLLSSSs..',
    '......sSSSSSSSSSs...',
    '.......ssSSSSss.....'
  ],
  bob: [
    '.......HHHHHH.......',
    '.....HHHhhHHHHH.....',
    '....HHhhHHHHHHHH....',
    '...HHhHHHHHHHHHHH...',
    '...HHHHHHHHHHHHHHH..',
    '..dHHHHHHHSHHHSHHH..',
    '..dHHHHSSSSSSSSSSH..',
    '..dHHHSSSSSSSSSSSS..',
    '..dHHHSSwESSSSwESS..',
    '..dHHHSSEESSSSEESS..',
    '..dHHSSbEESSSSEEbS..',
    '..ddHSSSSSSSLLSSSs..',
    '...ddHsSSSSSSSSSs...',
    '.......ssSSSSss.....'
  ]
};
const BACK_HAIR = [           // 긴 머리: 어깨 뒤로 흘러내림 (grid 14행부터)
  '.dHHH...............',
  '.dHHHH..............',
  '.dHhHH..............',
  '..dHHH..............',
  '..dHhH..............',
  '..ddHH..............',
  '...dH...............',
  '....d...............'
];

const BODY = [
  [ // 신입 — 흰 티셔츠 + 사원증 + 청바지
    '.........sSs........',
    '......TTTTTTTTT.....',
    '.....TTTTTXTTTTT....',
    '.....TtTTTXTTTtT....',
    '.....StTTXXTTTtS....',
    '.....StTTXXTTTtS....',
    '.....sTTTTTTTTTs....',
    '......BBBBBBBBB.....',
    '......BBBBnBBBB.....',
    '......BBBnnnBBB.....'
  ],
  [ // 대리 — 칼라 블라우스 + 펜슬 스커트
    '.........sSs........',
    '......TwwTTTwwT.....',
    '.....TTTwwTwwTTT....',
    '.....TtTTTXTTTtT....',
    '.....StTTTTTTTtS....',
    '.....StTTTXTTTtS....',
    '.....sBBBBBBBBBs....',
    '......BBBBBBBBB.....',
    '......BBBBnBBBB.....',
    '......BnBBBBBnB.....'
  ],
  [ // 과장 — 핑크 블레이저 + 핸드백
    '.........sSs........',
    '......JJTTTTTJJ.....',
    '.....JJJJTTTJJJJ....',
    '.....JjJJTTTJJjJ....',
    '.....JjJJJXJJJjJ....',
    '.....JjJJJJJJJjJ....',
    '.....sJJJJXJJJJsA...',
    '......BBBBBBBBBAAA..',
    '......BBBBnBBBBAaA..',
    '......BnBBBBBnBAAA..'
  ],
  [ // 팀장 — 벨트 트렌치코트 + 가죽 백
    '.........sSs........',
    '......JJTTTTTJJ.....',
    '.....JJJJTTTJJJJ....',
    '.....JjJJJTJJJjJ....',
    '.....JjJJJJJJJjJ....',
    '.....JjXXXXXXXjJ....',
    '.....sJJJJjJJJJsA...',
    '......JJJJjJJJJAAA..',
    '.....JJJJJjJJJJAaA..',
    '.....JjJJJjJJJjAAA..'
  ],
  [ // 대표 — 드레스 + 골드 목걸이·벨트·클러치
    '.........sSs........',
    '......SSCCCCCSS.....',
    '.....SSTTTXTTTSS....',
    '.....STTTTTTTTTS....',
    '.....StTTTTTTTtS....',
    '.....StCCCCCCCtS....',
    '.....sTTTTTTTTTsC...',
    '......TTTTtTTTTCCC..',
    '.....TTTTTtTTTTCcC..',
    '....TTTtTTTTTtTTT...'
  ]
];

const LEGS = {
  stand: [
    '......QQQQQQQQQ.....',
    '.......PP..PP.......',
    '.......Pp..Pp.......',
    '.......Pp..Pp.......',
    '.......KKK.KKK......',
    '.......kkk.kkk......'
  ],
  runA: [
    '......QQQQQQQQQ.....',
    '......PP...PPP......',
    '.....PP.....PP......',
    '....PP.......Pp.....',
    '...KKK........KKK...',
    '...kk.........kkk...'
  ],
  runB: [
    '......QQQQQQQQQ.....',
    '.......PPPPP........',
    '......PP..PP........',
    '.....KK...PP........',
    '.....k....KKK.......',
    '..........kkk.......'
  ],
  jump: [
    '......QQQQQQQQQ.....',
    '.......PP..PPPP.....',
    '......PP.....KKK....',
    '.....PP.......kk....',
    '....KKK.............',
    '....kk..............'
  ]
};

const GLASSES = [             // grid 10행 — 눈 위치
  '.......GwGGGGGwGG...',
  '.......GGGG..GGGG...',
  '.......GGGG..GGGG...'
];
const TIARA = [               // grid 0행
  '.........C..........',
  '.......C.CXC.C......',
  '.......CcCCCcC......'
];

const HERO_BASE_PAL = { o:'#2b1b30', S:'#ffe3d1', s:'#f0b59c', E:'#2b1b30', w:'#ffffff', b:'#ffa3b5' };
const HERO_STAGE_PAL = [
  { hair:'pony', H:'#4a2f27', h:'#7a5245', d:'#2e1c18', X:'#3f8cff', L:'#e88a8a',
    T:'#ffffff', t:'#d5d9e6', B:'#4a6fb5', n:'#34508a', Q:'#4a6fb5', P:'#4a6fb5', p:'#34508a', K:'#ffffff', k:'#b9bfcf' },
  { hair:'pony', H:'#4a2f27', h:'#7a5245', d:'#2e1c18', X:'#ffffff', L:'#e8324a',
    T:'#ffb3c8', t:'#f08aa8', B:'#2c2a40', n:'#1c1a2c', Q:'#2c2a40', P:'#ffd8c4', p:'#f0b59c', K:'#2b1b30', k:'#11101a' },
  { hair:'bob',  H:'#5c3a2e', h:'#8a5d4a', d:'#38221a', X:'#ffd23f', L:'#e8324a',
    T:'#ffffff', t:'#e2e2ea', J:'#ff5a9c', j:'#d93a7c', B:'#2b2840', n:'#1b1a2a', Q:'#2b2840',
    P:'#ffd8c4', p:'#f0b59c', K:'#2b1b30', k:'#000000', A:'#7a4bff', a:'#5a2fd6' },
  { hair:'long', glasses:true, H:'#8a5a3b', h:'#b9835c', d:'#5a3622', X:'#6b4226', L:'#d81b4a',
    T:'#fff3e0', t:'#e9d8bf', J:'#d9a86c', j:'#b3834a', Q:'#d9a86c', G:'#1b1b22',
    P:'#ffd8c4', p:'#f0b59c', K:'#ff2d55', k:'#c0103a', A:'#8b4f2a', a:'#6b3a1e' },
  { hair:'long', tiara:true, H:'#3a2320', h:'#6a4238', d:'#241412', X:'#ff4f9a', L:'#d81b4a',
    T:'#8a3dff', t:'#6a24d6', C:'#ffd23f', c:'#d9a300', Q:'#8a3dff',
    P:'#ffd8c4', p:'#f0b59c', K:'#ffc93c', k:'#d9a300' }
];

function heroGrid(idx, pose, blink){
  const st = HERO_STAGE_PAL[idx];
  const grid = Array.from({ length:HERO_GRID.h }, () => Array(HERO_GRID.w).fill('.'));
  const stamp = (rows, top) => rows.forEach((row, r) => {
    for (let c = 0; c < HERO_GRID.w; c++) if (row[c] !== '.') grid[top + r][c] = row[c];
  });
  if (st.hair === 'long') stamp(BACK_HAIR, 14);
  stamp(BODY[idx], 16);
  stamp(LEGS[pose] || LEGS.stand, 26);
  stamp(st.hair === 'pony' ? HEAD.pony : HEAD.bob, 2);
  if (blink && !st.glasses){
    for (let c = 0; c < HERO_GRID.w; c++){          // 눈 3줄 → 위 2줄은 피부, 아래 줄은 감은 눈선
      if (grid[10][c] === 'w' || grid[10][c] === 'E') grid[10][c] = 'S';
      if (grid[11][c] === 'E') grid[11][c] = 'S';
      if (grid[12][c] === 'E') grid[12][c] = 'o';
    }
  }
  if (st.glasses) stamp(GLASSES, 10);
  if (st.tiara) stamp(TIARA, 0);
  return grid;
}

const heroCache = new Map();
function heroSprite(idx, pose, blink, rainbow){
  const key = `${idx}|${pose}|${blink ? 1 : 0}|${rainbow == null ? '-' : rainbow % 5}`;
  let cv = heroCache.get(key);
  if (cv) return cv;

  const pal = Object.assign({}, HERO_BASE_PAL, HERO_STAGE_PAL[idx]);
  if (rainbow != null){                             // 💸 러시: 옷 색이 무지개로 바뀐다
    const r = rainbow % 5;
    pal.T = pal.t = RAINBOW[r];
    pal.J = pal.j = RAINBOW[(r + 1) % 5];
    pal.B = pal.n = pal.Q = RAINBOW[(r + 2) % 5];
  }
  const grid = heroGrid(idx, pose, blink);
  const PAD = 1, cw = HERO_GRID.w + PAD * 2, ch = HERO_GRID.h + PAD * 2;
  cv = document.createElement('canvas');
  cv.width = cw; cv.height = ch;
  const c = cv.getContext('2d');
  const filled = (x, y) => y >= 0 && y < HERO_GRID.h && x >= 0 && x < HERO_GRID.w && grid[y][x] !== '.';

  // 1) 외곽선 — 비어 있는 칸 중 상하좌우에 픽셀이 있으면 외곽선색
  c.fillStyle = pal.o;
  for (let y = -PAD; y < HERO_GRID.h + PAD; y++)
    for (let x = -PAD; x < HERO_GRID.w + PAD; x++)
      if (!filled(x, y) && (filled(x - 1, y) || filled(x + 1, y) || filled(x, y - 1) || filled(x, y + 1)))
        c.fillRect(x + PAD, y + PAD, 1, 1);

  // 2) 본체
  for (let y = 0; y < HERO_GRID.h; y++)
    for (let x = 0; x < HERO_GRID.w; x++){
      const k = grid[y][x];
      if (k === '.') continue;
      c.fillStyle = pal[k] || '#ff00ff';
      c.fillRect(x + PAD, y + PAD, 1, 1);
    }
  heroCache.set(key, cv);
  return cv;
}

/* heightPx = 머리 꼭대기~발바닥(30줄) 높이. bottom = 발이 닿는 y */
function drawHero(c, cx, bottom, heightPx, idx, pose, opt = {}){
  const px = heightPx / HERO_GRID.bodyRows;
  const cv = heroSprite(idx, pose, opt.blink, opt.rainbow);
  const w = cv.width * px, h = cv.height * px;
  const prev = c.imageSmoothingEnabled;
  c.imageSmoothingEnabled = false;
  c.drawImage(cv, Math.round(cx - w / 2), Math.round(bottom - h), Math.round(w), Math.round(h));
  c.imageSmoothingEnabled = prev;
}
