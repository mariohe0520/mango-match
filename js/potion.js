/**
 * potion.js — 药水合成系统
 * 收集匹配中的材料 → 合成强力药水
 */
'use strict';

const Potion = (() => {
  // ======== INGREDIENTS ========
  const INGREDIENTS = {
    red:    { name: '红宝石碎片', emoji: '🔴', color: '#FF6B6B' },
    orange: { name: '橙色精华',   emoji: '🟠', color: '#FFA502' },
    green:  { name: '翠绿之叶',   emoji: '🟢', color: '#2ED573' },
    blue:   { name: '蓝色水晶',   emoji: '🔵', color: '#5352ED' },
    purple: { name: '紫色魔粉',   emoji: '🟣', color: '#6C5CE7' },
    yellow: { name: '金色花粉',   emoji: '🟡', color: '#FECA57' },
    pink:   { name: '粉色花瓣',   emoji: '🩷', color: '#FCC2D7' }
  };

  // ======== POTION RECIPES ========
  const RECIPES = {
    shuffle: {
      name: '回旋药水',
      emoji: '🔄',
      desc: '重新排列棋盘上所有宝石',
      color: '#74B9FF',
      recipe: { blue: 3, green: 2 },
      effect: 'shuffle'
    },
    time: {
      name: '时间药水',
      emoji: '⏰',
      desc: '时间关卡中增加15秒',
      color: '#FECA57',
      recipe: { yellow: 3, orange: 2 },
      effect: 'time'
    },
    bomb: {
      name: '爆破药水',
      emoji: '💥',
      desc: '清除棋盘中心3×3区域',
      color: '#FF6B6B',
      recipe: { red: 3, orange: 2 },
      effect: 'bomb'
    },
    rainbow: {
      name: '彩虹药水',
      emoji: '🌈',
      desc: '清除棋盘上一种颜色的所有宝石',
      color: '#A29BFE',
      recipe: { purple: 2, pink: 2, blue: 1 },
      effect: 'rainbow'
    }
  };

  // ======== CRAFTING ========

  function canCraft(data, potionId) {
    const recipe = RECIPES[potionId];
    if (!recipe) return false;

    for (const [ingredient, amount] of Object.entries(recipe.recipe)) {
      if ((data.potions.ingredients[ingredient] || 0) < amount) return false;
    }
    return true;
  }

  function craft(data, potionId) {
    if (!canCraft(data, potionId)) return false;

    const recipe = RECIPES[potionId];
    // Consume ingredients
    for (const [ingredient, amount] of Object.entries(recipe.recipe)) {
      data.potions.ingredients[ingredient] -= amount;
    }

    // Add potion
    data.potions.inventory[potionId] = (data.potions.inventory[potionId] || 0) + 1;
    return true;
  }

  function usePotion(data, potionId) {
    if ((data.potions.inventory[potionId] || 0) <= 0) return false;
    data.potions.inventory[potionId]--;
    return true;
  }

  function getInventory(data) {
    const result = [];
    for (const [id, recipe] of Object.entries(RECIPES)) {
      result.push({
        id,
        ...recipe,
        count: data.potions.inventory[id] || 0,
        canCraft: canCraft(data, id)
      });
    }
    return result;
  }

  function getIngredients(data) {
    const result = [];
    for (const [id, info] of Object.entries(INGREDIENTS)) {
      result.push({
        id,
        ...info,
        count: data.potions.ingredients[id] || 0
      });
    }
    return result;
  }

  // ======== RENDER ========

  function renderPotionPage(container, data) {
    const inventory = getInventory(data);
    const ingredients = getIngredients(data);

    let html = '';

    // Ingredient counts
    html += '<div class="potion-section"><h3 class="section-title">📦 材料库存</h3>';
    html += '<div class="ingredient-grid">';
    ingredients.forEach(ing => {
      html += `<div class="ingredient-item">
        <span class="ingredient-emoji">${ing.emoji}</span>
        <span class="ingredient-count">${ing.count}</span>
        <span class="ingredient-name">${ing.name}</span>
      </div>`;
    });
    html += '</div></div>';

    // Potion inventory & crafting
    html += '<div class="potion-section"><h3 class="section-title">🧪 药水工坊</h3>';
    html += '<div class="potion-list">';
    inventory.forEach(pot => {
      const recipe = RECIPES[pot.id];
      const recipeStr = Object.entries(recipe.recipe)
        .map(([k, v]) => `${INGREDIENTS[k].emoji}×${v}`)
        .join(' + ');

      html += `<div class="potion-card ${pot.canCraft ? 'craftable' : ''}">
        <div class="potion-header">
          <span class="potion-emoji">${pot.emoji}</span>
          <div class="potion-info">
            <span class="potion-name">${pot.name}</span>
            <span class="potion-desc">${pot.desc}</span>
          </div>
          <span class="potion-count">×${pot.count}</span>
        </div>
        <div class="potion-recipe">配方: ${recipeStr}</div>
        <button class="btn btn-small btn-craft" data-potion="${pot.id}" ${pot.canCraft ? '' : 'disabled'}>
          ${pot.canCraft ? '✨ 合成' : '材料不足'}
        </button>
      </div>`;
    });
    html += '</div></div>';

    container.innerHTML = html;
  }

  return {
    INGREDIENTS,
    RECIPES,
    canCraft,
    craft,
    usePotion,
    getInventory,
    getIngredients,
    renderPotionPage
  };
})();
