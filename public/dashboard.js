function getGeolocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        reject(new Error(`Geolocation error: ${error.message}`));
      },
      {
        timeout: 10000,
        enableHighAccuracy: false,
      },
    );
  });
}

async function fetchDashboard(latitude, longitude) {
  const url = `/api/dashboard?lat=${latitude}&lon=${longitude}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`);
  }

  return await response.json();
}

async function initializeDashboard() {
  try {
    const { latitude, longitude } = await getGeolocation();
    document.getElementById("loading").textContent = "Fetching your data...";

    const data = await fetchDashboard(latitude, longitude);

    document.getElementById("loading").style.display = "none";

    document.getElementById("location-coords").textContent =
      `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;

    document.getElementById("location-info").style.display = "block";

    if (data.weather.status === "fulfilled") {
      document.getElementById("weather-temp").textContent =
        data.weather.data.temperature_2m;
      document.getElementById("weather-section").style.display = "block";
    } else {
      document.getElementById("weather-error").style.display = "block";
    }

    if (data.trivia.status === "fulfilled") {
      const trivia = data.trivia.data;
      document.getElementById("trivia-question").textContent = trivia.question;
      document.getElementById("trivia-difficulty").textContent =
        trivia.difficulty;
      document.getElementById("trivia-correct").textContent =
        trivia.correct_answer;

      const incorrectList = document.getElementById("trivia-incorrect");
      incorrectList.innerHTML = trivia.incorrect_answers
        .map((ans) => `<li>${ans}</li>`)
        .join('');

      document.getElementById("trivia-section").style.display = "block";
    } else {
      document.getElementById("trivia-error").style.display = "block";
    }

    if (data.funFact.status === "fulfilled") {
      document.getElementById("fun-fact").textContent = data.funFact.data;
      document.getElementById("fun-fact-section").style.display = "block";
    } else {
      document.getElementById("fun-fact-error").style.display = "block";
    }

    if (data.catFact.status === "fulfilled") {
      document.getElementById("cat-fact").textContent = data.catFact.data;
      document.getElementById("cat-fact-section").style.display = "block";
    } else {
      document.getElementById("cat-fact-error").style.display = "block";
    }
  } catch (err) {
    console.error("Dashboard error:", err);
    document.getElementById("loading").innerHTML = `
      <h2>Could not load dashboard</h2>
      <p>${err.message}</p>
      <p>Make sure you allow geolocation and try refreshing the page.</p>
    `;
  }
}

document.addEventListener("DOMContentLoaded", initializeDashboard);
