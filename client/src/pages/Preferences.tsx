
import React, { useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const Preferences = () => {
    const { id } = useParams();
    const { updatePreferences } = useSocket();
    const navigate = useNavigate();

    const [budget, setBudget] = useState('');
    const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
    const [dietary, setDietary] = useState({ vegan: false, glutenFree: false });

    const cuisines = [
        { name: 'Italian', icon: '🍝' },
        { name: 'Sushi', icon: '🍣' },
        { name: 'Burgers', icon: '🍔' },
        { name: 'Mexican', icon: '🌮' },
        { name: 'Thai', icon: '🍜' },
        { name: 'Healthy', icon: '🥗' },
    ];

    const toggleCuisine = (c: string) => {
        if (selectedCuisines.includes(c)) {
            setSelectedCuisines(selectedCuisines.filter(i => i !== c));
        } else {
            setSelectedCuisines([...selectedCuisines, c]);
        }
    };

    const handleSubmit = () => {
        updatePreferences({
            budget,
            cuisines: selectedCuisines,
            dietary
        });
        navigate(`/session/${id}`);
    };

    return (
        <div className="min-h-screen bg-background p-4 pb-24">
            <header className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-full shadow-sm">
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-xl font-bold">Preferences</h1>
            </header>

            <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2">What's the vibe <span className="text-primary">today?</span></h2>
                <p className="text-gray-500">Customize your group dining experience.</p>
            </div>

            {/* Budget */}
            <div className="mb-8">
                <h3 className="font-bold text-lg mb-4">Budget</h3>
                <div className="flex bg-gray-100 rounded-full p-1">
                    {['$', '$$', '$$$'].map((b) => (
                        <button
                            key={b}
                            onClick={() => setBudget(b)}
                            className={`flex-1 py-3 rounded-full font-bold transition-all ${
                                budget === b ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-200'
                            }`}
                        >
                            {b}
                        </button>
                    ))}
                </div>
            </div>

            {/* Cuisines */}
            <div className="mb-8">
                <h3 className="font-bold text-lg mb-4">Cuisines</h3>
                <div className="grid grid-cols-2 gap-3">
                    {cuisines.map((c) => (
                        <button
                            key={c.name}
                            onClick={() => toggleCuisine(c.name)}
                            className={`p-4 rounded-2xl flex items-center gap-3 transition-all ${
                                selectedCuisines.includes(c.name) 
                                    ? 'bg-orange-50 border-2 border-primary' 
                                    : 'bg-white border-2 border-transparent shadow-sm'
                            }`}
                        >
                            <span className="text-2xl">{c.icon}</span>
                            <span className="font-semibold">{c.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Dietary */}
            <div className="mb-8">
                <h3 className="font-bold text-lg mb-4">Dietary Restrictions</h3>
                <div className="space-y-3">
                    <div className="bg-white p-4 rounded-2xl shadow-sm flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">🌿</div>
                            <span className="font-semibold">Vegan</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={dietary.vegan} onChange={(e) => setDietary({...dietary, vegan: e.target.checked})} />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-sm flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">🌾</div>
                            <span className="font-semibold">Gluten-Free</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={dietary.glutenFree} onChange={(e) => setDietary({...dietary, glutenFree: e.target.checked})} />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>
                </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white shadow-lg rounded-t-3xl">
                <button 
                    onClick={handleSubmit}
                    className="w-full bg-primary text-white font-bold py-4 rounded-full flex items-center justify-center gap-2 shadow-lg hover:bg-orange-600"
                >
                    Find Restaurants <ArrowRight size={20} />
                </button>
            </div>
        </div>
    );
};

export default Preferences;
