/**
 * Capybara Snake Master - Engine & Logic
 * Multi-theme, Web Audio Synth, Power-up system, Touch & Keyboard controls
 */

// Canvas roundRect polyfill for maximum browser compatibility
if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, radii) {
    if (typeof radii === 'undefined') radii = 0;
    if (typeof radii === 'number') radii = [radii, radii, radii, radii];
    const r = radii[0] || 0;
    this.beginPath();
    this.moveTo(x + r, y);
    this.arcTo(x + w, y, x + w, y + h, r);
    this.arcTo(x + w, y + h, x, y + h, r);
    this.arcTo(x, y + h, x, y, r);
    this.arcTo(x, y + w, x, y, r);
    this.closePath();
    return this;
  };
}

// Safe storage helper to prevent file:// protocol SecurityErrors
function getStoredHighScore() {
  try {
    return parseInt(localStorage.getItem('capybara_snake_highscore') || '0', 10) || 0;
  } catch (e) {
    return 0;
  }
}

function setStoredHighScore(score) {
  try {
    localStorage.setItem('capybara_snake_highscore', score.toString());
  } catch (e) {}
}

class SoundSynth {
  constructor() {
    this.audioCtx = null;
    this.enabled = true;
  }

  init() {
    try {
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass();
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
    } catch (e) {}
  }

  playEat() {
    if (!this.enabled || !this.audioCtx) return;
    try {
      this.init();
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.audioCtx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.1);
    } catch (e) {}
  }

  playPowerup() {
    if (!this.enabled || !this.audioCtx) return;
    try {
      this.init();
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
      osc.frequency.setValueAtTime(1046.50, now + 0.24); // C6
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(now + 0.35);
    } catch (e) {}
  }

  playGameOver() {
    if (!this.enabled || !this.audioCtx) return;
    try {
      this.init();
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.linearRampToValueAtTime(100, now + 0.4);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(now + 0.4);
    } catch (e) {}
  }

  playClick() {
    if (!this.enabled || !this.audioCtx) return;
    try {
      this.init();
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.05);
    } catch (e) {}
  }

  playHurt() {
    if (!this.enabled || !this.audioCtx) return;
    try {
      this.init();
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.linearRampToValueAtTime(90, now + 0.2);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(now + 0.2);
    } catch (e) {}
  }

  playLifeUp() {
    if (!this.enabled || !this.audioCtx) return;
    try {
      this.init();
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880, now + 0.08); // A5
      osc.frequency.setValueAtTime(1174.66, now + 0.16); // D6
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(now + 0.3);
    } catch (e) {}
  }
}

class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.vx = (Math.random() - 0.5) * 6;
    this.vy = (Math.random() - 0.5) * 6;
    this.life = 1.0;
    this.decay = 0.03 + Math.random() * 0.03;
    this.size = Math.random() * 4 + 3;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life -= this.decay;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.life);
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * this.life, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

class SnakeGame {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    
    // Grid settings
    this.gridCount = 20;
    this.cellSize = this.canvas.width / this.gridCount;

    // Audio Synth
    this.synth = new SoundSynth();

    // Game state
    this.snake = [];
    this.dir = { x: 1, y: 0 };
    this.nextDir = { x: 1, y: 0 };
    this.food = null;
    this.starFood = null; // ⭐ Star food (+1 life, max 3)
    this.monster = null;  // 👾 Monster (-1 life)
    this.lives = 3;       // Max 3 lives
    this.invulnerableUntil = 0;
    this.powerup = null;  // { x, y, type: 'double'|'slow'|'magnet'|'bomb', duration }
    this.particles = [];
    
    this.score = 0;
    this.highScore = getStoredHighScore();
    this.foodEatenCount = 0;
    this.combo = 1.0;
    this.lastEatTime = 0;
    this.startTime = 0;
    this.gameTimeSeconds = 0;

    this.baseSpeed = 120; // ms per tick
    this.currentSpeed = 120;
    this.activePowerup = null; // { type, endTime }
    
    this.mode = 'classic'; // 'classic' | 'endless' | 'frenzy'
    this.theme = 'capybara'; // 'capybara' | 'cat' | 'cyberpunk' | 'classic'
    this.isPlaying = false;
    this.isPaused = false;

