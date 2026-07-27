# 🗺️ SafarMate — "Har Safar Ka Ek Hi Mate"

> **SafarMate** is an interactive, solo-developed Web-based Smart Travel Planning Application tailored specifically for Indian itineraries[cite: 2, 4]. It replaces rigid pre-packaged tours and generic top-10 lists with dynamic, personalized daily schedules, travel logistics, stay choices, and local eating spots[cite: 2, 3, 4].

---

## 🛠️ Tech Stack & Architecture

* **Frontend:** HTML5, CSS3 (Custom CSS variables, Glassmorphism design system, flexbox/grid responsive layouts)[cite: 2, 3, 4]
* **Fonts & Icons:** Google Fonts (*Fraunces*, *Caveat*, *Work Sans*) and FontAwesome 6[cite: 2, 3, 4]
* **JavaScript:** Vanilla JavaScript ES6+ (DOM manipulation, dynamic suggestions engine, local storage management)[cite: 2, 3, 5]
* **Architecture:** Multi-page client-side web application leveraging `localStorage` for cross-page data persistence between forms and itinerary views[cite: 2, 3, 5]

---

## 🌟 Key Modules & Pages

### 1. Landing Page (`SafarMate.html` / `index.html`)
* **Hero Section:** Automated background image slideshow featuring iconic Indian travel destinations[cite: 2, 4].
* **Interactive Elements:** Smooth scroll-cue animations, active progress trail bar, animated counters, mobile navigation drawer, and traveler reviews[cite: 4].
* **Call To Action:** Direct launch into the interactive trip builder without forcing sign-up forms[cite: 2, 4].

### 2. Custom Trip Planner Form
* **Smart Destination Search:** Real-time autocomplete search field pre-loaded with major Indian destinations[cite: 2, 5].
* **Pill-Tag Selection:** Interactive tag system allowing users to pick up to **3 unique destinations** per trip[cite: 2, 5].
* **Trip Parameters:** Configurable trip duration (1–30 days) and budget tiers (**Budget / Balanced / Luxury**)[cite: 2].

### 3. Dynamic Itinerary Generator (`itinerary.html`)
* **Travel Logistics:** Automatic city-specific arrival guidance and local transport options (flights, metro, scooters, cabs)[cite: 3].
* **Spot-by-Spot Schedule:** Daily timeline broken into morning, afternoon, and evening activities with insider "Human Tips"[cite: 3].
* **Tailored Stays & Local Eats:** Handpicked accommodation and restaurant recommendations categorized directly by the chosen budget tier[cite: 3].

---

## 📋 Features at a Glance

| Feature | Description |
| :--- | :--- |
| **Solo Built Project** | Designed, styled, and coded end-to-end as an independent creation[cite: 2, 4]. |
| **No-Database Setup** | Leverages browser `localStorage` for seamless data transfer across pages[cite: 2, 3, 5]. |
