/* --- Canvas e grid isométrico --- */
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let w = window.innerWidth, h = window.innerHeight;
canvas.width = w; canvas.height = h;

let cam = { x: 0, y: 0, scale: 1 }, panning = false, last = {};

window.addEventListener('resize', () => { 
    w = window.innerWidth; 
    h = window.innerHeight; 
    canvas.width = w; 
    canvas.height = h; 
    fogCanvas.width = w;
    fogCanvas.height = h;
    resetFog();
    draw(); 
});

let tileWidth = 80, tileHeight = 40, opacity = 0.3;

/* --- Instâncias do canvas --- */
let instances = [];
let draggingInstance = null, dragOffset = {x:0, y:0};

/* --- Sistema de desenho --- */
let drawings = [];          
let currentPath = null;     
let drawingActive = false;  
let drawColor = "#ff0";     
let drawWidth = 3;          

/* --- Sistema da régua --- */
let rulerActive = false;
let rulerStart = null;
let rulerEnd = null;

/* --- Fog of War --- */
let fogEnabled = false;
let fogOpacity = 1.0;
let fogCanvas = document.createElement("canvas");
let fogCtx = fogCanvas.getContext("2d");
fogCanvas.width = w;
fogCanvas.height = h;

function resetFog() {
  fogCtx.fillStyle = "black";
  fogCtx.fillRect(0, 0, fogCanvas.width, fogCanvas.height);
}
resetFog();

/* --- Pointer compartilhado --- */
let pointers = [];
let myPointerId = "player1"; 

function updateMyPointer(x, y) {
    let p = pointers.find(p => p.id === myPointerId);
    if (!p) {
        p = { id: myPointerId, trail: [], active: false };
        pointers.push(p);
    }
    if (p.active) {
        p.trail.push({ x, y });
        if (p.trail.length > 10) p.trail.shift();
    }
}

function clearMyPointer() {
    const p = pointers.find(p => p.id === myPointerId);
    if (p) {
        p.trail = [];
        p.active = false;
    }
}

/* --- Mouse events --- */
canvas.addEventListener('mousedown', e => {
    if (e.button === 2 && currentTool === "draw") return; 

    const mx = (e.clientX - w/2) / cam.scale - cam.x;
    const my = (e.clientY - h/2) / cam.scale - cam.y;

    if (currentTool === "draw" && e.button === 0) {
        drawingActive = true;
        currentPath = [{x: mx, y: my, color: drawColor, width: drawWidth}];
        drawings.push(currentPath);
        return;
    }

    if (currentTool === "ruler" && e.button === 0) {
        rulerActive = true;
        rulerStart = { x: mx, y: my };
        rulerEnd = { x: mx, y: my };
        return;
    }

    if (currentTool === "pointer" && e.button === 0) {
        let p = pointers.find(p => p.id === myPointerId);
        if (!p) {
            p = { id: myPointerId, trail: [], active: true };
            pointers.push(p);
        }
        p.active = true;
        draw();
        return;
    }

    for(let i=instances.length-1;i>=0;i--){
        const obj = instances[i];
        const size = obj.scale;
        const localX = (mx - obj.worldX) / size + obj.width/2;
        const localY = (my - obj.worldY) / size + obj.height/2;

        if(localX>=0 && localX<obj.width && localY>=0 && localY<obj.height){
            const index = (Math.floor(localY)*obj.width + Math.floor(localX))*4 + 3;
            const alpha = obj.maskData?.data[index] || 0;
            if(alpha>0){
                draggingInstance = obj;
                dragOffset.x = mx - obj.worldX;
                dragOffset.y = my - obj.worldY;
                return;
            }
        }
    }

    if (currentTool === "hand") {
        panning = true;
        last = {x:e.clientX, y:e.clientY};
    }
});

