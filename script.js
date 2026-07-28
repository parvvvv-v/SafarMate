const INDIAN_CITIES = [
    "Delhi", "Mumbai", "Bangalore", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Surat",
    "Pune", "Jaipur", "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal", "Visakhapatnam",
    "Pimpri-Chinchwad", "Patna", "Vadodara", "Ghaziabad", "Ludhiana", "Agra", "Nashik", "Ranchi",
    "Faridabad", "Meerut", "Rajkot", "Kalyan-Dombivli", "Vasai-Virar", "Varanasi", "Srinagar",
    "Aurangabad", "Dhanbad", "Amritsar", "Navi Mumbai", "Allahabad", "Rourkela",
    "Jodhpur", "Coimbatore", "Gwalior", "Vijayawada", "Madurai", "Raipur", "Kota", "Chandigarh",
    "Guwahati", "Solapur", "Hubli-Dharwad", "Mysore", "Tiruchirappalli", "Bareilly", "Aligarh",
    "Tiruppur", "Gurgaon", "Moradabad", "Jalandhar", "Bhubaneswar", "Salem", "Warangal", "Kochi",
    "Noida", "Goa", "Shimla", "Manali", "Ooty", "Munnar", "Udaipur", "Jaisalmer", "Rishikesh"
];

let selectedCities = [];
const maxCities = 3;

document.addEventListener('DOMContentLoaded', () => {
    initCityAutocomplete();
    setupFormSubmission();
});

function initCityAutocomplete() {
    const input = document.getElementById('city-input');
    const suggestionsContainer = document.getElementById('suggestions-box');

    if (!input || !suggestionsContainer) return;

    input.addEventListener('input', (e) => {
        const value = e.target.value.trim().toLowerCase();
        suggestionsContainer.innerHTML = '';

        if (!value) return;

        const filtered = INDIAN_CITIES.filter(city =>
            city.toLowerCase().includes(value)
        ).slice(0, 5);

        filtered.forEach(city => {
            const div = document.createElement('div');
            div.className = 'suggestion-item';
            div.textContent = city;
            div.addEventListener('click', () => addCity(city, input, suggestionsContainer));
            suggestionsContainer.appendChild(div);
        });
    });

    document.addEventListener('click', (e) => {
        if (e.target !== input) {
            suggestionsContainer.innerHTML = '';
        }
    });
}

function addCity(city, input, container) {
    if (selectedCities.includes(city)) {
        alert('This city has already been chosen!');
        input.value = '';
        container.innerHTML = '';
        return;
    }
    if (selectedCities.length >= maxCities) {
        alert('You can select a maximum of 3 unique cities.');
        input.value = '';
        container.innerHTML = '';
        return;
    }

    selectedCities.push(city);
    input.value = '';
    container.innerHTML = '';
    renderTags();
}

function renderTags() {
    const tagsContainer = document.getElementById('selected-tags');
    tagsContainer.innerHTML = '';

    selectedCities.forEach((city, index) => {
        const tag = document.createElement('span');
        tag.className = 'city-tag';
        tag.innerHTML = `${city} <i class="close-btn" onclick="removeCity(${index})">&times;</i>`;
        tagsContainer.appendChild(tag);
    });
}

window.removeCity = function(index) {
    selectedCities.splice(index, 1);
    renderTags();
};

function setupFormSubmission() {
    const form = document.getElementById('planner-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const days = document.getElementById('trip-days').value;
        const budget = document.querySelector('input[name="budget"]:checked')?.value;

        if (selectedCities.length === 0) {
            alert('Please select at least one destination city.');
            return;
        }
        if (!days || days < 1 || days > 30) {
            alert('Please enter a valid duration between 1 and 30 days.');
            return;
        }

        const tripData = {
            cities: selectedCities,
            days: parseInt(days),
            budget: budget
        };
        localStorage.setItem('userTripPlan', JSON.stringify(tripData));

        window.location.href = 'itinerary.html';
    });
}
