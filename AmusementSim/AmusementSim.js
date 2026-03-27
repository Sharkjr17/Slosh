// ==========================================
// ======= WIN95 PARK TYCOON ENGINE =========
// ==========================================

let saveFile = {
    money: 50000,
    reputation: 10.0,
    currentDate: { month: 1, year: 1995 }, // Changed from 3 to 1
    totalLandAvailable: 10, // Added land cap variable
    rides: {},
    history: {
        months: [],
        years: [],
    }
};

let statsViewOffset = 0; 
let currentMenu = 'root'; 


// ==========================================
// ======= GAME DATA SET  ===================
// ==========================================
const gameData = {
    // 1. ROLLER COASTER MODELS
    model: {
        "classic wooden": { yearDeveloped: 1884, lifeSpan: 40, payroll: 2, baseCapacity: 1200 },
        "side friction coaster": { yearDeveloped: 1900, lifeSpan: 15, payroll: 2, baseCapacity: 800 },
        "wild mouse": { yearDeveloped: 1930, lifeSpan: 25, payroll: 2, baseCapacity: 600 },
        "kiddie coaster": { yearDeveloped: 1950, lifeSpan: 20, payroll: 2, baseCapacity: 400 },
        "junior coaster": { yearDeveloped: 1965, lifeSpan: 25, payroll: 2, baseCapacity: 800 },
        "mine train": { yearDeveloped: 1966, lifeSpan: 30, payroll: 3, baseCapacity: 1600 },
        "powered coaster": { yearDeveloped: 1967, lifeSpan: 25, payroll: 2, baseCapacity: 1000 },
        "terrain coaster": { yearDeveloped: 1967, lifeSpan: 35, payroll: 3, baseCapacity: 1400 },
        "looping coaster": { yearDeveloped: 1975, lifeSpan: 30, payroll: 4, baseCapacity: 1400 },
        "corkscrew coaster": { yearDeveloped: 1976, lifeSpan: 30, payroll: 4, baseCapacity: 1200 },
        "alpine coaster": { yearDeveloped: 1976, lifeSpan: 25, payroll: 2, baseCapacity: 500 },
        "retro suspended": { yearDeveloped: 1981, lifeSpan: 25, payroll: 4, baseCapacity: 1200 },
        "family coaster": { yearDeveloped: 1980, lifeSpan: 30, payroll: 2, baseCapacity: 1000 },
        "boomerang shuttle": { yearDeveloped: 1984, lifeSpan: 25, payroll: 3, baseCapacity: 600 },
        "stand-up coaster": { yearDeveloped: 1984, lifeSpan: 25, payroll: 4, baseCapacity: 1400 },
        "bobsled coaster": { yearDeveloped: 1984, lifeSpan: 25, payroll: 3, baseCapacity: 1000 },
        "hyper coaster": { yearDeveloped: 1989, lifeSpan: 35, payroll: 5, baseCapacity: 2000 },
        "inverted coaster": { yearDeveloped: 1992, lifeSpan: 30, payroll: 4, baseCapacity: 1800 },
        "modern suspended": { yearDeveloped: 1994, lifeSpan: 25, payroll: 4, baseCapacity: 1400 },
        "lim launch coaster": { yearDeveloped: 1996, lifeSpan: 25, payroll: 4, baseCapacity: 1600 },
        "dive coaster": { yearDeveloped: 1998, lifeSpan: 30, payroll: 4, baseCapacity: 1800 },
        "floorless coaster": { yearDeveloped: 1999, lifeSpan: 30, payroll: 4, baseCapacity: 1800 },
        "giga coaster": { yearDeveloped: 2000, lifeSpan: 35, payroll: 6, baseCapacity: 2400 },
        "spinning coaster": { yearDeveloped: 2000, lifeSpan: 25, payroll: 3, baseCapacity: 1200 },
        "impulse inverted": { yearDeveloped: 2000, lifeSpan: 25, payroll: 3, baseCapacity: 800 },
        "flying coaster": { yearDeveloped: 2002, lifeSpan: 30, payroll: 5, baseCapacity: 1600 },
        "strata coaster": { yearDeveloped: 2003, lifeSpan: 30, payroll: 6, baseCapacity: 2400 },
        "catapult hydraulic": { yearDeveloped: 2003, lifeSpan: 25, payroll: 4, baseCapacity: 1400 },
        "motorbike coaster": { yearDeveloped: 2004, lifeSpan: 25, payroll: 4, baseCapacity: 1000 },
        "lsm multi-launch": { yearDeveloped: 2008, lifeSpan: 30, payroll: 4, baseCapacity: 1800 },
        "hybrid wood-steel": { yearDeveloped: 2011, lifeSpan: 35, payroll: 4, baseCapacity: 2000 },
        "wing coaster": { yearDeveloped: 2011, lifeSpan: 30, payroll: 5, baseCapacity: 1800 },
        "single-rail coaster": { yearDeveloped: 2018, lifeSpan: 30, payroll: 4, baseCapacity: 1600 }
    },

    // 2. FLAT RIDE MODELS (Placeholder stats)
    flatRides: {
        "carousel": { yearDeveloped: 1880, lifeSpan: 50, payroll: 1, baseCapacity: 500 },
        "scrambler": { yearDeveloped: 1950, lifeSpan: 25, payroll: 1, baseCapacity: 600 },
        "top spin": { yearDeveloped: 1990, lifeSpan: 20, payroll: 2, baseCapacity: 800 }
    },

    // 3. MANUFACTURERS
    manufacture: {
        "RCCA": { qMult: 0.6 },
        "Bow": { qMult: 0.8 },
        "Ziekenhuis": { qMult: 1.0 },
        "M&S": { qMult: 1.2 },
        "GPC": { qMult: 1.4 },
        "Kleinstuber": { qMult: 1.6 }
    },

    // 4. GUEST ARCHETYPES (Ported from your Python logic)
    "guest": {
        "children": {
            "weight": 15,
            "intensityPreference": [0.0, 0.5],
            "ageTolerance": 999, // Infinite: They don't care about "vintage" or "new"
            "priceTolerance": 8.00
        },
        "teenager": {
            "weight": 30,
            "intensityPreference": [3.0, 9.0],
            "ageTolerance": 12, // 1 Year: They want the latest TikTok-worthy thrill
            "priceTolerance": 15.00
        },
        "young adults": {
            "weight": 20,
            "intensityPreference": [2.0, 10.0],
            "ageTolerance": 36, // 3 Years: Moderate interest in novelty
            "priceTolerance": 25.00
        },
        "parents": {
            "weight": 30,
            "intensityPreference": [0.0, 4.0],
            "ageTolerance": 120, // 10 Years: High tolerance for established rides
            "priceTolerance": 30.00
        },
        "old": {
            "weight": 5,
            "intensityPreference": [0.0, 0.5],
            "ageTolerance": 240, // 20 Years: Actively prefer "Classics" (Nostalgia)
            "priceTolerance": 40.00
        }
    },


    // 5. SEASONAL DATA
    monthData: {
        "Jan": { guestBonus: 0.8 }, "Feb": { guestBonus: 0.8 }, "Mar": { guestBonus: 0.9 },
        "Apr": { guestBonus: 1.1 }, "May": { guestBonus: 1.2 }, "Jun": { guestBonus: 1.5 },
        "Jul": { guestBonus: 1.5 }, "Aug": { guestBonus: 1.4 }, "Sep": { guestBonus: 1.1 },
        "Oct": { guestBonus: 1.0 }, "Nov": { guestBonus: 0.9 }, "Dec": { guestBonus: 0.8 }
    }
};


