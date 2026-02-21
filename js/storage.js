/**
 * storage.js — 持久化存储系统
 * 管理所有游戏状态的保存与加载
 */
'use strict';

const Storage = (() => {
  const SAVE_KEY = 'mangoMatch_v2';

  // Default save structure
  function defaults() {
    return {
      version: 2,
      tutorialDone: false,
      currentIsland: 0,
      currentLevel: 0,        // global level index 0-149
      highScores: {},          // { levelIndex: score }
      stars: {},               // { levelIndex: 1|2|3 }
      totalStars: 0,

      // Garden
      garden: {
        plots: [],             // [{speciesId, plantedAt, wateredAt, stage, x, y}]
        unlockedSpecies: [],
        seeds: {},             // { speciesId: count }
        layout: { rows: 4, cols: 5 }
      },

      // Potions
      potions: {
        inventory: { shuffle: 0, time: 0, bomb: 0, rainbow: 0 },
        ingredients: { red: 0, orange: 0, green: 0, blue: 0, purple: 0, yellow: 0, pink: 0 }
      },

      // Daily / Achievements
      daily: {
        lastPlayedDate: null,
        streak: 0,
        bestStreak: 0,
        completedDailies: [],  // ['2026-02-21', ...]
        weeklyBest: 0
      },
      achievements: {},        // { achId: { unlocked: true, unlockedAt: timestamp } }

      // Settings
      settings: {
        soundEnabled: true,
        theme: 'classic',
        gemSkin: 'fruit'
      },

      // Stats
      stats: {
        totalMatches: 0,
        totalGems: 0,
        totalScore: 0,
        totalMoves: 0,
        maxCombo: 0,
        timePlayed: 0,
        levelsCompleted: 0,
        bossesDefeated: 0
      }
    };
  }

  let _data = null;

  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // Merge with defaults to handle new fields
        _data = deepMerge(defaults(), parsed);
      } else {
        _data = defaults();
      }
    } catch (e) {
      console.warn('Save data corrupted, resetting:', e);
      _data = defaults();
    }
    return _data;
  }

  function save() {
    if (!_data) return;
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(_data));
    } catch (e) {
      console.warn('Failed to save:', e);
    }
  }

  function get() {
    if (!_data) load();
    return _data;
  }

  function reset() {
    _data = defaults();
    save();
    return _data;
  }

  // Migrate from v1 save
  function migrateV1() {
    try {
      const old = JSON.parse(localStorage.getItem('mangoMatchSave'));
      if (old) {
        const d = defaults();
        d.tutorialDone = old.tutorialDone || false;
        d.currentLevel = old.currentLevel || 0;
        d.currentIsland = Math.floor(d.currentLevel / 15);
        if (old.highScores) d.highScores = old.highScores;
        _data = d;
        save();
        localStorage.removeItem('mangoMatchSave');
      }
    } catch (e) { /* ignore */ }
  }

  // Deep merge: target gets any missing keys from source
  function deepMerge(source, target) {
    const result = { ...source };
    for (const key in target) {
      if (target[key] !== null && typeof target[key] === 'object' && !Array.isArray(target[key])
          && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = deepMerge(source[key], target[key]);
      } else {
        result[key] = target[key];
      }
    }
    return result;
  }

  return { load, save, get, reset, migrateV1, defaults };
})();
