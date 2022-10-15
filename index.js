const express = require('express')
const app = express()
const http = require('http').createServer(app).listen(8080)
const cors = require('cors')
const io = require('socket.io')(http,{cors:{
  origin:'*',
  credential:false
}})


const countObj = {}
function createCount(obj,num){
  if(!obj[num]){
    obj[num] = num
    return num 
  }else{
    num = num + 1
    return createCount(obj,num)
  }
}
let userData = new Map()
let roomDataObj = new Map()
io.on('connection',(socket)=>{
  //유저 접속
  
  socket.on('addUser',(nickName)=>{
    userData.set(socket.id,{nickName,id:socket.id,joinedRoom:''})
    io.to(socket.id).emit('joinUser','참가')
  })
  socket.on('isLogin',async(data)=>{
    let login = userData.get(socket.id) === undefined ? false : true
    io.emit('isLogin', login)
    let userList = []
    userData.forEach(e=>{
      userList.push(e.nickName)
    })
    login && io.to(socket.id).emit('userList',userList)
    io.emit('roomList',[...roomDataObj.values()])
  })
  
  socket.on('disconnect',(data)=>{
    let user = userData.get(socket.id)
    let room = roomDataObj.get(user?.joinedRoom)
    //참가한 방이 있으면 참가자 배열에서 삭제 
    if(room !== undefined){
      room.participant.delete(socket.id)
      room.seat.forEach((id,i)=>{
        if(id === socket.id){
          room.seat.splice(i,1)
        }
      })
      // 방에 참가자가 0명이면 방 없애버림
      if(room.participant.size < 1) {
        let number = room.roomNumber.replace(/[^0-9]/g,"")
        delete countObj[number]
        roomDataObj.delete(user?.joinedRoom)
        io.emit('roomList',[...roomDataObj.values()])
      }
    }
    // 나간유저 제거
    userData.delete(socket.id)
  })

  socket.on('createRoom',(data)=>{
    let count = createCount(countObj,1)
    let user = userData.get(socket.id)
    let serverRoomData = {
      state: data.roomPassword ? 'private' : 'public',
      personnel:1,
      roomName: data.roomName,
      roomPassword : data.roomPassword,
      roomNumber : `room${count}`,
      seat:[socket.id],
      chat:[]
    }
    serverRoomData.participant = new Map().set(socket.id,{
      id : socket.id,
      nickName : user.nickName,
      number : serverRoomData.seat.indexOf(socket.id)
    })
    let clientRoomData = {
      state: data.roomPassword ? 'private' : 'public',
      personnel:1,
      roomName: data.roomName,
      roomPassword : data.roomPassword !== '' ? true : false,
      roomNumber : `room${count}`,
    }
    clientRoomData.participant = new Map().set(socket.id,{
      id : socket.id
    })
    roomDataObj.set(data.roomName,serverRoomData)
    io.emit('roomList',[...roomDataObj.values()])
    io.to(socket.id).emit('joinRoom',clientRoomData.roomNumber)
    socket.join(clientRoomData.roomName)
    user['joinedRoom'] = clientRoomData.roomName
  })
  socket.on('joinRoom',(roomName)=>{
    let room = roomDataObj.get(roomName)
    let user = userData.get(socket.id)
    if(room === undefined) return
    user['joinedRoom'] = roomName
    room.seat.push(socket.id)
    room.participant.set(socket.id,{
      id : socket.id,
      nickName : user.nickName,
      number : room.seat.indexOf(socket.id)
    })
     
    io.to(socket.id).emit('joinRoom',room.roomNumber)
    socket.join(roomName)
  })
  socket.on('passwordCheck',(roomData)=>{
    let room = roomDataObj.get(roomData.roomName)
    if(room.roomPassword === roomData.roomPassword){
      io.to(socket.id).emit('joinRoom',room.roomNumber)
      socket.join(room.roomName)
    }else{
      io.to(socket.id).emit('alert',{
        head : '패스워드가 틀렸습니다!!!!',
        info : '다시 입력하세요'
      })
    }
  })

  socket.on('disconnectRoom',(data)=>{
    let user = userData.get(socket.id)
    let room = roomDataObj.get(user?.joinedRoom)
    // 방에서 나간 유저의 데이터를 방데이터와 유저 데이터에서 제거
    if(user){
      socket.leave(room.roomName)
      room.participant.delete(socket.id)
      room.seat.forEach((id,i)=>{
        if(id === socket.id){
          room.seat.splice(i,1)
        }
      })
      // 방에서 나간 유저의 방의 참가인원이 1보다 작으면 방을 없애버리자
      if(room?.participant.size < 1 ) {
        let number = room.roomNumber.replace(/[^0-9]/g,"")
        delete countObj[number]
        roomDataObj.delete(user.joinedRoom)
        io.emit('roomList',[...roomDataObj.values()])
        
      }
      user.joinedRoom = ''
    }
  })
  socket.on('access',(id)=>{
    let user = userData.get(id)
    if(user){
      let room = roomDataObj.get(user.joinedRoom)
      io.to(room.roomName).emit('seat',room.participant.get(socket.id))
    }
  })
  
  socket.on('chat',(ChatData)=>{
    let user = userData.get(socket.id)
    let room = roomDataObj.get(user.joinedRoom)
    room.chat.push(` ${user.nickName} :${ChatData}`) 
    io.to(user.joinedRoom).emit('chat',room.chat)    
  })
})
