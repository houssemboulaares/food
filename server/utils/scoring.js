const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};

const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};

/**
 * Score restaurants based on user preferences and location
 * @param {Array} restaurants - List of restaurant objects
 * @param {Object} preferences - Aggregated preferences (cuisines, budgets, dietary)
 * @param {Object} location - Center location {lat, lng}
 * @returns {Object} { rankedRestaurants, logs }
 */
const scoreRestaurants = (restaurants, preferences, location) => {
  const logs = [];
  logs.push("Starting scoring calculation...");

  // 1. Aggregate Preferences
  const allCuisines = new Set();
  const allBudgets = new Set();
  const dietaryRestrictions = {
    vegan: false,
    vegetarian: false,
    gluten_free: false,
  };

  // Iterate over all participant preferences
  // Expecting preferences to be a map or array of user preference objects
  // But typically in session.preferences it's a map: { userId: { cuisines: [], budget: '', dietary: [] } }

  Object.values(preferences).forEach((p) => {
    if (p.cuisines) p.cuisines.forEach((c) => allCuisines.add(c.toLowerCase()));
    if (p.budget) allBudgets.add(p.budget);
    if (p.dietary) {
      p.dietary.forEach((d) => {
        if (dietaryRestrictions.hasOwnProperty(d)) {
          dietaryRestrictions[d] = true;
        }
      });
    }
  });

  logs.push(
    `Aggregated Preferences: Cuisines=[${Array.from(allCuisines).join(
      ", ",
    )}], Budgets=[${Array.from(allBudgets).join(
      ", ",
    )}], Dietary=[${Object.entries(dietaryRestrictions)
      .filter(([, v]) => v)
      .map(([k]) => k)
      .join(", ")}]`,
  );

  const scored = restaurants.map((r) => {
    let score = 0;
    const reasons = [];

    // 2. Distance Weighting (Max 10 points)
    // Assume radius is roughly 2km based on Overpass query default
    const distance = calculateDistance(
      location.lat,
      location.lng || location.lon,
      r.lat,
      r.lon,
    );
    // Linear decay: 10 points at 0km, 0 points at 2km
    const distanceScore = Math.max(0, 10 * (1 - distance / 2));
    score += distanceScore;
    reasons.push(
      `Distance ${distance.toFixed(2)}km: +${distanceScore.toFixed(1)}`,
    );

    // 3. Dietary Restrictions (Critical)
    // If strict restriction is violated, huge penalty (effectively exclude)
    let isExcluded = false;

    if (dietaryRestrictions.vegan) {
      if (r.dietary.vegan === "no") {
        score -= 1000;
        isExcluded = true;
        reasons.push("Violates Vegan");
      } else if (r.dietary.vegan === "yes") {
        score += 10;
        reasons.push("Vegan Friendly (+10)");
      }
    }

    if (dietaryRestrictions.vegetarian) {
      if (r.dietary.vegetarian === "no") {
        score -= 1000;
        isExcluded = true;
        reasons.push("Violates Vegetarian");
      } else if (r.dietary.vegetarian === "yes") {
        score += 5;
        reasons.push("Vegetarian Friendly (+5)");
      }
    }

    if (dietaryRestrictions.gluten_free) {
      if (r.dietary.gluten_free === "no") {
        score -= 1000;
        isExcluded = true;
        reasons.push("Violates GF");
      } else if (r.dietary.gluten_free === "yes") {
        score += 10;
        reasons.push("GF Friendly (+10)");
      }
    }

    // 4. Cuisine Match
    if (allCuisines.has(r.cuisine.toLowerCase())) {
      score += 5;
      reasons.push(`Cuisine match (${r.cuisine}): +5`);
    } else if (
      Array.from(allCuisines).some((c) => r.cuisine.toLowerCase().includes(c))
    ) {
      score += 3;
      reasons.push(`Partial cuisine match (${r.cuisine}): +3`);
    }

    // 5. Budget Match
    if (allBudgets.has(r.price)) {
      score += 3;
      reasons.push(`Budget match (${r.price}): +3`);
    }

    // 6. Rating Boost
    if (r.rating) {
      const ratingScore = parseFloat(r.rating);
      score += ratingScore;
      reasons.push(`Rating ${r.rating}: +${ratingScore}`);
    }

    return {
      ...r,
      score,
      debug: reasons.join(", "),
    };
  });

  // 7. Deterministic Sort
  scored.sort((a, b) => {
    if (Math.abs(b.score - a.score) > 0.01) {
      return b.score - a.score; // Higher score first
    }
    // Tie-breaker: ID or Name
    return (a.id || a.name)
      .toString()
      .localeCompare((b.id || b.name).toString());
  });

  logs.push(`Top 3 Recommendations:`);
  scored.slice(0, 3).forEach((r, i) => {
    logs.push(
      `#${i + 1}: ${r.name} (Score: ${r.score.toFixed(1)}) - ${r.debug}`,
    );
  });

  return {
    rankedRestaurants: scored,
    logs,
  };
};

module.exports = { scoreRestaurants };
