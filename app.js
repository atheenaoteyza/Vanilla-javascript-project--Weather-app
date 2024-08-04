/* fetch data */
async function fetchWeather(city) {
  const url = getUrl(city);
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

/*function formatTime(timeString) {
  // Parse the time string using a regular expression
  const [time, period] = timeString.split(" ");
  const [hours, minutes, seconds] = time.split(":");

  // Format hours and minutes
  let formattedTime = `${hours}:${minutes}`;

  // Handle AM/PM if needed
  if (period) {
    formattedTime += ` ${period}`;
  }

  return formattedTime;
}*/
function currentTime(offsetInSeconds, formatOption = "time") {
  // Create a new Date object for the current UTC time
  const now = new Date();

  // Convert the offset from seconds to milliseconds
  const offsetInMilliseconds = offsetInSeconds * 1000;

  // Calculate the local time by adding the offset to UTC time
  const localTime = new Date(now.getTime() + offsetInMilliseconds);

  // Format the local time
  let formatter = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC", // This should be UTC for offset calculations
  });

  // Get the formatted time string
  if (formatOption == "time") {
    const currentTime = formatter.format(localTime);

    // Display the time
    return currentTime;
  }

  if (formatOption == "date") {
    formatter = new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC", // This should be UTC for offset calculations
    });

    const currentDate = formatter.format(localTime);
    return currentDate;
  } else {
    return new Date().toLocaleTimeString;
  }
}

function formatSunriseSunset(timestamp, timezoneOffsetSeconds) {
  // Convert timestamp to milliseconds
  const sunriseDate = new Date(timestamp * 1000);

  // Convert timezone offset to milliseconds
  const timezoneOffsetMillis = timezoneOffsetSeconds * 1000;

  // Adjust sunrise time for the timezone offset
  const localSunriseDate = new Date(
    sunriseDate.getTime() + timezoneOffsetMillis
  );

  const formatter = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true, // 12-hour format with AM/PM
    timeZone: "UTC", // Use UTC for formatting, or omit for local timezone
  });

  const formattedSunriseSunsetTime = formatter.format(localSunriseDate);
  return formattedSunriseSunsetTime;
}

function getTimePeriod(timeString) {
  // Regular expression to match time and "AM" or "PM"
  const timeRegex = /^(\d{2}):(\d{2})\s*(AM|PM)$/i;

  // Extract time components and period
  const match = timeString.match(timeRegex);

  if (match) {
    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const period = match[3].toUpperCase();

    // Convert time to 24-hour format for easier comparison
    let totalMinutes;
    if (period === "AM") {
      totalMinutes = hours === 12 ? 0 * 60 + minutes : hours * 60 + minutes;
    } else {
      totalMinutes =
        hours === 12 ? 12 * 60 + minutes : (hours + 12) * 60 + minutes;
    }

    // Define custom ranges
    const morningStart = 5 * 60; // 05:00 AM
    const morningEnd = 17 * 60 + 59; // 05:59 PM

    const nightStart = 18 * 60; // 06:00 PM
    const nightEnd = 4 * 60 + 59; // 04:59 AM (next day)

    // Determine if it's morning or night based on custom ranges
    if (
      (totalMinutes >= morningStart && totalMinutes <= morningEnd) ||
      totalMinutes >= nightStart ||
      totalMinutes <= nightEnd
    ) {
      // Handle night period which spans midnight
      if (totalMinutes >= nightStart || totalMinutes <= nightEnd) {
        disableMorning();
        return "Night";
      } else {
        enableMorning();
        return "Morning";
      }
    } else {
      return "Morning";
    }
  } else {
    return "Invalid time format";
  }
}

// check for saved 'darkMode' in localStorage
let morningMode = localStorage.getItem("morningMode");
const weatherLike = document.querySelector(".weather-img");
const weatherCondition = document.querySelector(".weather-condition");

