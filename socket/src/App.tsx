import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import io from 'socket.io-client'
import {Routes,Route, useNavigate} from 'react-router-dom'
import Login from './pages/Login'
import Lobby from './pages/Lobby';
import Game from './pages/Game';
const socket = io('localhost:8080')
function App() {
  const navigater =  useNavigate()
  let [socketData,setSocket] = useState(socket)
  let [userNick,setUserNick] = useState('')
  useEffect(()=>{
    socket.on('disconnect',()=>{
      navigater('/')
    })
  },[])
    return (
    <div className="App">
      <Routes>
        <Route path='/' element={<Login setUserNick={setUserNick} sk={socketData} />}></Route>
        <Route path='/lobby' element={<Lobby sk={socketData}/>}></Route>
        <Route path='/game/:id' element={<Game sk={socketData} userNick = {userNick} />}></Route>
      </Routes>
    </div>
  );
}

export default App;
