require("dotenv").config();

const express = require('express')
const path = require('path')
const http = require('http')
const PORT = process.env.PORT || 3001
const socketIO = require('socket.io')
const app = express()
const server = http.createServer(app)
const io = socketIO(server)
const bodyParser = require('body-parser')
const { kMaxLength } = require('buffer');
let players = {};
let resultName = [];
let resultpoints = [];
let i = 0;

// const { Pool } = require('pg');
// const dbParams = require("./lib/db.js");
// const db = new Pool(dbParams);
// db.connect();
let playerName;
app.set("view engine", "ejs");

// Set static folder
app.use(express.static(path.join(__dirname, "public")))
app.use(express.static(__dirname + "/styles"));

app.use(bodyParser.urlencoded({
  extended: true
}));


io.on('connection', (socket) => {

  i = 0;

  socket.on('start Game', () => {
    socket.broadcast.emit('START');
  });

  socket.emit('Player Joined', { data: io.engine.clientsCount })

  socket.on('newPlayer', data => {
    console.log("New client connected, with id: " + socket.id);
    players[socket.id] = data;
    console.log("Current number of players: " + Object.keys(players).length);
    console.log("players dictionary: ", players);
    io.emit('redrawPlayers', players);
  })


  socket.on('disconnect', () => {
    delete players[socket.id];
    console.log("Goodbye client with id " + socket.id);
    console.log("Current number of players: " + Object.keys(players).length);
    io.emit('redrawPlayers', players);
  })

  socket.on('user velocities', data => {
    players[socket.id].velocity = data.velocity;
    socket.broadcast.emit('commandUpdate', players)
  })

  socket.on('game finished', (player) => {
 
    resultName[i] = player.name;
    resultpoints[i] = player.score;
    i++;
  })

  socket.on('Player moved', (k) => {
    socket.emit('Move Player', (k));
  })

  socket.on('correctTurn', (player) => {
    players[socket.id].position = player.position;
    socket.broadcast.emit('UpdatePosition', players[socket.id])
  })

});



//Routes
app.get("/", (req, res) => {
  res.render("mainpage");
});

app.get("/game", (req, res) => {
  const templateVars = { name: playerName }
  res.render('game', templateVars);
})
app.post("/game", (req, res) => {
  playerName = req.body.text;
  res.redirect('/game');
})

app.get('/leaders', (req, res) => {
  let templateVars = {};
  templateVars = { player1: resultName[0], points1: resultpoints[0], player2: resultName[1], points2: resultpoints[1] }
  res.render('leaders', templateVars);
});


// Start server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`))