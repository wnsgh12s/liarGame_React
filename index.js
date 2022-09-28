const express = require('express')
const app = express()
const http = require('http').createServer(app)
const cors = require('cors')
const io = require('socket.io')(http,{cors:{
  origin:'*',
  credential:false
}})

http.listen('8080',()=>{
  console.log('헤위')
})

io.on('connection',(socket)=>{
  socket.on('addUser',(data)=>{
    console.log(data)
  })
})

app.get('*', function (요청, 응답) {
  응답.sendFile(path.join(__dirname, '/react-project/build/index.html'));
});