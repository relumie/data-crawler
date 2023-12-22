import { createPuppeteerRouter, Dataset, Request } from "crawlee";

// We create a Puppeteer specific router to
// get intellisense and typechecks for our IDE.
export const router = createPuppeteerRouter();

const REPO_COUNT = 20;

router.use(async ({ page }) => {
  // This is for middlewares - functions that will be
  // executed on all routes, irrespective of label.
  
  // Get the title of the page just to test things.
  let title = await page.title();
  console.log(title);
});

router.addHandler('repository', async ({ page, request }) => {
  // This handler will execute for all requests
  // with the 'repository' label.
  
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
});

router.addDefaultHandler(async ({ page, infiniteScroll, crawler }) => {
  // This handler will execute for requests
  // that don't have a label.

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
});