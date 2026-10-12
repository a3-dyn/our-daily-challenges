// Master Games Dataset
const DEFAULT_GAMES = [
  {
    id: 'enclose-horse',
    name: 'Enclose Horse',
    url: 'https://enclose.horse/',
    category: 'daily',
    icon: 'fa-horse-head',
    color: 'from-amber-500 to-orange-600',
    badge: 'Popular',
    tip: 'Fence in the horse using as few barriers as possible! Watch out for corner escapes.'
  },
  {
    id: 'chrono-5',
    name: 'Chrono 5',
    url: 'https://chronofive.com/',
    category: 'daily',
    icon: 'fa-clock',
    color: 'from-blue-500 to-indigo-600',
    badge: 'Timeline',
    tip: 'Pinpoint those dates!'
  },
  {
    id: 'color-guesser',
    name: 'Color Guesser',
    url: 'https://colorguesser.com/',
    category: 'geo',
    icon: 'fa-palette',
    color: 'from-purple-500 to-pink-500',
    badge: 'Visual',
    tip: 'How well can we identify colors?'
  },
  {
    id: 'wordle',
    name: 'NYT Wordle',
    url: 'https://www.nytimes.com/games/wordle/index.html',
    category: 'words',
    icon: 'fa-font',
    color: 'from-emerald-500 to-teal-600',
    badge: 'Classic',
    tip: 'Guess the Words.'
  },
  {
    id: 'connections',
    name: 'NYT Connections',
    url: 'https://www.nytimes.com/games/connections',
    category: 'words',
    icon: 'fa-diagram-project',
    color: 'from-indigo-500 to-violet-600',
    badge: 'Logic',
    tip: 'Finding connections in random words.'
  },
  {
    id: 'worldle',
    name: 'Worldle Geo',
    url: 'https://worldle.teuteuf.fr/',
    category: 'geo',
    icon: 'fa-earth-americas',
    color: 'from-cyan-500 to-blue-600',
    badge: 'Geography',
    tip: 'Use direction and percentage distance clues carefully.'
  }
];

// State variables
let games = [];
let completedGames = {}; // { 'YYYY-MM-DD': { 'game-id': true } }
let currentFilter = 'all';

// Get Today's Date String YYYY-MM-DD
function getTodayString() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

// Initialize App
window.onload = function () {
  loadSavedData();
  renderGamesGrid();
  startResetCountdown();
  updateStreakCounter();

  // Format Today's Date in Header
  const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
  document.getElementById('current-date-display').innerText = new Date().toLocaleDateString(undefined, options);
};

function loadSavedData() {
  // Load games list
  const savedGames = localStorage.getItem('couple_games_list');
  if (savedGames) {
    try { games = JSON.parse(savedGames); } catch (e) { games = DEFAULT_GAMES; }
  } else {
    games = DEFAULT_GAMES;
  }

  // Load completed map
  const savedCompleted = localStorage.getItem('couple_games_completed');
  if (savedCompleted) {
    try { completedGames = JSON.parse(savedCompleted); } catch (e) { }
  }
}

