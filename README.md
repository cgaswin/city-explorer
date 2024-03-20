# City- Explorer

This project is a part of the assessment for the cognifyr backend internship.

This project is a backend service that provides an API to recommend an activity based on the weather conditions


## Installation

Clone the repo:

```bash
git clone https://github.com/cgaswin/city-explorer.git
cd city-explorer
```

Install the dependencies:

```bash
pnpm install
```
Build Project:
```bash
pnpm run build
```

Run the development server:

```bash
pnpm run dev
```
Set the environment variables:

```bash
cp .env.example .env
# open .env and modify the environment variables
```

## Environment Variables

The environment variables can be found and modified in the `.env` file.

```bash
# Port Number
PORT = # default 8000

# MongoDB Database URI
DB_URI =

# CORS origin
CORS_ORIGIN = # default *

# jwt secret
JWT_SECRET = # default any random string

#jwt expiry
JWT_EXPIRY= # default 3d

#cookie expiration time
COOKIE_TIME= #default 30

#Weather api key
WEATHER_API_KEY (get it from https://www.weatherapi.com/)
```

## API Endpoints

**API DOCS**:\
`GET /api-docs` 
 

**city-explorer Paper Routes**:\
`POST "/api/v1/register` - Register user \
`POST "/api/v1/login` - User login\
`POST "/api/v1/logout` - User logout\
`POST "/api/v1/recommendation` - Recommend an activity based on the weather conditions


## License

[MIT](LICENSE)



