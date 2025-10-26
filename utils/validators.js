/**
 * Validate country data
 */
function validateCountryData(data) {
  const errors = {};

  // Name validation
  if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
    errors.name = 'is required and must be a valid string';
  }

  // Population validation
  if (!data.population && data.population !== 0) {
    errors.population = 'is required';
  } else if (typeof data.population !== 'number' || data.population < 0) {
    errors.population = 'must be a positive number';
  }

  // Currency code validation (optional but must be valid if provided)
  if (data.currency_code !== null && data.currency_code !== undefined) {
    if (typeof data.currency_code !== 'string' || data.currency_code.trim() === '') {
      errors.currency_code = 'must be a valid string if provided';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate query parameters
 */
function validateQueryParams(query) {
  const validSortOptions = [
    'gdp_desc', 'gdp_asc',
    'population_desc', 'population_asc',
    'name_asc', 'name_desc'
  ];

  const errors = {};

  if (query.sort && !validSortOptions.includes(query.sort.toLowerCase())) {
    errors.sort = `must be one of: ${validSortOptions.join(', ')}`;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
export { validateCountryData, validateQueryParams };