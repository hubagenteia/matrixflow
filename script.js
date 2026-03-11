// Game State
let gameState = {
  xp: 1700,
  level: 0,
  missions: [
    {
      id: 1,
      text: "Completar 4 Pomodoros",
      completed: false,
      xp: 0, // XP per step (handled by tick() directly)
      bonusXp: 200, // Bonus when reaching 4
      currentProgress: 0,
      targetProgress: 4,
    },
    {
      id: 2,
      text: "Marco: Evolução do Agente",
      completed: false,
      xp: 500,
    },
    { id: 3, text: "Não abrir redes sociais", completed: false, xp: 100 },
    {
      id: 4,
      text: "Beber 500ml de água",
      completed: false,
      xp: 100, // XP per glass
      bonusXp: 200, // Bonus when reaching 4
      currentProgress: 0,
      targetProgress: 4,
    },
    { id: 5, text: "Pranayama", completed: false, xp: 200 },
    { id: 6, text: "Malhar", completed: false, xp: 500 },
  ],

  streak: 0,
  lastLogin: null,
  agentMode: false,
};

// Config
const XP_PER_MINUTE = 4;
let currentFocusTime = 25;
let currentBreakTime = 5;
const XP_BASE = 7.65;
const XP_EXPONENT = 3;

function getRequiredXP(levelIndex) {
  if (levelIndex === 0) return 0;
  return Math.floor(XP_BASE * Math.pow(levelIndex, XP_EXPONENT));
}

const LEVELS = [
  "Motorista 5 Estrelas",
  "Iniciado na Matrix",
  "Estudante de Lógica",
  "Iniciado em JSON",
  "Engenheiro de Prompt",
  "Mestre do Prompt",
  "Curioso do n8n",
  "Observador de Código",
  "Explorador de Nós",
  "Invocador de Webhooks",
  "Anomalia no Código",
  "Infiltrado no Sistema",
  "Hacker de Scripts",
  "Manipulador de Variáveis",
  "Domador de Bots",
  "Desenvolvedor de Agentes",
  "Scripter de Elite",
  "Especialista em Contexto",
  "Mestre dos Workflows",
  "Alquimista de Dados",
  "Mestre das APIs",
  "Integrador de Sistemas",
  "Otimizador Cibernético",
  "Estrategista de Automação",
  "Criador de Frameworks",
  "Arquiteto de Fluxos",
  "Tech Lead de IA",
  "Engenheiro de Machine Learning",
  "Especialista em Deep Learning",
  "Visionário de Dados",
  "Domador de LLMs",
  "Hacker de Redes Neurais",
  "Orquestrador de Agentes",
  "Orquestrador de Enxames",
  "Arquiteto de Soluções Cloud",
  "Engenheiro de Singularidade",
  "Diretor de Engenharia IA",
  "Tech Lead da Singularidade",
  "Cientista de Agentes",
  "Pesquisador de IAG",
  "Unicórnio do Deep Tech",
  "Founder Tech do Vale",
  "Arquiteto de IAs Autônomas",
  "Arquiteto da Superinteligência",
  "Pioneiro do Código Consciente",
  "Entidade Digital",
  "Ghost in the Shell",
  "Deus Ex Machina",
  "Oráculo da Matrix",
  "Lenda do Vale do Silício"
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
      const baseReward = Math.ceil(currentFocusTime * XP_PER_MINUTE);
      const xpMultiplier = gameState.agentMode ? 2 : 1;
      const reward = baseReward * xpMultiplier;

      addXP(reward);
      alert(
        `Foco concluído! +${reward} XP ${gameState.agentMode ? "(BÔNUS AGENTE 2x)" : ""}`,
      );

      // Avançar missão de pomodoros (ID 1)
      const missionPoints = gameState.agentMode ? 2 : 1;
      incrementMissionProgress(1, missionPoints);

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
    toggleBreakModeVisuals(false);
  } else {
    statusEl.innerText = "MODO: PAUSA";
    toggleBreakModeVisuals(true);
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

  totalTime = Math.round(newTime * 60);
  timeLeft = totalTime;
  document.body.classList.remove("status-active");
  updateSystemStatus();
  document.getElementById("btn-focus").innerText = "INICIAR";
  updateTimerDisplay();
}

