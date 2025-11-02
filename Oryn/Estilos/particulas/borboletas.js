(() => {
  const canvas = document.getElementById('bgParticles');
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const butterflyPaths = [
    '/Oryn/Estilos/particulas/imgs/borboleta1.png',
    '/Oryn/Estilos/particulas/imgs/borboleta2.png',
    '/Oryn/Estilos/particulas/imgs/borboleta3.png'
  ];

  // Função que carrega todas as imagens e só resolve quando todas estiverem prontas
  function loadImages(paths) {
    return Promise.all(paths.map(src => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve(img);
        img.onerror = () => {
          console.error(`Erro ao carregar imagem: ${src}`);
          resolve(null); // não trava a animação se uma imagem falhar
        };
      });
    }));
  }

  class Butterfly {
    constructor(images) {
      this.images = images.filter(Boolean); // remove nulos
      this.image = this.images[Math.floor(Math.random() * this.images.length)];
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 30 + 25;
      this.vx = (Math.random() - 0.5) * 2;
      this.vy = (Math.random() - 0.5) * 2;
      this.angle = 0;
      this.flap = Math.random() * Math.PI * 2;
      this.flapSpeed = 0.25 + Math.random() * 0.15;
      this.maxSpeed = 2.5;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < -this.size) this.x = canvas.width + this.size;
      if (this.x > canvas.width + this.size) this.x = -this.size;
      if (this.y < -this.size) this.y = canvas.height + this.size;
      if (this.y > canvas.height + this.size) this.y = -this.size;

      this.vx += (Math.random() - 0.5) * 0.05;
      this.vy += (Math.random() - 0.5) * 0.05;

      const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      if (speed > this.maxSpeed) {
        this.vx *= this.maxSpeed / speed;
        this.vy *= this.maxSpeed / speed;
      }

      this.angle = Math.atan2(this.vy, this.vx);
      this.flap += this.flapSpeed;
    }

    draw() {
      if (!this.image || !this.image.complete || this.image.naturalWidth === 0) return;

      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      const flapScale = 1 + Math.sin(this.flap) * 0.25;
      ctx.scale(1, flapScale);
      ctx.drawImage(this.image, -this.size / 2, -this.size / 2, this.size, this.size);
      ctx.restore();
    }
  }

  // Só começa a animação após as imagens carregarem
  loadImages(butterflyPaths).then(images => {
    const butterflies = Array.from({ length: 25 }, () => new Butterfly(images));

    (function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      butterflies.forEach(b => { b.update(); b.draw(); });
      window.animationFrame = requestAnimationFrame(animate);
    })();
  });

  // Função global para parar
  window.stopParticles = function () {
    if (window.animationFrame) cancelAnimationFrame(window.animationFrame);
  };
})();
