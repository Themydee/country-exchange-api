import Country from '../models/Country.js';
import CountryService from '../services/countryService.js';
import ImageService from '../services/imageService.js';
import { validateQueryParams } from '../utils/validators.js';
import {
  createNotFoundError,
  createValidationError,
  createServiceUnavailableError
} from '../middleware/errorHandler.js';

class CountryController {
  /**
   * POST /countries/refresh - Refresh country data from external APIs
   */
  static async refreshCountries(req, res, next) {
    try {
      console.log('🔄 Starting country data refresh...');

      // Fetch and store countries
      const result = await CountryService.refreshCountries();

      // Generate summary image
      await ImageService.generateSummaryImage();

      res.json({
        message: 'Countries data refreshed successfully',
        processed: result.processed,
        created: result.created,
        updated: result.updated
      });
    } catch (error) {
      // Check if it's an external API error
      if (error.message.includes('Failed to fetch') || error.message.includes('timed out')) {
        const apiName = error.message.includes('countries') ? 'Countries API' : 'Exchange Rates API';
        return next(createServiceUnavailableError(`Could not fetch data from ${apiName}`));
      }
      next(error);
    }
  }

  /**
   * GET /countries - Get all countries with optional filters
   */
  static async getAllCountries(req, res, next) {
    try {
      const { region, currency, sort } = req.query;

      // Validate query parameters
      const validation = validateQueryParams({ sort });
      if (!validation.isValid) {
        return next(createValidationError(validation.errors));
      }

      // Build filters
      const filters = {};
      if (region) filters.region = region;
      if (currency) filters.currency = currency;
      if (sort) filters.sort = sort;

      // Get countries
      const countries = await Country.findAll(filters);

      res.json(countries);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /countries/:name - Get single country by name
   */
  static async getCountryByName(req, res, next) {
    try {
      const { name } = req.params;

      const country = await Country.findByName(name);

      if (!country) {
        return next(createNotFoundError('Country'));
      }

      res.json(country);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /countries/:name - Delete a country
   */
  static async deleteCountry(req, res, next) {
    try {
      const { name } = req.params;

      const deleted = await Country.delete(name);

      if (!deleted) {
        return next(createNotFoundError('Country'));
      }

      res.json({
        message: 'Country deleted successfully',
        country: name
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /status - Get API status
   */
  static async getStatus(req, res, next) {
    try {
      const status = await CountryService.getStatus();
      res.json(status);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /countries/image - Serve summary image
   */
  static async getSummaryImage(req, res, next) {
    try {
      if (!ImageService.summaryImageExists()) {
        return res.status(404).json({
          error: 'Summary image not found'
        });
      }

      const imagePath = ImageService.getSummaryImagePath();
      res.sendFile(imagePath, { root: process.cwd() });
    } catch (error) {
      next(error);
    }
  }
}

export default CountryController;