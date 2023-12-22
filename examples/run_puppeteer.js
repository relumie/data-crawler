import puppeteer from "puppeteer";

export default async () => {
  //---- LIBRARIES ----//

  // Pause for {time_ms} seconds, to see what's going on.
  const delay = async (time_ms) => {
    await new Promise((res, rej) => setTimeout(res, time_ms));
  }

  /// xPath를 통한 링크 검색 후 클릭
  const escapeXpathString = str => {
    const splitedQuotes = str.replace(/'/g, `', "'", '`);
    return `concat('${splitedQuotes}', '')`;
  };
  const clickByText = async (page, text, makeXPath) => {
    let escaped_text = escapeXpathString(text);
    if (!makeXPath)
      makeXPath = (escaped_text) => `//span[text()[contains(., ${escaped_text})]]/parent::a`;
    let xpath = makeXPath(escaped_text);
    let elements = await page.$x(xpath);
    if(elements.length > 0) {
      for(var e of elements ) {
        if(await e.isIntersectingViewport()) {
          await e.click();
          return;
        }
      }
    } else {
      console.log(xpath);
    }
    throw new Error(`Link not found: ${text}`);
  };




  //---- EXECUTE ----//

  // Open the installed Chromium. We use headless: false
  // to be able to inspect the browser window.
  const browser = await puppeteer.launch({
    headless: "new", // false : 브라우저 실제 실행
  });
  await browser.userAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Safari/537.36")

  // Open a new page / tab in the browser.
  const page = await browser.newPage();

  // Tell the tab to navigate to the JavaScript-Topic page.
  await page.goto('https://github.com/topics/javascript');
  await page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Safari/537.36")

  // Pause for 5 seconds, to see what's going on.
  await delay(5000);


  // ---- Way 1 to click a Link ---- //
  // const link_wikipedia = await page.evaluateHandle(
  //   text => [...document.querySelectorAll('a')].find(a => a.innerText == text),
  //   'Wikipedia',
  // );
  // await link_wikipedia.click();

  // ---- Way 2 to click a Link ---- //
  // await clickByText(page, 'Wikipedia');



  // Click 'Load more' Button.
  const button_selector = 'text/Load more';
  await page.waitForSelector(button_selector);
  await page.click(button_selector);

  // Wait until displays 20 items 
  await page.waitForFunction(() => {
    const repo_cards = document.querySelectorAll('article.border');
    // GitHub displays 20 repositories per page.
    // We wait until there's more than 20.
    return repo_cards.length > 20;
  });


  // ---- List ----
  const repos = await page.$$eval('article.border', (repo_cards) => {
    return repo_cards.map(card => {
      const [user, repo] = card.querySelectorAll('h3 a'); // ** TAGs SELECT
      const stars = card.querySelector('#repo-stars-counter-star') // ** ID SELECTOR **
                        .getAttribute('title'); // ** Attributes SELECTOR
      const description = card.querySelector('div.px-3 > p');
      const topics = card.querySelectorAll('a.topic-tag');
      const toText = (element) => element && element.innerText.trim(); // ** innerText = Text
      const parseNumber = (text) => Number(text.replace(/,/g, ''));
      
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

  // Print the results !!!
  console.log(`We extracted ${repos.length} repositories.`);
  console.dir(repos);


  await delay(10000);

  // Turn off the browser to clean up after ourselves.
  await browser.close();
};


