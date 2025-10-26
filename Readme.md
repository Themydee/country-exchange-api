# Country Currency & Exchange API

A RESTful API that fetches country data from external APIs, stores it in a MySQL database, and provides CRUD operations with currency exchange rates.

## 🚀 Features

- Fetch country data from REST Countries API
- Fetch real-time exchange rates from Exchange Rate API
- Calculate estimated GDP based on population and exchange rates
- Full CRUD operations for country data
- Filter countries by region and currency
- Sort countries by GDP, population, or name
- Generate summary images with top countries
- Automatic data refresh and caching
- Comprehensive error handling

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher)
- **MySQL** (v5.7 or higher)
- **npm** or **yarn**

## 🔧 Installation

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd country-currency-api
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up MySQL Database

Create a MySQL database:

```sql
CREATE DATABASE country_currency_db;
```

### 4. Configure environment variables

Copy the `.env.example` file to `.env`:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=country_currency_db
DB_PORT=3306

# External APIs
COUNTRIES_API=https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies
EXCHANGE_API=https://open.er-api.com/v6/latest/USD

# Cache Directory
CACHE_DIR=./cache
```

### 5. Initialize the database

The database tables will be created automatically when you start the server for the first time.

### 6. Start the server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:3000`

## 📡 API Endpoints

### 1. Refresh Country Data

Fetch all countries and exchange rates, then cache them in the database.

```http
POST /countries/refresh
```

**Response:**
```json
{
  "message": "Countries data refreshed successfully",
  "processed": 250,
  "created": 200,
  "updated": 50
}
```

### 2. Get All Countries

Get all countries with optional filters and sorting.

```http
GET /countries
GET /countries?region=Africa
GET /countries?currency=NGN
GET /countries?sort=gdp_desc
GET /countries?region=Africa&sort=population_desc
```

**Query Parameters:**
- `region` - Filter by region (e.g., Africa, Europe, Asia)
- `currency` - Filter by currency code (e.g., NGN, USD, EUR)
- `sort` - Sort results:
  - `gdp_desc` - Highest GDP first
  - `gdp_asc` - Lowest GDP first
  - `population_desc` - Highest population first
  - `population_asc` - Lowest population first
  - `name_asc` - A-Z
  - `name_desc` - Z-A

**Response:**
```json
[
  {
    "id": 1,
    "name": "Nigeria",
    "capital": "Abuja",
    "region": "Africa",
    "population": 206139589,
    "currency_code": "NGN",
    "exchange_rate": 1600.23,
    "estimated_gdp": 25767448125.2,
    "flag_url": "https://flagcdn.com/ng.svg",
    "last_refreshed_at": "2025-10-22T18:00:00Z"
  }
]
```

### 3. Get Single Country

Get a specific country by name.

```http
GET /countries/:name
```

**Example:**
```http
GET /countries/Nigeria
```

**Response:**
```json
{
  "id": 1,
  "name": "Nigeria",
  "capital": "Abuja",
  "region": "Africa",
  "population": 206139589,
  "currency_code": "NGN",
  "exchange_rate": 1600.23,
  "estimated_gdp": 25767448125.2,
  "flag_url": "https://flagcdn.com/ng.svg",
  "last_refreshed_at": "2025-10-22T18:00:00Z"
}
```

### 4. Delete Country

Delete a country record from the database.

```http
DELETE /countries/:name
```

**Example:**
```http
DELETE /countries/Nigeria
```

**Response:**
```json
{
  "message": "Country deleted successfully",
  "country": "Nigeria"
}
```

### 5. Get API Status

Get the total number of countries and last refresh timestamp.

```http
GET /status
```

**Response:**
```json
{
  "total_countries": 250,
  "last_refreshed_at": "2025-10-22T18:00:00Z"
}
```

### 6. Get Summary Image

Get a generated image with country statistics.

```http
GET /countries/image
```

Returns a PNG image showing:
- Total number of countries
- Top 5 countries by estimated GDP
- Last refresh timestamp

## 🔒 Error Handling

The API returns consistent JSON error responses:

### 400 Bad Request
```json
{
  "error": "Validation failed",
  "details": {
    "sort": "must be one of: gdp_desc, gdp_asc, population_desc, population_asc, name_asc, name_desc"
  }
}
```

### 404 Not Found
```json
{
  "error": "Country not found"
}
```

