// personagens.js
import supabase from './supabase.js'; // importa o client do Supabase

const container = document.getElementById('personagensContainer');
const btnCriar = document.getElementById('btnCriar');

let personagens = []; // vai ser carregado do Supabase

// ---------------------------
// Função para carregar personagens do Supabase
// ---------------------------
async function carregar() {
    const { data, error } = await supabase
        .from('personagens')  // nome da tabela no Supabase
        .select('*');

    if(error){
        console.error("Erro ao carregar personagens:", error);
        return [];
    }
    return data || [];
}

// ---------------------------
// Função para salvar personagem no Supabase
// ---------------------------
async function salvar(personagem) {
    const { data, error } = await supabase
        .from('personagens')
        .insert([personagem]);

    if(error){
        console.error("Erro ao salvar personagem:", error);
    }
}

// ---------------------------
// Renderizar personagens
// ---------------------------
function renderPersonagem(p, highlight=false){
    const card = document.createElement('div');
    card.className = 'personagem-btn';
    card.dataset.nome = p.nome;
    card.innerHTML = `
        <img src="${p.imagem}" alt="${p.nome}">
        <div class="personagem-info">
            <b>${p.nome}</b>
            <span>Raça: ${p.raca || '-'}</span>
            <span>Tamanho: ${p.tamanho || '-'}</span>
        </div>
    `;

    const del = document.createElement('button');
    del.className = 'delete-btn';
    const delImg = document.createElement('img');
    delImg.src = 'Trashy.png';
    del.appendChild(delImg);
    del.addEventListener('click', async e=>{
        e.stopPropagation();
        if(confirm(`Excluir ${p.nome}?`)){
            // Deletar do Supabase
            const { error } = await supabase
                .from('personagens')
                .delete()
                .eq('id', p.id); // assume que a tabela tem coluna 'id'

            if(error){
                console.error("Erro ao deletar:", error);
            } else {
                personagens = personagens.filter(x=>x !== p);
                card.remove();
            }
        }
    });
    card.appendChild(del);

    card.addEventListener('click', ()=>{ /* mesma lógica do localStorage */ });
    card.addEventListener('dblclick', ()=>{ window.location.href = p.pagina; });

    container.appendChild(card);

    if(highlight){
        card.classList.add('highlight');
        setTimeout(()=>card.classList.remove('highlight'),900);
        card.classList.add('selected');
    }
}

function renderAll(){
    container.innerHTML='';
    personagens.forEach(p=>renderPersonagem(p));
}

// ---------------------------
// Inicialização
// ---------------------------
(async function init(){
    personagens = await carregar();
    renderAll();
})();

// ---------------------------
// Botão criar novo personagem
// ---------------------------
btnCriar.addEventListener('click', async ()=>{
    const nome = prompt("Digite o nome do novo personagem:");
    if(!nome) return;

    const raca = prompt("Digite a raça do personagem:") || "Desconhecida";

    let tamanho = prompt("Escolha o tamanho: pequeno, médio ou grande")?.toLowerCase() || "médio";
    if(!["pequeno","médio","grande"].includes(tamanho)) tamanho = "médio";

    const novo = {
        nome,
        raca,
        tamanho,
        imagem: 'New.png',
        pagina: `Ficha/Novo_${Date.now()}.html`
    };

    // salva no Supabase e atualiza local
    const { data, error } = await supabase.from('personagens').insert([novo]).select();
    if(error){
        console.error("Erro ao criar personagem:", error);
        return;
    }
    const personagemCriado = data[0]; // Supabase retorna o objeto criado com id
    personagens.push(personagemCriado);
    renderPersonagem(personagemCriado,true);
});
