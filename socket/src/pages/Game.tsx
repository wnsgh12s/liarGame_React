import { useEffect, useRef, useState } from 'react'
import {useNavigate} from 'react-router-dom'
import { Socket } from 'socket.io-client'
import { DefaultEventsMap } from 'socket.io/dist/typed-events'

interface Props {
  sk:Socket<DefaultEventsMap,DefaultEventsMap>
  userNick : string
}

function Game({sk,userNick}:Props){
  const scrollRef = useRef<HTMLInputElement>(null)
  
  let [inputData,setInputData] = useState('')
  let [chatDatas,setChatDatas] = useState([])
  let [leftPlayerDatas,setLeftPlayerDatas] = useState(['','','',''])
  let [rightPlayerDatas,setRightPlayerDatas] = useState(['','','',''])
  useEffect(()=>{
    sk.emit('access',sk.id)
    sk.on('seat',(seat)=>{
      let copy
      if(seat.number > 3){
        copy = [...rightPlayerDatas]
        copy[seat.number] = seat.nickName
        setRightPlayerDatas(copy)
        console.log(copy)
      }else{
        copy = [...leftPlayerDatas]
        copy[seat.number] = seat.nickName
        setLeftPlayerDatas(copy)
        console.log(copy)
      }
    })
    sk.on('chat',(chatData)=>{
      setChatDatas(chatData)
    })
    return()=>{ 
      sk.off('chat')
      sk.off('seat')
    }
  },[])

  useEffect(()=>{
    if(scrollRef.current){  
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  },[chatDatas])
  let navigater = useNavigate()

  return(
    <div className="game">
      <div className="game_inner">
        <header id="game_header">
          <nav>
            <ul className="info_gnb">
              <li>주제:음식</li>
              <li>제시어:감자</li>
            </ul>
            <ul className="interaction_gnb">
              <li><button className="leave_btn" onClick={()=>{
                navigater('/lobby')
                sk.emit('disconnectRoom','이게왜?')
                }}>나가기</button></li>
              <li><button className="ready_btn">준비</button></li>
            </ul>
          </nav>
        </header>
        <main id="game_main">
          <div className="left_player">
            {
              leftPlayerDatas && leftPlayerDatas.map((e,i)=>{
                return(
                  <div className={`players${i+1}`}>{e}</div>
                )
              })
            }
          </div>
          <div className="chat_board">
            <div className="chat_box" ref={scrollRef}>
             {chatDatas && chatDatas.map((chat:string,i:number)=>{
              return(
                <div key={i} className="chat">{chat}</div>
              ) 
             })}
            </div>
            <div className="chat_input">
              <input 
                onChange={(e)=>{setInputData(e.target.value)}} 
                onKeyDown={(e)=>{
                  if(e.key === 'Enter'){
                    e.currentTarget.value = ''
                    setInputData('')
                    sk.emit('chat',inputData)
                  }
                }} type="text" />
              <button className="chat_btn">전송</button>
            </div>
          </div>
          <div className="right_player">
            <div className="player5"></div>
            <div className="player6"></div>
            <div className="player7"></div>
            <div className="player8"></div>
          </div>
          
        </main>
      </div>
    </div>
  )
}
export default Game