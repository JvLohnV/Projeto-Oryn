 const container = document.getElementById('personagensContainer');
    const modal = document.getElementById('modalCriar');
    const btnCriar = document.getElementById('btnCriar');
    const criarBtn = document.getElementById('criarBtn');
    const cancelarBtn = document.getElementById('cancelarBtn');

    const nomeInput = document.getElementById('nomePersonagem');
    const racaSelect = document.getElementById('racaPersonagem');
    const tamanhoSelect = document.getElementById('tamanhoPersonagem');

    const modalExcluir = document.getElementById('modalExcluir');
    const excluirInput = document.getElementById('excluirInput');
    const cancelarExcluirBtn = document.getElementById('cancelarExcluirBtn');
    const confirmExcluirBtn = document.getElementById('confirmExcluirBtn');
    const palavraExcluirInfo = document.getElementById('palavraExcluirInfo');

    const palavras = ['Guaraná', 'Shaw', 'Git Gud', 'Edino', 'Regale'];

    function salvar(personagens){ localStorage.setItem('portal_personagens', JSON.stringify(personagens)); }
    function carregar(){ return JSON.parse(localStorage.getItem('portal_personagens')) || []; }
    let personagens = carregar();
    let personagemParaExcluir = null;
    let palavraAtual = '';

    function renderPersonagem(p, highlight=false){
      const card = document.createElement('div');
      card.className = 'personagem-btn';
      card.dataset.nome = p.nome;
      card.innerHTML = `
        <img class="personagem-img" src="${p.imagem}" alt="${p.nome}">
        <div class="personagem-info">
          <b>${p.nome}</b>
          <span>Raça: ${p.raca || '-'}</span>
          <span>Tamanho: ${p.tamanho || '-'}</span>
        </div>
      `;

      const del = document.createElement('button');
      del.className = 'delete-btn';
      const delImg = document.createElement('img');
      delImg.src = './icones/Trashy.png';
      del.appendChild(delImg);
      del.addEventListener('click', e=>{
        e.stopPropagation();
        personagemParaExcluir = {p, card};
        palavraAtual = palavras[Math.floor(Math.random() * palavras.length)];
        palavraExcluirInfo.innerHTML = `Digite a palavra <b>${palavraAtual}</b> para excluir o personagem`;
        excluirInput.value = '';
        modalExcluir.style.display = 'flex';
      });
      card.appendChild(del);

      card.addEventListener('click', ()=>{
        document.querySelectorAll('.personagem-btn').forEach(el=>el.classList.remove('selected'));
        card.classList.add('selected');
        localStorage.setItem('portal_personagemSelecionado', p.nome);
      });

      card.addEventListener('dblclick', ()=>{
        // abre a ficha na pasta Ficha
        window.location.href = `ficha/index.html`;
      });

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
    renderAll();

    btnCriar.addEventListener('click', ()=>{
      nomeInput.value = '';
      racaSelect.value = 'Mariposa';
      tamanhoSelect.value = 'pequeno';
      modal.style.display = 'flex';
    });
    cancelarBtn.addEventListener('click', ()=>{ modal.style.display = 'none'; });

    criarBtn.addEventListener('click', ()=>{
      const nome = nomeInput.value.trim();
      if(!nome) return alert("Digite um nome válido!");
      const raca = racaSelect.value;
      const tamanho = tamanhoSelect.value;
      const novo = { nome: nome, raca, tamanho, imagem: './icones/MascaraIcone.png', pagina: `Ficha/Novo_${Date.now()}.html` };
      personagens.push(novo);
      salvar(personagens);
      renderPersonagem(novo,true);
      modal.style.display = 'none';
    });

    cancelarExcluirBtn.addEventListener('click', ()=>{ modalExcluir.style.display='none'; personagemParaExcluir=null; });
    confirmExcluirBtn.addEventListener('click', ()=>{
      if(!personagemParaExcluir) return;
      const texto = excluirInput.value.trim();
      if(texto === palavraAtual){
        personagens = personagens.filter(x=>x!==personagemParaExcluir.p);
        salvar(personagens);
        personagemParaExcluir.card.remove();
        modalExcluir.style.display='none';
        personagemParaExcluir=null;
      } else {
        alert(`Palavra incorreta! Digite exatamente: "${palavraAtual}".`);
      }
    });