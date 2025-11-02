// Usar o client Supabase injetado via CDN (window.supabase) para manter
// a mesma origem/armazenamento entre index.html e dashboard.html.
const SUPABASE_URL = "https://ngehsncshjivmnqwxaqu.supabase.co";
const SUPABASE_KEY = "eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5nZWhzbmNzaGppdm1ucXd4YXF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1OTM4MzUsImV4cCI6MjA3NjE2OTgzNX0";

const createClient = window.supabase && window.supabase.createClient;
if (!createClient) {
  throw new Error('Supabase client não encontrado. Adicione o script CDN do Supabase antes de carregar este arquivo.');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const toggleBtn = document.getElementById("menu-toggle");
const closeBtn = document.getElementById("menu-toggle-closed");
const sidebar = document.getElementById("sidebar");
const iconBar = document.getElementById("icon-bar");

// Abrir/fechar menu — proteger caso os elementos não existam
if (toggleBtn && sidebar && iconBar) {
  toggleBtn.addEventListener("click", () => {
    sidebar.classList.add("open");
    iconBar.classList.add("hidden");
  });
}

if (closeBtn && sidebar && iconBar) {
  closeBtn.addEventListener("click", () => {
    sidebar.classList.remove("open");
    iconBar.classList.remove("hidden");
  });
}

async function loadUser() {
  const session = await handleDashboardRedirect(supabase);
  if (!session) return;

  const user = session.user || { user_metadata: {} };

  const nameEl = document.getElementById("user-name");
  if (nameEl) nameEl.innerText = user.user_metadata.full_name || "Usuário sem nome";

  const avatarUrl = user.user_metadata.avatar_url || "./styles/imagens/DefaultUser.png";
  document.querySelectorAll(".user-avatar").forEach(img => {
    img.src = avatarUrl;
  });
}

loadUser();

async function logout() {
  await supabase.auth.signOut();
  window.location.href = "index.html";
}

const logoutEl = document.getElementById("logout");
if (logoutEl) logoutEl.addEventListener("click", logout);
const logoutIcon = document.getElementById("logout-icon");
if (logoutIcon) logoutIcon.addEventListener("click", logout);