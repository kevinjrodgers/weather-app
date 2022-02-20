//console.log(api.openweathermap.org/data/2.5/weather?q={city name}&appid={API key});
// API Key: bc21462a4e2db9c1ba7c412127c33e2c
/*async function getWeather() {
    try {
        const response = await fetch('https://api.openweathermap.org/data/2.5/weather?q=Sacramento&appid=bc21462a4e2db9c1ba7c412127c33e2c', {mode: 'cors'});
        const weatherData = await response.json();
        console.log(weatherData.main.temp);
        console.log(weatherData.weather[0].main);
    } catch (error) {
        alert('Please try again :(');
    }
}
*/
/*
Webpage: https://openweathermap.org/api/geocoding-api                   
Lat/Long based on location name: http://api.openweathermap.org/geo/1.0/direct?q={city name},{state code},{country code}&limit={limit}&appid={API key}
Lat/Long based on zip code: http://api.openweathermap.org/geo/1.0/zip?zip={zip code},{country code}&appid={API key}
*/
let locationSubmitButton = document.getElementById('submit-location');
locationSubmitButton.addEventListener('click', function(event) {
    event.preventDefault();
    getWeather();
});

async function getWeather() {
    try {
        let userInput = document.getElementById('location').value;
        console.log(userInput);
        let weatherAPIId = 'bc21462a4e2db9c1ba7c412127c33e2c';
        let fetchString = 'https://api.openweathermap.org/data/2.5/weather?q=' + userInput + '&appid=' + weatherAPIId;
        const response = await fetch(fetchString, {mode: 'cors'});
        const weatherData = await response.json();
        console.log(weatherData.main.temp);
        // The temperate is in Kelvin
        console.log(weatherData.weather[0].main);
    } catch (error) {
        alert('Please try again :(');
    }
}

