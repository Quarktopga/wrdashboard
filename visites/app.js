// ---------------------------------------------
// ⚙️ CONFIG SUPABASE
// ---------------------------------------------
const SUPABASE_URL = "https://jaedzrrkdtglnltvbded.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_8rojKIhY-3WDhHx73kl7ZA_XJ0X9Vsg";

const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ---------------------------------------------
// 🔍 SÉLECTEURS
// ---------------------------------------------
const totalEl = document.getElementById("metric-total");
const tableBody = document.getElementById("table-body");
const filterUsage = document.getElementById("filter-usage");
const btnRefresh = document.getElementById("btn-refresh");
const lastRefreshEl = document.getElementById("last-refresh");

// ---------------------------------------------
// 📅 FORMATAGE DATE
// ---------------------------------------------
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

// ---------------------------------------------
// 📥 CHARGEMENT DES DONNÉES
// ---------------------------------------------
async function loadData() {
    const { data, error } = await client
        .from("visites")
        .select("id, device, page, arrived_at, duration_seconds, usage, created_at")
        .order("created_at", { ascending: false })
        .limit(100000);

    if (error) {
        console.error(error);
        tableBody.innerHTML = `<tr><td colspan="5">Erreur : ${error.message}</td></tr>`;
        return;
    }

    const rows = data || [];

    // Normalisation usage
    rows.forEach(r => {
        const raw = r.usage ? r.usage.toString().trim() : "USER";
        r.usage = raw.toUpperCase();
    });

    // --- FILTRE USAGE ---
    let filtered = rows;

    if (filterUsage.value) {
        const selected = filterUsage.value.toUpperCase();
        filtered = filtered.filter(r => r.usage === selected);
    }

    // --- MÉTRIQUE ---
    totalEl.textContent = filtered.length;

    // --- TABLEAU ---
    tableBody.innerHTML = filtered.map(r => `
        <tr>
            <td>${r.device}</td>
            <td>${r.page}</td>
            <td>${formatDate(r.created_at)}</td>
            <td>${r.duration_seconds ? r.duration_seconds + "s" : "–"}</td>
            <td>${r.usage}</td>
        </tr>
    `).join("");

    // --- GRAPHIQUES ---
    updateCharts(filtered);

    lastRefreshEl.textContent = "Dernier rafraîchissement : " + new Date().toLocaleTimeString("fr-FR");
}

// ---------------------------------------------
// 🔄 RAFRAÎCHISSEMENTS
// ---------------------------------------------
btnRefresh.addEventListener("click", loadData);
filterUsage.addEventListener("change", loadData);

// Chargement initial
loadData();