// ==========================================
// ======= NAVIGATION & SIDEBAR =============
// ==========================================

function renderTabButtons() {
    const container = document.getElementById('tab-buttons');
    if (!container) return;
    container.innerHTML = ''; 

    if (currentMenu === 'root') {
        const menuItems = [
            { label: 'Park Office', id: 'park' },
            { label: 'Contracts', id: 'contracts' },
            { separator: true },
            { label: 'Attractions', id: 'rides' },
            { label: 'Food Stalls', id: 'food' },
            { label: 'Staffing', id: 'staff' },
            { label: 'Equipment', id: 'equipment' },
            { separator: true },
            { label: 'Settings', id: 'settings' }
        ];

        menuItems.forEach(item => {
            if (item.separator) {
                container.innerHTML += `<div class="separator"></div>`;
            } else {
                container.innerHTML += `<button class="win95-btn" onclick="openSubMenu('${item.id}')">${item.label}</button>`;
            }
        });

        container.innerHTML += `<div class="separator"></div>`;
        container.innerHTML += `<button class="win95-btn primary" onclick="runEndOfMonth()">END MONTH</button>`;

    } else {
        container.innerHTML += `<button class="win95-btn back-btn" onclick="goBack()">&larr; BACK</button>`;
        container.innerHTML += `<div class="separator"></div>`;

        // --- SUB-MENU DEFINITIONS ---
        const subMenus = {
            park: [
                { label: 'Advertising', action: "showPlaceholder('Advertising Office', 'Launch radio, TV, or billboard campaigns to boost visitor numbers.')" },
                { label: 'Reputation', action: "showPlaceholder('Park Reputation', 'View what guests think about your safety, pricing, and cleanliness.')" },
                { label: 'Manage Park', action: "showPlaceholder('General Management', 'Set park entry fees and opening hours.')" }
            ],
            rides: [
                { label: 'Build New Ride', action: 'openBuildMenu()' },
                { label: 'Manage Rides', action: 'openRidesList()' },
                { label: 'Ride Demographics', action: "showPlaceholder('Ride Stats', 'See which age groups prefer which attractions.')" }
            ],
            food: [
                { label: 'Build Food Stall', action: "showPlaceholder('Stall Construction', 'Select from Burger Bars, Soda Fountains, or Fries Stands.')" },
                { label: 'Manage Stalls', action: "showPlaceholder('Inventory & Pricing', 'Adjust the price of salt on fries to increase drink sales.')" },
                { label: 'Food Demographics', action: "showPlaceholder('Hunger Statistics', 'Track guest hunger levels and most popular snacks.')" }
            ],
            settings: [
                { label: 'Save Management', action: "openSubMenu('save_management')" },
                { label: 'Color Schemes', action: "showPlaceholder('Desktop Themes', 'Switch between Classic, Rose, and High Contrast modes.')" },
                { label: 'GitHub', action: 'window.open("https://github.com")' }
            ],
            save_management: [
                { label: 'Quick Save (Local)', action: "saveToLocal()" },
                { label: 'Export to File', action: "exportSave()" },
                { label: 'Import from File', action: "importSave()" },
                { label: 'Delete Save Data', action: "confirmDelete()" }
            ],
            contracts: [
                { label: 'All Contracts', action: "showPlaceholder('Legal Ledger', 'View active goals from the city council and investors.')" },
                { label: 'Hide Completed', action: "showPlaceholder('Filter Applied', 'Completed contracts are now hidden from view.')" }
            ],
            staff: [
                { label: 'Hire Staff', action: "showPlaceholder('HR Department', 'Recruit Janitors, Mechanics, and Entertainers.')" },
                { label: 'Manage Staff', action: "showPlaceholder('Staff Roster', 'Set patrol zones and adjust monthly wages.')" }
            ],
            equipment: [
                { label: 'All Equipment', action: "showPlaceholder('Tool Shed', 'View purchased lawnmowers, toolkits, and trash cans.')" },
                { label: 'Hide Bought', action: "showPlaceholder('Filter Applied', 'Already owned equipment is hidden.')" }
            ]
        };

        


        const currentItems = subMenus[currentMenu] || [];
        currentItems.forEach(item => {
            container.innerHTML += `<button class="win95-btn" onclick="${item.action}">${item.label}</button>`;
        });
    }
}

