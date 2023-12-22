// Crawlee works with other libraries like Playwright
// or Cheerio as well. Now we want to work with Puppeteer.
import { PuppeteerCrawler, Request, Dataset, sleep } from "crawlee";

// Constants
const REPO_COUNT = 20;



export default async () => {
  // PuppeteerCrawler manages browsers and browser tabs.
  // You don't have to manually open and close them.
  // It also handles navigation (goto), errors and retries.
  const crawler = new PuppeteerCrawler({
    // headless: false, // false - show the browser

    // Request handler gives you access to the currently
    // open page. Similar to the pure Puppeteer examples
    // above, we can use it to control the browser's page.
    maxRequestsPerMinute: 1,
    launchContext: {
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Safari/537.36",
      // userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
    },
    requestHandler: async ({ request, page, infiniteScroll }) => {

      // Get the title of the page just to test things.
      let title = await page.title();
      console.log(title);

      let xpath = `//a[@title="Your User Agent"]`;
      await page.waitForXPath(xpath);
      let elements = await page.$x(xpath);
      if (elements.length > 0) {
        let ua = await page.evaluate(el => el.innerText, elements[0]);
        console.log(ua);
        await sleep(10000);
      } else {
        console.log('Cannot find')
      }

      await sleep(100000);
    },
  });


  
  // Here we start the crawler on the selected URLs.
  // Expected Result : javascript · GitHub Topics · GitHub
  await crawler.run(['http://www.whatismybrowser.com']);
  // await crawler.run(['https://github.com/topics/javascript']);
  await Dataset.exportToCSV('repositories');
};