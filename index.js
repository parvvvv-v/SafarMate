function initBgSlideshow() {
            const slides = document.querySelectorAll('.bg-slide');
            let currentSlide = 0;
            setInterval(() => {
                slides[currentSlide].classList.remove('active');
                currentSlide = (currentSlide + 1) % slides.length;
                slides[currentSlide].classList.add('active');
            }, 6000);
        }

        let selectedCities = [];
        const maxCities = 3;
        let debounceTimer;

        document.addEventListener('DOMContentLoaded', () => {
            initBgSlideshow();
            initAutocomplete();
            setupForm();
        });

        function initAutocomplete() {
            const input = document.getElementById('city-input');
            const box = document.getElementById('suggestions-box');

            input.addEventListener('input', (e) => {
                clearTimeout(debounceTimer);
                const query = e.target.value.trim();
                box.innerHTML = '';
                if (!query || query.length < 2) return;

                debounceTimer = setTimeout(() => {
                    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5`)
                        .then(res => res.json())
                        .then(data => {
                            box.innerHTML = '';
                            if(!data || data.length === 0) return;

                            data.forEach(item => {

                                const displayName = item.display_name.split(',')[0] + (item.address.state ? ', ' + item.address.state : '') + (item.address.country ? ', ' + item.address.country : '');
                                const cleanCity = item.display_name.split(',')[0];

                                const div = document.createElement('div');
                                div.className = 'suggestion-item';
                                div.innerHTML = `<span>${displayName}</span> <i class="fa-solid fa-plus"></i>`;
                                div.addEventListener('click', () => {
                                    addCity(cleanCity);
                                    input.value = '';
                                    box.innerHTML = '';
                                });
                                box.appendChild(div);
                            });
                        })
                        .catch(err => console.error("Error fetching places mapping:", err));
                }, 400);
            });

            document.addEventListener('click', (e) => {
                if (e.target !== input) box.innerHTML = '';
            });
        }

        function addCity(city) {
            if (selectedCities.includes(city)) return;
            if (selectedCities.length >= maxCities) {
                alert('Maximum of 3 destinations allowed per itinerary.');
                return;
            }
            selectedCities.push(city);
            renderTags();
        }

        function renderTags() {
            const container = document.getElementById('selected-tags');
            container.innerHTML = '';
            selectedCities.forEach((city, index) => {
                const pill = document.createElement('div');
                pill.className = 'tag-pill';
                pill.innerHTML = `<i class="fa-solid fa-location-dot" style="color:var(--marigold-500)"></i> ${city} <i class="fa-solid fa-xmark tag-remove" onclick="removeCity(${index})"></i>`;
                container.appendChild(pill);
            });
        }

        window.removeCity = function(index) {
            selectedCities.splice(index, 1);
            renderTags();
        };

        function setupForm() {
            document.getElementById('planner-form').addEventListener('submit', (e) => {
                e.preventDefault();
                const days = document.getElementById('trip-days').value;
                const budget = document.querySelector('input[name="budget"]:checked')?.value;

                if (selectedCities.length === 0) {
                    alert('Please select at least one destination.');
                    return;
                }

                const tripPlan = {
                    cities: selectedCities,
                    days: parseInt(days),
                    budget: budget
                };

                localStorage.setItem('userTripPlan', JSON.stringify(tripPlan));
                window.location.href = 'itinerary.html';
            });
        }
