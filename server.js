'use strict'

// set up the server
const express = require('express')
const app = express()
app.use(express.static('.'))
const server = app.listen(3000, () => console.log(`Server now listening.`))
const io = require('socket.io')(server)

io.on('connect', function onConnect (socket) {
  console.log(`${socket.id} connected.`)
  // each socket can be in only one room in addition to its socket.id room
  let currentRoom = 'default'
  socket.join(currentRoom)

  socket.on('move to room', function moveToRoom (newRoom) {
    socket.leave(currentRoom)
    socket.join(newRoom)
    currentRoom = newRoom
    socket.emit('message', {
      sender: '***SERVER***',
      content: `You moved to room ${newRoom}`
    })
  })

  socket.on('message', function onReceiveMessage (message) {
    socket.to(currentRoom).emit('message', {
      sender: socket.id,
      content: message
    })
    console.log(`Relayed "${message}" from ${socket.id} to #${currentRoom}`)
  })

  socket.on('disconnect', function onDisconnect (socket) {
    console.log(`${socket.id} disconnected.`)
  })
})