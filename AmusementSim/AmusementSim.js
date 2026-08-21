const rideModels = {
    'classic wooden': { type: 'Coaster', yearDeveloped: 1884, lifeSpan: 40, basePayroll: 120, sizePoints: 10, intensityPoints: 3, themePoints: 4, excitementPoints: 5, cost: 9000 },
    'carousel': { type: 'Flat ride', yearDeveloped: 1880, lifeSpan: 50, basePayroll: 90, sizePoints: 5, intensityPoints: 1, themePoints: 5, excitementPoints: 3, cost: 5000 },
    'scrambler': { type: 'Flat ride', yearDeveloped: 1950, lifeSpan: 25, basePayroll: 100, sizePoints: 6, intensityPoints: 5, themePoints: 3, excitementPoints: 5, cost: 6500 },
    'wild mouse': { type: 'Coaster', yearDeveloped: 1930, lifeSpan: 25, basePayroll: 140, sizePoints: 7, intensityPoints: 7, themePoints: 3, excitementPoints: 7, cost: 11000 },
    'family coaster': { type: 'Coaster', yearDeveloped: 1980, lifeSpan: 30, basePayroll: 180, sizePoints: 10, intensityPoints: 6, themePoints: 6, excitementPoints: 7, cost: 18000 },
    'top spin': { type: 'Flat ride', yearDeveloped: 1990, lifeSpan: 20, basePayroll: 160, sizePoints: 8, intensityPoints: 9, themePoints: 4, excitementPoints: 8, cost: 22000 },
    'inverted coaster': { type: 'Coaster', yearDeveloped: 1992, lifeSpan: 30, basePayroll: 250, sizePoints: 18, intensityPoints: 10, themePoints: 7, excitementPoints: 10, cost: 35000 },
    'modern suspended': { type: 'Coaster', yearDeveloped: 1994, lifeSpan: 25, basePayroll: 220, sizePoints: 14, intensityPoints: 8, themePoints: 8, excitementPoints: 9, cost: 30000 }
};

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const seasonDemand = [0.8, 0.8, 0.9, 1.1, 1.2, 1.5, 1.5, 1.4, 1.1, 1, 0.9, 0.8];
const startingState = () => ({
    money: 50000,
    reputation: 10,
    currentDate: { month: 1, year: 1995 },
    gatePrice: 12,
    foodPrice: 6,
    advertising: 0,
    staff: 2,
    maintenance: 2,
    totalLandAvailable: 10,
    rides: {},
    history: []
});

let saveFile = startingState();
let statsViewOffset = 0;
let currentMenu = 'root';
let isProcessing = false;

function normalizeState(raw) {
    const state = { ...startingState(), ...raw };
    state.currentDate = { ...startingState().currentDate, ...(raw.currentDate || {}) };
    state.rides = Object.fromEntries(Object.entries(raw.rides || {}).map(([id, ride]) => {
        const modelName = rideModels[ride.model] ? ride.model : 'classic wooden';
        const model = rideModels[modelName];
        const sizePoints = Number(ride.sizePoints || model.sizePoints);
        return [id, { ...model, ...ride, model: modelName, age: Number(ride.age || ride.actualAge || 0), qMult: Number(ride.qMult || 1), sizePoints, payroll: Number(ride.payroll || model.basePayroll + sizePoints * 10), monthlyCapacity: sizePoints * 100, price: Number(ride.price || state.gatePrice || 12), ridersThisMonth: Number(ride.ridersThisMonth || 0) }];
    }));
    const history = raw.history && Array.isArray(raw.history.months) ? raw.history.months : (Array.isArray(raw.history) ? raw.history : []);
    state.history = history.map(entry => entry.ledger ? { ...entry.ledger, date: entry.date, note: 'Imported report from an earlier park version.' } : entry);
    state.gatePrice = Number(state.gatePrice) || 12;
    state.foodPrice = Number(state.foodPrice) || 6;
    state.staff = Math.max(0, Number(state.staff) || 0);
    state.maintenance = Math.max(0, Number(state.maintenance) || 0);
    return state;
}

function money(value) { return `$${Math.round(value).toLocaleString()}`; }
function getRides() { return Object.values(saveFile.rides); }

