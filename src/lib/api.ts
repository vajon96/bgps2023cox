/**
 * Safe API client helpers for robust network calls and JSON decoding.
 * Prevents "unexpected character at line 1" JSON parse crashes and handles network hiccups.
 */

export async function safeFetchJson<T = any>(
  url: string,
  options?: RequestInit,
  retries = 1
): Promise<T> {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');

    if (!res.ok) {
      let errorMessage = `Request failed with status ${res.status}`;
      if (isJson) {
        try {
          const errorData = await res.json();
          if (errorData.error) errorMessage = errorData.error;
          else if (errorData.message) errorMessage = errorData.message;
        } catch {
          // Fallback to status message
        }
      } else {
        const text = await res.text().catch(() => '');
        if (text && text.length < 120 && !text.includes('<!DOCTYPE') && !text.includes('<html')) {
          errorMessage = text;
        }
      }
      throw new Error(errorMessage);
    }

    if (!isJson) {
      throw new Error('Expected JSON response from server');
    }

    try {
      return await res.json();
    } catch {
      throw new Error('Invalid JSON received from server');
    }
  } catch (err: any) {
    // If it's a network glitch or server restarting, retry once before failing
    if (
      retries > 0 &&
      (err?.name === 'TypeError' ||
        err?.message?.includes('fetch') ||
        err?.message?.includes('NetworkError') ||
        err?.message?.includes('Failed to fetch'))
    ) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      return safeFetchJson<T>(url, options, retries - 1);
    }
    throw err;
  }
}
