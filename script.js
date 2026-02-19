// Game State
let gameState = {
    xp: 0,
    level: 0,
    missions: [
        { id: 1, text: "Completar 4 Pomodoros", completed: false, xp: 200 },
        { id: 2, text: "Completar 1 workflow com testes", completed: false, xp: 150 },
        { id: 3, text: "Não abrir redes sociais", completed: false, xp: 100 }
    ],
    streak: 0,
    lastLogin: null
};

// Config
const XP_PER_POMODORO = 100;
const FOCUS_TIME = 25; // Altere aqui para 40, 60, 90 etc.
const SHORT_BREAK = 5;
const LONG_BREAK = 15;
const LEVELS = [
    { name: "Motorista 5 Estrelas", xp: 0 },
    { name: "Curioso do n8n", xp: 500 },
    { name: "Mestre dos Workflows", xp: 1200 },
    { name: "Scripter de Agentes", xp: 2200 },
    { name: "Prompt Engineer Pro", xp: 3500 },
    { name: "Arquiteto de Automação", xp: 5000 },
    { name: "Dev de Agentes Autônomos", xp: 7000 },
    { name: "Integrador de APIs", xp: 10000 },
    { name: "Líder de Squad de IA", xp: 14000 },
    { name: "Growth Hacker de Agentes", xp: 20000 },
    { name: "CTO de Micro-SaaS", xp: 28000 },
    { name: "Founder Bootstrap", xp: 38000 },
    { name: "Primeiro Pitch Deck", xp: 50000 },
    { name: "Série A Seed Funded", xp: 65000 },
    { name: "CEO do Hub Agente IA", xp: 85000 },
    { name: "Startup Unicorn Hunter", xp: 110000 },
    { name: "Visionário de Palo Alto", xp: 140000 },
    { name: "Influencer do Vale do Silício", xp: 180000 },
    { name: "Bilionário de IA", xp: 230000 },
    { name: "Lenda do Vale do Silício", xp: 300000 }
];

const QUOTES = [
    "A consistência vence a intensidade.",
    "O código não mente. As pessoas sim.",
    "Se fosse fácil, todo mundo faria. Continue.",
    "Cada erro é um dado a mais para o seu algoritmo.",
    "Não é bug, é feature não documentada.",
    "Foco é dizer não.",
    "Esqueça a motivação. Cultive disciplina.",
    "Seus sonhos estão do outro lado desse Pomodoro.",
    "Exit Uber. Enter Matrix.",
    "O único jeito de sair do lugar é codando."
];

// Audio Context for Beeps
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playSound(type) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    if (type === 'start') {
        osc.frequency.value = 600;
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
    } else if (type === 'finish') {
        osc.frequency.setValueAtTime(400, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);
    }
}

// DOM Elements
const timerDisplay = document.getElementById('timer');

// Timer Logic
let timerInterval;
let timeLeft = 25 * 60;
let totalTime = 25 * 60;
let isRunning = false;
let mode = 'focus'; // focus, short, long



function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    
    
    document.title = `${minutes}:${seconds < 10 ? '0' : ''}${seconds} - ${mode.toUpperCase()}`;
}

function tick() {
    if (timeLeft > 0) {
        timeLeft--;
        updateTimerDisplay();
    } else {
        clearInterval(timerInterval);
        isRunning = false;
        playSound('finish');
        document.body.classList.remove('status-active');
        document.getElementById('system-status').innerText = "CICLO FINALIZADO.";
        
        if (mode === 'focus') {
            addXP(XP_PER_POMODORO);
            alert("Foco concluído! +100 XP");
        }
    }
}

function startTimer() {
    if (!isRunning) {
        isRunning = true;
        timerInterval = setInterval(tick, 1000);
        document.body.classList.add('status-active');
        document.getElementById('system-status').innerText = "SISTEMA OPERANDO...";
        playSound('start');
    }
}

