import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/chat.css";
import axios from "axios";
import { allUsers, host } from "../utils/ApiRoutes";
import Contacts from "../components/Contacts";
import Welcome from "../components/Welcome";
import ChatComponent from "../components/ChatComponent";
import {io} from "socket.io-client"
function Chat() {
  const socket = useRef()
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [currentUser, setCurrentUser] = useState("");
  const [currentChat, setCurrentChat] = useState(undefined);
  useEffect(() => {
    if (!localStorage.getItem("chat-app-user")) {
      navigate("/auth/v1/671uy885/login");
    } else {
      loadCurrentUser();
    }
  }, []);
  useEffect(()=>{
    if(currentUser){
      socket.current = io(host)
      socket.current.emit("add-user", currentUser._id)
    }
  },[currentUser])

  const loadCurrentUser = async () => {
    const cUser = await JSON.parse(localStorage.getItem("chat-app-user"));
    setCurrentUser(cUser);
    // Load contacts after setting currentUser
    loadContacts(cUser);
  };

  const loadContacts = async (user) => {
    try {
      if (user) {
        const response = await axios.get(`${allUsers}/${user._id}`);
        setContacts(response.data);
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  };

  const close = () =>{
    setCurrentChat(undefined)
  }
  const handleChatChange = (chat) => {
    setCurrentChat(chat);
  };

  return (
    <>
      <div className="chat-wrapper">
        <div className="chat-container">
          <div className="chat-user-list">
            <Contacts
              contacts={contacts}
              currentUser={currentUser}
              changeChat={handleChatChange}
            />
          </div>
          <div className="chat-box">
            {currentChat === undefined ? (
              <Welcome currentUser={currentUser} />
            ) : (
              <>
              <div className="close">  </div>
              <ChatComponent currentChat={currentChat} currentUser= {currentUser} close = {close} socket={socket}/> 
              </>
            
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Chat;