const enableMorning = () => {
  document.body.classList.remove("night");
  document.body.classList.add("morning");
  weatherCondition.insertBefore(weatherLike, weatherCondition.firstChild);

  const conditionElement = document.querySelector("#condition");
  if (conditionElement) {
    const condition = conditionElement.textContent.trim();
    const weatherImages = {
      Thunderstorm: "images/thunderstorm.png",
      "Clear sky": "images/clear.png",
      "Few clouds": "images/clouds.png",
      "Scattered clouds": "images/scattered-clouds.png",
      "Broken clouds": "images/broken-clouds.png",
      "Shower rain": "images/shower-rain.png",
      "Light rain": "images/rain.png",
      Rain: "images/rain.png",
      Mist: "images/mist.png",
      Snow: "images/snow.png",
      "Overcast clouds": "images/overcast-clouds.png",
    };
    weatherLike.src = weatherImages[condition] || "images/clouds.png";
  } else {
    weatherLike.src = "images/clouds.png";
  }

  localStorage.setItem("morningMode", "enabled");
};

const disableMorning = () => {
  // 1. Remove the class from the body
  document.body.classList.remove("morning");
  weatherLike.remove();
  document.body.classList.add("night");
  // 2. Update darkMode in localStorage
  localStorage.setItem("morningMode", null);
};
const input = document.querySelector("input");

function getUrl(city) {
  const cityInput = input.value;
  const apiKey = "50c11528fec2391744474d6716cfc5d0";
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityInput}&appid=${apiKey}`;
  return url;
}

async function render(city) {
  if (city) {
    const fetchedData = await fetchWeather(city);
    const timezone = fetchedData.timezone;

    /* City name */
    const cityElement = document.getElementById("city");
    cityElement.textContent = city.charAt(0).toUpperCase() + city.slice(1);

    /* rendering the current date */
    const today = document.querySelector(".today");
    const date = currentTime(timezone, "date");
    const [month, day] = date.split(" ");
    today.textContent = `Today, ${day.split(",").join("")} ${month}`;

    /*rendering temperature */
    const temperature = document.getElementById("temperature");
    temperature.textContent = `${Math.floor(fetchedData.main.temp - 273.15)}°C`;

    /*renders weather condition */
    const condition = document.getElementById("condition");
    const [{ description }] = fetchedData.weather;
    condition.textContent =
      description.charAt(0).toUpperCase() + description.slice(1);
    /*renders sunrise and sunset */
    const sunriseTime = document.querySelector(".sunrise-time");
    const sunsetTime = document.querySelector(".sunset");
    const sunriseTimestamp = fetchedData.sys.sunrise;
    const sunsetTimestamp = fetchedData.sys.sunset;
    const sunrise = formatSunriseSunset(sunriseTimestamp, timezone);
    const sunset = formatSunriseSunset(sunsetTimestamp, timezone);
    sunriseTime.textContent = sunrise;
    sunsetTime.textContent = `Sunset: ${sunset}`;

    /*renders humidity and wind speed*/
    const humidity = document.querySelector(".humidity");
    humidity.textContent = `${fetchedData.main.humidity}%`;
    const windSpeed = document.querySelector(".wind-speed");
    windSpeed.textContent = `Wind speed: ${fetchedData.wind.speed} km/hr`;
    const timeNow = currentTime(timezone, "time");
    getTimePeriod(timeNow, "time");

    /* interchanges condition image depending on weather conditions */

    // Show weather container
  }
}
const search = document.querySelector(".search");
document.addEventListener("click", async (e) => {
  if (e.target.tagName == "BUTTON") {
    e.preventDefault();
    await render(input.value);
  }
  input.value = "";
});

document.addEventListener("DOMContentLoaded", () => {
  // Access the body element
  const body = document.querySelector("body");

  // Add the 'visible' class to make the body element fade in
  body.classList.remove("hidden");
  body.classList.add("visible");
});

(async () => {
  input.value = "Manila";
  await render(input.value);
})();
