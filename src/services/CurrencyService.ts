import {ExchangeRate} from '../types';
import StorageService from './StorageService';

class CurrencyService {
  // Free exchange rate API endpoints (no API key required)
  private readonly API_URLS = [
    'https://api.exchangerate-api.com/v4/latest/EUR',
    'https://open.er-api.com/v6/latest/EUR',
  ];
  private cachedRate: ExchangeRate | null = null;
  private fetchPromise: Promise<number> | null = null;

  async fetchEURRate(): Promise<number> {
    // Return cached rate if it's less than 1 hour old
    if (this.cachedRate) {
      const hourInMs = 60 * 60 * 1000;
      if (Date.now() - this.cachedRate.timestamp < hourInMs) {
        return this.cachedRate.rate;
      }
    }

    // Debounce: if a fetch is already in progress, return that promise
    if (this.fetchPromise) {
      return this.fetchPromise;
    }

    this.fetchPromise = this._fetchFromAPI();

    try {
      const rate = await this.fetchPromise;
      return rate;
    } finally {
      this.fetchPromise = null;
    }
  }

  private async _fetchFromAPI(): Promise<number> {
    // Try multiple API endpoints
    for (const apiUrl of this.API_URLS) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

        const response = await fetch(apiUrl, {
          signal: controller.signal,
          headers: {
            Accept: 'application/json',
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          console.warn(`API ${apiUrl} returned status: ${response.status}`);
          continue; // Try next API
        }

        const data = await response.json();

        // Parse response - both APIs use { rates: { RSD: number } } format
        let rate: number | undefined;

        if (data.rates && typeof data.rates.RSD === 'number') {
          rate = data.rates.RSD;
        } else if (data.rates && typeof data.rates.RSD === 'string') {
          rate = parseFloat(data.rates.RSD);
        }

        if (rate && !isNaN(rate) && rate > 0) {
          // Cache the rate
          const exchangeRate: ExchangeRate = {
            rate,
            timestamp: Date.now(),
          };

          this.cachedRate = exchangeRate;
          await StorageService.saveExchangeRate(exchangeRate);

          console.log(`✓ Fetched live EUR/RSD rate: ${rate.toFixed(2)}`);
          return rate;
        } else {
          console.warn(`Invalid rate from ${apiUrl}:`, data);
        }
      } catch (error) {
        console.warn(`Error fetching from ${apiUrl}:`, error);
        // Continue to next API
      }
    }

    // All APIs failed, fallback to cached rate from storage
    console.warn('All API endpoints failed, trying cached rate');
    const storedRate = await StorageService.getExchangeRate();
    if (storedRate) {
      this.cachedRate = storedRate;
      console.log(`Using cached EUR rate: ${storedRate.rate}`);
      return storedRate.rate;
    }

    // Ultimate fallback (approximate current rate as of 2026)
    console.warn('Using fallback EUR rate: 117.5');
    return 117.5;
  }

  convertToEUR(rsdAmount: number, rate: number): number {
    return rsdAmount / rate;
  }

  convertToRSD(eurAmount: number, rate: number): number {
    return eurAmount * rate;
  }

  formatCurrency(amount: number, currency: 'RSD' | 'EUR'): string {
    const formatted = amount.toLocaleString('sr-RS', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return currency === 'RSD' ? `${formatted} RSD` : `€${formatted}`;
  }

  // Initialize cache on app start
  async initializeCache(): Promise<void> {
    const storedRate = await StorageService.getExchangeRate();
    if (storedRate) {
      this.cachedRate = storedRate;
    }

    // Fetch fresh rate in background
    this.fetchEURRate().catch(err =>
      console.error('Background rate fetch failed:', err),
    );
  }
}

export default new CurrencyService();
