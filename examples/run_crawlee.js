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
      await page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Safari/537.36");

      // Get the title of the page just to test things.
      let title = await page.title();
      console.log(title);
      
      // ---- RECEIVER : Deeper requests ---- //
      if (request.label === 'repository') {
        console.log('Scraping:', request.url);
        let commit_count_selector = 'span.d-none.d-sm-inline > strong';
        await page.waitForSelector(commit_count_selector);
        let commit_text = await page.$eval(commit_count_selector, (el) => el.textContent);
        let number_strings = commit_text.match(/\d+/g);
        let commit_count = Number(number_strings.join(''));
        console.log(commit_count);

        await Dataset.pushData({
          ...request.userData,
          commit_count,
        });
        return;
      }

      await sleep(3000);

      await infiniteScroll({
        buttonSelector: 'text/Load more',
        stopScrollCallback: async () => {
          let repos =await page.$$('article.border');
          return repos.length >= REPO_COUNT;
        },
      });
     

      // ---- List ----
      let repos = await page.$$eval('article.border', (repo_cards) => {
        return repo_cards.map(card => {
          let [user, repo] = card.querySelectorAll('h3 a'); // ** TAGs SELECT
          let stars = card.querySelector('#repo-stars-counter-star') // ** ID SELECTOR **
                            .getAttribute('title'); // ** Attributes SELECTOR
          let description = card.querySelector('div.px-3 > p');
          let topics = card.querySelectorAll('a.topic-tag');
          let toText = (element) => element && element.innerText.trim(); // ** innerText = Text
          let parseNumber = (text) => Number(text.replace(/,/g, ''));
          
          return {
            user: toText(user),
            repo: toText(repo),
            url: repo.href, // ** href = Attribute
            stars: parseNumber(stars),
            description: toText(description),
            topics: Array.from(topics).map((t) => toText(t)),
          };
        });
      });

      console.log(`REPOSITORY-COUNT : ${repos.length}.`);
      // console.dir(repos);
      

      // ---- Deeper Requests ---- //
      let requests = repos.map(repo => new Request({
        // URL tells Crawlee which page to open
        url: repo.url,
        // labels are helpful for easy identification of requests
        label: 'repository',
        // userData allows us to store any JSON serializable data.
        // It will be kept together with the request and saved
        // persistently, so that no data is lost on errors.
        userData: repo,
      }));
          
      // Add the requests to the crawler's queue.
      // The crawler will automatically process them.
      await crawler.addRequests(requests);

      console.log(repos);

      await sleep(10000);
    },
  });


  
  // Here we start the crawler on the selected URLs.
  // Expected Result : javascript · GitHub Topics · GitHub
  await crawler.run(['http://www.whatismybrowser.com']);
  // await crawler.run(['https://github.com/topics/javascript']);
  await Dataset.exportToCSV('repositories');
};