// Game State
let gameState = {
  xp: 1700,
  level: 0,
  missions: [
    { id: 1, text: "Completar 4 Pomodoros", completed: false, xp: 200 },
    {
      id: 2,
      text: "Validar 1 workflow completo",
      completed: false,
      xp: 500,
    },
    { id: 3, text: "Não abrir redes sociais", completed: false, xp: 100 },
    { id: 4, text: "Beber 500ml de água", completed: false, xp: 100 },
  ],
  streak: 0,
  lastLogin: null,
};

// Config
const XP_PER_POMODORO = 100;
let currentFocusTime = 25;
let currentBreakTime = 5;
const LEVELS = [
  { name: "Motorista 5 Estrelas", xp: 0 },
  { name: "Iniciado na Matrix", xp: 18 },
  { name: "Estudante de Lógica", xp: 103 },
  { name: "Iniciado em JSON", xp: 284 },
  { name: "Engenheiro de Prompt", xp: 583 },
  { name: "Mestre do Prompt", xp: 1017 },
  { name: "Curioso do n8n", xp: 1600 },
  { name: "Observador de Código", xp: 2361 },
  { name: "Explorador de Nós", xp: 3314 },
  { name: "Invocador de Webhooks", xp: 4474 },
  { name: "Anomalia no Código", xp: 5854 },
  { name: "Infiltrado no Sistema", xp: 7465 },
  { name: "Hacker de Scripts", xp: 9320 },
  { name: "Manipulador de Variáveis", xp: 11432 },
  { name: "Domador de Bots", xp: 13812 },
  { name: "Desenvolvedor de Agentes", xp: 16471 },
  { name: "Scripter de Elite", xp: 19419 },
  { name: "Especialista em Contexto", xp: 22668 },
  { name: "Mestre dos Workflows", xp: 26226 },
  { name: "Alquimista de Dados", xp: 30105 },
  { name: "Mestre das APIs", xp: 34313 },
  { name: "Integrador de Sistemas", xp: 38861 },
  { name: "Otimizador Cibernético", xp: 43758 },
  { name: "Estrategista de Automação", xp: 49013 },
  { name: "Criador de Frameworks", xp: 54635 },
  { name: "Arquiteto de Fluxos", xp: 60633 },
  { name: "Tech Lead de IA", xp: 67016 },
  { name: "Engenheiro de Machine Learning", xp: 73792 },
  { name: "Especialista em Deep Learning", xp: 80971 },
  { name: "Visionário de Dados", xp: 88560 },
  { name: "Domador de LLMs", xp: 96568 },
  { name: "Hacker de Redes Neurais", xp: 105004 },
  { name: "Orquestrador de Agentes", xp: 113875 },
  { name: "Orquestrador de Enxames", xp: 123190 },
  { name: "Arquiteto de Soluções Cloud", xp: 132958 },
  { name: "Engenheiro de Singularidade", xp: 143185 },
  { name: "Diretor de Engenharia IA", xp: 153880 },
  { name: "Tech Lead da Singularidade", xp: 165050 },
  { name: "Cientista de Agentes", xp: 176703 },
  { name: "Pesquisador de IAG", xp: 188847 },
  { name: "Unicórnio do Deep Tech", xp: 201490 },
  { name: "Founder Tech do Vale", xp: 214638 },
  { name: "Arquiteto de IAs Autônomas", xp: 228300 },
  { name: "Arquiteto da Superinteligência", xp: 242481 },
  { name: "Pioneiro do Código Consciente", xp: 257190 },
  { name: "Entidade Digital", xp: 272433 },
  { name: "Ghost in the Shell", xp: 288218 },
  { name: "Deus Ex Machina", xp: 304552 },
  { name: "Oráculo da Matrix", xp: 321443 },
  { name: "Lenda do Vale do Silício", xp: 338896 }
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
  "O único jeito de sair do lugar é codando.",
  "Follow the white rabbit.",
  "I am not afraid anymore, Neo.",
];

