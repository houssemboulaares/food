import React, { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { useParams, useNavigate } from 'react-router-dom';
import { Copy, MapPin, CheckCircle, Utensils } from 'lucide-react';
import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const WaitingRoom = () => {
    const { id } = useParams();
    const { session, updateLocation, socket } = useSocket();
    const navigate = useNavigate();
    const [showMap, setShowMap] = useState(false);

    useEffect(() => {
        if (!session) {
            navigate('/');
        }
    }, [session, navigate]);

    if (!session) return <div className="p-8 text-center">Loading session...</div>;

    const myParticipant = session.participants.find(p => p.id === socket?.id);
    const isHost = myParticipant?.isHost;
    const hostName = session.participants.find(p => p.isHost)?.name || 'Host';
    const unreadyParticipants = session.participants.filter(p => !p.isReady);
    const readyCount = session.participants.length - unreadyParticipants.length;
    const totalCount = session.participants.length;

    const getWaitingMessage = () => {
        if (session.status === 'deciding') {
            return "Finding the perfect place for you...";
        }
        if (!session.location) {
            return isHost ? "Choose where to search for food" : `${hostName} is picking a location...`;
        }
        if (unreadyParticipants.length === 0) {
            return "Everyone is ready!";
        }
        const names = unreadyParticipants.map(p => p.name).join(', ');
        return `Waiting for: ${names}`;
    };

    const handleCopyCode = () => {
        navigator.clipboard.writeText(session.code);
        // Simple alert or toast could go here
    };

    const LocationMarker = () => {
        useMapEvents({
            click(e) {
                updateLocation(e.latlng);
                setShowMap(false);
            },
        });
        return null;
    }

    return (
        <div className="min-h-screen bg-background p-4 pb-32">
            <header className="flex justify-between items-center mb-8">
                <button onClick={() => navigate('/')} className="text-2xl">←</button>
                <h1 className="text-xl font-bold">Waiting Room</h1>
                <div className="w-8"></div>
            </header>

            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2">
                    {!session.location ? (isHost ? "Set Location 📍" : `Waiting for ${hostName}...`) :
                        session.status === 'deciding' ? "Choosing... 🤔" :
                            "Who's Hungry? 🍽️"}
                </h2>
                <p className="text-gray-500">
                    {getWaitingMessage()}
                </p>

                <div className="bg-orange-100 text-primary font-bold py-3 px-6 rounded-full inline-flex items-center gap-2 mt-4 cursor-pointer" onClick={handleCopyCode}>
                    <Copy size={18} /> Code: {session.code}
                </div>
            </div>

            {/* Participants Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                {session.participants.map(p => (
                    <div key={p.id} className="bg-white p-4 rounded-2xl shadow-sm flex flex-col items-center relative">
                        {p.isReady && <CheckCircle className="absolute top-2 right-2 text-green-500" size={20} />}
                        <div className="w-16 h-16 bg-gray-200 rounded-full mb-2 overflow-hidden">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${p.name}`} alt="avatar" />
                        </div>
                        <span className="font-bold">{p.name}</span>
                        <span className={`text-sm ${p.isReady ? 'text-green-500' : 'text-gray-400'}`}>
                            {p.isReady ? 'Ready!' : p.isHost ? 'Host' : 'Joining...'}
                        </span>
                    </div>
                ))}

                <div className="border-2 border-dashed border-orange-200 rounded-2xl flex flex-col items-center justify-center p-4 cursor-pointer hover:bg-orange-50 min-h-[140px]" onClick={handleCopyCode}>
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-2 shadow-sm text-primary font-bold text-xl">+</div>
                    <span className="text-primary font-bold">Invite</span>
                    <span className="text-xs text-primary/60">Add friend</span>
                </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] rounded-t-3xl">
                <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="flex -space-x-2">
                        {session.participants.slice(0, 3).map(p => (
                            <img key={p.id} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${p.name}`} className="w-8 h-8 rounded-full border-2 border-white bg-gray-100" alt="" />
                        ))}
                    </div>
                    <span className="font-bold">{readyCount}/{totalCount} friends are ready...</span>
                </div>

                {!showMap && session.location && (
                    <div className="text-center mb-4 text-sm text-gray-500 flex justify-center items-center gap-1">
                        <MapPin size={16} /> Location set
                    </div>
                )}

                {isHost && (
                    <button
                        onClick={() => setShowMap(true)}
                        className="w-full bg-secondary text-white font-bold py-4 rounded-full mb-4 shadow-lg hover:brightness-105"
                    >
                        {session.location ? "Change Location" : "Set Location"}
                    </button>
                )}

                {/* User Action Button */}
                {!myParticipant?.isReady ? (
                    <button
                        onClick={() => navigate(`/session/${id}/preferences`)}
                        className="w-full bg-primary text-white font-bold py-4 rounded-full flex items-center justify-center gap-2 shadow-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!session.location}
                    >
                        <Utensils /> {session.location ? "I'm Hungry" : `Waiting for ${hostName}...`}
                    </button>
                ) : (
                    <button className="w-full bg-gray-100 text-gray-400 font-bold py-4 rounded-full cursor-default">
                        You are ready!
                    </button>
                )}
            </div>

            {/* Location Picker Modal */}
            {showMap && (
                <div className="fixed inset-0 z-50 bg-white flex flex-col">
                    <div className="p-4 flex justify-between items-center shadow-md z-10 bg-white">
                        <h2 className="font-bold">Tap map to set location</h2>
                        <button onClick={() => setShowMap(false)}>Close</button>
                    </div>
                    <MapContainer center={[37.7749, -122.4194]} zoom={13} style={{ height: '100%', width: '100%' }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <LocationMarker />
                    </MapContainer>
                </div>
            )}
        </div>
    );
};

export default WaitingRoom;