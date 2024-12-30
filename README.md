## browser-fetch

This example demonstrates how to use Playwright with Browserbase to create a robust fetch function that can handle Cloudflare and other anti-bot protections.

## Features

- Automated Cloudflare bypass
- Stealth mode enabled by default
- Automatic proxy rotation
- Handles captcha solving automatically
- Returns response content, status, and headers

## Setup

### 1. Install dependencies:

```bash
npm install
```

### 2. Set up your environment variables:

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` and add your Browserbase credentials:
- `BROWSERBASE_PROJECT_ID`: Your Browserbase project ID
- `BROWSERBASE_API_KEY`: Your Browserbase API key

You can find these credentials in your [Browserbase Settings](https://www.browserbase.com/settings).

### 3. Run the example:

```bash
npm run start
```

## Usage

The example provides a `playwrightFetch` function that can be used to fetch web pages:

```typescript
import { playwrightFetch } from "./fetch.js";

const response = await playwrightFetch("https://example.com");
console.log("Status:", response.status);
console.log("Headers:", response.headers);
console.log("Content length:", response.content?.length);
```

The function automatically:
- Detects Cloudflare challenges
- Waits for captcha solving when needed
- Returns the final response after any protection is bypassed

## Further reading

- [Session Debugger for development](https://docs.browserbase.com/guides/browser-remote-control#accelerate-your-local-development-with-remote-debugging)
- [Browserbase infrastructure](https://docs.browserbase.com/under-the-hood)
- [Sessions API documentation](https://docs.browserbase.com/api-reference/list-all-sessions)