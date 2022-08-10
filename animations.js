const canvas = document.getElementById('Canvas');
const context = canvas.getContext('2d');
const width = canvas.Width;
const height = canvas.Height;
const frameWidth = 60;
const frameHeight = 120;
const xPos = 130;
const yPos = 160;
const scale = 1;
const fps = 60;
const secondsToUpdate = 1 * fps;
let count = 0;

const spriteSheet = new Image();
spriteSheet.src = "assets/pacman/pacmanright.png";

function animate() {
  context.drawImage(
    spriteSheet,
    0,
    0,
    frameWidth,
    frameHeight,
    xPos,
    yPos,
    frameWidth * scale,
    frameHeight * scale
  );
};

function frame(){
  context.clearRect(0, 0, width, height);
  animate();
  requestAnimationFrame(frame);
};

frame();