// --- PLACEHOLDER RENDERER ---
function showPlaceholder(title, description) {
    const main = document.getElementById('main-content');
    main.innerHTML = `
        <div class="win95-dialog">
            <h3 class="panel-title">${title}</h3>
            <div style="padding: 20px; text-align: center; border: 2px inset var(--gray-1); background: #eee;">
                <p><strong>[FEATURE UNDER DEVELOPMENT]</strong></p>
                <p style="margin-top: 10px; font-size: 12px;">${description}</p>
                <hr style="margin: 15px 0;">
                <p style="font-size: 10px; color: gray;">Win95 System Error: Module not found. Please check back after next update.</p>
            </div>
        </div>
    `;
}

function openSubMenu(menuId) {
    currentMenu = menuId;
    renderTabButtons();
}

function goBack() {
    currentMenu = 'root';
    renderTabButtons();
    renderDashboard();
}

// ==========================================
// ======= DASHBOARD & STATISTICS ===========
// ==========================================

function renderDashboard() {
    const main = document.getElementById('main-content');
    const history = saveFile.history.months;
    
    if (history.length === 0) {
        main.innerHTML = `<div class="win95-dialog"><h3 class="panel-title">System Idle</h3><p>No data. End a month to generate a report.</p></div>`;
        return;
    }

    const data = history[statsViewOffset].ledger;
    const date = history[statsViewOffset].date;

    main.innerHTML = `
        <div class="win95-dialog">
            <div class="stats-header">
                <button class="win95-btn" onclick="changeStatsView(1)">&larr;</button>
                <span>FINANCIAL STATEMENT: ${date}</span>
                <button class="win95-btn" onclick="changeStatsView(-1)">&rarr;</button>
            </div>

            <!-- POPULATION SECTION -->
            <div class="panel-title">POPULATION STATISTICS</div>
            <div class="stats-grid" style="margin-bottom:10px;">
                <div class="stat-card"><label>TOTAL RIDERS</label><div class="stat-val">${data.population.total.toLocaleString()}</div></div>
                <div class="stat-card">
                    <label>DEMOGRAPHICS</label>
                    <div style="font-size:11px;">
                        Teens: ${data.population.teens} (${((data.population.teens/data.population.total)*100).toFixed(0)}%)<br>
                        Parents: ${data.population.parents} (${((data.population.parents/data.population.total)*100).toFixed(0)}%)
                    </div>
                </div>
            </div>

            <!-- TIME SECTION -->
            <div class="panel-title">TIME ALLOCATION (PER CAPITA)</div>
            <div class="stats-grid" style="margin-bottom:10px;">
                <div class="stat-card"><label>IN RIDES</label><div class="stat-val">${(data.time.totalInRides / data.population.total).toFixed(1)}m</div></div>
                <div class="stat-card"><label>IN STALLS</label><div class="stat-val">${(data.time.totalInStalls / data.population.total).toFixed(1)}m</div></div>
                <div class="stat-card"><label>WASTED</label><div class="stat-val" style="color:red;">${(data.time.totalWasted / data.population.total).toFixed(1)}m</div></div>
            </div>

            <!-- REVENUE SECTION -->
            <div class="panel-title">BALANCE SHEET</div>
            <div class="stat-card" style="font-family:'Courier New', monospace; font-size:12px;">
                GROSS REVENUE: <span style="float:right;">$${data.revenue.gross.toLocaleString()}</span><br>
                <span style="color:red;">- STAFF PAYROLL: <span style="float:right;">($${data.revenue.staff})</span></span><br>
                <span style="color:red;">- MAYOR CONTRACTS: <span style="float:right;">($${data.revenue.contracts.toFixed(0)})</span></span><br>
                <span style="color:red;">- FOOD SUPPLY: <span style="float:right;">($${data.revenue.foodSupply})</span></span><br>
                <span style="color:red;">- LEGAL/LAWSUITS: <span style="float:right;">($${data.revenue.lawsuits})</span></span>
                <hr>
                <strong>NET MONTHLY PROFIT: <span style="float:right;">$${data.revenue.net.toLocaleString()}</span></strong>
            </div>
        </div>`;
}


