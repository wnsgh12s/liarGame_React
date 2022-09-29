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
let userData = new Map()
let roomDataObj = new Map()
io.on('connection',(socket)=>{
  //유저 접속
  socket.on('addUser',(nickName)=>{
    userData.set(socket.id,{nickName,id:socket.id})
    io.emit('joinUser','참가')
  })
  socket.on('isLogin',async(data)=>{
    let login = userData.get(socket.id) === undefined ? false : true
    io.emit('isLogin', login)
    let arr = []
    userData.forEach(e=>{
      arr.push(e.nickName)
    })
    login && io.emit('userList',arr)
  })
  socket.on('disconnect',(data)=>{
    userData.delete(socket.id)
  })

  socket.on('createRoom',(data)=>{
    let roomData = {
      state: data.roomPassword ? 'public' : 'private',
      personnel:1,
      roomName: data.roomName,
      roomPassword : data.roomPassword
    }
    roomDataObj.set(data.roomName,roomData)
    io.emit('roomList',roomData)
    console.log(roomDataObj)
  })
})
