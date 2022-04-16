// html elements
var weatherInfoContainer = document.querySelector(".weather-info");
var currencyInfoContainer = document.querySelector(".currency-info");
var cityInput = document.querySelector(".search");
var searchForm = document.querySelector(".search-form");
var currencyForm = document.querySelector(".currency-form");
var moneyInput = document.querySelector(".money-input");
var moneyOutput = document.querySelector(".money-output");

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

// currency code obj
var currencyCode = [
  {
    Country: "New Zealand",
    CountryCode: "NZ",
    Currency: "New Zealand Dollars",
    Code: "NZD",
  },
  {
    Country: "Cook Islands",
    CountryCode: "CK",
    Currency: "New Zealand Dollars",
    Code: "NZD",
  },
  {
    Country: "Niue",
    CountryCode: "NU",
    Currency: "New Zealand Dollars",
    Code: "NZD",
  },
  {
    Country: "Pitcairn",
    CountryCode: "PN",
    Currency: "New Zealand Dollars",
    Code: "NZD",
  },
  {
    Country: "Tokelau",
    CountryCode: "TK",
    Currency: "New Zealand Dollars",
    Code: "NZD",
  },
  {
    Country: "Australian",
    CountryCode: "AU",
    Currency: "Australian Dollars",
    Code: "AUD",
  },
  {
    Country: "Christmas Island",
    CountryCode: "CX",
    Currency: "Australian Dollars",
    Code: "AUD",
  },
  {
    Country: "Cocos (Keeling) Islands",
    CountryCode: "CC",
    Currency: "Australian Dollars",
    Code: "AUD",
  },
  {
    Country: "Heard and Mc Donald Islands",
    CountryCode: "HM",
    Currency: "Australian Dollars",
    Code: "AUD",
  },
  {
    Country: "Kiribati",
    CountryCode: "KI",
    Currency: "Australian Dollars",
    Code: "AUD",
  },
  {
    Country: "Nauru",
    CountryCode: "NR",
    Currency: "Australian Dollars",
    Code: "AUD",
  },
  {
    Country: "Norfolk Island",
    CountryCode: "NF",
    Currency: "Australian Dollars",
    Code: "AUD",
  },
  {
    Country: "Tuvalu",
    CountryCode: "TV",
    Currency: "Australian Dollars",
    Code: "AUD",
  },
  {
    Country: "American Samoa",
    CountryCode: "AS",
    Currency: "Euros",
    Code: "EUR",
  },
  {
    Country: "Andorra",
    CountryCode: "AD",
    Currency: "Euros",
    Code: "EUR",
  },
  {
    Country: "Austria",
    CountryCode: "AT",
    Currency: "Euros",
    Code: "EUR",
  },
  {
    Country: "Belgium",
    CountryCode: "BE",
    Currency: "Euros",
    Code: "EUR",
  },
  {
    Country: "Finland",
    CountryCode: "FI",
    Currency: "Euros",
    Code: "EUR",
  },
  {
    Country: "France",
    CountryCode: "FR",
    Currency: "Euros",
    Code: "EUR",
  },
  {
    Country: "French Guiana",
    CountryCode: "GF",
    Currency: "Euros",
    Code: "EUR",
  },
  {
    Country: "French Southern Territories",
    CountryCode: "TF",
    Currency: "Euros",
    Code: "EUR",
  },
  {
    Country: "Germany",
    CountryCode: "DE",
    Currency: "Euros",
    Code: "EUR",
  },
  {
    Country: "Greece",
    CountryCode: "GR",
    Currency: "Euros",
    Code: "EUR",
  },
  {
    Country: "Guadeloupe",
    CountryCode: "GP",
    Currency: "Euros",
    Code: "EUR",
  },
  {
    Country: "Ireland",
    CountryCode: "IE",
    Currency: "Euros",
    Code: "EUR",
  },
  {
    Country: "Italy",
    CountryCode: "IT",
    Currency: "Euros",
    Code: "EUR",
  },
  {
    Country: "Luxembourg",
    CountryCode: "LU",
    Currency: "Euros",
    Code: "EUR",
  },
  {
    Country: "Martinique",
    CountryCode: "MQ",
    Currency: "Euros",
    Code: "EUR",
  },
  {
    Country: "Mayotte",
    CountryCode: "YT",
    Currency: "Euros",
    Code: "EUR",
  },
  {
    Country: "Monaco",
    CountryCode: "MC",
    Currency: "Euros",
    Code: "EUR",
  },
  {
    Country: "Netherlands",
    CountryCode: "NL",
    Currency: "Euros",
    Code: "EUR",
  },
  {
    Country: "Portugal",
    CountryCode: "PT",
    Currency: "Euros",
    Code: "EUR",
  },
  {
    Country: "Reunion",
    CountryCode: "RE",
    Currency: "Euros",
    Code: "EUR",
  },
  {
    Country: "Samoa",
    CountryCode: "WS",
    Currency: "Euros",
    Code: "EUR",
  },
  {
    Country: "San Marino",
    CountryCode: "SM",
    Currency: "Euros",
    Code: "EUR",
  },
  {
    Country: "Slovenia",
    CountryCode: "SI",
    Currency: "Euros",
    Code: "EUR",
  },
  {
    Country: "Spain",
    CountryCode: "ES",
    Currency: "Euros",
    Code: "EUR",
  },
  {
    Country: "Vatican City State (Holy See)",
    CountryCode: "VA",
    Currency: "Euros",
    Code: "EUR",
  },
  {
    Country: "South Georgia and the South Sandwich Islands",
    CountryCode: "GS",
    Currency: "Sterling",
    Code: "GBP",
  },
  {
    Country: "United Kingdom",
    CountryCode: "GB",
    Currency: "Sterling",
    Code: "GBP",
  },
  {
    Country: "Jersey",
    CountryCode: "JE",
    Currency: "Sterling",
    Code: "GBP",
  },
  {
    Country: "British Indian Ocean Territory",
    CountryCode: "IO",
    Currency: "USD",
    Code: "USD",
  },
  {
    Country: "Guam",
    CountryCode: "GU",
    Currency: "USD",
    Code: "USD",
  },
  {
    Country: "Marshall Islands",
    CountryCode: "MH",
    Currency: "USD",
    Code: "USD",
  },
  {
    Country: "Micronesia Federated States of",
    CountryCode: "FM",
    Currency: "USD",
    Code: "USD",
  },
  {
    Country: "Northern Mariana Islands",
    CountryCode: "MP",
    Currency: "USD",
    Code: "USD",
  },
  {
    Country: "Palau",
    CountryCode: "PW",
    Currency: "USD",
    Code: "USD",
  },
  {
    Country: "Puerto Rico",
    CountryCode: "PR",
    Currency: "USD",
    Code: "USD",
  },
  {
    Country: "Turks and Caicos Islands",
    CountryCode: "TC",
    Currency: "USD",
    Code: "USD",
  },
  {
    Country: "United States",
    CountryCode: "US",
    Currency: "USD",
    Code: "USD",
  },
  {
    Country: "United States Minor Outlying Islands",
    CountryCode: "UM",
    Currency: "USD",
    Code: "USD",
  },
  {
    Country: "Virgin Islands (British)",
    CountryCode: "VG",
    Currency: "USD",
    Code: "USD",
  },
  {
    Country: "Virgin Islands (US)",
    CountryCode: "VI",
    Currency: "USD",
    Code: "USD",
  },
  {
    Country: "Hong Kong",
    CountryCode: "HK",
    Currency: "HKD",
    Code: "HKD",
  },
  {
    Country: "Canada",
    CountryCode: "CA",
    Currency: "Canadian Dollar",
    Code: "CAD",
  },
  {
    Country: "Japan",
    CountryCode: "JP",
    Currency: "Japanese Yen",
    Code: "JPY",
  },
  {
    Country: "Afghanistan",
    CountryCode: "AF",
    Currency: "Afghani",
    Code: "AFN",
  },
  {
    Country: "Albania",
    CountryCode: "AL",
    Currency: "Lek",
    Code: "ALL",
  },
  {
    Country: "Algeria",
    CountryCode: "DZ",
    Currency: "Algerian Dinar",
    Code: "DZD",
  },
  {
    Country: "Anguilla",
    CountryCode: "AI",
    Currency: "East Caribbean Dollar",
    Code: "XCD",
  },
  {
    Country: "Antigua and Barbuda",
    CountryCode: "AG",
    Currency: "East Caribbean Dollar",
    Code: "XCD",
  },
  {
    Country: "Dominica",
    CountryCode: "DM",
    Currency: "East Caribbean Dollar",
    Code: "XCD",
  },
  {
    Country: "Grenada",
    CountryCode: "GD",
    Currency: "East Caribbean Dollar",
    Code: "XCD",
  },
  {
    Country: "Montserrat",
    CountryCode: "MS",
    Currency: "East Caribbean Dollar",
    Code: "XCD",
  },
  {
    Country: "Saint Kitts",
    CountryCode: "KN",
    Currency: "East Caribbean Dollar",
    Code: "XCD",
  },
  {
    Country: "Saint Lucia",
    CountryCode: "LC",
    Currency: "East Caribbean Dollar",
    Code: "XCD",
  },
  {
    Country: "Saint Vincent Grenadines",
    CountryCode: "VC",
    Currency: "East Caribbean Dollar",
    Code: "XCD",
  },
  {
    Country: "Argentina",
    CountryCode: "AR",
    Currency: "Peso",
    Code: "ARS",
  },
  {
    Country: "Armenia",
    CountryCode: "AM",
    Currency: "Dram",
    Code: "AMD",
  },
  {
    Country: "Aruba",
    CountryCode: "AW",
    Currency: "Netherlands Antilles Guilder",
    Code: "ANG",
  },
  {
    Country: "Netherlands Antilles",
    CountryCode: "AN",
    Currency: "Netherlands Antilles Guilder",
    Code: "ANG",
  },
  {
    Country: "Azerbaijan",
    CountryCode: "AZ",
    Currency: "Manat",
    Code: "AZN",
  },
  {
    Country: "Bahamas",
    CountryCode: "BS",
    Currency: "Bahamian Dollar",
    Code: "BSD",
  },
  {
    Country: "Bahrain",
    CountryCode: "BH",
    Currency: "Bahraini Dinar",
    Code: "BHD",
  },
  {
    Country: "Bangladesh",
    CountryCode: "BD",
    Currency: "Taka",
    Code: "BDT",
  },
  {
    Country: "Barbados",
    CountryCode: "BB",
    Currency: "Barbadian Dollar",
    Code: "BBD",
  },
  {
    Country: "Belarus",
    CountryCode: "BY",
    Currency: "Belarus Ruble",
    Code: "BYR",
  },
  {
    Country: "Belize",
    CountryCode: "BZ",
    Currency: "Belizean Dollar",
    Code: "BZD",
  },
  {
    Country: "Benin",
    CountryCode: "BJ",
    Currency: "CFA Franc BCEAO",
    Code: "XOF",
  },
  {
    Country: "Burkina Faso",
    CountryCode: "BF",
    Currency: "CFA Franc BCEAO",
    Code: "XOF",
  },
  {
    Country: "Guinea-Bissau",
    CountryCode: "GW",
    Currency: "CFA Franc BCEAO",
    Code: "XOF",
  },
  {
    Country: "Ivory Coast",
    CountryCode: "CI",
    Currency: "CFA Franc BCEAO",
    Code: "XOF",
  },
  {
    Country: "Mali",
    CountryCode: "ML",
    Currency: "CFA Franc BCEAO",
    Code: "XOF",
  },
  {
    Country: "Niger",
    CountryCode: "NE",
    Currency: "CFA Franc BCEAO",
    Code: "XOF",
  },
  {
    Country: "Senegal",
    CountryCode: "SN",
    Currency: "CFA Franc BCEAO",
    Code: "XOF",
  },
  {
    Country: "Togo",
    CountryCode: "TG",
    Currency: "CFA Franc BCEAO",
    Code: "XOF",
  },
  {
    Country: "Bermuda",
    CountryCode: "BM",
    Currency: "Bermudian Dollar",
    Code: "BMD",
  },
  {
    Country: "Bhutan",
    CountryCode: "BT",
    Currency: "Indian Rupee",
    Code: "INR",
  },
  {
    Country: "India",
    CountryCode: "IN",
    Currency: "Indian Rupee",
    Code: "INR",
  },
  {
    Country: "Bolivia",
    CountryCode: "BO",
    Currency: "Boliviano",
    Code: "BOB",
  },
  {
    Country: "Botswana",
    CountryCode: "BW",
    Currency: "Pula",
    Code: "BWP",
  },
  {
    Country: "Bouvet Island",
    CountryCode: "BV",
    Currency: "Norwegian Krone",
    Code: "NOK",
  },
  {
    Country: "Norway",
    CountryCode: "NO",
    Currency: "Norwegian Krone",
    Code: "NOK",
  },
  {
    Country: "Svalbard and Jan Mayen Islands",
    CountryCode: "SJ",
    Currency: "Norwegian Krone",
    Code: "NOK",
  },
  {
    Country: "Brazil",
    CountryCode: "BR",
    Currency: "Brazil",
    Code: "BRL",
  },
  {
    Country: "Brunei Darussalam",
    CountryCode: "BN",
    Currency: "Bruneian Dollar",
    Code: "BND",
  },
  {
    Country: "Bulgaria",
    CountryCode: "BG",
    Currency: "Lev",
    Code: "BGN",
  },
  {
    Country: "Burundi",
    CountryCode: "BI",
    Currency: "Burundi Franc",
    Code: "BIF",
  },
  {
    Country: "Cambodia",
    CountryCode: "KH",
    Currency: "Riel",
    Code: "KHR",
  },
  {
    Country: "Cameroon",
    CountryCode: "CM",
    Currency: "CFA Franc BEAC",
    Code: "XAF",
  },
  {
    Country: "Central African Republic",
    CountryCode: "CF",
    Currency: "CFA Franc BEAC",
    Code: "XAF",
  },
  {
    Country: "Chad",
    CountryCode: "TD",
    Currency: "CFA Franc BEAC",
    Code: "XAF",
  },
  {
    Country: "Congo Republic of the Democratic",
    CountryCode: "CG",
    Currency: "CFA Franc BEAC",
    Code: "XAF",
  },
  {
    Country: "Equatorial Guinea",
    CountryCode: "GQ",
    Currency: "CFA Franc BEAC",
    Code: "XAF",
  },
  {
    Country: "Gabon",
    CountryCode: "GA",
    Currency: "CFA Franc BEAC",
    Code: "XAF",
  },
  {
    Country: "Cape Verde",
    CountryCode: "CV",
    Currency: "Escudo",
    Code: "CVE",
  },
  {
    Country: "Cayman Islands",
    CountryCode: "KY",
    Currency: "Caymanian Dollar",
    Code: "KYD",
  },
  {
    Country: "Chile",
    CountryCode: "CL",
    Currency: "Chilean Peso",
    Code: "CLP",
  },
  {
    Country: "China",
    CountryCode: "CN",
    Currency: "Yuan Renminbi",
    Code: "CNY",
  },
  {
    Country: "Colombia",
    CountryCode: "CO",
    Currency: "Peso",
    Code: "COP",
  },
  {
    Country: "Comoros",
    CountryCode: "KM",
    Currency: "Comoran Franc",
    Code: "KMF",
  },
  {
    Country: "Congo-Brazzaville",
    CountryCode: "CD",
    Currency: "Congolese Frank",
    Code: "CDF",
  },
  {
    Country: "Costa Rica",
    CountryCode: "CR",
    Currency: "Costa Rican Colon",
    Code: "CRC",
  },
  {
    Country: "Croatia (Hrvatska)",
    CountryCode: "HR",
    Currency: "Croatian Dinar",
    Code: "HRK",
  },
  {
    Country: "Cuba",
    CountryCode: "CU",
    Currency: "Cuban Peso",
    Code: "CUP",
  },
  {
    Country: "Cyprus",
    CountryCode: "CY",
    Currency: "Cypriot Pound",
    Code: "CYP",
  },
  {
    Country: "Czech Republic",
    CountryCode: "CZ",
    Currency: "Koruna",
    Code: "CZK",
  },
  {
    Country: "Denmark",
    CountryCode: "DK",
    Currency: "Danish Krone",
    Code: "DKK",
  },
  {
    Country: "Faroe Islands",
    CountryCode: "FO",
    Currency: "Danish Krone",
    Code: "DKK",
  },
  {
    Country: "Greenland",
    CountryCode: "GL",
    Currency: "Danish Krone",
    Code: "DKK",
  },
  {
    Country: "Djibouti",
    CountryCode: "DJ",
    Currency: "Djiboutian Franc",
    Code: "DJF",
  },
  {
    Country: "Dominican Republic",
    CountryCode: "DO",
    Currency: "Dominican Peso",
    Code: "DOP",
  },
  {
    Country: "East Timor",
    CountryCode: "TP",
    Currency: "Indonesian Rupiah",
    Code: "IDR",
  },
  {
    Country: "Indonesia",
    CountryCode: "ID",
    Currency: "Indonesian Rupiah",
    Code: "IDR",
  },
  {
    Country: "Ecuador",
    CountryCode: "EC",
    Currency: "Sucre",
    Code: "ECS",
  },
  {
    Country: "Egypt",
    CountryCode: "EG",
    Currency: "Egyptian Pound",
    Code: "EGP",
  },
  {
    Country: "El Salvador",
    CountryCode: "SV",
    Currency: "Salvadoran Colon",
    Code: "SVC",
  },
  {
    Country: "Eritrea",
    CountryCode: "ER",
    Currency: "Ethiopian Birr",
    Code: "ETB",
  },
  {
    Country: "Ethiopia",
    CountryCode: "ET",
    Currency: "Ethiopian Birr",
    Code: "ETB",
  },
  {
    Country: "Estonia",
    CountryCode: "EE",
    Currency: "Estonian Kroon",
    Code: "EEK",
  },
  {
    Country: "Falkland Islands (Malvinas)",
    CountryCode: "FK",
    Currency: "Falkland Pound",
    Code: "FKP",
  },
  {
    Country: "Fiji",
    CountryCode: "FJ",
    Currency: "Fijian Dollar",
    Code: "FJD",
  },
  {
    Country: "French Polynesia",
    CountryCode: "PF",
    Currency: "CFP Franc",
    Code: "XPF",
  },
  {
    Country: "New Caledonia",
    CountryCode: "NC",
    Currency: "CFP Franc",
    Code: "XPF",
  },
  {
    Country: "Wallis and Futuna Islands",
    CountryCode: "WF",
    Currency: "CFP Franc",
    Code: "XPF",
  },
  {
    Country: "Gambia",
    CountryCode: "GM",
    Currency: "Dalasi",
    Code: "GMD",
  },
  {
    Country: "Georgia",
    CountryCode: "GE",
    Currency: "Lari",
    Code: "GEL",
  },
  {
    Country: "Gibraltar",
    CountryCode: "GI",
    Currency: "Gibraltar Pound",
    Code: "GIP",
  },
  {
    Country: "Guatemala",
    CountryCode: "GT",
    Currency: "Quetzal",
    Code: "GTQ",
  },
  {
    Country: "Guinea",
    CountryCode: "GN",
    Currency: "Guinean Franc",
    Code: "GNF",
  },
  {
    Country: "Guyana",
    CountryCode: "GY",
    Currency: "Guyanaese Dollar",
    Code: "GYD",
  },
  {
    Country: "Haiti",
    CountryCode: "HT",
    Currency: "Gourde",
    Code: "HTG",
  },
  {
    Country: "Honduras",
    CountryCode: "HN",
    Currency: "Lempira",
    Code: "HNL",
  },
  {
    Country: "Hungary",
    CountryCode: "HU",
    Currency: "Forint",
    Code: "HUF",
  },
  {
    Country: "Iceland",
    CountryCode: "IS",
    Currency: "Icelandic Krona",
    Code: "ISK",
  },
  {
    Country: "Iran (Islamic Republic of)",
    CountryCode: "IR",
    Currency: "Iranian Rial",
    Code: "IRR",
  },
  {
    Country: "Iraq",
    CountryCode: "IQ",
    Currency: "Iraqi Dinar",
    Code: "IQD",
  },
  {
    Country: "Israel",
    CountryCode: "IL",
    Currency: "Shekel",
    Code: "ILS",
  },
  {
    Country: "Jamaica",
    CountryCode: "JM",
    Currency: "Jamaican Dollar",
    Code: "JMD",
  },
  {
    Country: "Jordan",
    CountryCode: "JO",
    Currency: "Jordanian Dinar",
    Code: "JOD",
  },
  {
    Country: "Kazakhstan",
    CountryCode: "KZ",
    Currency: "Tenge",
    Code: "KZT",
  },
  {
    Country: "Kenya",
    CountryCode: "KE",
    Currency: "Kenyan Shilling",
    Code: "KES",
  },
  {
    Country: "Korea North",
    CountryCode: "KP",
    Currency: "Won",
    Code: "KPW",
  },
  {
    Country: "Korea South",
    CountryCode: "KR",
    Currency: "Won",
    Code: "KRW",
  },
  {
    Country: "Kuwait",
    CountryCode: "KW",
    Currency: "Kuwaiti Dinar",
    Code: "KWD",
  },
  {
    Country: "Kyrgyzstan",
    CountryCode: "KG",
    Currency: "Som",
    Code: "KGS",
  },
  {
    Country: "Lao PeopleÕs Democratic Republic",
    CountryCode: "LA",
    Currency: "Kip",
    Code: "LAK",
  },
  {
    Country: "Latvia",
    CountryCode: "LV",
    Currency: "Lat",
    Code: "LVL",
  },
  {
    Country: "Lebanon",
    CountryCode: "LB",
    Currency: "Lebanese Pound",
    Code: "LBP",
  },
  {
    Country: "Lesotho",
    CountryCode: "LS",
    Currency: "Loti",
    Code: "LSL",
  },
  {
    Country: "Liberia",
    CountryCode: "LR",
    Currency: "Liberian Dollar",
    Code: "LRD",
  },
  {
    Country: "Libyan Arab Jamahiriya",
    CountryCode: "LY",
    Currency: "Libyan Dinar",
    Code: "LYD",
  },
  {
    Country: "Liechtenstein",
    CountryCode: "LI",
    Currency: "Swiss Franc",
    Code: "CHF",
  },
  {
    Country: "Switzerland",
    CountryCode: "CH",
    Currency: "Swiss Franc",
    Code: "CHF",
  },
  {
    Country: "Lithuania",
    CountryCode: "LT",
    Currency: "Lita",
    Code: "LTL",
  },
  {
    Country: "Macau",
    CountryCode: "MO",
    Currency: "Pataca",
    Code: "MOP",
  },
  {
    Country: "Macedonia",
    CountryCode: "MK",
    Currency: "Denar",
    Code: "MKD",
  },
  {
    Country: "Madagascar",
    CountryCode: "MG",
    Currency: "Malagasy Franc",
    Code: "MGA",
  },
  {
    Country: "Malawi",
    CountryCode: "MW",
    Currency: "Malawian Kwacha",
    Code: "MWK",
  },
  {
    Country: "Malaysia",
    CountryCode: "MY",
    Currency: "Ringgit",
    Code: "MYR",
  },
  {
    Country: "Maldives",
    CountryCode: "MV",
    Currency: "Rufiyaa",
    Code: "MVR",
  },
  {
    Country: "Malta",
    CountryCode: "MT",
    Currency: "Maltese Lira",
    Code: "MTL",
  },
  {
    Country: "Mauritania",
    CountryCode: "MR",
    Currency: "Ouguiya",
    Code: "MRO",
  },
  {
    Country: "Mauritius",
    CountryCode: "MU",
    Currency: "Mauritian Rupee",
    Code: "MUR",
  },
  {
    Country: "Mexico",
    CountryCode: "MX",
    Currency: "Peso",
    Code: "MXN",
  },
  {
    Country: "Moldova Republic of",
    CountryCode: "MD",
    Currency: "Leu",
    Code: "MDL",
  },
  {
    Country: "Mongolia",
    CountryCode: "MN",
    Currency: "Tugrik",
    Code: "MNT",
  },
  {
    Country: "Morocco",
    CountryCode: "MA",
    Currency: "Dirham",
    Code: "MAD",
  },
  {
    Country: "Western Sahara",
    CountryCode: "EH",
    Currency: "Dirham",
    Code: "MAD",
  },
  {
    Country: "Mozambique",
    CountryCode: "MZ",
    Currency: "Metical",
    Code: "MZN",
  },
  {
    Country: "Myanmar",
    CountryCode: "MM",
    Currency: "Kyat",
    Code: "MMK",
  },
  {
    Country: "Namibia",
    CountryCode: "NA",
    Currency: "Dollar",
    Code: "NAD",
  },
  {
    Country: "Nepal",
    CountryCode: "NP",
    Currency: "Nepalese Rupee",
    Code: "NPR",
  },
  {
    Country: "Nicaragua",
    CountryCode: "NI",
    Currency: "Cordoba Oro",
    Code: "NIO",
  },
  {
    Country: "Nigeria",
    CountryCode: "NG",
    Currency: "Naira",
    Code: "NGN",
  },
  {
    Country: "Oman",
    CountryCode: "OM",
    Currency: "Sul Rial",
    Code: "OMR",
  },
  {
    Country: "Pakistan",
    CountryCode: "PK",
    Currency: "Rupee",
    Code: "PKR",
  },
  {
    Country: "Panama",
    CountryCode: "PA",
    Currency: "Balboa",
    Code: "PAB",
  },
  {
    Country: "Papua New Guinea",
    CountryCode: "PG",
    Currency: "Kina",
    Code: "PGK",
  },
  {
    Country: "Paraguay",
    CountryCode: "PY",
    Currency: "Guarani",
    Code: "PYG",
  },
  {
    Country: "Peru",
    CountryCode: "PE",
    Currency: "Nuevo Sol",
    Code: "PEN",
  },
  {
    Country: "Philippines",
    CountryCode: "PH",
    Currency: "Peso",
    Code: "PHP",
  },
  {
    Country: "Poland",
    CountryCode: "PL",
    Currency: "Zloty",
    Code: "PLN",
  },
  {
    Country: "Qatar",
    CountryCode: "QA",
    Currency: "Rial",
    Code: "QAR",
  },
  {
    Country: "Romania",
    CountryCode: "RO",
    Currency: "Leu",
    Code: "RON",
  },
  {
    Country: "Russian Federation",
    CountryCode: "RU",
    Currency: "Ruble",
    Code: "RUB",
  },
  {
    Country: "Rwanda",
    CountryCode: "RW",
    Currency: "Rwanda Franc",
    Code: "RWF",
  },
  {
    Country: "Sao Tome and Principe",
    CountryCode: "ST",
    Currency: "Dobra",
    Code: "STD",
  },
  {
    Country: "Saudi Arabia",
    CountryCode: "SA",
    Currency: "Riyal",
    Code: "SAR",
  },
  {
    Country: "Seychelles",
    CountryCode: "SC",
    Currency: "Rupee",
    Code: "SCR",
  },
  {
    Country: "Sierra Leone",
    CountryCode: "SL",
    Currency: "Leone",
    Code: "SLL",
  },
  {
    Country: "Singapore",
    CountryCode: "SG",
    Currency: "Dollar",
    Code: "SGD",
  },
  {
    Country: "Slovakia (Slovak Republic)",
    CountryCode: "SK",
    Currency: "Koruna",
    Code: "SKK",
  },
  {
    Country: "Solomon Islands",
    CountryCode: "SB",
    Currency: "Solomon Islands Dollar",
    Code: "SBD",
  },
  {
    Country: "Somalia",
    CountryCode: "SO",
    Currency: "Shilling",
    Code: "SOS",
  },
  {
    Country: "South Africa",
    CountryCode: "ZA",
    Currency: "Rand",
    Code: "ZAR",
  },
  {
    Country: "Sri Lanka",
    CountryCode: "LK",
    Currency: "Rupee",
    Code: "LKR",
  },
  {
    Country: "Sudan",
    CountryCode: "SD",
    Currency: "Dinar",
    Code: "SDG",
  },
  {
    Country: "Suriname",
    CountryCode: "SR",
    Currency: "Surinamese Guilder",
    Code: "SRD",
  },
  {
    Country: "Swaziland",
    CountryCode: "SZ",
    Currency: "Lilangeni",
    Code: "SZL",
  },
  {
    Country: "Sweden",
    CountryCode: "SE",
    Currency: "Krona",
    Code: "SEK",
  },
  {
    Country: "Syrian Arab Republic",
    CountryCode: "SY",
    Currency: "Syrian Pound",
    Code: "SYP",
  },
  {
    Country: "Taiwan",
    CountryCode: "TW",
    Currency: "Dollar",
    Code: "TWD",
  },
  {
    Country: "Tajikistan",
    CountryCode: "TJ",
    Currency: "Tajikistan Ruble",
    Code: "TJS",
  },
  {
    Country: "Tanzania",
    CountryCode: "TZ",
    Currency: "Shilling",
    Code: "TZS",
  },
  {
    Country: "Thailand",
    CountryCode: "TH",
    Currency: "Baht",
    Code: "THB",
  },
  {
    Country: "Tonga",
    CountryCode: "TO",
    Currency: "PaÕanga",
    Code: "TOP",
  },
  {
    Country: "Trinidad and Tobago",
    CountryCode: "TT",
    Currency: "Trinidad and Tobago Dollar",
    Code: "TTD",
  },
  {
    Country: "Tunisia",
    CountryCode: "TN",
    Currency: "Tunisian Dinar",
    Code: "TND",
  },
  {
    Country: "Turkey",
    CountryCode: "TR",
    Currency: "Lira",
    Code: "TRY",
  },
  {
    Country: "Turkmenistan",
    CountryCode: "TM",
    Currency: "Manat",
    Code: "TMT",
  },
  {
    Country: "Uganda",
    CountryCode: "UG",
    Currency: "Shilling",
    Code: "UGX",
  },
  {
    Country: "Ukraine",
    CountryCode: "UA",
    Currency: "Hryvnia",
    Code: "UAH",
  },
  {
    Country: "United Arab Emirates",
    CountryCode: "AE",
    Currency: "Dirham",
    Code: "AED",
  },
  {
    Country: "Uruguay",
    CountryCode: "UY",
    Currency: "Peso",
    Code: "UYU",
  },
  {
    Country: "Uzbekistan",
    CountryCode: "UZ",
    Currency: "Som",
    Code: "UZS",
  },
  {
    Country: "Vanuatu",
    CountryCode: "VU",
    Currency: "Vatu",
    Code: "VUV",
  },
  {
    Country: "Venezuela",
    CountryCode: "VE",
    Currency: "Bolivar",
    Code: "VEF",
  },
  {
    Country: "Vietnam",
    CountryCode: "VN",
    Currency: "Dong",
    Code: "VND",
  },
  {
    Country: "Yemen",
    CountryCode: "YE",
    Currency: "Rial",
    Code: "YER",
  },
  {
    Country: "Zambia",
    CountryCode: "ZM",
    Currency: "Kwacha",
    Code: "ZMK",
  },
  {
    Country: "Zimbabwe",
    CountryCode: "ZW",
    Currency: "Zimbabwe Dollar",
    Code: "ZWD",
  },
  {
    Country: "Aland Islands",
    CountryCode: "AX",
    Currency: "Euro",
    Code: "EUR",
  },
  {
    Country: "Angola",
    CountryCode: "AO",
    Currency: "Angolan kwanza",
    Code: "AOA",
  },
  {
    Country: "Antarctica",
    CountryCode: "AQ",
    Currency: "Antarctican dollar",
    Code: "AQD",
  },
  {
    Country: "Bosnia and Herzegovina",
    CountryCode: "BA",
    Currency: "Bosnia and Herzegovina convertible mark",
    Code: "BAM",
  },
  {
    Country: "Congo (Kinshasa)",
    CountryCode: "CD",
    Currency: "Congolese Frank",
    Code: "CDF",
  },
  {
    Country: "Ghana",
    CountryCode: "GH",
    Currency: "Ghana cedi",
    Code: "GHS",
  },
  {
    Country: "Guernsey",
    CountryCode: "GG",
    Currency: "Guernsey pound",
    Code: "GGP",
  },
  {
    Country: "Isle of Man",
    CountryCode: "IM",
    Currency: "Manx pound",
    Code: "GBP",
  },
  {
    Country: "Laos",
    CountryCode: "LA",
    Currency: "Lao kip",
    Code: "LAK",
  },
  {
    Country: "Macao S.A.R.",
    CountryCode: "MO",
    Currency: "Macanese pataca",
    Code: "MOP",
  },
  {
    Country: "Montenegro",
    CountryCode: "ME",
    Currency: "Euro",
    Code: "EUR",
  },
  {
    Country: "Palestinian Territory",
    CountryCode: "PS",
    Currency: "Jordanian dinar",
    Code: "JOD",
  },
  {
    Country: "Saint Barthelemy",
    CountryCode: "BL",
    Currency: "Euro",
    Code: "EUR",
  },
  {
    Country: "Saint Helena",
    CountryCode: "SH",
    Currency: "Saint Helena pound",
    Code: "GBP",
  },
  {
    Country: "Saint Martin (French part)",
    CountryCode: "MF",
    Currency: "Netherlands Antillean guilder",
    Code: "ANG",
  },
  {
    Country: "Saint Pierre and Miquelon",
    CountryCode: "PM",
    Currency: "Euro",
    Code: "EUR",
  },
  {
    Country: "Serbia",
    CountryCode: "RS",
    Currency: "Serbian dinar",
    Code: "RSD",
  },
  {
    Country: "US Armed Forces",
    CountryCode: "USAF",
    Currency: "US Dollar",
    Code: "USD",
  },
];
