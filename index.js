/*
Webpage: https://openweathermap.org/api/geocoding-api                   
Lat/Long based on location name: http://api.openweathermap.org/geo/1.0/direct?q={city name},{state code},{country code}&limit={limit}&appid={API key}
Lat/Long based on zip code: http://api.openweathermap.org/geo/1.0/zip?zip={zip code},{country code}&appid={API key}
*/

//For the C/F switcher, use the existing fetch/response object's values to change to the desired temperature unit

let stateList = document.getElementById('state-list');
let countryList = document.getElementById('country-list');
let topSection = document.getElementById('top-section');
let hamburgerForm = document.getElementById('hamburger-menu-form');
let hamburgerIcon = document.getElementById('hamburger-icon');
let mainContent = document.getElementById('content');
let slider = document.getElementById('slider');
let locationSubmitButton = document.getElementById('submit-location');
let locationHeader = document.getElementById('location-header');
let weatherObject;
let currentTempUnit = 'F';
console.log(topSection.offsetHeight+'px' + " is the height");
hamburgerForm.style.top =  topSection.offsetHeight+'px'; 


function Location(locationName, locationState, locationCountry, locationLat, locationLon) {
    this.locationName = locationName;
    this.locationState = locationState;
    this.locationCountry = locationCountry;
    this.locationLat = locationLat;
    this.locationLon = locationLon;
}

// Used when no favorite is found; used for loading the page the very first time
var defaultLocation = new Location("Sacramento", "California", "US", 38.5811, -121.4939);
// Used for loading the page for any subsquent times or for loading the user's favorite place
var favoritedLocation = new Location("Sacramento", "California", "US", 38.5811, -121.4939);
// Used for new location searches
var currentLocation = new Location();


/* Event Listeners ---------------------------------------------------------------------------------------------------- */
locationSubmitButton.addEventListener('click', async function(event) {
    // Will grab data from the country and state lists, find the location, and display it
    event.preventDefault();
    hamburgerForm.classList.toggle('hamburger-active');
    countrySelection = countryList.options[0].value;
    stateSelection = stateList.options[0].value;
    let userInput = document.getElementById('location').value;
    currentLocation.locationName = userInput;
    currentLocation.locationCountry = countrySelection;
    currentLocation.locationState = stateSelection;
    const locationObject = await findLatAndLong(userInput);
    weatherObject = await getWeatherObject(locationObject.latitude, locationObject.longitude);
    await displayForecast(weatherObject);
});

countryList.addEventListener('click', async function(event) {
    // If the selected country is not the United States, it will disable choosing a US state
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
    // Hides or shows the Hamburger side menu
    event.preventDefault();
    hamburgerForm.classList.toggle('hamburger-active');
});

mainContent.addEventListener('click', function(event) {
    // Hides the Hamburger side menu
   event.preventDefault();
   if(hamburgerForm.classList.contains('hamburger-active')) {
        hamburgerForm.classList.toggle('hamburger-active');
   }
});

