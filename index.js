/*
Webpage: https://openweathermap.org/api/geocoding-api                   
Lat/Long based on location name: http://api.openweathermap.org/geo/1.0/direct?q={city name},{state code},{country code}&limit={limit}&appid={API key}
Lat/Long based on zip code: http://api.openweathermap.org/geo/1.0/zip?zip={zip code},{country code}&appid={API key}
*/
let locationSubmitButton = document.getElementById('submit-location');
locationSubmitButton.addEventListener('click', async function(event) {
    event.preventDefault();
    let userInput = document.getElementById('location').value;
    const locationObject = await findLatAndLong(userInput);
    getWeather(userInput);
    console.log("aaaaaa " + locationObject.latitude);
    console.log("bbbbbb " + locationObject.longitude);
});

async function getWeather(locationName) {
    try {
        let weatherAPIId = 'bc21462a4e2db9c1ba7c412127c33e2c';
        let fetchString = 'https://api.openweathermap.org/data/2.5/weather?q=' + locationName + '&appid=' + weatherAPIId;
        const response = await fetch(fetchString, {mode: 'cors'});
        const weatherData = await response.json();
        let currentTemp = Math.round((weatherData.main.temp - 273.15) * 10) / 10;
        let currentTempParagraph = document.getElementById("current-temp");
        currentTempParagraph.innerHTML = currentTemp + "&deg; C";
        findLatAndLong();
    } catch (error) {
        alert('ah jeez wizz :(');
    }
}

async function findLatAndLong(locationName) {
    try {
        /*
        http://api.openweathermap.org/geo/1.0/direct?q={city name},{state code},{country code}&limit={limit}&appid={API key}
        q 	required 	City name, state code (only for the US) and country code divided by comma. Please use ISO 3166 country codes.
        appid 	required 	Your unique API key (you can always find it on your account page under the "API key" tab)
        limit 	optional 	Number of the locations in the API response (up to 5 results can be returned in the API response)
        */
        let weatherAPIId = 'bc21462a4e2db9c1ba7c412127c33e2c';
        let fetchString = 'http://api.openweathermap.org/geo/1.0/direct?q=' + locationName + '&limit=1&appid=' + weatherAPIId;
        const response = await fetch(fetchString, {mode: 'cors'});
        const locationData = await response.json();
        console.log(locationData);
        let locationLatitude = locationData[0].lat;
        let locationLongitude = locationData[0].lon;
        console.log('Latitude is: ' + locationLatitude);
        console.log('Longitude is: ' + locationLongitude);
        let locationHeader = document.getElementById('location-header');
        locationHeader.innerHTML = locationData[0].name + ', ' + locationData[0].country;
        return {
            latitude: locationLatitude,
            longitude: locationLongitude
        };
    } catch (error) {

    }
}

window.onload = async function() {
    await getWeather('Los Angeles');
    await findLatAndLong('Los Angeles');
}

