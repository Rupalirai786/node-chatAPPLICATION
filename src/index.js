const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage,generateLocationMessage} = require('./utils/messages')
const { addUser, removeUser,getUser,getUsersInRoom} = require('./utils/users')


const app = express()
const server = http.createServer(app)
const io = socketio(server)
const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

//let count = 0;
//io.on('connection' ,(socket)=>{
//    console.log('new web-socket connection')

//    socket.emit('message', 'welcome user')

//    socket.on('sendmessage',(message) =>{
//        io.emit('message' , message)
//    })



   // socket.emit('countupdated',count)

   // socket.on('increment',() => {
   // count++
     //socket.emit('countupdated',count)
   // io.emit('countupdated' ,count)
   // })
//})
app.use(express.static(publicDirectoryPath))


io.on('connection', (socket) => {
    console.log('New WebSocket connection')

    

    //socket.on('join' , (username,room) => {
     // socket.join(room)

      //socket.emit('message', 'Welcome!')
    //socket.emit('message' , generateMessage('welcome user!'))
    //socket.broadcast.to(room).emit('message' ,  generateMessage('${username} has joined'))//addition of to function will send or receive the message only in the particular room
    //})

    socket.on('join', (options,callback) => {

        const {error,user} = addUser({id : socket.id ,...options})
        if(error){
            return callback(error)
        }
        socket.join(user.room)
        console.log(user.room)

        socket.emit('message', generateMessage('ADMIN','Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage('ADMIN',`${user.username} has joined!`))
        io.to(user.room).emit('roomData',{
            room : user.room , 
            users : getUsersInRoom(user.room)
            
        })
        
        callback()

        // socket.emit, io.emit, socket.broadcast.emit
        // io.to.emit, socket.broadcast.to.emit
    })



    //socket.on('sendMessage', (message,callback) => {
      //  const user = getUser(socket.id)
     // const user = getUser(socket.id)
  
    //  const filter = new Filter()

     //   filter.addWords('bhenchod' , 'chutiya')
      //  if(filter.isProfane(message)){
      //      return callback('your message contains profanity!')
      //  }

        //io.to(user.room).emit('message', generateMessage(message))
   //     io.to(user.room).emit('message', generateMessage(user.username, message))

    //    callback()
    //})

    socket.on('sendMessage', (message, callback) => {
         user = getUser(socket.id)
        const filter = new Filter()
       
        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed!')
        }

        io.to(user.room).emit('message', generateMessage( user.username,message))
        callback()
    })


    socket.on('disconnect' , () =>{
      
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('message', generateMessage('ADMIN',`${user.username} has left!`))
            io.to(user.room).emit('roomData' , {
                room : user.room ,
                users : getUsersInRoom(user.room)
            })
        }

    })

   
    socket.on('sendLocation', (coords,callback) => {
        const use = getUser(socket.id)
        io.to(use.room).emit('locationMessage', generateLocationMessage(use.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        console.log(use)  
        callback()
    })

})

server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})
