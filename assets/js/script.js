let latVar, longVar;
let googleMapsSection;
var service;
var infowindow;


document.addEventListener('DOMContentLoaded', function () {
    initAutocomplete();
    var getWeatherButton = document.getElementById('getWeather');
    if (getWeatherButton) {
        getWeatherButton.addEventListener('click', () => {
            getLocation();
            showActivitySection();
        });
    }
});

function initAutocomplete() {
    // Autocomplete for user location
    const userLocationInput = document.getElementById('userLocation');
    const userLocationAutocomplete = new google.maps.places.Autocomplete(userLocationInput, {
        types: ['(cities)'],
    });

    userLocationAutocomplete.addListener('place_changed', () => {
        const place = userLocationAutocomplete.getPlace();
        latVar = place.geometry.location.lat();
        longVar = place.geometry.location.lng();
        console.log('Latitude:', latVar, 'Longitude:', longVar);
    });

    // Activity search functionality
    const activitySearchInput = document.getElementById('activity-search');
    const activitySearchButton = document.getElementById('getActivity');

    activitySearchButton.addEventListener('click', () => {
        const userInput = activitySearchInput.value;
        console.log('User input:', userInput);

        const request = {
            location: new google.maps.LatLng(latVar, longVar),
            radius: 5000,
            query: userInput,
        };

        const service = new google.maps.places.PlacesService(document.createElement('div'));
        service.textSearch(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                console.log('Search results:', results);
                displaySearchResults(results);
            }
        });
    });

    // Reset button functionality
    document.getElementById('reset').addEventListener('click', () => {
        document.getElementById('userLocation').value = '';
        document.getElementById('activity-search').value = '';
        latVar = undefined;
        longVar = undefined;
        console.log('Reset clicked, inputs cleared, and variables reset.');
    });
}

/* This function gets the location's longitude and latitude coordinates and then calls the fetchWeather function.
**/
function getLocation() {
    let lat = latVar;
    let lon = longVar;
    fetchWeather(5); // Pass the desired number of days
}

/* This funtion clears the welcome messages and ensures that there is no gap after its been removed.
**/
function updateWelcomeMessage(content) {
    let welcomeMsgElement = document.getElementById('welcomeMessage');
    welcomeMsgElement.innerHTML = content;
    welcomeMsgElement.style.display = !content.trim() ? 'none' : '';
}

/* This funtion makes the activity input section visiable.
**/
function showActivitySection() {
    var googleMapsSection = document.querySelector('.google-maps-section');
    if (googleMapsSection) {
        googleMapsSection.style.display = 'block'; // Show the section
    }
}

/* This function will take the longitude and latitude cordinates from the google API and call the weather data from the OpenWeatherMap API.
**/
function fetchWeather(dayLimit = 5) {
    let url = `https://pro.openweathermap.org/data/2.5/onecall?lat=${latVar}&lon=${longVar}&appid=${'abc17e60a5096905541565302be6c107'}&units=${'metric'}&lang=${'en'}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            displayForecast(data, dayLimit);
        })
        .catch(error => console.error("Error fetching weather:", error));
}

/* This function create the HTML with the data from the OpenWeatherMap API
**/
function displayForecast(data, dayLimit) {
    updateWelcomeMessage('');
    document.getElementById('forecast').innerHTML = data.daily
        .slice(0, dayLimit) // Use slice to limit the days
        .map(day => {
            let dt = new Date(day.dt * 1000);
            let sr = new Date(day.sunrise * 1000).toTimeString();
            let ss = new Date(day.sunset * 1000).toTimeString();
            let gradient = getWeatherGradient(day.weather[0].id); // Get the gradient based on weather ID
            return `<div class="col-12 col-sm-4 col-md-3 col-lg-2">
                    <div class="card mt-4" style="background-image: ${gradient};">
                        <h5 class="card-title p-2">${dt.toDateString()}</h5>
                        <img src="http://openweathermap.org/img/wn/${day.weather[0].icon}@4x.png"
                            class="card-img-top" alt="${day.weather[0].description}" />
                        <div class="card-body">
                            <h3 class="card-title ">${day.weather[0].main}</h3>
                            <p class="card-text">High ${Math.round(day.temp.max)}&deg;C / Low
                                ${Math.round(day.temp.min)}&deg;C</p>
                            <p class="card-text">High Feels like ${Math.round(day.feels_like.day)}&deg;C</p>
                            <p class="card-text">Humidity ${day.humidity}%</p>
                            <p class="card-text">UV Index ${day.uvi}</p>
                            <p class="card-text">Precipitation ${Math.round(day.pop * 100)}%</p>
                            <p class="card-text">Wind ${day.wind_speed}m/s, ${day.wind_deg}&deg;</p>
                            <p class="card-text">Sunrise ${sr}</p>
                            <p class="card-text">Sunset ${ss}</p>
                        </div>
                    </div>
                </div>`;
        }).join(' ');
}

function getWeatherGradient(id) {
    let colors = ['#FFFFFF', '#FFFFFF', '#FFFFFF']; // Default white gradient
    if (id >= 200 && id <= 232) {
        colors = ['#6E6590', '#8A80AD', '#A89DCB']; // Stormy
    } else if (id >= 300 && id <= 321) {
        colors = ['#5E76BF', '#7692C4', '#92A8D1']; // Drizzle
    } else if (id >= 500 && id <= 531) {
        colors = ['#00457C', '#3A67A2', '#638AC9']; // Rainy
    } else if (id >= 600 && id <= 622) {
        colors = ['#8ED2EB', '#61A6BE', '#337C92']; // Snowy
    } else if (id == 701) {
        colors = ['#C0D6DF', '#A8BECB', '#90A6B7']; // Mist
    } else if (id >= 711 && id <= 781) { // Smoke, Haze, Dust, Fog, Sand, Ash, Squall, Tornado
        colors = ['#A8A7A7', '#C0BEBE', '#D8D6D6']; // General for visibility reduction
    } else if (id == 800) {
        colors = ['#00CAF2', '#00A1C7', '#00799E']; // Sunny
    } else if (id >= 801 && id <= 804) {
        colors = ['#FF9C12', '#FFA257', '#FFAE8B']; // Cloudy
    }

    // Apply the gradient to the card
    return `linear-gradient(to right, ${colors[0]}, ${colors[1]}, ${colors[2]})`;
}

function displaySearchResults(results) {
    const mapOptions = {
        center: new google.maps.LatLng(latVar, longVar),
        zoom: 14
    };

    const map = new google.maps.Map(document.getElementById('map'), mapOptions);

    results.forEach(result => {
        const marker = new google.maps.Marker({
            map: map,
            position: result.geometry.location,
            title: result.name
        });

        const infowindow = new google.maps.InfoWindow({
            content: `
                <h3>${result.name}</h3>
                <p>${result.formatted_address}</p>
                ${result.website ? `<p>Website: <a href="${result.website}" target="_blank">${result.website}</a></p>` : ''}
                ${result.formatted_phone_number ? `<p>Phone: ${result.formatted_phone_number}</p>` : ''}
            `
        });

        marker.addListener('click', () => {
            setTimeout(() => {
                infowindow.open(map, marker);
            }, 100);
        });
    });
}