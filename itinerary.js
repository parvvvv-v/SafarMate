const GEOAPIFY_API_KEY = "https://api.geoapify.com/v2/places?categories=accommodation.hotel&filter=place:511dd0b89fd5c45340593306d2871dc53540f00101f9014ca6040000000000c0020b920305496e646961&apiKey=YOUR_API_KEY";

        const GEOAPIFY_GEOCODE_URL = "https://api.geoapify.com/v1/geocode/search";
        const GEOAPIFY_PLACES_URL = "https://api.geoapify.com/v2/places";

        const ATTRACTION_CATEGORIES = "tourism.sights,tourism.attraction,entertainment.museum,entertainment.culture,natural,leisure.park,heritage,religion.place_of_worship,commercial.marketplace";
        const HOTEL_CATEGORIES = "accommodation.hotel,accommodation.guest_house";
        const RESTAURANT_CATEGORIES = "catering.restaurant,catering.cafe";

        const NOISE_NAME_PATTERNS = /^(parking|atm|toilet|bus stop|petrol pump|fuel station)\b/i;

        function hasApiKey() {
            return GEOAPIFY_API_KEY && GEOAPIFY_API_KEY.indexOf("YOUR_") !== 0;
        }

        function getTripData() {
            try {
                const raw = localStorage.getItem('userTripPlan');
                return raw ? JSON.parse(raw) : null;
            } catch (e) { return null; }
        }

        function splitDaysAcrossCities(totalDays, cities) {
            const n = cities.length;
            const base = Math.floor(totalDays / n);
            let remainder = totalDays % n;
            return cities.map(() => {
                let d = base;
                if (remainder > 0) { d += 1; remainder -= 1; }
                return Math.max(d, 1);
            });
        }

        async function geocodeCity(city) {
            const url = `${GEOAPIFY_GEOCODE_URL}?text=${encodeURIComponent(city + ", India")}&limit=1&apiKey=${GEOAPIFY_API_KEY}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error("Geocode failed for " + city);
            const data = await res.json();
            const feature = data.features && data.features[0];
            if (!feature) throw new Error("No geocode result for " + city);
            const [lon, lat] = feature.geometry.coordinates;
            return { lat, lon };
        }

        async function fetchPlaces(lat, lon, categories, limit, radiusMeters = 20000) {
            const filter = `circle:${lon},${lat},${radiusMeters}`;
            const bias = `proximity:${lon},${lat}`;
            const url = `${GEOAPIFY_PLACES_URL}?categories=${categories}&filter=${filter}&bias=${bias}&limit=${limit}&apiKey=${GEOAPIFY_API_KEY}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error("Places fetch failed");
            const data = await res.json();
            const features = data.features || [];
            return features
                .filter(f => f.properties && f.properties.name && !NOISE_NAME_PATTERNS.test(f.properties.name))
                .map(f => ({
                    name: f.properties.name,
                    address: f.properties.formatted || f.properties.address_line2 || f.properties.address_line1 || "",
                    categories: f.properties.categories || [],
                    lat: f.properties.lat,
                    lon: f.properties.lon
                }))
                .filter((p, idx, arr) => arr.findIndex(q => q.name.toLowerCase() === p.name.toLowerCase()) === idx);
        }

        async function fetchPlacesWithRetry(lat, lon, categories, limit) {
            let results = await fetchPlaces(lat, lon, categories, limit, 20000);
            if (results.length < Math.min(limit, 6)) {
                const wider = await fetchPlaces(lat, lon, categories, limit, 45000);
                const merged = [...results, ...wider]
                    .filter((p, idx, arr) => arr.findIndex(q => q.name.toLowerCase() === p.name.toLowerCase()) === idx);
                results = merged;
            }
            return results;
        }

        function generateFallbackAttractions(city) {
            return [
                { name: `Historic ${city} Square & Cultural Core`, address: `Old City Area, ${city}` },
                { name: `${city} Grand Museum & Art Galleries`, address: `Museum Road, ${city}` },
                { name: `Panoramic ${city} Viewpoint & Leisure Park`, address: `Hilltop District, ${city}` },
                { name: `${city} Heritage Bazaar & Craft Lanes`, address: `Old Market Lane, ${city}` },
                { name: `${city} Riverside Promenade`, address: `Riverfront Road, ${city}` },
                { name: `${city} Botanical Gardens`, address: `Garden Circle, ${city}` },
                { name: `${city} Old Fort & Ramparts`, address: `Fort Road, ${city}` },
                { name: `${city} Central Temple Complex`, address: `Temple Street, ${city}` },
                { name: `${city} Lakeside Gardens`, address: `Lake View Road, ${city}` },
                { name: `${city} Artisan Craft Village`, address: `Craft Colony, ${city}` },
                { name: `${city} Planetarium & Science Center`, address: `Science Park, ${city}` },
                { name: `${city} Sunset Point & Nature Trail`, address: `Eastern Hills, ${city}` }
            ];
        }

        function generateFallbackVenues(city, type) {
            if (type === 'hotel') {
                return [
                    { name: `The Grand ${city} Residency`, address: `City Center, ${city}` },
                    { name: `${city} Heritage Inn`, address: `Old Town Road, ${city}` },
                    { name: `${city} Palm Court Hotel`, address: `Civil Lines, ${city}` },
                    { name: `${city} Riverside Suites`, address: `Riverfront Road, ${city}` },
                    { name: `${city} Skyline Boutique Stay`, address: `Business District, ${city}` }
                ];
            }
            return [
                { name: `${city} Spice Route Kitchen`, address: `Food Street, ${city}` },
                { name: `${city} Corner Bistro`, address: `Market Road, ${city}` },
                { name: `${city} Tandoor House`, address: `Old Market Lane, ${city}` },
                { name: `${city} Garden Cafe`, address: `Park Avenue, ${city}` },
                { name: `${city} Rooftop Dining`, address: `Central Square, ${city}` }
            ];
        }

        function getBudgetRates(budget, option) {
            if (option === 'hotel') {
                if (budget === 'Low') return { p: "₹1,200–2,000/night", label: "Backpacker Stay / Hostel" };
                if (budget === 'Luxury') return { p: "₹18,000–35,000/night", label: "Ultra Heritage Resort & Spa" };
                return { p: "₹4,500–7,500/night", label: "Premium Boutique Hotel" };
            } else {
                if (budget === 'Low') return { p: "₹300–500 for two", label: "Famous Local Street Corner" };
                if (budget === 'Luxury') return { p: "₹4,000–6,500 for two", label: "Gourmet Fine-Dining Hall" };
                return { p: "₹1,200–2,000 for two", label: "Traditional Family Bistro" };
            }
        }

        const HOTEL_IMAGES = [
            "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=200&q=80",
            "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=200&q=80",
            "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=200&q=80",
            "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=200&q=80"
        ];
        const FOOD_IMAGES = [
            "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=200&q=80",
            "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=200&q=80",
            "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=200&q=80",
            "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=200&q=80"
        ];

        let anyFallbackUsed = false;

        async function buildCityProfile(city, daysForCity = 1) {

            const attractionTarget = Math.min(60, Math.max(24, daysForCity * 3 + 9));

            if (!hasApiKey()) {
                anyFallbackUsed = true;
                return {
                    city,
                    attractions: generateFallbackAttractions(city),
                    hotels: generateFallbackVenues(city, 'hotel'),
                    restaurants: generateFallbackVenues(city, 'food'),
                    live: false
                };
            }
            try {
                const { lat, lon } = await geocodeCity(city);
                const [attractions, hotels, restaurants] = await Promise.all([
                    fetchPlacesWithRetry(lat, lon, ATTRACTION_CATEGORIES, attractionTarget),
                    fetchPlacesWithRetry(lat, lon, HOTEL_CATEGORIES, 15),
                    fetchPlacesWithRetry(lat, lon, RESTAURANT_CATEGORIES, 15)
                ]);

                const finalAttractions = attractions.length ? attractions : generateFallbackAttractions(city);
                const finalHotels = hotels.length ? hotels : generateFallbackVenues(city, 'hotel');
                const finalRestaurants = restaurants.length ? restaurants : generateFallbackVenues(city, 'food');

                if (!attractions.length || !hotels.length || !restaurants.length) anyFallbackUsed = true;

                return { city, attractions: finalAttractions, hotels: finalHotels, restaurants: finalRestaurants, live: true };
            } catch (err) {
                console.warn("Live data unavailable for", city, err);
                anyFallbackUsed = true;
                return {
                    city,
                    attractions: generateFallbackAttractions(city),
                    hotels: generateFallbackVenues(city, 'hotel'),
                    restaurants: generateFallbackVenues(city, 'food'),
                    live: false
                };
            }
        }

        function shortCategory(categories) {
            if (!categories || !categories.length) return "landmark";
            const readable = categories.find(c => c.includes('.')) || categories[0];
            const parts = readable.split('.');
            return parts[parts.length - 1].replace(/_/g, ' ');
        }

        async function init() {
            const trip = getTripData();
            if (!trip || !trip.cities || trip.cities.length === 0) {
                window.location.href = 'index.html';
                return;
            }

            const { cities, days, budget } = trip;
            const daysPerCity = splitDaysAcrossCities(days, cities);

            document.getElementById('hero-title').textContent = cities.join(' + ') + ' Itinerary';
            const pillsContainer = document.getElementById('meta-pills');
            pillsContainer.innerHTML = `
                <span class="meta-pill"><i class="fa-regular fa-calendar"></i> ${days} Day${days > 1 ? 's' : ''}</span>
                <span class="meta-pill"><i class="fa-solid fa-wallet"></i> ${budget} Tier</span>
                <span class="meta-pill"><i class="fa-solid fa-city"></i> ${cities.length} Destination${cities.length > 1 ? 's' : ''}</span>
            `;

            const cityProfiles = await Promise.all(
                cities.map((city, idx) => buildCityProfile(city, daysPerCity[idx]))
            );
            const profileByCity = {};
            cityProfiles.forEach(p => { profileByCity[p.city] = p; });

            const badge = document.getElementById('data-badge');
            const badgeText = document.getElementById('data-badge-text');
            const fallbackNote = document.getElementById('fallback-note');
            if (hasApiKey()) {
                badge.style.display = 'inline-flex';
                badgeText.textContent = anyFallbackUsed
                    ? "Live places via Geoapify (curated fallback used where unavailable)"
                    : "Real attractions, stays & eats — live via Geoapify";
            } else {
                badge.style.display = 'inline-flex';
                badgeText.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Add a free Geoapify API key in the script to enable live place data`;
            }
            if (anyFallbackUsed) {
                fallbackNote.style.display = 'block';
                fallbackNote.textContent = "Note: prices are always estimated ranges for your budget tier, not live rates — no free public API exposes real-time hotel/restaurant pricing.";
            }

            const travelContainer = document.getElementById('travel-container');
            travelContainer.innerHTML = '';
            cities.forEach(city => {
                const card = document.createElement('div');
                card.className = 'travel-card';
                card.innerHTML = `
                    <div class="travel-card-header"><i class="fa-solid fa-route"></i> Connectivity in ${city}</div>
                    <p>Fly into the closest regional hub serving ${city}. Use prepaid city transit cards, certified electric rickshaws, or registered ride-shares to skip traffic choke-points.</p>
                `;
                travelContainer.appendChild(card);
            });

            const timelineContainer = document.getElementById('timeline-container');
            timelineContainer.innerHTML = '';
            let dayCounter = 1;
            const TIME_SLOTS = ["Morning", "Afternoon", "Evening"];

            cities.forEach((city, idx) => {
                const targetDays = daysPerCity[idx];
                const profile = profileByCity[city];
                const pool = profile.attractions;
                let globalIndex = 0;

                for (let d = 0; d < targetDays; d++) {
                    const node = document.createElement('div');
                    node.className = 'day-node';
                    node.style.animationDelay = `${(dayCounter - 1) * 0.08}s`;

                    const isRevisitRound = globalIndex >= pool.length && pool.length > 0;
                    node.innerHTML = `<div class="day-title">Day ${dayCounter} — Explore ${city}${isRevisitRound ? '<span class="revisit-flag">More of the city</span>' : ''}</div>`;

                    for (let s = 0; s < 3; s++) {
                        const spot = pool[globalIndex % pool.length];
                        globalIndex++;

                        const block = document.createElement('div');
                        block.className = 'time-block';
                        block.style.animationDelay = `${s * 0.06}s`;
                        const catLabel = shortCategory(spot.categories);
                        block.innerHTML = `
                            <div class="time-label"><i class="fa-regular fa-clock"></i> ${TIME_SLOTS[s]}</div>
                            <h4>${spot.name}</h4>
                            <p>Explore this well-known ${catLabel} while you're in ${city} — a solid pick for the ${TIME_SLOTS[s].toLowerCase()} slot of your day.</p>
                            ${spot.address ? `<div class="spot-address"><i class="fa-solid fa-location-dot"></i> ${spot.address}</div>` : ''}
                        `;
                        node.appendChild(block);
                    }

                    timelineContainer.appendChild(node);
                    dayCounter++;
                }
            });

            const hotelsContainer = document.getElementById('hotels-container');
            const diningContainer = document.getElementById('dining-container');
            hotelsContainer.innerHTML = '';
            diningContainer.innerHTML = '';

            const hotelMeta = getBudgetRates(budget, 'hotel');
            const foodMeta = getBudgetRates(budget, 'food');

            cities.forEach((city, cIndex) => {
                const profile = profileByCity[city];

                const hLabel = document.createElement('div');
                hLabel.className = 'city-group-label';
                hLabel.innerHTML = `<i class="fa-solid fa-location-dot"></i> Stays in ${city}`;
                hotelsContainer.appendChild(hLabel);

                profile.hotels.slice(0, 5).forEach((hotel, hIdx) => {
                    const hotelCard = document.createElement('div');
                    hotelCard.className = 'media-card';
                    hotelCard.style.animationDelay = `${(cIndex * 3 + hIdx) * 0.05}s`;
                    const img = HOTEL_IMAGES[(cIndex + hIdx) % HOTEL_IMAGES.length];
                    hotelCard.innerHTML = `
                        <img class="media-img" src="${img}" alt="Hotel accommodation" loading="lazy">
                        <div class="media-info">
                            <h4>${hotel.name}</h4>
                            <div class="city-tag">${hotelMeta.label}</div>
                            ${hotel.address ? `<div class="venue-address" title="${hotel.address}">${hotel.address}</div>` : ''}
                            <div class="price-tag"><i class="fa-solid fa-tag"></i> ${hotelMeta.p} <span class="est-label">(est.)</span></div>
                        </div>
                    `;
                    hotelsContainer.appendChild(hotelCard);
                });

                const dLabel = document.createElement('div');
                dLabel.className = 'city-group-label';
                dLabel.innerHTML = `<i class="fa-solid fa-location-dot"></i> Eats in ${city}`;
                diningContainer.appendChild(dLabel);

                profile.restaurants.slice(0, 5).forEach((rest, rIdx) => {
                    const foodCard = document.createElement('div');
                    foodCard.className = 'media-card';
                    foodCard.style.animationDelay = `${(cIndex * 3 + rIdx) * 0.05}s`;
                    const img = FOOD_IMAGES[(cIndex + rIdx) % FOOD_IMAGES.length];
                    foodCard.innerHTML = `
                        <img class="media-img" src="${img}" alt="Dining spot" loading="lazy">
                        <div class="media-info">
                            <h4>${rest.name}</h4>
                            <div class="city-tag">${foodMeta.label}</div>
                            ${rest.address ? `<div class="venue-address" title="${rest.address}">${rest.address}</div>` : ''}
                            <div class="price-tag"><i class="fa-solid fa-tag"></i> ${foodMeta.p} <span class="est-label">(est.)</span></div>
                        </div>
                    `;
                    diningContainer.appendChild(foodCard);
                });
            });

            document.getElementById('loader').style.display = 'none';
            document.getElementById('content-grid').style.display = 'block';
        }

        document.addEventListener('DOMContentLoaded', init);
