// Game configuration
const config = {
    heartSpeed: 5,
    heartSpawnRate: 1000,
    requiredScore: 10,
    specialMessage: "I love you more than all the stars in the sky! ❤️",
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
};

// Game variables
let score = 0;
let hearts = [];
let gameLoop;
let playerPos = { x: window.innerWidth / 2 };
let gameStarted = false;
let touchStartX = 0;

// DOM Elements
const gameContainer = document.getElementById('game-container');
const player = document.getElementById('player');
const scoreElement = document.getElementById('score-value');
const scoreDisplay = document.getElementById('score');
const modal = document.getElementById('message-modal');
const specialMessage = document.getElementById('special-message');
const closeModal = document.getElementById('close-modal');
const startButton = document.getElementById('start-game');

// Mobile-specific adjustments
if (config.isMobile) {
    // Adjust game container height for mobile
    gameContainer.style.height = '300px';
    // Make hearts slightly bigger for touch
    document.documentElement.style.setProperty('--heart-size', '32px');
}

// Smooth scroll for navigation
document.querySelectorAll('nav a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const section = document.querySelector(this.getAttribute('href'));
        section.scrollIntoView({ behavior: 'smooth' });
    });
});

// Start game button
startButton.addEventListener('click', () => {
    if (!gameStarted) {
        gameStarted = true;
        startButton.style.display = 'none';
        player.style.display = 'block';
        scoreDisplay.style.display = 'block';
        startGame();
    }
});

// Touch controls for mobile
if (config.isMobile) {
    gameContainer.addEventListener('touchstart', (e) => {
        if (!gameStarted) return;
        touchStartX = e.touches[0].clientX;
    }, { passive: true });

    gameContainer.addEventListener('touchmove', (e) => {
        if (!gameStarted) return;
        e.preventDefault();
        
        const touch = e.touches[0];
        const containerRect = gameContainer.getBoundingClientRect();
        const relativeX = touch.clientX - containerRect.left;
        
        // Ensure player stays within boundaries
        if (relativeX >= 0 && relativeX <= containerRect.width) {
            playerPos.x = relativeX;
            player.style.left = `${relativeX}px`;
        }
    }, { passive: false });
}

// Mouse controls for desktop
if (!config.isMobile) {
    gameContainer.addEventListener('mousemove', (e) => {
        if (!gameStarted) return;
        
        const containerRect = gameContainer.getBoundingClientRect();
        const relativeX = e.clientX - containerRect.left;
        
        if (relativeX >= 0 && relativeX <= containerRect.width) {
            playerPos.x = relativeX;
            player.style.left = `${relativeX}px`;
        }
    });
}

// Prevent scrolling when touching game container on mobile
gameContainer.addEventListener('touchmove', (e) => {
    if (gameStarted) {
        e.preventDefault();
    }
}, { passive: false });

function createHeart() {
    const heart = document.createElement('div');
    heart.className = 'heart';
    heart.innerHTML = '❤️';
    
    // Adjust spawn position based on device width
    const maxWidth = gameContainer.offsetWidth - (config.isMobile ? 40 : 20);
    heart.style.left = `${Math.random() * maxWidth}px`;
    heart.style.top = '-20px';
    gameContainer.appendChild(heart);
    return heart;
}

function moveHeart(heart) {
    const top = parseFloat(heart.style.top);
    if (top > gameContainer.offsetHeight) {
        heart.remove();
        return false;
    }
    
    // Adjust speed based on device
    const speed = config.isMobile ? config.heartSpeed * 1.2 : config.heartSpeed;
    heart.style.top = `${top + speed}px`;
    
    const heartRect = heart.getBoundingClientRect();
    const playerRect = player.getBoundingClientRect();
    
    if (isColliding(heartRect, playerRect)) {
        heart.remove();
        updateScore();
        return false;
    }
    
    return true;
}

function isColliding(rect1, rect2) {
    return !(rect1.right < rect2.left || 
             rect1.left > rect2.right || 
             rect1.bottom < rect2.top || 
             rect1.top > rect2.bottom);
}

function updateScore() {
    score++;
    scoreElement.textContent = score;
    
    // Add visual feedback for collecting hearts
    const feedback = document.createElement('div');
    feedback.className = 'score-feedback';
    feedback.textContent = '+1';
    feedback.style.left = `${playerPos.x}px`;
    feedback.style.bottom = '60px';
    gameContainer.appendChild(feedback);
    
    setTimeout(() => feedback.remove(), 500);
    
    if (score >= config.requiredScore) {
        showSpecialMessage();
    }
}

function showSpecialMessage() {
    specialMessage.textContent = config.specialMessage;
    modal.style.display = 'block';
    stopGame();
}

closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
    resetGame();
});

function gameStep() {
    if (Math.random() < (config.isMobile ? 0.15 : 0.1)) {
        hearts.push(createHeart());
    }
    
    hearts = hearts.filter(heart => moveHeart(heart));
}

function startGame() {
    if (!gameLoop) {
        // Initialize player position
        const containerRect = gameContainer.getBoundingClientRect();
        playerPos.x = containerRect.width / 2;
        player.style.left = `${playerPos.x}px`;
        
        gameLoop = setInterval(gameStep, config.isMobile ? 40 : 50);
    }
}

function stopGame() {
    clearInterval(gameLoop);
    gameLoop = null;
    gameStarted = false;
}

function resetGame() {
    score = 0;
    scoreElement.textContent = score;
    hearts.forEach(heart => heart.remove());
    hearts = [];
    startButton.style.display = 'block';
    player.style.display = 'none';
    scoreDisplay.style.display = 'none';
}

// Handle window resize
window.addEventListener('resize', () => {
    if (gameStarted) {
        // Adjust player position on resize
        const containerRect = gameContainer.getBoundingClientRect();
        if (playerPos.x > containerRect.width) {
            playerPos.x = containerRect.width / 2;
            player.style.left = `${playerPos.x}px`;
        }
    }
});

// Prevent default touch behavior to avoid unwanted scrolling
document.addEventListener('touchmove', (e) => {
    if (gameStarted && e.target.closest('#game-container')) {
        e.preventDefault();
    }
}, { passive: false });