function renderGamesGrid() {
  const container = document.getElementById('games-grid');
  container.innerHTML = '';

  const today = getTodayString();
  const todayCompleted = completedGames[today] || {};

  const searchTerm = document.getElementById('game-search').value.toLowerCase();

  const filtered = games.filter(game => {
    const matchesCategory = (currentFilter === 'all') || (game.category === currentFilter);
    const matchesSearch = game.name.toLowerCase().includes(searchTerm) ||
      (game.tip && game.tip.toLowerCase().includes(searchTerm));
    return matchesCategory && matchesSearch;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
                  <div class="col-span-full py-12 text-center text-slate-400">
                      <i class="fa-solid fa-gamepad text-3xl mb-2 opacity-50"></i>
                      <p class="text-sm font-medium">No games found matching your search!</p>
                  </div>
              `;
    updateProgressStats();
    return;
  }

  filtered.forEach(game => {
    const isCompleted = !!todayCompleted[game.id];

    const card = document.createElement('div');
    card.className = `group relative bg-white dark:bg-slate-900 rounded-3xl border ${isCompleted ? 'border-emerald-300 dark:border-emerald-800/60 bg-emerald-50/20 dark:bg-emerald-950/10' : 'border-slate-200/80 dark:border-slate-800'} p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden`;

    card.innerHTML = `
                  <!-- Top Ribbon/Badge -->
                  <div>
                      <div class="flex items-start justify-between gap-3 mb-3">
                          <div class="flex items-center space-x-3">
                              <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr ${game.color || 'from-theme-500 to-pink-500'} flex items-center justify-center text-white shadow-md text-xl group-hover:scale-105 transition-transform">
                                  <i class="fa-solid ${game.icon || 'fa-gamepad'}"></i>
                              </div>
                              <div>
                                  <h3 class="font-display font-bold text-base text-slate-800 dark:text-slate-100 group-hover:text-theme-500 transition-colors flex items-center gap-1.5">
                                      ${game.name}
                                  </h3>
                                  <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                      ${game.category}
                                  </span>
                              </div>
                          </div>

                          <!-- Toggle Complete Button -->
                          <button onclick="toggleGameCompletion('${game.id}')" title="Toggle Completion" class="w-9 h-9 rounded-2xl flex items-center justify-center transition-all ${isCompleted ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 hover:text-emerald-500'}">
                              <i class="fa-solid fa-check text-sm font-bold"></i>
                          </button>
                      </div>

                      <!-- Game Tip / Strategy Note -->
                      ${game.tip ? `
                      <div class="mt-3 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80 flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                          <i class="fa-solid fa-lightbulb text-amber-500 text-xs mt-0.5"></i>
                          <span class="text-[11px] leading-relaxed">${game.tip}</span>
                      </div>
                      ` : ''}
                  </div>

                  <!-- Bottom Actions -->
                  <div class="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                      <a href="${game.url}" target="_blank" rel="noopener noreferrer" class="flex-1 py-2 px-3 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-theme-600 dark:hover:bg-theme-500 text-white dark:text-slate-900 dark:hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm">
                          <span>Play Game</span>
                          <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                      </a>

                      ${game.isCustom ? `
                      <button onclick="deleteCustomGame('${game.id}')" class="p-2 text-slate-400 hover:text-rose-500 rounded-xl transition-colors" title="Delete Game">
                          <i class="fa-solid fa-trash text-xs"></i>
                      </button>
                      ` : ''}
                  </div>
              `;

    container.appendChild(card);
  });

  updateProgressStats();
}

function toggleGameCompletion(gameId) {
  const today = getTodayString();
  if (!completedGames[today]) {
    completedGames[today] = {};
  }

  completedGames[today][gameId] = !completedGames[today][gameId];
  localStorage.setItem('couple_games_completed', JSON.stringify(completedGames));

  renderGamesGrid();
  updateStreakCounter();
}

function updateProgressStats() {
  const today = getTodayString();
  const todayCompleted = completedGames[today] || {};

  const total = games.length;
  let completedCount = 0;

  games.forEach(g => {
    if (todayCompleted[g.id]) completedCount++;
  });

  const percent = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  document.getElementById('completion-percentage').innerText = `${percent}%`;
  document.getElementById('completion-ratio').innerText = `${completedCount}/${total}`;
  document.getElementById('progress-bar-inner').style.width = `${percent}%`;
}

function updateStreakCounter() {
  let streak = 0;
  let curr = new Date();

  while (true) {
    const dateStr = curr.toISOString().split('T')[0];
    const dayCompleted = completedGames[dateStr] || {};

    const allDone = games.length > 0 && games.every(g => !!dayCompleted[g.id]);

    if (allDone) {
      streak++;
      curr.setDate(curr.getDate() - 1);
    } else {
      const isToday = dateStr === getTodayString();
      if (isToday) {
        curr.setDate(curr.getDate() - 1);
        continue;
      }
      break;
    }
  }

  document.getElementById('streak-counter').innerText = streak;

  const statusText = document.getElementById('streak-status-text');
  if (streak > 0) {
    statusText.innerText = `🔥 ${streak} day streak active!`;
  } else {
    statusText.innerText = `Complete all ${games.length} games today!`;
  }
}

function startResetCountdown() {
  function updateTimer() {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);

    const diff = midnight - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    const fmt = (n) => n.toString().padStart(2, '0');
    const timeString = `${fmt(hours)}:${fmt(mins)}:${fmt(secs)}`;

    document.getElementById('reset-timer').innerText = timeString;
    document.getElementById('reset-timer-mobile').innerText = timeString;
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}

function filterGames(category) {
  currentFilter = category;
  document.querySelectorAll('.category-tab').forEach(tab => {
    if (tab.getAttribute('data-category') === category) {
      tab.classList.add('bg-white', 'dark:bg-slate-800', 'text-slate-800', 'dark:text-slate-100', 'shadow-sm');
      tab.classList.remove('text-slate-600', 'dark:text-slate-400');
    } else {
      tab.classList.remove('bg-white', 'dark:bg-slate-800', 'text-slate-800', 'dark:text-slate-100', 'shadow-sm');
      tab.classList.add('text-slate-600', 'dark:text-slate-400');
    }
  });
  renderGamesGrid();
}

function handleSearch() {
  renderGamesGrid();
}

function openAddModal() {
  const modal = document.getElementById('add-modal');
  const content = document.getElementById('add-modal-content');
  modal.classList.remove('hidden');
  setTimeout(() => {
    modal.classList.remove('opacity-0');
    content.classList.remove('scale-95');
  }, 10);
}

function closeAddModal() {
  const modal = document.getElementById('add-modal');
  const content = document.getElementById('add-modal-content');
  modal.classList.add('opacity-0');
  content.classList.add('scale-95');
  setTimeout(() => {
    modal.classList.add('hidden');
  }, 200);
}

function handleAddGame(e) {
  e.preventDefault();
  const name = document.getElementById('modal-game-name').value.trim();
  const url = document.getElementById('modal-game-url').value.trim();
  const category = document.getElementById('modal-game-category').value;
  const icon = document.getElementById('modal-game-icon').value;
  const tip = document.getElementById('modal-game-tip').value.trim();

  if (!name || !url) return;

  const newGame = {
    id: 'custom-' + Date.now(),
    name: name,
    url: url,
    category: category,
    icon: icon,
    color: 'from-pink-500 to-rose-600',
    tip: tip || 'Custom added game',
    isCustom: true
  };

  games.push(newGame);
  localStorage.setItem('couple_games_list', JSON.stringify(games));

  closeAddModal();
  document.getElementById('add-game-form').reset();
  renderGamesGrid();
}

function deleteCustomGame(gameId) {
  games = games.filter(g => g.id !== gameId);
  localStorage.setItem('couple_games_list', JSON.stringify(games));
  renderGamesGrid();
}

function toggleDarkMode() {
  document.documentElement.classList.toggle('dark');
}