import fs from 'fs';
import { platform } from 'os';
import puppeteer from "puppeteer";
import { makeUserAgent } from '../../utils/util_randomizer.js';

export default async () => {
  // SET VARIABLES
  var site_title = '무신사';
  var category = '키즈'
  var current_page_number = 1;
  var last_page_number = 100;


  // Pause for {time_ms} seconds, to see what's going on.
  const delay = async (time_ms) => {
    await new Promise((res, rej) => setTimeout(res, time_ms));
  }


  /// xPath를 통한 링크 검색 후 클릭
  const escapeXpathString = str => {
    let splitedQuotes = str.replace(/'/g, `', "'", '`);
    return `concat('${splitedQuotes}', '')`;
  };
  const clickByText = async (page, text, makeXPath) => {
    let escaped_text = escapeXpathString(text);
    if (!makeXPath)
      makeXPath = (escaped_text) => `//span[text()[contains(., ${escaped_text})]]/parent::a`;
    let xpath = makeXPath(escaped_text);
    let elements = await page.$x(xpath);
    if(elements.length > 0) {
      for(let e of elements ) {
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


  async function _getAttributeFromXPathElement (xpath_element, attribute) {
    let result = await page.evaluate((el, attribute) => {
      return el.getAttribute(attribute);
    }, xpath_element, attribute);
    return result;
  }


  const toNextPage = async () => {
    // End if this is last page
    if (current_page_number == last_page_number) {
      console.log('END OF PAGE. GOOD JOB.');
      return;
    }
    
    // Get last_page
    let pagination_classes = await page.$x(`//div[@class='pagination']`);
    last_page_number = Number(await _getAttributeFromXPathElement(pagination_classes[0], 'data-total-page'));

    // Click next page
    let page_button_classes  = await page.$x(`//div[@class='pagination']/div[@class="wrapper"]/a`)
    page_button_classes.shift();
    
    if (page_button_classes.length > 0) {    
      for(let elm of page_button_classes) {
        let target_page_number = Number(await _getAttributeFromXPathElement(elm, 'value'));
        if (target_page_number == current_page_number + 1) {
          current_page_number = target_page_number;
          await elm.click();
          await delay(5000); // WAIT LOAD
          
          /* 화면에 보일 경우에만 클릭인 듯. 필요할 때 대비해서 살려둠 */
          // if(await elm.isIntersectingViewport()) {
          // }
          
          return;
        }
      }
    } else {
      // console.log(xpath);
    }
    throw new Error(`Uncaughted ERROR`);
  }


  const toText = (element) => element && element.innerText.trim();
  const parseNumber = (text) => Number(text.replace(/,/g, ''));


  const scrapStores = async () => {
    let output = [];
    let xpath_elements = await page.$x(`//ul[@class='brand_contents_kr']/li`);
    for (let xpath_element of xpath_elements) {
      let store_name_object = await page.evaluate((element, site_title, category) => {
        const toText = (element) => element && element.innerText.trim();
        let name_kor = element.querySelector('dl > dt > a');
        let name_eng = element.querySelector('dl > dd > a');
        name_kor = toText(name_kor);
        name_eng = toText(name_eng);
        if (name_eng) {
          // remove the number of products
          let splited_name_eng = name_eng.split(' \(');
          splited_name_eng.pop();
          name_eng = splited_name_eng.join(' \(');
        }
  
        return {
          'platform': site_title,
          'category': category,
          'name_kor': name_kor,
          'name_eng': name_eng,
        };
      }, xpath_element, site_title, category);
      output.push(store_name_object);
    }
    return output;
    // for (let elm of store_card_elements) {
    //   let name_kor = elm.querySelector('dl > dt > a');
    //   let name_eng = elm.querySelector('dl > dd > a');
    //   console.log(toText(name_kor));
    //   console.log(toText(name_eng));
    // }

    // const stores = await page.$$eval('article.border', (repo_cards) => {
    //   return repo_cards.map(card => {
    //     const [user, repo] = card.querySelectorAll('h3 a'); // ** TAGs SELECT
    //     const stars = card.querySelector('#repo-stars-counter-star') // ** ID SELECTOR **
    //                       .getAttribute('title'); // ** Attributes SELECTOR
    //     const description = card.querySelector('div.px-3 > p');
    //     const topics = card.querySelectorAll('a.topic-tag');
    //     const toText = (element) => element && element.innerText.trim(); // ** innerText = Text
    //     const parseNumber = (text) => Number(text.replace(/,/g, ''));
        
    //     return {
    //       user: toText(user),
    //       repo: toText(repo),
    //       url: repo.href, // ** href = Attribute
    //       stars: parseNumber(stars),
    //       description: toText(description),
    //       topics: Array.from(topics).map((t) => toText(t)),
    //     };
    //   });
    // });
    // console.log(stores);
  }


  const updateJSONFile = async (store_objects) => {
    return new Promise((resolve, reject) => {
      fs.readFile('./src/crawlers/test/output/musinsa.json', 'utf8', function readFileCallback (err, data) {
        if (err) {
          reject(err);
        } else {
          let file_object = JSON.parse(data);
          for (let store_object of store_objects)
          file_object['payload'].push(store_object); //add some data
          let stores_json = JSON.stringify(file_object); //convert it back to json
          fs.writeFile('./src/crawlers/test/output/musinsa.json', stores_json, 'utf8', () => {
            resolve('Wrote');
          });
        }
      });
    });
  }







  //---- EXECUTE ----//

  const userAgent = makeUserAgent();

  // Open the installed Chromium. We use headless: false
  // to be able to inspect the browser window.
  const browser = await puppeteer.launch({
    // headless: "new", // false : 브라우저 실제 실행
    headless: false, // false : 브라우저 실제 실행
  });
  await browser.userAgent(userAgent)

  // Open a new page / tab in the browser.
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720});
  await page.setExtraHTTPHeaders({
    'Accept-Charset': 'utf-8',
    'Content-Type': 'text/html; charset=utf-8',
  })
  
  // Tell the tab to navigate to the JavaScript-Topic page.
  await page.goto(`https://www.musinsa.com/brands?categoryCode=007&type=&sortCode=BRAND_KOR&page=2&size=100`);

  // ** LOCAL TEST
  // var contentHtml = fs.readFileSync('./src/crawlers/test/test.html', 'utf8');
  // await page.setContent(contentHtml);
  
  await page.setUserAgent(userAgent)


  // Pause for 5 seconds, to see what's going on.
  await delay(5000);
  
  let stores = await scrapStores();
  await updateJSONFile(stores);
  // await toNextPage();


  // ---- Way 1 to click a Link ---- //
  // const link_wikipedia = await page.evaluateHandle(
  //   text => [...document.querySelectorAll('a')].find(a => a.innerText == text),
  //   'Wikipedia',
  // );
  // await link_wikipedia.click();

  // ---- Way 2 to click a Link ---- //
  // await clickByText(page, 'Wikipedia');



  // // Click 'Load more' Button.
  // const button_selector = 'text/Load more';
  // await page.waitForSelector(button_selector);
  // await page.click(button_selector);

  // // Wait until displays 20 items 
  // await page.waitForFunction(() => {
  //   const repo_cards = document.querySelectorAll('article.border');
  //   // GitHub displays 20 repositories per page.
  //   // We wait until there's more than 20.
  //   return repo_cards.length > 20;
  // });


  // ---- List ----
  // const repos = await page.$$eval('article.border', (repo_cards) => {
  //   return repo_cards.map(card => {
  //     const [user, repo] = card.querySelectorAll('h3 a'); // ** TAGs SELECT
  //     const stars = card.querySelector('#repo-stars-counter-star') // ** ID SELECTOR **
  //                       .getAttribute('title'); // ** Attributes SELECTOR
  //     const description = card.querySelector('div.px-3 > p');
  //     const topics = card.querySelectorAll('a.topic-tag');
  //     const toText = (element) => element && element.innerText.trim(); // ** innerText = Text
  //     const parseNumber = (text) => Number(text.replace(/,/g, ''));
      
  //     return {
  //       user: toText(user),
  //       repo: toText(repo),
  //       url: repo.href, // ** href = Attribute
  //       stars: parseNumber(stars),
  //       description: toText(description),
  //       topics: Array.from(topics).map((t) => toText(t)),
  //     };
  //   });
  // });

  // Print the results !!!
  // console.log(`We extracted ${repos.length} repositories.`);
  // console.dir(repos);


  await delay(10000);

  // Turn off the browser to clean up after ourselves.
  await browser.close();
};