canvas.addEventListener('mouseup', e => { 
    draggingInstance = null; 
    panning = false; 
    if (drawingActive) {
        drawingActive = false;
        currentPath = null;
    }
    if (currentTool === "ruler" && rulerActive) {
        rulerActive = false;
        rulerStart = null;
        rulerEnd = null;
        draw();
    }
    if (currentTool === "pointer") {
        clearMyPointer();
        draw();
    }
});

canvas.addEventListener('mouseleave', ()=>{ 
    draggingInstance = null; 
    panning = false; 
    drawingActive = false; 
    currentPath = null; 
    rulerActive = false;
    clearMyPointer();
});

canvas.addEventListener('mousemove', e => {
    const mx = (e.clientX - w/2) / cam.scale - cam.x;
    const my = (e.clientY - h/2) / cam.scale - cam.y;

    if (draggingInstance){
        draggingInstance.worldX = mx - dragOffset.x;
        draggingInstance.worldY = my - dragOffset.y;
        draw();
    } else if (panning){
        cam.x += (e.clientX - last.x)/cam.scale;
        cam.y += (e.clientY - last.y)/cam.scale;
        last = {x:e.clientX, y:e.clientY};
        draw();
    } else if (drawingActive && currentTool === "draw") {
        currentPath.push({x: mx, y: my, color: drawColor, width: drawWidth});
        draw();
    } else if (currentTool === "ruler" && rulerActive) {
        rulerEnd = { x: mx, y: my };
        draw();
    } else if (currentTool === "pointer") {
        let p = pointers.find(p => p.id === myPointerId);
        if (p && p.active) {
            updateMyPointer(mx, my);
            draw();
        }
    }
});

/* --- Menu flutuante de desenho --- */
const drawMenu = document.createElement("div");
drawMenu.id = "drawMenu";
drawMenu.innerHTML = `
  <div class="field">
    <label>Espessura</label>
    <input type="range" id="drawWidthInput" min="1" max="20" value="3">
  </div>
  <div class="field">
    <label>Cor</label>
    <input type="color" id="drawColorInput" value="#ffff00">
  </div>
`;
drawMenu.style.display = "none";
document.body.appendChild(drawMenu);

const drawWidthInput = drawMenu.querySelector("#drawWidthInput");
const drawColorInput = drawMenu.querySelector("#drawColorInput");

drawWidthInput.addEventListener("input", () => { drawWidth = parseInt(drawWidthInput.value,10); });
drawColorInput.addEventListener("input", () => { drawColor = drawColorInput.value; });

canvas.addEventListener("contextmenu", e => {
    if (currentTool === "draw") {
        e.preventDefault();
        drawMenu.style.left = e.clientX + "px";
        drawMenu.style.top = e.clientY + "px";
        drawMenu.style.display = "flex";
    }
});

document.addEventListener("click", e => {
    if (drawMenu.style.display === "flex" && !drawMenu.contains(e.target) && e.button === 0) {
        drawMenu.style.display = "none";
    }
});

canvas.addEventListener('wheel', e => { 
    e.preventDefault(); 
    if(draggingInstance){
        if(e.shiftKey){
            const factor = e.deltaY < 0 ? 1.05 : 0.95;
            draggingInstance.scale *= factor;
        } else {
            draggingInstance.rotation += e.deltaY < 0 ? -5 : 5;
        }
        draw();
    } else {
        const f = 1.1; 
        cam.scale *= e.deltaY < 0 ? f : 1/f; 
        draw();
    }
});

