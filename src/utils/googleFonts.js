// Google Fonts Developer API integration.
// Requires VITE_GOOGLE_FONTS_API_KEY (see .env.example) — falls back to null
// (caller should use a curated static list) when no key is configured.

const FONT_LIST_CACHE_KEY = "google_fonts_list_cache_v1";
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function fetchGoogleFontFamilies() {
  try {
    const cached = localStorage.getItem(FONT_LIST_CACHE_KEY);
    if (cached) {
      const { timestamp, fonts } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TTL_MS && Array.isArray(fonts) && fonts.length > 0) {
        return fonts;
      }
    }
  } catch {
    // Corrupt cache entry — ignore and refetch.
  }

  try {
    const res = await fetch("/api/fonts");
    if (!res.ok) {
      throw new Error(`Backend Fonts API request failed: ${res.status}`);
    }
    const data = await res.json();
    
    // Check if the backend returned an error directly
    if (data.error) {
       console.error("Backend returned error:", data.error);
       return null;
    }

    const fonts = (data.items || []).map((item) => ({
      family: item.family,
      category: item.category,
      variants: item.variants,
    }));

    try {
      localStorage.setItem(FONT_LIST_CACHE_KEY, JSON.stringify({ timestamp: Date.now(), fonts }));
    } catch {
      // Storage full/unavailable — non-fatal, just skip caching.
    }

    return fonts;
  } catch (err) {
    console.error("Failed to fetch fonts from backend:", err);
    return null;
  }
}

// Fonts already loaded statically in index.html — no need to re-fetch these.
const PRELOADED_FONTS = new Set([
  "Inter", "Roboto", "Outfit", "Poppins", "Montserrat",
  "Playfair Display", "Lora", "Caveat", "Fira Mono",
]);

const dynamicallyLoadedFonts = new Set(PRELOADED_FONTS);

// Injects a <link> for the given font-family value (e.g. "'Fira Mono', monospace")
// so it actually renders wherever it's used, not just in fonts already in index.html.
export function ensureFontLoaded(fontFamily) {
  if (!fontFamily) return;
  const primary = fontFamily.split(",")[0].trim().replace(/^['"]|['"]$/g, "");
  if (!primary || dynamicallyLoadedFonts.has(primary)) return;

  const href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(primary).replace(/%20/g, "+")}:wght@300;400;500;600;700;800&display=swap`;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
  dynamicallyLoadedFonts.add(primary);
}
