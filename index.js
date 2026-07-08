
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";

async function fetchWithTimeout(url, timeoutMs = 5000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });
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
    const params = parseQueryParams(req.url);
    const { lat, lon } = params;

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
    'https://uselessfacts.jsph.pl/api/v2/facts/random?language=en',
    5000
),
      fetchWithTimeout("https://catfact.ninja/random", 5000),
    ]);

    const response = {
      location: { latitude: lat, longitude: lon },
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

const routes = {
  "/": "./public/index.html",
  "/about": "./public/about.html",
  "/contact-me": "./public/contact-me.html",
};

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

async function handleRequest(req, res) {

    if (req.url.startsWith('/api/dashboard')) {
        return handleDashboardAPI(req, res);
    }
  try {
    const requestPath = req.url;
    const pagePath = routes[requestPath];

    if (!pagePath) {
      const notFoundHTML = await buildPage("./public/404.html");
      res.writeHead(404, { "Content-Type": "text/html" });
      res.end(notFoundHTML);
      return;
    }

    const html = await buildPage(pagePath);
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(html);
  } catch (err) {
    console.error("Error:", err.message);
    res.writeHead(500, { "Content-Type": "text/plain" });
    res.end("500 Server Error");
  }
}

const server = createServer(handleRequest);
const PORT = 8080;

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`Available routes:`, Object.keys(routes));
});