/* --- Draw functions --- */
function drawIso(){
    const w2 = tileWidth/2, h2 = tileHeight/2;
    const cols = Math.ceil(w/(w2*cam.scale))+4;
    const rows = Math.ceil(h/(h2*cam.scale))+4;
    ctx.strokeStyle = `rgba(255,255,255,${opacity})`;
    ctx.lineWidth = 1;
    for(let r=-rows; r<rows; r++){
        for(let c=-cols; c<cols; c++){
            const worldX = (c-r)*w2, worldY = (c+r)*h2;
            const x = w/2 + (worldX+cam.x)*cam.scale;
            const y = h/2 + (worldY+cam.y)*cam.scale;
            ctx.beginPath();
            ctx.moveTo(x, y-h2*cam.scale);
            ctx.lineTo(x + w2*cam.scale, y);
            ctx.lineTo(x, y+h2*cam.scale);
            ctx.lineTo(x - w2*cam.scale, y);
            ctx.closePath();
            ctx.stroke();
        }
    }
}

function draw(){
    ctx.fillStyle="#111";
    ctx.fillRect(0,0,w,h);
    drawIso();

    // instâncias
    const sorted = [...instances].sort((a,b)=>{
        if(a.cat==="mapas" || a.cat==="cenas") return -1;
        if(b.cat==="mapas" || b.cat==="cenas") return 1;
        return (a.worldY + a.height/2) - (b.worldY + b.height/2);
    });

    sorted.forEach(obj=>{
        if(!obj.visible) return;
        if(obj.cat === "docs") return;

        const x = w/2 + (obj.worldX + cam.x) * cam.scale;
        const y = h/2 + (obj.worldY + cam.y) * cam.scale;
        const size = obj.scale * cam.scale;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(obj.rotation * Math.PI/180);
        ctx.drawImage(obj.img, -obj.width/2 * size, -obj.height/2 * size, obj.width * size, obj.height * size);
        ctx.restore();

        if(obj.defaultText && obj.defaultText !== "None"){
            ctx.fillStyle="#fff";
            ctx.font = `${obj.fontSize}px ${obj.fontFamily}`;
            ctx.textAlign="center";
            ctx.fillText(obj.defaultText, x, y);
        }
    });

    // desenhos
    drawings.forEach(path => {
        if (path.length < 2) return;
        ctx.beginPath();
        path.forEach((p,i) => {
            const x = w/2 + (p.x + cam.x) * cam.scale;
            const y = h/2 + (p.y + cam.y) * cam.scale;
            if (i === 0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
        });
        ctx.strokeStyle = path[0].color;
        ctx.lineWidth = path[0].width;
        ctx.stroke();
    });

    // régua
    if (rulerStart && rulerEnd) {
        const x1 = w/2 + (rulerStart.x + cam.x) * cam.scale;
        const y1 = h/2 + (rulerStart.y + cam.y) * cam.scale;
        const x2 = w/2 + (rulerEnd.x + cam.x) * cam.scale;
        const y2 = h/2 + (rulerEnd.y + cam.y) * cam.scale;

        ctx.strokeStyle = "#0ff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        const dx = (rulerEnd.x - rulerStart.x) / tileWidth;
        const dy = (rulerEnd.y - rulerStart.y) / tileHeight;
        const dist = Math.round(Math.sqrt(dx*dx + dy*dy));

        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        ctx.fillStyle = "#0ff";
        ctx.font = "16px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`${dist} tiles`, midX, midY - 10);
    }

    // fog
    if (fogEnabled) {
        ctx.globalAlpha = fogOpacity;
        ctx.drawImage(fogCanvas, 0, 0);
        ctx.globalAlpha = 1.0;

        instances.filter(obj => obj.cat === "docs").forEach(obj => {
            const x = w/2 + (obj.worldX + cam.x) * cam.scale;
            const y = h/2 + (obj.worldY + cam.y) * cam.scale;
            const size = obj.scale * cam.scale;
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(obj.rotation * Math.PI/180);
            ctx.drawImage(obj.img, -obj.width/2 * size, -obj.height/2 * size, obj.width * size, obj.height * size);
            ctx.restore();
        });
    }

    // pointers
    if (pointers.length > 0) {
        ctx.save();
        pointers.forEach(p => {
            if (!p.active || p.trail.length === 0) return;

            ctx.strokeStyle = "rgba(255,0,0,0.7)";
            ctx.fillStyle = "rgba(255,0,0,0.9)";
            ctx.lineWidth = 4;

            for (let i = 0; i < p.trail.length; i++) {
                const point = p.trail[i];
                const x = w/2 + (point.x + cam.x) * cam.scale;
                const y = h/2 + (point.y + cam.y) * cam.scale;

                if (i === p.trail.length - 1) {
                    ctx.beginPath();
                    ctx.arc(x, y, 10, 0, Math.PI*2);
                    ctx.fill();
                }

                if (i > 0) {
                    const prev = p.trail[i-1];
                    const px = w/2 + (prev.x + cam.x) * cam.scale;
                    const py = h/2 + (prev.y + cam.y) * cam.scale;

                    ctx.beginPath();
                    ctx.moveTo(px, py);
                    ctx.lineTo(x, y);
                    ctx.stroke();
                }
            }
        });
        ctx.restore();
    }
}

function getSizeScale(option){
    switch(option){
        case "Small": return 0.3;
        case "Medium": return 0.5;
        case "Large": return 0.8;
        default: return 0.5;
    }
}

draw();

/* --- Submenu Fog --- */
const fogMenu = document.createElement("div");
fogMenu.id = "fogMenu";
fogMenu.style.position = "fixed";
fogMenu.style.background = "#1e1e2f";
fogMenu.style.padding = "14px";
fogMenu.style.borderRadius = "10px";
fogMenu.style.display = "none";
fogMenu.style.flexDirection = "column";
fogMenu.style.gap = "12px";
fogMenu.style.zIndex = 30;
fogMenu.style.boxShadow = "0 4px 20px rgba(0,0,0,0.6)";
fogMenu.innerHTML = `
  <div class="field">
    <label>Fog Ativo</label>
    <button id="toggleFog" class="switch"><i data-lucide="cloud"></i></button>
  </div>
  <div class="field">
    <label>Visão Mestre</label>
    <button id="toggleMaster" class="switch"><i data-lucide="eye"></i></button>
  </div>
`;
document.body.appendChild(fogMenu);

const toggleFog = fogMenu.querySelector("#toggleFog");
const toggleMaster = fogMenu.querySelector("#toggleMaster");

toggleFog.addEventListener("click", () => {
  fogEnabled = !fogEnabled;
  toggleFog.classList.toggle("active", fogEnabled);
  draw();
});

toggleMaster.addEventListener("click", () => {
  fogOpacity = (fogOpacity === 1.0) ? 0.4 : 1.0;
  toggleMaster.classList.toggle("active", fogOpacity === 0.4);
  draw();
});

lucide.createIcons();

/* --- Menu expandível --- */
const submenu = document.getElementById("submenu"),
      bottomBar = document.getElementById("bottomBar");
let activeCat = null;
const items = {cenas:[],mapas:[],props:[],tokens:[],attachments:[],docs:[]};

bottomBar.querySelectorAll("img").forEach(icon=>{
    icon.addEventListener("click",()=>{
        const cat = icon.dataset.cat;
        if(activeCat === cat){
            submenu.classList.remove("open");
            activeCat = null;
        } else {
            submenu.innerHTML = "";
            items[cat].forEach(src=>{
                const img = document.createElement("img");
                img.src = src;
                img.draggable = true;
                submenu.appendChild(img);

                img.addEventListener("dragstart", e=>{
                    e.dataTransfer.setData("text/plain", JSON.stringify({src,cat}));
                });
            });
            submenu.classList.add("open");
            activeCat = cat;
        }
    });
});

/* --- Canvas Drop --- */
canvas.addEventListener("dragover", e => e.preventDefault());

canvas.addEventListener("drop", e => {
    e.preventDefault();
    const data = e.dataTransfer.getData("text/plain");
    if(!data) return;
    const {src,cat} = JSON.parse(data);

    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left - w/2) / cam.scale - cam.x;
    const my = (e.clientY - rect.top - h/2) / cam.scale - cam.y;

    const img = new Image();
    img.src = src;
    img.onload = ()=>{
        const maskCanvas = document.createElement("canvas");
        maskCanvas.width = img.width;
        maskCanvas.height = img.height;
        const maskCtx = maskCanvas.getContext("2d");
        maskCtx.drawImage(img,0,0);
        const maskData = maskCtx.getImageData(0,0,img.width,img.height);

        instances.push({
            img,
            width: img.width,
            height: img.height,
            worldX: mx,
            worldY: my,
            scale: getSizeScale(sizeSelect.value),
            rotation: parseFloat(rotationInput.value)||0,
            visible: document.querySelector("#visibleToggle .active").dataset.value === "true",
            locked: document.querySelector("#lockedToggle .active").dataset.value === "true",
            fontSize: parseInt(fontSizeInput.value,10),
            fontFamily: fontFamilySelect.value,
            defaultText: defaultTextSelect.value,
            cat,
            maskData
        });
        draw();
    };
});