function changeStatsView(dir) {
    statsViewOffset += dir;
    renderDashboard();
}

// ==========================================
// ======= BUILD SYSTEM (CUBIC) =============
// ==========================================

function openBuildMenu() {
    const main = document.getElementById('main-content');
    main.innerHTML = `
        <div class="win95-dialog">
            <h3 class="panel-title">New Attraction Wizard</h3>
            <div class="input-group">
                Category: <select id="type-select" class="win95-input" onchange="updateModelDropdown()">
                    <option value="">-- Choose --</option>
                    <option value="coaster">Coaster</option>
                    <option value="flat">Flat Ride</option>
                </select>
            </div>
            <div class="input-group">
                Model: <select id="model-select" class="win95-input" disabled onchange="enableInputs()">
                    <option value="">-- Select Category First --</option>
                </select>
            </div>
            <hr>
            <div id="build-inputs" style="opacity: 0.4; pointer-events: none;">
                <div class="input-group">
                    LAND POINTS: <input type="number" id="in-land" value="10" min="1" max="100" class="win95-input">
                    <div class="sub-label">Limits max stats to <span id="land-display">10</span></div>
                </div>
                <div class="input-group">
                    EXCITEMENT $: <input type="number" id="in-excitement" value="5000" class="win95-input">
                    <div class="sub-label">Yield: <span id="yield-e" class="v-point">10.00</span> points</div>
                </div>
                <div class="input-group">
                    INTENSITY $: <input type="number" id="in-intensity" value="5000" class="win95-input">
                    <div class="sub-label">Yield: <span id="yield-i" class="v-point">10.00</span> points</div>
                </div>
                <div class="input-group">
                    THEMING $: <input type="number" id="in-theme" value="5000" class="win95-input">
                    <div class="sub-label">Yield: <span id="yield-t" class="v-point">10.00</span> points</div>
                </div>
            </div>
            <div id="total-cost-display" style="font-weight:bold; margin: 10px 0;">Total: $15,000</div>
            <button class="win95-btn primary" id="btn-build" disabled onclick="finalizeBuild()">START CONSTRUCTION</button>
        </div>`;

    ['in-land', 'in-excitement', 'in-intensity', 'in-theme'].forEach(id => {
        document.getElementById(id).addEventListener('input', calculateBuildStats);
    });
}

