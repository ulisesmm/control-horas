const STORAGE_KEY = 'cdh_excel_v1';

// DOM Elements
const entryForm = document.getElementById('entryForm');
const historyBody = document.getElementById('historyBody');
const exportBtn = document.getElementById('exportBtn');
const clearDataBtn = document.getElementById('clearDataBtn');

// Stats Elements
const els = {
    normal: document.getElementById('totalNormal'),
    hr50: document.getElementById('total50'),
    hr100: document.getElementById('total100'),
    travel: document.getElementById('totalTravel'),
    food8: document.getElementById('totalFood8'),
    food10: document.getElementById('totalFood10'),
    guard: document.getElementById('totalGuard'),
    fc: document.getElementById('totalFC'),
};

// State
let entries = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

function saveEntries() {
    // Sort by date string (YYYY-MM-DD supports string sort)
    entries.sort((a, b) => a.date.localeCompare(b.date));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    render();
}

function addEntry(e) {
    e.preventDefault();

    // Inputs
    const dateInput = document.getElementById('date');
    const dateVal = dateInput.value; // YYYY-MM-DD

    // Check duplication
    if (entries.some(e => e.date === dateVal)) {
        if (!confirm(`Ya existe un registro para la fecha ${dateVal}. ¿Sobrescribir?`)) return;
        entries = entries.filter(e => e.date !== dateVal);
    }

    const newEntry = {
        id: Date.now(),
        date: dateVal,
        normal: document.getElementById('normal').checked,
        hr50: parseFloat(document.getElementById('hr50').value) || 0,
        hr100: parseFloat(document.getElementById('hr100').value) || 0,
        travel: parseFloat(document.getElementById('travel').value) || 0,
        food8: document.getElementById('food8').checked,
        food10: document.getElementById('food10').checked,
        guard: document.getElementById('guard').checked,
        fc: document.getElementById('fc').checked,
        obs: document.getElementById('obs').value
    };

    entries.push(newEntry);
    saveEntries();
    entryForm.reset();

    // Reset date to today
    dateInput.valueAsDate = new Date();
}

function deleteEntry(id) {
    if (confirm('¿Eliminar registro?')) {
        entries = entries.filter(entry => entry.id !== id);
        saveEntries();
    }
}

function clearAllData() {
    if (confirm('¿Reiniciar todo el mes? Se borrarán todos los datos.')) {
        entries = [];
        saveEntries();
    }
}

function updateDashboard() {
    const totals = {
        normal: 0,
        hr50: 0,
        hr100: 0,
        travel: 0,
        food8: 0,
        food10: 0,
        guard: 0,
        fc: 0
    };

    entries.forEach(e => {
        if (e.normal) totals.normal++;
        totals.hr50 += e.hr50;
        totals.hr100 += e.hr100;
        totals.travel += e.travel;
        if (e.food8) totals.food8++;
        if (e.food10) totals.food10++;
        if (e.guard) totals.guard++;
        if (e.fc) totals.fc++;
    });

    els.normal.textContent = totals.normal;
    els.hr50.textContent = totals.hr50;
    els.hr100.textContent = totals.hr100;
    els.travel.textContent = totals.travel;
    els.food8.textContent = totals.food8;
    els.food10.textContent = totals.food10;
    els.guard.textContent = totals.guard;
    els.fc.textContent = totals.fc;
}

function render() {
    historyBody.innerHTML = '';

    entries.forEach(e => {
        const dateObj = new Date(e.date + 'T12:00:00'); // Force noon to avoid timezone shift issues
        const dayOfWeek = dateObj.getDay(); // 0 = Sun, 6 = Sat
        const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);

        // Format: DD/MM (Day Name)
        const dayName = dateObj.toLocaleDateString('es-ES', { weekday: 'short' });
        const dateStr = dateObj.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
        const formattedDate = `${dateStr} <small>(${dayName})</small>`;

        const row = document.createElement('tr');
        if (isWeekend) row.classList.add('weekend-row');

        row.innerHTML = `
            <td>${formattedDate}</td>
            <td>${e.normal ? '✔️' : '-'}</td>
            <td>${e.hr50 || '-'}</td>
            <td>${e.hr100 || '-'}</td>
            <td>${e.travel || '-'}</td>
            <td>${e.food8 ? '✔️' : '-'}</td>
            <td>${e.food10 ? '✔️' : '-'}</td>
            <td>${e.guard ? '✔️' : '-'}</td>
            <td>${e.fc ? '✔️' : '-'}</td>
            <td><small>${e.obs || ''}</small></td>
            <td class="no-print">
                <button class="btn btn-danger btn-sm" onclick="deleteEntry(${e.id})">×</button>
            </td>
        `;
        historyBody.appendChild(row);
    });

    updateDashboard();
}

document.addEventListener('DOMContentLoaded', () => {
    // Set default date to today
    document.getElementById('date').valueAsDate = new Date();

    entryForm.addEventListener('submit', addEntry);
    clearDataBtn.addEventListener('click', clearAllData);
    exportBtn.addEventListener('click', () => window.print());
    render();
});