/* --- Modal lógica --- */
const modalOverlay = document.getElementById("modalOverlay"),
      addButton = document.getElementById("addButton"),
      closeBtn = document.getElementById("closeBtn"),
      assetsGrid = document.getElementById("assetsGrid"),
      tabs = document.querySelectorAll(".tabs button"),
      modalNew = document.getElementById("modalNew"),
      modalAdd = document.getElementById("modalAdd"),
      openAddModal = document.getElementById("openAddModal"),
      closeAddBtn = document.getElementById("closeAddBtn");

addButton.addEventListener("click", ()=>{
    modalOverlay.style.display="flex";
    const catToOpen = activeCat || "cenas";
    loadAssets(catToOpen);
    activeCat = catToOpen;
    tabs.forEach(b=>b.classList.remove("active"));
    const tabBtn = [...tabs].find(b=>b.dataset.cat===catToOpen);
    if(tabBtn) tabBtn.classList.add("active");
});

function closeModal(){ modalOverlay.style.display="none"; }
modalOverlay.addEventListener("click", e => { if(e.target === modalOverlay) closeModal(); });
closeBtn.addEventListener("click", closeModal);

/* --- Load Assets --- */
function loadAssets(cat){
    assetsGrid.innerHTML = "";
    if(items[cat].length === 0) return;

    items[cat].forEach(src=>{
        const div = document.createElement("div");
        div.className = "asset";
        div.innerHTML = `<img src="${src}">`;
        assetsGrid.appendChild(div);

        div.addEventListener("click", ()=>{
            console.log("Asset selecionado:", src);
        });
    });
}

