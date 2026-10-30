const FEEDS = [
  "site:amarujala.com/uttarakhand/chamoli",
  "site:jagran.com/uttarakhand chamoli",
  "site:uk.gov.in Uttarakhand news",
  "Chamoli Uttarakhand news religious cultural social"
];

function clean(value = "") {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function getTag(xml, tag) {
  const match = xml.match(
    new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i")
  );
  return match ? clean(match[1]) : "";
}

async function getFeed(query) {
  const url =
    "https://news.google.com/rss/search?q=" +
    encodeURIComponent(query) +
    "&hl=hi&gl=IN&ceid=IN:hi";

  const response = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
    signal: AbortSignal.timeout(12000)
  });

  if (!response.ok) return [];

  const xml = await response.text();
  const items = xml.match(/<item>[\s\S]*?<\/item>/gi) || [];

  return items.map(item => ({
    title: getTag(item, "title"),
    link: getTag(item, "link"),
    date: getTag(item, "pubDate"),
    source: getTag(item, "source")
  }));
}

export const handler = async () => {
  try {
    const results = await Promise.allSettled(
      FEEDS.map(getFeed)
    );

    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const allNews = [];

    results.forEach(result => {
      if (result.status === "fulfilled") {
        allNews.push(...result.value);
      }
    });

    const unique = new Map();

    allNews.forEach(news => {
      const time = new Date(news.date).getTime();

      if (
        !news.title ||
        !news.link ||
        !Number.isFinite(time) ||
        time < sevenDaysAgo
      ) return;

      const key = news.title.toLowerCase();

      if (!unique.has(key)) {
        unique.set(key, {
          ...news,
          publishedAt: new Date(time).toISOString(),
          chamoli: /chamoli|कर्णप्रयाग|गोपेश्वर|जोशीमठ|बदरीनाथ/i
            .test(news.title)
        });
      }
    });

    const news = [...unique.values()]
      .sort((a, b) =>
        Number(b.chamoli) - Number(a.chamoli) ||
        new Date(b.publishedAt) - new Date(a.publishedAt)
      )
      .slice(0, 10);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store"
      },
      body: JSON.stringify({
        success: true,
        updatedAt: new Date().toISOString(),
        count: news.length,
        news
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      },
      body: JSON.stringify({
        success: false,
        message: "समाचार प्राप्त करने में समस्या हुई।"
      })
    };
  }
};
