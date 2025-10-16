document.addEventListener('DOMContentLoaded', () => {

  // =========================
  // VIDA
  // =========================
  const vidaContainer = document.getElementById('vidaContainer');

  function atualizarVidaMax(vidaMax) {
    let vidaBolinha = vidaContainer.querySelectorAll('.vidaBolinha');
    const currentVida = vidaBolinha.length;

    // Remove excesso
    if (currentVida > vidaMax) {
      for (let i = currentVida - 1; i >= vidaMax; i--) {
        vidaContainer.removeChild(vidaBolinha[i]);
      }
    }
    // Adiciona novas bolinhas
    else if (currentVida < vidaMax) {
      for (let i = currentVida; i < vidaMax; i++) {
        const nova = document.createElement('img');
        nova.src = 'Mask Full.png';
        nova.className = 'vidaBolinha';
        nova.dataset.estado = 'full';
        vidaContainer.appendChild(nova);
      }
    }

    // Reaplica evento de clique
    vidaBolinha = vidaContainer.querySelectorAll('.vidaBolinha');
    vidaBolinha.forEach((bolinha, index) => {
      bolinha.onclick = () => {
        const estado = bolinha.dataset.estado;
        if (estado === 'full') {
          for (let i = index; i < vidaBolinha.length; i++) {
            vidaBolinha[i].src = 'Mask.png';
            vidaBolinha[i].dataset.estado = 'empty';
          }
        } else {
          for (let i = 0; i <= index; i++) {
            vidaBolinha[i].src = 'Mask Full.png';
            vidaBolinha[i].dataset.estado = 'full';
          }
        }
      };
    });
  }

  // =========================
  // ALMA
  // =========================
  const almaContainer = document.getElementById('almaContainer');
  const almaInterior = document.getElementById('almaInterior');
  let almaPercent = 0;
  function updateAlmaVisual() {
    almaInterior.style.clipPath = `inset(${100 - almaPercent}% 0 0 0)`;
  }
  almaContainer.addEventListener('click', (e) => {
    const rect = almaContainer.getBoundingClientRect();
    const y = e.clientY - rect.top;
    almaPercent = Math.max(0, Math.min(100, 100 - (y / rect.height * 100)));
    updateAlmaVisual();
  });
  updateAlmaVisual();

  // =========================
  // FUNDO / TEMAS
  // =========================
  const botoes = document.querySelectorAll('#fundos button');
  const colAtributos = document.getElementById('colAtributos');
  const colTamanho = document.getElementById('colTamanho');
  const colInventario = document.getElementById('colInventario');
  const colSkills = document.getElementById('colSkills');
  const inputs = colAtributos.querySelectorAll('input');
  const spans = colAtributos.querySelectorAll('span');
  const titulo = colAtributos.querySelector('h2');

  function aplicarTema(btn) {
    const bg = btn.dataset.bg;
    const col = btn.dataset.col;
    const inputBg = btn.dataset.input;
    const text = btn.dataset.text;

    document.body.style.background = `url('${bg}') no-repeat center center fixed`;
    document.body.style.backgroundSize = "cover";

    colAtributos.style.background = col;
    colTamanho.style.background = col;
    colInventario.style.background = col;
    colSkills.style.background = col;

    titulo.style.color = text;
    spans.forEach(s => s.style.color = text);
    inputs.forEach(i => {
      i.style.color = text;
      i.style.background = inputBg;
    });

    [colAtributos, colTamanho, colInventario, colSkills].forEach(c => {
      c.classList.remove('grimm','soul','void','lifeblood');
    });
    if (btn.id === 'btnGrimm') [colAtributos, colTamanho, colInventario, colSkills].forEach(c => c.classList.add('grimm'));
    if (btn.id === 'btnSoul') [colAtributos, colTamanho, colInventario, colSkills].forEach(c => c.classList.add('soul'));
    if (btn.id === 'btnVoid') [colAtributos, colTamanho, colInventario, colSkills].forEach(c => c.classList.add('void'));
    if (btn.id === 'btnLifeblood') [colAtributos, colTamanho, colInventario, colSkills].forEach(c => c.classList.add('lifeblood'));

    let thumbColor;
    switch (btn.id) {
      case 'btnGrimm': thumbColor = 'rgba(150,0,0,0.6)'; break;
      case 'btnSoul': thumbColor = 'rgba(230,230,230,0.85)'; break;
      case 'btnVoid': thumbColor = 'rgba(80,80,80,0.85)'; break;
      case 'btnLifeblood': thumbColor = 'rgba(150,200,255,0.85)'; break;
      default: thumbColor = 'rgba(150,0,0,0.6)';
    }
    [colInventario, colAtributos, colTamanho, colSkills].forEach(col => {
      col.style.setProperty('--scroll-thumb', thumbColor);
    });
  }

  botoes.forEach(btn => {
    btn.addEventListener('click', () => aplicarTema(btn));
  });

  window.addEventListener('load', () => {
    if (botoes[0]) aplicarTema(botoes[0]);
  });

  // =========================
  // BOTÃO LÁPIS / EDIÇÃO
  // =========================
  const editarBtn = document.getElementById('editarAtributos');
  const checkers = document.querySelectorAll('.checker');

  editarBtn.addEventListener('click', () => {
    inputs.forEach(i => i.disabled = !i.disabled);

    checkers.forEach(ch => {
      if (ch.classList.contains('checker-disabled')) {
        ch.classList.remove('checker-disabled');
        ch.style.pointerEvents = '';
        ch.style.opacity = '';
      } else {
        ch.classList.add('checker-disabled');
        ch.style.pointerEvents = 'none';
        ch.style.opacity = '0.5';
      }
    });
  });

  // =========================
  // CHECKERS HEXAGONAIS (TAMANHO)
  // =========================
  const atributosPorTamanho = {
    pequeno: {forca:2, saber:3, casca:3, graca:4, vida:6},
    medio: {forca:3, saber:3, casca:3, graca:3, vida:7},
    grande: {forca:4, saber:3, casca:4, graca:2, vida:8}
  };

  checkers.forEach(ch => {
    ch.classList.add('checker-disabled');
    ch.style.pointerEvents = 'none';
    ch.style.opacity = '0.5';
    ch.addEventListener('click', () => {
      checkers.forEach(c => c.classList.remove('selected'));
      ch.classList.add('selected');

      const tamanho = ch.dataset.tamanho;
      const valores = atributosPorTamanho[tamanho];
      inputs[0].value = valores.forca;
      inputs[1].value = valores.graca;
      inputs[2].value = valores.casca;
      inputs[3].value = valores.saber;

      atualizarVidaMax(valores.vida);
    });
  });

  // =========================
  // CARREGA O TAMANHO DO PERSONAGEM
  // =========================
  const personagens = JSON.parse(localStorage.getItem('portal_personagens')) || [];
  const nomeSelecionado = localStorage.getItem('portal_personagemSelecionado');

  if(nomeSelecionado){
    const p = personagens.find(x=>x.nome===nomeSelecionado);
    if(p && p.tamanho){
      const tamanhoMap = { "pequeno":"pequeno", "médio":"medio", "medio":"medio", "grande":"grande" };
      const pTamanho = tamanhoMap[p.tamanho.toLowerCase()] || "medio";

      checkers.forEach(ch => {
        if(ch.dataset.tamanho === pTamanho){
          ch.click();
        }
      });
    }
  }

  // =========================
  // INVENTÁRIO (ITENS SOBRE SLOTS COM TOOLTIP POR CATEGORIA)
  // =========================
  function renderizarInventario() {
    const itensSalvos = JSON.parse(localStorage.getItem('inventario') || '[]');

    // Pega todos os grids de inventário na ordem que aparecem
    const grids = colInventario.querySelectorAll('.grid-inventario');

    // Mapeamento ordem → categoria
    const categorias = {
      swp: grids[0].querySelectorAll('.slot'), // SecWeap
      eqp: grids[1].querySelectorAll('.slot'), // Equip
      acc: grids[2].querySelectorAll('.slot'), // Acessórios
      oth: grids[3].querySelectorAll('.slot')  // Outros
    };

    // Limpa slots e tooltips antigos
    Object.values(categorias).forEach(lista => {
      lista.forEach(s => {
        s.innerHTML = "";
        delete s.dataset.ocupado;
      });
    });
    document.querySelectorAll('#colInventario .itemTooltip').forEach(t => t.remove());

    itensSalvos.forEach(item => {
      let categoria = 'oth';
      if (item.descricao.includes('[swp]')) categoria = 'swp';
      else if (item.descricao.includes('[acc]')) categoria = 'acc';
      else if (item.descricao.includes('[eqp]')) categoria = 'eqp';
      else if (item.descricao.includes('[oth]')) categoria = 'oth';

      const slots = categorias[categoria];
      const slot = Array.from(slots).find(s => !s.dataset.ocupado);
      if (!slot) return;

      slot.dataset.ocupado = 'true';

      const img = document.createElement('img');
      img.src = item.imagem;
      img.alt = item.nome;
      img.className = 'movableItem';
      img.style.zIndex = 90;

      // Cria tooltip
      const tooltip = document.createElement('div');
      tooltip.className = 'itemTooltip';
      tooltip.innerHTML = `<strong>${item.nome}</strong><br>${item.descricao}`;
      tooltip.style.position = 'fixed';
      tooltip.style.background = 'rgba(0,0,0,0.8)';
      tooltip.style.color = '#fff';
      tooltip.style.padding = '5px 8px';
      tooltip.style.borderRadius = '4px';
      tooltip.style.fontSize = '0.8em';
      tooltip.style.pointerEvents = 'none';
      tooltip.style.opacity = '0';
      tooltip.style.transition = 'opacity 0.2s';
      tooltip.style.zIndex = 10000;
      document.body.appendChild(tooltip);

      img.addEventListener('mouseenter', (e) => {
        tooltip.style.opacity = '1';
        tooltip.style.left = e.clientX + 10 + 'px';
        tooltip.style.top = e.clientY + 10 + 'px';
      });
      img.addEventListener('mousemove', (e) => {
        tooltip.style.left = e.clientX + 10 + 'px';
        tooltip.style.top = e.clientY + 10 + 'px';
      });
      img.addEventListener('mouseleave', () => {
        tooltip.style.opacity = '0';
      });

      slot.appendChild(img); // coloca direto dentro do slot
    });
  }

  renderizarInventario();

});