function resetTimer(newTime, newMode) {
    clearInterval(timerInterval);
    isRunning = false;
    mode = newMode;
    totalTime = newTime * 60;
    timeLeft = totalTime;
    document.body.classList.remove('status-active');
    document.getElementById('system-status').innerText = `MODO: ${newMode.toUpperCase()}`;
    updateTimerDisplay();
}

// XP & Level System
function updateLevel() {
    let currentLevel = LEVELS[0];
    let nextLevel = LEVELS[1];
    
    for (let i = 0; i < LEVELS.length; i++) {
        if (gameState.xp >= LEVELS[i].xp) {
            currentLevel = LEVELS[i];
            nextLevel = LEVELS[i + 1] || { xp: 999999, name: "MAX LEVEL" };
        }
    }
    
    document.getElementById('current-level').innerText = currentLevel.name;
    document.getElementById('current-xp').innerText = gameState.xp;
    document.getElementById('next-level-xp').innerText = nextLevel.xp;
    
    const xpNeeded = nextLevel.xp - currentLevel.xp;
    const xpProgress = gameState.xp - currentLevel.xp;
    let progressPercent = 0;
    
    if (xpNeeded > 0) {
        progressPercent = (xpProgress / xpNeeded) * 100;
        if (progressPercent > 100) progressPercent = 100;
    }
    
    document.getElementById('xp-progress').style.width = `${progressPercent}%`;
    saveGame();
}

function addXP(amount) {
    gameState.xp += amount;
    updateLevel();
}

// Missions
function renderMissions() {
    const list = document.getElementById('mission-list');
    list.innerHTML = '';
    gameState.missions.forEach(mission => {
        const li = document.createElement('li');
        li.className = `mission-item ${mission.completed ? 'completed' : ''}`;
        li.innerText = `${mission.text} [${mission.xp} XP]`;
        li.onclick = () => toggleMission(mission.id);
        list.appendChild(li);
    });
}

function toggleMission(id) {
    const mission = gameState.missions.find(m => m.id === id);
    if (mission) {
        mission.completed = !mission.completed;
        if (mission.completed) {
            addXP(mission.xp);
            playSound('finish');
        } else {
            addXP(-mission.xp); // Undo XP
        }
        renderMissions();
        saveGame();
    }
}

// Persistence
function saveGame() {
    localStorage.setItem('uberToDevSave', JSON.stringify(gameState));
}

function loadGame() {
    const saved = localStorage.getItem('uberToDevSave');
    if (saved) {
        const parsed = JSON.parse(saved);
        
        // Restore numeric stats
        gameState.xp = parsed.xp || 0;
        gameState.level = parsed.level || 0;
        gameState.streak = parsed.streak || 0;
        gameState.lastLogin = parsed.lastLogin;

        // Restore mission status ONLY (keep text/xp from code)
        if (parsed.missions) {
            gameState.missions = gameState.missions.map(mission => {
                // Find saved version of this mission by ID
                const savedMission = parsed.missions.find(m => m.id === mission.id);
                if (savedMission) {
                    // Update ONLY the completed status
                    return { ...mission, completed: savedMission.completed };
                }
                return mission;
            });
        }
    }
    updateLevel();
    renderMissions();
}

// Random Quote
function showRandomQuote() {
    const el = document.getElementById('quote-display');
    const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    let i = 0;
    el.innerText = '';
    
    function type() {
        if (i < quote.length) {
            el.textContent += quote.charAt(i);
            i++;
            setTimeout(type, 50);
        }
    }
    type();
}



// Init
document.addEventListener('DOMContentLoaded', () => {
    loadGame();
    showRandomQuote();
    resetTimer(FOCUS_TIME, 'focus'); // Init state
    
    document.getElementById('btn-focus').addEventListener('click', () => {
        if (isRunning) return;
        if (mode !== 'focus') resetTimer(FOCUS_TIME, 'focus');
        startTimer();
    });
    
    document.getElementById('btn-short-break').addEventListener('click', () => resetTimer(SHORT_BREAK, 'short'));
    document.getElementById('btn-long-break').addEventListener('click', () => resetTimer(LONG_BREAK, 'long'));
});
