/**
 * audio.js — 音效系统
 * Web Audio API 生成简洁音效
 */
'use strict';

const Audio = (() => {
  const ACx = window.AudioContext || window.webkitAudioContext;
  let audioCtx = null;
  let enabled = true;

  function init() {
    if (!audioCtx) {
      try { audioCtx = new ACx(); } catch (e) { /* no audio */ }
    }
  }

  function setEnabled(v) { enabled = v; }
  function isEnabled() { return enabled; }

  function playTone(freq, dur, type, vol) {
    if (!enabled || !audioCtx) return;
    type = type || 'sine';
    vol = vol || 0.3;
    try {
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.connect(g); g.connect(audioCtx.destination);
      o.frequency.value = freq; o.type = type;
      g.gain.setValueAtTime(vol, audioCtx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + dur);
      o.start(audioCtx.currentTime);
      o.stop(audioCtx.currentTime + dur);
    } catch (e) { /* ignore audio errors */ }
  }

  function playMatch() {
    playTone(523, 0.1);
    setTimeout(() => playTone(659, 0.1), 50);
    setTimeout(() => playTone(784, 0.15), 100);
  }

  function playCombo(n) {
    const b = 400 + n * 50;
    playTone(b, 0.1, 'square', 0.2);
    setTimeout(() => playTone(b * 1.25, 0.1, 'square', 0.2), 80);
    setTimeout(() => playTone(b * 1.5, 0.2, 'square', 0.25), 160);
  }

  function playLevelUp() {
    [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => playTone(f, 0.2, 'sine', 0.3), i * 100));
  }

  function playFail() {
    playTone(300, 0.3, 'sawtooth', 0.2);
    setTimeout(() => playTone(250, 0.4, 'sawtooth', 0.2), 200);
  }

  function playSwap() { playTone(440, 0.08, 'sine', 0.15); }
  function playInvalid() { playTone(200, 0.15, 'square', 0.1); }
  function playSelect() { playTone(660, 0.06, 'sine', 0.12); }

  function playPlant() {
    playTone(440, 0.1, 'sine', 0.2);
    setTimeout(() => playTone(554, 0.1, 'sine', 0.2), 80);
    setTimeout(() => playTone(659, 0.15, 'sine', 0.25), 160);
  }

  function playHarvest() {
    [659, 784, 880, 1047].forEach((f, i) => setTimeout(() => playTone(f, 0.15, 'sine', 0.25), i * 80));
  }

  function playCraft() {
    playTone(330, 0.1, 'triangle', 0.2);
    setTimeout(() => playTone(440, 0.1, 'triangle', 0.2), 100);
    setTimeout(() => playTone(660, 0.15, 'triangle', 0.25), 200);
  }

  function playAchievement() {
    [523, 659, 784, 1047, 1319].forEach((f, i) => setTimeout(() => playTone(f, 0.2, 'sine', 0.3), i * 80));
  }

  return {
    init, setEnabled, isEnabled,
    playMatch, playCombo, playLevelUp, playFail,
    playSwap, playInvalid, playSelect,
    playPlant, playHarvest, playCraft, playAchievement
  };
})();
