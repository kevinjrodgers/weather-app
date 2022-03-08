/*
Webpage: https://openweathermap.org/api/geocoding-api                   
Lat/Long based on location name: http://api.openweathermap.org/geo/1.0/direct?q={city name},{state code},{country code}&limit={limit}&appid={API key}
Lat/Long based on zip code: http://api.openweathermap.org/geo/1.0/zip?zip={zip code},{country code}&appid={API key}
*/

//For the C/F switcher, use the existing fetch/response object's values to change to the desired temperature unit

let currentTempUnit = 'F';

let locationSubmitButton = document.getElementById('submit-location');
locationSubmitButton.addEventListener('click', async function(event) {
    event.preventDefault();
    let userInput = document.getElementById('location').value;
    const locationObject = await findLatAndLong(userInput);
    const weatherObject = await getWeather(locationObject.latitude, locationObject.longitude);
    await displayForecast(weatherObject);
});

async function getWeather(lat, lon) {
    try {
        // https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={API key}
        let weatherAPIId = 'bc21462a4e2db9c1ba7c412127c33e2c';
        let tempTypeString;
        if(currentTempUnit == 'C') {
            tempTypeString = 'metric';
        } else {
            tempTypeString = 'imperial';
        }
        let fetchString = 'https://api.openweathermap.org/data/2.5/onecall?lat=' + lat + '&lon=' + lon + '&exclude=minutely,hourly&appid=' + weatherAPIId + '&units=' + tempTypeString;
        const response = await fetch(fetchString, {mode: 'cors'});
        const weatherData = await response.json();
        return weatherData;
    } catch (error) {
        alert('getWeather error');
    }
}

async function displayForecast(weatherObject) {
    console.log(weatherObject);
    // Current Weather ------------------------------------------------------------------------------------------------------
    let currentTemp = Math.round(weatherObject.current.temp);
    //let currentTempParagraph = document.getElementById('current-temp');
    //currentTempParagraph.innerHTML = currentTemp + '&deg; F';
    //console.log('Current weather ' + weatherObject.current.weather[0].main);
    //console.log(Math.round(weatherObject.daily[0].temp.max) + ' is the max temp for today');
    //console.log(Math.round(weatherObject.daily[0].temp.min) + ' is the min temp for today');
    let tempSection = document.getElementById('temperature-section');
    let currentTempParagraph = document.createElement('p');
    let maxTempParagraph = document.createElement('p');
    let minTempParagraph = document.createElement('p');
    let currentForecastParagraph = document.createElement('p');
    let weatherSection = document.getElementById('current-forecast-section');
    let currentForecastImage = document.createElement('img');
    tempSection.innerHTML = '';
    weatherSection.innerHTML = '';
    currentTempParagraph.setAttribute('id', 'current-temp');
    currentTempParagraph.innerHTML = currentTemp + '&deg; ' + currentTempUnit;
    maxTempParagraph.setAttribute('class', 'temps');
    maxTempParagraph.innerHTML = 'High: ' + Math.round(weatherObject.daily[0].temp.max) + '&deg; ' + currentTempUnit;
    minTempParagraph.setAttribute('class', 'temps');
    minTempParagraph.innerHTML = 'Low: ' + Math.round(weatherObject.daily[0].temp.min) + '&deg; ' + currentTempUnit;
    currentForecastParagraph.setAttribute('id', 'current-weather-forecast');
    currentForecastParagraph.innerHTML = weatherObject.current.weather[0].main;
    currentForecastImage.setAttribute('src', 'images/clear-day.png');
    tempSection.appendChild(currentTempParagraph);
    tempSection.appendChild(maxTempParagraph);
    tempSection.appendChild(minTempParagraph);
    weatherSection.appendChild(currentForecastImage);
    weatherSection.appendChild(currentForecastParagraph);
    // Weekly Forecast -----------------------------------------------------------------------------------------------------
    let weeklyForecastList = document.getElementById('weekly-forecast-list');
    weeklyForecastList.innerHTML = '';
    /*let epochString = Date(1646683200 * 1000);
    let dateString = '';
    for(let i = 0; i < 10; i++) {
        if(i <= 3 || i == 8 || i == 9) {
            if(i == 8 && epochString[8] == '0') {
                continue;
            }
            dateString = dateString + epochString[i];
        }
    }
    console.log(dateString);
    console.log('The date is: '+ Date(1646683200 * 1000));
    */
    let epochString;
    console.log(weatherObject.daily[0].dt);
    console.log(weatherObject.daily[1].dt);
    for(let dayNum = 0; dayNum < 8; dayNum++) {
        epochString = Date(weatherObject.daily[dayNum].dt * 1000);
        let dateString = '';
        for(let i = 0; i < 10; i++) {
            if(i <= 3 || i == 8 || i == 9) {
                if(i == 8 && epochString[8] == '0') {
                continue;
                }
                dateString = dateString + epochString[i];
            }
        }
        console.log(dateString);
        let dailyForecast = document.createElement('li');
        dailyForecast.setAttribute('class', 'daily-forecast');
        let dailyForecastMaxTemp = document.createElement('p');
        let dailyForecastMinTemp = document.createElement('p');
        dailyForecastMaxTemp.innerHTML = Math.round(weatherObject.daily[dayNum].temp.max) + '&deg;';
        dailyForecastMinTemp.innerHTML = Math.round(weatherObject.daily[dayNum].temp.min) + '&deg;';
        dailyForecast.appendChild(dailyForecastMaxTemp);
        dailyForecast.appendChild(dailyForecastMinTemp);
        weeklyForecastList.appendChild(dailyForecast);
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
        //console.log(locationData);
        let locationLatitude = locationData[0].lat;
        let locationLongitude = locationData[0].lon;
        let locationHeader = document.getElementById('location-header');
        locationHeader.innerHTML = locationData[0].name + ', ' + locationData[0].country;
        return {
            latitude: locationLatitude,
            longitude: locationLongitude
        };
    } catch (error) {
        alert('latNlon error');
    }
}

window.onload = async function() {
    const locationObject = await findLatAndLong('Los Angeles');
    const weatherObject = await getWeather(locationObject.latitude, locationObject.longitude);
    await displayForecast(weatherObject);
    //console.log('apples and cheese are: ' + weatherObject.daily[0].temp.max);
}

