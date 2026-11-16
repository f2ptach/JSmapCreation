

class GameObject {
  constructor(objID, size, color) {
    this.size = size;
    this.color = color;
  }
  draw(x, y) 
  {
    ctx.fillStyle = this.color;
    const length = 2 *this.size * tileSize;
    const width = 0.4 * this.size * tileSize;
    ctx.fillRect(x- 0.5 * length,y-0.5 * width,length,width);
    ctx.fillRect(x- 0.5 * width,y-0.5 * length,width,length);
  }
}

class Settlement extends GameObject {

    constructor(population, color) {
        let size = population / 1000;
        super(0, size, color);
        this.population = population;        
    }
    updateSize() {
        this.size = this.population / 1000; 
    }
}

const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

const backCanvas = document.getElementById("backCanvas");
const backctx = backCanvas.getContext("2d");

const colours = ["green", "yellow", "blue"]
const noise = new createNoise2D();
const biomenoise = new createNoise2D();

const COLORS = ["darkblue","blue","yellow","green","rgb(75, 170, 85)","darkgreen","rgb(55, 90, 55)","gray","white"];

function fbm(noise, x, y, octaves = 4) {
  let value = 0;
  let amplitude = 1;
  let frequency = 0.4;
  let maxValue = 0;
  for (let i = 0; i < octaves; i++) {
    value += noise(x * frequency, y * frequency) * amplitude;
    maxValue += amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }
  return value / maxValue; // normalized back to -1..1
}

function biomes(noise, x, y, octaves = 2) {
  let value = 0;
  let amplitude = 1;
  let frequency = 0.4;
  let maxValue = 0;
  for (let i = 0; i < octaves; i++) {
    value += noise(x * frequency, y * frequency) * amplitude;
    maxValue += amplitude;
    amplitude *= 0.7;
    frequency *= 5;
  }
  return value / maxValue; // normalized back to -1..1
}

const tileSize = 4;

backCanvas.width = canvas.width = 2 * Math.round(window.innerWidth / tileSize) * tileSize;

backCanvas.height = canvas.height = 2 * Math.round(window.innerHeight / tileSize) * tileSize;

const xRow = Math.ceil(canvas.width / tileSize);
const yRow = Math.ceil(canvas.height / tileSize);


let background = new Array();
let objects = new Array();
let draw = new Array();

function setupBackground() {
 for (let x = 0; x < xRow; x++)
  {
    background[x] = new Uint8Array(yRow);
    for (let y = 0; y < yRow; y++)
    {
        const scale = 0.04;
        const value = fbm(noise, x * scale, y * scale);
        let code;
        if (value < -0.3) 
            code = 0;
        else if (value < -0.04) 
            code = 1;
        else if (value < 0.1) 
            code = 2;
        else if (value < 0.3) 
            code = biomes(biomenoise, x * scale, y * scale) < 0.1 ? 3 : 4;
        else if (value < 0.5) 
            code = biomes(biomenoise, x * scale, y * scale) < 0.1 ? 5 : 6;
        else if (value < 0.63) 
            code = 7;
        else code = 8;
        background[x][y]= code;
    }
  }
}

setupBackground();

function getRandomCoord(numSettle) 
{
    const secx = Math.floor(Math.random() * xRow / Math.floor(Math.sqrt(numSettle))) * tileSize;
    const secy = Math.floor(Math.random() * yRow / Math.floor(Math.sqrt(numSettle))) * tileSize; 
    return [secx, secy];
  
}

function settlements(numSettle) {
  for (let i = 0; i < Math.floor(Math.sqrt(numSettle)); i++)
  {
    for (let j = 0; j < Math.floor(Math.sqrt(numSettle)); j++)
    {
      [secx, secy] = getRandomCoord(numSettle);

      let x = i * Math.floor(xRow / Math.floor(Math.sqrt(numSettle))) * tileSize + secx
      let y = j * Math.floor(yRow / Math.floor(Math.sqrt(numSettle)))* tileSize + secy

      let pop = Math.round(Math.random()) * 1000 + 2000;

      let settlement = new Settlement(pop, "red");

      const color = background[x / tileSize][y / tileSize];
      if (color === "blue" || color === "darkblue") continue;

      objects.push([settlement, x, y]);
      draw.push([settlement, x, y]);
    }
  }
}


function drawObj() {
  for(let i = 0; i < draw.length; i++)
  {
    draw[i][0].draw(draw[i][1], draw[i][2]);
  }
}
function moveObj() {
  for(let i = 0; i < draw.length; i++)
  {
    console.log()
    
    if (draw[i][1] > canvas.width)
      draw[i][1] -= canvas.width;
  }
}
function drawBackground(){
  for (let x = 0; x < xRow; x++)
  {
    for (let y = 0; y < yRow; y++)
    {
      backctx.fillStyle = COLORS[background[x][y]];
      backctx.fillRect(tileSize * x,tileSize * y, tileSize, tileSize);
    }
  }
}
drawBackground();
settlements(16);

function update() {
  for (const [obj] of draw) if (obj.updateSize) obj.updateSize();
  moveObj();
  drawObj();
}

setInterval(update, 100);