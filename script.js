// util: formatar tempo mm:ss
function fmt(t){
  if(!isFinite(t) || t < 0) t = 0;
  const m = Math.floor(t/60);
  const s = Math.floor(t%60);
  return `${m}:${String(s).padStart(2,"0")}`;
}

// Carregar backgrounds a partir do data-bg (lida com espaços/acentos)
function applyBackgrounds(){
  document.querySelectorAll(".slide").forEach(sec=>{
    const file = sec.getAttribute("data-bg");
    if(file){
      const url = `BACKGROUND/${encodeURI(file)}`;
      sec.style.backgroundImage = `url("${url}")`;
    }
  });
}

// Navegação slide a slide
let current = 1;
const slides = [...document.querySelectorAll(".slide")];
function show(i){
  // limitar
  if(i < 1) i = 1;
  if(i > slides.length) i = slides.length;
  // pausar áudios da seção anterior
  slides.forEach(s=>{
    s.classList.remove("active");
    s.querySelectorAll("audio").forEach(a=>{ a.pause(); });
    s.querySelectorAll(".play").forEach(b=> b.classList.remove("paused"));
  });
  current = i;
  slides[i-1].classList.add("active");
  history.replaceState(null, "", `#${i}`);
}

function wireNav(){
  document.body.addEventListener("click", e=>{
    const b = e.target.closest("button");
    if(!b) return;

    if(b.classList.contains("next")){
      const next = current === slides.length ? 1 : current+1;
      show(next);
    }
    if(b.classList.contains("back")){
      const prev = current === 1 ? 1 : current-1;
      show(prev);
    }
    if(b.classList.contains("menu")){
      openMenu(true);
    }
    if(b.id === "closeMenu"){
      openMenu(false);
    }
    if(b.classList.contains("menu-jump")){
      const t = parseInt(b.dataset.target,10);
      openMenu(false);
      show(t);
    }
  });

  // setas do teclado
  window.addEventListener("keydown", (e)=>{
    if(e.key === "ArrowRight") document.querySelector(".slide.active .next")?.click();
    if(e.key === "ArrowLeft") document.querySelector(".slide.active .back")?.click();
    if(e.key.toLowerCase() === "m") openMenu(true);
  });

  // hash inicial
  const h = parseInt(location.hash.replace("#",""),10);
  show(isFinite(h) ? h : 1);
}

// Menu overlay
function openMenu(v){
  const ov = document.getElementById("menuOverlay");
  ov.classList.toggle("hidden", !v);
  ov.setAttribute("aria-hidden", String(!v));
}

// Player custom
function wirePlayers(){
  document.querySelectorAll(".player").forEach(box=>{
    const audio = box.querySelector("audio");
    const btn = box.querySelector(".play");
    const seek = box.querySelector(".seek");
    const cur = box.querySelector(".current");
    const dur = box.querySelector(".duration");

    // duração quando metadata carrega
    audio.addEventListener("loadedmetadata", ()=>{
      dur.textContent = fmt(audio.duration);
    });

    // play/pause
    btn.addEventListener("click", ()=>{
      // pausar outros players
      document.querySelectorAll("audio").forEach(a=>{
        if(a !== audio){ a.pause(); }
      });
      document.querySelectorAll(".player .play").forEach(p=>{
        if(p !== btn) p.classList.remove("paused");
      });

      if(audio.paused){ audio.play(); btn.classList.add("paused"); }
      else{ audio.pause(); btn.classList.remove("paused"); }
    });

    // sincronizar barra
    audio.addEventListener("timeupdate", ()=>{
      seek.max = audio.duration || 0;
      seek.value = audio.currentTime || 0;
      cur.textContent = fmt(audio.currentTime);
    });

    // seek manual
    seek.addEventListener("input", ()=>{
      audio.currentTime = Number(seek.value);
    });

    // fim da música
    audio.addEventListener("ended", ()=>{
      btn.classList.remove("paused");
    });
  });
}

applyBackgrounds();
wireNav();
wirePlayers();