slider.addEventListener('click', async function(event) {
    // Changes the value of currentTempUnit between C and F, will reload the main content
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
    weatherObject = await getWeatherObject(currentLocation.locationLat, currentLocation.locationLon);
    await displayForecast(weatherObject);
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
        currentLocation.locationLat = locationData[0].lat;
        currentLocation.locationLon = locationData[0].lon;
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
    let currentWeatherType = weatherObject.current.weather[0].main;
    let currentWeatherTypeIcon = getWeatherIcon(currentWeatherType, 'big', isAMorPM);
    currentForecastImage.setAttribute('src', 'images/' + currentWeatherTypeIcon);
    tempSection.appendChild(currentTempParagraph);
    tempSection.appendChild(feelsLikeTempPara);
    weatherSection.appendChild(currentForecastImage);

    // Hourly Forecast ----------------------------------------------------------------------------------------------------
    let hourlyForecastSection = document.getElementById('hourly-forecast-section');
    let hourlyForecastList = document.getElementById('hourly-forecast-list');
    let hourlyAMorPM;
    hourlyForecastSection.innerHTML = '';
    hourlyForecastList.innerHTML  = '';
    for(let hourlyLoop = 0; hourlyLoop < 25; hourlyLoop++) {
        let hourlyDiv = document.createElement('li');
        let hourlyNum = (new Date(weatherObject.hourly[hourlyLoop].dt * 1000).getHours()); // goes from 0-23
        let timeOfDayDiv = document.createElement('div');
        timeOfDayDiv.setAttribute('class', 'hourly-forecast-time-para');
        let hourlyWeatherType = weatherObject.hourly[hourlyLoop].weather[0].main;
        let hourlyWeatherIcon = getWeatherIcon(hourlyWeatherType, 'small', hourlyNum);
        if((hourlyNum >= 0 && hourlyNum <= 11)) {
            hourlyAMorPM = 'AM';
            if(hourlyNum == 0) {
                hourlyNum = 12;
            }
        } else if(hourlyNum >= 12 && hourlyNum <= 23) {
            hourlyAMorPM = 'PM';
            if(hourlyNum > 12) {
                hourlyNum = hourlyNum - 12;
            }
        }
        let dayOfMonth = new Date(weatherObject.hourly[hourlyLoop].dt * 1000).getDate();
        let hourlyTempValue =  Math.round(weatherObject.hourly[hourlyLoop].temp);
        let hourlyProbOfPrecipitationValue = Math.round(weatherObject.hourly[hourlyLoop].pop * 100); // It is shown in the form of pop: 0.65 and ranges from 0 to 1; we need percentage.
        let hourlyWindSpeedValue = Math.round(weatherObject.hourly[hourlyLoop].wind_speed); // metric will show metre/sec, imperial will s how miles/hour
        let hourlyWindDegValue = weatherObject.hourly[hourlyLoop].wind_deg; // N = 0, E = 90, S = 180, W = 270
        let hourlyWindDegPara = document.createElement('p');
        let hourlyTempPara = document.createElement('p');
        let hourlyWeatherImage = document.createElement('img');
        let hourlyWindDegImage = document.createElement('img');
        let hourlyProbOfPrecipitationPara = document.createElement('p');
        let hourlyProbOfPrecipitationDiv = document.createElement('div');
        let hourlyWindDiv = document.createElement('div');
        let hourlyWindPara = document.createElement('p');
        let hourlyProbOfPrecipitationImage = document.createElement('img');
        hourlyWindDiv.setAttribute('class', 'hourly-wind-div');
        hourlyWeatherImage.setAttribute('class', 'hourly-weather-image');
        hourlyWindDegImage.setAttribute('class', 'hourly-wind-deg-image');
        hourlyWindDegImage.setAttribute('src', 'images/wind-direction-icon.png');
        hourlyWindDegImage.style.transform = 'rotate(' + hourlyWindDegValue + 'deg)';
        hourlyProbOfPrecipitationImage.setAttribute('src', 'images/rain-drop-1.png');
        hourlyProbOfPrecipitationImage.setAttribute('class', 'hourly-prob-of-prec-image');
        hourlyProbOfPrecipitationPara.innerHTML = hourlyProbOfPrecipitationValue + '%';
        hourlyWeatherImage.setAttribute('src', 'images/' + hourlyWeatherIcon);
        hourlyTempPara.setAttribute('class', 'hourly-temp-para');
        hourlyTempPara.innerHTML = hourlyTempValue + '&deg;';
        timeOfDayDiv.innerHTML = hourlyNum + ' ' + hourlyAMorPM;
        hourlyDiv.appendChild(timeOfDayDiv);
        hourlyDiv.appendChild(hourlyTempPara);
        hourlyDiv.appendChild(hourlyWeatherImage);
        hourlyProbOfPrecipitationDiv.appendChild(hourlyProbOfPrecipitationPara);
        hourlyProbOfPrecipitationDiv.appendChild(hourlyProbOfPrecipitationImage);
        hourlyDiv.appendChild(hourlyProbOfPrecipitationDiv);
        if(currentTempUnit == 'F') {
            // Show miles/hr
            hourlyWindPara.innerHTML = hourlyWindSpeedValue + ' mph';
        } else if (currentTempUnit == 'C') {
            // Show km/s
            hourlyWindPara.innerHTML = hourlyWindSpeedValue + ' km/s';
        }
        hourlyWindDegPara.innerHTML = hourlyWindDegValue;
        hourlyProbOfPrecipitationDiv.setAttribute('class', 'hourly-precipitation-div');
        hourlyDiv.setAttribute('class', 'hourly-forecast-div');
        hourlyWindDiv.appendChild(hourlyWindPara);
        hourlyWindDiv.appendChild(hourlyWindDegImage);
        hourlyDiv.appendChild(hourlyWindDiv);
        hourlyForecastList.appendChild(hourlyDiv);
        //console.log(hourlyNum);
    }
    hourlyForecastSection.appendChild(hourlyForecastList);
    
    // Weekly Forecast -----------------------------------------------------------------------------------------------------
    let weeklyForecastList = document.getElementById('weekly-forecast-list');
    weeklyForecastList.innerHTML = '';
    let leftScrollArrow = document.createElement('button');
    let rightScrollArrow = document.createElement('button');
    for(let dayNum = 0; dayNum < 8; dayNum++) {
        isAMorPM = 6; // Show day weather icons
        let weekdayNum = new Date(weatherObject.daily[dayNum].dt * 1000).getDay();
        let dayOfMonth = new Date(weatherObject.daily[dayNum].dt * 1000).getDate();
        let weatherType = weatherObject.daily[dayNum].weather[0].main;
        let dailyWeatherIcon = getWeatherIcon(weatherType, 'small', isAMorPM);
        let dailyProbOfPrecipitationDiv = document.createElement('div');
        dailyProbOfPrecipitationDiv.setAttribute('class', 'daily-prob-of-prec-div')
        let dailyProbOfPrecipitationPara = document.createElement('p');
        dailyProbOfPrecipitationPara.setAttribute('class', 'daily-prob-of-prec-para')
        let weeklyProbOfPrecipitationValue = Math.round(weatherObject.daily[dayNum].pop * 100);
        dailyProbOfPrecipitationPara.innerHTML = weeklyProbOfPrecipitationValue + '%';
        let dailyProbOfPrecipitationImage = document.createElement('img');
        dailyProbOfPrecipitationImage.setAttribute('src', 'images/rain-drop-1.png')
        dailyProbOfPrecipitationImage.setAttribute('class', 'daily-prob-of-prec-image');
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
        dailyForecastImage.setAttribute('class', 'daily-forecast-image');
        dailyForecastImage.setAttribute('src', 'images/' + dailyWeatherIcon);
        dailyForecastMaxTemp.innerHTML = 'H: ' + Math.round(weatherObject.daily[dayNum].temp.max) + '&deg;';
        dailyForecastMinTemp.innerHTML = 'L: ' + Math.round(weatherObject.daily[dayNum].temp.min) + '&deg;';
        dayNumPara.innerHTML = weekdayText + ' ' + dayOfMonth;
        dailyTempDiv.setAttribute('class', 'daily-temp-div');
        dailyTempDiv.appendChild(dailyForecastMaxTemp);
        dailyTempDiv.appendChild(dailyForecastMinTemp);
        dailyForecast.appendChild(dayNumPara);
        dailyForecast.appendChild(dailyTempDiv);
        dailyProbOfPrecipitationDiv.appendChild(dailyProbOfPrecipitationPara);
        dailyProbOfPrecipitationDiv.appendChild(dailyProbOfPrecipitationImage);
        dailyForecast.appendChild(dailyProbOfPrecipitationDiv);
        dailyForecast.appendChild(dailyForecastImage);
        
        weeklyForecastList.appendChild(dailyForecast);
        // Will reveal the loaded information
        mainContent.style.opacity = "1"; 
    }
}


/* Initial Setup ------------------------------------------------------------------------------------------------------------ */
window.onload = async function() {
    currentLocation = defaultLocation;
    weatherObject = await getWeatherObject(defaultLocation.locationLat, defaultLocation.locationLon);
    locationHeader.innerHTML = defaultLocation.locationName + ', ' + defaultLocation.locationState + ', ' + defaultLocation.locationCountry;
    await displayForecast(weatherObject);
    mainContent.style.opacity = "1"; 
}

function getWeatherIcon(weatherType, iconSize, timeOfDay) {
    let weatherIcon;
    if(iconSize == 'big') {
        if(timeOfDay >= 6 && timeOfDay <= 18) {
            // It is daytime
            switch(weatherType) {
                // When the weather is Clear, show sun icon if hour is between 6am-6pm, otherwise show moon icon
                case 'Clear':
                    weatherIcon = 'clear-day-128.png';
                    break;
                case 'Clouds':
                    weatherIcon = 'cloudy-day-128.png';
                    break;
                case 'Drizzle':
                    weatherIcon = 'drizzle-128.png';
                    break;
                case 'Rain':
                    weatherIcon = 'rain-128.png';
                    break;
                case 'Thunderstorm':
                    weatherIcon = 'thunderstorm-128.png';
                    break;
                case 'Atmosphere':
                    weatherIcon = 'hazy-128.png';
                    break;
                case 'Mist':
                    weatherIcon = 'drizzle-128.png';
                    break;
                case 'Haze':
                    weatherIcon = 'hazy-128.png';
                    break;
                case 'Snow':
                    weatherIcon = 'snow-128.png';
                    break;
            }
        } else {
            // It is nighttime
            switch(weatherType) {
                // When the weather is Clear, show sun icon if hour is between 6am-6pm, otherwise show moon icon
                case 'Clear':
                    weatherIcon = 'clear-night-128.png';
                    break;
                case 'Clouds':
                    weatherIcon = 'clouds-128.png';
                    break;
                case 'Drizzle':
                    weatherIcon = 'drizzle-128.png';
                    break;
                case 'Rain':
                    weatherIcon = 'rainy-night-128.png';
                    break;
                case 'Thunderstorm':
                    weatherIcon = 'thunderstorm-128.png';
                    break;
                case 'Atmosphere':
                    weatherIcon = 'hazy-128.png';
                    break;
                case 'Mist':
                    weatherIcon = 'drizzle-128.png';
                    break;
                case 'Haze':
                    weatherIcon = 'hazy-128.png';
                    break;
                case 'Snow':
                    weatherIcon = 'snow-128.png';
                    break;
            }
        }
        
    } else if(iconSize == 'small') {
        if(timeOfDay >= 6 && timeOfDay <= 18) {
            switch(weatherType) {
                case 'Clear':
                    weatherIcon = 'clear-day-64.png';
                    break;
                case 'Clouds':
                    weatherIcon = 'cloudy-day-64.png';
                    break;
                case 'Drizzle':
                    weatherIcon = 'drizzle-64.png';
                    break;
                case 'Rain':
                    weatherIcon = 'rainy-day-64.png';
                    break;
                case 'Thunderstorm':
                    weatherIcon = 'thunderstorm-64.png';
                    break;
                case 'Atmosphere':
                    weatherIcon = 'hazy-64.png';
                    break;
                case 'Haze':
                    weatherIcon = 'hazy-64.png';
                    break;
                case 'Mist':
                    weatherIcon = 'drizzle-128.png';
                break;
                case 'Snow':
                    weatherIcon = 'snow-64.png';
                break;
            }
        } else {
            switch(weatherType) {
                case 'Clear':
                    weatherIcon = 'clear-night-64.png';
                    break;
                case 'Clouds':
                    weatherIcon = 'cloudy-night-64.png';
                    break;
                case 'Drizzle':
                    weatherIcon = 'drizzle-64.png';
                    break;
                case 'Rain':
                    weatherIcon = 'rainy-night-64.png';
                    break;
                case 'Thunderstorm':
                    weatherIcon = 'thunderstorm-64.png';
                    break;
                case 'Atmosphere':
                    weatherIcon = 'hazy-64.png';
                    break;
                case 'Haze':
                    weatherIcon = 'hazy-64.png';
                    break;
                case 'Mist':
                    weatherIcon = 'drizzle-128.png';
                break;
                case 'Snow':
                    weatherIcon = 'snow-64.png';
                break;
            }
        }
    }
    return weatherIcon;
}


