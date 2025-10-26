import pool from '../config/database.js';

class Country {
  /**
   * Get all countries with optional filters and sorting
   */
  static async findAll(filters = {}) {
    let query = 'SELECT * FROM countries WHERE 1=1';
    const params = [];

    // Apply filters
    if (filters.region) {
      query += ' AND LOWER(region) = LOWER(?)';
      params.push(filters.region);
    }

    if (filters.currency) {
      query += ' AND LOWER(currency_code) = LOWER(?)';
      params.push(filters.currency);
    }

    // Apply sorting
    if (filters.sort) {
      switch (filters.sort.toLowerCase()) {
        case 'gdp_desc':
          query += ' ORDER BY estimated_gdp DESC';
          break;
        case 'gdp_asc':
          query += ' ORDER BY estimated_gdp ASC';
          break;
        case 'population_desc':
          query += ' ORDER BY population DESC';
          break;
        case 'population_asc':
          query += ' ORDER BY population ASC';
          break;
        case 'name_asc':
          query += ' ORDER BY name ASC';
          break;
        case 'name_desc':
          query += ' ORDER BY name DESC';
          break;
        default:
          query += ' ORDER BY id ASC';
      }
    } else {
      query += ' ORDER BY id ASC';
    }

    const [rows] = await pool.query(query, params);
    return rows;
  }

  /**
   * Find country by name (case-insensitive)
   */
  static async findByName(name) {
    const [rows] = await pool.query(
      'SELECT * FROM countries WHERE LOWER(name) = LOWER(?)',
      [name]
    );
    return rows[0];
  }

  /**
   * Create a new country
   */
  static async create(countryData) {
    const {
      name,
      capital,
      region,
      population,
      currency_code,
      exchange_rate,
      estimated_gdp,
      flag_url
    } = countryData;

    const [result] = await pool.query(
      `INSERT INTO countries 
       (name, capital, region, population, currency_code, exchange_rate, estimated_gdp, flag_url) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, capital, region, population, currency_code, exchange_rate, estimated_gdp, flag_url]
    );

    return result.insertId;
  }

  /**
   * Update existing country
   */
  static async update(name, countryData) {
    const {
      capital,
      region,
      population,
      currency_code,
      exchange_rate,
      estimated_gdp,
      flag_url
    } = countryData;

    const [result] = await pool.query(
      `UPDATE countries 
       SET capital = ?, region = ?, population = ?, currency_code = ?, 
           exchange_rate = ?, estimated_gdp = ?, flag_url = ?,
           last_refreshed_at = CURRENT_TIMESTAMP
       WHERE LOWER(name) = LOWER(?)`,
      [capital, region, population, currency_code, exchange_rate, estimated_gdp, flag_url, name]
    );

    return result.affectedRows > 0;
  }

  /**
   * Delete country by name
   */
  static async delete(name) {
    const [result] = await pool.query(
      'DELETE FROM countries WHERE LOWER(name) = LOWER(?)',
      [name]
    );
    return result.affectedRows > 0;
  }

  /**
   * Get total count of countries
   */
  static async count() {
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM countries');
    return rows[0].count;
  }

  /**
   * Get top N countries by estimated GDP
   */
  static async getTopByGDP(limit = 5) {
    const [rows] = await pool.query(
      'SELECT name, estimated_gdp FROM countries WHERE estimated_gdp IS NOT NULL ORDER BY estimated_gdp DESC LIMIT ?',
      [limit]
    );
    return rows;
  }

  /**
   * Update or insert (upsert) country
   */
  static async upsert(countryData) {
    const existing = await this.findByName(countryData.name);
    
    if (existing) {
      await this.update(countryData.name, countryData);
      return { action: 'updated', id: existing.id };
    } else {
      const id = await this.create(countryData);
      return { action: 'created', id };
    }
  }

  /**
   * Delete all countries
   */
  static async deleteAll() {
    await pool.query('DELETE FROM countries');
  }
}

export default Country;