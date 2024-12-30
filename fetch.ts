import { config } from "dotenv";
import { chromium } from "playwright-core";
import Browserbase from "@browserbasehq/sdk";

// Load environment variables from .env file
config();

const PROJECT_ID = process.env.BROWSERBASE_PROJECT_ID;
const API_KEY = process.env.BROWSERBASE_API_KEY;

if (!API_KEY) {
  throw new Error("BROWSERBASE_API_KEY is not set");
}

if (!PROJECT_ID) {
  throw new Error("BROWSERBASE_PROJECT_ID is not set");
}

const bb = new Browserbase({
  apiKey: API_KEY,
});

async function createSession() {
  try {
    const response = await fetch(`https://api.browserbase.com/v1/sessions`, {
      method: "POST",
      headers: {
        'x-bb-api-key': API_KEY as string,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        projectId: PROJECT_ID as string,
        browserSettings: {
          advancedStealth: true,
        },
        proxies: true,
      }),
    });
    const session = await response.json();
    return session;
  } catch (error) {
    console.error("Failed to create session:", error);
    throw error;
  }
}

export async function playwrightFetch(url: string) {
  const session = await createSession();
  console.log(`Session created, id: ${session.id}`);

  console.log("Starting remote browser...");
  const browser = await chromium.connectOverCDP(session.connectUrl);
  const defaultContext = browser.contexts()[0];
  const page = defaultContext.pages()[0];

  try {
    // Listen for console messages before navigation
    page.on('console', async msg => {
      if (msg.text() === 'browserbase-solving-finished') {
        console.log('Captcha was solved successfully!');
      }
      if (msg.text() === 'browserbase-solving-started') {
        console.log('Captcha solving started!');
      }
    });

    const response = await page.goto(url);
    let finalResponse = response;

    // Check if we hit a Cloudflare challenge
    if (response?.headers()['cf-mitigated'] === 'challenge' || response?.status() === 403) {
      console.log("Detected Cloudflare challenge, waiting for solution...");
      
      // Wait for the captcha solved message or timeout after 30 seconds
      try {
        await page.waitForEvent('console', {
          predicate: msg => msg.text() === 'browserbase-solving-finished',
          timeout: 30000
        });

        // After captcha is solved, get the new response
        finalResponse = await page.waitForResponse(resp => resp.url().includes(url), {
          timeout: 10000
        });
      } catch (error) {
        console.error("\x1b[31mTimeout waiting for captcha solution or redirect\x1b[0m");
        throw error;
      }
    }

    const content = await finalResponse?.text();

    return {
      content,
      status: finalResponse?.status(),
      headers: finalResponse?.headers(),
      sessionId: session.id
    };
  } finally {
    console.log("Shutting down...");
    await page.close();
    await browser.close();
    console.log(
      `Session complete! View replay at https://browserbase.com/sessions/${session.id}`
    );
  }
}