tabs.forEach(btn=>{
    btn.addEventListener("click", ()=>{
        tabs.forEach(b=>b.classList.remove("active"));
        btn.classList.add("active");
        activeCat = btn.dataset.cat;
        loadAssets(activeCat);
    });
});

/* --- Right menu toggle --- */
const rightMenuToggle = document.getElementById("rightMenuToggle");
const rightMenu = document.getElementById("rightMenu");
let currentTool = null; 

rightMenuToggle.addEventListener("click", () => {
  rightMenu.classList.toggle("open");
});

/* --- Tool buttons logic --- */
const toolButtons = rightMenu.querySelectorAll("button");

if (toolButtons.length > 0) {
  toolButtons[0].classList.add("active");
  currentTool = toolButtons[0].dataset.tool;
  console.log("Ferramenta padrão ativa:", currentTool);
}

toolButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    toolButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentTool = btn.dataset.tool;
    console.log("Ferramenta ativa:", currentTool);

    drawMenu.style.display = "none";
    fogMenu.style.display = "none";

    if (currentTool === "draw") {
      drawMenu.style.left = (btn.getBoundingClientRect().left - 160) + "px";
      drawMenu.style.top = (btn.getBoundingClientRect().top) + "px";
      drawMenu.style.display = "flex";
    }

    if (currentTool === "fog") {
      fogMenu.style.left = (btn.getBoundingClientRect().left - 160) + "px";
      fogMenu.style.top = (btn.getBoundingClientRect().top) + "px";
      fogMenu.style.display = "flex";
      lucide.createIcons();
    }
  });
});

