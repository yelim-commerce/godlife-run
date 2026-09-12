import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../style.css', import.meta.url), 'utf8');
const js = readFileSync(new URL('../game.js', import.meta.url), 'utf8');

test('쿠폰팝과 같은 Make 웹훅을 form-urlencoded 로 보낸다', () => {
  assert.match(js, /url: 'https:\/\/hook\.eu1\.make\.com\/iv6p47wuoc7rqnh1fb8884y0n5l6buuf'/);
  assert.match(js, /provider: 'make'/);
  assert.match(js, /application\/x-www-form-urlencoded/);
  assert.match(js, /source: 'godlife-run-game'/);
});

test('기존 시나리오 필드명을 그대로 보낸다', () => {
  for (const f of ['date', 'time', 'email', 'code', 'score', 'cleared', 'discount', 'agreedAt', 'source', 'name']){
    assert.match(js, new RegExp(`\\b${f}:`), `필드 ${f} 누락`);
  }
});

test('이름과 이메일, 동의가 모두 필수다', () => {
  assert.match(js, /id="leadName"/);
  assert.match(js, /id="leadEmail"/);
  assert.match(js, /if \(!name\)\{ toast\('이름을 입력해 주세요'\)/);
  assert.match(js, /if \(!agree\)/);
});

test('실패한 응모는 큐에 쌓고 페이지를 떠날 때 sendBeacon 으로 보낸다', () => {
  assert.match(js, /STORE_OUTBOX/);
  assert.match(js, /addEventListener\('pagehide', outboxBeacon\)/);
});

test('음원 파일이 있고, 없으면 합성으로 폴백한다', () => {
  assert.match(js, /src:'audio\/entertainer-v2\.mp3'/);
  assert.ok(existsSync(new URL('../audio/entertainer-v2.mp3', import.meta.url)));
  assert.match(js, /music\.fileBroken = true/);
  assert.match(js, /synthStart\(\)/);
});

test('성장 단계 5개와 할인율이 순서대로 오른다', () => {
  const mins = [...js.matchAll(/min:(\d+),\s+look:/g)].map(m => +m[1]);
  const pcts = [...js.matchAll(/percent:(\d+),\s+perk:/g)].map(m => +m[1]);
  assert.equal(mins.length, 5);
  assert.deepEqual([...mins].sort((a, b) => a - b), mins);
  assert.deepEqual([...pcts].sort((a, b) => a - b), pcts);
});

test('HUD · 결과 화면 요소가 연결되어 있다', () => {
  for (const id of ['hud', 'growthFill', 'collection', 'rHero', 'rColGrid', 'leadBox', 'coupon']){
    assert.match(html, new RegExp(`id="${id}"`));
  }
  assert.match(css, /@media \(max-width:480px\)/);
  assert.match(css, /\.attract\{[^}]*overflow-y:auto[^}]*touch-action:pan-y/s);
});
