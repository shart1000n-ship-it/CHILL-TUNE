'use client';
import { useState } from 'react';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [message, setMessage] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    const res = await fetch('/api/signup', { method: 'POST', body: JSON.stringify({ email, username, password, name, graduationYear: graduationYear ? parseInt(graduationYear, 10) : undefined }) });
    const data = await res.json();
    if (res.ok) setMessage('Account created. You can now login.');
    else setMessage(data.error || 'Error');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-semibold">Register</h1>
        {message && <p className="text-sm">{message}</p>}
        <input className="w-full border rounded p-2" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="w-full border rounded p-2" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input className="w-full border rounded p-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full border rounded p-2" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <input className="w-full border rounded p-2" placeholder="Graduation Year (e.g., 2012)" value={graduationYear} onChange={(e) => setGraduationYear(e.target.value)} />
        <button type="submit" className="w-full bg-black text-white rounded p-2">Sign Up</button>
      </form>
    </div>
  );
}
