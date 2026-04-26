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
const lastRefreshEl = document.getElementById("last-refresh");
const btnRefresh = document.getElementById("btn-refresh");

const filterUsage = document.getElementById("filter-usage");

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
// 📥 CHARGEMENT DES FEEDBACKS
// ---------------------------------------------
async function loadFeedback() {
    const { data, error } = await client
        .from("feedback")
        .select("id, contenu, usage, created_at")
        .order("created_at", { ascending: false })
        .limit(300);

    if (error) {
        console.error(error);
        tableBody.innerHTML = `<tr><td colspan="4">Erreur : ${error.message}</td></tr>`;
        return;
    }

    const rows = data || [];

    // Normalisation usage
    rows.forEach(r => {
        const raw = r.usage ? r.usage.toString().trim() : "USER";
        r.usage = raw.toUpperCase(); // USER ou TEST
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
            <td>${r.contenu}</td>
            <td class="muted">${formatDate(r.created_at)}</td>
            <td>${r.usage}</td>
        </tr>
    `).join("");

    lastRefreshEl.textContent = "Dernier rafraîchissement : " + new Date().toLocaleTimeString("fr-FR");
}

// ---------------------------------------------
// 🔄 RAFRAÎCHISSEMENTS
// ---------------------------------------------
btnRefresh.addEventListener("click", loadFeedback);
filterUsage.addEventListener("change", loadFeedback);

// Chargement initial
loadFeedback();
