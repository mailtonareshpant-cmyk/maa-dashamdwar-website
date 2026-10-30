export const config = {
  schedule: "*/30 * * * *"
};

export default async () => {
  try {
    const siteUrl = process.env.URL;

    if (!siteUrl) {
      throw new Error("Netlify URL not configured");
    }

    const response = await fetch(
      `${siteUrl}/.netlify/functions/news-feed`,
      { signal: AbortSignal.timeout(25000) }
    );

    if (!response.ok) {
      throw new Error("News feed request failed");
    }

    const data = await response.json();

    console.log("News refresh completed:", data.count);

    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.error("News refresh error:", error.message);

    return {
      statusCode: 500,
      body: JSON.stringify({ success: false })
    };
  }
};