function moneyToDecimalPoints(budget) {
    if (budget <= 0) return 0;
    let points = 0, total = 0;
    while (points < 100) {
        let cost = 1.5 * Math.pow(points + 1, 2);
        if (total + cost > budget) break;
        total += cost; points++;
    }
    if (points < 100) points += (budget - total) / (1.5 * Math.pow(points + 1, 2));
    return points;
}

function calculateBuildStats() {
    const lField = document.getElementById('in-land');
    lField.value = Math.floor(lField.value);
    const land = parseInt(lField.value) || 1;
    document.getElementById('land-display').innerText = land;

    const e$ = parseFloat(document.getElementById('in-excitement').value) || 0;
    const i$ = parseFloat(document.getElementById('in-intensity').value) || 0;
    const t$ = parseFloat(document.getElementById('in-theme').value) || 0;

    const pE = Math.min(moneyToDecimalPoints(e$), land);
    const pI = Math.min(moneyToDecimalPoints(i$), land);
    const pT = Math.min(moneyToDecimalPoints(t$), land);

    document.getElementById('yield-e').innerText = pE.toFixed(2);
    document.getElementById('yield-i').innerText = pI.toFixed(2);
    document.getElementById('yield-t').innerText = pT.toFixed(2);
    document.getElementById('total-cost-display').innerText = `Total: $${(e$+i$+t$).toLocaleString()}`;
}

function finalizeBuild() {
    const e$ = parseFloat(document.getElementById('in-excitement').value);
    const i$ = parseFloat(document.getElementById('in-intensity').value);
    const t$ = parseFloat(document.getElementById('in-theme').value);
    const cost = e$ + i$ + t$;

    if (saveFile.money >= cost) {
        saveFile.money -= cost;
        const id = `R_${Date.now()}`;
        saveFile.rides[id] = {
            model: document.getElementById('model-select').value,
            e: parseFloat(document.getElementById('yield-e').innerText),
            i: parseFloat(document.getElementById('yield-i').innerText),
            t: parseFloat(document.getElementById('yield-t').innerText)
        };
        updateInfoPanel();
        goBack();
    } else { alert("Insufficient Funds!"); }
}

// ==========================================
// ======= TIME & SIMULATION LOGIC ==========
// ==========================================

