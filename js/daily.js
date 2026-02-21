/**
 * daily.js — 每日挑战、连续登录、成就系统
 */
'use strict';

const Daily = (() => {
  // ======== ACHIEVEMENTS (100+) ========
  const ACHIEVEMENTS = [
    // Getting Started
    { id: 'first_match',     name: '初次消除',     emoji: '✨', desc: '完成第一次匹配', category: 'basics' },
    { id: 'first_level',     name: '初出茅庐',     emoji: '🎓', desc: '完成第一关', category: 'basics' },
    { id: 'first_combo',     name: '连击入门',     emoji: '🔥', desc: '触发第一次连击', category: 'basics' },
    { id: 'first_special',   name: '特殊宝石',     emoji: '💎', desc: '创建第一个特殊宝石', category: 'basics' },
    { id: 'first_plant',     name: '园丁起步',     emoji: '🌱', desc: '种下第一棵植物', category: 'basics' },
    { id: 'first_potion',    name: '初级药剂师',   emoji: '🧪', desc: '合成第一瓶药水', category: 'basics' },
    { id: 'first_harvest',   name: '丰收时刻',     emoji: '🌾', desc: '收获第一棵成熟植物', category: 'basics' },
    { id: 'first_boss',      name: '初战告捷',     emoji: '⚔️', desc: '击败第一个Boss', category: 'basics' },

    // Score milestones
    { id: 'score_1k',        name: '千分大师',     emoji: '🏅', desc: '单关得分超过1000', category: 'score' },
    { id: 'score_5k',        name: '五千之星',     emoji: '🌟', desc: '单关得分超过5000', category: 'score' },
    { id: 'score_10k',       name: '万分传奇',     emoji: '👑', desc: '单关得分超过10000', category: 'score' },
    { id: 'total_10k',       name: '积分新手',     emoji: '📊', desc: '累计得分10000', category: 'score' },
    { id: 'total_50k',       name: '积分高手',     emoji: '📈', desc: '累计得分50000', category: 'score' },
    { id: 'total_100k',      name: '积分大师',     emoji: '🏆', desc: '累计得分100000', category: 'score' },

    // Combo mastery
    { id: 'combo_3',         name: '三连击',       emoji: '3️⃣', desc: '达成3连击', category: 'combo' },
    { id: 'combo_5',         name: '五连击',       emoji: '5️⃣', desc: '达成5连击', category: 'combo' },
    { id: 'combo_8',         name: '八连击',       emoji: '8️⃣', desc: '达成8连击', category: 'combo' },
    { id: 'combo_10',        name: '十连击',       emoji: '🔟', desc: '达成10连击', category: 'combo' },
    { id: 'combo_15',        name: '连击大师',     emoji: '💥', desc: '达成15连击', category: 'combo' },

    // Level progress
    { id: 'level_10',        name: '小有成就',     emoji: '🎯', desc: '完成10关', category: 'progress' },
    { id: 'level_25',        name: '冒险者',       emoji: '🗺️', desc: '完成25关', category: 'progress' },
    { id: 'level_50',        name: '探险家',       emoji: '🧭', desc: '完成50关', category: 'progress' },
    { id: 'level_100',       name: '征服者',       emoji: '⚡', desc: '完成100关', category: 'progress' },
    { id: 'level_150',       name: '传奇英雄',     emoji: '🦸', desc: '完成全部150关', category: 'progress' },

    // Stars
    { id: 'stars_10',        name: '十星闪耀',     emoji: '⭐', desc: '获得10颗星', category: 'stars' },
    { id: 'stars_50',        name: '五十星辉',     emoji: '🌟', desc: '获得50颗星', category: 'stars' },
    { id: 'stars_100',       name: '百星传奇',     emoji: '💫', desc: '获得100颗星', category: 'stars' },
    { id: 'stars_200',       name: '双百之光',     emoji: '✨', desc: '获得200颗星', category: 'stars' },
    { id: 'stars_450',       name: '全星收集',     emoji: '🏆', desc: '收集全部450颗星(全3星)', category: 'stars' },
    { id: 'perfect_island',  name: '完美岛屿',     emoji: '🏝️', desc: '在一个岛屿获得全部45颗星', category: 'stars' },

    // Island completion
    { id: 'island_mango',    name: '芒果岛英雄',   emoji: '🏝️', desc: '完成芒果岛全部关卡', category: 'islands' },
    { id: 'island_garden',   name: '花园岛英雄',   emoji: '🌺', desc: '完成花园岛全部关卡', category: 'islands' },
    { id: 'island_ocean',    name: '海洋岛英雄',   emoji: '🌊', desc: '完成海洋岛全部关卡', category: 'islands' },
    { id: 'island_volcano',  name: '火山岛英雄',   emoji: '🌋', desc: '完成火山岛全部关卡', category: 'islands' },
    { id: 'island_ice',      name: '冰雪岛英雄',   emoji: '❄️', desc: '完成冰雪岛全部关卡', category: 'islands' },
    { id: 'island_moonlight',name: '月光岛英雄',   emoji: '🌙', desc: '完成月光岛全部关卡', category: 'islands' },
    { id: 'island_carnival', name: '嘉年华岛英雄', emoji: '🎪', desc: '完成嘉年华岛全部关卡', category: 'islands' },
    { id: 'island_sky',      name: '天空岛英雄',   emoji: '🏔️', desc: '完成天空岛全部关卡', category: 'islands' },
    { id: 'island_star',     name: '星空岛英雄',   emoji: '🌌', desc: '完成星空岛全部关卡', category: 'islands' },
    { id: 'island_rainbow',  name: '彩虹岛英雄',   emoji: '🎆', desc: '完成彩虹岛全部关卡', category: 'islands' },

    // Boss defeats
    { id: 'boss_first',      name: '勇者之路',     emoji: '⚔️', desc: '击败第一个Boss', category: 'boss' },
    { id: 'boss_5',          name: '五杀英雄',     emoji: '🗡️', desc: '击败5个Boss', category: 'boss' },
    { id: 'boss_all',        name: '十全十美',     emoji: '🐲', desc: '击败全部10个Boss', category: 'boss' },

    // Garden
    { id: 'garden_5',        name: '小花园',       emoji: '🌱', desc: '花园中种满5棵植物', category: 'garden' },
    { id: 'garden_10',       name: '小花匠',       emoji: '🌿', desc: '花园中种满10棵植物', category: 'garden' },
    { id: 'garden_20',       name: '园艺大师',     emoji: '🌳', desc: '花园中种满20棵植物', category: 'garden' },
    { id: 'species_10',      name: '收集新手',     emoji: '📖', desc: '解锁10种植物', category: 'garden' },
    { id: 'species_25',      name: '植物学家',     emoji: '🔬', desc: '解锁25种植物', category: 'garden' },
    { id: 'species_50',      name: '植物大全',     emoji: '📚', desc: '解锁全部50种植物', category: 'garden' },
    { id: 'harvest_10',      name: '小农夫',       emoji: '👨‍🌾', desc: '收获10次', category: 'garden' },
    { id: 'harvest_50',      name: '丰收之王',     emoji: '🌾', desc: '收获50次', category: 'garden' },
    { id: 'rare_plant',      name: '珍稀发现',     emoji: '💎', desc: '种植一棵传说级植物', category: 'garden' },

    // Potions
    { id: 'potion_craft_10', name: '调药新手',     emoji: '🧪', desc: '合成10瓶药水', category: 'potion' },
    { id: 'potion_craft_50', name: '调药大师',     emoji: '⚗️', desc: '合成50瓶药水', category: 'potion' },
    { id: 'potion_use_10',   name: '药水控',       emoji: '💊', desc: '使用10瓶药水', category: 'potion' },

    // Daily / Streaks
    { id: 'daily_first',     name: '每日挑战',     emoji: '📅', desc: '完成第一个每日挑战', category: 'daily' },
    { id: 'daily_7',         name: '一周坚持',     emoji: '📆', desc: '完成7个每日挑战', category: 'daily' },
    { id: 'daily_30',        name: '月度达人',     emoji: '🗓️', desc: '完成30个每日挑战', category: 'daily' },
    { id: 'streak_3',        name: '三日连胜',     emoji: '🔥', desc: '连续3天登录', category: 'daily' },
    { id: 'streak_7',        name: '周连胜',       emoji: '🔥', desc: '连续7天登录', category: 'daily' },
    { id: 'streak_14',       name: '双周坚持',     emoji: '🔥', desc: '连续14天登录', category: 'daily' },
    { id: 'streak_30',       name: '月度之星',     emoji: '⭐', desc: '连续30天登录', category: 'daily' },

    // Gem mastery (match lots of specific gems)
    { id: 'mango_100',       name: '芒果达人',     emoji: '🥭', desc: '累计匹配100个芒果', category: 'gems' },
    { id: 'strawberry_100',  name: '草莓达人',     emoji: '🍓', desc: '累计匹配100个草莓', category: 'gems' },
    { id: 'blueberry_100',   name: '蓝莓达人',     emoji: '🫐', desc: '累计匹配100个蓝莓', category: 'gems' },
    { id: 'total_gems_1k',   name: '千宝收割者',   emoji: '💎', desc: '累计消除1000个宝石', category: 'gems' },
    { id: 'total_gems_10k',  name: '万宝之主',     emoji: '👑', desc: '累计消除10000个宝石', category: 'gems' },

    // Special achievements
    { id: 'speed_demon',     name: '闪电快手',     emoji: '⚡', desc: '在时间模式剩余30秒完成', category: 'special' },
    { id: 'close_call',      name: '绝处逢生',     emoji: '😅', desc: '最后一步通关', category: 'special' },
    { id: 'no_potion',       name: '纯技术流',     emoji: '🧘', desc: '不使用药水通过一个岛屿', category: 'special' },
    { id: 'three_star_run',  name: '完美连胜',     emoji: '🌟', desc: '连续10关获得3星', category: 'special' },

    // Fun / Easter eggs
    { id: 'night_owl',       name: '夜猫子',       emoji: '🦉', desc: '在凌晨12点后游戏', category: 'fun' },
    { id: 'early_bird',      name: '早起鸟',       emoji: '🐦', desc: '在早上6点前游戏', category: 'fun' },
    { id: 'weekend_warrior', name: '周末战士',     emoji: '💪', desc: '在周末完成10关', category: 'fun' },
    { id: 'love',            name: '爱的力量',     emoji: '💕', desc: '发现隐藏彩蛋(点击标题10次)', category: 'fun' },

    // Moves mastery
    { id: 'efficient_1',     name: '精打细算',     emoji: '🎯', desc: '剩余10步以上通关', category: 'moves' },
    { id: 'efficient_2',     name: '步步为营',     emoji: '🏹', desc: '剩余15步以上通关', category: 'moves' },
    { id: 'total_moves_1k',  name: '千步旅者',     emoji: '👣', desc: '累计使用1000步', category: 'moves' },
    { id: 'total_moves_5k',  name: '五千里路',     emoji: '🚶', desc: '累计使用5000步', category: 'moves' },
  ];

  const ACH_MAP = {};
  ACHIEVEMENTS.forEach(a => { ACH_MAP[a.id] = a; });

  // ======== DAILY CHALLENGE ========

  function getTodayString() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function getDailyChallenge() {
    const today = getTodayString();
    // Generate deterministic daily level from date
    const seed = hashCode(today);
    const rng = seededRandom(seed);

    return {
      date: today,
      targetScore: 2000 + Math.floor(rng() * 3000),
      moves: 15 + Math.floor(rng() * 10),
      rows: 8,
      cols: 8,
      gemCount: 6 + Math.floor(rng() * 2),
      obstacles: generateDailyObstacles(rng),
      objectives: { type: 'score' }
    };
  }

  function generateDailyObstacles(rng) {
    const obstacles = [];
    const count = 2 + Math.floor(rng() * 6);
    for (let i = 0; i < count; i++) {
      obstacles.push({
        row: 1 + Math.floor(rng() * 6),
        col: 1 + Math.floor(rng() * 6),
        type: rng() > 0.5 ? 'ice' : 'stone',
        hp: 2
      });
    }
    return obstacles;
  }

  function isDailyCompleted(data) {
    return data.daily.completedDailies.includes(getTodayString());
  }

  function completeDailyChallenge(data, score) {
    const today = getTodayString();
    if (!data.daily.completedDailies.includes(today)) {
      data.daily.completedDailies.push(today);
    }
    if (score > data.daily.weeklyBest) data.daily.weeklyBest = score;
  }

  // ======== STREAKS ========

  function updateStreak(data) {
    const today = getTodayString();
    if (data.daily.lastPlayedDate === today) return; // Already updated

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

    if (data.daily.lastPlayedDate === yesterdayStr) {
      data.daily.streak++;
    } else {
      data.daily.streak = 1;
    }

    if (data.daily.streak > data.daily.bestStreak) {
      data.daily.bestStreak = data.daily.streak;
    }

    data.daily.lastPlayedDate = today;
  }

  // ======== ACHIEVEMENT CHECKING ========

  function checkAndUnlock(data, achievementId) {
    if (data.achievements[achievementId]) return false; // Already unlocked

    data.achievements[achievementId] = {
      unlocked: true,
      unlockedAt: Date.now()
    };
    return true; // Newly unlocked
  }

  function checkAllAchievements(data) {
    const newlyUnlocked = [];

    // Score achievements
    if (data.stats.totalScore >= 10000) if (checkAndUnlock(data, 'total_10k')) newlyUnlocked.push('total_10k');
    if (data.stats.totalScore >= 50000) if (checkAndUnlock(data, 'total_50k')) newlyUnlocked.push('total_50k');
    if (data.stats.totalScore >= 100000) if (checkAndUnlock(data, 'total_100k')) newlyUnlocked.push('total_100k');

    // Level achievements
    if (data.stats.levelsCompleted >= 10) if (checkAndUnlock(data, 'level_10')) newlyUnlocked.push('level_10');
    if (data.stats.levelsCompleted >= 25) if (checkAndUnlock(data, 'level_25')) newlyUnlocked.push('level_25');
    if (data.stats.levelsCompleted >= 50) if (checkAndUnlock(data, 'level_50')) newlyUnlocked.push('level_50');
    if (data.stats.levelsCompleted >= 100) if (checkAndUnlock(data, 'level_100')) newlyUnlocked.push('level_100');
    if (data.stats.levelsCompleted >= 150) if (checkAndUnlock(data, 'level_150')) newlyUnlocked.push('level_150');

    // Star achievements
    if (data.totalStars >= 10) if (checkAndUnlock(data, 'stars_10')) newlyUnlocked.push('stars_10');
    if (data.totalStars >= 50) if (checkAndUnlock(data, 'stars_50')) newlyUnlocked.push('stars_50');
    if (data.totalStars >= 100) if (checkAndUnlock(data, 'stars_100')) newlyUnlocked.push('stars_100');
    if (data.totalStars >= 200) if (checkAndUnlock(data, 'stars_200')) newlyUnlocked.push('stars_200');
    if (data.totalStars >= 450) if (checkAndUnlock(data, 'stars_450')) newlyUnlocked.push('stars_450');

    // Combo achievements
    if (data.stats.maxCombo >= 3) if (checkAndUnlock(data, 'combo_3')) newlyUnlocked.push('combo_3');
    if (data.stats.maxCombo >= 5) if (checkAndUnlock(data, 'combo_5')) newlyUnlocked.push('combo_5');
    if (data.stats.maxCombo >= 8) if (checkAndUnlock(data, 'combo_8')) newlyUnlocked.push('combo_8');
    if (data.stats.maxCombo >= 10) if (checkAndUnlock(data, 'combo_10')) newlyUnlocked.push('combo_10');
    if (data.stats.maxCombo >= 15) if (checkAndUnlock(data, 'combo_15')) newlyUnlocked.push('combo_15');

    // Boss achievements
    if (data.stats.bossesDefeated >= 1) if (checkAndUnlock(data, 'boss_first')) newlyUnlocked.push('boss_first');
    if (data.stats.bossesDefeated >= 5) if (checkAndUnlock(data, 'boss_5')) newlyUnlocked.push('boss_5');
    if (data.stats.bossesDefeated >= 10) if (checkAndUnlock(data, 'boss_all')) newlyUnlocked.push('boss_all');

    // Garden achievements
    const gardenStats = Garden.getGardenStats(data);
    if (gardenStats.total >= 5) if (checkAndUnlock(data, 'garden_5')) newlyUnlocked.push('garden_5');
    if (gardenStats.total >= 10) if (checkAndUnlock(data, 'garden_10')) newlyUnlocked.push('garden_10');
    if (gardenStats.total >= 20) if (checkAndUnlock(data, 'garden_20')) newlyUnlocked.push('garden_20');
    if (gardenStats.speciesCount >= 10) if (checkAndUnlock(data, 'species_10')) newlyUnlocked.push('species_10');
    if (gardenStats.speciesCount >= 25) if (checkAndUnlock(data, 'species_25')) newlyUnlocked.push('species_25');
    if (gardenStats.speciesCount >= 50) if (checkAndUnlock(data, 'species_50')) newlyUnlocked.push('species_50');

    // Gem achievements
    if (data.stats.totalGems >= 1000) if (checkAndUnlock(data, 'total_gems_1k')) newlyUnlocked.push('total_gems_1k');
    if (data.stats.totalGems >= 10000) if (checkAndUnlock(data, 'total_gems_10k')) newlyUnlocked.push('total_gems_10k');

    // Streak achievements
    if (data.daily.streak >= 3) if (checkAndUnlock(data, 'streak_3')) newlyUnlocked.push('streak_3');
    if (data.daily.streak >= 7) if (checkAndUnlock(data, 'streak_7')) newlyUnlocked.push('streak_7');
    if (data.daily.streak >= 14) if (checkAndUnlock(data, 'streak_14')) newlyUnlocked.push('streak_14');
    if (data.daily.streak >= 30) if (checkAndUnlock(data, 'streak_30')) newlyUnlocked.push('streak_30');

    // Daily achievements
    const dailyCount = data.daily.completedDailies.length;
    if (dailyCount >= 1) if (checkAndUnlock(data, 'daily_first')) newlyUnlocked.push('daily_first');
    if (dailyCount >= 7) if (checkAndUnlock(data, 'daily_7')) newlyUnlocked.push('daily_7');
    if (dailyCount >= 30) if (checkAndUnlock(data, 'daily_30')) newlyUnlocked.push('daily_30');

    // Moves achievements
    if (data.stats.totalMoves >= 1000) if (checkAndUnlock(data, 'total_moves_1k')) newlyUnlocked.push('total_moves_1k');
    if (data.stats.totalMoves >= 5000) if (checkAndUnlock(data, 'total_moves_5k')) newlyUnlocked.push('total_moves_5k');

    // Time-based fun achievements
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 5) if (checkAndUnlock(data, 'night_owl')) newlyUnlocked.push('night_owl');
    if (hour >= 5 && hour < 6) if (checkAndUnlock(data, 'early_bird')) newlyUnlocked.push('early_bird');

    return newlyUnlocked;
  }

  function getAchievementProgress(data) {
    const total = ACHIEVEMENTS.length;
    const unlocked = Object.keys(data.achievements).length;
    return { total, unlocked, pct: Math.round((unlocked / total) * 100) };
  }

  // ======== RENDER ========

  function renderAchievementsPage(container, data) {
    const progress = getAchievementProgress(data);
    const categories = {};

    ACHIEVEMENTS.forEach(ach => {
      if (!categories[ach.category]) categories[ach.category] = [];
      categories[ach.category].push({
        ...ach,
        unlocked: !!data.achievements[ach.id]
      });
    });

    const categoryNames = {
      basics: '🎮 入门',
      score: '🏅 得分',
      combo: '🔥 连击',
      progress: '🗺️ 进度',
      stars: '⭐ 星级',
      islands: '🏝️ 岛屿',
      boss: '⚔️ Boss',
      garden: '🌱 花园',
      potion: '🧪 药水',
      daily: '📅 每日',
      gems: '💎 宝石',
      special: '🏆 特殊',
      fun: '🎉 趣味',
      moves: '👣 步数'
    };

    let html = `<div class="achievement-header">
      <h3>🏆 成就进度</h3>
      <div class="achievement-progress-bar">
        <div class="progress-fill" style="width:${progress.pct}%"></div>
        <span class="progress-label">${progress.unlocked}/${progress.total} (${progress.pct}%)</span>
      </div>
    </div>`;

    html += '<div class="streak-info">';
    html += `<div class="streak-item">🔥 连续登录: <strong>${data.daily.streak}天</strong></div>`;
    html += `<div class="streak-item">📅 每日挑战: <strong>${data.daily.completedDailies.length}次</strong></div>`;
    html += `<div class="streak-item">🏆 最佳连续: <strong>${data.daily.bestStreak}天</strong></div>`;
    html += '</div>';

    for (const [cat, achs] of Object.entries(categories)) {
      html += `<div class="achievement-category">`;
      html += `<h4 class="category-title">${categoryNames[cat] || cat}</h4>`;
      html += '<div class="achievement-list">';
      achs.forEach(ach => {
        html += `<div class="achievement-item ${ach.unlocked ? 'unlocked' : 'locked'}">
          <span class="ach-emoji">${ach.unlocked ? ach.emoji : '🔒'}</span>
          <div class="ach-info">
            <span class="ach-name">${ach.name}</span>
            <span class="ach-desc">${ach.desc}</span>
          </div>
        </div>`;
      });
      html += '</div></div>';
    }

    container.innerHTML = html;
  }

  // ======== UTILITIES ========

  function hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return Math.abs(hash);
  }

  function seededRandom(seed) {
    let s = seed;
    return function () {
      s = (s * 16807 + 0) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }

  return {
    ACHIEVEMENTS,
    ACH_MAP,
    getTodayString,
    getDailyChallenge,
    isDailyCompleted,
    completeDailyChallenge,
    updateStreak,
    checkAndUnlock,
    checkAllAchievements,
    getAchievementProgress,
    renderAchievementsPage,
    renderPotionPage: Potion ? Potion.renderPotionPage : null
  };
})();
