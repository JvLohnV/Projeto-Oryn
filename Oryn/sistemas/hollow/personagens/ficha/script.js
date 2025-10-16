window.onload = function() {
  // --- Radar Chart ---
  const ctx = document.getElementById('statusChart')?.getContext('2d');
  let statusChart = null;

  if (ctx) {
    const initialData = [
      parseInt(document.querySelector('input[value="3"]')?.value) || 0,
      parseInt(document.querySelector('input[value="5"]')?.value) || 0,
      parseInt(document.querySelector('input[value="2"]')?.value) || 0,
      parseInt(document.querySelector('input[value="7"]')?.value) || 0
    ];

    statusChart = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: ['Força', 'Graça', 'Casca', 'Saber'],
        datasets: [{
          data: initialData,
          backgroundColor: 'rgba(155,188,212,0.3)',
          borderColor: '#9bbcd4',
          borderWidth: 2,
          pointBackgroundColor: '#9bbcd4'
        }]
      },
      options: {
        scales: {
          r: {
            angleLines: { color: '#333' },
            grid: { color: '#444' },
            pointLabels: { color: '#ddd', font: { size: 12 } },
            min: 0,
            max: 10,
            ticks: { stepSize: 2, display: false }
          }
        },
        plugins: { legend: { display: false } }
      }
    });

    // Atualiza gráfico ao mudar inputs
    const inputs = document.querySelectorAll('.status-item input');
    inputs.forEach((input, index) => {
      input.addEventListener('input', () => {
        statusChart.data.datasets[0].data[index] = parseInt(input.value) || 0;
        statusChart.update();
      });
    });
  }

  // --- Notches (exceto notch7) ---
  const notches = document.querySelectorAll(".notch:not(#notch7)");
  const notch7 = document.getElementById('notch7');

  notches.forEach((notch, i) => {
    let state = 0;
    const index = i + 1;

    if (index === 1) { notch.src = "swp.png"; state = 1; }
    else if (index === 2) { notch.src = "eqp.png"; state = 1; }
    else if (index === 6) { notch.src = "acc.png"; state = 1; }

    notch.addEventListener("click", () => {
      if (index === 1) {
        state = (state + 1) % 2;
        notch.src = state === 0 ? "notch.png" : "swp.png";
        notch.style.transform = "translate(-50%, -50%)";
      } else if (index === 4) {
        state = (state + 1) % 2;
        notch.src = state === 0 ? "notch.png" : "swp.png";
        notch.style.transform = state === 0 ? "translate(-50%, -50%)" : "translate(-50%, -50%) scaleY(-1)";
      } else if (index === 2 || index === 3) {
        state = (state + 1) % 2;
        notch.src = state === 0 ? "notch.png" : "eqp.png";
        notch.style.transform = "translate(-50%, -50%)";
      } else if (index === 5 || index === 6) {
        state = (state + 1) % 2;
        notch.src = state === 0 ? "notch.png" : "acc.png";
        notch.style.transform = "translate(-50%, -50%)";
      }
    });
  });

  // --- Trocar notch7 ao clicar em skill ---
  if (notch7) {
    const skillSlots = document.querySelectorAll('.skills-grid .skill-slot');
    skillSlots.forEach(slot => {
      slot.addEventListener('click', () => {
        const img = slot.querySelector('img');
        if (!img) return;
        notch7.src = img.src;
        notch7.style.transform = "translate(-50%, -50%)";
      });
    });
  }

  // --- Checkers (tamanho) e Barra de vida dinâmica ---
  const checkers = document.querySelectorAll('.checker');
  const maskRow = document.getElementById('maskRow');

  const sizeConfig = {
    small: 6,
    medium: 7,
    large: 8
  };

  // renderiza N máscaras (substitui conteúdo)
  function renderMasks(count) {
    maskRow.innerHTML = "";
    for (let i = 0; i < count; i++) {
      const img = document.createElement("img");
      img.className = "life-mask";
      img.dataset.index = i;
      img.dataset.full = "true";
      img.src = "Mask Full.png";
      img.alt = "mask";
      maskRow.appendChild(img);
    }
    checkSingleMaskEffect();
  }

  // atualizar atributos conforme tamanho
  function updateAttributes(size) {
    const inputs = document.querySelectorAll('.status-item input');

    let values;
    if (size === "small") {
      values = [2, 4, 3, 3];
    } else if (size === "medium") {
      values = [3, 3, 3, 3];
    } else if (size === "large") {
      values = [4, 2, 4, 2];
    }

    inputs.forEach((input, i) => {
      input.value = values[i] || 0;
      input.dispatchEvent(new Event("input")); // força atualizar radar
    });
  }

  // clique nos checkers
  checkers.forEach(c => {
    c.addEventListener('click', () => {
      checkers.forEach(ch => ch.classList.remove('active'));
      c.classList.add('active');

      const size = c.dataset.size || 'small';
      const count = sizeConfig[size] || 6;
      renderMasks(count);
      updateAttributes(size);
    });
  });

  // inicia em "pequeno"
  if (checkers.length > 0) {
    checkers[0].classList.add('active');
    renderMasks(sizeConfig.small);
    updateAttributes("small");
  }

  // --- Botão adicionar máscara temporária ---
  const addBtn = document.getElementById('addTempMask');
  if (addBtn) {
    addBtn.addEventListener('click', (e) => {
      e.preventDefault();
      addTempMask();
    });
  }

  function addTempMask() {
    const img = document.createElement('img');
    img.className = 'life-mask temp';
    img.dataset.index = maskRow.children.length;
    img.dataset.full = "true";
    img.dataset.temp = "true"; 
    img.src = 'Mask Full.png';
    img.alt = 'mask temp';

    maskRow.appendChild(img);
    checkSingleMaskEffect();
  }

  // --- Partículas & efeitos ---
  let particleInterval;

  function spawnParticlesContinuously(mask) {
    if (particleInterval) clearInterval(particleInterval);

    particleInterval = setInterval(() => {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = (mask.offsetLeft + Math.random() * mask.offsetWidth) + 'px';
      particle.style.top = (mask.offsetTop + Math.random() * mask.offsetHeight) + 'px';
      maskRow.appendChild(particle);

      setTimeout(() => particle.remove(), 800);
    }, 150);
  }

  function checkSingleMaskEffect() {
    const masks = Array.from(document.querySelectorAll('#maskRow .life-mask'));
    const fullMasks = masks.filter(m => m.dataset.full === "true");

    masks.forEach(m => m.classList.remove('shake'));

    if (fullMasks.length === 1) {
      const mask = fullMasks[0];
      mask.classList.add('shake');
      spawnParticlesContinuously(mask);
    } else {
      if (particleInterval) {
        clearInterval(particleInterval);
        particleInterval = null;
      }
    }
  }

  // --- clique nas máscaras ---
  document.addEventListener('click', (ev) => {
    const clicked = ev.target.closest('.life-mask');
    if (!clicked) return;

    const idx = Number(clicked.dataset.index);
    const masks = Array.from(maskRow.querySelectorAll('.life-mask'));
    const isFull = clicked.dataset.full === "true";

    // Máscara temporária
    if (clicked.dataset.temp === "true") {
      if (isFull) {
        // gasta e remove de vez
        clicked.remove();
      }
      return;
    }

    // Máscaras normais
    if (isFull) {
      masks.forEach((m, i) => {
        if (i <= idx) {
          m.dataset.full = "true";
          m.src = "Mask Full.png";
        } else {
          m.dataset.full = "false";
          m.src = "Mask.png";
        }
      });
    } else {
      masks.forEach((m, i) => {
        if (i <= idx) {
          m.dataset.full = "true";
          m.src = "Mask Full.png";
        }
      });
    }

    checkSingleMaskEffect();
  });
};
