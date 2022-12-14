const canvas = document.querySelector('canvas');
canvas.width = innerWidth;
canvas.height = innerHeight;
const context = canvas.getContext('2d');
const boxWidth = roundBox((canvas.width - 10) / 29);
const boxHeight = roundBox((canvas.height - 10) / 14);
const timer = document.getElementById('timer');
const score = document.getElementById('score');
const playerName = document.getElementById('name').textContent;
const dialog = document.getElementById('dialog');
const button = document.getElementById('starter');
let time = 30;
let socket = io();
let clientPlayers = {};



socket.on('START', () => {
  button.style.display = 'none';
  gameTimer();
  move();
})


const gameTimer = function() {
      const counter = setInterval(() => {
      timer.innerHTML = `Time Remaining: ${time} seconds`;
      time--;
      if (time < 0) {
        clearInterval(counter);
        timer.innerHTML = `Game Over! You are out of time`;
        dialog.style.display = 'block';
        players.forEach( (player) => {
          if (player.id == socket.id) {
            socket.emit('game finished', player)
          }
        })
      }
    }, 1000);
  };

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
        image: rightMovement,
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


socket.on('Move Player', key => {
  players.forEach(player => {
    if (player.id == socket.id) {
      switch (key) {
        case 'w':
          player.velocity.x = 0;
          player.velocity.y = -.45;
          player.image = upMovement;
          console.log(player.velocity.x);
          break
        case 's':
          player.velocity.x = 0;
          player.velocity.y = .45;
          player.image = downMovement;
          break
        case 'a':
          player.velocity.x = -.25;
          player.velocity.y = 0;
          player.image = leftMovement;
          break
        case 'd':
          player.velocity.x = .25;
          player.velocity.y = 0;
          player.image = rightMovement;
          break
      }
      socket.emit('user velocities', player)
    }
  })
})

function roundBox(num) {
  return Math.ceil(num / 1) * 1;
}

let i = 0;
class Player {
  constructor({ position, velocity, image, id }) {
    this.id = id;
    this.position = position
    this.velocity = velocity
    this.radius = boxWidth / 4;
    this.image = image
    this.powered = false;
    this.score = 0;
    this.name = playerName;
  }
  
  draw() {
   context.drawImage(this.image[i], this.position.x - this.radius, this.position.y - this.radius, this.radius * 2, this.radius * 2)
   if (i < 7) {
    i++;
  } else if (i == 7) {
    i = 1;
   }
  }

