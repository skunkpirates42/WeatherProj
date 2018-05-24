const getWeatherBtn = document.getElementById("getWeather");
const weatherDisplay = document.getElementById("weatherDisplay");
const weatherUrl = 'https://api.wunderground.com/api/89c6022812fbeb4a/conditions/q/';
const searchBar = document.getElementById("searchbar");
let weather;
let temp;
let lat;
let long;
let city;
let zipCode;
let state;

//check to see if browser supports geolocation
if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(position => {
        lat = position.coords.latitude;
        long = position.coords.longitude;
      });
  
}

getWeatherBtn.addEventListener("click", handleWeather);


function handleWeather() {
    fetchWeather()
        .then(data => {
            setWeatherVars(data);
            setHTML(data);
        })
        .catch(error => console.error("Something went wrong", error))
}

function fetchWeather() {
    return new Promise((resolve, reject) => {
        //check to see if user put anything in the searchbar
        //maybe not the greatest approach
        if (!searchBar.value.length) {
            fetch(`${weatherUrl}${lat},${long}.json`, {cache: "no-store"})
                .then(settlePromise)
                .then(json => json)
        } else {
            let searchUrl;
            const type = parseSearch(getSearchVal);
            if (type === "ZIP") {
                zipCode = getSearchVal();
                searchUrl = `${weatherUrl}${zipCode}`
            }
            // Hacky code to get the State due to how API url is formatted
            // Also this block of code seems to always run even if user types a ZIPcode
            else {
                city = getSearchVal();
                state = prompt("I see you have searched by city. Please specify the state in the following format. EX) New York => NY, California => CA");
                searchUrl = `${weatherUrl}${state}/${city}`
            }
            fetch(`${searchUrl}.json`, {cache: "no-store"})
                .then(settlePromise)
                .then(json => json)
        }         
    }
)}

function setWeatherVars(data) {
    city = data.current_observation.observation_location.full;
    temp =  `${data.current_observation.temp_f}°F`;
    weather = data.current_observation.weather;
    weatherIcon = data.current_observation.icon_url.replace("http", "https");
}

function setHTML() {
    weatherDisplay.innerHTML = `
    <div>
        <h2>${city}</h2>
    </div>
    <div class="weather">
        <h3>${weather}</h3>
    </div> 
    <div>
        <img src="${weatherIcon}"> 
    </div>
    <div class="temp">
        <h4>${temp}</h4>
    </div>`;
}

function getSearchVal() {
    return searchBar.value;
}

// Always getting type = "CITY" for some reason
function parseSearch(searchVal) {
    if (Number.isInteger(Number(searchVal[0]))) {
        return "ZIP";
    } else {
        return "CITY";
    }
}
//********************** BUG HERE ***********
//was reusing this block of code on lines 41 & 57. moved it to a seperate func.. produced errors
function settlePromise (response) {
    return new Promise ((resolve, reject) => {
        response.json()
        .then(json => resolve(json))
        .catch(error => console.error("Oops...Something went wrong", error) || reject(error));
    }
)}