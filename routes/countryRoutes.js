import express from 'express';
import CountryController from '../controllers/countryController.js';

const router = express.Router();

router.post('/countries/refresh', CountryController.refreshCountries);

router.get('/countries/image', CountryController.getSummaryImage);

router.get('/countries/:name', CountryController.getCountryByName);

router.get('/countries', CountryController.getAllCountries);

router.delete('/countries/:name', CountryController.deleteCountry);

router.get('/status', CountryController.getStatus);

export default router;