let latVar, longVar;

// Waits until the HTML document is fully loaded before running the script.
document.addEventListener('DOMContentLoaded', function () {
    initAutocomplete(); // Initialise the Google Places Autocomplete functionality
    const getWeatherButton = document.getElementById('getWeather');
    if (getWeatherButton) {
        getWeatherButton.addEventListener('click', () => {
            const userLocationInput = document.getElementById('userLocation').value;
            if (userLocationInput.trim() === '') { // Check if the input is empty
                alert('Please input a city name to view its weather forecast.');
            } else {
                // If there is an input, proceed with these functions
                fetchWeather(5);
            }
        });
    }
});

/**
 * This function does initialises Google Places Autocomplete for a user location input field, allowing users to select a city. Upon selection, it stores the city's geographical coordinates. It also sets up a button event listener to perform a custom text search based on user input for activities within a 5 km radius of the selected city, displaying these search results using another function.
 */
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
    });

    // Activity search functionality
    const activitySearchInput = document.getElementById('activity-search');
    const activitySearchButton = document.getElementById('getActivity');
    activitySearchButton.addEventListener('click', () => {
        // Check if the input field is empty
        const userInput = activitySearchInput.value.trim();
        if (userInput === '') {
            // If the input field is empty, show an alert
            alert('Please type in an activity before searching. Why not try live music, or coffee shop?');
        } else {
            // Only proceed if there is user input
            showActivitySection();

            const request = {
                location: new google.maps.LatLng(latVar, longVar),
                query: userInput,
                radius: 5000,
            };
            const service = new google.maps.places.PlacesService(document.createElement('div'));
            service.textSearch(request, (results, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    displaySearchResults(results);
                }
            });
        }
    });
}

/**
 * This funtion clears the welcome messages and ensures that there is no gap after its been removed.
 * @param {*} content contains html to inject into page
 */
function updateWelcomeMessage(content) {
    const welcomeMsgElement = document.getElementById('welcomeMessage');
    welcomeMsgElement.innerHTML = content;
    welcomeMsgElement.style.display = !content.trim() ? 'none' : '';
}

/**
 * This funtion makes the activity input section visable.
 */
function showActivityBtn() {
    const activityBtnSection = document.querySelector('.activity-btn');
    if (activityBtnSection) {
        activityBtnSection.style.display = 'block';
    }
}

/**
 * This funtion makes the google maps visable.
 */
function showActivitySection() {
    const googleMapsSection = document.querySelector('.google-map-display');
    if (googleMapsSection) {
        googleMapsSection.style.display = 'block';
    }
}

// Credit to Steve Griffith - See credit on readme.md. 
/**
 * This function will take the longitude and latitude cordinates from the google API and call the weather data from the OpenWeatherMap API.
 * @param {int} dayLimit number of days defaults to 5 if none entered.
 */
function fetchWeather(dayLimit = 5) {
    let url = `https://pro.openweathermap.org/data/2.5/onecall?lat=${latVar}&lon=${longVar}&appid=${'abc17e60a5096905541565302be6c107'}&units=${'metric'}&lang=${'en'}`;
    // Using fetch then to ensure it fetches first before moving on
    fetch(url)
        .then((response) => {
            if (!response.ok) {
                // If the response is not ok, throw an error to skip to the catch block
                throw new Error('Failed to fetch weather data');
            }
            return response.json();
        })
        .then(data => {
            if (!data || !data.daily) {
                // If the data is not in the expected format or missing daily forecast, throw an error
                throw new Error('Invalid data format');
            }
            displayForecast(data, dayLimit);
            showActivityBtn();
        })
        .catch(error => {
            console.error("Error fetching weather:", error);
            alert("An error occurred while fetching the weather data. Please enter a valid city name. If the error persists, please contact us."); // Display an alert to the user
        });
}

// Credit to Steve Griffith - See credit on readme.md. 
/**
 * This function create the HTML with the data from the OpenWeatherMap API.
 * @param {*} data
 * @param {*} dayLimit
 */
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


/**
 * This function changes the color of the card depending on the weather condition.
 * @param {*} id The weather condition ID according to the OpenWeatherMap weather conditions.
 * @returns A CSS linear-gradient string representing the gradient to be applied based on the weather condition.
 */
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
    return `linear-gradient(to left, ${colors[0]}, ${colors[1]}, ${colors[2]})`;
}

/**
 * This function displays a Google Map centred on specified coordinates, adorned with markers representing places matching the user's search query. Each marker, upon interaction, reveals an InfoWindow containing details of the corresponding place.
 * @param {*} results An array of objects, each representing a place returned by the search use to diplay. 
 */
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
                <p>Rating: ${result.rating}</p>
            `
        });
        marker.addListener('click', () => {
            setTimeout(() => {
                infowindow.open(map, marker);
            }, 100);
        });
    });
}


// Reset button functionality
document.getElementById('reset').addEventListener('click', () => {

    // Clear input fields
    document.getElementById('userLocation').value = '';
    document.getElementById('activity-search').value = '';
    latVar = undefined;
    longVar = undefined;

    // Clear the forecast display
    document.getElementById('forecast').innerHTML = '';

    // Hide the activity search buttons
    if (document.getElementsByClassName('activity-btn').length > 0) {
        document.getElementsByClassName('activity-btn')[0].style.display = 'none';
    }

    // Hide the google maps section
    if (document.getElementsByClassName('google-map-display').length > 0) {
        document.getElementsByClassName('google-map-display')[0].style.display = 'none';
    }

    // Ensure the welcome message is visible
    const welcomeMsgElement = document.getElementById('welcomeMessage');
    updateWelcomeMessage(`Keeping an eye on the weather is not just about planning
    your day; it's about making smart decisions that can affect your safety, comfort, and
    productivity. Whether it's choosing the right outfit, deciding whether to bring an umbrella or
    determining if a journey is safe, accurate weather predictions can make all the difference.
    That's where our weather app comes in. It provides real-time updates and forecasts to help you
    stay one step ahead of the weather. From sudden downpours to unexpected heatwaves, our app
    ensures you're never caught off guard. With our user-friendly interface and precise data,
    planning your day, week, or even your next adventure has never been easier or more reliable.`);
});

