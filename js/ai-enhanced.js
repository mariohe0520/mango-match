// 🥭 消消乐AI增强
// 目标: 够萌！有趣！

// 角色列表
const CHARACTERS = [
  { emoji: '🥭', name: '芒果', color: '#ff9f43' },
  { emoji: '🍊', name: '橙子', color: '#ff6b6b' },
  { emoji: '🍋', name: '柠檬', color: '#feca57' },
  { emoji: '🍇', name: '葡萄', color: '#a55eea' },
  { emoji: '🍓', name: '草莓', color: '#ff4757' },
  { emoji: '🍑', name: '桃子', color: '#ff9ff3' },
  { emoji: '🥝', name: '猕猴桃', color: '#2ed573' },
  { emoji: '🍒', name: '樱桃', color: '#ff6348' }
];

// 消除特效
const EFFECTS = {
  match: ['✨', '⭐', '💫', '🌟'],
  super: ['🎆', '💥', '🧨', '🔥'],
  bomb: ['💣', '☄️', '🌋', '💥']
};

// 随机语音
const VOICES = {
  match: ['好棒！', 'nice！', '完美！', '太棒了！'],
  super: ['超级棒！', '无敌！', '最强！', '发了！'],
  fail: ['哎呀！', '差一点！', '再试！', '加油！']
};

function playMatchSound(type) {
  const { exec } = require('child_process');
  const voices = VOICES[type] || VOICES.match;
  const text = voices[Math.floor(Math.random() * voices.length)];
  exec(`say -v Ting-Ting "${text}"`);
}

function showEffect(tile, type) {
  const effects = EFFECTS[type] || EFFECTS.match;
  const emoji = effects[Math.floor(Math.random() * effects.length)];
  
  const el = document.createElement('div');
  el.textContent = emoji;
  el.style.cssText = `
    position: absolute;
    font-size: 40px;
    animation: pop 0.5s ease-out forwards;
    pointer-events: none;
  `;
  tile.appendChild(el);
  setTimeout(() => el.remove(), 500);
}

// 导出
window.MangoAI = {
  characters: CHARACTERS,
  playMatchSound,
  showEffect
};
