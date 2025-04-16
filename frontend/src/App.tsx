import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

interface IData {
  temperature: number;
  pressure: number;
  humidity: number;
  deviceId: number;
  readingDate?: Date;
}

interface Message {
  from: string;
  to: string;
  content: string;
}

type User = [string, string];

function App() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

  const [measurements, setMeasurements] = useState<IData[]>([]);
  const [sensorData, setSensorData] = useState<IData[]>([]);
  const listRef = useRef<HTMLDivElement>(null);

  const [nickname, setNickname] = useState('');
  const [serverNickname, setServerNickname] = useState('');

  const [userList, setUserList] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>();

  useEffect(() => {
    socket.on('message', (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on('private-message', (data) => {
      console.log(data);
      setMessages((prev) => [...prev, data]);
    });

    socket.on('sensor-data', (data) => {
      setSensorData((prev) => [...prev, data]);
    });

    socket.on('user-list', (data) => {
      setUserList(data);
    });

    socket.on('new-measurement', (data) => {
      setMeasurements((prev) => [...prev, data]);
    });

    return () => {
      socket.off('message');
      socket.off('private-message');
      socket.off('sensor-data');
      socket.off('new-measurement');
    };
  }, []);

  useEffect(() => {
    const { current } = listRef;
    if (current) {
      current.scrollTop = current.scrollHeight;
    }
  }, [sensorData]);

  const sendMessage = () => {
    if (!message.length) {
      return;
    }

    if (selectedUser) {
      socket.emit('private-message', {
        recipientId: selectedUser && selectedUser[0],
        content: message,
      });
      setSelectedUser(null);
    } else {
      socket.emit('message', {
        content: message,
      });
    }

    setMessage('');
  };

  const sendNickname = () => {
    if (nickname.length) {
      socket.emit('set-nickname', nickname);
      setServerNickname(nickname);
    }
  };

  const formatIoTData = ({
    temperature,
    pressure,
    humidity,
    deviceId,
  }: IData): string =>
    `${temperature.toFixed(
      2
    )}°C | ${pressure}hPa | ${humidity}% | Device ${deviceId}`;

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>WebSocket TWwAIR test App</h2>
      <h3>Broadcasted measurements (/api/measurements):</h3>
      <div>
        {measurements.map((data, index) => (
          <p key={index}>{formatIoTData(data)}</p>
        ))}
      </div>
      <h3>Sensor data:</h3>
      <div
        ref={listRef}
        style={{
          maxHeight: '200px',
          overflowX: 'hidden',
          overflowY: 'auto',
        }}
      >
        {sensorData.map((data, index) => (
          <p key={index}>{formatIoTData(data)}</p>
        ))}
      </div>
      <h3>Messages:</h3>
      <div>
        {messages.map((msg, index) => (
          <p key={index} style={{ color: msg.to ? 'green' : 'white' }}>
            💬 {msg.from ?? 'Anon'}
            {msg.to ? ` to ${msg.to}` : ''}: {msg.content}
          </p>
        ))}
      </div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Your message..."
      />
      <button onClick={sendMessage}>Send{selectedUser ? ' DM' : ''}</button>
      <p>Current nickname: {serverNickname.length ? serverNickname : 'Anon'}</p>
      <input
        type="text"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        placeholder="Nickname..."
      />
      <button onClick={sendNickname}>Set nickname</button>
      <h3>Online users (Click to select DM):</h3>
      <div>
        {userList.map((user, index) => (
          <p
            key={index}
            onClick={() => setSelectedUser(user)}
            style={{
              cursor: 'pointer',
              color:
                selectedUser && selectedUser[0] === user[0] ? 'green' : 'white',
            }}
          >
            {user[1]}
          </p>
        ))}
      </div>
    </div>
  );
}

export default App;
