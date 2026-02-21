/**
 * garden.js — 花园种植系统
 * 每次匹配宝石都能获得种子，种在花园里，实时生长
 */
'use strict';

const Garden = (() => {
  // ======== PLANT SPECIES (50+) ========
  const SPECIES = [
    // Tropical Fruits (from matching)
    { id: 'mango_tree',    name: '芒果树',    emoji: '🥭', category: 'fruit', rarity: 'common',  growTime: 3600000 * 2,   stages: ['🌱','🌿','🪴','🌳','🥭'], reward: { type: 'gems', amount: 5 } },
    { id: 'strawberry_bush',name:'草莓丛',    emoji: '🍓', category: 'fruit', rarity: 'common',  growTime: 3600000 * 1.5, stages: ['🌱','🌿','🪴','🍓','🍓'], reward: { type: 'gems', amount: 4 } },
    { id: 'blueberry_bush',name: '蓝莓丛',    emoji: '🫐', category: 'fruit', rarity: 'common',  growTime: 3600000 * 1.5, stages: ['🌱','🌿','🪴','🫐','🫐'], reward: { type: 'gems', amount: 4 } },
    { id: 'orange_tree',   name: '橙子树',    emoji: '🍊', category: 'fruit', rarity: 'common',  growTime: 3600000 * 2,   stages: ['🌱','🌿','🪴','🌳','🍊'], reward: { type: 'gems', amount: 5 } },
    { id: 'grape_vine',    name: '葡萄藤',    emoji: '🍇', category: 'fruit', rarity: 'common',  growTime: 3600000 * 2.5, stages: ['🌱','🌿','🪴','🍇','🍇'], reward: { type: 'gems', amount: 6 } },
    { id: 'kiwi_tree',     name: '猕猴桃树',  emoji: '🥝', category: 'fruit', rarity: 'common',  growTime: 3600000 * 2,   stages: ['🌱','🌿','🪴','🌳','🥝'], reward: { type: 'gems', amount: 5 } },
    { id: 'peach_tree',    name: '蜜桃树',    emoji: '🍑', category: 'fruit', rarity: 'common',  growTime: 3600000 * 2,   stages: ['🌱','🌿','🪴','🌳','🍑'], reward: { type: 'gems', amount: 5 } },

    // Flowers
    { id: 'sunflower',     name: '向日葵',    emoji: '🌻', category: 'flower', rarity: 'common',  growTime: 3600000 * 1,   stages: ['🌱','🌿','🌾','🌻','🌻'], reward: { type: 'potion', item: 'shuffle' } },
    { id: 'rose',          name: '玫瑰',      emoji: '🌹', category: 'flower', rarity: 'uncommon',growTime: 3600000 * 3,   stages: ['🌱','🌿','🌾','🥀','🌹'], reward: { type: 'potion', item: 'bomb' } },
    { id: 'tulip',         name: '郁金香',    emoji: '🌷', category: 'flower', rarity: 'common',  growTime: 3600000 * 1.5, stages: ['🌱','🌿','🌾','🌷','🌷'], reward: { type: 'gems', amount: 3 } },
    { id: 'cherry_blossom',name: '樱花树',    emoji: '🌸', category: 'flower', rarity: 'uncommon',growTime: 3600000 * 4,   stages: ['🌱','🌿','🪴','🌳','🌸'], reward: { type: 'potion', item: 'rainbow' } },
    { id: 'hibiscus',      name: '木槿花',    emoji: '🌺', category: 'flower', rarity: 'common',  growTime: 3600000 * 1.5, stages: ['🌱','🌿','🌾','🌺','🌺'], reward: { type: 'gems', amount: 3 } },
    { id: 'lotus',         name: '莲花',      emoji: '🪷', category: 'flower', rarity: 'rare',    growTime: 3600000 * 6,   stages: ['🌱','💧','🌿','🪷','🪷'], reward: { type: 'potion', item: 'rainbow' } },
    { id: 'lavender',      name: '薰衣草',    emoji: '💜', category: 'flower', rarity: 'common',  growTime: 3600000 * 2,   stages: ['🌱','🌿','🌾','💜','💜'], reward: { type: 'gems', amount: 4 } },

    // Trees
    { id: 'palm_tree',     name: '棕榈树',    emoji: '🌴', category: 'tree', rarity: 'uncommon', growTime: 3600000 * 8,  stages: ['🌱','🌿','🪴','🌴','🌴'], reward: { type: 'gems', amount: 10 } },
    { id: 'pine_tree',     name: '松树',      emoji: '🌲', category: 'tree', rarity: 'uncommon', growTime: 3600000 * 8,  stages: ['🌱','🌿','🪴','🌲','🌲'], reward: { type: 'gems', amount: 10 } },
    { id: 'maple_tree',    name: '枫树',      emoji: '🍁', category: 'tree', rarity: 'uncommon', growTime: 3600000 * 10, stages: ['🌱','🌿','🪴','🌳','🍁'], reward: { type: 'potion', item: 'time' } },
    { id: 'bamboo',        name: '竹子',      emoji: '🎋', category: 'tree', rarity: 'common',   growTime: 3600000 * 3,  stages: ['🌱','🌿','🎋','🎋','🎋'], reward: { type: 'gems', amount: 6 } },
    { id: 'bonsai',        name: '盆景',      emoji: '🪴', category: 'tree', rarity: 'rare',     growTime: 3600000 * 12, stages: ['🌱','🌿','🪴','🪴','🪴'], reward: { type: 'gems', amount: 15 } },

    // Special / Rare
    { id: 'cactus',        name: '仙人掌',    emoji: '🌵', category: 'special', rarity: 'uncommon',growTime: 3600000 * 5,  stages: ['🌱','🌿','🌵','🌵','🌵'], reward: { type: 'potion', item: 'bomb' } },
    { id: 'mushroom',      name: '蘑菇',      emoji: '🍄', category: 'special', rarity: 'uncommon',growTime: 3600000 * 2,  stages: ['🌱','🤎','🍄','🍄','🍄'], reward: { type: 'potion', item: 'shuffle' } },
    { id: 'four_leaf',     name: '四叶草',    emoji: '🍀', category: 'special', rarity: 'rare',    growTime: 3600000 * 4,  stages: ['🌱','🌿','☘️','🍀','🍀'], reward: { type: 'gems', amount: 20 } },
    { id: 'venus_flytrap', name: '捕蝇草',    emoji: '🪴', category: 'special', rarity: 'rare',    growTime: 3600000 * 6,  stages: ['🌱','🌿','🪴','🪴','🪴'], reward: { type: 'potion', item: 'bomb' } },
    { id: 'crystal_flower',name: '水晶花',    emoji: '💎', category: 'special', rarity: 'legendary',growTime: 3600000 * 24, stages: ['🌱','✨','💠','💎','💎'], reward: { type: 'gems', amount: 50 } },

    // More fruits
    { id: 'watermelon',    name: '西瓜',      emoji: '🍉', category: 'fruit', rarity: 'uncommon', growTime: 3600000 * 3,   stages: ['🌱','🌿','🪴','🍉','🍉'], reward: { type: 'gems', amount: 7 } },
    { id: 'lemon_tree',    name: '柠檬树',    emoji: '🍋', category: 'fruit', rarity: 'common',   growTime: 3600000 * 2.5, stages: ['🌱','🌿','🪴','🌳','🍋'], reward: { type: 'gems', amount: 5 } },
    { id: 'cherry_tree',   name: '樱桃树',    emoji: '🍒', category: 'fruit', rarity: 'common',   growTime: 3600000 * 2,   stages: ['🌱','🌿','🪴','🌳','🍒'], reward: { type: 'gems', amount: 5 } },
    { id: 'coconut_palm',  name: '椰子树',    emoji: '🥥', category: 'fruit', rarity: 'uncommon', growTime: 3600000 * 6,   stages: ['🌱','🌿','🪴','🌴','🥥'], reward: { type: 'gems', amount: 8 } },
    { id: 'apple_tree',    name: '苹果树',    emoji: '🍎', category: 'fruit', rarity: 'common',   growTime: 3600000 * 2,   stages: ['🌱','🌿','🪴','🌳','🍎'], reward: { type: 'gems', amount: 5 } },
    { id: 'pineapple',     name: '菠萝',      emoji: '🍍', category: 'fruit', rarity: 'uncommon', growTime: 3600000 * 3.5, stages: ['🌱','🌿','🪴','🍍','🍍'], reward: { type: 'gems', amount: 7 } },
    { id: 'banana_tree',   name: '香蕉树',    emoji: '🍌', category: 'fruit', rarity: 'common',   growTime: 3600000 * 2,   stages: ['🌱','🌿','🪴','🌴','🍌'], reward: { type: 'gems', amount: 5 } },
    { id: 'avocado',       name: '牛油果',    emoji: '🥑', category: 'fruit', rarity: 'uncommon', growTime: 3600000 * 4,   stages: ['🌱','🌿','🪴','🌳','🥑'], reward: { type: 'gems', amount: 7 } },

    // More flowers
    { id: 'daisy',         name: '雏菊',      emoji: '🌼', category: 'flower', rarity: 'common',  growTime: 3600000 * 1,   stages: ['🌱','🌿','🌾','🌼','🌼'], reward: { type: 'gems', amount: 3 } },
    { id: 'chrysanthemum', name: '菊花',      emoji: '💛', category: 'flower', rarity: 'common',  growTime: 3600000 * 2,   stages: ['🌱','🌿','🌾','💛','💛'], reward: { type: 'gems', amount: 4 } },
    { id: 'orchid',        name: '兰花',      emoji: '🪻', category: 'flower', rarity: 'rare',    growTime: 3600000 * 8,   stages: ['🌱','🌿','🌾','🪻','🪻'], reward: { type: 'potion', item: 'rainbow' } },
    { id: 'lily',          name: '百合',      emoji: '🤍', category: 'flower', rarity: 'uncommon',growTime: 3600000 * 3,   stages: ['🌱','🌿','🌾','🤍','🤍'], reward: { type: 'gems', amount: 6 } },

    // Vegetables (fun bonus)
    { id: 'carrot',        name: '胡萝卜',    emoji: '🥕', category: 'veggie', rarity: 'common',  growTime: 3600000 * 1,   stages: ['🌱','🌿','🥕','🥕','🥕'], reward: { type: 'gems', amount: 2 } },
    { id: 'corn',          name: '玉米',      emoji: '🌽', category: 'veggie', rarity: 'common',  growTime: 3600000 * 1.5, stages: ['🌱','🌿','🌾','🌽','🌽'], reward: { type: 'gems', amount: 3 } },
    { id: 'eggplant',      name: '茄子',      emoji: '🍆', category: 'veggie', rarity: 'common',  growTime: 3600000 * 1.5, stages: ['🌱','🌿','🪴','🍆','🍆'], reward: { type: 'gems', amount: 3 } },
    { id: 'pepper',        name: '辣椒',      emoji: '🌶️', category: 'veggie', rarity: 'uncommon',growTime: 3600000 * 2,   stages: ['🌱','🌿','🪴','🌶️','🌶️'], reward: { type: 'potion', item: 'bomb' } },
    { id: 'pumpkin',       name: '南瓜',      emoji: '🎃', category: 'veggie', rarity: 'uncommon',growTime: 3600000 * 4,   stages: ['🌱','🌿','🪴','🎃','🎃'], reward: { type: 'gems', amount: 8 } },

    // Magical plants
    { id: 'rainbow_flower',name: '彩虹花',    emoji: '🌈', category: 'magical', rarity: 'legendary',growTime: 3600000 * 48, stages: ['🌱','✨','🌈','🌈','🌈'], reward: { type: 'gems', amount: 100 } },
    { id: 'star_fruit',    name: '杨桃树',    emoji: '⭐', category: 'magical', rarity: 'rare',     growTime: 3600000 * 12, stages: ['🌱','✨','🪴','🌳','⭐'], reward: { type: 'gems', amount: 25 } },
    { id: 'moon_flower',   name: '月光花',    emoji: '🌙', category: 'magical', rarity: 'rare',     growTime: 3600000 * 10, stages: ['🌱','✨','🌿','🌙','🌙'], reward: { type: 'potion', item: 'time' } },
    { id: 'fire_flower',   name: '火焰花',    emoji: '🔥', category: 'magical', rarity: 'rare',     growTime: 3600000 * 8,  stages: ['🌱','✨','🌿','🔥','🔥'], reward: { type: 'potion', item: 'bomb' } },
    { id: 'ice_crystal',   name: '冰晶花',    emoji: '❄️', category: 'magical', rarity: 'rare',     growTime: 3600000 * 8,  stages: ['🌱','✨','🌿','❄️','❄️'], reward: { type: 'potion', item: 'time' } },
    { id: 'golden_apple',  name: '金苹果树',  emoji: '🏆', category: 'magical', rarity: 'legendary',growTime: 3600000 * 72, stages: ['🌱','✨','🪴','🌳','🏆'], reward: { type: 'gems', amount: 200 } },
  ];

  // Map species by id for quick lookup
  const SPECIES_MAP = {};
  SPECIES.forEach(s => { SPECIES_MAP[s.id] = s; });

  // ======== SEED REWARDS FROM MATCHING ========

  /**
   * Determine seeds earned from a match
   * @param {number} matchSize — how many gems matched
   * @param {number} gemType — gem type index
   * @returns {object|null} — { speciesId, count }
   */
  function getSeedFromMatch(matchSize, gemType) {
    // Match 3 → basic fruit seed
    // Match 4 → uncommon seed
    // Match 5+ → rare seed

    const baseFruits = ['mango_tree','strawberry_bush','blueberry_bush','orange_tree','grape_vine','kiwi_tree','peach_tree'];
    const baseSpecies = baseFruits[gemType % baseFruits.length];

    if (matchSize >= 5) {
      // Rare or magical seed
      const rares = SPECIES.filter(s => s.rarity === 'rare' || s.rarity === 'legendary');
      const pick = rares[Math.floor(Math.random() * rares.length)];
      return { speciesId: pick.id, count: 1 };
    } else if (matchSize === 4) {
      // Uncommon seed
      const uncommons = SPECIES.filter(s => s.rarity === 'uncommon');
      const pick = uncommons[Math.floor(Math.random() * uncommons.length)];
      return { speciesId: pick.id, count: 1 };
    } else {
      // Common — base fruit type
      return { speciesId: baseSpecies, count: 1 };
    }
  }

  // ======== GARDEN MANAGEMENT ========

  function addSeed(data, speciesId) {
    if (!data.garden.seeds[speciesId]) data.garden.seeds[speciesId] = 0;
    data.garden.seeds[speciesId]++;
    if (!data.garden.unlockedSpecies.includes(speciesId)) {
      data.garden.unlockedSpecies.push(speciesId);
    }
  }

  function plantSeed(data, speciesId, plotX, plotY) {
    if (!data.garden.seeds[speciesId] || data.garden.seeds[speciesId] <= 0) return false;

    // Check if plot is already occupied
    const occupied = data.garden.plots.find(p => p.x === plotX && p.y === plotY);
    if (occupied) return false;

    data.garden.seeds[speciesId]--;
    data.garden.plots.push({
      speciesId,
      plantedAt: Date.now(),
      wateredAt: Date.now(),
      stage: 0,
      x: plotX,
      y: plotY,
      harvested: false
    });
    return true;
  }

  function getPlantStage(plot) {
    const species = SPECIES_MAP[plot.speciesId];
    if (!species) return 0;

    const elapsed = Date.now() - plot.plantedAt;
    const progress = Math.min(1, elapsed / species.growTime);
    const stageIndex = Math.min(species.stages.length - 1, Math.floor(progress * species.stages.length));
    return stageIndex;
  }

  function isFullyGrown(plot) {
    const species = SPECIES_MAP[plot.speciesId];
    if (!species) return false;
    return getPlantStage(plot) >= species.stages.length - 1;
  }

  function getGrowthPercent(plot) {
    const species = SPECIES_MAP[plot.speciesId];
    if (!species) return 0;
    const elapsed = Date.now() - plot.plantedAt;
    return Math.min(100, (elapsed / species.growTime) * 100);
  }

  function harvestPlant(data, plotIndex) {
    const plot = data.garden.plots[plotIndex];
    if (!plot || !isFullyGrown(plot) || plot.harvested) return null;

    const species = SPECIES_MAP[plot.speciesId];
    if (!species) return null;

    plot.harvested = true;

    // Apply reward
    const reward = species.reward;
    if (reward.type === 'gems') {
      // Add to ingredients (bonus)
      const colors = ['red', 'orange', 'green', 'blue', 'purple', 'yellow', 'pink'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      data.potions.ingredients[color] = (data.potions.ingredients[color] || 0) + reward.amount;
    } else if (reward.type === 'potion') {
      data.potions.inventory[reward.item] = (data.potions.inventory[reward.item] || 0) + 1;
    }

    return reward;
  }

  function removePlant(data, plotIndex) {
    data.garden.plots.splice(plotIndex, 1);
  }

  function getGardenStats(data) {
    let total = data.garden.plots.length;
    let growing = 0, ready = 0, harvested = 0;
    let speciesCount = data.garden.unlockedSpecies.length;

    data.garden.plots.forEach(plot => {
      if (plot.harvested) harvested++;
      else if (isFullyGrown(plot)) ready++;
      else growing++;
    });

    return { total, growing, ready, harvested, speciesCount, totalSpecies: SPECIES.length };
  }

  // ======== RENDER GARDEN ========

  function renderGarden(container, data) {
    const garden = data.garden;
    const layoutRows = garden.layout.rows;
    const layoutCols = garden.layout.cols;

    let html = '<div class="garden-grid">';

    for (let r = 0; r < layoutRows; r++) {
      for (let c = 0; c < layoutCols; c++) {
        const plot = garden.plots.find(p => p.x === c && p.y === r);
        html += `<div class="garden-plot" data-x="${c}" data-y="${r}">`;

        if (plot) {
          const species = SPECIES_MAP[plot.speciesId];
          const stage = getPlantStage(plot);
          const stageEmoji = species ? species.stages[stage] : '🌱';
          const pct = Math.round(getGrowthPercent(plot));
          const grown = isFullyGrown(plot);

          html += `<div class="garden-plant ${grown && !plot.harvested ? 'ready-harvest' : ''} ${plot.harvested ? 'harvested' : ''}">`;
          html += `<span class="plant-emoji">${stageEmoji}</span>`;
          if (!grown && !plot.harvested) {
            html += `<div class="plant-progress"><div class="plant-progress-bar" style="width:${pct}%"></div></div>`;
          }
          if (grown && !plot.harvested) {
            html += `<span class="harvest-badge">✨</span>`;
          }
          html += `<span class="plant-name">${species ? species.name : '未知'}</span>`;
          html += '</div>';
        } else {
          html += `<div class="garden-empty">+</div>`;
        }

        html += '</div>';
      }
    }

    html += '</div>';
    container.innerHTML = html;
  }

  return {
    SPECIES,
    SPECIES_MAP,
    getSeedFromMatch,
    addSeed,
    plantSeed,
    getPlantStage,
    isFullyGrown,
    getGrowthPercent,
    harvestPlant,
    removePlant,
    getGardenStats,
    renderGarden
  };
})();
