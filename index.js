import { readFile } from "node:fs/promises";
import express from "express";

async function fetchWithTimeout(url, timeoutMs = 5000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "InfoSite/1.0 (Learning Project)",
      },
    });
    return await response.json();
  } catch (err) {
    throw new Error(`API error: ${err.message}`);
  } finally {
    clearTimeout(timeoutId);
  }
}

function parseQueryParams(url) {
  const [, query] = url.split("?");
  if (!query) return {};

  const params = {};
  query.split("&").forEach((param) => {
    const [key, value] = param.split("=");
    params[decodeURIComponent(key)] = decodeURIComponent(value);
  });

  return params;
}

async function handleDashboardAPI(req, res) {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Missing lat/lon parameters" }));
      return;
    }

    const randomNumber = Math.floor(Math.random() * 1000);

    const results = await Promise.allSettled([
      fetchWithTimeout(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`,
        5000,
      ),
      fetchWithTimeout(
        "https://opentdb.com/api.php?amount=1&type=multiple",
        5000,
      ),
      fetchWithTimeout(
        "https://uselessfacts.jsph.pl/api/v2/facts/random?language=en",
        5000,
      ),
      fetchWithTimeout("https://catfact.ninja/fact", 5000),
      fetchWithTimeout(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
        5000,
      ),
    ]);

    const response = {
      location: {
        latitude: lat,
        longitude: lon,
        address:
          results[4].status === "fulfilled"
            ? `${results[4].value.address.town || results[4].value.address.city || results[4].value.address.village}, ${results[4].value.address.country}`
            : null,
      },
      weather: {
        data:
          results[0].status === "fulfilled" ? results[0].value.current : null,
        status: results[0].status,
      },
      trivia: {
        data:
          results[1].status === "fulfilled"
            ? results[1].value.results[0]
            : null,
        status: results[1].status,
      },
      funFact: {
        data: results[2].status === "fulfilled" ? results[2].value.text : null,
        status: results[2].status,
      },
      catFact: {
        data: results[3].status === "fulfilled" ? results[3].value.fact : null,
        status: results[3].status,
      },
      timeStamp: new Date().toISOString(),
    };

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(response));
  } catch (err) {
    console.error("Dashboard API error", err);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Failed to fetch dashboard data" }));
  }
}


async function buildPage(pagePath) {
  try {
    const header = await readFile("./public/header.html", "utf8");
    const page = await readFile(pagePath, "utf8");
    const footer = await readFile("./public/footer.html", "utf8");
    return header + page + footer;
  } catch (err) {
    throw err;
  }
}


const app = express();

app.use(express.static('public'));

app.get('/', async (req, res) => {
  try {
    const html = await buildPage('./public/index.html');
    res.send(html);
  } catch (err) {
    console.log('Error loading home page:', err);
    res.status(500).send('500 Server Error')
  }
});

app.get('/about', async (req, res) => {
  try {
    const html = await buildPage('./public/about.html');
    res.send(html);
  } catch (err) {
    console.log('Error loading about page:', err);
    res.status(500).send('500 Server Error')
  }
});

app.get('/contact-me', async (req, res) => {
  try {
    const html = await buildPage('./public/contact-me.html');
    res.send(html);
  } catch (err) {
    console.log('Error loading contact page:', err);
    res.status(500).send('500 Server Error')
  }
});

app.get('/api/dashboard', handleDashboardAPI);

app.use((req, res) => {
  res.status(404).send('404 Page Not Found');
});

const PORT = 8080;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`Available routes: [/, /about, /contact-me, /api/dashboard]`);
})