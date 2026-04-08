/* ============================================================
   1. CONSTANTS & INITIAL STATE
   ============================================================ */
const SAVE_KEY = "eugor_save_data";
const MAP_DATA = {
    "0": "====================",
    "1": "|E    ^           R|",
    "2": "|           ^      |",
    "3": "|                  |",
    "4": "|@                 &",
    "5": "|                  |",
    "6": "|    ^             |",
    "7": "|              ^   |",
    "8": "===================="
};

let gameState = null;

/* ============================================================
   2. CORE INITIALIZATION
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
    // Menu Navigation
    document.getElementById("btn-start").onclick = handleStartFlow;
    document.getElementById("btn-data").onclick = () => toggleModal(true);
    document.getElementById("btn-close-modal").onclick = () => toggleModal(false);
    
    // Data Management
    document.getElementById("btn-export").onclick = exportSave;
    document.getElementById("btn-import").onclick = importSave;
    document.getElementById("btn-clear").onclick = clearSave;

    // Difficulty Selection
    document.querySelectorAll(".diff-opt").forEach(btn => {
        btn.onclick = () => initNewGame(btn.getAttribute("data-diff"));
    });

    // Input Listener
    window.addEventListener("keydown", handleInput);

    updateSaveStatus();
});

function updateSaveStatus() {
    const saved = localStorage.getItem(SAVE_KEY);
    document.getElementById("save-status").textContent = saved ? "-- SAVE DETECTED --" : "-- NO SAVE DETECTED --";
}

function toggleModal(show) {
    const modal = document.getElementById("data-modal");
    show ? modal.classList.remove("inactive") : modal.classList.add("inactive");
}

/* ============================================================
   3. GAME STATE MANAGEMENT
   ============================================================ */
function handleStartFlow() {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
        gameState = JSON.parse(saved);
        enterCrawlMode();
    } else {
        switchScreen("main-menu", "diff-screen");
    }
}

function initNewGame(choice) {
    // Base Stats
    gameState = {
        difficulty: choice,
        stats: { hp: 500, maxHP: 500, strength: 1.0 },
        inv: ["Copper Sword"],
        currentLevel: "paved",
        grid: Object.values(MAP_DATA).map(r => r.split('')),
        playerPos: { r: 4, c: 1 },
        crawlMode: true
    };

    // Python Difficulty Scaling Logic
    if (choice === "A") gameState.stats = { hp: 500, maxHP: 500, strength: 2.0 };
    if (choice === "C") gameState.stats = { hp: 250, maxHP: 250, strength: 1.0 };
    if (choice === "D") {
        gameState.stats = { hp: 100, maxHP: 100, strength: 0.5 };
        gameState.inv = ["Copper Dagger"];
    }

    saveGame();
    enterCrawlMode();
}

function enterCrawlMode() {
    switchScreen("diff-screen", "game-screen");
    switchScreen("main-menu", "game-screen");
    gameState.crawlMode = true;
    render();
}

function switchScreen(oldID, newID) {
    document.getElementById(oldID).classList.add("inactive");
    document.getElementById(newID).classList.remove("inactive");
}

function saveGame() {
    localStorage.setItem(SAVE_KEY, JSON.stringify(gameState));
}

/* ============================================================
   4. PLAYER & ENEMY MOVEMENT LOGIC
   ============================================================ */
function handleInput(e) {
    if (!gameState || !gameState.crawlMode) return;
    const key = e.key.toLowerCase();
    
    let dr = 0, dc = 0;
    if (key === 'w') dr = -1;
    else if (key === 's') dr = 1;
    else if (key === 'a') dc = -1;
    else if (key === 'd') dc = 1;
    else return; // Ignore other keys

    movePlayer(dr, dc);
}

