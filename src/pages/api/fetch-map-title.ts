import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const targetUrl = url.searchParams.get('url');

  if (!targetUrl) {
    return new Response(JSON.stringify({ error: 'Missing URL parameter' }), { status: 400 });
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7'
      },
      redirect: 'follow'
    });

    if (!response.ok) {
        return new Response(JSON.stringify({ error: 'Failed to fetch the URL' }), { status: 500 });
    }

    const finalUrl = response.url;
    let title = '';

    // 嘗試從 HTML 標題獲取
    const html = await response.text();
    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    if (titleMatch) {
      title = titleMatch[1];
    }

    // 如果標題太短或是預設的 "Google 地圖"，則從 URL 解析
    if (!title || title.includes('Google 地圖') || title.includes('Google Maps')) {
      const placeMatch = finalUrl.match(/\/place\/(.*?)\//);
      if (placeMatch && placeMatch[1]) {
        // 解碼 URL 並替換 + 為空格
        title = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
      }
    }

    // 清理標題
    title = title.replace(/ - Google 地圖/g, '')
                 .replace(/ - Google Maps/g, '')
                 .replace(/ – Google Maps/g, '')
                 .replace(/在 Google 地圖查看(.*)/g, '')
                 .replace(/的地圖內容/g, '')
                 .trim();

    // 如果還是只有 Google 地圖，回傳空字串
    if (title === 'Google 地圖' || title === 'Google Maps') {
      title = '';
    }

    return new Response(JSON.stringify({ title }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error fetching title:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
};
