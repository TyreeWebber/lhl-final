require("dotenv").config();

const express = require('express')
const path = require('path')
const http = require('http')
const PORT = process.env.PORT || 3000
const socketio = require('socket.io')
const app = express()
const server = http.createServer(app)
const io = socketio(server)

const { Pool } = require('pg');
const dbParams = require("./lib/db.js");
const db = new Pool(dbParams);
db.connect();

app.set("view engine", "ejs");



// Set static folder
app.use(express.static(path.join(__dirname, "public")))
app.use(express.static(__dirname + "/styles"));
//trial
app.get("/", (req, res) => {
  res.render('index');
})
app.get("/game", (req, res) => {
  res.render('game');
})
app.post("/game", (req, res) => {
  db.query(`insert into scores`)
  res.render('index');
})

app.get('/leaders', (req, res) => {
  db.query(`Select user_name, timing, point from scores ORDER BY timing LIMIT 5;`)
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