function movePlayer(dr, dc) {
    const nr = gameState.playerPos.r + dr;
    const nc = gameState.playerPos.c + dc;
    const target = gameState.grid[nr]?.[nc];

    // Wall Collision
    if (!target || target === '=' || target === '|') return;

    // Entity Interaction (Combat/Items)
    if (['E', 'R', 'P', 'F'].includes(target)) {
        console.log("Combat Triggered by Player!");
        // startEncounter(target); // To be implemented
        return; 
    }

    // Standard Move
    gameState.grid[gameState.playerPos.r][gameState.playerPos.c] = ' ';
    gameState.playerPos = { r: nr, c: nc };
    gameState.grid[nr][nc] = '@';

    // Post-move: Process Enemies
    updateEnemies();
    
    saveGame();
    render();
}

function updateEnemies() {
    const enemies = [];
    // 1. Locate all enemies currently on grid
    gameState.grid.forEach((row, r) => {
        row.forEach((char, c) => {
            if (['E', 'R', 'P', 'F'].includes(char)) {
                enemies.push({ type: char, r, c });
            }
        });
    });

    // 2. Process each enemy move
    enemies.forEach(en => {
        const path = getNextMoveBFS({ r: en.r, c: en.c }, gameState.playerPos, gameState.grid);
        
        if (path && path.length > 1) {
            const nextStep = path[1]; // Index 0 is the current position
            const targetChar = gameState.grid[nextStep.r][nextStep.c];

            if (targetChar === '@') {
                console.log("Combat Triggered by Enemy!");
                // startEncounter(en.type); 
            } else if (targetChar === ' ') {
                // Execute move in the source of truth
                gameState.grid[en.r][en.c] = ' ';
                gameState.grid[nextStep.r][nextStep.c] = en.type;
            }
        }
    });
}

/* ============================================================
   5. PATHFINDING (BFS)
   ============================================================ */
function getNextMoveBFS(start, target, grid) {
    const queue = [[{ r: start.r, c: start.c }]];
    const visited = new Set([`${start.r},${start.c}`]);
    const dirs = [{r:-1, c:0}, {r:1, c:0}, {r:0, c:-1}, {r:0, c:1}];

    while (queue.length > 0) {
        const path = queue.shift();
        const cur = path[path.length - 1];

        if (cur.r === target.r && cur.c === target.c) return path;

        for (const d of dirs) {
            const nr = cur.r + d.r, nc = cur.c + d.c;
            const key = `${nr},${nc}`;
            
            // Boundary + Wall Check
            if (grid[nr] && grid[nr][nc] !== undefined && 
                !['=', '|'].includes(grid[nr][nc]) && 
                !visited.has(key)) {
                
                visited.add(key);
                queue.push([...path, { r: nr, c: nc }]);
            }
        }
    }
    return null;
}

/* ============================================================
   6. RENDERING ENGINE
   ============================================================ */
function render() {
    const container = document.getElementById("dungeon-grid");
    container.innerHTML = "";
    document.getElementById("hp-val").textContent = gameState.stats.hp;
    
    container.style.gridTemplateColumns = `repeat(20, 25px)`;

    gameState.grid.forEach(row => {
        row.forEach(char => {
            const tile = document.createElement("div");
            tile.className = "tile";

            if (char === '=') tile.innerHTML = '<div class="wall-h"></div>';
            else if (char === '|') tile.innerHTML = '<div class="wall-v"></div>';
            else if (char !== ' ') {
                const s = document.createElement("span");
                s.className = "entity";
                s.textContent = char;
                if (char === '@') s.classList.add("player");
                if (['E','R','P','F'].includes(char)) s.classList.add("enemy");
                if (char === '&') s.classList.add("door");
                tile.appendChild(s);
            }
            container.appendChild(tile);
        });
    });
}

/* ============================================================
   7. DATA I/O (LOCALSTORAGE)
   ============================================================ */
function exportSave() {
    const io = document.getElementById("data-io");
    io.value = localStorage.getItem(SAVE_KEY);
    io.select();
    document.execCommand("copy");
    alert("Save data copied to clipboard!");
}

function importSave() {
    const val = document.getElementById("data-io").value;
    try {
        JSON.parse(val);
        localStorage.setItem(SAVE_KEY, val);
        location.reload();
    } catch(e) { alert("Invalid JSON data!"); }
}

function clearSave() {
    if(confirm("Permanently wipe all local save data?")) {
        localStorage.removeItem(SAVE_KEY);
        location.reload();
    }
}
