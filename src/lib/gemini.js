import { GoogleGenAI } from '@google/genai';

// Initialize the Gemini client
export const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

/**
 * Executes a Gemini API call with exponential backoff and jitter for transient errors (503 High Demand, 429 Rate Limit, network errors).
 * @param {Function} apiCall - Async function that calls Gemini API
 * @param {Object} options
 * @param {number} [options.maxRetries=3] - Maximum number of retries
 * @param {number} [options.initialDelayMs=1500] - Initial delay in ms
 * @param {number} [options.backoffFactor=2] - Exponential multiplier
 * @returns {Promise<any>}
 */
export async function callGeminiWithRetry(apiCall, { maxRetries = 3, initialDelayMs = 1500, backoffFactor = 2 } = {}) {
  let attempt = 0;
  let delay = initialDelayMs;

  while (true) {
    try {
      return await apiCall();
    } catch (error) {
      attempt++;

      const errorMessage = error?.message || "";
      const status = error?.status || error?.code || (error?.error && (error.error.code || error.error.status));

      // Identify transient upstream capacity / rate / network errors
      const isTransient =
        status === 503 ||
        status === "UNAVAILABLE" ||
        status === 429 ||
        status === "RESOURCE_EXHAUSTED" ||
        errorMessage.includes("503") ||
        errorMessage.includes("high demand") ||
        errorMessage.includes("UNAVAILABLE") ||
        errorMessage.includes("rate limit") ||
        errorMessage.includes("Resource has been exhausted") ||
        errorMessage.includes("fetch failed");

      if (!isTransient || attempt > maxRetries) {
        throw error;
      }

      // Add random jitter (0-500ms) to prevent thundering herd spikes
      const jitter = Math.floor(Math.random() * 500);
      const totalWait = delay + jitter;
      console.warn(
        `[Gemini Retry] Attempt ${attempt}/${maxRetries} encountered transient error (${errorMessage.slice(0, 80)}...). Retrying in ${totalWait}ms...`
      );

      await new Promise((resolve) => setTimeout(resolve, totalWait));
      delay *= backoffFactor;
    }
  }
}