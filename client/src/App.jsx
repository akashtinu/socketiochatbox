import { useState, useEffect } from "react";
import io from "socket.io-client";
import "./App.css";

const socket = io.connect("http://localhost:3000");

export default function App() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState([]);
  const [joined, setJoined] = useState(false);

  const joinRoom = () => {
    if (username && room) {
      socket.emit("join_room", room);
      setJoined(true);
    }
  };

  const sendMessage = () => {
    if (!msg) return;

    const data = {
      room,
      author: username,
      message: msg,
    };

    socket.emit("send_message", data);

    setMessages((prev) => [...prev, data]); // show instantly
    setMsg("");
  };

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => socket.off("receive_message");
  }, []);

  useEffect(() => {
    const box = document.querySelector(".chat-body");
    if (box) box.scrollTop = box.scrollHeight;
  }, [messages]);

  return (
    <div className="app">
      {/* SIDEBAR */}
      <div className="sidebar">
        <h2>Chats</h2>

        <input
          placeholder="Your name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          placeholder="Room id"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
        />

        <button onClick={joinRoom}>Start Chat</button>
      </div>

      {/* CHAT AREA */}
      <div className="chat">
        <div className="chat-header">
          {joined ? `Room: ${room}` : "Join a room"}
        </div>

        <div className="chat-body">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`msg ${
                m.author === username ? "me" : "other"
              }`}
            >
              <span className="name">{m.author}</span>
              <p>{m.message}</p>
            </div>
          ))}
        </div>

        <div className="chat-footer">
          <input
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            placeholder="Type a message"
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}