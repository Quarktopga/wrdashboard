// ⚙️ CONFIG SUPABASE – À REMPLACER PAR TES VALEURS
const SUPABASE_URL = "https://jaedzrrkdtglnltvbded.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_8rojKIhY-3WDhHx73kl7ZA_XJ0X9Vsg";

const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Sélecteurs
const totalEl = document.getElementById("metric-total");
const understoodRateEl = document.getElementById("metric-understood-rate");
const notUnderstoodEl = document.getElementById("metric-not-understood");
const tableBody = document.getElementById("table-body");
const lastRefreshEl = document.getElementById("last-refresh");
const btnRefresh = document.getElementById("btn-refresh");

const filterCategory = document.getElementById("filter-category");
const filterUsage = document.getElementById("filter-usage");

function badge(value) {
    if (value === true) return '<span class="badge badge-true">Compris</span>';
    if (value === false) return '<span class="badge badge-false">Non compris</span>';
    return '<span class="badge badge-null">Inconnu</span>';
}

function formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleString("fr-FR", {
        year: "2-digit",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
    });
}

async function loadData() {
    const { data, error } = await client
        .from("ask_logs")
        .select("id, question, understood, category, usage, created_at")
        .order("created_at", { ascending: false })
        .limit(300);

    if (error) {
        console.error(error);
        tableBody.innerHTML = `<tr><td colspan="5">Erreur : ${error.message}</td></tr>`;
        return;
    }

    const rows = data || [];

// Normalisation usage
rows.forEach(r => {
    // Si usage est vide, null, undefined → USER
    const raw = r.usage ? r.usage.toString().trim() : "USER";
    r.usage = raw.toUpperCase(); // USER ou TEST
});

// --- FILTRES ---
let filtered = rows;

// Filtre catégorie
if (filterCategory.value) {
    filtered = filtered.filter(r => r.category === filterCategory.value);
}

// Filtre usage
if (filterUsage.value) {
    const selected = filterUsage.value.toUpperCase();
    filtered = filtered.filter(r => r.usage === selected);
}



    // --- MÉTRIQUES ---
    const total = filtered.length;
    const understoodTrue = filtered.filter(r => r.understood === true).length;
    const understoodFalse = filtered.filter(r => r.understood !== true).length;

    totalEl.textContent = total;
    understoodRateEl.textContent = total === 0 ? "–" : Math.round((understoodTrue / total) * 100) + "%";
    notUnderstoodEl.textContent = understoodFalse;

    // --- TABLEAU ---
    tableBody.innerHTML = filtered.map(r => `
        <tr>
            <td>${badge(r.understood)}</td>
            <td>${r.question}</td>
            <td class="muted">${formatDate(r.created_at)}</td>
            <td>${r.category || "<span class='muted'>–</span>"}</td>
            <td>${r.usage || "<span class='muted'>–</span>"}</td>
        </tr>
    `).join("");

    // --- GRAPHIQUES ---
    updateCharts(filtered);

    lastRefreshEl.textContent = "Dernier rafraîchissement : " + new Date().toLocaleTimeString("fr-FR");
}

// Rafraîchissement manuel
btnRefresh.addEventListener("click", loadData);

// Rafraîchissement automatique lors d’un changement de filtre
filterCategory.addEventListener("change", loadData);
filterUsage.addEventListener("change", loadData);

// Chargement initial
loadData();