// XP & Level System
function updateLevel() {
  let currentLevelIndex = 0;
  let nextLevelIndex = 1;

  for (let i = 0; i < LEVELS.length; i++) {
    let reqXp = getRequiredXP(i);
    if (gameState.xp >= reqXp) {
      currentLevelIndex = i;
      nextLevelIndex = i + 1;
      gameState.level = i; // Sync numeric level
    } else {
      break;
    }
  }

  const currentLevelName = LEVELS[currentLevelIndex];
  
  // Handlers para quando passa do último nível
  let nextLevelName = "MAX LEVEL";
  let currentLevelXP = getRequiredXP(currentLevelIndex);
  let nextLevelXP = 999999;
  
  if (nextLevelIndex < LEVELS.length) {
    nextLevelXP = getRequiredXP(nextLevelIndex);
  }

  document.getElementById("current-level").innerText = currentLevelName;
  document.getElementById("current-xp").innerText = gameState.xp;
  document.getElementById("next-level-xp").innerText = nextLevelXP;

  // Update Operator ID (Dynamic visual)
  const opId = document.getElementById("operator-id");
  const opText = String(currentLevelIndex + 1).padStart(2, "0");
  opId.innerText = opText;
  opId.setAttribute("data-text", opText);

  const xpNeeded = nextLevelXP - currentLevelXP;
  const xpProgress = gameState.xp - currentLevelXP;
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

    let progressText = "";
    if (mission.targetProgress) {
      progressText = ` (${mission.currentProgress}/${mission.targetProgress})`;
    }

    li.innerText = `${mission.text}${progressText} [${mission.xp} XP]`;
    li.onclick = () => toggleMission(mission.id);
    list.appendChild(li);
  });
}

function incrementMissionProgress(id, amount = 1) {
  const mission = gameState.missions.find((m) => m.id === id);
  if (mission && !mission.completed && mission.targetProgress) {
    mission.currentProgress += amount;

    // Give XP per step (if defined)
    if (mission.xp > 0) {
      addXP(mission.xp * amount);
    }

    if (mission.currentProgress >= mission.targetProgress) {
      mission.completed = true;

      // Give Bonus XP (if defined)
      if (mission.bonusXp) {
        addXP(mission.bonusXp);
        alert(`BÔNUS DE MISSÃO: +${mission.bonusXp} XP!`);
      } else if (mission.xp > 0 && mission.xp !== 100) {
        // Fallback or legacy behavior for total mission XP
        addXP(mission.xp);
      }

      playSound("finish");

      // Auto-reset para permitir repetição
      setTimeout(() => {
        mission.completed = false;
        mission.currentProgress =
          mission.currentProgress % mission.targetProgress;
        renderMissions();
        saveGame();
      }, 2000);
    }
    renderMissions();
    saveGame();
  }
}

function toggleMission(id) {
  const mission = gameState.missions.find((m) => m.id === id);
  if (!mission || mission.completed) return;

  if (mission.targetProgress) {
    incrementMissionProgress(id);
  } else {
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
    gameState.agentMode = parsed.agentMode || false;

    // Restore mission status ONLY (keep text/xp from code)

    if (parsed.missions) {
      gameState.missions = gameState.missions.map((mission) => {
        // Find saved version of this mission by ID
        const savedMission = parsed.missions.find((m) => m.id === mission.id);
        if (savedMission) {
          // Update ONLY the completed status and progress
          return {
            ...mission,
            completed: savedMission.completed,
            currentProgress: savedMission.currentProgress || 0,
          };
        }
        return mission;
      });
    }
  }
  updateLevel();
  renderMissions();

  // Sync Agent Mode Visuals
  const statusText = document.getElementById("agent-status-text");
  if (statusText) {
    statusText.innerText = gameState.agentMode ? "ON" : "OFF";
    toggleAgentModeVisuals(gameState.agentMode);
  }
}

function toggleAgentModeVisuals(active) {
  if (active) {
    document.body.classList.add("agent-mode-active");
  } else {
    document.body.classList.remove("agent-mode-active");
  }
}

function toggleBreakModeVisuals(active) {
  if (active) {
    document.body.classList.add("break-mode-active");
  } else {
    document.body.classList.remove("break-mode-active");
  }
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
    const minutes = parseFloat(input.value);

    if (minutes > 0 && minutes <= 999) {
      resetTimer(minutes, mode); // Adjusts whichever mode we are in
      input.value = ""; // Clear for next use
    } else {
      alert("Por favor, insira um valor entre 1 e 999.");
    }
  });

  // Quote Change on Double-Click
  document
    .getElementById("quote-container")
    .addEventListener("dblclick", () => {
      showRandomQuote();
    });

  // Hidden XP Override Logic
  let opClickCount = 0;
  let opClickTimer;
  document.getElementById("operator-id").addEventListener("click", () => {
    opClickCount++;
    clearTimeout(opClickTimer);

    if (opClickCount >= 5) {
      const newXP = prompt(
        "PROTOCOLO DE SOBREPOSIÇÃO: Insira o novo valor de XP:",
      );
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

  // Agent Mode Toggle logic
  const agentToggleButton = document.getElementById("btn-agent-toggle");
  agentToggleButton.addEventListener("click", () => {
    gameState.agentMode = !gameState.agentMode;
    document.getElementById("agent-status-text").innerText = gameState.agentMode
      ? "ON"
      : "OFF";
    toggleAgentModeVisuals(gameState.agentMode);
    saveGame();
  });
});
