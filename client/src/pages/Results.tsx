
import React, { useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Clock, Navigation, RotateCcw } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
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

const Results = () => {
    const { session } = useSocket();
    const navigate = useNavigate();
    const restaurant = session?.restaurant;

    useEffect(() => {
        if (!session || !restaurant) {
            navigate('/');
        }
    }, [session, restaurant, navigate]);

    if (!restaurant) return <div>Loading result...</div>;

    const handleDirections = () => {
        window.open(`https://www.google.com/maps/search/?api=1&query=${restaurant.lat},${restaurant.lon}`, '_blank');
    };

    return (
        <div className="min-h-screen bg-background p-4 pb-32">
             <header className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate('/')} className="p-2 bg-white rounded-full shadow-sm">
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-xl font-bold">Your Group's Pick</h1>
            </header>

            <div className="bg-white rounded-3xl overflow-hidden shadow-lg mb-6">
                <div className="h-48 bg-gray-200 relative">
                     {/* Placeholder Image */}
                     <img 
                        src={`https://source.unsplash.com/800x600/?restaurant,${restaurant.cuisine},food`} 
                        className="w-full h-full object-cover" 
                        alt="Restaurant" 
                        onError={(e) => {
                            e.currentTarget.src = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80";
                        }}
                    />
                    <div className="absolute top-4 right-4 bg-secondary text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                        🏆 Top Match
                    </div>
                </div>
                
                <div className="p-6">
                    <h2 className="text-2xl font-bold mb-1">{restaurant.name}</h2>
                    <p className="text-gray-500 mb-4">{restaurant.cuisine} Cuisine • {restaurant.price}</p>

                    <div className="flex items-center gap-6 mb-6">
                        <div className="flex items-center gap-1">
                            <Star className="text-secondary fill-secondary" size={20} />
                            <span className="font-bold text-lg">{restaurant.rating || '4.5'}</span>
                            <span className="text-gray-400 text-sm">({restaurant.reviews || '100+'} reviews)</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-500">
                            <Clock size={18} />
                            <span>Open until 10 PM</span>
                        </div>
                    </div>

                    <div className="h-40 rounded-xl overflow-hidden relative z-0">
                         <MapContainer center={[restaurant.lat, restaurant.lon]} zoom={15} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            <Marker position={[restaurant.lat, restaurant.lon]}>
                                <Popup>{restaurant.name}</Popup>
                            </Marker>
                        </MapContainer>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <button 
                    onClick={handleDirections}
                    className="w-full bg-primary text-white font-bold py-4 rounded-full flex items-center justify-center gap-2 shadow-lg hover:bg-orange-600"
                >
                    <Navigation size={20} /> Get Directions
                </button>
                <button 
                    onClick={() => navigate('/')}
                    className="w-full bg-white text-primary border-2 border-primary/20 font-bold py-4 rounded-full flex items-center justify-center gap-2 hover:bg-orange-50"
                >
                    <RotateCcw size={20} /> Try Another
                </button>
            </div>
        </div>
    );
};

export default Results;
