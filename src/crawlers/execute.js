import fs from 'fs';
import path from 'path';
import puppeteer, { Page } from "puppeteer";
import { makeInt, makeUserAgent } from '../utils/util_randomizer.js';
import { hasKoreanCharacters } from '../utils/util_regex.js';
import { getInnerTextFromXpathElement, localDummyHtmlTest } from '../utils/util_puppeteer.js';
import { makeDateString } from '../utils/util_datetime.js';


// ---- SET VARIABLES ---- //
const SHOW_BROWSER = 'new'; // false = 브라우저O, 'new' = 브라우저X
const BROWSER_WIDTH = 1920; // 브라우저 실행 시 가로폭
const BROWSER_HEIGHT = 720; // 브라우저 실행 시 세로폭
const FROM_DATE = '23-12-13'
const TARGET_DATES = [
  '23-11-10',
  '23-11-13',
  '23-11-14',
  '23-11-15',
  '23-11-16',
  '23-11-17',
  '23-11-20',
  '23-11-21',
  '23-11-22',
  '23-11-24',
  '23-11-27',
  '23-11-28',
  '23-11-29',
  '23-11-30',
  '23-12-01',
  '23-12-04',
  '23-12-05',
  '23-12-06',
  '23-12-07',
  '23-12-08',
  '23-12-11',
  '23-12-12',
  '23-12-13',
  '23-12-14',
  '23-12-15',
  '23-12-18',
  '23-12-19',
  '23-12-20',
]