function renderTabButtons() {
    const container = document.getElementById('tab-buttons');
    if (!container) return;
    const items = currentMenu === 'root' ? [
        ['Park office', 'park'], ['Attractions', 'rides'], ['Operations', 'operations'],
        ['Contracts', 'contracts'], ['Save management', 'settings']
    ] : {
        park: [['Park overview', 'park'], ['Set prices', 'pricing'], ['Advertising', 'advertising']],
        rides: [['Build attraction', 'build'], ['Manage attractions', 'manage-rides']],
        operations: [['Staffing', 'staff'], ['Maintenance', 'maintenance']],
        contracts: [['Contract ledger', 'contracts']],
        settings: [['Quick save', 'save'], ['Export save', 'export'], ['Import save', 'import'], ['New game', 'new-game']]
    }[currentMenu] || [];

    container.innerHTML = currentMenu === 'root' ? '' : '<button class="win95-btn back-btn" onclick="goBack()">&lt;- BACK</button><div class="separator"></div>';
    items.forEach(([label, id]) => { container.innerHTML += `<button class="win95-btn" onclick="openView('${id}')">${label}</button>`; });
    if (currentMenu === 'root') container.innerHTML += '<div class="separator"></div><button class="win95-btn primary end-month" onclick="runEndOfMonth()">END MONTH <span>ENTER</span></button>';
}

function openSubMenu(menuId) { currentMenu = menuId; renderTabButtons(); }
function goBack() { currentMenu = 'root'; renderTabButtons(); renderDashboard(); }
function openView(view) {
    if (['rides', 'operations', 'settings'].includes(view)) {
        openSubMenu(view);
        return;
    }
    if (view === 'park' || view === 'contracts') renderDashboard(view);
    if (view === 'pricing') renderPricing();
    if (view === 'advertising') renderAdvertising();
    if (view === 'build') openBuildMenu();
    if (view === 'manage-rides') openRidesList();
    if (view === 'staff') renderStaff();
    if (view === 'maintenance') renderMaintenance();
    if (view === 'save') saveToLocal();
    if (view === 'export') exportSave();
    if (view === 'import') importSave();
    if (view === 'new-game') confirmNewGame();
}

function renderDashboard(view = 'park') {
    const main = document.getElementById('main-content');
    const rides = getRides();
    const usedLand = rides.reduce((total, ride) => total + Number(ride.sizePoints || 0), 0);
    const last = saveFile.history[statsViewOffset];
    if (view === 'contracts') {
        main.innerHTML = `<section class="win95-dialog"><div class="panel-heading"><span>CONTRACT LEDGER</span><span class="panel-code">CITY-95</span></div><div class="notice"><strong>THE PARK IS YOUR CONTRACT.</strong><p>Reach 25 reputation to earn the city's amusement district grant. Your current reputation is ${saveFile.reputation.toFixed(1)}.</p><div class="progress"><i style="width:${Math.min(100, saveFile.reputation * 4)}%"></i></div></div></section>`;
        return;
    }
    const monthly = last ? `<div class="report-card"><div class="report-title">LAST MONTH // ${last.date}</div><div class="metric-row"><span>Total riders</span><strong>${last.population.total.toLocaleString()}</strong></div><div class="metric-row"><span>Revenue</span><strong>${money(last.revenue.gross)}</strong></div><div class="metric-row"><span>Expenses</span><strong class="negative">${money(last.revenue.expenses)}</strong></div><div class="metric-row"><span>Net result</span><strong class="${last.revenue.net >= 0 ? 'positive' : 'negative'}">${money(last.revenue.net)}</strong></div><p class="report-note">${last.note}</p>${(last.riders || []).map(ride => `<div class="metric-row ride-report"><span>${ride.model} // ${ride.riders.toLocaleString()} riders</span><strong>${money(ride.revenue)}</strong></div>`).join('')}</div>` : '<div class="notice"><strong>WELCOME, PARK DIRECTOR.</strong><p>Build an attraction, set your operating plan, then end the month to see how the park performs.</p></div>';
    main.innerHTML = `<section class="win95-dialog dashboard"><div class="panel-heading"><span>${monthNames[saveFile.currentDate.month - 1].toUpperCase()} ${saveFile.currentDate.year} // PARK OFFICE</span><span class="panel-code">LIVE</span></div><div class="dashboard-intro"><div><p class="kicker">CURRENT PARK PROFILE</p><h1>Make the crowds<br>come back.</h1></div><div class="park-grade"><span>REPUTATION</span><strong>${saveFile.reputation.toFixed(1)}</strong><small>${rides.length} attraction${rides.length === 1 ? '' : 's'} online</small></div></div><div class="dashboard-grid"><div class="stat-card"><label>LAND USED</label><strong>${usedLand}</strong><small>of ${saveFile.totalLandAvailable} land points</small></div><div class="stat-card"><label>GATE PRICE</label><strong>${money(saveFile.gatePrice)}</strong><small>each ride ticket</small></div><div class="stat-card"><label>RIDES ONLINE</label><strong>${rides.length}</strong><small>${saveFile.staff} staff // ${saveFile.maintenance} crews</small></div></div>${monthly}</section>`;
}

