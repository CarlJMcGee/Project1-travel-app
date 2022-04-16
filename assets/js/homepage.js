// html elements
var weatherInfoContainer = document.querySelector(".weather-info");
var currencyInfoContainer = document.querySelector(".currency-info");
var cityInput = document.querySelector(".search");
var searchForm = document.querySelector(".search-form");
var currencyForm = document.querySelector(".currency-form");
var moneyInput = document.querySelector(".money-input");
var moneyOutput = document.querySelector(".money-output");

import currencyCode from "./country-codes.json" assert { type: "json" };

// current city info
var currentCity = {
  cityName: [],
  location: [],
  money: [],
};

var save = () => {
  localStorage.setItem("currentCity", JSON.stringify(currentCity));
};

// convert country to currency code
function getCurrencyCode(geo) {
  // find matching country array from CountryCode obj
  var codeToCountry = currencyCode.find((code) => {
    return code.CountryCode === geo[0].country;
  });
  console.log(codeToCountry);

  // send currency code to exchange API
  currencyExchangeFetch(codeToCountry.Code);
}

// create updated weather and air info
var weatherInfoHandler = ({ tp, hu, ws, ic }, { aqius }) => {
  // empty old data from container
  $(weatherInfoContainer).empty();

  // weather icon
  var iconPicker = (iconCode) => {
    switch (ic) {
      case "01d":
        return "./assets/img/01d.png";
        break;

      case "01n":
        return "./assets/img/01n.png";
        break;

      case "02d":
        return "./assets/img/02d.png";
        break;

      case "02n":
        return "./assets/img/02n.png";
        break;
      case "03d":
        return "./assets/img/03d.png";
        break;

      case "04n":
      case "04d":
        return "./assets/img/04d.png";
        break;

      case "09n":
      case "09d":
        return "./assets/img/09d.png";
        break;

      case "10d":
        return "./assets/img/10d.png";
        break;

      case "10n":
        return "./assets/img/10n.png";
        break;

      case "11n":
      case "11d":
        return "./assets/img/11d.png";
        break;

      case "13n":
      case "13d":
        return "./assets/img/13d.png";
        break;

      case "50n":
      case "50d":
        return "./assets/img/50d.png";
        break;

      default:
        break;
    }
  };
  var iconEl = document.createElement("img");
  iconEl.className = "image is-64x64";
  iconEl.setAttribute("src", iconPicker(ic));
  iconEl.innerHTML = "";
  weatherInfoContainer.append(iconEl);

  // temp
  // convert ℃ to ℉
  var tempF = (tp * 9) / 5 + 32;
  var tempEl = document.createElement("p");
  tempEl.className = "temp column";
  tempEl.innerHTML = "Temperature: " + tempF + "℉";
  weatherInfoContainer.append(tempEl);

  // humidity
  var humidityEl = document.createElement("p");
  humidityEl.className = "humidity column";
  humidityEl.innerHTML = "Humidity: " + hu + "%";
  weatherInfoContainer.append(humidityEl);

  // windspeed
  var windEl = document.createElement("p");
  windEl.className = "wind column";
  windEl.innerHTML = "Wind: " + ws + "m/s";
  weatherInfoContainer.append(windEl);

  // air quality
  var airEl = document.createElement("p");
  airEl.className = "air column";
  airEl.innerHTML = "Air Quality Index (US): " + aqius;
  weatherInfoContainer.append(airEl);
};

// get weather and air data from airvisual API
var weatherFetch = (lat, lon) => {
  var requestOptions = {
    method: "GET",
    redirect: "follow",
  };

  fetch(
    "http://api.airvisual.com/v2/nearest_city?lat=" +
      lat +
      "&lon=" +
      lon +
      "&key=7142c257-d9cf-43ad-9138-af6e684b02ac",
    requestOptions
  )
    .then((response) => response.json())
    .then((airWeather) => {
      console.log(airWeather);

      // send current weather and pollution data to handler to be drawn
      weatherInfoHandler(
        airWeather.data.current.weather,
        airWeather.data.current.pollution
      );
    })
    .catch((error) => console.log("error", error));
};

// display fetched exchange info
var currencyInfoHandler = ({ new_amount, new_currency }) => {
  // unlock money text input
  moneyInput.removeAttribute("disabled");

  // draw converted amount and currency type
  moneyOutput.textContent = new_amount + " " + new_currency;

  save();
};

// get exchange info from currency-converter API
var currencyExchangeFetch = (countryCode) => {
  // get money input value
  var exchangeAmount = moneyInput.value;

  var myHeaders = new Headers();
  myHeaders.append(
    "X-RapidAPI-Key",
    "f0229a1fbcmshc42a2b54fa36ec7p1377a3jsn239b6d14cdfb"
  );

  var requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  fetch(
    "https://currency-converter-by-api-ninjas.p.rapidapi.com/v1/convertcurrency?have=USD&want=" +
      countryCode +
      "&amount=" +
      exchangeAmount,
    requestOptions
  )
    .then((response) => response.json())
    .then((convertedAmount) => {
      console.log(convertedAmount);
      // save exchange info to current city obj
      currentCity.money.push(convertedAmount);

      // send exchange info to handler to be drawn
      currencyInfoHandler(convertedAmount);
    })
    .catch((error) => console.log("error", error));
};

// get latitude and longitude from city name
var fetchCityLatLon = (cityName) => {
  var requestOptions = {
    method: "GET",
    redirect: "follow",
  };

  fetch(
    "http://api.openweathermap.org/geo/1.0/direct?q=" +
      cityName +
      "&limit=1&appid=2d81bc1f1b05a9a201fdb0947c29daec",
    requestOptions
  )
    .then((response) => response.json())
    .then((geo) => {
      console.log(geo);
      // check if API returned a valid city
      if (geo.length === 0) {
        // if fetch result is empty, alert user to enter valid city name
        cityInput.value = "";
        cityInput.setAttribute("placeholder", "Please Enter A Valid City Name");
        return false;
      }

      // save city location data
      currentCity.location.push(geo[0]);

      // send latitude and longitude to weather API
      weatherFetch(geo[0].lat, geo[0].lon);

      // send city info to currency code finder
      getCurrencyCode(geo);
    })
    .catch((error) => console.log("error", error));
};

// load saved data
var load = () => {
  var savedData = JSON.parse(localStorage.getItem("currentCity"));
  console.log(savedData);
  if (savedData === null) {
    return false;
  } else if (savedData.cityName.length > 0) {
    cityInput.value = savedData.cityName;
    var city = cityInput.value;
    currentCity.cityName.splice(0, 1, city);

    fetchCityLatLon(city);
  } else {
    return false;
  }
};

// on click, send city search input to geo locate fetch
$(searchForm).submit(function (e) {
  e.preventDefault();

  // pull city name from text input
  var city = cityInput.value;

  //save city name
  currentCity.cityName.push(city);

  // send city name to geo locate API
  fetchCityLatLon(city);
});

// currency input searches for exchange info
$(currencyForm).submit(function (e) {
  e.preventDefault();

  // send saved city location data to currency code finder
  getCurrencyCode(currentCity.location);
});

// load city from local storage
load();