### 503 Service Unavailable
```json
{
  "error": "External data source unavailable",
  "details": "Could not fetch data from Countries API"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

## 🗄️ Database Schema

### Countries Table

```sql
CREATE TABLE countries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  capital VARCHAR(255),
  region VARCHAR(100),
  population BIGINT NOT NULL,
  currency_code VARCHAR(10),
  exchange_rate DECIMAL(20, 6),
  estimated_gdp DECIMAL(30, 2),
  flag_url TEXT,
  last_refreshed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_name (name),
  INDEX idx_region (region),
  INDEX idx_currency (currency_code)
);
```

### API Metadata Table

```sql
CREATE TABLE api_metadata (
  id INT AUTO_INCREMENT PRIMARY KEY,
  key_name VARCHAR(100) NOT NULL UNIQUE,
  value TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## 📦 Dependencies

### Production Dependencies
- **express** - Web framework
- **mysql2** - MySQL client
- **axios** - HTTP client for external APIs
- **dotenv** - Environment variable management
- **cors** - CORS middleware
- **canvas** - Image generation

### Development Dependencies
- **nodemon** - Auto-reload during development

## 🧪 Testing the API

### Using cURL

**Refresh countries:**
```bash
curl -X POST http://localhost:3000/countries/refresh
```

**Get all countries:**
```bash
curl http://localhost:3000/countries
```

**Get countries by region:**
```bash
curl http://localhost:3000/countries?region=Africa
```

**Get single country:**
```bash
curl http://localhost:3000/countries/Nigeria
```

**Delete country:**
```bash
curl -X DELETE http://localhost:3000/countries/Nigeria
```

**Get status:**
```bash
curl http://localhost:3000/status
```

**Get summary image:**
```bash
curl http://localhost:3000/countries/image --output summary.png
```

### Using Postman

1. Import the endpoints into Postman
2. Set the base URL to `http://localhost:3000`
3. Test each endpoint with different parameters

## 🚀 Deployment

### Deploy to Railway

1. Create account on [Railway](https://railway.app)
2. Create new project from GitHub
3. Add MySQL database
4. Set environment variables
5. Deploy

### Deploy to Heroku

1. Create Heroku account
2. Install Heroku CLI
3. Login and create app:
```bash
heroku login
heroku create your-app-name
```

4. Add ClearDB MySQL addon:
```bash
heroku addons:create cleardb:ignite
```

5. Set environment variables:
```bash
heroku config:set NODE_ENV=production
```

6. Deploy:
```bash
git push heroku main
```

### Deploy to AWS

1. Set up EC2 instance
2. Install Node.js and MySQL
3. Clone repository
4. Configure environment variables
5. Use PM2 for process management
6. Set up nginx as reverse proxy

## 📝 Project Structure

```
country-currency-api/
├── src/
│   ├── config/
│   │   └── database.js          # Database configuration
│   ├── controllers/
│   │   └── countryController.js # Request handlers
│   ├── models/
│   │   └── Country.js           # Database model
│   ├── routes/
│   │   └── countryRoutes.js     # API routes
│   ├── services/
│   │   ├── countryService.js    # Business logic
│   │   ├── exchangeService.js   # Exchange rate service
│   │   └── imageService.js      # Image generation
│   ├── middleware/
│   │   └── errorHandler.js      # Error handling
│   └── utils/
│       └── validators.js        # Input validation
├── cache/
│   └── summary.png              # Generated images
├── .env                         # Environment variables
├── .gitignore
├── package.json
├── server.js                    # Main entry point
└── README.md
```

## 🔍 How It Works

1. **Data Refresh Process:**
   - Fetch countries from REST Countries API
   - Fetch exchange rates from Exchange Rate API
   - Match currencies with exchange rates
   - Calculate estimated GDP
   - Store or update in database
   - Generate summary image

2. **GDP Calculation:**
   ```
   estimated_gdp = (population × random(1000-2000)) ÷ exchange_rate
   ```

3. **Currency Handling:**
   - If multiple currencies: use first one
   - If no currency: set to null, GDP to 0
   - If currency not in exchange rates: set rate and GDP to null

## 🐛 Troubleshooting

### Database Connection Error
- Check MySQL is running
- Verify database credentials in `.env`
- Ensure database exists

### External API Errors
- Check internet connection
- Verify API URLs are accessible
- APIs may have rate limits

### Image Generation Issues
- Ensure `cache` directory exists
- Check write permissions
- Verify `canvas` package is installed correctly

## 📄 License

This project is part of a backend development task.

## 👨‍💻 Author

Your Name - [your-email@example.com]

## 🙏 Acknowledgments

- REST Countries API
- Open Exchange Rates API

---

**Built with ❤️ using Node.js, Express, and MySQL**