    this.timerId = null;
    this.touchStartX = 0;
    this.touchStartY = 0;

    this.initDOM();
    this.bindEvents();
    this.resetGame();
    this.draw();
  }

  initDOM() {
    this.livesEl = document.getElementById('livesVal');
    this.scoreEl = document.getElementById('scoreVal');
    this.highScoreEl = document.getElementById('highScoreVal');
    this.comboEl = document.getElementById('comboVal');
    this.lengthEl = document.getElementById('lengthVal');
    
    this.overlay = document.getElementById('gameOverlay');
    this.overlayTitle = document.getElementById('overlayTitle');
    this.overlaySubtitle = document.getElementById('overlaySubtitle');
    this.overlayIcon = document.getElementById('overlayIcon');
    this.finalStats = document.getElementById('finalStats');
    this.finalScore = document.getElementById('finalScore');
    this.finalFood = document.getElementById('finalFood');
    this.finalTime = document.getElementById('finalTime');

    this.powerupBanner = document.getElementById('powerupBanner');
    this.powerupText = document.getElementById('powerupText');
    this.powerupBar = document.getElementById('powerupBar');

    this.pauseBtn = document.getElementById('pauseBtn');
    this.startBtn = document.getElementById('startBtn');
    this.restartBtn = document.getElementById('restartBtn');
    this.soundBtn = document.getElementById('soundToggle');

    this.themeSelect = document.getElementById('themeSelect');
    this.modeSelect = document.getElementById('modeSelect');

    if (this.highScoreEl) {
      this.highScoreEl.textContent = this.highScore;
    }
  }

  bindEvents() {
    // Keyboard Controls
    window.addEventListener('keydown', (e) => this.handleKeyDown(e));

    // UI Buttons
    if (this.startBtn) {
      this.startBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.startBtn.blur();
        this.synth.init();
        this.synth.playClick();
        this.startGame();
      });
    }

    if (this.restartBtn) {
      this.restartBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.restartBtn.blur();
        this.synth.init();
        this.synth.playClick();
        this.startGame();
      });
    }

    if (this.pauseBtn) {
      this.pauseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.pauseBtn.blur();
        this.synth.playClick();
        this.togglePause();
      });
    }

    if (this.soundBtn) {
      this.soundBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.soundBtn.blur();
        this.synth.enabled = !this.synth.enabled;
        const iconEl = document.getElementById('soundIcon');
        if (iconEl) iconEl.textContent = this.synth.enabled ? '🔊' : '🔇';
      });
    }

    // Theme & Mode Select
    if (this.themeSelect) {
      this.themeSelect.addEventListener('change', (e) => {
        this.theme = e.target.value;
        document.body.className = `theme-${this.theme}`;
        this.draw();
      });
    }

    if (this.modeSelect) {
      this.modeSelect.addEventListener('change', (e) => {
        this.mode = e.target.value;
      });
    }

    // Speed Selector Buttons
    document.querySelectorAll('.speed-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        btn.blur();
        this.baseSpeed = parseInt(btn.dataset.speed, 10);
        if (!this.activePowerup || this.activePowerup.type !== 'slow') {
          this.currentSpeed = this.baseSpeed;
        }
      });
    });

    // D-Pad Touch Controls
    document.querySelectorAll('.dpad-btn').forEach(btn => {
      const triggerDpad = (e) => {
        e.preventDefault();
        this.synth.init();
        const dirStr = btn.dataset.dir;
        if (!this.isPlaying) {
          this.startGame();
        }
        this.setDirectionByString(dirStr);
      };
      btn.addEventListener('touchstart', triggerDpad, { passive: false });
      btn.addEventListener('click', triggerDpad);
    });

    // Touch Swipe Gestures on Canvas
    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    this.canvas.addEventListener('touchend', (e) => {
      if (e.changedTouches.length > 0) {
        const dx = e.changedTouches[0].clientX - this.touchStartX;
        const dy = e.changedTouches[0].clientY - this.touchStartY;
        if (!this.isPlaying) {
          this.startGame();
        }
        if (Math.abs(dx) > Math.abs(dy)) {
          if (dx > 20) this.setDirectionByString('RIGHT');
          else if (dx < -20) this.setDirectionByString('LEFT');
        } else {
          if (dy > 20) this.setDirectionByString('DOWN');
          else if (dy < -20) this.setDirectionByString('UP');
        }
      }
    }, { passive: true });

    // Help Modal logic
    const helpModal = document.getElementById('helpModal');
    const helpBtn = document.getElementById('helpBtn');
    const closeHelpBtn = document.getElementById('closeHelpBtn');
    if (helpBtn && helpModal) {
      helpBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        helpBtn.blur();
        this.synth.playClick();
        helpModal.classList.remove('hidden');
      });
    }
    if (closeHelpBtn && helpModal) {
      closeHelpBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        helpModal.classList.add('hidden');
      });
    }
    if (helpModal) {
      window.addEventListener('click', (e) => {
        if (e.target === helpModal) helpModal.classList.add('hidden');
      });
    }
  }

  setDirectionByString(dirStr) {
    if (!this.isPlaying || this.isPaused) return;
    switch (dirStr) {
      case 'UP':
        if (this.dir.y !== 1) this.nextDir = { x: 0, y: -1 };
        break;
      case 'DOWN':
        if (this.dir.y !== -1) this.nextDir = { x: 0, y: 1 };
        break;
      case 'LEFT':
        if (this.dir.x !== 1) this.nextDir = { x: -1, y: 0 };
        break;
      case 'RIGHT':
        if (this.dir.x !== -1) this.nextDir = { x: 1, y: 0 };
        break;
    }
  }

  handleKeyDown(e) {
    this.synth.init();

    // Prevent scrolling for game controls
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
      e.preventDefault();
    }

    // Auto-start on any action key if game not started
    if (!this.isPlaying) {
      if (['Space', 'Enter', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        this.startGame();
        if (['KeyW', 'ArrowUp'].includes(e.code)) this.nextDir = { x: 0, y: -1 };
        else if (['KeyS', 'ArrowDown'].includes(e.code)) this.nextDir = { x: 0, y: 1 };
        else if (['KeyA', 'ArrowLeft'].includes(e.code)) this.nextDir = { x: -1, y: 0 };
        else if (['KeyD', 'ArrowRight'].includes(e.code)) this.nextDir = { x: 1, y: 0 };
        return;
      }
    }

    if (e.code === 'Space') {
      this.togglePause();
      return;
    }

    if (e.code === 'KeyP') {
      if (this.isPlaying) this.togglePause();
      return;
    }

    if (e.code === 'KeyR') {
      this.startGame();
      return;
    }

    if (!this.isPlaying || this.isPaused) return;

    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        if (this.dir.y !== 1) this.nextDir = { x: 0, y: -1 };
        break;
      case 'KeyS':
      case 'ArrowDown':
        if (this.dir.y !== -1) this.nextDir = { x: 0, y: 1 };
        break;
      case 'KeyA':
      case 'ArrowLeft':
        if (this.dir.x !== 1) this.nextDir = { x: -1, y: 0 };
        break;
      case 'KeyD':
      case 'ArrowRight':
        if (this.dir.x !== -1) this.nextDir = { x: 1, y: 0 };
        break;
    }
  }

  resetGame() {
    const center = Math.floor(this.gridCount / 2);
    this.snake = [
      { x: center, y: center },
      { x: center - 1, y: center },
      { x: center - 2, y: center }
    ];
    this.dir = { x: 1, y: 0 };
    this.nextDir = { x: 1, y: 0 };
    this.score = 0;
    this.lives = 3;
    this.starFood = null;
    this.monster = null;
    this.invulnerableUntil = 0;
    this.foodEatenCount = 0;
    this.combo = 1.0;
    this.lastEatTime = 0;
    this.particles = [];
    this.activePowerup = null;
    this.powerup = null;
    this.currentSpeed = this.baseSpeed;

    this.updateHUD();
    this.spawnFood();
    this.spawnMonster();
    this.spawnStarFood();
  }

  startGame() {
    this.resetGame();
    this.isPlaying = true;
    this.isPaused = false;
    this.startTime = Date.now();
    if (this.pauseBtn) {
      this.pauseBtn.disabled = false;
      this.pauseBtn.textContent = '⏸️ 暫停 (P)';
    }
    if (this.overlay) this.overlay.classList.add('hidden');
    if (this.finalStats) this.finalStats.classList.add('hidden');

    if (this.timerId) clearTimeout(this.timerId);
    this.gameLoop();
  }

  togglePause() {
    if (!this.isPlaying) return;
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      if (this.overlayTitle) this.overlayTitle.textContent = '⏸️ 遊戲已暫停';
      if (this.overlaySubtitle) this.overlaySubtitle.textContent = '按下 P 鍵或 Space 繼續遊戲';
      if (this.overlayIcon) this.overlayIcon.textContent = '⏸️';
      if (this.overlay) this.overlay.classList.remove('hidden');
      if (this.pauseBtn) this.pauseBtn.textContent = '▶️ 繼續 (P)';
    } else {
      if (this.overlay) this.overlay.classList.add('hidden');
      if (this.pauseBtn) this.pauseBtn.textContent = '⏸️ 暫停 (P)';
      this.gameLoop();
    }
  }

  gameOver() {
    this.synth.playGameOver();
    this.isPlaying = false;
    if (this.pauseBtn) this.pauseBtn.disabled = true;

    this.gameTimeSeconds = Math.floor((Date.now() - this.startTime) / 1000);

    if (this.score > this.highScore) {
      this.highScore = this.score;
      setStoredHighScore(this.highScore);
      if (this.highScoreEl) this.highScoreEl.textContent = this.highScore;
    }

    if (this.overlayIcon) this.overlayIcon.textContent = '💀';
    if (this.overlayTitle) this.overlayTitle.textContent = 'GAMEOVER 遊戲結束';
    if (this.overlaySubtitle) this.overlaySubtitle.textContent = this.score >= this.highScore ? '🎉 創下新紀錄！做得太棒了！' : '再試一次挑戰高分吧！';

    if (this.finalScore) this.finalScore.textContent = this.score;
    if (this.finalFood) this.finalFood.textContent = this.foodEatenCount;
    if (this.finalTime) this.finalTime.textContent = `${this.gameTimeSeconds}s`;
    if (this.finalStats) this.finalStats.classList.remove('hidden');
    if (this.startBtn) this.startBtn.textContent = '🔄 重新開始';
    if (this.overlay) this.overlay.classList.remove('hidden');
  }

  spawnFood() {
    let x, y, valid = false;
    let attempts = 0;
    while (!valid && attempts < 500) {
      attempts++;
      x = Math.floor(Math.random() * this.gridCount);
      y = Math.floor(Math.random() * this.gridCount);
      valid = !this.snake.some(segment => segment.x === x && segment.y === y);
    }
    this.food = { x, y };

    // Spawn powerup occasionally (25% chance or in Frenzy mode 50%)
    const powerupChance = this.mode === 'frenzy' ? 0.5 : 0.25;
    if (!this.powerup && Math.random() < powerupChance && this.snake.length > 5) {
      const types = ['double', 'slow', 'magnet', 'bomb'];
      const pType = types[Math.floor(Math.random() * types.length)];
      let px, py, pValid = false;
      let pAttempts = 0;
      while (!pValid && pAttempts < 500) {
        pAttempts++;
        px = Math.floor(Math.random() * this.gridCount);
        py = Math.floor(Math.random() * this.gridCount);
        pValid = (px !== x || py !== y) && !this.snake.some(s => s.x === px && s.y === py);
      }
      if (pValid) {
        this.powerup = { x: px, y: py, type: pType, spawnTime: Date.now() };
      }
    }
  }

  spawnMonster() {
    let mx, my, valid = false;
    let attempts = 0;
    while (!valid && attempts < 500) {
      attempts++;
      mx = Math.floor(Math.random() * this.gridCount);
      my = Math.floor(Math.random() * this.gridCount);
      valid = !this.snake.some(s => s.x === mx && s.y === my) && (!this.food || (this.food.x !== mx || this.food.y !== my));
    }
    if (valid) {
      this.monster = { x: mx, y: my, moveTimer: 0 };
    }
  }

  spawnStarFood() {
    if (this.lives >= 3) return;
    let sx, sy, valid = false;
    let attempts = 0;
    while (!valid && attempts < 500) {
      attempts++;
      sx = Math.floor(Math.random() * this.gridCount);
      sy = Math.floor(Math.random() * this.gridCount);
      valid = !this.snake.some(s => s.x === sx && s.y === sy) && (!this.food || (this.food.x !== sx || this.food.y !== sy));
    }
    if (valid) {
      this.starFood = { x: sx, y: sy, spawnTime: Date.now() };
    }
  }

  handleHitDamage(reason) {
    if (Date.now() < this.invulnerableUntil) return;
    this.lives -= 1;
    this.invulnerableUntil = Date.now() + 1500;
    this.synth.playHurt();
    this.updateHUD();
    if (this.lives <= 0) {
      this.gameOver();
    } else {
      const center = Math.floor(this.gridCount / 2);
      this.dir = { x: 1, y: 0 };
      this.nextDir = { x: 1, y: 0 };
      const len = this.snake.length;
      this.snake = [];
      for (let i = 0; i < len; i++) {
        this.snake.push({ x: (center - i + this.gridCount) % this.gridCount, y: center });
      }
    }
  }

  createParticles(gridX, gridY, color) {
    const pixelX = gridX * this.cellSize + this.cellSize / 2;
    const pixelY = gridY * this.cellSize + this.cellSize / 2;
    for (let i = 0; i < 16; i++) {
      this.particles.push(new Particle(pixelX, pixelY, color));
    }
  }

  gameLoop() {
    if (!this.isPlaying || this.isPaused) return;

    this.update();
    this.draw();

    if (this.timerId) clearTimeout(this.timerId);
    this.timerId = setTimeout(() => this.gameLoop(), this.currentSpeed);
  }

  update() {
    this.dir = this.nextDir;
    const head = { x: this.snake[0].x + this.dir.x, y: this.snake[0].y + this.dir.y };

    // Wall Collision Check according to game mode
    if (this.mode === 'endless') {
      if (head.x < 0) head.x = this.gridCount - 1;
      if (head.x >= this.gridCount) head.x = 0;
      if (head.y < 0) head.y = this.gridCount - 1;
      if (head.y >= this.gridCount) head.y = 0;
    } else {
      if (head.x < 0 || head.x >= this.gridCount || head.y < 0 || head.y >= this.gridCount) {
        this.handleHitDamage('💥 撞到牆壁了！');
        return;
      }
    }

    // Self Collision Check
    if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
      this.handleHitDamage('💥 咬到自己了！');
      return;
    }

    this.snake.unshift(head);

    // Roaming Monster Movement
    if (this.monster) {
      this.monster.moveTimer++;
      if (this.monster.moveTimer % 4 === 0 && Math.random() < 0.6) {
        const dirs = [{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}];
        const rd = dirs[Math.floor(Math.random() * dirs.length)];
        const nx = Math.max(0, Math.min(this.gridCount - 1, this.monster.x + rd.x));
        const ny = Math.max(0, Math.min(this.gridCount - 1, this.monster.y + rd.y));
        if (!this.snake.some(s => s.x === nx && s.y === ny)) {
          this.monster.x = nx;
          this.monster.y = ny;
        }
      }

      // Monster Collision Check (-1 life)
      if (head.x === this.monster.x && head.y === this.monster.y) {
        if (Date.now() > this.invulnerableUntil) {
          this.lives -= 1;
          this.invulnerableUntil = Date.now() + 1500;
          this.synth.playHurt();
          this.createParticles(this.monster.x, this.monster.y, '#ff0055');
          this.spawnMonster();
          this.updateHUD();
          if (this.lives <= 0) {
            this.gameOver();
            return;
          }
        }
      }
    }

    // Star Food Collision Check (+1 life, max 3)
    if (this.starFood && head.x === this.starFood.x && head.y === this.starFood.y) {
      this.synth.playLifeUp();
      this.createParticles(this.starFood.x, this.starFood.y, '#ffd700');
      if (this.lives < 3) {
        this.lives++;
      }
      this.starFood = null;
      this.updateHUD();
    }

    // Active Magnet Powerup effect: attract food if close
    if (this.activePowerup && this.activePowerup.type === 'magnet' && this.food) {
      const dist = Math.hypot(this.food.x - head.x, this.food.y - head.y);
      if (dist < 4 && dist > 0) {
        if (this.food.x < head.x) this.food.x++;
        else if (this.food.x > head.x) this.food.x--;
        if (this.food.y < head.y) this.food.y++;
        else if (this.food.y > head.y) this.food.y--;
      }
    }

    // Check Food Collision
    if (head.x === this.food.x && head.y === this.food.y) {
      this.synth.playEat();
      this.createParticles(this.food.x, this.food.y, this.theme === 'cyberpunk' ? '#ffe600' : '#f4a261');
      
      const now = Date.now();
      if (now - this.lastEatTime < 3000) {
        this.combo = Math.min(3.0, parseFloat((this.combo + 0.2).toFixed(1)));
      } else {
        this.combo = 1.0;
      }
      this.lastEatTime = now;

      let scoreGained = Math.round(10 * this.combo);
      if (this.activePowerup && this.activePowerup.type === 'double') {
        scoreGained *= 2;
      }
      this.score += scoreGained;
      this.foodEatenCount++;

      // Chance to spawn star food if lives < 3
      if (!this.starFood && this.lives < 3 && Math.random() < 0.35) {
        this.spawnStarFood();
      }

      this.updateHUD();
      this.spawnFood();
    } else {
      this.snake.pop(); // Remove tail if no food eaten
    }

    // Check Powerup Collision
    if (this.powerup && head.x === this.powerup.x && head.y === this.powerup.y) {
      this.synth.playPowerup();
      this.createParticles(this.powerup.x, this.powerup.y, '#00f0ff');
      this.activatePowerup(this.powerup.type);
      this.powerup = null;
    }

    // Powerup Expiry Check
    if (this.activePowerup) {
      const remainingMs = this.activePowerup.endTime - Date.now();
      if (remainingMs <= 0) {
        this.deactivatePowerup();
      } else if (this.powerupBar) {
        const percent = (remainingMs / this.activePowerup.duration) * 100;
        this.powerupBar.style.width = `${percent}%`;
      }
    }

    // Despawn powerup on map if not collected for 10s
    if (this.powerup && Date.now() - this.powerup.spawnTime > 10000) {
      this.powerup = null;
    }

    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update();
      if (this.particles[i].life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  activatePowerup(type) {
    const duration = type === 'slow' ? 6000 : 10000;
    this.activePowerup = { type, duration, endTime: Date.now() + duration };
    
    let text = '';
    switch (type) {
      case 'double': text = '⚡ 雙倍分數 (10s)'; break;
      case 'slow':
        text = '🐢 慢速模式 (6s)';
        this.currentSpeed = Math.floor(this.baseSpeed * 1.5);
        break;
      case 'magnet': text = '🧲 食物磁鐵 (10s)'; break;
      case 'bomb':
        text = '💣 炸彈清理尾巴！';
        if (this.snake.length > 3) this.snake.pop();
        if (this.snake.length > 3) this.snake.pop();
        this.score += 30;
        break;
    }

    if (this.powerupText) this.powerupText.textContent = text;
    if (this.powerupBanner) this.powerupBanner.classList.remove('hidden');
    this.updateHUD();
  }

  deactivatePowerup() {
    this.activePowerup = null;
    this.currentSpeed = this.baseSpeed;
    if (this.powerupBanner) this.powerupBanner.classList.add('hidden');
  }

  updateHUD() {
    if (this.livesEl) {
      this.livesEl.textContent = '❤️'.repeat(Math.max(0, this.lives)) || '💀';
    }
    if (this.scoreEl) this.scoreEl.textContent = this.score;
    if (this.comboEl) this.comboEl.textContent = `${this.combo.toFixed(1)}x`;
    if (this.lengthEl) this.lengthEl.textContent = this.snake.length;
  }

  draw() {
    // Clear Board
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw Grid
    this.drawGrid();

    // Draw Normal Food
    if (this.food) {
      this.drawFood(this.food.x, this.food.y);
    }

    // Draw Star Food ⭐ (+1 Life)
    if (this.starFood) {
      const cs = this.cellSize;
      const px = this.starFood.x * cs + cs / 2;
      const py = this.starFood.y * cs + cs / 2;
      this.ctx.save();
      this.ctx.shadowColor = '#ffd700';
      this.ctx.shadowBlur = 12;
      this.ctx.font = `${cs - 4}px sans-serif`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText('⭐', px, py);
      this.ctx.restore();
    }

    // Draw Monster 👾 (-1 Life)
    if (this.monster) {
      const cs = this.cellSize;
      const px = this.monster.x * cs + cs / 2;
      const py = this.monster.y * cs + cs / 2;
      this.ctx.save();
      this.ctx.shadowColor = '#ff0055';
      this.ctx.shadowBlur = 14;
      this.ctx.font = `${cs - 4}px sans-serif`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText('👾', px, py);
      this.ctx.restore();
    }

    // Draw Powerup
    if (this.powerup) {
      this.drawPowerup(this.powerup);
    }

    // Draw Snake
    this.drawSnake();

    // Draw Particles
    this.particles.forEach(p => p.draw(this.ctx));
  }

  drawGrid() {
    this.ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--grid-line').trim() || 'rgba(255,255,255,0.05)';
    this.ctx.lineWidth = 1;
    for (let i = 0; i <= this.gridCount; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(i * this.cellSize, 0);
      this.ctx.lineTo(i * this.cellSize, this.canvas.height);
      this.ctx.stroke();

      this.ctx.beginPath();
      this.ctx.moveTo(0, i * this.cellSize);
      this.ctx.lineTo(this.canvas.width, i * this.cellSize);
      this.ctx.stroke();
    }
  }

  drawSnake() {
    const cs = this.cellSize;
    const isInvulnerable = Date.now() < this.invulnerableUntil;
    const blinkAlpha = (isInvulnerable && Math.floor(Date.now() / 150) % 2 === 0) ? 0.35 : 1.0;

    this.snake.forEach((segment, index) => {
      const px = segment.x * cs;
      const py = segment.y * cs;

      this.ctx.save();
      this.ctx.globalAlpha = blinkAlpha;

      if (index === 0) {
        // Head rendering
        if (this.theme === 'cat') {
          // Cute Pink Cat Head
          this.ctx.fillStyle = '#ff85a1';
          this.ctx.beginPath();
          this.ctx.roundRect(px + 2, py + 2, cs - 4, cs - 4, 10);
          this.ctx.fill();

          // Cat Pointy Ears
          this.ctx.fillStyle = '#f72585';
          this.ctx.beginPath();
          this.ctx.moveTo(px + 3, py + 8);
          this.ctx.lineTo(px + 8, py + 1);
          this.ctx.lineTo(px + 13, py + 8);
          this.ctx.moveTo(px + cs - 13, py + 8);
          this.ctx.lineTo(px + cs - 8, py + 1);
          this.ctx.lineTo(px + cs - 3, py + 8);
          this.ctx.fill();

          // Cat Eyes & Nose
          this.ctx.fillStyle = '#2b0938';
          this.ctx.beginPath();
          this.ctx.arc(px + 8, py + 14, 2.5, 0, Math.PI * 2);
          this.ctx.arc(px + cs - 8, py + 14, 2.5, 0, Math.PI * 2);
          this.ctx.fill();

          this.ctx.fillStyle = '#ff3385';
          this.ctx.beginPath();
          this.ctx.arc(px + cs / 2, py + 17, 2, 0, Math.PI * 2);
          this.ctx.fill();
        } else if (this.theme === 'capybara') {
          // Cute Capybara Head
          this.ctx.fillStyle = '#d4a373';
          this.ctx.beginPath();
          this.ctx.roundRect(px + 2, py + 2, cs - 4, cs - 4, 8);
          this.ctx.fill();

          // Capybara Ears
          this.ctx.fillStyle = '#bc6c25';
          this.ctx.beginPath();
          this.ctx.arc(px + 6, py + 6, 4, 0, Math.PI * 2);
          this.ctx.arc(px + cs - 6, py + 6, 4, 0, Math.PI * 2);
          this.ctx.fill();

          // Capybara Eyes & Snout
          this.ctx.fillStyle = '#281d15';
          let eyeLeft = { x: px + 8, y: py + 12 };
          let eyeRight = { x: px + cs - 8, y: py + 12 };
          this.ctx.beginPath();
          this.ctx.arc(eyeLeft.x, eyeLeft.y, 2.5, 0, Math.PI * 2);
          this.ctx.arc(eyeRight.x, eyeRight.y, 2.5, 0, Math.PI * 2);
          this.ctx.fill();
        } else if (this.theme === 'cyberpunk') {
          // Neon Glow Head
          this.ctx.shadowColor = '#00f0ff';
          this.ctx.shadowBlur = 12;
          this.ctx.fillStyle = '#00f0ff';
          this.ctx.beginPath();
          this.ctx.roundRect(px + 2, py + 2, cs - 4, cs - 4, 6);
          this.ctx.fill();
        } else {
          // Classic Arcade Head
          this.ctx.fillStyle = '#00ff66';
          this.ctx.fillRect(px + 1, py + 1, cs - 2, cs - 2);
        }
      } else {
        // Body Segment rendering
        if (this.theme === 'cat') {
          this.ctx.fillStyle = index % 2 === 0 ? '#ff85a1' : '#f72585';
          this.ctx.beginPath();
          this.ctx.roundRect(px + 3, py + 3, cs - 6, cs - 6, 6);
          this.ctx.fill();
        } else if (this.theme === 'capybara') {
          this.ctx.fillStyle = index % 2 === 0 ? '#bc6c25' : '#dda15e';
          this.ctx.beginPath();
          this.ctx.roundRect(px + 3, py + 3, cs - 6, cs - 6, 6);
          this.ctx.fill();
        } else if (this.theme === 'cyberpunk') {
          this.ctx.shadowColor = index % 2 === 0 ? '#7000ff' : '#ff007f';
          this.ctx.shadowBlur = 8;
          this.ctx.fillStyle = index % 2 === 0 ? '#7000ff' : '#ff007f';
          this.ctx.beginPath();
          this.ctx.roundRect(px + 3, py + 3, cs - 6, cs - 6, 4);
          this.ctx.fill();
        } else {
          this.ctx.fillStyle = index % 2 === 0 ? '#00b347' : '#008033';
          this.ctx.fillRect(px + 2, py + 2, cs - 4, cs - 4);
        }
      }

      this.ctx.restore();
    });
  }

  drawFood(x, y) {
    const cs = this.cellSize;
    const px = x * cs + cs / 2;
    const py = y * cs + cs / 2;
    const radius = cs / 2 - 4;

    this.ctx.save();

    if (this.theme === 'cat') {
      // Fish Treat 🐟
      this.ctx.font = `${cs - 6}px sans-serif`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText('🐟', px, py);
    } else if (this.theme === 'capybara') {
      // Orange / Yuzu Fruit
      this.ctx.fillStyle = '#f4a261';
      this.ctx.beginPath();
      this.ctx.arc(px, py, radius, 0, Math.PI * 2);
      this.ctx.fill();

      // Leaf
      this.ctx.fillStyle = '#2a9d8f';
      this.ctx.beginPath();
      this.ctx.ellipse(px + 4, py - radius + 2, 4, 2, Math.PI / 4, 0, Math.PI * 2);
      this.ctx.fill();
    } else if (this.theme === 'cyberpunk') {
      // Energy Orb
      this.ctx.shadowColor = '#ffe600';
      this.ctx.shadowBlur = 15;
      this.ctx.fillStyle = '#ffe600';
      this.ctx.beginPath();
      this.ctx.arc(px, py, radius - 2, 0, Math.PI * 2);
      this.ctx.fill();
    } else {
      // Red Arcade Cherry / Pellet
      this.ctx.fillStyle = '#ff3333';
      this.ctx.fillRect(x * cs + 4, y * cs + 4, cs - 8, cs - 8);
    }

    this.ctx.restore();
  }

  drawPowerup(p) {
    const cs = this.cellSize;
    const px = p.x * cs + cs / 2;
    const py = p.y * cs + cs / 2;

    this.ctx.save();
    this.ctx.shadowColor = '#00f0ff';
    this.ctx.shadowBlur = 10;
    
    this.ctx.font = '18px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    let icon = '⚡';
    if (p.type === 'slow') icon = '🐢';
    if (p.type === 'magnet') icon = '🧲';
    if (p.type === 'bomb') icon = '💣';

    this.ctx.fillText(icon, px, py);
    this.ctx.restore();
  }
}

// Initialize on page load (robust readyState detection)
function initSnakeGame() {
  if (!window.snakeGameInstance) {
    try {
      window.snakeGameInstance = new SnakeGame();
    } catch (err) {
      console.error('SnakeGame initialization error:', err);
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSnakeGame);
} else {
  initSnakeGame();
}
