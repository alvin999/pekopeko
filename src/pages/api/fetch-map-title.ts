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
      }
    });

    if (!response.ok) {
        return new Response(JSON.stringify({ error: 'Failed to fetch the URL' }), { status: 500 });
    }

    const html = await response.text();
    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    
    if (!titleMatch) {
      return new Response(JSON.stringify({ title: '' }), { status: 200 });
    }

    let title = titleMatch[1];
    // 清理 Google Maps 特有的後綴
    title = title.replace(/ - Google 地圖/g, '')
                 .replace(/ - Google Maps/g, '')
                 .replace(/ – Google Maps/g, '')
                 .replace(/在 Google 地圖查看(.*)/g, '')
                 .trim();

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
