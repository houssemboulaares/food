
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { createSession, joinSession, getSession, updateParticipant, updatePreferences, setLocation, removeParticipant } = require('./utils/sessionManager');
const { findRestaurants } = require('./utils/overpass');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('disconnect', () => {
        const code = socket.data.sessionCode;
        if (code) {
            console.log(`User ${socket.id} disconnected from session ${code}`);
            const updatedSession = removeParticipant(code, socket.id);
            
            if (updatedSession) {
                // Session still exists, broadcast update
                io.to(code).emit('room:update', updatedSession);
                console.log(`Broadcasted room update after disconnect to ${code}`);
            } else {
                console.log(`Session ${code} ended (empty)`);
            }
        }
    });

    socket.on('create_session', async ({ hostName }) => {
        const session = createSession(socket.id, hostName);
        socket.data.sessionCode = session.code; // Track session for disconnect
        await socket.join(session.code);
        console.log(`Host ${socket.id} created session ${session.code} and joined room`);
        socket.emit('session_created', session);
        // Also emit room update just in case, though it's just the host
        io.to(session.code).emit('room:update', session);
    });

    socket.on('join_session', async ({ code, userName }) => {
        console.log(`User ${socket.id} joining session ${code} as ${userName}`);
        const session = joinSession(code, socket.id, userName);
        if (session.error) {
            console.log(`Error joining session: ${session.error}`);
            socket.emit('error', session.error);
        } else {
            socket.data.sessionCode = session.code; // Track session for disconnect
            await socket.join(session.code);
            console.log(`User ${socket.id} joined room ${session.code}`);
            
            // Broadcast full room state to everyone in the room
            io.to(session.code).emit('room:update', session);
            console.log(`Emitted room:update to room ${session.code} with ${session.participants.length} participants`);
            
            // Also emit to the sender specifically to confirm join
            socket.emit('joined_session', session);
        }
    });

    socket.on('update_location', ({ code, location }) => {
        const session = setLocation(code, location);
        if (session) {
            io.to(code).emit('room:update', session);
        }
    });

    socket.on('update_preferences', ({ code, preferences }) => {
        const session = updatePreferences(code, socket.id, preferences);
        // Mark user as ready when they submit preferences
        const updatedSession = updateParticipant(code, socket.id, { isReady: true });
        if (updatedSession) {
            io.to(code).emit('room:update', updatedSession);
            
            // Check if all users are ready
            const allReady = updatedSession.participants.every(p => p.isReady);
            if (allReady && updatedSession.participants.length > 0) {
                // Trigger recommendation
                startRecommendation(code, updatedSession);
            }
        }
    });

});

async function startRecommendation(code, session) {
    try {
        session.status = 'deciding';
        io.to(code).emit('room:update', session);

        // 1. Get Location
        const loc = session.location || { lat: 37.7749, lng: -122.4194 }; // Default SF
        console.log(`Fetching restaurants for location:`, loc);
        
        // 2. Fetch Restaurants
        // Ensure we use lng (Leaflet) or lon (Overpass)
        const lat = loc.lat;
        const lng = loc.lng || loc.lon;
        const restaurants = await findRestaurants(lat, lng);
        console.log(`Found ${restaurants.length} restaurants`);
        
        // 3. Score Restaurants based on Preferences
        // Simple scoring: +1 for matching cuisine, filter by budget if possible
        // Aggregate preferences
        const allCuisines = [];
        const allBudgets = [];
        
        Object.values(session.preferences).forEach(p => {
            if (p.cuisines) allCuisines.push(...p.cuisines);
            if (p.budget) allBudgets.push(p.budget);
        });

        const scored = restaurants.map(r => {
            let score = 0;
            // Cuisine match
            if (allCuisines.some(c => r.cuisine.toLowerCase().includes(c.toLowerCase()))) {
                score += 2;
            }
            // Budget match (loose)
            if (allBudgets.includes(r.price)) {
                score += 1;
            }
            return { ...r, score };
        });

        scored.sort((a, b) => b.score - a.score);
        
        // Pick top result
        session.restaurant = scored[0] || restaurants[0];
        session.status = 'result';
        console.log(`Selected restaurant: ${session.restaurant?.name}`);
        
        io.to(code).emit('room:update', session);
    } catch (error) {
        console.error("Error in startRecommendation:", error);
    }
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
