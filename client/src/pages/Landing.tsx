
import React, { useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { UserPlus, Users } from 'lucide-react';

const Landing = () => {
    const { createSession, joinSession, isConnected } = useSocket();
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [mode, setMode] = useState<'home' | 'join'>('home');

    const handleCreate = () => {
        if (!name) return alert('Please enter your name');
        createSession(name);
    };

    const handleJoin = () => {
        if (!name || !code) return alert('Please enter name and code');
        joinSession(code.toUpperCase(), name);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
            <div className="max-w-md w-full space-y-8">
                <div className="relative">
                    {/* Placeholder for Hero Image - using a simple circle for now */}
                    <div className="w-64 h-64 bg-secondary rounded-full mx-auto flex items-center justify-center mb-8 relative overflow-hidden">
                        <span className="text-6xl">🍔</span>
                    </div>
                </div>
                
                <h1 className="text-4xl font-bold text-text mb-2">Hungry?</h1>
                <p className="text-gray-500 mb-8">Decide where to eat, <span className="text-primary font-bold">together.</span></p>

                {/* Connection Status Indicator (optional but helpful) */}
                {!isConnected && (
                    <div className="text-orange-500 text-sm mb-4">Connecting to server...</div>
                )}

                {mode === 'home' ? (
                    <div className="space-y-4">
                        <input 
                            type="text" 
                            placeholder="Your Name" 
                            className="w-full p-4 rounded-xl border-2 border-gray-100 focus:border-primary outline-none text-lg bg-white"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <button 
                            onClick={handleCreate}
                            disabled={!isConnected}
                            className="w-full bg-primary text-white p-4 rounded-full text-lg font-bold shadow-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <UserPlus size={24} /> Create Group
                        </button>
                        <button 
                            onClick={() => setMode('join')}
                            disabled={!isConnected}
                            className="w-full text-text font-semibold p-4 flex items-center justify-center gap-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Users size={24} /> Join existing group
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <input 
                            type="text" 
                            placeholder="Your Name" 
                            className="w-full p-4 rounded-xl border-2 border-gray-100 focus:border-primary outline-none text-lg bg-white"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <input 
                            type="text" 
                            placeholder="Room Code (e.g. AB123)" 
                            className="w-full p-4 rounded-xl border-2 border-gray-100 focus:border-primary outline-none text-lg bg-white uppercase"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                        />
                        <button 
                            onClick={handleJoin}
                            disabled={!isConnected}
                            className="w-full bg-primary text-white p-4 rounded-full text-lg font-bold shadow-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Join Group
                        </button>
                        <button 
                            onClick={() => setMode('home')}
                            className="w-full text-gray-500 p-2"
                        >
                            Back
                        </button>
                    </div>
                )}
                
                <p className="text-gray-400 text-sm mt-8">v1.0.0</p>
            </div>
        </div>
    );
};

export default Landing;
