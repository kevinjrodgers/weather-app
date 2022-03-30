/*
Webpage: https://openweathermap.org/api/geocoding-api                   
Lat/Long based on location name: http://api.openweathermap.org/geo/1.0/direct?q={city name},{state code},{country code}&limit={limit}&appid={API key}
Lat/Long based on zip code: http://api.openweathermap.org/geo/1.0/zip?zip={zip code},{country code}&appid={API key}
*/

//For the C/F switcher, use the existing fetch/response object's values to change to the desired temperature unit

let currentTempUnit = 'F';
let stateList = document.getElementById('state-list');
let countryList = document.getElementById('country-list');
let topSection = document.getElementById('top-section');
let hamburgerForm = document.getElementById('hamburger-menu-form');
let hamburgerIcon = document.getElementById('hamburger-icon');
let mainContent = document.getElementById('content');
let slider = document.getElementById('slider');
let weatherObject;
console.log(topSection.offsetHeight+'px' + " is the height");
hamburgerForm.style.top =  topSection.offsetHeight+'px'; 
let locationSubmitButton = document.getElementById('submit-location');

/* Event Listeners ---------------------------------------------------------------------------------------------------- */
locationSubmitButton.addEventListener('click', async function(event) {
    event.preventDefault();
    hamburgerForm.classList.toggle('hamburger-active');
    countrySelection = countryList.options[0].value;
    stateSelection = stateList.options[0].value;
    let userInput = document.getElementById('location').value;
    const locationObject = await findLatAndLong(userInput);
    weatherObject = await getWeatherObject(locationObject.latitude, locationObject.longitude);
    await displayForecast(weatherObject);
});

countryList.addEventListener('click', async function(event) {
    event.preventDefault();
    let currentlySelectedCountry = countryList.options[countryList.selectedIndex].value;
    console.log(currentlySelectedCountry);
    if(currentlySelectedCountry != 'US') {
        stateList.setAttribute('disabled', true);
    }
    else {
        stateList.removeAttribute('disabled');
    }
});

hamburgerIcon.addEventListener('click', async function(event) {
    event.preventDefault();
    hamburgerForm.classList.toggle('hamburger-active');
});

mainContent.addEventListener('click', function(event) {
   event.preventDefault();
   if(hamburgerForm.classList.contains('hamburger-active')) {
        hamburgerForm.classList.toggle('hamburger-active');
   }
});

slider.addEventListener('click', function(event) {
    event.preventDefault();
    let sliderID = document.getElementById('slider-id');
    let slider= document.getElementById('slider');
    sliderID.classList.toggle('slider-move-square');
    slider.classList.toggle('slider-container-toggle');
    if(currentTempUnit == 'C') {
        currentTempUnit = 'F';
    } else if(currentTempUnit == 'F') {
        currentTempUnit = 'C';
    }
    console.log(currentTempUnit);
});

/* Functions ---------------------------------------------------------------------------------------------------- */

async function findLatAndLong(locationName) {
    try {
        /*
        http://api.openweathermap.org/geo/1.0/direct?q={city name},{state code},{country code}&limit={limit}&appid={API key}
        q 	    required 	City name, state code (only for the US) and country code divided by comma. Please use ISO 3166 country codes.
        appid 	required 	Your unique API key (you can always find it on your account page under the "API key" tab)
        limit 	optional 	Number of the locations in the API response (up to 5 results can be returned in the API response)
        */
        mainContent.style.opacity = "0"; 
        stateSelection = stateList.options[stateList.selectedIndex].value;
        countrySelection = countryList.options[countryList.selectedIndex].value;
        let weatherAPIId = 'bc21462a4e2db9c1ba7c412127c33e2c';
        let fetchString;
        if(countrySelection != 'US') {
            fetchString = 'http://api.openweathermap.org/geo/1.0/direct?q=' + locationName + ',' + countrySelection + '&appid=' + weatherAPIId;
            console.log(fetchString);
        } else {
            // Default country is US
            fetchString = 'http://api.openweathermap.org/geo/1.0/direct?q=' + locationName + ',' + stateSelection + ',' + countrySelection + '&appid=' + weatherAPIId;
            console.log(fetchString);
        }
        const response = await fetch(fetchString, {mode: 'cors'});
        const locationData = await response.json();
        console.log(locationData);
        let locationLatitude = locationData[0].lat;
        let locationLongitude = locationData[0].lon;
        let locationHeader = document.getElementById('location-header');
        locationHeader.innerHTML = locationData[0].name + ', ' + locationData[0].state+ ', ' + locationData[0].country;
        return {
            latitude: locationLatitude,
            longitude: locationLongitude
        };
    } catch (error) {
        alert('Invalid Location');
    }
}

