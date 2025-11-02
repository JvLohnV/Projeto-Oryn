// Variável global para ativar o modo de teste
const enableTest = false; // 👉 troque para false quando quiser comportamento real

/**
 * Função usada no LOGIN (index.html)
 * - Se enableTest = true → pula login e vai direto para dashboard.html
 * - Se enableTest = false → faz login normal com Google (Supabase)
 */
async function handleLoginRedirect(supabaseClient) {
    if (enableTest) {
        console.log("Modo TEST ativo → pulando login.");
        window.location.href = "dashboard.html";
        return;
    }

    const { error } = await supabaseClient.auth.signInWithOAuth({
        provider: "google",
        options: {
            redirectTo: "https://jvlohnv.github.io/Projeto-Oryn/Oryn/dashboard.html",
        },
    });

    if (error) {
        document.getElementById("errorMsg").textContent = "Erro: " + error.message;
    }
}

/**
 * Função usada no DASHBOARD (dashboard.html)
 * - Se enableTest = true → ignora checagem de sessão
 * - Se enableTest = false → redireciona se não tiver sessão
 */
async function handleDashboardRedirect(supabase) {
    if (enableTest) {
        console.log("Modo TEST ativo → sessão ignorada.");
        return true; // simula usuário logado
    }

    const { data, error } = await supabase.auth.getSession();
    const session = data.session;

    if (!session) {
        console.log("Nenhuma sessão encontrada → redirecionando.");
        window.location.href = "index.html";
        return false;
    }

    return session;
}