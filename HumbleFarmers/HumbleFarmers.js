// HumbleFarmers Unified Script
// All modules consolidated into a single file, with unified save/export/import/delete.

;(function () {
  /********************************
   * World Module
   ********************************/
  function weightedRandom(options) {
    const total = options.reduce((sum, opt) => sum + opt.weight, 0);
    let threshold = Math.random() * total;
    for (let i = 0; i < options.length; i++) {
      threshold -= options[i].weight;
      if (threshold <= 0) {
        return options[i].value;
      }
    }
    return options[options.length - 1].value;
  }

  let windSpeed = 50;
  let windDirection = 90;

  const speedChanges = [
    { value: 1, weight: 70 },
    { value: 2, weight: 15 },
    { value: 5, weight: 8 },
    { value: 10, weight: 4 },
    { value: 25, weight: 2 },
    { value: 50, weight: 0.9 },
    { value: 250, weight: 0.1 }
  ];

  const dirChanges = [
    { value: 1, weight: 50 },
    { value: 5, weight: 40 },
    { value: 15, weight: 9 },
    { value: 45, weight: 1 }
  ];

  function updateWind() {
    let speedDelta = weightedRandom(speedChanges);
    speedDelta = Math.random() < 0.5 ? -speedDelta : speedDelta;
    let newSpeed = windSpeed + speedDelta;
    if (newSpeed < 0) newSpeed = 0;
    if (newSpeed > 250) newSpeed = 250;
    windSpeed = newSpeed;

    let dirDelta = weightedRandom(dirChanges);
    dirDelta = Math.random() < 0.5 ? -dirDelta : dirDelta;
    windDirection = (windDirection + dirDelta) % 360;
    if (windDirection < 0) windDirection += 360;

    console.log(
      "World updated: Wind speed = " +
        windSpeed +
        " mph, Wind direction = " +
        windDirection.toFixed(1) +
        "°"
    );
  }

  setInterval(updateWind, 60000);

  window.worldModule = {
    getWindSpeed: function () {
      return windSpeed;
    },
    getWindDirection: function () {
      return windDirection;
    },
    updateWind: updateWind
  };
})();

;(function () {
  /********************************
   * Storage Module
   ********************************/
  function getStoredMaterials() {
    const stored = localStorage.getItem("storageMaterials");
    return stored ? JSON.parse(stored) : { cash: 0, scrap: 0, stone: 0 };
  }

  function saveStoredMaterials(materials) {
    localStorage.setItem("storageMaterials", JSON.stringify(materials));
  }

  function addMaterial(material, amount) {
    const materials = getStoredMaterials();
    if (material === "cash") {
      materials.cash += amount;
    } else if (material === "scrap" || material === "stone") {
      materials[material] = Math.min(materials[material] + amount, 100);
    }
    saveStoredMaterials(materials);
    console.log(
      `Added ${amount} ${material}. Current ${material}: ${
        getStoredMaterials()[material]
      }`
    );
  }

  function displayStorage() {
    const { cash, scrap, stone } = getStoredMaterials();
    return `
      <div id="storageContainer" style="padding:20px;">
        <h2>Storage</h2>
        <p>Current Materials:</p>
        <div><strong>Cash:</strong> ${cash}</div>
        <div><strong>Scrap:</strong> ${scrap}</div>
        <div><strong>Stone:</strong> ${stone}</div>
        <p>Available command: <code>function addMaterial('cash'|'scrap'|'stone', amount)</code></p>
      </div>
    `;
  }

  function initStorage() {}

  window.storageModule = {
    getStoredMaterials,
    saveStoredMaterials,
    addMaterial,
    displayStorage,
    initStorage
  };
  window.addMaterial = addMaterial;
})();

