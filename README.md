# Puppeteer Spammer

![](https://img.shields.io/badge/Typescript-v5.9.2-darkblue)
![](https://img.shields.io/badge/Fastify-v5.5.0-blue)
![](https://img.shields.io/badge/Puppeteer-v24.16.2-red)

A high-performance automation tool built with Puppeteer and Fastify for automated Facebook content publishing. This project is currently in development phase. 

> ⚠️ **Important Notice**: Facebook has sophisticated bot detection systems. Use with extreme caution and at your own risk. Facebook banned my test account for excessive posting hahaha... sad :'(

## Features

- Automated Facebook post creation and management
- Redis-backed session persistence
- RESTful API with Swagger documentation

## Project Structure

```
server/
├── src/
│   ├── routes/         # API endpoint definitions
│   ├── services/       # Core functionality
│   │   ├── facebook/   # Facebook automation logic
│   │   └── store/      # Data persistence layer
│   └── utils/          # Helper functions
```

## Quick Start

> First navigate to `./server` folder

1. **Install dependencies**

   ```bash
   pnpm install
   ```

2. **Environment setup**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your credentials:

   - Facebook account credentials
   - Redis database connection details

3. **Start development server**

   ```bash
   pnpm dev
   ```

4. **Access API documentation**
   Navigate to `/docs` in your browser for Swagger UI to explore available endpoints an test then.

## Technical Stack

- **Puppeteer**: Browser automation
- **Fastify**: High-performance web framework
- **Redis**: Session storage and caching
- **TypeScript**: Type-safe development
- **Swagger**: API documentation

## Disclaimer

This tool is intended for educational purposes only. Facebook's Terms of Service prohibit automated posting, and misuse may result in account restrictions or permanent bans. The developers are not responsible for any consequences resulting from the use of this software.

## Development Status

⚠️ **Alpha Version** - This project is under active development. Features may change without notice and stability is not guaranteed.