function runEndOfMonth() {
    if (isProcessing) return;
    
    // 1. Lock the UI
    toggleInputLock(true);
    const main = document.getElementById('main-content');
    main.innerHTML = `
        <div class="win95-dialog" style="text-align:center; padding:40px;">
            <h3 class="panel-title">System Status</h3>
            <p><strong>CALCULATING MONTHLY RESULTS...</strong></p>
            <div style="margin:20px auto; width:80%; height:20px; border:2px inset white; background:#808080;">
                <div id="progress-bar" style="width:0%; height:100%; background:var(--dull-teal);"></div>
            </div>
            <p style="font-size:10px;">Simulating Guest Archetypes & Ride Physics</p>
        </div>
    `;


    setTimeout(() => {
        // 1. Setup Monthly Ledger (The "Brain" for the report)
        let ledger = {
            population: { total: 0, children: 0, teens: 0, youngAdults: 0, parents: 0, seniors: 0 },
            time: { totalInRides: 0, totalInStalls: 0, totalWasted: 0 },
            revenue: { gross: 0, contracts: 0, lawsuits: 0, staff: 0, foodSupply: 0, net: 0 }
        };

        // 2. Population & Demographic Simulation
        // 1 guest = 1000 people. Let's simulate 5 "units" (5000 people) for now
        const guestUnits = Math.floor(saveFile.reputation * 0.5) + 2; 
        ledger.population.total = guestUnits * 1000;

        // Simple distribution for now (will be refined by your guest weight logic later)
        ledger.population.teens = Math.floor(ledger.population.total * 0.3);
        ledger.population.parents = Math.floor(ledger.population.total * 0.4);
        ledger.population.children = ledger.population.total - (ledger.population.teens + ledger.population.parents);

        // 3. Time Calculations (Minutes)
        ledger.time.totalInRides = guestUnits * 120; // Placeholder: 2 hours per unit
        ledger.time.totalInStalls = guestUnits * 30;
        ledger.time.totalWasted = guestUnits * 60; // Walking/Waiting

        // 4. Financials
        ledger.revenue.gross = (ledger.population.total * 0.015) * 12; // Example math
        ledger.revenue.staff = Object.keys(saveFile.rides).length * 500; // $500 per ride payroll
        ledger.revenue.contracts = ledger.revenue.gross * 0.10; // 10% Mayor Tax
        ledger.revenue.foodSupply = ledger.population.total * 0.05;
        ledger.revenue.lawsuits = saveFile.reputation < 5 ? 1000 : 0; // Penalty for low rep
        
        ledger.revenue.net = ledger.revenue.gross - (ledger.revenue.staff + ledger.revenue.contracts + ledger.revenue.foodSupply + ledger.revenue.lawsuits);
        
        saveFile.money += ledger.revenue.net;

        // 5. Update History with Full Ledger
        saveFile.history.months.unshift({
            date: `${saveFile.currentDate.month}/${saveFile.currentDate.year}`,
            ledger: ledger
        });


        // 2. Increment Dates (12-month rollover)
        saveFile.currentDate.month++;
        if (saveFile.currentDate.month > 12) {
            saveFile.currentDate.month = 1;
            saveFile.currentDate.year++;
        }

        // 3. Process Ride Aging (Actual and Functional)
        for (let id in saveFile.rides) {
            let ride = saveFile.rides[id];
            ride.actualAge += 1;
            ride.functionalAge += 1;
        }

        // 4. Update History
            saveFile.history.months.unshift({
                date: `${saveFile.currentDate.month}/${saveFile.currentDate.year}`,
                visitors: visitors,
                revenue: revenue,
                spendingPerHead: 12.0,
                demographics: { teens: 0.5, adults: 0.5 }
            });

        // 5. Condensation System (Triggers at month 19)
        if (saveFile.history.months.length > 18) {
            // Extract the oldest 12 months to condense them into 1 year
            const lastYear = saveFile.history.months.splice(-12);
            
            const summary = lastYear.reduce((acc, mo) => {
                acc.totalVisitors += mo.visitors;
                acc.totalRevenue += mo.revenue;
                acc.avgSpend += mo.spendingPerHead;
                return acc;
            }, { totalVisitors: 0, totalRevenue: 0, avgSpend: 0 });

            saveFile.history.years.unshift({
                year: lastYear[0].date.split('/')[1], // Grabs the year string
                avgVisitors: Math.floor(summary.totalVisitors / 12),
                totalRevenue: summary.totalRevenue,
                avgSpend: (summary.avgSpend / 12).toFixed(2)
            });

            // Limit year history to prevent infinite growth
            if (saveFile.history.years.length > 20) saveFile.history.years.pop();
        }

    toggleInputLock(false);
    renderTabButtons();
    renderDashboard();
    updateInfoPanel();
    }, 500); 
}


