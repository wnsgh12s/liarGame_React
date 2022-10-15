import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { isButtonElement } from "react-router-dom/dist/dom"
import { Socket } from "socket.io-client"
import { DefaultEventsMap } from "socket.io/dist/typed-events"

interface Modal { 
  head?:string
  info?:string
  on : React.Dispatch<React.SetStateAction<boolean>>
  type?:string
  sk?:Socket<DefaultEventsMap,DefaultEventsMap>
  rName?:string
}

function Modal({head,info,on,type,sk,rName}:Modal){
  return(
    <div className="modal">
      {type === 'alert' && <Alert head={head} info={info} on={on}/>}
      {type === 'createRoom' && <CrtRoom head={head} type={type} on={on} sk={sk}/>}
      {type === 'password' && <CrtRoom head={head} rName={rName} type={type} on={on} sk={sk}/>}
    </div>
  )
}

function Alert({head,info,on}:Modal){
  return(
    <div className="modal_box">
    <h1 className="head">{head || '내용없음'}</h1>
    <p className="info"> {info || '내용없음'} </p>
    <button onClick={()=>{on(false)}} >닫기</button>
    </div>
  )
}

function CrtRoom({head,type,on,sk,rName}:Modal){
  let navigator = useNavigate()
  let [roomName,setRoomName] = useState<string|undefined>('')
  let [roomPassword,setRoomPassword] = useState('')
  useEffect(()=>{
    setRoomName(rName)
  },[])
  return(
    <div className="modal_box">
      <h1 className="head">{head}</h1>
      <div className="input_box">
        {type === 'createRoom' && <div className="top">
          <label htmlFor="">방 제목</label>
          <input onChange={(e)=>{
            setRoomName(e.target.value)
            }} type="text" />
        </div>}
        <div className="bottom">
          <label htmlFor="">비밀번호</label>
          <input onChange={(e)=>{setRoomPassword(e.target.value)}} type="text" />
        </div>
      </div>
      <div className="btn_box">
        <button onClick={()=>{
          if(type === 'createRoom' && roomName === '' || roomName && roomName.length > 10) return alert('제목이 10글자보다 크거나 빈칸입니다')
          type === 'createRoom' ? sk?.emit('createRoom',{roomName,roomPassword}) : sk?.emit('passwordCheck',{roomPassword,roomName})
          on(false)
          }}>{type === 'createRoom' ? '방 만들기' : '방 참가'}</button>
          <button onClick={()=>{on(false)}}>취소</button>
      </div>
    </div>  
  )
}

export default Modal