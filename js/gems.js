/**
 * gems.js — 宝石类型、特殊宝石、皮肤系统
 */
'use strict';

const Gems = (() => {
  // 7 base gem types
  const TYPES = [
    { id: 'mango',      name: '芒果', emoji: '🥭', c1: '#FFD93D', c2: '#FF9F1C', glow: '#FFE066' },
    { id: 'strawberry',  name: '草莓', emoji: '🍓', c1: '#FF6B6B', c2: '#EE4444', glow: '#FF8888' },
    { id: 'blueberry',   name: '蓝莓', emoji: '🫐', c1: '#748FFC', c2: '#5C5CE0', glow: '#95A8FF' },
    { id: 'orange',      name: '橙子', emoji: '🍊', c1: '#FFA94D', c2: '#FF7828', glow: '#FFB86C' },
    { id: 'grape',       name: '葡萄', emoji: '🍇', c1: '#B197FC', c2: '#8B5CF6', glow: '#C4B5FD' },
    { id: 'kiwi',        name: '猕猴桃', emoji: '🥝', c1: '#69DB7C', c2: '#40C057', glow: '#8CE99A' },
    { id: 'peach',       name: '蜜桃', emoji: '🍑', c1: '#FCC2D7', c2: '#F06595', glow: '#FFDEEB' }
  ];

  // Special gem types created by matching patterns
  const SPECIALS = {
    LINE_H:  { id: 'line_h',  name: '横向闪电', symbol: '⚡', desc: '清除整行' },
    LINE_V:  { id: 'line_v',  name: '纵向闪电', symbol: '⚡', desc: '清除整列' },
    BOMB:    { id: 'bomb',    name: '爆破宝石', symbol: '💥', desc: '清除3×3区域' },
    RAINBOW: { id: 'rainbow', name: '彩虹宝石', symbol: '🌈', desc: '清除所有同色宝石' }
  };

  // Obstacle types
  const OBSTACLES = {
    ICE:   { id: 'ice',   name: '冰块', hp: 2, symbol: '🧊' },
    STONE: { id: 'stone', name: '石头', hp: -1, symbol: '🪨' },  // -1 = immovable
    VINE:  { id: 'vine',  name: '藤蔓', hp: 1, symbol: '🌿', spreads: true }
  };

  // Create a gem cell
  function createGem(typeIndex, special) {
    return {
      type: typeIndex,        // 0-6 base type
      special: special || null,  // null | 'line_h' | 'line_v' | 'bomb' | 'rainbow'
      obstacle: null,         // null | { id, hp }
      marked: false           // for match detection
    };
  }

  // Create obstacle cell
  function createObstacle(obstacleId) {
    const obs = OBSTACLES[obstacleId.toUpperCase()];
    if (!obs) return null;
    return {
      type: null,
      special: null,
      obstacle: { id: obs.id, hp: obs.hp, maxHp: Math.abs(obs.hp) },
      marked: false
    };
  }

  // Determine special gem from match pattern
  function getSpecialFromMatch(matchCells, swapDir) {
    const count = matchCells.length;
    if (count >= 5) return 'rainbow';

    // Check for L or T shape
    if (count >= 5) return 'rainbow';

    // Check shapes
    const rows = new Set(matchCells.map(c => c.row));
    const cols = new Set(matchCells.map(c => c.col));

    // L/T shape: spans both rows and cols with enough cells
    if (rows.size >= 2 && cols.size >= 2 && count >= 5) return 'bomb';
    if (rows.size >= 2 && cols.size >= 2 && count >= 4) return 'bomb';

    if (count === 4) {
      // Line special: depends on match direction
      if (rows.size === 1) return 'line_v'; // horizontal match → creates vertical line
      if (cols.size === 1) return 'line_h'; // vertical match → creates horizontal line
      return swapDir === 'h' ? 'line_v' : 'line_h';
    }

    return null; // 3-match, no special
  }

  // Gem skins
  const SKINS = {
    fruit:   { name: '经典水果', unlocked: true },
    ocean:   { name: '海洋主题', unlocked: false, requirement: '完成海洋岛' },
    space:   { name: '太空主题', unlocked: false, requirement: '完成星空岛' },
    neon:    { name: '霓虹主题', unlocked: false, requirement: '累计10000分' },
    newyear: { name: '新年主题', unlocked: false, requirement: '春节期间登录' }
  };

  // Draw a gem on canvas
  function drawGem(ctx, x, y, size, gem, scale, alpha, time) {
    if (!gem || gem.type === null || gem.type === undefined) return;
    if (alpha <= 0 || scale <= 0) return;

    const g = TYPES[gem.type];
    if (!g) return;

    const cx = x + size / 2;
    const cy = y + size / 2;
    const r = size * 0.38 * scale;

    ctx.save();
    ctx.globalAlpha = alpha;

    // Shadow
    ctx.beginPath();
    ctx.arc(cx + 1, cy + 2, r * 0.92, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.fill();

    // Main gradient
    const grad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.05, cx, cy, r);
    grad.addColorStop(0, g.c1);
    grad.addColorStop(1, g.c2);
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // Inner sheen
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.82, 0, Math.PI * 2);
    const inner = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.2, r * 0.05, cx, cy, r * 0.82);
    inner.addColorStop(0, 'rgba(255,255,255,0.25)');
    inner.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = inner;
    ctx.fill();

    // Highlight
    ctx.beginPath();
    ctx.ellipse(cx - r * 0.2, cy - r * 0.22, r * 0.32, r * 0.22, -0.3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fill();

    // Small dot
    ctx.beginPath();
    ctx.arc(cx - r * 0.35, cy - r * 0.35, r * 0.08, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fill();

    // Emoji overlay (small, centered)
    ctx.font = `${Math.round(size * 0.32 * scale)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(g.emoji, cx, cy + 1);

    // Special gem indicator
    if (gem.special) {
      drawSpecialIndicator(ctx, cx, cy, r, gem.special, time || 0);
    }

    // Obstacle overlay
    if (gem.obstacle) {
      drawObstacleOverlay(ctx, x, y, size, gem.obstacle);
    }

    // Subtle pulsing glow for idle state
    if (time && !gem.special) {
      const pulse = Math.sin(time * 0.002 + gem.type * 0.7) * 0.08;
      if (pulse > 0) {
        ctx.beginPath();
        ctx.arc(cx, cy, r + 3, 0, Math.PI * 2);
        ctx.fillStyle = g.glow.replace(')', `,${pulse})`).replace('rgb', 'rgba');
        ctx.fill();
      }
    }

    ctx.restore();
  }

  function drawSpecialIndicator(ctx, cx, cy, r, special, time) {
    const pulse = 0.5 + 0.5 * Math.sin(time * 0.004);
    ctx.save();

    switch (special) {
      case 'line_h':
        ctx.strokeStyle = `rgba(255,255,100,${0.6 + 0.3 * pulse})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - r * 0.7, cy);
        ctx.lineTo(cx + r * 0.7, cy);
        ctx.stroke();
        // Arrow heads
        ctx.beginPath();
        ctx.moveTo(cx - r * 0.7, cy - 3); ctx.lineTo(cx - r * 0.9, cy); ctx.lineTo(cx - r * 0.7, cy + 3);
        ctx.moveTo(cx + r * 0.7, cy - 3); ctx.lineTo(cx + r * 0.9, cy); ctx.lineTo(cx + r * 0.7, cy + 3);
        ctx.stroke();
        break;
      case 'line_v':
        ctx.strokeStyle = `rgba(255,255,100,${0.6 + 0.3 * pulse})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy - r * 0.7);
        ctx.lineTo(cx, cy + r * 0.7);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx - 3, cy - r * 0.7); ctx.lineTo(cx, cy - r * 0.9); ctx.lineTo(cx + 3, cy - r * 0.7);
        ctx.moveTo(cx - 3, cy + r * 0.7); ctx.lineTo(cx, cy + r * 0.9); ctx.lineTo(cx + 3, cy + r * 0.7);
        ctx.stroke();
        break;
      case 'bomb':
        ctx.strokeStyle = `rgba(255,140,0,${0.5 + 0.4 * pulse})`;
        ctx.lineWidth = 2;
        const br = r * 0.65;
        ctx.beginPath();
        ctx.arc(cx, cy, br, 0, Math.PI * 2);
        ctx.stroke();
        // Cross
        ctx.beginPath();
        ctx.moveTo(cx - br * 0.5, cy - br * 0.5); ctx.lineTo(cx + br * 0.5, cy + br * 0.5);
        ctx.moveTo(cx + br * 0.5, cy - br * 0.5); ctx.lineTo(cx - br * 0.5, cy + br * 0.5);
        ctx.stroke();
        break;
      case 'rainbow':
        // Rotating rainbow ring
        const angle = (time || 0) * 0.003;
        const colors = ['#FF0000', '#FF8800', '#FFFF00', '#00FF00', '#0088FF', '#8800FF'];
        for (let i = 0; i < colors.length; i++) {
          const a = angle + (Math.PI * 2 * i) / colors.length;
          const segLen = Math.PI * 2 / colors.length;
          ctx.beginPath();
          ctx.arc(cx, cy, r * 0.85, a, a + segLen);
          ctx.strokeStyle = colors[i];
          ctx.lineWidth = 2.5;
          ctx.globalAlpha = 0.6 + 0.3 * pulse;
          ctx.stroke();
        }
        break;
    }
    ctx.restore();
  }

  function drawObstacleOverlay(ctx, x, y, size, obstacle) {
    ctx.save();
    ctx.globalAlpha = 0.5;
    if (obstacle.id === 'ice') {
      ctx.fillStyle = obstacle.hp > 1 ? 'rgba(173,216,230,0.6)' : 'rgba(173,216,230,0.3)';
      roundRect(ctx, x + 2, y + 2, size - 4, size - 4, 8);
      ctx.fill();
      // Crack lines for damaged ice
      if (obstacle.hp <= 1) {
        ctx.strokeStyle = 'rgba(255,255,255,0.8)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + size * 0.3, y + size * 0.2);
        ctx.lineTo(x + size * 0.5, y + size * 0.5);
        ctx.lineTo(x + size * 0.7, y + size * 0.4);
        ctx.stroke();
      }
    } else if (obstacle.id === 'stone') {
      ctx.fillStyle = 'rgba(120,120,120,0.7)';
      roundRect(ctx, x + 2, y + 2, size - 4, size - 4, 8);
      ctx.fill();
      ctx.font = `${size * 0.4}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.globalAlpha = 0.8;
      ctx.fillText('🪨', x + size / 2, y + size / 2);
    } else if (obstacle.id === 'vine') {
      ctx.strokeStyle = 'rgba(34,139,34,0.5)';
      ctx.lineWidth = 2;
      // Vine tendrils
      ctx.beginPath();
      ctx.moveTo(x + 4, y + size / 2);
      ctx.quadraticCurveTo(x + size / 2, y + 4, x + size - 4, y + size / 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + size / 2, y + 4);
      ctx.quadraticCurveTo(x + size - 4, y + size / 2, x + size / 2, y + size - 4);
      ctx.stroke();
    }
    ctx.restore();
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(x, y, w, h, r);
    } else {
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }
  }

  return {
    TYPES,
    SPECIALS,
    OBSTACLES,
    SKINS,
    createGem,
    createObstacle,
    getSpecialFromMatch,
    drawGem,
    drawObstacleOverlay,
    COUNT: TYPES.length
  };
})();
