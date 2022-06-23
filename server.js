const express = require("express");
const app = express();
const { createServer } = require("http");
const { Server } = require("socket.io");
const httpServer = createServer(app);

const io = new Server(httpServer, { });

app.use(express.static('./public'));

httpServer.listen(3000, () => {
  console.log("server listening on port 3000...")
});

let connections = [null, null]

io.on("connection", (socket) => {
  socket.on("multiplayer", () => {
    let playerIndex = -1;
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
});