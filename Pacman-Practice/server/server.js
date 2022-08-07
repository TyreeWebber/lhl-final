const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const { kMaxLength } = require('buffer');

const publicPath = path.join(__dirname, '../public')
const port = process.env.PORT || 3000;
let app = express();
let server = http.createServer(app);
let io = socketIO(server);
let players = {};

app.use(express.static(publicPath));

server.listen(port, () => {
  console.log('server is up on port 3000')
})

io.on('connection', (socket) => {
  socket.emit('Player Joined', {data: io.engine.clientsCount})

  socket.on('newPlayer', data => {
    console.log("New client connected, with id: " + socket.id);
    players[socket.id] = data;
    // console.log("Starting position: " + players[socket.id].position.x + " - " + players[socket.id].position.y);
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
    players[socket.id].velocity = data;
    socket.broadcast.emit('commandUpdate', players)
  })

  socket.on("updatePlayer", (data) => {
    // console.log(data);
  })

  socket.on('Player moved', (k) => {
    socket.emit('Move Player', (k));
  })
})