function updateInfoPanel() {
    document.getElementById('money').innerText = `$${saveFile.money.toLocaleString()}`;
    document.getElementById('rep').innerText = saveFile.reputation.toFixed(1);
    document.getElementById('date').innerText = `${saveFile.currentDate.month}/${saveFile.currentDate.year}`;
}

// ==========================================
// ======= HELPERS & INITIALIZATION =========
// ==========================================

function updateModelDropdown() {
    const type = document.getElementById('type-select').value;
    const drop = document.getElementById('model-select');
    drop.disabled = !type;
    drop.innerHTML = '<option value="">-- Choose Model --</option>';
    const src = type === 'coaster' ? gameData.model : gameData.flatRides;
    for (let m in src) {
        let opt = document.createElement('option');
        opt.value = m; opt.innerText = m.toUpperCase();
        drop.appendChild(opt);
    }
}

function enableInputs() {
    document.getElementById('build-inputs').style.opacity = "1";
    document.getElementById('build-inputs').style.pointerEvents = "all";
    document.getElementById('btn-build').disabled = false;
}

function openRidesList() {
    const main = document.getElementById('main-content');
    let html = `<div class="win95-dialog"><h3 class="panel-title">Asset Inventory</h3>`;
    for (let id in saveFile.rides) {
        let r = saveFile.rides[id];
        html += `<div style="border:1px solid #808080; margin:4px; padding:4px; background:#fff;"><b>${r.model.toUpperCase()}</b><br>Excitement: ${r.e}</div>`;
    }
    main.innerHTML = html + `</div>`;
}

// ==========================================
// ======= SAVE & FILE MANAGEMENT ===========
// ==========================================

function saveToLocal() {
    localStorage.setItem('AmusementSim_Save', JSON.stringify(saveFile));
    showPlaceholder('System', 'Game state saved to browser storage successfully.');
}

function exportSave() {
    const blob = new Blob([JSON.stringify(saveFile, null, 2)], {type: "text/plain"});
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `park_save_${saveFile.currentDate.month}_${saveFile.currentDate.year}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
}

function importSave() {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = e => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = readerEvent => {
            try {
                const content = JSON.parse(readerEvent.target.result);
                saveFile = content;
                updateInfoPanel();
                renderDashboard();
                showPlaceholder('System', 'Save file imported successfully!');
            } catch (err) {
                alert("Error: Invalid save file format.");
            }
        }
        reader.readAsText(file);
    }
    input.click();
}

function confirmDelete() {
    const main = document.getElementById('main-content');
    main.innerHTML = `
        <div class="win95-dialog">
            <h3 class="panel-title" style="background:red;">⚠️ WARNING: FORMAT DRIVE C:?</h3>
            <div style="padding: 20px; border: 2px inset var(--gray-1); background: #eee;">
                <p>Are you sure you want to delete all local save data? This cannot be undone.</p>
                <div style="margin-top:20px; display:flex; gap:10px;">
                    <button class="win95-btn primary" onclick="deleteSaveFinal()">YES, DELETE</button>
                    <button class="win95-btn" onclick="goBack()">CANCEL</button>
                </div>
            </div>
        </div>
    `;
}

function deleteSaveFinal() {
    localStorage.removeItem('AmusementSim_Save');
    alert("Local storage cleared. Reloading...");
    location.reload();
}


// START ENGINE
document.addEventListener('DOMContentLoaded', () => {
    const localData = localStorage.getItem('AmusementSim_Save');
    if (localData) {
        saveFile = JSON.parse(localData);
    }
    updateInfoPanel();
    renderTabButtons();
    renderDashboard();
});

