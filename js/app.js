/**
 * app.js — 主应用控制器
 * 页面路由、UI更新、系统集成
 */
'use strict';

const App = (() => {
  let currentPage = 'home';
  let selectedIsland = null;
  let selectedSeed = null;
  let selectedPlot = null;
  let dialogueQueue = [];
  let dialogueIndex = 0;
  let currentLevelConfig = null;
  let titleClickCount = 0;

  // ======== INITIALIZATION ========

  function init() {
    // Migrate v1 saves
    Storage.migrateV1();
    Storage.load();
    const data = Storage.get();

    // Update streak on load
    Daily.updateStreak(data);
    Storage.save();

    // Setup audio toggle
    Audio.setEnabled(data.settings.soundEnabled);

    // Setup navigation
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        const page = item.dataset.page;
        if (page) navigateTo(page);
      });
    });

    // Sound toggle
    const soundBtn = document.getElementById('soundToggle');
    if (soundBtn) {
      soundBtn.textContent = Audio.isEnabled() ? '🔊' : '🔇';
      soundBtn.addEventListener('click', () => {
        Audio.init();
        const enabled = !Audio.isEnabled();
        Audio.setEnabled(enabled);
        soundBtn.textContent = enabled ? '🔊' : '🔇';
        data.settings.soundEnabled = enabled;
        Storage.save();
      });
    }

    // Initialize board
    const canvas = document.getElementById('gameCanvas');
    if (canvas) Board.init(canvas);

    // Board callbacks
    Board.setCallbacks({
      onScoreChange: updateGameUI,
      onLevelComplete: handleLevelComplete,
      onLevelFail: handleLevelFail,
      onMoveComplete: (state) => {
        const data = Storage.get();
        if (state.combo > data.stats.maxCombo) data.stats.maxCombo = state.combo;
        data.stats.totalMoves++;
        Storage.save();
      }
    });

    // Check if tutorial needed
    if (!data.tutorialDone) {
      showTutorial();
    } else {
      navigateTo('home');
    }

    // Easter egg on title
    const logo = document.querySelector('.logo');
    if (logo) {
      logo.addEventListener('click', () => {
        titleClickCount++;
        if (titleClickCount >= 10) {
          titleClickCount = 0;
          Daily.checkAndUnlock(data, 'love');
          Storage.save();
          showAchievementToast(Daily.ACH_MAP['love']);
        }
      });
    }

    // Check achievements on load
    const newAch = Daily.checkAllAchievements(data);
    Storage.save();
  }

  // ======== NAVIGATION ========

  function navigateTo(page) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

    // Deactivate all nav items
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    // Show target page
    const targetPage = document.getElementById('page-' + page);
    if (targetPage) {
      targetPage.classList.add('active');
      targetPage.classList.add('page-enter');
      setTimeout(() => targetPage.classList.remove('page-enter'), 300);
    }

    // Activate nav item
    const navItem = document.querySelector(`.nav-item[data-page="${page}"]`);
    if (navItem) navItem.classList.add('active');

    // Show/hide nav for game page
    const nav = document.querySelector('.bottom-nav');
    if (nav) nav.style.display = page === 'game' ? 'none' : 'flex';

    currentPage = page;

    // Render page content
    switch (page) {
      case 'home': renderHome(); break;
      case 'adventure': renderAdventure(); break;
      case 'garden': renderGarden(); break;
      case 'potion': renderPotion(); break;
      case 'achievement': renderAchievements(); break;
    }
  }

  // ======== HOME PAGE ========

  function renderHome() {
    const data = Storage.get();
    const progress = Campaign.getIslandProgress(data);
    const gardenStats = Garden.getGardenStats(data);
    const achProgress = Daily.getAchievementProgress(data);

    // Stats
    setText('homeStars', data.totalStars || 0);
    setText('homeLevels', data.stats.levelsCompleted || 0);
    setText('homeStreak', data.daily.streak || 0);

    // Daily challenge status
    const dailyDone = Daily.isDailyCompleted(data);
    const dailyCard = document.getElementById('dailyChallengeCard');
    if (dailyCard) {
      const desc = dailyCard.querySelector('.action-desc');
      if (desc) desc.textContent = dailyDone ? '✅ 今日已完成' : '🎯 今日挑战等你来！';
    }

    // Continue button shows current level
    const continueCard = document.getElementById('continueCard');
    if (continueCard) {
      const desc = continueCard.querySelector('.action-desc');
      const islandIdx = Math.floor((data.currentLevel || 0) / 15);
      const localLevel = (data.currentLevel || 0) % 15 + 1;
      const island = Campaign.ISLANDS[Math.min(islandIdx, Campaign.ISLANDS.length - 1)];
      if (desc) desc.textContent = `${island.name} — 第${localLevel}关`;
    }
  }

  // ======== ADVENTURE PAGE ========

  function renderAdventure() {
    if (selectedIsland !== null) {
      renderLevelSelect(selectedIsland);
      return;
    }

    const data = Storage.get();
    const progress = Campaign.getIslandProgress(data);
    const container = document.getElementById('islandList');
    if (!container) return;

    let html = '';
    progress.forEach((p, i) => {
      html += `<div class="island-card ${p.unlocked ? '' : 'locked'}" data-island="${i}">
        <span class="island-emoji">${p.island.emoji}</span>
        <div class="island-info">
          <span class="island-name">${p.island.name}</span>
          <span class="island-desc">${p.island.desc}</span>
          <span class="island-progress">${p.completed}/15 完成</span>
          <span class="island-stars">⭐ ${p.totalStars}/${p.maxStars}</span>
        </div>
        ${p.unlocked ? '<span class="action-arrow">›</span>' : `<span class="lock-badge">🔒</span>`}
      </div>`;
    });

    container.innerHTML = html;

    // Click handlers
    container.querySelectorAll('.island-card:not(.locked)').forEach(card => {
      card.addEventListener('click', () => {
        selectedIsland = parseInt(card.dataset.island);
        renderLevelSelect(selectedIsland);
      });
    });
  }

  function renderLevelSelect(islandIndex) {
    const data = Storage.get();
    const island = Campaign.ISLANDS[islandIndex];
    const container = document.getElementById('islandList');
    if (!container) return;

    const startLevel = islandIndex * 15;

    let html = `<div class="level-select">
      <div class="level-select-header">
        <span class="back-btn" id="backToIslands">← </span>
        <h3>${island.emoji} ${island.name}</h3>
      </div>
      <div class="level-grid">`;

    for (let i = 0; i < 15; i++) {
      const globalIdx = startLevel + i;
      const stars = data.stars[globalIdx] || 0;
      const completed = stars > 0;
      const current = globalIdx === (data.currentLevel || 0);
      const locked = globalIdx > (data.currentLevel || 0) && !completed;
      const isBoss = i === 14;

      let starStr = '';
      if (completed) {
        starStr = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
      }

      html += `<div class="level-cell ${completed ? 'completed' : ''} ${current ? 'current' : ''} ${locked ? 'locked' : ''} ${isBoss ? 'boss' : ''}"
                    data-level="${globalIdx}">
        <span class="level-num">${isBoss ? Campaign.BOSSES[island.id].emoji : (i + 1)}</span>
        ${isBoss ? '<span class="boss-icon">BOSS</span>' : ''}
        <span class="level-stars">${starStr}</span>
      </div>`;
    }

    html += '</div></div>';
    container.innerHTML = html;

    // Back button
    document.getElementById('backToIslands').addEventListener('click', () => {
      selectedIsland = null;
      renderAdventure();
    });

    // Level click
    container.querySelectorAll('.level-cell:not(.locked)').forEach(cell => {
      cell.addEventListener('click', () => {
        const levelIdx = parseInt(cell.dataset.level);
        startGameLevel(levelIdx);
      });
    });
  }

  // ======== GAME ========

  function startGameLevel(globalIndex) {
    Audio.init();
    currentLevelConfig = Campaign.getLevelConfig(globalIndex);

    const data = Storage.get();
    const islandIndex = Math.floor(globalIndex / 15);
    const localLevel = globalIndex % 15;
    const island = Campaign.ISLANDS[islandIndex];

    // Show dialogue if island start or boss
    if (localLevel === 0) {
      const dialogue = Campaign.getIslandStartDialogue(island.id);
      if (dialogue.length > 0 && !data.achievements[`seen_${island.id}_start`]) {
        showDialogue(dialogue, () => {
          data.achievements[`seen_${island.id}_start`] = { unlocked: true, unlockedAt: Date.now() };
          Storage.save();
          launchLevel(currentLevelConfig);
        });
        return;
      }
    }

    if (currentLevelConfig.isBoss) {
      const dialogue = Campaign.getBossDialogue(island.id);
      if (dialogue.length > 0) {
        showDialogue(dialogue, () => launchLevel(currentLevelConfig));
        return;
      }
    }

    launchLevel(currentLevelConfig);
  }

  function launchLevel(config) {
    navigateTo('game');

    // Update UI
    const islandIdx = config.islandIndex;
    const island = Campaign.ISLANDS[islandIdx];
    setText('gameLevelBadge', `${island.emoji} ${config.localLevel + 1}`);
    setText('gameMoves', `步数: ${config.moves}`);

    // Potions
    updatePotionButtons();

    // Start board
    Board.startLevel(config);
    Board.startLoop();

    // Set back button
    const backBtn = document.getElementById('gameBackBtn');
    if (backBtn) {
      backBtn.onclick = () => {
        Board.phase = 'paused';
        showModal('quitModal');
      };
    }

    updateGameUI(Board.getState());
  }

  function updateGameUI(state) {
    if (!state) state = Board.getState();

    setText('gameScore', state.score);
    setText('gameTarget', state.targetScore);
    setText('gameCombo', state.combo);
    setText('gameMoves', `步数: ${state.movesLeft}`);

    // Objective display
    let objText = `${state.score} / ${state.targetScore}`;
    if (state.objectives) {
      switch (state.objectives.type) {
        case 'boss':
          objText = `BOSS HP: ${state.bossHp}/${state.bossMaxHp}`;
          break;
        case 'collect':
          if (state.objectives.items) {
            objText = state.objectives.items.map(item =>
              `${item.gemType}: ${state.collectProgress[item.gemType] || 0}/${item.count}`
            ).join(' | ');
          }
          break;
      }
    }

    const pct = state.objectives && state.objectives.type === 'boss'
      ? Math.min(100, ((state.bossMaxHp - state.bossHp) / state.bossMaxHp) * 100)
      : Math.min(100, (state.score / state.targetScore) * 100);

    const progressBar = document.getElementById('gameProgressBar');
    if (progressBar) progressBar.style.width = `${pct}%`;
    setText('gameProgressText', objText);

    if (state.timeLeft > 0) {
      setText('gameMoves', `⏰ ${Math.ceil(state.timeLeft)}s`);
    }
  }

  function updatePotionButtons() {
    const data = Storage.get();
    const potions = ['shuffle', 'time', 'bomb', 'rainbow'];
    const emojis = ['🔄', '⏰', '💥', '🌈'];

    potions.forEach((pot, i) => {
      const btn = document.getElementById(`potionBtn_${pot}`);
      if (btn) {
        const count = data.potions.inventory[pot] || 0;
        btn.querySelector('.potion-count').textContent = count;
        btn.classList.toggle('disabled', count <= 0);
        btn.onclick = () => {
          if (count > 0 && Board.phase === 'idle') {
            if (Potion.usePotion(data, pot)) {
              Board.usePotion(pot);
              Storage.save();
              updatePotionButtons();
            }
          }
        };
      }
    });
  }

  // ======== LEVEL COMPLETE / FAIL ========

  function handleLevelComplete(state) {
    const data = Storage.get();
    const config = currentLevelConfig;
    if (!config) return;

    const globalIdx = config.globalIndex;
    const stars = Campaign.getLevelStars(state.score, state.targetScore);

    // Update save data
    if (!data.highScores[globalIdx] || state.score > data.highScores[globalIdx]) {
      data.highScores[globalIdx] = state.score;
    }
    if (!data.stars[globalIdx] || stars > data.stars[globalIdx]) {
      data.stars[globalIdx] = stars;
    }

    // Recalculate total stars
    let totalStars = 0;
    Object.values(data.stars).forEach(s => totalStars += s);
    data.totalStars = totalStars;

    // Advance level
    if (globalIdx >= data.currentLevel) {
      data.currentLevel = globalIdx + 1;
      data.currentIsland = Math.floor(data.currentLevel / 15);
    }

    // Update stats
    data.stats.levelsCompleted++;
    data.stats.totalScore += state.score;
    if (config.isBoss) data.stats.bossesDefeated++;

    // Garden seeds from match
    const seedReward = Garden.getSeedFromMatch(3, Math.floor(Math.random() * Gems.COUNT));
    if (seedReward) Garden.addSeed(data, seedReward.speciesId);
    // Bonus seeds for stars
    for (let s = 0; s < stars; s++) {
      const bonus = Garden.getSeedFromMatch(3 + s, Math.floor(Math.random() * Gems.COUNT));
      if (bonus) Garden.addSeed(data, bonus.speciesId);
    }

    // Check achievements
    if (state.movesLeft <= 0) Daily.checkAndUnlock(data, 'close_call');
    if (state.score >= 1000) Daily.checkAndUnlock(data, 'score_1k');
    if (state.score >= 5000) Daily.checkAndUnlock(data, 'score_5k');
    if (state.score >= 10000) Daily.checkAndUnlock(data, 'score_10k');
    Daily.checkAndUnlock(data, 'first_level');
    if (config.isBoss) Daily.checkAndUnlock(data, 'first_boss');

    const newAch = Daily.checkAllAchievements(data);
    Storage.save();

    // Show modal
    const starStr = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
    const titles = ['通关！', '太棒了！', '完美通关！'];

    document.getElementById('completeEmoji').textContent = stars === 3 ? '🏆' : '🎉';
    document.getElementById('completeTitle').textContent = titles[stars - 1] || '通关！';
    document.getElementById('completeStars').textContent = starStr;
    document.getElementById('completeText').textContent =
      `第${config.localLevel + 1}关完成！得分: ${state.score}`;

    // Seed reward display
    const seedInfo = document.getElementById('completeSeedInfo');
    if (seedInfo) {
      seedInfo.textContent = `🌱 获得 ${1 + stars} 颗种子！`;
    }

    showModal('completeModal');

    // Show achievement toasts
    newAch.forEach((achId, i) => {
      setTimeout(() => {
        const ach = Daily.ACH_MAP[achId];
        if (ach) showAchievementToast(ach);
      }, (i + 1) * 800);
    });

    // Check island complete dialogue
    if (config.isBoss) {
      const dialogue = Campaign.getIslandCompleteDialogue(config.island.id);
      if (dialogue.length > 0) {
        // Will show after modal is dismissed
        document.getElementById('nextLevelBtn').onclick = () => {
          hideModal('completeModal');
          showDialogue(dialogue, () => {
            selectedIsland = null;
            navigateTo('adventure');
          });
        };
        return;
      }
    }

    document.getElementById('nextLevelBtn').onclick = () => {
      hideModal('completeModal');
      startGameLevel(globalIdx + 1);
    };
  }

  function handleLevelFail(state) {
    showModal('failModal');

    document.getElementById('retryBtn').onclick = () => {
      hideModal('failModal');
      if (currentLevelConfig) launchLevel(currentLevelConfig);
    };

    document.getElementById('failHomeBtn').onclick = () => {
      hideModal('failModal');
      navigateTo('home');
    };
  }

  // ======== GARDEN PAGE ========

  function renderGarden() {
    const data = Storage.get();
    const container = document.getElementById('gardenContainer');
    if (!container) return;

    const stats = Garden.getGardenStats(data);

    // Stats header
    let html = `<div class="garden-header">
      <h3>🌱 我的花园</h3>
      <span class="text-dim">🌿 ${stats.growing} 生长中 | ✨ ${stats.ready} 可收获 | 📖 ${stats.speciesCount}/${stats.totalSpecies} 物种</span>
    </div>`;

    // Garden grid
    html += '<div class="garden-grid">';
    const layout = data.garden.layout;
    for (let r = 0; r < layout.rows; r++) {
      for (let c = 0; c < layout.cols; c++) {
        const plot = data.garden.plots.find(p => p.x === c && p.y === r);
        html += `<div class="garden-plot" data-x="${c}" data-y="${r}">`;

        if (plot) {
          const species = Garden.SPECIES_MAP[plot.speciesId];
          const stage = Garden.getPlantStage(plot);
          const stageEmoji = species ? species.stages[stage] : '🌱';
          const pct = Math.round(Garden.getGrowthPercent(plot));
          const grown = Garden.isFullyGrown(plot);

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

    // Seeds section
    const seedEntries = Object.entries(data.garden.seeds).filter(([_, count]) => count > 0);
    if (seedEntries.length > 0) {
      html += '<div class="garden-seeds"><h3 class="section-title mt-12">🌰 种子袋</h3><div class="seed-list">';
      seedEntries.forEach(([speciesId, count]) => {
        const species = Garden.SPECIES_MAP[speciesId];
        if (species) {
          html += `<div class="seed-item" data-species="${speciesId}">
            <span>${species.stages[species.stages.length - 1]}</span>
            <span>${species.name}</span>
            <span class="text-accent">×${count}</span>
          </div>`;
        }
      });
      html += '</div></div>';
    }

    container.innerHTML = html;

    // Click handlers for plots
    container.querySelectorAll('.garden-plot').forEach(plot => {
      plot.addEventListener('click', () => {
        const x = parseInt(plot.dataset.x);
        const y = parseInt(plot.dataset.y);
        const existingPlot = data.garden.plots.find(p => p.x === x && p.y === y);

        if (existingPlot) {
          const plotIndex = data.garden.plots.indexOf(existingPlot);
          if (Garden.isFullyGrown(existingPlot) && !existingPlot.harvested) {
            // Harvest
            Audio.init();
            Audio.playHarvest();
            const reward = Garden.harvestPlant(data, plotIndex);
            Storage.save();
            if (reward) {
              showAchievementToast({
                emoji: '🌾',
                name: '收获!',
                desc: reward.type === 'gems' ? `+${reward.amount} 材料` : `+1 ${Potion.RECIPES[reward.item].name}`
              });
            }
            Daily.checkAndUnlock(data, 'first_harvest');
            Daily.checkAllAchievements(data);
            Storage.save();
            renderGarden();
          } else if (existingPlot.harvested) {
            // Remove harvested plant
            Garden.removePlant(data, plotIndex);
            Storage.save();
            renderGarden();
          }
        } else {
          // Show seed picker
          selectedPlot = { x, y };
          showSeedPicker();
        }
      });
    });

    // Seed selection
    container.querySelectorAll('.seed-item').forEach(item => {
      item.addEventListener('click', () => {
        selectedSeed = item.dataset.species;
        container.querySelectorAll('.seed-item').forEach(s => s.classList.remove('selected'));
        item.classList.add('selected');
      });
    });
  }

  function showSeedPicker() {
    const data = Storage.get();
    const seedEntries = Object.entries(data.garden.seeds).filter(([_, count]) => count > 0);

    if (seedEntries.length === 0) {
      showAchievementToast({ emoji: '🌰', name: '没有种子', desc: '玩关卡来获取种子吧！' });
      return;
    }

    let html = '<div class="seed-picker">';
    seedEntries.forEach(([speciesId, count]) => {
      const species = Garden.SPECIES_MAP[speciesId];
      if (!species) return;
      const rarityColors = { common: '#888', uncommon: '#4ECDC4', rare: '#A29BFE', legendary: '#FFD700' };
      html += `<div class="seed-option" data-species="${speciesId}">
        <span class="seed-emoji">${species.stages[species.stages.length - 1]}</span>
        <div class="seed-info">
          <span class="seed-name">${species.name}</span>
          <span class="seed-rarity" style="color:${rarityColors[species.rarity]}">${species.rarity}</span>
        </div>
        <span class="seed-qty">×${count}</span>
      </div>`;
    });
    html += '</div>';

    document.getElementById('seedPickerContent').innerHTML = html;
    showModal('seedModal');

    // Click handlers
    document.querySelectorAll('.seed-option').forEach(opt => {
      opt.addEventListener('click', () => {
        const speciesId = opt.dataset.species;
        if (selectedPlot && Garden.plantSeed(data, speciesId, selectedPlot.x, selectedPlot.y)) {
          Audio.init();
          Audio.playPlant();
          Daily.checkAndUnlock(data, 'first_plant');
          Daily.checkAllAchievements(data);
          Storage.save();
          hideModal('seedModal');
          renderGarden();
        }
      });
    });
  }

  // ======== POTION PAGE ========

  function renderPotion() {
    const data = Storage.get();
    const container = document.getElementById('potionContainer');
    if (!container) return;

    Potion.renderPotionPage(container, data);

    // Bind craft buttons
    container.querySelectorAll('.btn-craft').forEach(btn => {
      btn.addEventListener('click', () => {
        const potionId = btn.dataset.potion;
        Audio.init();
        if (Potion.craft(data, potionId)) {
          Audio.playCraft();
          Daily.checkAndUnlock(data, 'first_potion');
          Daily.checkAllAchievements(data);
          Storage.save();
          renderPotion();
          showAchievementToast({
            emoji: Potion.RECIPES[potionId].emoji,
            name: '合成成功!',
            desc: `${Potion.RECIPES[potionId].name} +1`
          });
        }
      });
    });
  }

  // ======== ACHIEVEMENTS PAGE ========

  function renderAchievements() {
    const data = Storage.get();
    const container = document.getElementById('achievementContainer');
    if (!container) return;

    Daily.renderAchievementsPage(container, data);
  }

  // ======== DAILY CHALLENGE ========

  function startDailyChallenge() {
    Audio.init();
    const data = Storage.get();

    if (Daily.isDailyCompleted(data)) {
      showAchievementToast({ emoji: '✅', name: '今日已完成', desc: '明天再来挑战吧！' });
      return;
    }

    const dailyConfig = Daily.getDailyChallenge();
    currentLevelConfig = {
      ...dailyConfig,
      islandIndex: 0,
      localLevel: 0,
      island: { id: 'daily', name: '每日挑战', emoji: '📅' },
      isBoss: false,
      globalIndex: -1  // Special marker for daily
    };

    launchLevel(currentLevelConfig);

    // Override complete handler for daily
    Board.setCallbacks({
      onScoreChange: updateGameUI,
      onLevelComplete: (state) => {
        Daily.completeDailyChallenge(data, state.score);
        Daily.checkAllAchievements(data);
        Storage.save();

        document.getElementById('completeEmoji').textContent = '📅';
        document.getElementById('completeTitle').textContent = '每日挑战完成!';
        document.getElementById('completeStars').textContent = `得分: ${state.score}`;
        document.getElementById('completeText').textContent = `🔥 连续${data.daily.streak}天！`;
        if (document.getElementById('completeSeedInfo')) {
          document.getElementById('completeSeedInfo').textContent = '';
        }

        showModal('completeModal');
        document.getElementById('nextLevelBtn').onclick = () => {
          hideModal('completeModal');
          navigateTo('home');
        };
      },
      onLevelFail: handleLevelFail,
      onMoveComplete: (state) => {
        const d = Storage.get();
        d.stats.totalMoves++;
        Storage.save();
      }
    });
  }

  // ======== DIALOGUE SYSTEM ========

  function showDialogue(dialogues, onComplete) {
    dialogueQueue = dialogues;
    dialogueIndex = 0;
    const overlay = document.getElementById('dialogueOverlay');
    const box = document.getElementById('dialogueBox');

    if (!overlay || !box) {
      if (onComplete) onComplete();
      return;
    }

    function showLine() {
      if (dialogueIndex >= dialogueQueue.length) {
        overlay.classList.remove('show');
        if (onComplete) onComplete();
        return;
      }

      const line = dialogueQueue[dialogueIndex];
      const portrait = document.getElementById('dialoguePortrait');
      const speaker = document.getElementById('dialogueSpeaker');
      const text = document.getElementById('dialogueText');

      if (portrait) portrait.textContent = line.mood ? Campaign.CHARACTER.portraits[line.mood] || '🥭' : line.speaker.substring(0, 2);
      if (speaker) speaker.textContent = line.speaker;
      if (text) text.textContent = line.text;

      dialogueIndex++;
    }

    overlay.classList.add('show');
    showLine();

    overlay.onclick = () => {
      Audio.init();
      Audio.playSelect();
      showLine();
    };
  }

  // ======== TUTORIAL ========

  function showTutorial() {
    const overlay = document.getElementById('tutorialOverlay');
    if (!overlay) return;

    // Render gem previews
    const gemsDiv = document.getElementById('tutorialGems');
    if (gemsDiv) {
      gemsDiv.innerHTML = '';
      Gems.TYPES.forEach(g => {
        const d = document.createElement('div');
        d.className = 'tutorial-gem';
        d.style.background = `radial-gradient(circle at 35% 35%, ${g.c1}, ${g.c2})`;
        d.style.boxShadow = `0 2px 8px ${g.c2}40`;
        gemsDiv.appendChild(d);
      });
    }

    overlay.classList.add('show');

    document.getElementById('startGameBtn').addEventListener('click', () => {
      Audio.init();
      const data = Storage.get();
      data.tutorialDone = true;
      Storage.save();
      overlay.classList.remove('show');
      navigateTo('home');
    });
  }

  // ======== MODALS ========

  function showModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('show');
  }

  function hideModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('show');
  }

  function showAchievementToast(ach) {
    if (!ach) return;
    const toast = document.createElement('div');
    toast.className = 'achievement-toast';
    toast.innerHTML = `
      <span class="toast-emoji">${ach.emoji}</span>
      <div class="toast-text">
        <div class="toast-title">${ach.name}</div>
        <div class="toast-desc">${ach.desc || ''}</div>
      </div>`;
    document.body.appendChild(toast);
    Audio.playAchievement();
    setTimeout(() => toast.remove(), 3200);
  }

  // ======== HELPERS ========

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  // ======== PUBLIC ========

  return {
    init,
    navigateTo,
    startDailyChallenge,
    startGameLevel,
    showModal,
    hideModal
  };
})();

// ======== BOOT ========
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