// Audio Context for Beeps
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playSound(type) {
  if (audioCtx.state === "suspended") audioCtx.resume();
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  if (type === "start") {
    osc.frequency.value = 600;
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
  } else if (type === "finish") {
    osc.frequency.setValueAtTime(400, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.1);
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.5);
  }
}

// DOM Elements
const timerDisplay = document.getElementById("timer");

// Timer Logic
let timerInterval;
let timeLeft = 25 * 60;
let totalTime = 25 * 60;
let isRunning = false;
let mode = "focus"; // focus, break

function updateTimerDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  timerDisplay.textContent = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

  document.title = `${minutes}:${seconds < 10 ? "0" : ""}${seconds} - ${mode.toUpperCase()}`;
}

function tick() {
  if (timeLeft > 0) {
    timeLeft--;
    updateTimerDisplay();
  } else {
    clearInterval(timerInterval);
    isRunning = false;
    playSound("finish");
    document.body.classList.remove("status-active");
    document.getElementById("system-status").innerText = "CICLO FINALIZADO.";

    if (mode === "focus") {
      addXP(XP_PER_POMODORO);
      alert("Foco concluído! +100 XP");
      resetTimer(currentBreakTime, "break"); // Default break after focus
    } else {
      alert("Pausa finalizada! Pronto para o próximo round?");
      resetTimer(currentFocusTime, "focus"); // Auto-return to focus after break
    }
  }
}

function startTimer() {
  if (!isRunning) {
    isRunning = true;
    timerInterval = setInterval(tick, 1000);
    document.body.classList.add("status-active");
    updateSystemStatus();
    document.getElementById("btn-focus").innerText = "PAUSAR";
    playSound("start");
  }
}

function pauseTimer() {
  if (isRunning) {
    clearInterval(timerInterval);
    isRunning = false;
    document.body.classList.remove("status-active");
    document.getElementById("system-status").innerText = "SISTEMA PAUSADO";
    document.getElementById("btn-focus").innerText = "CONTINUAR";
  }
}

function updateSystemStatus() {
  const statusEl = document.getElementById("system-status");
  if (mode === "focus") {
    statusEl.innerText = "MODO: FOCO";
  } else {
    statusEl.innerText = "MODO: PAUSA";
  }
}

function resetTimer(newTime, newMode) {
  clearInterval(timerInterval);
  isRunning = false;
  mode = newMode;
  
  // Update the stored duration for the current mode
  if (mode === "focus") {
    currentFocusTime = newTime;
  } else {
    currentBreakTime = newTime;
  }

  totalTime = newTime * 60;
  timeLeft = totalTime;
  document.body.classList.remove("status-active");
  updateSystemStatus();
  document.getElementById("btn-focus").innerText = "INICIAR";
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
      gameState.level = i; // Sync numeric level
    }
  }

  document.getElementById("current-level").innerText = currentLevel.name;
  document.getElementById("current-xp").innerText = gameState.xp;
  document.getElementById("next-level-xp").innerText = nextLevel.xp;

  // Update Operator ID (Dynamic visual)
  const opId = document.getElementById("operator-id");
  const levelIndex = LEVELS.indexOf(currentLevel);
  const opText = `OP_${String(levelIndex + 1).padStart(2, "0")}`;
  opId.innerText = opText;
  opId.setAttribute("data-text", opText);

  const xpNeeded = nextLevel.xp - currentLevel.xp;
  const xpProgress = gameState.xp - currentLevel.xp;
  let progressPercent = 0;

  if (xpNeeded > 0) {
    progressPercent = (xpProgress / xpNeeded) * 100;
    if (progressPercent > 100) progressPercent = 100;
  }

  document.getElementById("xp-progress").style.width = `${progressPercent}%`;
  saveGame();
}

function addXP(amount) {
  gameState.xp += amount;
  updateLevel();
}