export default async () => {
  
  console.log('PORTFOLIO DATA TO LAST_DATE(%s)', TARGET_DATES[0]);

  // Pause for {time_ms} seconds, to see what's going on.
  const delay = async (time_ms) => {
    await new Promise((res) => setTimeout(res, time_ms));
  }

  // ---- EXECUTE ---- //
  const main = async () => {
    const userAgent = makeUserAgent();

    const browser = await puppeteer.launch({
      headless: SHOW_BROWSER,
    });
    await browser.userAgent(userAgent);

    const page = (await browser.pages())[0]

    if (SHOW_BROWSER === false)
      await page.setViewport({ width: BROWSER_WIDTH, height: BROWSER_HEIGHT});
    await page.setUserAgent(userAgent); // Re-register UserAgent
    await page.setExtraHTTPHeaders({
      'Accept-Charset': 'utf-8',
      'Content-Type': 'text/html; charset=utf-8',
    });

    // page functions
    await page.exposeFunction('showLog', log => console.log(log));
    
    const ndx_data  = await  _getNdxData(page);
    const spx_data  = await  _getSpxData(page);
    const tqqq_data = await _getTqqqData(page);
    const vix_data  = await  _getVixData(page);
    console.log( ndx_data);
    console.log( spx_data);
    console.log(tqqq_data);
    console.log( vix_data);

    const rows = [];
    for (const date of TARGET_DATES) {
      let [  ndx_close, ndx_volume    ] =  ndx_data[date] ?? ['\t', '\t']
      let [  spx_close                ] =  spx_data[date] ?? ['\t'      ]
      let [ tqqq_close, tqqq_dividend ] = tqqq_data[date] ?? ['\t', '\t']
      let [  vix_close                ] =  vix_data[date] ?? ['\t'      ]

      rows.push([date, ndx_close, ndx_volume, spx_close, tqqq_close, vix_close].join('\t'))
      if (tqqq_dividend != null)
        console.log('\ntqqq_dividend (%s): %s\n', date, tqqq_dividend);
    }
    console.log(rows.join('\n'))
    await createFile(rows.join('\n'));
    await browser.close()
    console.log('\nEND\n')
  }

  /**
   * 
   * @param {Page} page 
   * @returns {{Date: Number[]}} data
   */
  const _getNdxData = async (page) => {
    await Promise.all([
      page.waitForNavigation(),
      page.goto("https://finance.yahoo.com/quote/%5ENDX/history")
    ])
    // await localDummyHtmlTest(page)

    const output = {}
    const xpath_trs = await page.$x('//table[@data-test="historical-prices"]/tbody/tr')
    for (const xpath_tr of xpath_trs) {
      const xpath_tds = await xpath_tr.$$('xpath/td')
      let date   = await getInnerTextFromXpathElement(page, xpath_tds[0])
      let close  = await getInnerTextFromXpathElement(page, xpath_tds[4])
      let volume = await getInnerTextFromXpathElement(page, xpath_tds[6])
      date = makeDateString(new Date(date))
      output[date] = [close, volume]
      if (date === FROM_DATE)
        break;
    }
    return output;
  }

  /**
   * 
   * @param {Page} page 
   * @returns {[]} `[date, close]`
   */
  const _getSpxData = async (page) => {
    await Promise.all([
      page.waitForNavigation(),
      page.goto("https://finance.yahoo.com/quote/%5ESPX/history")
    ])
    
    const output = {}
    const xpath_trs = await page.$x('//table[@data-test="historical-prices"]/tbody/tr')
    for (const xpath_tr of xpath_trs) {
      const xpath_tds = await xpath_tr.$$('xpath/td')
      let date  = await getInnerTextFromXpathElement(page, xpath_tds[0])
      let close = await getInnerTextFromXpathElement(page, xpath_tds[4])
      date = makeDateString(new Date(date))
      output[date] = [close]
      if (date === FROM_DATE)
        break;
    }
    return output;
  }

  /**
   * 
   * @param {Page} page 
   * @returns {[]} `[date, close, dividend]`
   */
  const _getTqqqData = async (page) => {
    await Promise.all([
      page.waitForNavigation(),
      page.goto("https://finance.yahoo.com/quote/TQQQ/history")
    ])
    
    const output = {}
    let last_date_for_dividend = ''
    const xpath_trs = await page.$x('//table[@data-test="historical-prices"]/tbody/tr')
    for (const xpath_tr of xpath_trs) {
      const xpath_tds = await xpath_tr.$$('xpath/td')
      let dividend_text = await getInnerTextFromXpathElement(page, xpath_tds[1])
      if (dividend_text.endsWith('Dividend')) {
        output[last_date_for_dividend].push(dividend_text.split(' ')[0]);
        continue;
      }
      let date  = await getInnerTextFromXpathElement(page, xpath_tds[0])
      let close = await getInnerTextFromXpathElement(page, xpath_tds[4])
      last_date_for_dividend = date = makeDateString(new Date(date))
      output[date] = [close]
      if (date === FROM_DATE)
        break;
    }
    return output;
  }

  /**
   * 
   * @param {Page} page 
   * @returns {[]} `[date, close]`
   */
  const _getVixData = async (page) => {
    await Promise.all([
      page.waitForNavigation(),
      page.goto("https://finance.yahoo.com/quote/%5EVIX/history")
    ])
    
    const output = {}
    const xpath_trs = await page.$x('//table[@data-test="historical-prices"]/tbody/tr')
    for (const xpath_tr of xpath_trs) {
      const xpath_tds = await xpath_tr.$$('xpath/td')
      let date  = await getInnerTextFromXpathElement(page, xpath_tds[0])
      let close = await getInnerTextFromXpathElement(page, xpath_tds[4])
      date = makeDateString(new Date(date))
      output[date] = [close]
      if (date === FROM_DATE)
        break;
    }
    return output;
  }

  /**
   * 
   * @param {Page} page 
   * @returns {[]} `[date, close]`
   */
  const _getRSIData = async (page, ticker) => {
    await Promise.all([
      page.waitForNavigation(),
      page.goto("https://finance.yahoo.com/quote/SCHD/history")
    ])
    
    const output = {}
    const xpath_trs = await page.$x('//table[@data-test="historical-prices"]/tbody/tr')
    for (const xpath_tr of xpath_trs) {
      const xpath_tds = await xpath_tr.$$('xpath/td')
      let date  = await getInnerTextFromXpathElement(page, xpath_tds[0])
      let close = await getInnerTextFromXpathElement(page, xpath_tds[4])
      date = makeDateString(new Date(date))
      output[date] = [close]
      if (date === FROM_DATE)
        break;
    }
    return output;
  }

  const createFile = async (data) => {
    // const __dirname = new URL('.', import.meta.url).pathname;
    // const full_path = path.join(__dirname, `output/${SITE_TITLE}-${CATEGORY_TITLE}.json`).substring(1);
    const full_path = 'output/output.txt'
    try {
      fs.unlinkSync(full_path)
    } catch (e) {
      console.log('no file to delete');
    }
    fs.writeFileSync(full_path, data, { encoding: 'utf8', flag: 'wx' })
  }


  // async function _getAttributeFromXPathElement (xpath_element, attribute) {
  //   let result = await page.evaluate((el, attribute) => {
  //     return el.getAttribute(attribute);
  //   }, xpath_element, attribute);
  //   return result;
  // }

  // const toNextPage = async (page) => {
  //   // Exit if this is last page
  //   if (current_page_number == last_page_number) {
  //     console.log(`END OF PAGE=(${current_page_number}/${last_page_number}). GOOD JOB.`);
  //     return;
  //   }
  //   current_page_number = current_page_number += 1;

  //   await page.goto(`https://www.musinsa.com/brands?categoryCode=${query_categoryCode}&type=&sortCode=BRAND_KOR&page=${current_page_number}&size=100`);
  //   await delay(MIN_DELAY + makeInt(ADDITIONAL_DELAY)); // load and avoid block IP
  // }


  /**
   * 클릭해서 페이지를 이동하는 방식
   */
  // const toNextPage = async () => {
  //   // Exit if this is last page
  //   if (current_page_number == last_page_number) {
  //     console.log(`END OF PAGE=(${current_page_number}/${last_page_number}). GOOD JOB.`);
  //     return;
  //   }
    
  //   // Get last_page_number
  //   let pagination_classes = await page.$x(`//div[@class='pagination']`);
  //   last_page_number = Number(await _getAttributeFromXPathElement(pagination_classes[0], 'data-total-page'));

  //   // Click next_page button
  //   let page_button_classes  = await page.$x(`//div[@class='pagination']/div[@class="wrapper"]/a`)
  //   page_button_classes.shift();
    
  //   if (page_button_classes.length > 0) {    
  //     for(let elm of page_button_classes) {
  //       let target_page_number = Number(await _getAttributeFromXPathElement(elm, 'value'));
  //       if (target_page_number == current_page_number + 1) {
  //         current_page_number = target_page_number;
  //         await elm.click();
  //         await delay(5000); // WAIT LOAD NEW PAGE
          
  //         /* 화면에 보일 경우에만 클릭인 듯. 필요할 때 대비해서 살려둠 */
  //         // if(await elm.isIntersectingViewport()) {
  //         // }
          
  //         return;
  //       }
  //     }
  //   } else {
  //     console.log(xpath);
  //   }
  //   throw new Error(`NEXT PAGE ERROR`);
  // }
  //
  // const scrapStores = async (page) => {
  //   let xpath_elements = await page.$x(`//ul[@id='countOrdered']/li/span/label`);
  //   for (let xpath_element of xpath_elements) {
  //     let brand_name = await page.evaluate(async (element) => {
  //       const toText = (element) => element && element.innerText.trim()
  //       let name_parsed = toText(element);
  //       return name_parsed;
  //     }, xpath_element)
  //     brand_names.add(brand_name);
  //   }
  // }

  await main();
};


