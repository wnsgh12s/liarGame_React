import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Socket } from 'socket.io-client'
import { DefaultEventsMap } from 'socket.io/dist/typed-events'
import Modal from './Modal'
// 프롭스
interface props {
  setUserNick:React.Dispatch<React.SetStateAction<string>>
  sk:Socket<DefaultEventsMap,DefaultEventsMap>
}
// 로그인 함수
function Login({setUserNick,sk}:props){
  const navigate = useNavigate()
  let [nickName,setNickname] = useState('')
  let [modal,setModal] = useState(false)
  useEffect(()=>{
    sk.on('joinUser', (data)=>{
      navigate('/lobby')
    })
    return()=>{
      sk.off('joinUser')
    }
  },[])
  return(
    <div className="login">
      <div className="login_box">
        <h1>LIAR GAME</h1>
        <div className="interaction_box">
          <button className="lbtn">왼쪽</button>
          <div className="character_box"></div>
          <button className="rbtn">오른쪽</button>
        </div>
        <input 
          onChange={(e)=>{
            setNickname(e.target.value)
          }} 
          //엔터키 입력했을때
          onKeyDown={(e)=>{
            if(e.key === 'Enter'){
              if(nickName.length > 8 || nickName ===''){
                setModal(true)
                return
              } 
              setUserNick(nickName)
              sk.emit('addUser',nickName)  
            } 
          }}
          type="text" placeholder="닉네임" />
        <button 
          className="jbtn" 
          //클릭했을때
          onClick={()=>{
            if(nickName.length > 8 || nickName ===''){
              setModal(true)
              return 
            }
            setUserNick(nickName) 
            sk.emit('addUser',nickName)
          }}>참가</button>
      </div>
      {modal && <Modal 
        head ='잘못된 형식' 
        info ='닉네임이 8자를 넘어갔거나 입력되지 않았습니다.' 
        on={setModal} 
        type='alert'
        />
      }
    </div>
  )
}
export default Login