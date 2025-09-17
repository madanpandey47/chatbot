const SANTIMENT_API_URL = "https://api.santiment.net/graphql";
const SANTIMENT_API_KEY = process.env.SANTIMENT_API_KEY;

const cache = new Map();

// Function to fetch data from Santiment API using GraphQL
export async function fetchSantimentMetric(metric, slug, from = "utc_now-1d", to = "utc_now") {
  const cacheKey = `${metric}:${slug}`;
  const now = Date.now();
  const cached = cache.get(cacheKey);

  if (cached && now - cached.time < 60_000) { // 60 second cache
    return cached.data;
  }

  const query = `
    query {
      getMetric(metric: "${metric}") {
        timeseriesData(slug: "${slug}", from: "${from}", to: "${to}", interval: "1d") {
          datetime
          value
        }
      }
    }
  `;

  if (!SANTIMENT_API_KEY) {
    throw new Error("Missing SANTIMENT_API_KEY environment variable.");
  }

  const response = await fetch(SANTIMENT_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Apikey ${SANTIMENT_API_KEY}`,
    },
    body: JSON.stringify({ query }),
  });

  const json = await response.json();
  const timeseriesData = json.data.getMetric.timeseriesData;

  if (timeseriesData && timeseriesData.length > 0) {
    const value = timeseriesData[timeseriesData.length - 1].value;
    cache.set(cacheKey, { time: now, data: value });
    return value;
  } else {
    return null;
  }
}
