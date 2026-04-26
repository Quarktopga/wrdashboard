// ------------------------------------------------------
// CHARTS VISITES
// ------------------------------------------------------

let chartDevices = null;
let chartDuration = null;
let chartPages = null;

// Couleurs premium
const COLORS = {
    mobile: "#4a6cf7",
    tablet: "#ffb74d",
    desktop: "#66bb6a",
    pages: "#7e57c2",
    duration: "#26c6da"
};

// ------------------------------------------------------
// FONCTION PRINCIPALE
// ------------------------------------------------------
function updateCharts(rows) {
    if (!rows || rows.length === 0) {
        destroyAllCharts();
        return;
    }

    updateDeviceChart(rows);
    updateDurationChart(rows);
    updatePagesChart(rows);
}

// ------------------------------------------------------
// 1) RÉPARTITION DES APPAREILS
// ------------------------------------------------------
function updateDeviceChart(rows) {
    const counts = {
        mobile: 0,
        tablet: 0,
        desktop: 0
    };

    rows.forEach(r => {
        if (counts[r.device] !== undefined) {
            counts[r.device]++;
        }
    });

    const ctx = document.getElementById("chart-devices").getContext("2d");

    if (chartDevices) chartDevices.destroy();

    chartDevices = new Chart(ctx, {
        type: "pie",
        data: {
            labels: ["Mobile", "Tablet", "Desktop"],
            datasets: [{
                data: [counts.mobile, counts.tablet, counts.desktop],
                backgroundColor: [
                    COLORS.mobile,
                    COLORS.tablet,
                    COLORS.desktop
                ]
            }]
        },
        options: {
            plugins: {
                legend: { position: "bottom" }
            }
        }
    });
}

// ------------------------------------------------------
// 2) DURÉE MOYENNE PAR PAGE
// ------------------------------------------------------
function updateDurationChart(rows) {
    const durations = {};

    rows.forEach(r => {
        if (!r.duration_seconds) return;

        if (!durations[r.page]) {
            durations[r.page] = { total: 0, count: 0 };
        }
        durations[r.page].total += r.duration_seconds;
        durations[r.page].count++;
    });

    const pages = Object.keys(durations);
    const avg = pages.map(p => Math.round(durations[p].total / durations[p].count));

    const ctx = document.getElementById("chart-duration").getContext("2d");

    if (chartDuration) chartDuration.destroy();

    chartDuration = new Chart(ctx, {
        type: "bar",
        data: {
            labels: pages,
            datasets: [{
                label: "Durée moyenne (s)",
                data: avg,
                backgroundColor: COLORS.duration
            }]
        },
        options: {
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

// ------------------------------------------------------
// 3) PAGES LES PLUS VISITÉES
// ------------------------------------------------------
function updatePagesChart(rows) {
    const counts = {};

    rows.forEach(r => {
        counts[r.page] = (counts[r.page] || 0) + 1;
    });

    const pages = Object.keys(counts);
    const values = pages.map(p => counts[p]);

    const ctx = document.getElementById("chart-pages").getContext("2d");

    if (chartPages) chartPages.destroy();

    chartPages = new Chart(ctx, {
        type: "bar",
        data: {
            labels: pages,
            datasets: [{
                label: "Visites",
                data: values,
                backgroundColor: COLORS.pages
            }]
        },
        options: {
            indexAxis: "y",
            scales: {
                x: { beginAtZero: true }
            }
        }
    });
}

// ------------------------------------------------------
// UTILITAIRE : détruire tous les graphiques
// ------------------------------------------------------
function destroyAllCharts() {
    if (chartDevices) chartDevices.destroy();
    if (chartDuration) chartDuration.destroy();
    if (chartPages) chartPages.destroy();
}
