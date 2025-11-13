"use server";

export async function fetchUrlContent(url: string, maxChars: number = 4000): Promise<string> {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Cadena-Server/1.0' } });
    if (!res.ok) {
      return `Failed to fetch URL ${url}: ${res.status} ${res.statusText}`;
    }
    const text = await res.text();
    return text.slice(0, maxChars);
  } catch (e: any) {
    return `Error fetching ${url}: ${e?.message || String(e)}`;
  }
}
