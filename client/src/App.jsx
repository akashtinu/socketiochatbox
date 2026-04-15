import { useState, useEffect } from "react";
import io from "socket.io-client";
import "./App.css";

const socket = io.connect("http://localhost:3000");

export default function App() {
  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState([]);
  const [room, setRoom] = useState("");
  const [joined, setJoined] = useState(false);

  const joinRoom = () => {
    if (room.trim() !== "") {
      socket.emit("join_room", room);
      setJoined(true);
    }
  };

  const sendMessage = () => {
    if (msg.trim() === "") return;
    socket.emit("send_message", { message: msg, room });
    setMsg("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessages((prev) => [
        ...prev,
        { text: data.message, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
      ]);
    });

    return () => socket.off("receive_message");
  }, []);

  return (
    <div className="app">
      <div className="header">
        <h2>Chat room {joined && <span className="badge">{room}</span>}</h2>
        <p>{joined ? "Connected" : "Join a room to start chatting"}</p>
      </div>

      <div className="room-bar">
        <input
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          type="text"
          placeholder="Room code..."
        />
        <button onClick={joinRoom}>Join room</button>
      </div>

      <div className="messages">
        {messages.map((m, i) => (
          <div key={i} className="bubble">
            <div className="text">{m.text}</div>
            <div className="time">{m.time}</div>
          </div>
        ))}
      </div>

      <div className="input-bar">
        <input
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          onKeyDown={handleKeyDown}
          type="text"
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}