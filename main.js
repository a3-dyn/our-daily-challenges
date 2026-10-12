// Default standard games
const DEFAULT_GAMES = [
  {
    id: 'enclose',
    name: 'Enclose',
    url: 'https://enclose.horse',
    desc: 'We cant keep letting this horse get out',
    category: 'visual',
    icon: 'grid',
    badge: 'Favorite'
  },
  {
    id: 'chronofive',
    name: 'Chronofive',
    url: 'https://chronofive.com',
    desc: 'Pinpoint correct years for each historical event',
    category: 'word',
    icon: 'clock',
    badge: 'History'
  },
  {
    id: 'colorguesser',
    name: 'Color Guesser',
    url: 'https://guessthecolor.com',
    desc: 'How well do we know our colors?',
    category: 'visual',
    icon: 'palette',
    badge: 'Visual'
  },
  {
    id: 'connections',
    name: 'Connections',
    url: 'https://www.nytimes.com/games/connections',
    desc: 'Group words into 4 categories of common themes',
    category: 'word',
    icon: 'boxes',
    badge: 'NYT'
  },
  {
    id: 'wordle',
    name: 'Wordle',
    url: 'https://www.nytimes.com/games/wordle/index.html',
    desc: 'Guess the secret 5-letter word in 6 tries',
    category: 'word',
    icon: 'type',
    badge: 'Classic'
  },
  {
    id: 'minicrossword',
    name: 'Mini Crossword',
    url: 'https://www.nytimes.com/crosswords/game/mini',
    desc: 'Bite-sized daily crossword speed run',
    category: 'word',
    icon: 'square-asterisk',
    badge: 'Speed Run'
  }
];

// State initialization
let games = [];
let dailyData = {};
let activeCategory = 'all';
const todayKey = new Date().toISOString().split('T')[0];

