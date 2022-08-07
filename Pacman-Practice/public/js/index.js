const canvas = document.querySelector('canvas');
canvas.width = innerWidth;
canvas.height = innerHeight;
const context = canvas.getContext('2d');
const boxWidth = roundBox((canvas.width - 10) / 29);
const boxHeight = roundBox((canvas.height - 10) / 14);
let socket = io();
let clientPlayers = {};

socket.on('Player Joined', (f) => {
  console.log(f.data);
  createPlayer(f.data, socket.id);
})

socket.on('player moved', f => {
  console.log(f.key)
})
const players = []

socket.on('redrawPlayers', p => {
  let playersFound = {};
  for (let id in p) {
    if (clientPlayers[id] === undefined && id !== socket.id) {
      console.log('New Player detected')
      clientPlayers[id] = new Player({
        position: {
          x: p[id].position.x,
          y: p[id].position.y
        },
        velocity: {
          x: p[id].velocity.x,
          y: p[id].velocity.y
        },
        image: playerImg,
        id
      }
      );
      players.push(clientPlayers[id])
    }
    playersFound[id] = true;
  }
  for (let id in clientPlayers) {
    if (!playersFound[id]) {
      players.pop();
      clientPlayers[id].remove();
      delete clientBalls[id];
    }
  }
})

socket.on('commandUpdate', p => {
  for (let id in p){
    if (clientPlayers[id] !== undefined) {
      clientPlayers[id].velocity = p[id].velocity;
      players.forEach(player => {
        if (player.id == p[id]){
          player.velocity = p[id].velocity;
        }
      })
    }
  }
})


socket.on('Move Player', key => {
  players.forEach(player => {
    if (player.id == socket.id) {
      switch (key) {
        case 'w':
          player.velocity.x = 0;
          player.velocity.y = -5;
          break
        case 's':
          player.velocity.x = 0;
          player.velocity.y = 5;
          break
        case 'a':
          player.velocity.x = -5;
          player.velocity.y = 0;
          break
        case 'd':
          player.velocity.x = 5;
          player.velocity.y = 0;
          break
      }
      socket.emit('user velocities', player.velocity)
    }
  })
})

function roundBox(num) {
  return Math.ceil(num / 1) * 1;
}

class Player {
  constructor({ position, velocity, image, id }) {
    this.id = id;
    this.position = position
    this.velocity = velocity
    this.radius = 15
    this.image = image
  }

  draw() {
    context.drawImage(this.image, this.position.x - this.radius, this.position.y- this.radius, this.radius * 2, this.radius * 2)
  }

  updatePos() {
    this.draw()
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

class Pellet {
  constructor({ position }) {
    this.position = position
    this.radius = 4
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
playerImg.src = '../assets/player2.png'
const wallImg = new Image();
wallImg.src = '../assets/wall.png'
const groundImg = new Image();
groundImg.src = '../assets/ground2.png'

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
            x: (boxWidth * j + boxWidth / 2), y: (boxHeight * i) + boxHeight / 2
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


function createPlayer(numOfPlayer, id) {
  let positionX;
  let positiony;
  if (numOfPlayer == 2) {
    positionX = canvas.width - (boxWidth * 1.5)
    positiony = canvas.height - (boxHeight * 1.5)
  } else {
    positionX = boxWidth * 1.5;
    positiony = boxHeight * 1.5;
  }
  players.push(new Player({
    position: {
      x: positionX,
      y: positiony
    },
    velocity: {
      x: 0,
      y: 0
    },
    image: playerImg,
    id
  }))

  socket.emit("newPlayer", {
    position: {
      x: players[0].position.x,
      y: players[0].position.y
    },
    velocity: {
      x: players[0].velocity.x,
      y: players[0].velocity.y
    },
    image: playerImg,
    id
  })
}



function move() {
  requestAnimationFrame(move);
  context.clearRect(0, 0, canvas.width, canvas.height);

  pellets.forEach((pellet, i) => {
    pellet.draw();
    players.forEach(player => {
      if (Math.hypot(pellet.position.x - player.position.x, pellet.position.y - player.position.y) < (pellet.radius + player.radius)) {
        pellets.splice(i, 1);
      }
    })
  })

  boundaries.forEach((Boundary) => {
    Boundary.draw();
    players.forEach(player => {
      if (player.position.y - player.radius + player.velocity.y <= Boundary.position.y + Boundary.height && player.position.x + player.radius +
        player.velocity.x >= Boundary.position.x && player.position.y + player.radius + player.velocity.y >= Boundary.position.y && player.position.x
        - player.radius + player.velocity.x <= Boundary.position.x + Boundary.width) {
        player.velocity.x = 0;
        player.velocity.y = 0;
      }
    })
  })

  players.forEach(player => {
    socket.emit('updatePlayer', player)
    player.updatePos();
  })
}


move();

window.addEventListener('keydown', (f) => {
  socket.emit('Player moved', (f.key))
})
