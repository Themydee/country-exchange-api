import axios from 'axios';
import Country from '../models/Country.js';
import ExchangeService from './exchangeService.js';
import pool from '../config/database.js';

class CountryService {
  /**
   * Fetch countries from external API
   */
  static async fetchCountriesData() {
    try {
      const apiUrl = process.env.COUNTRIES_API || 
        'https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies';
      
      const response = await axios.get(apiUrl, {
        timeout: 15000 // 15 seconds timeout
      });

      return response.data;
    } catch (error) {
      if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        throw new Error('Countries API request timed out');
      }
      throw new Error(`Failed to fetch countries data: ${error.message}`);
    }
  }

  /**
   * Calculate estimated GDP
   */
  static calculateEstimatedGDP(population, exchangeRate) {
    if (!population || !exchangeRate || exchangeRate === 0) {
      return null;
    }

    // Generate random multiplier between 1000 and 2000
    const randomMultiplier = Math.random() * (2000 - 1000) + 1000;
    
    // Formula: population × random(1000–2000) ÷ exchange_rate
    const estimatedGDP = (population * randomMultiplier) / exchangeRate;
    
    return parseFloat(estimatedGDP.toFixed(2));
  }

  /**
   * Extract first currency code from country data
   */
  static extractCurrencyCode(country) {
    if (!country.currencies || !Array.isArray(country.currencies) || country.currencies.length === 0) {
      return null;
    }

    const firstCurrency = country.currencies[0];
    return firstCurrency.code || null;
  }

  /**
   * Process and store country data
   */
  static async refreshCountries() {
    try {
      // Fetch data from both external APIs
      const [countriesData, exchangeRates] = await Promise.all([
        this.fetchCountriesData(),
        ExchangeService.fetchExchangeRates()
      ]);

      console.log(`📥 Fetched ${countriesData.length} countries`);

      let processedCount = 0;
      let updatedCount = 0;
      let createdCount = 0;

      // Process each country
      for (const countryRaw of countriesData) {
        try {
          // Extract currency code
          const currencyCode = this.extractCurrencyCode(countryRaw);
          
          // Get exchange rate if currency exists
          let exchangeRate = null;
          let estimatedGDP = null;

          if (currencyCode) {
            exchangeRate = ExchangeService.getExchangeRate(exchangeRates, currencyCode);
            
            if (exchangeRate) {
              estimatedGDP = this.calculateEstimatedGDP(countryRaw.population, exchangeRate);
            }
          } else {
            // No currency, set GDP to 0 as per requirements
            estimatedGDP = 0;
          }

          // Prepare country data
          const countryData = {
            name: countryRaw.name,
            capital: countryRaw.capital || null,
            region: countryRaw.region || null,
            population: countryRaw.population,
            currency_code: currencyCode,
            exchange_rate: exchangeRate,
            estimated_gdp: estimatedGDP,
            flag_url: countryRaw.flag || null
          };

          // Upsert country
          const result = await Country.upsert(countryData);
          
          if (result.action === 'updated') {
            updatedCount++;
          } else {
            createdCount++;
          }
          
          processedCount++;
        } catch (error) {
          console.error(`Error processing country ${countryRaw.name}:`, error.message);
          // Continue with next country
        }
      }

      // Update last_refreshed_at timestamp
      await this.updateLastRefreshedAt();

      console.log(`✅ Processed ${processedCount} countries (${createdCount} created, ${updatedCount} updated)`);

      return {
        processed: processedCount,
        created: createdCount,
        updated: updatedCount
      };
    } catch (error) {
      console.error('Error refreshing countries:', error.message);
      throw error;
    }
  }

  /**
   * Update last refreshed timestamp
   */
  static async updateLastRefreshedAt() {
    const now = new Date().toISOString();
    await pool.query(
      `UPDATE api_metadata SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key_name = 'last_refreshed_at'`,
      [now]
    );
  }

  /**
   * Get last refreshed timestamp
   */
  static async getLastRefreshedAt() {
    const [rows] = await pool.query(
      `SELECT value FROM api_metadata WHERE key_name = 'last_refreshed_at'`
    );
    
    return rows[0]?.value || null;
  }

  /**
   * Get API status
   */
  static async getStatus() {
    const totalCountries = await Country.count();
    const lastRefreshedAt = await this.getLastRefreshedAt();

    return {
      total_countries: totalCountries,
      last_refreshed_at: lastRefreshedAt
    };
  }
}

export default CountryService;