async function getWeatherObject(lat, lon) {
    try {
        // https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={API key}
        let weatherAPIId = 'bc21462a4e2db9c1ba7c412127c33e2c';
        let tempTypeString;
        if(currentTempUnit == 'C') {
            tempTypeString = 'metric';
        } else {
            tempTypeString = 'imperial';
        }
        let fetchString = 'https://api.openweathermap.org/data/2.5/onecall?lat=' + lat + '&lon=' + lon + '&exclude=minutely&appid=' + weatherAPIId + '&units=' + tempTypeString;
        const response = await fetch(fetchString, {mode: 'cors'});
        const weatherData = await response.json();
        return weatherData;
    } catch (error) {
        alert('getWeatherObject error');
    }
}

async function displayForecast(weatherObject) {
    console.log(weatherObject);
    // Current Weather ------------------------------------------------------------------------------------------------------
    let currentTemp = Math.round(weatherObject.current.temp);
    let tempSection = document.getElementById('temperature-section');
    let currentTempParagraph = document.createElement('p');
    let maxTempParagraph = document.createElement('p');
    let minTempParagraph = document.createElement('p');
    let currentForecastParagraph = document.createElement('p');
    let weatherSection = document.getElementById('current-forecast-section');
    let currentForecastImage = document.createElement('img');
    let feelsLikeTempPara = document.createElement('p');
    tempSection.innerHTML = '';
    weatherSection.innerHTML = '';
    currentTempParagraph.setAttribute('id', 'current-temp');
    currentTempParagraph.innerHTML = currentTemp + '&deg; ' + currentTempUnit;
    maxTempParagraph.setAttribute('class', 'temps');
    maxTempParagraph.innerHTML = 'High: ' + Math.round(weatherObject.daily[0].temp.max) + '&deg; ' + currentTempUnit;
    minTempParagraph.setAttribute('class', 'temps');
    minTempParagraph.innerHTML = 'Low: ' + Math.round(weatherObject.daily[0].temp.min) + '&deg; ' + currentTempUnit;
    currentForecastParagraph.setAttribute('id', 'current-weather-forecast');
    feelsLikeTempPara.innerHTML = 'Feels like ' + Math.round(weatherObject.current.feels_like) + '&deg;';
    currentForecastParagraph.innerHTML = weatherObject.current.weather[0].main;
    let isAMorPM = new Date(weatherObject.current.dt*1000).getHours();
    //console.log(isAMorPM + " is the hour");
    let currentWeatherType = weatherObject.current.weather[0].main;
    let currentWeatherTypeIcon;
    switch(currentWeatherType) {
        // When the weather is Clear, show sun icon if hour is between 6am-6pm, otherwise show moon icon
        case 'Clear':
            if(isAMorPM >= 6 && isAMorPM <= 18) {
                currentWeatherTypeIcon = 'clear-day-128.png';
            } else {
                currentWeatherTypeIcon = 'clear-night-128.png';
            }
            break;
        case 'Clouds':
            currentWeatherTypeIcon = 'clouds-128.png';
            break;
        case 'Drizzle':
            currentWeatherTypeIcon = 'drizzle-128.png';
            break;
        case 'Rain':
            currentWeatherTypeIcon = 'rain-128.png';
            break;
        case 'Thunderstorm':
            currentWeatherTypeIcon = 'thunderstorm-128.png';
            break;
        case 'Atmosphere':
            currentWeatherTypeIcon = 'hazy-128.png';
            break;
        case 'Mist':
            currentWeatherTypeIcon = 'drizzle-128.png';
            break;
        case 'Haze':
            currentWeatherTypeIcon = 'hazy-128.png';
            break;
        case 'Snow':
            currentWeatherTypeIcon = 'snow-128.png';
            break;
    }
    currentForecastImage.setAttribute('src', 'images/' + currentWeatherTypeIcon);
    tempSection.appendChild(currentTempParagraph);
    tempSection.appendChild(feelsLikeTempPara);
    //tempSection.appendChild(maxTempParagraph);
    //tempSection.appendChild(minTempParagraph);
    weatherSection.appendChild(currentForecastImage);
    // Weekly Forecast -----------------------------------------------------------------------------------------------------
    let weeklyForecastList = document.getElementById('weekly-forecast-list');
    weeklyForecastList.innerHTML = '';
    for(let dayNum = 0; dayNum < 8; dayNum++) {
        let weekdayNum = new Date(weatherObject.daily[dayNum].dt * 1000).getDay();
        let dayOfMonth = new Date(weatherObject.daily[dayNum].dt * 1000).getDate();
        let weatherType = weatherObject.daily[dayNum].weather[0].main;
        let weeklyWeatherIcon;
        switch(weatherType) {
            case 'Clear':
                weeklyWeatherIcon = 'clear-day-64.png';
                break;
            case 'Clouds':
                weeklyWeatherIcon = 'clouds-64.png';
                break;
            case 'Drizzle':
                weeklyWeatherIcon = 'drizzle-64.png';
                break;
            case 'Rain':
                weeklyWeatherIcon = 'rain-64.png';
                break;
            case 'Thunderstorm':
                weeklyWeatherIcon = 'thunderstorm-64.png';
                break;
            case 'Atmosphere':
                weeklyWeatherIcon = 'hazy-64.png';
                break;
            case 'Haze':
                weeklyWeatherIcon = 'hazy-64.png';
                break;
            case 'Mist':
                weeklyWeatherIcon = 'drizzle-128.png';
            break;
            case 'Snow':
                weeklyWeatherIcon = 'snow-64.png';
            break;
        }
        let weekdayText;
        switch(weekdayNum) {
            case 0: 
                weekdayText = 'Sun';
                break;
            case 1:
                weekdayText = 'Mon';
                break;
            case 2: 
                weekdayText = 'Tue';
                break;
            case 3:
                weekdayText = 'Wed';
                break;
            case 4: 
                weekdayText = 'Thu';
                break;
            case 5:
                weekdayText = 'Fri';
                break;
            case 6: 
                weekdayText = 'Sat';
                break;
        }
        let dailyTempDiv = document.createElement('div');
        let dailyForecast = document.createElement('li');
        dailyForecast.setAttribute('class', 'daily-forecast');
        let dailyForecastMaxTemp = document.createElement('p');
        let dailyForecastMinTemp = document.createElement('p');
        let dayNumPara = document.createElement('p');
        let dailyForecastImage = document.createElement('img');
        dayNumPara.setAttribute('class', 'day-num-para');
        dailyForecastImage.setAttribute('class', 'weekly-forecast-image');
        dailyForecastImage.setAttribute('src', 'images/' + weeklyWeatherIcon);
        dailyForecastMaxTemp.innerHTML = 'H: ' + Math.round(weatherObject.daily[dayNum].temp.max) + '&deg;';
        dailyForecastMinTemp.innerHTML = 'L: ' + Math.round(weatherObject.daily[dayNum].temp.min) + '&deg;';
        dayNumPara.innerHTML = weekdayText + ' ' + dayOfMonth;
        dailyTempDiv.setAttribute('class', 'daily-temp-div');
        dailyTempDiv.appendChild(dailyForecastMaxTemp);
        dailyTempDiv.appendChild(dailyForecastMinTemp);
        dailyForecast.appendChild(dayNumPara);
        dailyForecast.appendChild(dailyTempDiv);
        dailyForecast.appendChild(dailyForecastImage);
        weeklyForecastList.appendChild(dailyForecast);
        // Will reveal the loaded information
        mainContent.style.opacity = "1"; 
    }
}


/* Initial Setup ------------------------------------------------------------------------------------------------------------ */
window.onload = async function() {
    const locationObject = await findLatAndLong('Sacramento');
    weatherObject = await getWeatherObject(locationObject.latitude, locationObject.longitude);
    await displayForecast(weatherObject);
    mainContent.style.opacity = "1"; 
}

async function dynamicallyGenerateWeatherInfo() {
    // Need to get the input from the location fields
    // Get the location's lat and lon
    // Use lat and lon to get the weather object from the OpenWeather API
    // Dynamically populate the page
}