/* --- Add modal toggle --- */
openAddModal.addEventListener("click", ()=>{
    modalNew.style.display="none";
    modalAdd.style.display="flex";
});
closeAddBtn.addEventListener("click", ()=>{
    modalAdd.style.display="none";
    modalNew.style.display="flex";
});

/* --- Upload handling --- */
const fileInput = document.getElementById("fileInput"),
      uploadLink = document.getElementById("uploadLink"),
      uploadBox = document.getElementById("uploadBox"),
      previewImg = document.getElementById("previewImg");
let uploadedData = null;

uploadLink.addEventListener("click", ()=>fileInput.click());
fileInput.addEventListener("change", handleFile);
uploadBox.addEventListener("dragover", e => e.preventDefault());
uploadBox.addEventListener("drop", e => {
    e.preventDefault();
    fileInput.files = e.dataTransfer.files;
    handleFile();
});

function handleFile(){
    const file = fileInput.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = e => {
        uploadedData = e.target.result;
        previewImg.src = uploadedData;
        previewImg.style.display = "block";
    };
    reader.readAsDataURL(file);
}

/* --- Sidebar toggles --- */
function initToggle(id){
    const toggle = document.getElementById(id);
    toggle.querySelectorAll("button").forEach(btn=>{
        btn.addEventListener("click", ()=>{
            toggle.querySelectorAll("button").forEach(b=>b.classList.remove("active"));
            btn.classList.add("active");
        });
    });
}
initToggle("visibleToggle");
initToggle("lockedToggle");

/* --- Import --- */
const importBtn = document.getElementById("importBtn"),
      sizeSelect = document.getElementById("sizeSelect"),
      rotationInput = document.getElementById("rotationInput"),
      fontSizeInput = document.getElementById("fontSizeInput"),
      fontFamilySelect = document.getElementById("fontFamilySelect"),
      defaultTextSelect = document.getElementById("defaultTextSelect");

importBtn.addEventListener("click", ()=>{
    if(!uploadedData) return;

    items[activeCat].push(uploadedData);
    loadAssets(activeCat);

    modalAdd.style.display = "none";
    modalNew.style.display = "flex";

    previewImg.style.display = "none";
    uploadedData = null;
    fileInput.value = "";
});
/* --- Menus de instância --- */
const instanceMenuLeft = document.createElement("div");
instanceMenuLeft.id = "instanceMenuLeft";
Object.assign(instanceMenuLeft.style, {
  position: "fixed",
  display: "none",
  flexDirection: "column",
  gap: "8px",
  background: "#1e1e2f",
  padding: "8px",
  borderRadius: "8px",
  boxShadow: "0 4px 20px rgba(0,0,0,0.6)",
  zIndex: 2000
});
instanceMenuLeft.innerHTML = `
  <button title="Copiar">📋</button>
  <button title="Attach">🔗</button>
  <button title="Trocar imagem">🖼</button>
`;
document.body.appendChild(instanceMenuLeft);

const instanceMenuBottom = document.createElement("div");
instanceMenuBottom.id = "instanceMenuBottom";
Object.assign(instanceMenuBottom.style, {
  position: "fixed",
  display: "none",
  flexDirection: "row",
  gap: "8px",
  background: "#1e1e2f",
  padding: "8px",
  borderRadius: "8px",
  boxShadow: "0 4px 20px rgba(0,0,0,0.6)",
  zIndex: 2000
});
instanceMenuBottom.innerHTML = `
  <button title="Hide">👁</button>
  <button title="Lock">🔒</button>
  <button title="Duplicar">⧉</button>
  <button title="Deletar">🗑</button>
`;
document.body.appendChild(instanceMenuBottom);

