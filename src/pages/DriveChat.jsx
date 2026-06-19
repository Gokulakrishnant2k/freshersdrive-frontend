import { useEffect, useState } from "react";
import axios from "../api/axiosInstance";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function DriveChat() {
  const { id } = useParams();
  const { auth } = useAuth();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    const res = await axios.get(`/api/chat/${id}`);
    setMessages(res.data);
  };

  const sendMessage = async () => {
    await axios.post(`/api/chat/${id}`, {
      userId: auth.user.id,
      userName: auth.user.name,
      message: text,
    });

    setText("");
    fetchMessages();
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Drive Discussion</h2>

      <div style={{ border: "1px solid #ccc", padding: "10px" }}>
        {messages.map((m) => (
          <p key={m.id}>
            <b>{m.userName}:</b> {m.message}
          </p>
        ))}
      </div>

      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type message..."
      />

      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default DriveChat;