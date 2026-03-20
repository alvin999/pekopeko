const GET = async ({ request }) => {
  const url = new URL(request.url);
  const targetUrl = url.searchParams.get("url");
  if (!targetUrl) {
    return new Response(JSON.stringify({ error: "Missing URL parameter" }), { status: 400 });
  }
  try {
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Accept-Language": "zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7"
      },
      redirect: "follow"
    });
    if (!response.ok) {
      return new Response(JSON.stringify({ error: "Failed to fetch the URL" }), { status: 500 });
    }
    const finalUrl = response.url;
    let title = "";
    const html = await response.text();
    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    if (titleMatch) {
      title = titleMatch[1];
    }
    if (!title || title.includes("Google 地圖") || title.includes("Google Maps")) {
      const placeMatch = finalUrl.match(/\/place\/(.*?)\//);
      if (placeMatch && placeMatch[1]) {
        title = decodeURIComponent(placeMatch[1].replace(/\+/g, " "));
      }
    }
    title = title.replace(/ - Google 地圖/g, "").replace(/ - Google Maps/g, "").replace(/ – Google Maps/g, "").replace(/在 Google 地圖查看(.*)/g, "").replace(/的地圖內容/g, "").trim();
    if (title === "Google 地圖" || title === "Google Maps") {
      title = "";
    }
    return new Response(JSON.stringify({ title }), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("Error fetching title:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
