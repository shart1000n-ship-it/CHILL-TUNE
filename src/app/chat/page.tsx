'use client';
import { useEffect, useState } from 'react';

type Room = { id: string; name: string | null };

type Message = { id: string; roomId: string; senderId: string; content: string; createdAt: string };

export default function ChatPage() {
  const [tab, setTab] = useState<'alumni' | 'year'>('alumni');
  const [room, setRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  const load = async (t: 'alumni' | 'year') => {
    setRoom(null);
    setMessages([]);
    const res = await fetch(`/api/chat/room?type=${t}`);
    if (res.ok) {
      const data = await res.json();
      setRoom(data.room);
      setMessages(data.messages);
    }
  };

  useEffect(() => {
    load(tab);
  }, [tab]);

  const send = async () => {
    if (!room || !input.trim()) return;
    const res = await fetch('/api/chat/messages', { method: 'POST', body: JSON.stringify({ roomId: room.id, content: input }) });
    if (res.ok) {
      const msg = await res.json();
      setMessages((m) => [...m, msg]);
      setInput('');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Chat</h1>
      <div className="flex gap-2">
        <button onClick={() => setTab('alumni')} className={`px-3 py-1 rounded border ${tab==='alumni'?'bg-black text-white':'bg-white'}`}>Alumni Room</button>
        <button onClick={() => setTab('year')} className={`px-3 py-1 rounded border ${tab==='year'?'bg-black text-white':'bg-white'}`}>Your Year</button>
      </div>
      <div className="border rounded h-[60vh] flex flex-col">
        <div className="p-3 border-b text-sm">{room?.name ?? 'Loading...'}</div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {messages.map((m) => (
            <div key={m.id} className="text-sm">
              <span className="text-gray-500 mr-2">{new Date(m.createdAt).toLocaleTimeString()}</span>
              <span>{m.content}</span>
            </div>
          ))}
        </div>
        <div className="p-3 border-t flex gap-2">
          <input className="flex-1 border rounded p-2" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message" />
          <button onClick={send} className="bg-black text-white rounded px-4">Send</button>
        </div>
      </div>
    </div>
  );
}