function renderPricing() {
    document.getElementById('main-content').innerHTML = `<section class="win95-dialog"><div class="panel-heading"><span>PRICING DESK</span><span class="panel-code">DECISION</span></div><p class="section-copy">Higher prices increase revenue, but guests are less forgiving when the ticket feels expensive.</p><div class="form-grid"><label>GATE ADMISSION<input id="gate-price" type="number" min="1" max="50" step="1" value="${saveFile.gatePrice}"></label><label>AVERAGE FOOD BILL<input id="food-price" type="number" min="1" max="30" step="1" value="${saveFile.foodPrice}"></label></div><button class="win95-btn primary wide-btn" onclick="applyPricing()">SET PRICES</button></section>`;
}
function applyPricing() { saveFile.gatePrice = clamp(Number(document.getElementById('gate-price').value), 1, 50); saveFile.foodPrice = clamp(Number(document.getElementById('food-price').value), 1, 30); updateInfoPanel(); renderDashboard(); }
function renderAdvertising() { document.getElementById('main-content').innerHTML = `<section class="win95-dialog"><div class="panel-heading"><span>ADVERTISING OFFICE</span><span class="panel-code">MONTHLY PLAN</span></div><p class="section-copy">Buy attention before the month begins. Campaigns cost money immediately and affect this month's attendance.</p><div class="choice-grid">${[['0', 'No campaign', '$0'], ['1', 'Local radio', '$2,000'], ['2', 'Regional TV', '$6,000'], ['3', 'National push', '$12,000']].map(([value, label, cost]) => `<button class="choice ${saveFile.advertising == value ? 'selected' : ''}" onclick="setAdvertising(${value})"><strong>${label}</strong><span>${cost}</span></button>`).join('')}</div></section>`; }
function setAdvertising(level) { const cost = [0, 2000, 6000, 12000][level]; if (saveFile.money < cost) { alert('Not enough cash for that campaign.'); return; } saveFile.advertising = level; renderAdvertising(); }

function openBuildMenu() {
    const available = Object.entries(rideModels).filter(([, model]) => model.yearDeveloped <= saveFile.currentDate.year);
    const usedLand = getRides().reduce((total, ride) => total + Number(ride.sizePoints || 0), 0);
    document.getElementById('main-content').innerHTML = `<section class="win95-dialog"><div class="panel-heading"><span>ATTRACTION WORKSHOP</span><span class="panel-code">${saveFile.totalLandAvailable - usedLand} LAND LEFT</span></div><p class="section-copy">Choose a ride that fits the era and your budget. Size controls capacity and payroll; excitement drives demand.</p><label class="select-label">RIDE MODEL<select id="model-select">${available.map(([name, model]) => `<option value="${name}">${name.toUpperCase()} // ${model.type}</option>`).join('')}</select></label><div id="ride-preview" class="ride-preview"></div><button class="win95-btn primary wide-btn" onclick="finalizeBuild()">BUILD ATTRACTION</button></section>`;
    document.getElementById('model-select').addEventListener('change', updateRidePreview);
    updateRidePreview();
}
function updateRidePreview() { const model = rideModels[document.getElementById('model-select').value]; document.getElementById('ride-preview').innerHTML = `<span>${model.type} // ${model.yearDeveloped}</span><strong>${money(model.cost)}</strong><small>SIZE ${model.sizePoints} // CAPACITY ${model.sizePoints * 100} // EXCITEMENT ${model.excitementPoints}/10 // LIFE ${model.lifeSpan} YRS</small>`; }
function finalizeBuild() { const name = document.getElementById('model-select').value; const model = rideModels[name]; const usedLand = getRides().reduce((total, ride) => total + Number(ride.sizePoints || 0), 0); if (usedLand + model.sizePoints > saveFile.totalLandAvailable) return alert('There is not enough land for that attraction.'); if (saveFile.money < model.cost) return alert('Insufficient funds.'); saveFile.money -= model.cost; saveFile.rides[`R_${Date.now()}`] = { ...model, model: name, manufacturer: 'Ziekenhuis', qMult: 1, payroll: model.basePayroll + model.sizePoints * 10, monthlyCapacity: model.sizePoints * 100, ridersThisMonth: 0, price: saveFile.gatePrice, age: 0 }; updateInfoPanel(); renderDashboard(); }

