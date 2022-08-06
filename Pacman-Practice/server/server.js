const path = require ('path');
const http = require('http');
const express = require('express');
const socketIO  = require('socket.io');
const { kMaxLength } = require('buffer');

const publicPath = path.join(__dirname, '../public')
const port = process.env.PORT || 3000;
let app = express();
let server = http.createServer(app);
let io = socketIO(server);

app.use(express.static(publicPath));

server.listen(port, () => {
  console.log('server is up on port 3000')
})

io.on('connection', (socket) => {
  socket.emit('Player Joined', {data: io.engine.clientsCount})
  socket.on('disconnect', () => {
    console.log('A user has disconnected')
  })
  socket.on('Player moved', (k) => {
    console.log(`Player pressed ${k}`)
    socket.emit('Move Player', (k))
  })
})