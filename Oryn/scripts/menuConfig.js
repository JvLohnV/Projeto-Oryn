import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = "https://ngehsncshjivmnqwxaqu.supabase.co";
const SUPABASE_KEY = "eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5nZWhzbmNzaGppdm1ucXd4YXF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1OTM4MzUsImV4cCI6MjA3NjE2OTgzNX0";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const toggleBtn = document.getElementById("menu-toggle");
const closeBtn = document.getElementById("menu-toggle-closed");
const sidebar = document.getElementById("sidebar");
const iconBar = document.getElementById("icon-bar");

// Abrir menu
toggleBtn.addEventListener("click", () => {
  sidebar.classList.add("open");
  iconBar.classList.add("hidden");
});

// Fechar menu
closeBtn.addEventListener("click", () => {
  sidebar.classList.remove("open");
  iconBar.classList.remove("hidden");
});


async function loadUser() {
  const session = await handleDashboardRedirect(supabase);
  if (!session) return;

  const user = session.user || { user_metadata: {} };

  document.getElementById("user-name").innerText =
    user.user_metadata.full_name || "Usuário sem nome";

  const avatarUrl = user.user_metadata.avatar_url || "./styles/imagens/DefaultUser.png"; //<-- resolver esse problema, junto de outros caminhos!!
  document.querySelectorAll(".user-avatar").forEach(img => {
    img.src = avatarUrl;
  });
}

loadUser();

async function logout() {
  await supabase.auth.signOut();
  window.location.href = "index.html";
}

document.getElementById("logout").addEventListener("click", logout);
document.getElementById("logout-icon").addEventListener("click", logout);