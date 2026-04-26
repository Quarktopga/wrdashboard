// charts.js
// Nécessite Chart.js (déjà inclus dans index.html)

// Références des canvas
const ctxCategories = document.getElementById("chart-categories");
const ctxUnderstanding = document.getElementById("chart-understanding");
const ctxUsage = document.getElementById("chart-usage");

// Instances Chart.js (pour pouvoir les détruire avant mise à jour)
let chartCategories = null;
let chartUnderstanding = null;
let chartUsage = null;

// Fonction principale appelée depuis app.js
function updateCharts(rows) {
    if (!rows || rows.length === 0) {
        destroyAllCharts();
        return;
    }

    updateCategoryChart(rows);
    updateUnderstandingChart(rows);
    updateUsageChart(rows);
}

// Détruit proprement les graphiques existants
function destroyAllCharts() {
    if (chartCategories) chartCategories.destroy();
    if (chartUnderstanding) chartUnderstanding.destroy();
    if (chartUsage) chartUsage.destroy();
}

// --- 1. CAMEMBERT DES CATÉGORIES ---
function updateCategoryChart(rows) {
    const counts = {};

    rows.forEach(r => {
        const cat = r.category || "unknown";
        counts[cat] = (counts[cat] || 0) + 1;
    });

    const labels = Object.keys(counts);
    const values = Object.values(counts);

    if (chartCategories) chartCategories.destroy();

    chartCategories = new Chart(ctxCategories, {
        type: "pie",
        data: {
            labels,
            datasets: [{
                data: values,
                backgroundColor: [
                    "#2563eb", "#10b981", "#f59e0b", "#ef4444",
                    "#6366f1", "#14b8a6", "#f97316", "#0ea5e9",
                    "#84cc16", "#a855f7", "#64748b", "#ff66cc"
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

// --- 2. COURBE DU TAUX DE COMPRÉHENSION ---
function updateUnderstandingChart(rows) {
    // Regroupement par jour
    const byDay = {};

    rows.forEach(r => {
        const day = r.created_at.split("T")[0];
        if (!byDay[day]) byDay[day] = { total: 0, ok: 0 };
        byDay[day].total++;
        if (r.understood === true) byDay[day].ok++;
    });

    const labels = Object.keys(byDay).sort();
    const values = labels.map(day => {
        const { total, ok } = byDay[day];
        return Math.round((ok / total) * 100);
    });

    if (chartUnderstanding) chartUnderstanding.destroy();

    chartUnderstanding = new Chart(ctxUnderstanding, {
        type: "line",
        data: {
            labels,
            datasets: [{
                label: "Taux de compréhension (%)",
                data: values,
                borderColor: "#2563eb",
                backgroundColor: "rgba(37, 99, 235, 0.2)",
                tension: 0.3
            }]
        },
        options: {
            scales: {
                y: { min: 0, max: 100 }
            }
        }
    });
}

// --- 3. BARRES USER vs TEST ---
function updateUsageChart(rows) {
    const usageCounts = { USER: 0, TEST: 0 };

rows.forEach(r => {
    const u = (r.usage || "USER").toUpperCase();
    usageCounts[u] = (usageCounts[u] || 0) + 1;
});



    if (chartUsage) chartUsage.destroy();

    chartUsage = new Chart(ctxUsage, {
        type: "bar",
        data: {
            labels: ["USER", "TEST"],
            datasets: [{
                label: "Nombre de requêtes",
                data: [usageCounts.USER, usageCounts.TEST],
                backgroundColor: ["#10b981", "#ef4444"]
            }]
        },
        options: {
            plugins: {
                legend: { display: false }
            }
        }
    });
}
