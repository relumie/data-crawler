import { PuppeteerCrawler, Dataset } from "crawlee";
import { router } from "./crawlee_router.js";

export default async () => {
  const crawler = new PuppeteerCrawler({
    requestHandler: router,
    maxRequestsPerMinute: 1,
    launchContext: {
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Safari/537.36",
      // userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
    },
  });
  
  await crawler.run(['https://github.com/topics/javascript']);
  await Dataset.exportToCSV('repositories');
};
