const canvas = document.querySelector('canvas');
canvas.width = innerWidth;
canvas.height = innerHeight;
const context = canvas.getContext('2d');
const boxWidth = roundBox((canvas.width - 10) / 29);
const boxHeight = roundBox((canvas.height - 10) / 14);

function roundBox(num) {
  return Math.ceil(num / 1) * 1;
}
class Player {
  constructor({ position, velocity, image}) {
    this.position = position
    this.velocity = velocity
    this.radius = 15
    this.image = image
  }

  draw() {
    // context.beginPath()
    // context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
    // context.fillStyle = 'blue'
    // context.fill()
    // context.closePath();
    context.drawImage(this.image, this.position.x - (boxWidth/4), this.position.y - (boxWidth/4), this.radius*2, this.radius*2)
  }

  updatePos() {
    this.draw()
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y
  }
}

class Pellet {
  constructor({ position }) {
    this.position = position
    this.radius = 3
  }

  draw() {
    context.beginPath()
    context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
    context.fillStyle = 'red'
    context.fill()
    context.closePath();
  }
}

class Ground {
  constructor({ position, image }) {
    this.position = position
    this.width = boxWidth
    this.height = boxHeight
    this.image = image
  }
  draw() {
    context.drawImage(this.image, this.position.x, this.position.y, this.width, this.height)
  }
}

class Boundary {
  constructor({ position, image }) {
    this.position = position
    this.width = boxWidth
    this.height = boxHeight
    this.image = image
  }
  draw() {
    context.drawImage(this.image, this.position.x, this.position.y, this.width, this.height)
  }
}

const map = [
  ['-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-'],
  ['-', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '-', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '-'],
  ['-', ' ', '-', '-', '-', ' ', '-', ' ', '-', '-', '-', '-', '-', ' ', '-', ' ', '-', '-', '-', '-', '-', ' ', '-', ' ', '-', '-', '-', ' ', '-'],
  ['-', ' ', ' ', ' ', ' ', ' ', '-', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '-', ' ', ' ', ' ', ' ', ' ', '-'],
  ['-', ' ', '-', '-', '-', ' ', '-', ' ', '-', '-', '-', '-', '-', ' ', '-', ' ', '-', '-', '-', '-', '-', ' ', '-', ' ', '-', '-', '-', ' ', '-'],
  ['-', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '-', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '-'],
  ['-', '-', '-', ' ', '-', '-', '-', ' ', '-', ' ', '-', ' ', '-', ' ', ' ', ' ', '-', ' ', '-', ' ', '-', ' ', '-', '-', '-', ' ', '-', '-', '-'],
  ['-', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '-', ' ', '-', ' ', '-', ' ', ' ', ' ', '-', ' ', '-', ' ', '-', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '-'],
  ['-', ' ', '-', ' ', '-', ' ', '-', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '-', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '-', ' ', '-', ' ', '-', ' ', '-'],
  ['-', ' ', '-', ' ', '-', ' ', '-', ' ', '-', '-', '-', '-', '-', ' ', '-', ' ', '-', '-', '-', '-', '-', ' ', '-', ' ', '-', ' ', '-', ' ', '-'],
  ['-', ' ', ' ', ' ', '-', ' ', '-', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '-', ' ', '-', ' ', ' ', ' ', '-'],
  ['-', ' ', '-', ' ', '-', ' ', '-', ' ', '-', '-', '-', '-', '-', ' ', '-', ' ', '-', '-', '-', '-', '-', ' ', '-', ' ', '-', ' ', '-', ' ', '-'],
  ['-', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '-', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '-'],
  ['-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-']
]
const boundaries = []
const ground = []
const pellets = []

const playerImg = new Image();
playerImg.src = './assets/player2.png'
const wallImg = new Image();
wallImg.src = './assets/wall.png'
const groundImg = new Image();
groundImg.src = './assets/ground2.png'

map.forEach((row, i) => {
  row.forEach((box, j) => {
    switch (box) {
      case '-':
        boundaries.push(new Boundary({
          position: { x: boxWidth * j, y: boxHeight * i },
          image: wallImg
        }))
        break;
      case ' ':
        pellets.push(new Pellet({
          position: {
            x: (boxWidth * j + boxWidth/2), y:( boxHeight * i) + boxHeight / 2
          }
        }
        ))
        break;
    }
  })
})

boundaries.forEach((Boundary) => {
  Boundary.draw();
})
const player = new Player({
  position: {
    x: boxWidth * 1.5,
    y: boxHeight * 1.5
  },
  velocity: {
    x: 0,
    y: 0
  },
  image: playerImg
})

player.draw();

function move() {
  requestAnimationFrame(move);
  context.clearRect(0, 0, canvas.width, canvas.height);

  pellets.forEach((pellet, i) => {
    pellet.draw();
    if (Math.hypot(pellet.position.x - player.position.x, pellet.position.y - player.position.y) < (pellet.radius + player.radius)){
      console.log('touching');
      pellets.splice(i,1);
    }
  })
  boundaries.forEach((Boundary) => {
    Boundary.draw();
    if (player.position.y - player.radius + player.velocity.y <= Boundary.position.y + Boundary.height && player.position.x + player.radius +
      player.velocity.x >= Boundary.position.x && player.position.y + player.radius + player.velocity.y >= Boundary.position.y && player.position.x
      - player.radius + player.velocity.x <= Boundary.position.x + Boundary.width) {
      player.velocity.x = 0;
      player.velocity.y = 0;
    }
  })
  player.updatePos();
}

move();

window.addEventListener('keydown', ({ key }) => {
  switch (key) {
    case 'w':
      player.velocity.y = -5
      player.velocity.x = 0
      break
    case 'a':
      player.velocity.x = -5
      player.velocity.y = 0
      break
    case 's':
      player.velocity.y = 5
      player.velocity.x = 0
      break
    case 'd':
      player.velocity.x = 5
      player.velocity.y = 0
      break
  }
})