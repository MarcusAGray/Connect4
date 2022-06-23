const express = require("express");
const app = express();
const { createServer } = require("http");
const { Server } = require("socket.io");
const httpServer = createServer(app);
require('dotenv').config();

const port = process.env.PORT || 3000;

const io = new Server(httpServer, { });


app.use(express.static('./public'));

httpServer.listen(port, () => {
  console.log(`server listening on port ${port}...`)
});

let connections = [null, null]

io.on("connection", (socket) => {
  let playerIndex = -1;
  socket.on("multiplayer", () => {
    for (const i in connections) {
      if (connections[i] === null) {
        playerIndex = i
        break
      }
    }
  
    socket.emit('player-number', playerIndex)
  
    if (playerIndex === -1) return
    connections[playerIndex] = true

    socket.on('check-players', () => {
      const players = []
      for (const i in connections) {
        connections[i] === null ? players.push(false) : players.push(true)
      }
      const allReady = players.every(el => el)
      if (allReady) io.emit('ready')
    })
  });

  socket.on("quit", () => {
    connections = [null, null]
    socket.disconnect()
    socket.broadcast.emit("quit");
  });

  socket.on("move", (cID, rID, color) => {
    socket.broadcast.emit("move", cID, rID, color);
  });

  socket.on("switch", () => {
    io.emit("switch");
  });

  socket.on("game-over", (winner) => {
    io.emit("game-over", winner);
  });

  socket.on("reveal-win", (winPositions) => {
    socket.broadcast.emit("reveal-win", winPositions);
  });

  socket.on("disconnect", () => {
    connections = [null, null]
  });

  setTimeout(() => {
    socket.emit('timeout')
    socket.disconnect()
  }, (1000 * 60 * 20))
});
