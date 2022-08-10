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

const { Pool } = require('pg');
const dbParams = require("./lib/db.js");
const db = new Pool(dbParams);
db.connect();

app.set("view engine", "ejs");

// Set static folder
app.use(express.static(path.join(__dirname, "public")))
app.use(express.static(__dirname + "/styles"));
app.use(bodyParser.urlencoded({
  extended: true
}));

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
    players[socket.id].velocity = data.velocity;
    socket.broadcast.emit('commandUpdate', players)
  })

  // socket.on('player got power',(data)  =>{
  //   console.log(`player with id: ${data.id} hit a powerup`)
  //   const id = data.id;
  //   players[id].powered = true;
  //   socket.broadcast.emit('Powerupdate', players);
  // })

  socket.on('Player moved', (k) => {
    socket.emit('Move Player', (k));
  })

  // socket.on('power removed', id => {
  //   players[id].powered = false;
  //   console.log(players);
  //   socket.broadcast.emit('Powerupdate', players);
  // })

})

//Routes
app.get("/", (req, res) => {
  res.render("mainpage");
});
// app.post("/", (req, res) => {
//   // const player = req.body.text;
//   res.redirect('/game');
// })

app.get("/game", (req, res) => {
  res.render('game');
})
app.post("/game", (req, res) => {
  // const player = req.body.text;
  res.redirect('/game');
})


app.get('/leaders', (req, res) => {
  db.query(`Select user_name, point from scores ORDER BY point LIMIT 5;`)
  .then((data)=>{
    const templateVars = { scores: data.rows };
    res.render("leaders", templateVars);
  })
  .catch((err) => {
    res.status(404).send(err.message);
  })
});


// Start server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`))