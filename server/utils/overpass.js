
const findRestaurants = async (lat, lng, radius = 2000) => {
    // Using Overpass API to find restaurants
    const query = `
        [out:json][timeout:25];
        (
          node["amenity"="restaurant"](around:${radius},${lat},${lng});
        );
        out body;
        >;
        out skel qt;
    `;
    
    try {
        const response = await fetch('https://overpass-api.de/api/interpreter', {
            method: 'POST',
            body: query
        });
        
        if (!response.ok) {
            throw new Error(`Overpass API error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.elements
            .filter(e => e.tags && e.tags.name)
            .map(e => ({
                id: e.id,
                name: e.tags.name,
                cuisine: e.tags.cuisine || "International",
                price: e.tags.price_level || Math.random() > 0.6 ? "$$$" : Math.random() > 0.3 ? "$$" : "$", // Mock price if missing
                lat: e.lat,
                lon: e.lon,
                rating: (4 + Math.random()).toFixed(1), // Mock rating
                reviews: Math.floor(Math.random() * 500) + 50 // Mock reviews
            }));
    } catch (error) {
        console.error("Overpass Error:", error);
        // Fallback Mock Data if API fails
        return [
            { id: 1, name: "Golden Harvest Bistro", cuisine: "Italian", price: "$$$", lat: lat + 0.001, lon: lng + 0.001, rating: 4.8, reviews: 1200 },
            { id: 2, name: "Sushi Zen", cuisine: "Sushi", price: "$$", lat: lat - 0.001, lon: lng - 0.001, rating: 4.5, reviews: 850 },
            { id: 3, name: "Burger King", cuisine: "Burgers", price: "$", lat: lat + 0.002, lon: lng - 0.002, rating: 3.9, reviews: 2000 },
            { id: 4, name: "Taco Fiesta", cuisine: "Mexican", price: "$", lat: lat - 0.002, lon: lng + 0.002, rating: 4.2, reviews: 600 }
        ];
    }
};

module.exports = { findRestaurants };
