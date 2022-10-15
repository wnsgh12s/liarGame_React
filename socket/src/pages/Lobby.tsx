import { useEffect, useState } from 'react'
import { redirect, useNavigate } from 'react-router-dom'
import { Socket } from 'socket.io-client'
import { DefaultEventsMap } from 'socket.io/dist/typed-events'
import Modal from './Modal'

interface props {
  sk:Socket<DefaultEventsMap,DefaultEventsMap>
}
interface RoomList {
    state?:string
    personnel?:number
    roomName?:string
    roomPassword?:boolean
    roomNumber?: string
}
interface Alert {
  head : string
  info : string
}

 function Lobby({ sk }:props){
  let navigator = useNavigate()
  let [isLogin,setIsLogin] = useState<boolean>(false)
  let [userList,setUserList] = useState<string[]>()
  let [roomList,setRoomList] = useState<object[]>([])
  let [modal,setModal] = useState(false)
  let [passwordModal,setPasswordModal] = useState(false)
  let [alertModal,setAlertModal] = useState(false)
  let [alertData,setAlertData] = useState<Alert | undefined>()
  let [roomName,setRoomName] = useState<string | undefined>('')
  let copy:any = []
  useEffect(()=>{
    sk.on('connect',()=>{
      console.log('연결')
    })
    sk.emit('isLogin',sk.id)
    sk.on('isLogin',(login)=>{
      login ? setIsLogin(true) : setIsLogin(false)
    })
    sk.on('userList',(userList)=>{
      setUserList(userList)
    })
    sk.on('roomList',(roomData)=>{
      setRoomList([...roomData])
    })
    sk.on('joinRoom',(roomNumber)=>{
      navigator(`/Game/${roomNumber}`)
    })
    sk.on('alert',(data)=>{
      setAlertData(data)
      setAlertModal(true)
    })
    return()=>{
      sk.off('isLogin')
      sk.off('userList')
      sk.off('roomList')
      sk.off('connect')
      sk.off('joinRoom')
    }
  },[])
  return(
    <div className="lobby">
      <div className="lobby_inner">
        <header id="lobby_header">
          <h1><a href="/">LIAR GAME</a></h1>
          <nav className="option_gnb">
            <ul>
              <li><button className="sbtn">소리끄기</button></li>
            </ul>
          </nav>
        </header>
        <main id="lobby_main">
          <div className="l_table">
              <table>
                <thead>
                  <tr>
                    <th>방 상태</th>
                    <th>참가 인원</th>
                    <th>방 이름</th>
                    <th>방 번호</th>
                  </tr>
                </thead>
                <tbody>
                  {roomList?.map((data:RoomList,i:number)=>{
                    return(
                      <tr onClick={(e)=>{
                        if(data.roomPassword){
                          setRoomName(data.roomName)
                          setPasswordModal(true)
                        }else{
                          sk.emit('joinRoom',data.roomName)
                        }
                      }} 
                        key={i} className={data.roomNumber}>
                        <td>{data.state}</td>
                        <td>{data.personnel}</td>
                        <td>{data.roomName}</td>
                        <td>{data.roomNumber}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              <button 
                onClick={()=>{
                  setModal(true)
                }}
                className="create_room_btn"> 방 만들기</button>
          </div>
          <div className="r_table">
              <table>
                <thead>
                  <tr>
                    <th>접속자</th>
                  </tr>
                </thead>
                <tbody>
                    {userList && userList.map((e:string,i:number)=>{
                      return(
                        <tr key={i}>
                          <td>{e}</td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
          </div>
        </main>
      </div>
      {modal && <Modal head='방 만들기' info='방만들어주세요' on={setModal} type='createRoom' sk={sk}/>}
      {passwordModal && <Modal head='비밀번호 입력' rName={roomName}  on={setPasswordModal} type='password' sk={sk}/>}
      {alertModal && <Modal head={alertData?.head} info={alertData?.info}  on={setAlertModal} type='alert' sk={sk}/>}
    </div>
  )
}
export default Lobby