// estilizar todos botões
[...instanceMenuLeft.querySelectorAll("button"), ...instanceMenuBottom.querySelectorAll("button")].forEach(btn=>{
  Object.assign(btn.style, {
    background: "#2b2b3c",
    border: "none",
    color: "#fff",
    width: "36px",
    height: "36px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "18px"
  });
  btn.addEventListener("mouseenter", ()=> btn.style.background = "#444");
  btn.addEventListener("mouseleave", ()=> btn.style.background = "#2b2b3c");
});

/* --- Lógica de clique em instâncias --- */
let selectedInstance = null;

// Função utilitária para achar instância clicada
function pickInstance(mx, my){
  for (let i = instances.length-1; i>=0; i--) {
    const obj = instances[i];
    const size = obj.scale;
    const localX = (mx - obj.worldX) / size + obj.width/2;
    const localY = (my - obj.worldY) / size + obj.height/2;

    if(localX>=0 && localX<obj.width && localY>=0 && localY<obj.height){
      const index = (Math.floor(localY)*obj.width + Math.floor(localX))*4 + 3;
      const alpha = obj.maskData?.data[index] || 0;
      if(alpha>0){
        return obj;
      }
    }
  }
  return null;
}

/* --- Clique direito: menu lateral ao lado da instância --- */
canvas.addEventListener("contextmenu", e => {
  e.preventDefault();

  const mx = (e.clientX - w/2) / cam.scale - cam.x;
  const my = (e.clientY - h/2) / cam.scale - cam.y;
  selectedInstance = pickInstance(mx, my);

  if (selectedInstance) {
    const screenX = w/2 + (selectedInstance.worldX + cam.x) * cam.scale;
    const screenY = h/2 + (selectedInstance.worldY + cam.y) * cam.scale;

    instanceMenuLeft.style.left = (screenX + (selectedInstance.width * selectedInstance.scale * cam.scale / 2) + 15) + "px";
    instanceMenuLeft.style.top = (screenY) + "px";
    instanceMenuLeft.style.display = "flex";
    instanceMenuBottom.style.display = "none";
  } else {
    instanceMenuLeft.style.display = "none";
  }
});

/* --- Clique esquerdo: menu embaixo da instância --- */
canvas.addEventListener("click", e => {
  if (e.button !== 0) return;

  const mx = (e.clientX - w/2) / cam.scale - cam.x;
  const my = (e.clientY - h/2) / cam.scale - cam.y;
  selectedInstance = pickInstance(mx, my);

  if (selectedInstance) {
    const screenX = w/2 + (selectedInstance.worldX + cam.x) * cam.scale;
    const screenY = h/2 + (selectedInstance.worldY + cam.y) * cam.scale;

    instanceMenuBottom.style.left = (screenX - instanceMenuBottom.offsetWidth/2) + "px";
    instanceMenuBottom.style.top = (screenY + (selectedInstance.height * selectedInstance.scale * cam.scale / 2) + 15) + "px";
    instanceMenuBottom.style.display = "flex";
    instanceMenuLeft.style.display = "none";
  } else {
    instanceMenuBottom.style.display = "none";
  }
});

// fecha menus ao clicar fora
document.addEventListener("click", e => {
  if (!instanceMenuLeft.contains(e.target) && !instanceMenuBottom.contains(e.target) && e.target !== canvas) {
    instanceMenuLeft.style.display = "none";
    instanceMenuBottom.style.display = "none";
  }
});
/* --- SUPABASE MULTIPLAYER ESTILO OWLBEAR --- */

// ⚠️ no <head> do HTML precisa ter:
// <script src="https://unpkg.com/@supabase/supabase-js@2"></script>

