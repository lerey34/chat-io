const express = require('express')
const app = express()
const PORT = 3000 || process.env.PORT
const path = require('path')
const http = require('http')
const server = http.createServer(app)
const socketio = require('socket.io')
const io = socketio(server)

const formatMessage = require('./utils/messages')
const { userJoin, getCurrentUser, userLeaveChat, getRoomUser } = require('./utils/users')

const botName = "Chat Bot"

app.use(express.static(path.join(__dirname, 'public')))

io.on('connection', socket => {
  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room)
    socket.join(user.room)

    socket.emit('message', formatMessage(botName, 'Welcome to Chat!'))

    socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} has joined the chat`))

    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUser(user.room)
    })
  })

  socket.on('chatMessage', (msg) => {
    const user = getCurrentUser(socket.id)
    io.to(user.room).emit('message', formatMessage(user.username, msg))
  })

  socket.on('disconnect', () => {
    const user = userLeaveChat(socket.id)
    if (user) {
      io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the chat`))
    }
  })
})

server.listen(PORT, () => console.log(`Connected on port ${PORT}`))