  updatePos() {
    this.draw()
    this.position.x += (this.velocity.x * screen.width) / 100;
    this.position.y += (this.velocity.y * screen.height) / 100;
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

const wallImg = new Image();
wallImg.src = '../assets/wall.png'
const groundImg = new Image();
groundImg.src = '../assets/ground2.png'

const pacRight1 = new Image();
pacRight1.src = '../assets/blue/pacright(1).png'
const pacRight2 = new Image ();
pacRight2.src = '../assets/blue/pacright(2).png'
const pacDown1 = new Image();
pacDown1.src = '../assets/blue/pacdown(1).png'
const pacDown2 = new Image();
pacDown2.src = '../assets/blue/pacdown(2).png'
const pacLeft1 = new Image();
pacLeft1.src = '../assets/blue/pacleft(1).png'
const PacLeft2 = new Image();
PacLeft2.src = '../assets/blue/pacleft(2).png'
const pacUp1 = new Image();
pacUp1.src = '../assets/blue/pacup(1).png'
const pacUp2 = new Image();
pacUp2.src = '../assets/blue/pacup(2).png'

const powerRight1 = new Image();
powerRight1.src = '../assets/orange/orangeright(1).png'
const powerRight2 = new Image();
powerRight2.src = '../assets/orange/orangeright(2).png'
const powerDown1 = new Image();
powerDown1.src = '../assets/orange/orangedown(1).png'
const powerDown2 = new Image();
powerDown2.src = '../assets/orange/orangedown(2).png'
const powerLeft1 = new Image ();
powerLeft1.src = '../assets/orange/orangeleft(1).png'
const powerLeft2 = new Image();
powerLeft2.src = '../assets/orange/orangeleft(2).png'
const powerUp1 = new Image ();
powerUp1.src = '../assets/orange/orangeup(1).png'
const powerUp2 = new Image ();
powerUp2.src = '../assets/orange/orangeup(2).png'

const deathSound = new Audio();
deathSound.src = '../assets/audio/death.mp3'

const rightMovement = [pacRight1, pacRight1, pacRight1, pacRight1, pacRight2, pacRight2, pacRight2, pacRight2];
const upMovement = [pacUp1, pacUp1, pacUp1, pacUp1, pacUp2, pacUp2, pacUp2, pacUp2];
const downMovement = [pacDown1, pacDown1, pacDown1, pacDown1, pacDown2, pacDown2, pacDown2, pacDown2];
const leftMovement = [pacLeft1, pacLeft1, pacLeft1, pacLeft1, PacLeft2, PacLeft2, PacLeft2, PacLeft2];
const rightPower = [powerRight1, powerRight1, powerRight1, powerRight1, powerRight2, powerRight2, powerRight2, powerRight2];
const upPower = [powerUp1, powerUp1, powerUp1, powerUp1, powerUp2, powerUp2, powerUp2, powerUp2];
const downPower = [powerDown1, powerDown1, powerDown1, powerDown1, powerDown2, powerDown2, powerDown2, powerDown2];
const leftPower = [powerLeft1, powerLeft1, powerLeft1, powerLeft1, powerLeft2, powerLeft2, powerLeft2, powerLeft2];

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

let imagesArray;


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
    image: rightMovement,
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
    image: rightMovement,
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
        player.score += 10;
        if (player.id == socket.id) {
          score.innerHTML = `Your Points: ${player.score}`
        }
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
        setTimeout(reSpawnPowerup, 10000);
        setTimeout(removePower, 10000, player.id);
      }
    })
  })

  boundaries.forEach((Boundary) => {
    Boundary.draw();
    players.forEach(player => {
      if (player.position.y - player.radius + (player.velocity.y * screen.height / 100) <= Boundary.position.y + Boundary.height && player.position.x + player.radius +
      (player.velocity.x * screen.width / 100) >= Boundary.position.x && player.position.y + player.radius + (player.velocity.y * screen.height / 100) >= Boundary.position.y && player.position.x
        - player.radius + (player.velocity.x * screen.width / 100) <= Boundary.position.x + Boundary.width) {
        player.velocity.x = 0;
        player.velocity.y = 0;
      }
    })
  })

  
  players.forEach(player => {
    if (player.id == socket.id) {
      score.innerHTML = `Your Points: ${player.score}`
    }
    if (player.velocity.x < 0 && player.powered == false) {
      player.image = leftMovement;
    } else if (player.velocity.x > 0 && player.powered == false) {
      player.image = rightMovement;
    } else if (player.velocity.y > 0 && player.powered == false) {
      player.image = downMovement;
    } else if (player.velocity.y < 0 && player.powered == false) {
      player.image = upMovement;
    } else if (player.velocity.x < 0 && player.powered == true) {
      player.image = leftPower;
    } else if (player.velocity.x > 0 && player.powered == true) {
      player.image = rightPower
    } else if (player.velocity.y > 0 && player.powered == true) {
      player.image = downPower;
    } else if (player.velocity.y < 0 && player.powered == true)  {
      player.image = upPower;
    }

    player.updatePos();
    syncLocation();
    const tempX = (player.position.x * 100) / screen.width;
    // console.log((tempX * screen.width) / 100);
    // console.log(player.position.x);

    players.forEach(player2 => {
      if (Math.hypot(player.position.x - player2.position.x, player.position.y - player2.position.y) < (player.radius + player2.radius) && player.id != player2.id) {
        if(player.powered == true && player2.powered == false) {
          deathSound.play();
          console.log(`${player.id} ate ${player2.id}`)
          player.score += player2.score;
          player2.score = 0;
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

button.addEventListener('click', () => {
  socket.emit('start Game');
  button.style.display = 'none';
  gameTimer();
  move();
});

window.addEventListener('keydown', (f) => {
  syncLocation();
  socket.emit('Player moved', (f.key))
})

socket.on('UpdatePosition', p => {
  players.forEach(player => {
    if (player.id == p.id) {
      player.position.x = (p.position.x * screen.width) / 100 ;
      player.position.y = (p.position.y * screen.height) / 100;
      // console.log(player.position.x, player.position.y);
    }
  })
})

function syncLocation() {
  players.forEach(player => {
    if (socket.id == player.id) {
      let sentX = (player.position.x * 100) / screen.width;
      let sentY = (player.position.y * 100) / screen.height;
      socket.emit('correctTurn', {x: sentX, y: sentY});
    }
  })
}