// Initialize application state on page load
window.onload = function () {
  // 1. Format date
  const options = { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' };
  document.getElementById('currentDateText').innerText = new Date().toLocaleDateString('en-US', options);

  // 2. Load stored games or set defaults
  const storedGames = localStorage.getItem('daily_portal_games');
  if (storedGames) {
    games = JSON.parse(storedGames);
  } else {
    games = [...DEFAULT_GAMES];
    localStorage.setItem('daily_portal_games', JSON.stringify(games));
  }

  // 3. Load today's check-ins data
  const storedData = localStorage.getItem('daily_portal_progress');
  if (storedData) {
    const parsed = JSON.parse(storedData);
    if (parsed.date === todayKey) {
      dailyData = parsed;
    } else {
      // Reset progress for a new date
      dailyData = { date: todayKey, checks: {}, winner: 'none', notes: '' };
    }
  } else {
    dailyData = { date: todayKey, checks: {}, winner: 'none', notes: '' };
  }

  // Initialize defaults for missing game keys
  games.forEach(game => {
    if (!dailyData.checks[game.id]) {
      dailyData.checks[game.id] = { aed: false, partner: false };
    }
  });

  // Populate notes & winner controls
  document.getElementById('dailyWinnerSelect').value = dailyData.winner || 'none';
  document.getElementById('dailyNotesInput').value = dailyData.notes || '';

  // Event listener for daily winner select
  document.getElementById('dailyWinnerSelect').addEventListener('change', (e) => {
    dailyData.winner = e.target.value;
    saveDailyData();
    updateStats();
  });

  // Search bar event listener
  document.getElementById('searchInput').addEventListener('input', renderGames);

  // Render initial state
  renderGames();
  updateStats();
  lucide.createIcons();
};

function renderGames() {
  const grid = document.getElementById('gamesGrid');
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();

  // Filter games by category and search
  const filtered = games.filter(game => {
    const matchesCategory = activeCategory === 'all' || game.category === activeCategory;
    const matchesSearch = game.name.toLowerCase().includes(searchTerm) ||
      game.desc.toLowerCase().includes(searchTerm);
    return matchesCategory && matchesSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
            <div class="col-span-full py-12 text-center text-stone-500">
              <i data-lucide="gamepad-2" class="w-10 h-10 mx-auto mb-2 opacity-40"></i>
              <p class="text-sm">No games found matching your search.</p>
            </div>
          `;
    lucide.createIcons();
    return;
  }

  grid.innerHTML = filtered.map(game => {
    const checkState = dailyData.checks[game.id] || { aed: false, partner: false };
    const isBothDone = checkState.aed && checkState.partner;

    return `
            <div class="glass-card rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 relative group overflow-hidden ${isBothDone ? 'border-emerald-500/30 bg-emerald-950/10' : ''}">
              
              ${isBothDone ? `<div class="absolute top-0 right-0 w-16 h-16 pointer-events-none overflow-hidden">
                <div class="bg-emerald-500 text-stone-950 text-[9px] font-bold py-0.5 right-[-35px] top-[18px] w-[120px] text-center transform rotate-45 absolute shadow-sm uppercase tracking-wider">Done</div>
              </div>` : ''}
  
              <div>
                <div class="flex items-start justify-between mb-3">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center text-amber-400 group-hover:border-amber-500/40 group-hover:bg-amber-500/10 transition">
                      <i data-lucide="${game.icon || 'gamepad-2'}" class="w-5 h-5"></i>
                    </div>
                    <div>
                      <h3 class="font-bold text-stone-100 text-base leading-tight flex items-center gap-2">
                        ${game.name}
                      </h3>
                      <span class="text-[10px] uppercase font-semibold text-stone-500 tracking-wider">${game.badge || 'Daily'}</span>
                    </div>
                  </div>
  
                  ${game.isCustom ? `
                    <button onclick="removeGame('${game.id}')" title="Remove Custom Game" class="opacity-0 group-hover:opacity-100 text-stone-600 hover:text-rose-400 transition p-1">
                      <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                  ` : ''}
                </div>
  
                <p class="text-xs text-stone-400 mb-5 leading-relaxed">${game.desc}</p>
              </div>
  
              <div class="space-y-4 pt-3 border-t border-stone-800/60">
                <!-- Checkboxes for couple -->
                <div class="flex items-center justify-between text-xs">
                  <span class="text-stone-400 font-medium">Completed today:</span>
                  <div class="flex items-center gap-2">
                    <!-- Aed Checkbox -->
                    <label class="inline-flex items-center gap-1.5 cursor-pointer bg-stone-900/80 px-2.5 py-1.5 rounded-lg border border-stone-800/80 hover:border-amber-500/40 transition">
                      <input 
                        type="checkbox" 
                        ${checkState.aed ? 'checked' : ''} 
                        onchange="toggleCheck('${game.id}', 'aed')"
                        class="rounded border-stone-700 bg-stone-950 text-amber-500 focus:ring-amber-500/40 focus:ring-offset-0 w-3.5 h-3.5 cursor-pointer"
                      >
                      <span class="${checkState.aed ? 'text-amber-300 font-semibold' : 'text-stone-400'}">Aed</span>
                    </label>
  
                    <!-- Partner Checkbox -->
                    <label class="inline-flex items-center gap-1.5 cursor-pointer bg-stone-900/80 px-2.5 py-1.5 rounded-lg border border-stone-800/80 hover:border-teal-500/40 transition">
                      <input 
                        type="checkbox" 
                        ${checkState.partner ? 'checked' : ''} 
                        onchange="toggleCheck('${game.id}', 'partner')"
                        class="rounded border-stone-700 bg-stone-950 text-teal-500 focus:ring-teal-500/40 focus:ring-offset-0 w-3.5 h-3.5 cursor-pointer"
                      >
                      <span class="${checkState.partner ? 'text-teal-300 font-semibold' : 'text-stone-400'}">Partner</span>
                    </label>
                  </div>
                </div>
  
                <!-- Direct Launch Link -->
                <a 
                  href="${game.url}" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="w-full py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700/60 text-xs font-semibold text-stone-200 flex items-center justify-center gap-2 group-hover:border-amber-500/30 transition shadow-sm"
                >
                  <span>Play ${game.name}</span>
                  <i data-lucide="external-link" class="w-3.5 h-3.5 text-stone-400 group-hover:text-amber-400 transition"></i>
                </a>
              </div>
  
            </div>
          `;
  }).join('');

  lucide.createIcons();
}

function toggleCheck(gameId, player) {
  if (!dailyData.checks[gameId]) {
    dailyData.checks[gameId] = { aed: false, partner: false };
  }

  dailyData.checks[gameId][player] = !dailyData.checks[gameId][player];
  saveDailyData();
  renderGames();
  updateStats();
}

function saveDailyData() {
  localStorage.setItem('daily_portal_progress', JSON.stringify(dailyData));
}

function updateStats() {
  let aedDone = 0;
  let partnerDone = 0;
  const totalGames = games.length;

  games.forEach(game => {
    const check = dailyData.checks[game.id];
    if (check?.aed) aedDone++;
    if (check?.partner) partnerDone++;
  });

  // Calculate total completed percentage
  const totalPossible = totalGames * 2;
  const currentDone = aedDone + partnerDone;
  const percentage = totalPossible > 0 ? Math.round((currentDone / totalPossible) * 100) : 0;

  // Update UI Counters
  document.getElementById('aedCount').innerText = `${aedDone}/${totalGames}`;
  document.getElementById('partnerCount').innerText = `${partnerDone}/${totalGames}`;
  document.getElementById('overallPercentage').innerText = `${percentage}%`;
  document.getElementById('progressBar').style.width = `${percentage}%`;

  // Update Today's Leader text
  const leaderText = document.getElementById('todayLeader');
  if (dailyData.winner === 'aed') {
    leaderText.innerText = '👑 Aed';
    leaderText.className = 'text-base font-semibold text-amber-300';
  } else if (dailyData.winner === 'partner') {
    leaderText.innerText = '👑 Partner';
    leaderText.className = 'text-base font-semibold text-teal-300';
  } else if (dailyData.winner === 'tie') {
    leaderText.innerText = '🤝 Tied Match';
    leaderText.className = 'text-base font-semibold text-stone-300';
  } else {
    if (aedDone > partnerDone) {
      leaderText.innerText = 'Aed (+1 ahead)';
      leaderText.className = 'text-base font-semibold text-amber-300';
    } else if (partnerDone > aedDone) {
      leaderText.innerText = 'Partner (+1 ahead)';
      leaderText.className = 'text-base font-semibold text-teal-300';
    } else {
      leaderText.innerText = 'Tied 🤝';
      leaderText.className = 'text-base font-semibold text-stone-200';
    }
  }

  // Calculate or display Streak
  updateStreakCounter(percentage === 100);
}

function updateStreakCounter(isToday100) {
  let streak = parseInt(localStorage.getItem('daily_portal_streak') || '0', 10);
  const lastCompletedDate = localStorage.getItem('daily_portal_last_streak_date');

  if (isToday100 && lastCompletedDate !== todayKey) {
    // Increment streak if not already recorded today
    streak++;
    localStorage.setItem('daily_portal_streak', streak.toString());
    localStorage.setItem('daily_portal_last_streak_date', todayKey);
  }

  document.getElementById('streakCount').innerText = streak;
}

function filterCategory(category) {
  activeCategory = category;
  document.querySelectorAll('.filter-btn').forEach(btn => {
    if (btn.dataset.category === category) {
      btn.className = 'filter-btn active px-3.5 py-2 rounded-xl text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30 whitespace-nowrap transition';
    } else {
      btn.className = 'filter-btn px-3.5 py-2 rounded-xl text-xs font-medium bg-stone-900 text-stone-400 border border-stone-800 hover:text-stone-200 whitespace-nowrap transition';
    }
  });
  renderGames();
}

function saveDailyNotes() {
  const val = document.getElementById('dailyNotesInput').value;
  dailyData.notes = val;
  saveDailyData();

  // Temporary button state response
  const btn = event.currentTarget;
  btn.innerText = 'Saved!';
  setTimeout(() => {
    btn.innerHTML = '<i data-lucide="save" class="w-3.5 h-3.5"></i> Save';
    lucide.createIcons();
  }, 1500);
}

function openAddModal() {
  document.getElementById('addModal').classList.remove('hidden');
}

function closeAddModal() {
  document.getElementById('addModal').classList.add('hidden');
  document.getElementById('addGameForm').reset();
}

function handleAddGame(e) {
  e.preventDefault();

  const name = document.getElementById('gameName').value.trim();
  const url = document.getElementById('gameUrl').value.trim();
  const desc = document.getElementById('gameDesc').value.trim() || 'Custom daily game';
  const category = document.getElementById('gameCategory').value;
  const icon = document.getElementById('gameIcon').value;

  const newGame = {
    id: 'custom_' + Date.now(),
    name: name,
    url: url.startsWith('http') ? url : 'https://' + url,
    desc: desc,
    category: category,
    icon: icon,
    badge: 'Custom',
    isCustom: true
  };

  games.push(newGame);
  dailyData.checks[newGame.id] = { aed: false, partner: false };

  localStorage.setItem('daily_portal_games', JSON.stringify(games));
  saveDailyData();

  closeAddModal();
  renderGames();
  updateStats();
}

function removeGame(gameId) {
  if (confirm('Are you sure you want to remove this custom game?')) {
    games = games.filter(g => g.id !== gameId);
    delete dailyData.checks[gameId];
    localStorage.setItem('daily_portal_games', JSON.stringify(games));
    saveDailyData();
    renderGames();
    updateStats();
  }
}