;(function () {
  /********************************
   * Drone Module
   ********************************/
  const DRONES_KEY = "dronesData";

  function getDrones() {
    try {
      const data = localStorage.getItem(DRONES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Error reading dronesData:", e);
      return [];
    }
  }

  function saveDrones(drones) {
    try {
      localStorage.setItem(DRONES_KEY, JSON.stringify(drones));
    } catch (e) {
      console.error("Error saving dronesData:", e);
    }
  }

  function createDefaultDrone() {
    const drones = getDrones();
    if (!drones.some(d => d.type === "jeff")) {
      const newDrone = {
        id: "drone0-0",
        type: "jeff",
        description: "Your trusty Jeff drone.",
        scavangeTime: 30000,
        battery: "∞/∞",
        workType: "scavenge",
        infinitePower: true,
        isRunning: false,
        taskStart: null,
        taskDuration: null
      };
      drones.push(newDrone);
      saveDrones(drones);
      console.log("Default Jeff drone created:", newDrone.id);
    }
  }

  function createDrillDrone() {
    const drones = getDrones();
    const idx = drones.filter(d => d.type === "drill").length;
    const newDrone = {
      id: `drone1-${idx}`,
      type: "drill",
      description: "A robust drill drone built to extract stone.",
      scavangeTime: 30000,
      battery: "100/100",
      workType: "drill",
      infinitePower: false,
      isRunning: false,
      taskStart: null,
      taskDuration: null
    };
    drones.push(newDrone);
    saveDrones(drones);
    console.log("Drill drone purchased:", newDrone.id);
    updateDroneDisplay();
  }

  function getDrillYieldMultiplier() {
    try {
      const shopState = JSON.parse(
        localStorage.getItem("shopState") || '{"upgrades":{}}'
      );
      const tier =
        shopState.upgrades && shopState.upgrades.drillYield
          ? shopState.upgrades.drillYield
          : 0;
      return 1 + tier * 2.0;
    } catch (e) {
      console.error("Error reading drill yield multiplier:", e);
      return 1;
    }
  }

  const JEFF_BASE_YIELD = 5;
  const DRILL_BASE_YIELD = 5;

  function renderDroneCard(drone) {
    let progressBar = "";
    let timerText = "0 ms";
    if (drone.isRunning && drone.taskStart && drone.taskDuration) {
      const elapsed = Date.now() - drone.taskStart;
      const progressPercent = Math.min(
        (elapsed / drone.taskDuration) * 100,
        100
      );
      progressBar = `
        <div style="background: var(--border-color); height: 8px; border-radius: 4px; overflow: hidden; margin-top: 8px;">
          <div id="progress-${drone.id}" style="width: ${progressPercent}%; background: var(--accent-color); height: 100%;"></div>
        </div>`;
      timerText = `${elapsed} ms`;
    } else {
      progressBar = `<div style="background: var(--border-color); height: 8px; border-radius: 4px; margin-top: 8px;"></div>`;
    }
    return `
      <div class="drone-card" data-id="${drone.id}" style="
           background: var(--content-bg);
           color: var(--text-color);
           border-left: 4px solid var(--accent-color);
           padding: 10px;
           margin-bottom: 10px;
           border-radius: 4px;">
         <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="font-size: 1.1em;"><strong>${drone.id.replace(
              "drone",
              ""
            )}</strong> (${drone.type})</div>
            <div class="status-chip" style="
                 font-size: 0.9em;
                 padding: 2px 6px;
                 background: ${
                   drone.isRunning ? "var(--hover-color)" : "var(--border-color)"
                 };
                 border-radius: 3px;">
              ${drone.isRunning ? "Working..." : "Idle"}
            </div>
         </div>
         <p style="margin-top: 5px; font-size: 0.9em;">${
           drone.description
         }</p>
         <p style="margin-top: 5px; font-size: 0.9em;">Battery: ${
           drone.battery
         }</p>
         ${progressBar}
         <span id="timer-${drone.id}" style="font-size: 0.8em;">${timerText}</span>
      </div>
    `;
  }

  function updateDroneDisplay() {
    const container = document.getElementById("droneContainer");
    if (!container) return;

    let typeSelect = document.getElementById("droneTypeSelect");
    let selectedType = typeSelect ? typeSelect.value : "jeff";

    let controlHTML = `
      <div id="droneControl" style="margin-bottom: 1rem;">
        <label for="droneTypeSelect" style="color: var(--text-color);">Type:</label>
        <select id="droneTypeSelect" style="padding: 0.5rem; margin-left: 0.5rem;">
          <option value="jeff" ${
            selectedType === "jeff" ? "selected" : ""
          }>Jeff</option>
          <option value="drill" ${
            selectedType === "drill" ? "selected" : ""
          }>Drill</option>
        </select>
        <label for="droneSelect" style="color: var(--text-color); margin-left: 1rem;">Select Drone:</label>
        <select id="droneSelect" style="padding: 0.5rem; margin-left: 0.5rem;"></select>
        <label for="taskDuration" style="color: var(--text-color); margin-left: 1rem;">Duration (ms):</label>
        <input type="number" id="taskDuration" value="30000" min="1000" style="padding: 0.5rem; width: 100px; margin-left: 0.5rem;">
        <button onclick="executeTask()" style="padding: 0.5rem 1rem; margin-left: 1rem; background: var(--accent-color); color: var(--console-text); border: none; border-radius: 4px;">Start Task</button>
      </div>
    `;

    let drones = getDrones().filter(d => d.type === selectedType);
    let dronesHTML = `<h2 style="margin-bottom:1rem; color: var(--accent-color);">Drone Fleet</h2>`;
    if (drones.length === 0) {
      dronesHTML += `<p style="color: var(--text-color);">No drones available.</p>`;
    } else {
      drones.sort((a, b) => {
        let [aType, aIdx] = a.id
          .replace("drone", "")
          .split("-")
          .map(Number);
        let [bType, bIdx] = b.id
          .replace("drone", "")
          .split("-")
          .map(Number);
        return aType - bType || aIdx - bIdx;
      });
      dronesHTML += drones.map(drone => renderDroneCard(drone)).join("");
    }

    container.innerHTML = controlHTML + dronesHTML;

    let select = document.getElementById("droneSelect");
    select.innerHTML = "";
    let available = getDrones().filter(d => d.type === selectedType);
    available.sort((a, b) => {
      let [aType, aIdx] = a.id
        .replace("drone", "")
        .split("-")
        .map(Number);
      let [bType, bIdx] = b.id
        .replace("drone", "")
        .split("-")
        .map(Number);
      return aType - bType || aIdx - bIdx;
    });
    available.forEach(drone => {
      const option = document.createElement("option");
      option.value = drone.id;
      option.textContent = drone.id.replace("drone", "");
      if (drone.isRunning) option.disabled = true;
      select.appendChild(option);
    });

    typeSelect = document.getElementById("droneTypeSelect");
    typeSelect.addEventListener("change", updateDroneDisplay);
  }

  function startDroneTask(droneId, duration) {
    let drones = getDrones();
    let drone = drones.find(d => d.id === droneId);
    if (!drone) {
      console.error("Drone not found:", droneId);
      return;
    }
    if (drone.isRunning) {
      console.log("Drone already running:", droneId);
      return;
    }
    drone.isRunning = true;
    drone.taskStart = Date.now();
    drone.taskDuration = duration;
    saveDrones(drones);
    updateDroneDisplay();

    const intervalTime = 100;
    const intervalId = setInterval(() => {
      updateDroneDisplay();
    }, intervalTime);

    setTimeout(() => {
      clearInterval(intervalId);
      drones = getDrones();
      let d = drones.find(d => d.id === droneId);
      if (d) {
        d.isRunning = false;
        d.taskStart = null;
        d.taskDuration = null;
      }
      saveDrones(drones);

      if (drone.type === "jeff") {
        if (
          window.storageModule &&
          typeof storageModule.addMaterial === "function"
        ) {
          storageModule.addMaterial("scrap", JEFF_BASE_YIELD);
          console.log("Jeff drone yielded " + JEFF_BASE_YIELD + " scrap.");
        }
      } else if (drone.type === "drill") {
        const multiplier = getDrillYieldMultiplier();
        const yieldAmount = DRILL_BASE_YIELD * multiplier;
        if (
          window.storageModule &&
          typeof storageModule.addMaterial === "function"
        ) {
          storageModule.addMaterial("stone", yieldAmount);
          console.log(
            "Drill drone yielded " +
              yieldAmount +
              " stone (multiplier: " +
              multiplier +
              ")."
          );
        }
      }

      updateDroneDisplay();
    }, duration);
  }

  window.executeTask = function () {
    const droneSelect = document.getElementById("droneSelect");
    const durationInput = document.getElementById("taskDuration");
    if (!droneSelect || !durationInput) {
      alert("UI elements missing.");
      return;
    }
    const droneId = droneSelect.value;
    const duration = Number(durationInput.value);
    if (!droneId) {
      alert("Please select a drone.");
      return;
    }
    if (isNaN(duration) || duration < 1000) {
      alert("Enter a valid duration (min 1000ms).");
      return;
    }
    startDroneTask(droneId, duration);
  };

  createDefaultDrone();
  updateDroneDisplay();

  window.droneModule = {
    getDrones,
    saveDrones,
    displayDrones: updateDroneDisplay,
    startDroneTask,
    createDefaultDrone,
    createDrillDrone
  };
})();

;(function () {
  /********************************
   * Shop Module
   ********************************/
  const SHOP_KEY = "shopState";

  function loadShopState() {
    try {
      const raw = localStorage.getItem(SHOP_KEY);
      return raw ? JSON.parse(raw) : { upgrades: {}, items: {}, drones: {} };
    } catch (e) {
      console.error("Error loading shop state:", e);
      return { upgrades: {}, items: {}, drones: {} };
    }
  }

  function saveShopState(state) {
    try {
      localStorage.setItem(SHOP_KEY, JSON.stringify(state));
    } catch (e) {
      console.error("Error saving shop state:", e);
    }
  }

  let shopState = loadShopState();

  const catalog = {
    upgrades: [
      {
        id: "wind",
        name: "Wind Vein Upgrade",
        cost: 1000,
        desc: "Enhances wind vein harvesting by 20%.",
        stats: { bonus: "+20% efficiency" },
        factor: 1.5,
        infinite: false,
        limit: 3
      }
    ],
    items: [
      {
        id: "jeffchip",
        name: "Jeff Upgrade Chip",
        cost: 750,
        desc: "Increases your Jeff drone's yield by 20% per chip.",
        stats: { bonus: "+20% yield per chip" },
        factor: 1.5,
        infinite: true
      },
      {
        id: "drillYield",
        name: "Drill Yield Upgrade",
        cost: 800,
        desc: "Boosts drill output by +200% per tier.",
        stats: { bonus: "+200% drill yield per tier" },
        factor: 1.5,
        infinite: false,
        limit: 3
      }
    ],
    drones: [
      {
        id: "drill",
        name: "Drill Drone",
        cost: 500,
        desc: "Extract stone with high precision.",
        stats: { productivity: "x1" },
        factor: 1.5,
        infinite: true
      }
    ]
  };

  let hideCompleted = false;

  function getCash() {
    return storageModule.getStoredMaterials().cash;
  }

  function canAfford(amount) {
    return getCash() >= amount;
  }

  function meets(reqs) {
    if (!reqs || reqs.length === 0) return true;
    return reqs.every(
      r => shopState.upgrades[r] > 0 || shopState.items[r] > 0
    );
  }

  function computeCost(base, factor, count) {
    return Math.floor(base * Math.pow(factor, count));
  }

  function borderClr(owned, unlocked, afford) {
    if (owned > 0) return "var(--accent-color)";
    if (!unlocked) return "#6b7280";
    return afford ? "#10B981" : "#EF4444";
  }

  function displayShop() {
    const style = `
      <style>
        .tab-btn {
          background: var(--content-bg);
          color: var(--text-color);
          padding: 6px 12px;
          border: none;
          border-radius: 4px 4px 0 0;
          cursor: pointer;
          transition: background 0.2s;
        }
        .tab-btn.active {
          background: var(--accent-color);
          color: #fff;
        }
        .tab-btn:hover {
          background: var(--hover-color);
        }
        .shop-card {
          position: relative;
          background: var(--content-bg);
          color: var(--text-color);
          padding: 10px;
          margin-bottom: 10px;
          border-radius: 4px;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .shop-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 6px 12px rgba(0,0,0,0.3);
        }
        .badge {
          position: absolute;
          top: 8px;
          right: 8px;
          background: var(--border-color);
          color: var(--text-color);
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 0.75em;
        }
        .badge.locked { background: #6b7280; }
        #toggleHideCompleted {
          background: var(--content-bg);
          border: 1px solid var(--border-color);
          color: var(--text-color);
          padding: 4px 8px;
          border-radius: 4px;
          cursor: pointer;
          margin-left: 1rem;
        }
      </style>
    `;
    return `
      ${style}
      <div id="shopRoot" style="padding:20px;">
        <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
          <div><i class="fas fa-coins"></i> Credits: <span id="cashDisplay">0</span></div>
          <div><i class="fas fa-recycle"></i> Scrap: <span id="scrapDisplay">0</span></div>
        </div>
        <div id="shopTabs" class="flex gap-2 mb-4">
          <button id="btnUpg" class="tab-btn active">Upgrades</button>
          <button id="btnItm" class="tab-btn">Items</button>
          <button id="btnDrn" class="tab-btn">Drones</button>
          <button id="btnSell" class="tab-btn">Sell</button>
          <button id="toggleHideCompleted">Hide Completed: OFF</button>
        </div>
        <div id="shopMain"></div>
      </div>
    `;
  }

  function renderCurrency() {
    const materials = storageModule.getStoredMaterials();
    document.getElementById("cashDisplay").textContent = materials.cash;
    document.getElementById("scrapDisplay").textContent = materials.scrap;
  }

  function clearActiveTabs() {
    document
      .querySelectorAll(".tab-btn")
      .forEach(btn => btn.classList.remove("active"));
  }

  function selectTab(tab) {
    clearActiveTabs();
    if (tab === "Upg") {
      document.getElementById("btnUpg").classList.add("active");
      renderSection("upgrades");
    } else if (tab === "Itm") {
      document.getElementById("btnItm").classList.add("active");
      renderSection("items");
    } else if (tab === "Drn") {
      document.getElementById("btnDrn").classList.add("active");
      renderDrones();
    } else if (tab === "Sell") {
      document.getElementById("btnSell").classList.add("active");
      renderSell();
    }
  }

  function renderCard(entry, section) {
    let count = shopState[section][entry.id] || 0;
    if (hideCompleted && count >= (entry.limit || Infinity) && !entry.infinite)
      return "";
    const unlocked = meets(entry.requires);
    const currentCost = computeCost(entry.cost, entry.factor, count);
    const afford = canAfford(currentCost);
    const bc = borderClr(count, unlocked, afford);
    let ownedText = "";
    if (entry.limit) {
      ownedText = `Owned: ${count}/${entry.limit}`;
    } else if (count > 0) {
      ownedText = `Owned x${count}`;
    }
    const isMaxed = entry.limit ? count >= entry.limit : false;
    const buttonText = isMaxed ? "Maxed" : "Buy";
    const disabledAttr = isMaxed || !unlocked || !afford ? "disabled" : "";
    const costDisplay = isMaxed ? "" : `<p>Cost: ${currentCost}</p>`;
    return `
      <div class="shop-card" style="border-left:4px solid ${bc}; ${
      !unlocked ? "filter: grayscale(1) opacity(0.6);" : ""
    }">
        ${ownedText ? `<div class="badge">${ownedText}</div>` : ""}
        ${!unlocked ? `<div class="badge locked">LOCKED</div>` : ""}
        <h3>${entry.name}</h3>
        <p>${entry.desc}</p>
        ${costDisplay}
        ${Object.entries(entry.stats)
          .map(([k, v]) => `<div style="font-size:0.85em;">${k}: ${v}</div>`)
          .join("")}
        <button data-buy="${section}:${entry.id}" ${disabledAttr} style="
          margin-top:8px; width:100%; padding:6px;
          background: ${
            disabledAttr ? "var(--border-color)" : "var(--accent-color)"
          };
          color: var(--console-text); border: none; border-radius:3px;
          cursor: ${disabledAttr ? "not-allowed" : "pointer"};">
          ${buttonText}
        </button>
      </div>
    `;
  }

  function renderSection(section) {
    shopState = loadShopState();
    const wrap = document.getElementById("shopMain");
    wrap.innerHTML = catalog[section]
      .map(entry => renderCard(entry, section))
      .join("");
    attachBuy(section);
  }

  function renderDrones() {
    shopState = loadShopState();
    const wrap = document.getElementById("shopMain");
    const entry = catalog.drones[0];
    let count = shopState.drones[entry.id] || 0;
    const currentCost = computeCost(entry.cost, entry.factor, count);
    const afford = canAfford(currentCost);
    const bc = borderClr(count, true, afford);
    wrap.innerHTML = `
      <div class="shop-card" style="border-left:4px solid ${bc};">
        ${count > 0 ? `<div class="badge">Owned x${count}</div>` : ""}
        <h3>${entry.name}</h3>
        <p>${entry.desc}</p>
        <p>Cost: ${currentCost} credits</p>
        <button id="buyDrill" style="
          margin-top:8px; width:100%; padding:6px;
          background: ${
            afford ? "var(--accent-color)" : "var(--border-color)"
          };
          color: var(--console-text); border: none; border-radius:3px;
          cursor: ${afford ? "pointer" : "not-allowed"};">
          Buy
        </button>
      </div>
    `;
    document.getElementById("buyDrill").onclick = () => {
      if (!afford) return;
      shopState.drones[entry.id] = count + 1;
      saveShopState(shopState);
      window.droneModule.createDrillDrone();
      storageModule.addMaterial("cash", -currentCost);
      renderCurrency();
      renderDrones();
    };
  }

  function renderSell() {
    const wrap = document.getElementById("shopMain");
    wrap.innerHTML = `
      <div class="shop-card" style="border-left:4px solid var(--accent-color);">
        <label for="sellMat">Material: </label>
        <select id="sellMat" style="padding:4px; margin-right:8px;">
          <option value="scrap">Scrap</option>
          <option value="stone">Stone</option>
        </select>
        <span id="sellRate">Rate: 1 = 1 credit</span><br><br>
        <input type="number" id="sellAmt" min="1" value="1" style="padding:6px; width:80px;">
        <button id="sellBtn" style="margin-left:8px; padding:6px 12px; background:var(--accent-color); color:var(--console-text); border:none; border-radius:3px;">Sell</button>
        <button id="sellAllBtn" style="margin-left:4px; padding:6px 12px; background:var(--hover-color); color:var(--console-text); border:none; border-radius:3px;">Sell All</button>
      </div>
    `;
    const matSel = document.getElementById("sellMat");
    const rateDisplay = document.getElementById("sellRate");
    matSel.onchange = () => {
      rateDisplay.textContent =
        matSel.value === "stone"
          ? "Rate: 1 stone = 2 credits"
          : "Rate: 1 scrap = 1 credit";
    };
    document.getElementById("sellBtn").onclick = sellMat;
    document.getElementById("sellAllBtn").onclick = sellAllMat;
  }

  function sellMat() {
    const mat = document.getElementById("sellMat").value;
    const amt = parseInt(document.getElementById("sellAmt").value) || 0;
    const inv = storageModule.getStoredMaterials()[mat] || 0;
    if (amt < 1 || amt > inv) return;
    const rate = mat === "stone" ? 2 : 1;
    storageModule.addMaterial(mat, -amt);
    storageModule.addMaterial("cash", amt * rate);
    renderCurrency();
  }

  function sellAllMat() {
    const mat = document.getElementById("sellMat").value;
    const inv = storageModule.getStoredMaterials()[mat] || 0;
    if (inv > 0) {
      const rate = mat === "stone" ? 2 : 1;
      storageModule.addMaterial(mat, -inv);
      storageModule.addMaterial("cash", inv * rate);
      renderCurrency();
    }
  }

  function toggleHideCompleted() {
    hideCompleted = !hideCompleted;
    document.getElementById("toggleHideCompleted").textContent =
      "Hide Completed: " + (hideCompleted ? "ON" : "OFF");
    const activeTab = document.querySelector("#shopTabs .tab-btn.active").id;
    if (activeTab === "btnUpg") selectTab("Upg");
    else if (activeTab === "btnItm") selectTab("Itm");
  }

  function initShop() {
    document.querySelector(".content-panel").innerHTML = displayShop();
    renderCurrency();
    document.getElementById("btnUpg").onclick = () => selectTab("Upg");
    document.getElementById("btnItm").onclick = () => selectTab("Itm");
    document.getElementById("btnDrn").onclick = () => selectTab("Drn");
    document.getElementById("btnSell").onclick = () => selectTab("Sell");
    document.getElementById("toggleHideCompleted").onclick =
      toggleHideCompleted;
    selectTab("Upg");
  }

  function attachBuy(section) {
    document
      .querySelectorAll(`[data-buy^="${section}"]`)
      .forEach(btn => {
        btn.onclick = () => {
          const [, id] = btn.dataset.buy.split(":");
          const entry = catalog[section].find(x => x.id === id);
          let count = shopState[section][id] || 0;
          if (!meets(entry.requires)) return;
          if (entry.limit && count >= entry.limit) return;
          const cost = computeCost(entry.cost, entry.factor, count);
          if (!canAfford(cost)) return;
          storageModule.addMaterial("cash", -cost);
          shopState[section][id] = count + 1;
          saveShopState(shopState);
          renderCurrency();
          if (section === "upgrades") selectTab("Upg");
          else if (section === "items") selectTab("Itm");
        };
      });
  }

  window.shopModule = {
    displayShop,
    initShop,
    getState: () => loadShopState(),
    setState: state => {
      saveShopState(state || { upgrades: {}, items: {}, drones: {} });
      shopState = loadShopState();
    }
  };
})();

;(function () {
  /*************************************
   * Dome Module
   *************************************/
  function loadShopState() {
    try {
      var data = localStorage.getItem("shopState");
      return data ? JSON.parse(data) : { upgrades: {}, items: {}, drones: {} };
    } catch (e) {
      console.error("Error loading shop state:", e);
      return { upgrades: {}, items: {}, drones: {} };
    }
  }

  function formatWindSpeed(tier) {
    var raw = worldModule.getWindSpeed();
    var display;
    if (tier === 1) {
      display = Math.round(raw / 25) * 25;
    } else if (tier === 2) {
      display = Math.round(raw / 10) * 10;
    } else {
      display = raw.toFixed(1);
    }
    var kph = Math.round(display * 1.60934);
    return display + " mph / " + kph + " kph";
  }

  function formatWindDirection(tier) {
    var raw = worldModule.getWindDirection();
    if (tier === 1) {
      if (raw < 45 || raw >= 315) return "N";
      if (raw < 135) return "E";
      if (raw < 225) return "S";
      return "W";
    } else if (tier === 2) {
      var dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
      var index = Math.floor(((raw + 22.5) % 360) / 45);
      return dirs[index];
    } else {
      return raw.toFixed(1) + "°";
    }
  }

  function displayDome() {
    var style = `
      <style>
        .dome-tab-btn {
          background: var(--content-bg);
          color: var(--text-color);
          padding: 6px 12px;
          border: none;
          border-radius: 4px 4px 0 0;
          cursor: pointer;
          transition: background 0.2s;
        }
        .dome-tab-btn.active {
          background: var(--accent-color);
          color: #fff;
        }
        .dome-tab-btn:hover {
          background: var(--hover-color);
        }
        .dome-content {
          padding: 20px;
          color: var(--text-color);
        }
        .dome-card {
          background: var(--content-bg);
          border-left: 4px solid var(--accent-color);
          padding: 10px;
          margin-bottom: 10px;
          border-radius: 4px;
        }
      </style>
    `;

    var html = `
      ${style}
      <div id="domeRoot" class="dome-content">
        <div id="domeTabs" style="display:flex; gap:1rem; margin-bottom:1rem;">
          <button id="btnInside" class="dome-tab-btn active">Inside</button>
          <button id="btnOutside" class="dome-tab-btn">Outside</button>
        </div>
        <div id="domeMain"></div>
      </div>
    `;
    return html;
  }

  function renderInside() {
    var html = `
      <h2 style="color: var(--accent-color); margin-bottom:1rem;">Dome Overview</h2>
      <p>This is your dome’s internal environment and system overview. Add dome management info here.</p>
      <div id="domeSettings" style="margin-top:20px;">
         <h3>Dome Settings</h3>
         <p>Additional dome controls and information will appear here.</p>
      </div>
    `;
    document.getElementById("domeMain").innerHTML = html;
  }

  function renderOutside() {
    var shopState = loadShopState();
    var windLevel = shopState.upgrades.wind || 0;
    var html = `<h2 style="color: var(--accent-color); margin-bottom:1rem;">Outside Conditions</h2>`;
    if (windLevel < 1) {
      html += `<p style="color: var(--text-color);">No Wind Vein Upgrade installed.</p>`;
    } else {
      html += `
        <div class="dome-card">
          <h3>Wind Vein Tool</h3>
          <p>Level: ${windLevel} / 3</p>
          <p>Wind Speed: ${formatWindSpeed(windLevel)}</p>
          <p>Wind Direction: ${formatWindDirection(windLevel)}</p>
        </div>
      `;
    }
    document.getElementById("domeMain").innerHTML = html;
  }

  function initDomeTabs() {
    document
      .getElementById("btnInside")
      .addEventListener("click", function () {
        setActiveDomeTab("Inside");
        renderInside();
      });
    document
      .getElementById("btnOutside")
      .addEventListener("click", function () {
        setActiveDomeTab("Outside");
        renderOutside();
      });
  }

  function setActiveDomeTab(tabName) {
    var buttons = document.querySelectorAll(".dome-tab-btn");
    buttons.forEach(function (btn) {
      btn.classList.remove("active");
    });
    if (tabName === "Inside") {
      document.getElementById("btnInside").classList.add("active");
    } else if (tabName === "Outside") {
      document.getElementById("btnOutside").classList.add("active");
    }
  }

  function initDome() {
    var container = document.querySelector(".content-panel");
    container.innerHTML = displayDome();
    initDomeTabs();
    renderInside();
  }

  window.domeModule = { displayDome, initDome };
})();

;(function () {
  /********************************
   * Debug Module
   ********************************/
  function displayDebug() {
    return `
      <div id="debugContent" style="padding:20px;">
        <h2>Debug Tab</h2>
        <p>Enter command in the format: [item] [amount] (e.g., scrap 20)</p>
        <input type="text" id="debugCommand" placeholder="e.g., scrap 20" style="width:50%; padding:8px;">
        <button id="submitDebugCommand" style="padding:8px 12px;">Submit</button>
        <div id="debugLog" style="margin-top:20px; background:#eee; padding:10px; height:150px; overflow-y:auto;"></div>
        <p>Or type directly: <code>function addMaterial('cash'|'scrap'|'stone', amount)</code></p>
      </div>
    `;
  }

  function initDebug() {
    const btn = document.getElementById("submitDebugCommand");
    if (btn) {
      btn.addEventListener("click", () => {
        const command = document
          .getElementById("debugCommand")
          ?.value.trim();
        if (command) {
          processDebugCommand(command);
        } else {
          logDebug("Please enter a command.");
        }
      });
    }
  }

  function processDebugCommand(command) {
    const parts = command.split(" ");
    if (parts.length < 2) {
      logDebug("Invalid command format. Use: [item] [amount].");
      return;
    }
    const item = parts[0].toLowerCase();
    const amount = Number(parts[1]);
    if (!Number.isFinite(amount)) {
      logDebug("Amount must be a number.");
      return;
    }
    if (!["cash", "scrap", "stone"].includes(item)) {
      logDebug("Invalid item. Allowed: cash, scrap, stone.");
      return;
    }
    storageModule.addMaterial(item, amount);
    logDebug(`Added ${amount} of ${item}.`);
  }

  function logDebug(msg) {
    const debugLog = document.getElementById("debugLog");
    if (debugLog) {
      const p = document.createElement("p");
      p.textContent = msg;
      debugLog.appendChild(p);
      debugLog.scrollTop = debugLog.scrollHeight;
    }
  }

  window.debugModule = {
    displayDebug,
    initDebug
  };
})();

;(function () {
  /********************************
   * Settings Module + Save System
   ********************************/
  function clearLocalSave() {
    if (
      confirm(
        "Are you sure you want to clear all local save data? This action cannot be undone."
      )
    ) {
      localStorage.clear();
      localStorage.setItem("dronesData", JSON.stringify([]));
      localStorage.setItem("storageMaterials", JSON.stringify({ cash: 0, scrap: 0, stone: 0 }));
      localStorage.setItem("shopState", JSON.stringify({ upgrades: {}, items: {}, drones: {} }));
      localStorage.removeItem("jeffKeyShown");
      console.log("Local save data has been cleared and reinitialized.");
    }
  }

  // Unified HumbleFarmers save key
  const HF_SAVE_KEY = "HumbleFarmers_Save";

  function saveGame() {
    const storage = storageModule.getStoredMaterials();
    const drones = droneModule.getDrones();
    const shop = shopModule.getState();
    const flags = {
      jeffKeyShown: !!localStorage.getItem("jeffKeyShown")
    };

    const saveObj = {
      version: 1,
      storage,
      drones,
      shop,
      flags
    };

    localStorage.setItem(HF_SAVE_KEY, JSON.stringify(saveObj));
    console.log("Game saved to HumbleFarmers_Save.");
  }

  function loadGame() {
    const raw = localStorage.getItem(HF_SAVE_KEY);
    if (!raw) {
      alert("No HumbleFarmers save found.");
      return false;
    }
    try {
      const saveObj = JSON.parse(raw);

      // Restore storage
      storageModule.saveStoredMaterials(saveObj.storage || { cash: 0, scrap: 0, stone: 0 });

      // Restore drones
      droneModule.saveDrones(saveObj.drones || []);
      droneModule.displayDrones();

      // Restore shop
      shopModule.setState(saveObj.shop || { upgrades: {}, items: {}, drones: {} });

      // Restore flags
      if (saveObj.flags && saveObj.flags.jeffKeyShown) {
        localStorage.setItem("jeffKeyShown", "true");
      } else {
        localStorage.removeItem("jeffKeyShown");
      }

      console.log("HumbleFarmers save loaded.");
      alert("Save loaded successfully.");
      return true;
    } catch (e) {
      console.error("Failed to load HumbleFarmers save:", e);
      alert("Error loading save file.");
      return false;
    }
  }

  function exportSave() {
    const raw = localStorage.getItem(HF_SAVE_KEY);
    if (!raw) {
      alert("No HumbleFarmers save found to export.");
      return;
    }
    const blob = new Blob([raw], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "HumbleFarmers_Save.txt";
    a.click();
    window.URL.revokeObjectURL(url);
  }

  function importSave() {
    const input = document.createElement("input");
    input.type = "file";
    input.onchange = e => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = readerEvent => {
        try {
          const content = JSON.parse(readerEvent.target.result);
          localStorage.setItem(HF_SAVE_KEY, JSON.stringify(content));
          loadGame();
          alert("Save file imported successfully!");
        } catch (err) {
          alert("Error: Invalid save file format.");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  function deleteSave() {
    if (
      !confirm(
        "Are you sure you want to delete HumbleFarmers save data? This cannot be undone."
      )
    )
      return;
    localStorage.removeItem(HF_SAVE_KEY);
    alert("HumbleFarmers save deleted. Reloading...");
    location.reload();
  }

  function displaySettings() {
    return `
      <div id="settingsContent" style="padding:20px;">
        <h2>Settings</h2>
        <p>Manage your save and load options below.</p>
        <button id="clearSaveButton" style="padding:10px; font-size:16px;">Clear Local Save Data</button>

        <hr style="margin:20px 0;">

        <h3>Save Management</h3>
        <button id="hfSaveBtn" style="padding:10px; font-size:16px;">Save Game</button>
        <button id="hfLoadBtn" style="padding:10px; font-size:16px;">Load Game</button>
        <button id="hfExportBtn" style="padding:10px; font-size:16px;">Export Save File</button>
        <button id="hfImportBtn" style="padding:10px; font-size:16px;">Import Save File</button>
        <button id="hfDeleteBtn" style="padding:10px; font-size:16px; background:red; color:white;">Delete Save</button>
      </div>
    `;
  }

  window.settingsModule = {
    clearLocalSave,
    displaySettings,
    saveGame,
    loadGame,
    exportSave,
    importSave,
    deleteSave
  };
})();

document.addEventListener("DOMContentLoaded", function () {
  const clearBtn = document.getElementById("clearSaveButton");
  if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      settingsModule.clearLocalSave();
      console.log("Local save data cleared.");
    });
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const commandInput = document.getElementById("consoleCommand");
  const submitButton = document.getElementById("submitCommand");
  const consoleLog = document.getElementById("consoleLog");

  const startupContent =
    "<p>Welcome to HFAA Generic Console Version 1.0.0! Type /? for help.</p>" +
    "<div style='margin-top:20px;'>" +
    "<label for='upgradeKeyInput'>Enter product upgrade key:</label> " +
    "<input type='text' id='upgradeKeyInput' maxlength='7' placeholder='7-digit key' style='margin-left:8px;'>" +
    "<button id='submitUpgradeKey' style='margin-left:8px;'>Enter</button>" +
    "</div>";

  let currentTab = "startup";

  function logMessage(message) {
    const p = document.createElement("p");
    p.textContent = "> " + message;
    consoleLog.appendChild(p);
    consoleLog.scrollTop = consoleLog.scrollHeight;
  }

  function checkJeffUpgradeKey() {
    try {
      const state = JSON.parse(
        localStorage.getItem("shopState") ||
          '{"upgrades":{}, "items":{}, "drones":{}}'
      );
      const jeffCount =
        state.items && state.items.jeffchip ? state.items.jeffchip : 0;
      if (jeffCount >= 10) {
        if (!localStorage.getItem("jeffKeyShown")) {
          logMessage(
            "Jeff found an odd scrap of paper that reads: 6122025"
          );
          localStorage.setItem("jeffKeyShown", "true");
        } else {
          logMessage(
            "Jeff shows you the paper again, he seems to like it..."
          );
        }
        logMessage("Product upgrade key: 6122025");
      }
    } catch (e) {
      console.error("Error checking jeff upgrade key", e);
    }
  }

  function showStartupTab() {
    document.querySelector(".content-panel").innerHTML = startupContent;
    currentTab = "startup";
    logMessage("Returned to startup content.");
    const keyBtn = document.getElementById("submitUpgradeKey");
    if (keyBtn) {
      keyBtn.addEventListener("click", function () {
        const key = document
          .getElementById("upgradeKeyInput")
          .value.trim();
        if (key.length !== 7) {
          logMessage("Upgrade key must be exactly 7 digits.");
        } else if (key === "6122025") {
          logMessage("WELCOME VIP USER");
          logMessage("Initializing data wipe...");
        } else {
          logMessage("Upgrade key incorrect.");
        }
      });
    }
  }

  function showHelpTab() {
    const helpHtml = `
      <p><strong>Help Menu</strong><br>
         /? – Display help<br>
         /quit – Go to startup<br>
         /drone – Drone Center<br>
         /shop – Shop<br>
         /storage – Storage<br>
         /settings – Settings<br>
         /debug – Debug<br>
         /dome – Dome<br>
         /reload – Reload current tab
      </p>
    `;
    document.querySelector(".content-panel").innerHTML = helpHtml;
    currentTab = "help";
    logMessage("Help menu displayed.");
  }

  function showDroneTab() {
    document.querySelector(".content-panel").innerHTML = `
      <div id="droneContainer" style="padding:20px;"></div>
      <p>Drone tab active. Drone commands are now handled via the UI.</p>
    `;
    currentTab = "drone";
    logMessage("Drone tab activated.");
    if (window.droneModule && typeof droneModule.displayDrones === "function") {
      droneModule.displayDrones();
    }
  }

  function showShopTab() {
    document.querySelector(".content-panel").innerHTML =
      shopModule.displayShop();
    currentTab = "shop";
    logMessage("Shop tab activated.");
    if (window.shopModule && typeof shopModule.initShop === "function") {
      shopModule.initShop();
    }
  }

  function showStorageTab() {
    document.querySelector(".content-panel").innerHTML = `
      <div id="storageDisplay" style="padding:20px;">
         ${storageModule.displayStorage()}
      </div>
      <p>Storage tab active.</p>
    `;
    currentTab = "storage";
    logMessage("Storage tab activated.");
    if (
      window.storageModule &&
      typeof storageModule.initStorage === "function"
    ) {
      storageModule.initStorage();
    }
  }

  function showSettingsTab() {
    document.querySelector(".content-panel").innerHTML =
      settingsModule.displaySettings();
    currentTab = "settings";
    logMessage("Settings tab activated.");
    const btn = document.getElementById("clearSaveButton");
    if (btn) btn.addEventListener("click", settingsModule.clearLocalSave);

    const saveBtn = document.getElementById("hfSaveBtn");
    const loadBtn = document.getElementById("hfLoadBtn");
    const exportBtn = document.getElementById("hfExportBtn");
    const importBtn = document.getElementById("hfImportBtn");
    const deleteBtn = document.getElementById("hfDeleteBtn");

    if (saveBtn) saveBtn.onclick = settingsModule.saveGame;
    if (loadBtn) loadBtn.onclick = settingsModule.loadGame;
    if (exportBtn) exportBtn.onclick = settingsModule.exportSave;
    if (importBtn) importBtn.onclick = settingsModule.importSave;
    if (deleteBtn) deleteBtn.onclick = settingsModule.deleteSave;
  }

  function showDebugTab() {
    document.querySelector(".content-panel").innerHTML =
      debugModule.displayDebug();
    currentTab = "debug";
    logMessage("Debug tab activated.");
    if (window.debugModule && typeof debugModule.initDebug === "function") {
      debugModule.initDebug();
    }
  }

  function showDomeTab() {
    document.querySelector(".content-panel").innerHTML =
      domeModule.displayDome();
    currentTab = "dome";
    logMessage("Dome tab activated.");
    if (window.domeModule && typeof domeModule.initDome === "function") {
      domeModule.initDome();
    }
  }

  function reloadTab() {
    switch (currentTab) {
      case "drone":
        if (
          window.droneModule &&
          typeof droneModule.displayDrones === "function"
        ) {
          droneModule.displayDrones();
          logMessage("Drone tab reloaded.");
        }
        break;
      case "shop":
        showShopTab();
        break;
      case "storage":
        showStorageTab();
        break;
      case "settings":
        showSettingsTab();
        break;
      case "debug":
        showDebugTab();
        break;
      case "dome":
        showDomeTab();
        break;
      default:
        logMessage("Nothing to reload on this tab.");
    }
  }

  function processCommand(cmd) {
    switch (cmd) {
      case "/?":
        return showHelpTab();
      case "/quit":
        return showStartupTab();
      case "/drone":
        return showDroneTab();
      case "/shop":
        return showShopTab();
      case "/storage":
        return showStorageTab();
      case "/settings":
        return showSettingsTab();
      case "/debug":
        return showDebugTab();
      case "/dome":
        return showDomeTab();
      case "/reload":
        return reloadTab();
      default:
        logMessage("Command not recognized.");
    }
  }

  function submit() {
    const cmd = commandInput.value.trim();
    if (!cmd) return;
    logMessage(cmd);
    commandInput.value = "";
    processCommand(cmd);
    setTimeout(checkJeffUpgradeKey, 100);
  }

  submitButton.addEventListener("click", submit);
  commandInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") submit();
  });

  showStartupTab();
  logMessage("Console online.");
});