// Missions
function renderMissions() {
  const list = document.getElementById("mission-list");
  list.innerHTML = "";
  gameState.missions.forEach((mission) => {
    const li = document.createElement("li");
    li.className = `mission-item ${mission.completed ? "completed" : ""}`;
    li.innerText = `${mission.text} [${mission.xp} XP]`;
    li.onclick = () => toggleMission(mission.id);
    list.appendChild(li);
  });
}

function toggleMission(id) {
  const mission = gameState.missions.find((m) => m.id === id);
  if (mission && !mission.completed) {
    mission.completed = true;
    addXP(mission.xp);
    playSound("finish");
    renderMissions();

    // Auto-reset para permitir repetição após 1.5 segundos
    setTimeout(() => {
      mission.completed = false;
      renderMissions();
      saveGame();
    }, 1500);

    saveGame();
  }
}

// Persistence
function saveGame() {
  localStorage.setItem("uberToDevSave", JSON.stringify(gameState));
}

function loadGame() {
  const saved = localStorage.getItem("uberToDevSave");
  if (saved) {
    const parsed = JSON.parse(saved);

    // Restore numeric stats
    gameState.xp = parsed.xp !== undefined ? parsed.xp : 1700;
    gameState.level = parsed.level || 0;
    gameState.streak = parsed.streak || 0;
    gameState.lastLogin = parsed.lastLogin;

    // Restore mission status ONLY (keep text/xp from code)
    if (parsed.missions) {
      gameState.missions = gameState.missions.map((mission) => {
        // Find saved version of this mission by ID
        const savedMission = parsed.missions.find((m) => m.id === mission.id);
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
let quoteTimeout;
function showRandomQuote() {
  const el = document.getElementById("quote-display");
  const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
  let i = 0;
  
  clearTimeout(quoteTimeout);
  el.innerText = "";

  function type() {
    if (i < quote.length) {
      el.textContent += quote.charAt(i);
      i++;
      quoteTimeout = setTimeout(type, 50);
    }
  }
  type();
}

// Init
document.addEventListener("DOMContentLoaded", () => {
  loadGame();
  showRandomQuote();
  resetTimer(currentFocusTime, "focus"); // Init state

  document.getElementById("btn-focus").addEventListener("click", () => {
    if (isRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  });

  document.getElementById("btn-set-focus").addEventListener("click", () => {
    resetTimer(currentFocusTime, "focus");
  });

  document
    .getElementById("btn-short-break")
    .addEventListener("click", () => resetTimer(currentBreakTime, "break"));

  // Timer Presets Logic
  document.querySelectorAll(".btn-preset").forEach((button) => {
    button.addEventListener("click", () => {
      const minutes = parseInt(button.getAttribute("data-time"));
      resetTimer(minutes, mode); // Adjusts whichever mode we are in
    });
  });

  // Manual Timer Logic
  document.getElementById("btn-apply-manual").addEventListener("click", () => {
    const input = document.getElementById("manual-input");
    const minutes = parseInt(input.value);

    if (minutes > 0 && minutes <= 999) {
      resetTimer(minutes, mode); // Adjusts whichever mode we are in
      input.value = ""; // Clear for next use
    } else {
      alert("Por favor, insira um valor entre 1 e 999.");
    }
  });

  // Quote Change on Double-Click
  document.getElementById("quote-container").addEventListener("dblclick", () => {
    showRandomQuote();
  });

  // Hidden XP Override Logic
  let opClickCount = 0;
  let opClickTimer;
  document.getElementById("operator-id").addEventListener("click", () => {
    opClickCount++;
    clearTimeout(opClickTimer);
    
    if (opClickCount >= 5) {
      const newXP = prompt("PROTOCOLO DE SOBREPOSIÇÃO: Insira o novo valor de XP:");
      if (newXP !== null && !isNaN(newXP)) {
        gameState.xp = parseInt(newXP);
        updateLevel();
        alert(`XP atualizado para ${gameState.xp}`);
      }
      opClickCount = 0;
    } else {
      opClickTimer = setTimeout(() => {
        opClickCount = 0;
      }, 2000);
    }
  });
});
