class Camara {
  constructor(xRel, yRel, wRel, hRel, colores) {
    this.xRel = xRel; 
    this.yRel = yRel;
    this.wRel = wRel;
    this.hRel = hRel;
    this.colores = colores;

    this.lenteBase = 0.6;
    this.lentePeqBase = 0.25;
    this.lenteActual = this.lenteBase;
    this.lentePeqActual = this.lentePeqBase;
  }

  actualizarPixeles() {
    this.x = this.xRel * width;
    this.y = this.yRel * height;
    this.w = this.wRel * width;
    this.h = this.hRel * height;
  }

  actualizarHover() {
    let cx = this.x + this.w / 2;
    let cy = this.y + this.h / 2;
    let d = dist(mouseX, mouseY, cx, cy);

    let big = min(this.w, this.h) * this.lenteBase;
    let small = min(this.w, this.h) * this.lentePeqBase;

    if (d < big / 2) {
      this.lenteActual = lerp(this.lenteActual, this.lenteBase * 1.6, 0.1);
    } else {
      this.lenteActual = lerp(this.lenteActual, this.lenteBase, 0.1);
    }

    if (d < small / 2) {
      this.lentePeqActual = lerp(this.lentePeqActual, this.lentePeqBase * 1.8, 0.1);
    } else {
      this.lentePeqActual = lerp(this.lentePeqActual, this.lentePeqBase, 0.1);
    }
  }

  show() {
    this.actualizarPixeles();
    this.actualizarHover();

    noStroke();
    fill(this.colores.cuerpo);
    rect(this.x, this.y, this.w, this.h);

    let cx = this.x + this.w / 2;
    let cy = this.y + this.h / 2;

    fill(this.colores.lente);
    circle(cx, cy, min(this.w, this.h) * this.lenteActual);

    fill(this.colores.lentePeq);
    circle(cx, cy, min(this.w, this.h) * this.lentePeqActual);
  }
}

let camaras = [];
let bordes = [];
let bordeArrastrando = null;

function setup() {
  createCanvas(windowWidth, windowHeight);

  let coloresCam1 = { cuerpo: '#3f22ec', lente: '#fb59a7', lentePeq: '#3f22ec' };
  let coloresCam2 = { cuerpo: '#efca62', lente: '#f4b6df', lentePeq: '#efca62' };
  let coloresCam3 = { cuerpo: '#dff800', lente: '#04e29d', lentePeq: '#dff800' };
  let coloresCam4 = { cuerpo: '#fb59a7', lente: '#efca62', lentePeq: '#fb59a7' };
  let coloresCam5 = { cuerpo: '#f4b6df', lente: '#fb59a7', lentePeq: '#f4b6df' };
  let coloresCam6 = { cuerpo: '#04e29d', lente: '#3f22ec', lentePeq: '#04e29d' };

  let W = 0.5;      
  let H = 1 / 3;    

  camaras.push(new Camara(0,     0,     W, H, coloresCam1));
  camaras.push(new Camara(W,     0,     W, H, coloresCam2));
  camaras.push(new Camara(0,     H,     W, H, coloresCam3));
  camaras.push(new Camara(W,     H,     W, H, coloresCam4));
  camaras.push(new Camara(0,     H*2,   W, H, coloresCam5));
  camaras.push(new Camara(W,     H*2,   W, H, coloresCam6));

  bordes.push({ tipo: 'v', posRel: 0.5, cam1: 0, cam2: 1 });
  bordes.push({ tipo: 'v', posRel: 0.5, cam1: 2, cam2: 3 });
  bordes.push({ tipo: 'v', posRel: 0.5, cam1: 4, cam2: 5 });

  bordes.push({ tipo: 'h', posRel: 1/3, cam1: 0, cam2: 2 });
  bordes.push({ tipo: 'h', posRel: 1/3, cam1: 1, cam2: 3 });
  bordes.push({ tipo: 'h', posRel: 2/3, cam1: 2, cam2: 4 });
  bordes.push({ tipo: 'h', posRel: 2/3, cam1: 3, cam2: 5 });
}

function draw() {
  background(0);
  actualizarBorde();
  for (let cam of camaras) cam.show();
}

function iniciarArrastre(x, y) {
  for (let b of bordes) {
    let px = b.tipo === 'v' ? b.posRel * width : null;
    let py = b.tipo === 'h' ? b.posRel * height : null;

    if (b.tipo === 'v' && abs(x - px) < 15) bordeArrastrando = b;
    if (b.tipo === 'h' && abs(y - py) < 15) bordeArrastrando = b;
  }
}

function mousePressed() { iniciarArrastre(mouseX, mouseY); }
function mouseReleased() { bordeArrastrando = null; }

function touchStarted() {
  if (touches.length > 0) iniciarArrastre(touches[0].x, touches[0].y);
  return false;
}
function touchEnded() { bordeArrastrando = null; return false; }

function actualizarBorde() {
  if (!bordeArrastrando) return;

  if (bordeArrastrando.tipo === 'v') {
    let nuevoX = constrain(mouseX || touches[0]?.x, 50, width - 50);
    let deltaRel = nuevoX / width - bordeArrastrando.posRel;
    bordeArrastrando.posRel = nuevoX / width;

    let b = bordeArrastrando;
    camaras[b.cam1].wRel += deltaRel;
    camaras[b.cam2].xRel += deltaRel;
    camaras[b.cam2].wRel -= deltaRel;
  }

  if (bordeArrastrando.tipo === 'h') {
    let nuevoY = constrain(mouseY || touches[0]?.y, 50, height - 50);
    let deltaRel = nuevoY / height - bordeArrastrando.posRel;
    bordeArrastrando.posRel = nuevoY / height;

    let b = bordeArrastrando;
    camaras[b.cam1].hRel += deltaRel;
    camaras[b.cam2].yRel += deltaRel;
    camaras[b.cam2].hRel -= deltaRel;
  }
}


function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