// pega a sala da URL (?room=nome)
const params = new URLSearchParams(window.location.search);
const room = params.get("room") || "default";

// conecta no Supabase
const supabaseUrl = "https://ngehsncshjivmnqwxaqu.supabase.co";   // <-- troque pelo seu
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5nZWhzbmNzaGppdm1ucXd4YXF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1OTM4MzUsImV4cCI6MjA3NjE2OTgzNX0.hTEIKG6-Of5cEfKg1ejohNyWpsnCziD1P72k22AYOso";               // <-- troque pelo seu
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// garante id único para cada token
function ensureId(obj){
  if(!obj.id){
    obj.id = crypto.randomUUID();
  }
}

/* --- PERSISTÊNCIA (BANCO) --- */

// carregar tokens já existentes da sala
async function loadTokens(){
  const { data, error } = await supabase
    .from("tokens")
    .select("*")
    .eq("room", room);

  if(error) {
    console.error("Erro ao carregar tokens:", error);
    return;
  }

  data.forEach(t => {
    if(!instances.find(i => i.id === t.id)){
      instances.push({
        ...t,
        img: new Image(),
        visible: true
      });
      const obj = instances.find(i=>i.id===t.id);
      obj.img.src = t.src || "token.png";
      obj.img.onload = draw;
    }
  });
  draw();
}
loadTokens();

// salvar/atualizar no banco
async function syncToken(obj){
  ensureId(obj);
  const { error } = await supabase.from("tokens")
    .upsert({
      id: obj.id,
      x: obj.worldX,
      y: obj.worldY,
      rotation: obj.rotation,
      scale: obj.scale,
      src: obj.img?.src || null,
      room: room
    });
  if(error) console.error("Erro ao salvar token:", error);
}

/* --- REALTIME BROADCAST (OWLBEAR STYLE) --- */

const channel = supabase.channel(room, {
  config: { broadcast: { self: false } }
}).subscribe();

// ouvir movimentos
channel.on("broadcast", { event: "move" }, ({ payload }) => {
  const token = instances.find(t => t.id === payload.id);
  if(token){
    Object.assign(token, payload);
    draw();
  }
});

// ouvir novos tokens criados
channel.on("broadcast", { event: "new-token" }, ({ payload }) => {
  if(!instances.find(t => t.id === payload.id)){
    const img = new Image();
    img.src = payload.src || "token.png";
    img.onload = () => draw();
    instances.push({ ...payload, img, visible:true });
    draw();
  }
});

/* --- INTEGRAÇÃO COM SEU CANVAS --- */

// quando soltar um token arrastado → atualiza banco e manda broadcast
canvas.addEventListener("mouseup", ()=>{
  if(draggingInstance){
    ensureId(draggingInstance);

    // manda pro banco (persistência)
    syncToken(draggingInstance);

    // manda broadcast (tempo real pros outros)
    channel.send({
      type: "broadcast",
      event: "move",
      payload: {
        id: draggingInstance.id,
        x: draggingInstance.worldX,
        y: draggingInstance.worldY,
        rotation: draggingInstance.rotation,
        scale: draggingInstance.scale
      }
    });
  }
});

// quando criar novo token (drop no canvas)
function createToken(obj){
  ensureId(obj);

  // salvar no banco
  syncToken(obj);

  // mandar broadcast
  channel.send({
    type: "broadcast",
    event: "new-token",
    payload: {
      id: obj.id,
      x: obj.worldX,
      y: obj.worldY,
      rotation: obj.rotation,
      scale: obj.scale,
      src: obj.img?.src || null
    }
  });
}

// Puxa a página e injeta dentro da mini janela
fetch("../sistemas/hollow/personagens/ficha/index.html")
  .then(res => res.text())
  .then(html => {
    document.getElementById("miniJanela").innerHTML = html;
  })
  .catch(err => {
    console.error("Erro ao carregar mini janela:", err);
  });
