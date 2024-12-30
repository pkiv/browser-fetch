import { playwrightFetch } from "./fetch.js";

async function main() {
  try {
    // Example: fetch a website that might block regular requests
    const response = await playwrightFetch("https://www.firestormviewer.org/");
    
    console.log("Status:", response.status);
    console.log("Headers:", response.headers);
    console.log("Content length:", response.content?.length);
    
  } catch (error) {
    console.error("Error fetching page:", error);
  }
}

main();
