const allIcons = ['🚀', '🎮', '🍕', '🐱', '🔥', '⚡', '🎵', '💎', '🎨', '🍿', '⚽', '🌟'];

// Levels configuration (Pairs, Time per Mode in Seconds, Columns)
const levelConfig = [
    { level: 1, pairs: 4, cols: 4, times: { easy: 210, medium: 180, hard: 150 } }, // Easy: 3.5m, Med: 3m, Hard: 2.5m
    { level: 2, pairs: 6, cols: 4, times: { easy: 180, medium: 150, hard: 120 } }, // Easy: 3m, Med: 2.5m, Hard: 2m
    { level: 3, pairs: 8, cols: 4, times: { easy: 150, medium: 120, hard: 90 } },  // Easy: 2.5m, Med: 2m, Hard: 1.5m
    { level: 4, pairs: 10, cols: 5, times: { easy: 120, medium: 90, hard: 60 } },  // Easy: 2m, Med: 1.5m, Hard: 1m
    { level: 5, pairs: 12, cols: 6, times: { easy: 90, medium: 60, hard: 30 } }    // Easy: 1.5m, Med: 1m, Hard: 0.5m
];

let currentLevelIndex = 0;
let selectedMode = 'easy';
let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let moves = 0;
let score = 0;
let timer = null;
let timeLeft = 0;
let gameStarted = false;

const board = document.getElementById('game-board');
const movesEl = document.getElementById('moves');
const timerEl = document.getElementById('timer');
const scoreEl = document.getElementById('score');
const modeSelect = document.getElementById('mode-select');
const levelDisplay = document.getElementById('level-display');
const restartBtn = document.getElementById('restart-btn');
const modalActionBtn = document.getElementById('modal-action-btn');
const modalRestartBtn = document.getElementById('modal-restart-btn');
const modal = document.getElementById('status-modal');

function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}

function updateTimerDisplay() {
    const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0');
    const secs = String(timeLeft % 60).padStart(2, '0');
    timerEl.textContent = `${mins}:${secs}`;
}

function startTimer() {
    timer = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();

        if (timeLeft <= 0) {
            stopTimer();
            showEndModal(false);
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(timer);
}

function initGame() {
    selectedMode = modeSelect.value;
    const currentConfig = levelConfig[currentLevelIndex];
    
    levelDisplay.textContent = `Level ${currentConfig.level}`;
    board.innerHTML = '';
    board.style.gridTemplateColumns = `repeat(${currentConfig.cols}, 1fr)`;
    
    flippedCards = [];
    matchedPairs = 0;
    moves = 0;
    score = 0;
    timeLeft = currentConfig.times[selectedMode];
    gameStarted = false;
    
    stopTimer();
    updateTimerDisplay();
    movesEl.textContent = '0';
    scoreEl.textContent = '0';
    modal.style.display = 'none';

    // Pick icons
    const selectedIcons = allIcons.slice(0, currentConfig.pairs);
    cards = shuffle([...selectedIcons, ...selectedIcons]);

    cards.forEach((icon, index) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.icon = icon;
        card.dataset.index = index;

        card.innerHTML = `
            <div class="card-face card-front">❓</div>
            <div class="card-face card-back">${icon}</div>
        `;

        card.addEventListener('click', handleCardClick);
        board.appendChild(card);
    });
}

function handleCardClick() {
    if (!gameStarted) {
        gameStarted = true;
        startTimer();
    }

    const card = this;

    if (flippedCards.length < 2 && !card.classList.contains('flipped') && !card.classList.contains('matched')) {
        card.classList.add('flipped');
        flippedCards.push(card);

        if (flippedCards.length === 2) {
            moves++;
            movesEl.textContent = moves;
            checkMatch();
        }
    }
}

function checkMatch() {
    const [card1, card2] = flippedCards;
    const currentConfig = levelConfig[currentLevelIndex];

    if (card1.dataset.icon === card2.dataset.icon) {
        card1.classList.add('matched');
        card2.classList.add('matched');
        matchedPairs++;
        score += 100;
        scoreEl.textContent = score;
        flippedCards = [];

        if (matchedPairs === currentConfig.pairs) {
            stopTimer();
            setTimeout(() => showEndModal(true), 500);
        }
    } else {
        score = Math.max(0, score - 10);
        scoreEl.textContent = score;
        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            flippedCards = [];
        }, 1000);
    }
}

function showEndModal(isWin) {
    const titleEl = document.getElementById('modal-title');
    const msgEl = document.getElementById('modal-msg');

    if (isWin) {
        if (currentLevelIndex < levelConfig.length - 1) {
            titleEl.textContent = "🎉 Level Cleared! 🎉";
            msgEl.textContent = `Great job! You unlocked Level ${currentLevelIndex + 2}.`;
            modalActionBtn.textContent = "Next Level 🚀";
            modalActionBtn.style.display = "inline-block";
            modalActionBtn.onclick = () => {
                currentLevelIndex++;
                initGame();
            };
        } else {
            titleEl.textContent = "🏆 CHAMPION! All Levels Cleared! 🏆";
            msgEl.textContent = "Congratulations! You completed all 5 levels in this mode!";
            modalActionBtn.style.display = "none";
        }
    } else {
        titleEl.textContent = "💥 Game Over! 💥";
        msgEl.textContent = "Time's up! You must win this level before moving forward.";
        modalActionBtn.style.display = "none";
    }

    document.getElementById('final-moves').textContent = moves;
    document.getElementById('final-time').textContent = timerEl.textContent;
    document.getElementById('final-score').textContent = score;
    modal.style.display = 'flex';
}

modeSelect.addEventListener('change', () => {
    currentLevelIndex = 0; // Reset to level 1 on mode change
    initGame();
});

restartBtn.addEventListener('click', initGame);
modalRestartBtn.addEventListener('click', initGame);

// Initial start
initGame();