function openRidesList() { const rides = getRides(); document.getElementById('main-content').innerHTML = `<section class="win95-dialog"><div class="panel-heading"><span>ATTRACTION ROSTER</span><span class="panel-code">${rides.length} ONLINE</span></div>${rides.length ? rides.map((ride, index) => `<div class="ride-row"><div><strong>${ride.model.toUpperCase()}</strong><span>SIZE ${ride.sizePoints} // CAPACITY ${ride.monthlyCapacity} // PAYROLL ${money(ride.payroll)}</span><span>AGE ${ride.age.toFixed(2)} // LAST RIDERS ${(ride.ridersThisMonth || 0).toLocaleString()}</span></div><button class="small-btn" onclick="sellRide('${Object.keys(saveFile.rides)[index]}')">SELL ${money(ride.cost * .35)}</button></div>`).join('') : '<div class="notice"><strong>NO ATTRACTIONS ONLINE.</strong><p>Build your first ride to start attracting guests.</p></div>'}</section>`; }
function sellRide(id) { const ride = saveFile.rides[id]; if (!ride) return; saveFile.money += Math.round(ride.cost * .35); delete saveFile.rides[id]; updateInfoPanel(); openRidesList(); }
function renderStaff() { document.getElementById('main-content').innerHTML = `<section class="win95-dialog"><div class="panel-heading"><span>STAFFING OFFICE</span><span class="panel-code">${saveFile.staff} HIRED</span></div><p class="section-copy">Staff costs ${money(1200)} per person each month. Understaffing hurts the guest experience; overstaffing protects your reputation.</p><div class="stepper"><button onclick="changeStaff(-1)">-</button><strong>${saveFile.staff}</strong><button onclick="changeStaff(1)">+</button></div><p class="center-note">Recommended: ${Math.max(2, Math.ceil(getRides().length * 1.5))} staff for your current park.</p></section>`; }
function changeStaff(amount) { const next = Math.max(0, Math.min(12, saveFile.staff + amount)); if (next > saveFile.staff && saveFile.money < 1200) return alert('You cannot afford another hire.'); saveFile.staff = next; renderStaff(); }
function renderMaintenance() { document.getElementById('main-content').innerHTML = `<section class="win95-dialog"><div class="panel-heading"><span>MAINTENANCE BAY</span><span class="panel-code">${saveFile.maintenance} CREWS</span></div><p class="section-copy">Maintenance crews restore attraction condition at the end of each month. Neglected rides lose appeal and invite lawsuits.</p><div class="stepper"><button onclick="changeMaintenance(-1)">-</button><strong>${saveFile.maintenance}</strong><button onclick="changeMaintenance(1)">+</button></div><p class="center-note">Each crew costs ${money(800)} per month.</p></section>`; }
function changeMaintenance(amount) { saveFile.maintenance = Math.max(0, Math.min(8, saveFile.maintenance + amount)); renderMaintenance(); }

function runEndOfMonth() {
    if (isProcessing) return;
    isProcessing = true;
    toggleInputLock(true);
    document.getElementById('main-content').innerHTML = '<section class="win95-dialog processing"><div class="panel-heading"><span>MONTHLY CLOSE</span><span class="panel-code">PROCESSING</span></div><h1>Counting guests...</h1><div class="loading-bar"><i></i></div><p>Reviewing weather, queues, payroll, and ride condition.</p></section>';
    setTimeout(resolveMonth, 450);
}

function resolveMonth() {
    const rides = getRides();
    const monthIndex = saveFile.currentDate.month - 1;
    const rideReports = [];
    let totalRevenue = 0;
    let totalPayroll = 0;
    let totalMaintenance = 0;
    let totalBreakdownPenalty = 0;
    let totalExcitement = 0;

    rides.forEach(ride => {
        ride.age = Number(ride.age || 0) + (1 / 12);
        ride.price = saveFile.gatePrice;
        ride.qMult = Number(ride.qMult || 1);
        ride.monthlyCapacity = ride.sizePoints * 100;
        ride.payroll = ride.basePayroll + (ride.sizePoints * 10);
        const demand = ride.excitementPoints * ride.qMult * 100;
        ride.ridersThisMonth = Math.min(ride.monthlyCapacity, demand);
        const maintenanceCost = ride.age * 5;
        const breakdownPenalty = ride.age > ride.lifeSpan ? (ride.age - ride.lifeSpan) * .2 : 0;
        const revenue = ride.price * ride.ridersThisMonth;
        totalRevenue += revenue;
        totalPayroll += ride.payroll;
        totalMaintenance += maintenanceCost;
        totalBreakdownPenalty += breakdownPenalty;
        totalExcitement += ride.excitementPoints;
        rideReports.push({ model: ride.model, riders: ride.ridersThisMonth, revenue, maintenanceCost, breakdownPenalty });
    });

    const totalExpenses = totalPayroll + totalMaintenance;
    const net = totalRevenue - totalExpenses;
    const averageExcitement = rides.length ? totalExcitement / rides.length : 0;
    const reputationChange = (averageExcitement * .1) - totalBreakdownPenalty;
    saveFile.money += net;
    saveFile.reputation = clamp(saveFile.reputation + reputationChange, 0, 100);
    saveFile.history.unshift({
        date: `${monthNames[monthIndex]} ${saveFile.currentDate.year}`,
        population: { total: rideReports.reduce((sum, ride) => sum + ride.riders, 0) },
        revenue: { gross: totalRevenue, payroll: totalPayroll, maintenance: totalMaintenance, expenses: totalExpenses, net },
        riders: rideReports,
        reputationChange,
        note: `${rideReports.reduce((sum, ride) => sum + ride.riders, 0).toLocaleString()} riders visited ${rides.length} attraction${rides.length === 1 ? '' : 's'}. Reputation ${reputationChange >= 0 ? 'rose' : 'fell'} by ${Math.abs(reputationChange).toFixed(2)}.`
    });
    saveFile.currentDate.month += 1;
    if (saveFile.currentDate.month > 12) { saveFile.currentDate.month = 1; saveFile.currentDate.year += 1; }
    saveFile.advertising = 0;
    statsViewOffset = 0;
    isProcessing = false;
    toggleInputLock(false);
    updateInfoPanel();
    renderTabButtons();
    renderDashboard();
}

function toggleInputLock(locked) { document.querySelectorAll('#tab-buttons button').forEach(button => { button.disabled = locked; }); }
function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
function updateInfoPanel() { document.getElementById('money').innerText = money(saveFile.money); document.getElementById('rep').innerText = saveFile.reputation.toFixed(1); document.getElementById('date').innerText = `${monthNames[saveFile.currentDate.month - 1]} ${saveFile.currentDate.year}`; document.getElementById('ride-count').innerText = getRides().length; }
function saveToLocal() { localStorage.setItem('AmusementSim_Save', JSON.stringify(saveFile)); renderDashboard(); alert('Park saved locally.'); }
function exportSave() { const blob = new Blob([JSON.stringify(saveFile, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `park-save-${saveFile.currentDate.year}.json`; link.click(); URL.revokeObjectURL(url); }
function importSave() { const input = document.createElement('input'); input.type = 'file'; input.accept = '.json,.txt'; input.onchange = event => { const reader = new FileReader(); reader.onload = () => { try { saveFile = normalizeState(JSON.parse(reader.result)); updateInfoPanel(); renderDashboard(); } catch (error) { alert('That file is not a valid park save.'); } }; reader.readAsText(event.target.files[0]); }; input.click(); }
function confirmNewGame() { if (confirm('Start a new park? This will erase the current local game.')) { localStorage.removeItem('AmusementSim_Save'); saveFile = startingState(); updateInfoPanel(); renderTabButtons(); renderDashboard(); } }

document.addEventListener('DOMContentLoaded', () => { const localData = localStorage.getItem('AmusementSim_Save'); if (localData) { try { saveFile = normalizeState(JSON.parse(localData)); } catch (error) { saveFile = startingState(); } } updateInfoPanel(); renderTabButtons(); renderDashboard(); });
