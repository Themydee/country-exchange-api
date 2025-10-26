import axios from 'axios';

class ExchangeService {
  /**
   * Fetch exchange rates from external API
   */
  static async fetchExchangeRates() {
    try {
      const apiUrl = process.env.EXCHANGE_API || 'https://open.er-api.com/v6/latest/USD';
      
      const response = await axios.get(apiUrl, {
        timeout: 10000 // 10 seconds timeout
      });

      if (response.data && response.data.rates) {
        return response.data.rates;
      }

      throw new Error('Invalid exchange rates response');
    } catch (error) {
      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        throw new Error('Exchange rates API request timed out');
      }
      throw new Error(`Failed to fetch exchange rates: ${error.message}`);
    }
  }

  /**
   * Get exchange rate for a specific currency code
   */
  static getExchangeRate(rates, currencyCode) {
    if (!currencyCode || !rates) {
      return null;
    }

    const upperCaseCode = currencyCode.toUpperCase();
    return rates[upperCaseCode] || null;
  }
}

export default ExchangeService;