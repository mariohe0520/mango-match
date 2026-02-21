/**
 * campaign.js — 10岛屿 × 15关卡 故事战役系统
 * 含角色对话、Boss战、岛屿特色机制
 */
'use strict';

const Campaign = (() => {
  // ======== ISLANDS (10 islands) ========
  const ISLANDS = [
    {
      id: 'mango',    name: '芒果岛',    emoji: '🏝️',
      desc: '小芒的家园，热带阳光下的甜蜜开始',
      color: '#FFD93D', bgColor: '#FFF8E1',
      mechanic: null,
      unlockStars: 0
    },
    {
      id: 'garden',   name: '花园岛',    emoji: '🌺',
      desc: '花朵盛开的神秘花园，连锁反应的秘密',
      color: '#FF6B9D', bgColor: '#FFF0F5',
      mechanic: 'flowers',  // Flower tiles that chain
      unlockStars: 10
    },
    {
      id: 'ocean',    name: '海洋岛',    emoji: '🌊',
      desc: '碧蓝深海中的珊瑚迷宫',
      color: '#4ECDC4', bgColor: '#E0F7FA',
      mechanic: 'water',    // Water tiles that flow
      unlockStars: 25
    },
    {
      id: 'volcano',  name: '火山岛',    emoji: '🌋',
      desc: '炽热的火山口，岩浆在脚下流动',
      color: '#FF6B35', bgColor: '#FFF3E0',
      mechanic: 'lava',     // Lava that spreads
      unlockStars: 40
    },
    {
      id: 'ice',      name: '冰雪岛',    emoji: '❄️',
      desc: '银装素裹的冰封世界',
      color: '#74B9FF', bgColor: '#E3F2FD',
      mechanic: 'ice',      // Frozen tiles need 2 matches
      unlockStars: 60
    },
    {
      id: 'moonlight',name: '月光岛',    emoji: '🌙',
      desc: '月色朦胧的神秘之地',
      color: '#A29BFE', bgColor: '#EDE7F6',
      mechanic: 'dark',     // Limited visibility
      unlockStars: 80
    },
    {
      id: 'carnival', name: '嘉年华岛',  emoji: '🎪',
      desc: '缤纷绚烂的欢乐派对',
      color: '#FD79A8', bgColor: '#FCE4EC',
      mechanic: 'rainbow',  // Random rainbow effects
      unlockStars: 100
    },
    {
      id: 'sky',      name: '天空岛',    emoji: '🏔️',
      desc: '云端之上，重力在这里不可靠',
      color: '#81ECEC', bgColor: '#E0F2F1',
      mechanic: 'gravity',  // Gravity reverses
      unlockStars: 120
    },
    {
      id: 'star',     name: '星空岛',    emoji: '🌌',
      desc: '璀璨星河中的星座谜题',
      color: '#DFE6E9', bgColor: '#ECEFF1',
      mechanic: 'constellation',
      unlockStars: 140
    },
    {
      id: 'rainbow',  name: '彩虹岛',    emoji: '🎆',
      desc: '传说中的终极之地，所有力量汇聚',
      color: '#E17055', bgColor: '#FBE9E7',
      mechanic: 'all',      // All mechanics combined
      unlockStars: 160
    }
  ];

  // ======== CHARACTER ========
  const CHARACTER = {
    name: '小芒',
    emoji: '🥭',
    portraits: {
      happy: '😊', excited: '🤩', worried: '😟',
      determined: '💪', surprised: '😮', love: '🥰'
    }
  };

  // ======== STORY DIALOGUES ========
  const DIALOGUES = {
    // Island intros
    'mango_start': [
      { speaker: '小芒', mood: 'happy', text: '大家好！我是小芒，一颗爱冒险的小芒果！' },
      { speaker: '小芒', mood: 'excited', text: '今天我要踏上寻找传说中的彩虹之果的旅程！' },
      { speaker: '小芒', mood: 'determined', text: '听说只要集齐十座岛屿的宝石，就能找到它！' },
      { speaker: '小芒', mood: 'happy', text: '出发吧！第一站——我的家乡芒果岛！🏝️' }
    ],
    'mango_boss': [
      { speaker: '小芒', mood: 'surprised', text: '哎呀！一只大菠萝怪挡住了去路！' },
      { speaker: '菠萝怪', mood: null, text: '🍍 哼哼，想过去？先打败我再说！' },
      { speaker: '小芒', mood: 'determined', text: '来吧！我不怕你！' }
    ],
    'mango_complete': [
      { speaker: '小芒', mood: 'excited', text: '太棒了！芒果岛的宝石到手！✨' },
      { speaker: '小芒', mood: 'happy', text: '前方是美丽的花园岛，出发！' }
    ],

    'garden_start': [
      { speaker: '小芒', mood: 'surprised', text: '哇！好多美丽的花朵！🌸' },
      { speaker: '花仙子', mood: null, text: '🧚 欢迎来到花园岛～这里的花朵会连锁绽放哦！' },
      { speaker: '小芒', mood: 'excited', text: '好神奇！让我试试！' }
    ],
    'garden_boss': [
      { speaker: '小芒', mood: 'worried', text: '这棵巨大的食人花好可怕...' },
      { speaker: '食人花', mood: null, text: '🌿 想要花园岛的宝石？休想！' },
      { speaker: '小芒', mood: 'determined', text: '我才不会放弃！' }
    ],

    'ocean_start': [
      { speaker: '小芒', mood: 'excited', text: '大海！蓝蓝的大海！🌊' },
      { speaker: '小海龟', mood: null, text: '🐢 小心水流哦，它会改变宝石的位置！' },
      { speaker: '小芒', mood: 'determined', text: '没问题，我会游泳的！' }
    ],
    'ocean_boss': [
      { speaker: '章鱼怪', mood: null, text: '🐙 这片海域是我的地盘！' },
      { speaker: '小芒', mood: 'determined', text: '等我打败你，这里就安全了！' }
    ],

    'volcano_start': [
      { speaker: '小芒', mood: 'worried', text: '好热啊...这里到处都是岩浆！🌋' },
      { speaker: '火焰精灵', mood: null, text: '🔥 岩浆每回合都会蔓延，要小心！' },
      { speaker: '小芒', mood: 'determined', text: '我要快速通过！' }
    ],
    'volcano_boss': [
      { speaker: '岩浆巨人', mood: null, text: '🔥 谁敢闯入我的火山？' },
      { speaker: '小芒', mood: 'determined', text: '是我！小芒！' }
    ],

    'ice_start': [
      { speaker: '小芒', mood: 'surprised', text: '好冷！这里到处都是冰！❄️' },
      { speaker: '雪精灵', mood: null, text: '⛄ 冰冻的宝石需要匹配两次才能解除哦～' },
      { speaker: '小芒', mood: 'happy', text: '原来如此！' }
    ],
    'ice_boss': [
      { speaker: '冰霜巨龙', mood: null, text: '🐉 这里是我的冰封王国！' },
      { speaker: '小芒', mood: 'determined', text: '我来融化你！' }
    ],

    'moonlight_start': [
      { speaker: '小芒', mood: 'worried', text: '好暗啊...什么都看不清...' },
      { speaker: '萤火虫', mood: null, text: '✨ 别怕，我来给你照亮！不过只能看到一部分哦～' },
      { speaker: '小芒', mood: 'happy', text: '谢谢你，小萤火虫！' }
    ],
    'moonlight_boss': [
      { speaker: '暗影魔', mood: null, text: '🌑 黑暗中你什么都做不了！' },
      { speaker: '小芒', mood: 'determined', text: '光明终会战胜黑暗！' }
    ],

    'carnival_start': [
      { speaker: '小芒', mood: 'excited', text: '哇！嘉年华！好多彩色的东西！🎪' },
      { speaker: '小丑', mood: null, text: '🤡 欢迎！这里什么都可能发生哦～彩虹宝石会随机出现！' },
      { speaker: '小芒', mood: 'happy', text: '听起来好有趣！' }
    ],
    'carnival_boss': [
      { speaker: '魔术师', mood: null, text: '🎩 看我的魔术！让你的宝石消失！' },
      { speaker: '小芒', mood: 'determined', text: '我的魔术更厉害！' }
    ],

    'sky_start': [
      { speaker: '小芒', mood: 'surprised', text: '我们在云端！下面是蓝天！🏔️' },
      { speaker: '云朵精灵', mood: null, text: '☁️ 注意！这里的重力有时候会反转哦～' },
      { speaker: '小芒', mood: 'worried', text: '重力反转？那宝石不是会飞上去？' },
      { speaker: '云朵精灵', mood: null, text: '☁️ 没错！要适应这种变化！' }
    ],
    'sky_boss': [
      { speaker: '风暴鹰', mood: null, text: '🦅 想征服天空？先过我这关！' },
      { speaker: '小芒', mood: 'determined', text: '翅膀再大也不怕！' }
    ],

    'star_start': [
      { speaker: '小芒', mood: 'excited', text: '哇...好美的星空！✨' },
      { speaker: '星座守护者', mood: null, text: '⭐ 这里的宝石组成了星座图案，找到它们！' },
      { speaker: '小芒', mood: 'happy', text: '像连线一样吗？好浪漫！' }
    ],
    'star_boss': [
      { speaker: '黑洞', mood: null, text: '🕳️ 我会吞噬一切光芒！' },
      { speaker: '小芒', mood: 'determined', text: '星光永远不会消失！' }
    ],

    'rainbow_start': [
      { speaker: '小芒', mood: 'excited', text: '终于到了！传说中的彩虹岛！🎆' },
      { speaker: '小芒', mood: 'determined', text: '只要通过这里，就能找到彩虹之果！' },
      { speaker: '小芒', mood: 'love', text: '为了 芒果过敏 ，我一定要成功！💕' }
    ],
    'rainbow_boss': [
      { speaker: '彩虹巨龙', mood: null, text: '🐲 我是最终守护者！集合了所有力量！' },
      { speaker: '小芒', mood: 'determined', text: '一路上的朋友们给了我勇气！让我们决一胜负！' }
    ],
    'rainbow_complete': [
      { speaker: '小芒', mood: 'love', text: '我找到了！传说中的彩虹之果！🌈' },
      { speaker: '小芒', mood: 'excited', text: '谢谢你一路陪伴我的冒险！' },
      { speaker: '小芒', mood: 'love', text: '这颗彩虹之果，送给最特别的你——芒果过敏 💕' },
      { speaker: '小芒', mood: 'happy', text: '永远爱你！🥭💕' }
    ]
  };

  // ======== BOSS DATA ========
  const BOSSES = {
    mango:    { name: '菠萝怪',    emoji: '🍍', hp: 100, attack: '酸液喷射' },
    garden:   { name: '食人花',    emoji: '🌿', hp: 150, attack: '藤蔓缠绕' },
    ocean:    { name: '章鱼怪',    emoji: '🐙', hp: 180, attack: '墨汁喷射' },
    volcano:  { name: '岩浆巨人',  emoji: '🔥', hp: 220, attack: '岩浆冲击' },
    ice:      { name: '冰霜巨龙',  emoji: '🐉', hp: 250, attack: '冰霜吐息' },
    moonlight:{ name: '暗影魔',    emoji: '🌑', hp: 280, attack: '暗影侵蚀' },
    carnival: { name: '魔术师',    emoji: '🎩', hp: 320, attack: '消失魔术' },
    sky:      { name: '风暴鹰',    emoji: '🦅', hp: 350, attack: '龙卷风' },
    star:     { name: '黑洞',      emoji: '🕳️', hp: 400, attack: '引力崩塌' },
    rainbow:  { name: '彩虹巨龙',  emoji: '🐲', hp: 500, attack: '彩虹吐息' }
  };

  // ======== LEVEL GENERATION ========

  /**
   * Generate level config for global level index (0-149)
   * Each island has 15 levels, level 15 is the boss
   */
  function getLevelConfig(globalIndex) {
    const islandIndex = Math.floor(globalIndex / 15);
    const localLevel = globalIndex % 15;
    const island = ISLANDS[Math.min(islandIndex, ISLANDS.length - 1)];
    const isBoss = localLevel === 14;

    // Base difficulty scaling
    const difficulty = 1 + globalIndex * 0.08;
    const baseScore = Math.round((400 + globalIndex * 80) * difficulty * 0.5);
    const baseMoves = Math.max(12, 28 - Math.floor(globalIndex * 0.08));

    // Determine objectives
    let objectives = null;
    let obstacles = [];
    let bossHp = 0;

    if (isBoss) {
      // Boss level
      const boss = BOSSES[island.id];
      bossHp = boss.hp;
      objectives = { type: 'boss', bossName: boss.name, bossEmoji: boss.emoji };
    } else if (localLevel % 5 === 3) {
      // Collect objective
      const gemIdx = localLevel % Gems.COUNT;
      objectives = {
        type: 'collect',
        items: [{ gemType: Gems.TYPES[gemIdx].id, count: 8 + Math.floor(globalIndex * 0.3) }]
      };
    } else if (localLevel % 5 === 4 && islandIndex >= 2) {
      // Clear obstacles
      obstacles = generateObstacles(islandIndex, localLevel);
      objectives = { type: 'clear' };
    } else {
      // Score objective
      objectives = { type: 'score' };
    }

    // Gem count (fewer types = harder)
    let gemCount = 7;
    if (islandIndex <= 1 && localLevel < 3) gemCount = 5;
    else if (islandIndex <= 2) gemCount = 6;

    // Grid size
    let gridRows = 8, gridCols = 8;
    if (islandIndex === 0 && localLevel < 5) { gridRows = 7; gridCols = 7; }

    return {
      globalIndex,
      islandIndex,
      localLevel,
      island,
      isBoss,
      rows: gridRows,
      cols: gridCols,
      targetScore: baseScore,
      moves: isBoss ? baseMoves + 5 : baseMoves,
      timeLimit: localLevel % 7 === 6 ? 60 + islandIndex * 5 : -1, // time levels
      gemCount,
      objectives,
      obstacles,
      bossHp,
      mechanic: island.mechanic
    };
  }

  function generateObstacles(islandIndex, localLevel) {
    const obstacles = [];
    const count = 3 + Math.floor(islandIndex * 1.5);

    for (let i = 0; i < count; i++) {
      const r = 1 + Math.floor(Math.random() * 6);
      const c = 1 + Math.floor(Math.random() * 6);
      // Avoid duplicates
      if (obstacles.find(o => o.row === r && o.col === c)) continue;

      let type = 'ice';
      if (islandIndex >= 3) type = Math.random() > 0.5 ? 'ice' : 'stone';
      if (islandIndex >= 5) type = ['ice', 'stone', 'vine'][Math.floor(Math.random() * 3)];

      obstacles.push({ row: r, col: c, type, hp: type === 'ice' ? 2 : 1 });
    }

    return obstacles;
  }

  // ======== DIALOGUE HELPERS ========

  function getDialogue(key) {
    return DIALOGUES[key] || [];
  }

  function getIslandStartDialogue(islandId) {
    return DIALOGUES[islandId + '_start'] || [];
  }

  function getBossDialogue(islandId) {
    return DIALOGUES[islandId + '_boss'] || [];
  }

  function getIslandCompleteDialogue(islandId) {
    return DIALOGUES[islandId + '_complete'] || [];
  }

  // ======== PROGRESS HELPERS ========

  function getIslandProgress(data) {
    const progress = [];
    for (let i = 0; i < ISLANDS.length; i++) {
      const startLevel = i * 15;
      let completed = 0;
      let totalStars = 0;
      for (let j = 0; j < 15; j++) {
        const idx = startLevel + j;
        if (data.stars[idx]) {
          completed++;
          totalStars += data.stars[idx];
        }
      }
      progress.push({
        island: ISLANDS[i],
        completed,
        totalLevels: 15,
        totalStars,
        maxStars: 45,
        unlocked: data.totalStars >= ISLANDS[i].unlockStars || i === 0,
        bossDefeated: !!data.stars[startLevel + 14]
      });
    }
    return progress;
  }

  function getCurrentIslandIndex(data) {
    return Math.floor((data.currentLevel || 0) / 15);
  }

  function getLevelStars(score, targetScore) {
    if (score >= targetScore * 2.5) return 3;
    if (score >= targetScore * 1.5) return 2;
    if (score >= targetScore) return 1;
    return 0;
  }

  return {
    ISLANDS,
    BOSSES,
    CHARACTER,
    DIALOGUES,
    getLevelConfig,
    getDialogue,
    getIslandStartDialogue,
    getBossDialogue,
    getIslandCompleteDialogue,
    getIslandProgress,
    getCurrentIslandIndex,
    getLevelStars
  };
})();
