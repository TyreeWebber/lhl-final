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

// socket.on('player moved', f => {
//   console.log(f.key)
// })
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
      delete clientPlayers[id];
    }
  }
})

socket.on('commandUpdate', p => {
  for (let id in p) {
    if (clientPlayers[id] !== undefined) {
      clientPlayers[id].velocity = p[id].velocity;
      players.forEach(player => {
        if (player.id == p[id]) {
          player.velocity = p[id].velocity;
        }
      })
    }
  }
})

socket.on('UpdatePosition', p => {
  players.forEach(player => {
    if (player.id == p.id) {
      player.position = p.position;
    }
  })
})


socket.on('Move Player', key => {
  players.forEach(player => {
    if (player.id == socket.id) {
      switch (key) {
        case 'w':
          player.velocity.x = 0;
          player.velocity.y = -5;
          player.image = playerImgUP;
          break
        case 's':
          player.velocity.x = 0;
          player.velocity.y = 5;
          player.image = playerImgDown;
          break
        case 'a':
          player.velocity.x = -5;
          player.velocity.y = 0;
          player.image = playerImgLeft;
          break
        case 'd':
          player.velocity.x = 5;
          player.velocity.y = 0;
          player.image = playerImg;
          break
      }
      socket.emit('user velocities', player)
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
    this.radius = boxWidth / 4;
    this.image = image
    this.powered = false;
  }

  draw() {
    context.drawImage(this.image, this.position.x - this.radius, this.position.y - this.radius, this.radius * 2, this.radius * 2)
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
class powerUp {
  constructor({ position }) {
    this.position = position
    this.radius = 6
  }

  draw() {
    context.beginPath()
    context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
    context.fillStyle = 'yellow'
    context.fill()
    context.closePath();
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
  ['-', '-', '-', ' ', '-', '-', '-', ' ', '-', ' ', '-', ' ', '-', ' ', 'p', ' ', '-', ' ', '-', ' ', '-', ' ', '-', '-', '-', ' ', '-', '-', '-'],
  ['-', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '-', ' ', '-', ' ', '-', ' ', 'p', ' ', '-', ' ', '-', ' ', '-', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '-'],
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
const powerUps = []

const playerImg = new Image();
playerImg.src = '../assets/pacright1.png'
const playerImgDown = new Image()
playerImgDown.src = '../assets/pacdown1.png'
const playerImgUP = new Image()
playerImgUP.src = '../assets/pacup1.png'
const playerImgLeft = new Image()
playerImgLeft.src = '../assets/pacleft1.png'
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
        }))
        break;
      case 'p':
        powerUps.push(new powerUp({
          position: {
            x: (boxWidth * j + boxWidth / 2), y: (boxHeight * i) + boxHeight / 2
          }
        }))

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
    powered: false,
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

  powerUps.forEach((powerUp, i) => {
    powerUp.draw();
    players.forEach(player => {
      if (Math.hypot(powerUp.position.x - player.position.x, powerUp.position.y - player.position.y) < (powerUp.radius + player.radius)) {
        powerUps.splice(0, powerUps.length);
        player.powered = true;
        setTimeout(reSpawnPowerup, 6000);
        console.log(player);
        setTimeout(removePower, 10000, player.id);
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
    if (player.velocity.x == -5) {
      player.image = playerImgLeft;
    } else if (player.velocity.x == 5) {
      player.image = playerImg;
    } else if (player.velocity.y == 5) {
      player.image = playerImgDown;
    } else if (player.velocity.y == -5) {
      player.image = playerImgUP
    }
    player.updatePos();

    players.forEach(player2 => {
      if (Math.hypot(player.position.x - player2.position.x, player.position.y - player2.position.y) < (player.radius + player2.radius) && player.id != player2.id) {
        if(player.powered == true && player2.powered == false) {
          console.log(`${player.id} ate ${player2.id}`)
          player2.position = {
            x: canvas.width - (boxWidth * 1.5),
            y: canvas.height - (boxHeight * 1.5)
          }
        }
      }
    })
  })
}

function reSpawnPowerup() {
  map.forEach((row, i) => {
    row.forEach((box, j) => {
      switch (box) {
        case 'p':
          powerUps.push(new powerUp({
            position: {
              x: (boxWidth * j + boxWidth / 2), y: (boxHeight * i) + boxHeight / 2
            }
          }))
          break
      }
    })
  })
}

function removePower(ids) {
  players.forEach(player => {
    if (player.id == ids) {
      player.powered = false;
      console.log(player);
    }
  })
}


move();

function syncLocation() {
  let currentPlayer;
  players.forEach(player => {
    if (socket.id == player.id) {
      currentPlayer = player;
      socket.emit('correctTurn', currentPlayer);
    }
  })
}



window.addEventListener('keydown', (f) => {
  setTimeout(syncLocation, 100);
  socket.emit('Player moved', (f.key))
})

