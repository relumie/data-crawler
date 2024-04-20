const fetch = require('node-fetch')
const fs = require('fs')
const puppeteer = require('puppeteer')
const xlsx = require('xlsx')
const util_datetime   = require('../utils/util_datetime.js')
const util_javascript = require('../utils/util_javascript.js')
const util_puppeteer  = require('../utils/util_puppeteer.js')
const util_randomizer = require('../utils/util_randomizer.js')


// ---- SET VARIABLES ---- //
const DELAY_BETWEEN_SAME_SITE = 5000
const SHOW_BROWSER = 'new' // false = 브라우저O, 'new' = 브라우저X
const BROWSER_WIDTH = 1920 // 브라우저 실행 시 가로폭
const BROWSER_HEIGHT = 720 // 브라우저 실행 시 세로폭
const FROM_DATE = '2023-11-14'
const TARGET_DATES = [
  '2024-01-22',
  '2024-01-23',
  '2024-01-24',
  '2024-01-25',
  '2024-01-26',
  '2024-01-29',
  '2024-01-30',
  '2024-01-31',
  '2024-02-01',
  '2024-02-02', '2024-02-05', '2024-02-06', '2024-02-07', '2024-02-08',
  '2024-02-09', '2024-02-12', '2024-02-13', '2024-02-14', '2024-02-15',
  '2024-02-16', '2024-02-20', '2024-02-21', '2024-02-22', '2024-02-23',
  '2024-02-26', '2024-02-27', '2024-02-28', '2024-02-29', '2024-03-01',
  '2024-03-05', '2024-03-06', '2024-03-07', '2024-03-08',
  '2024-03-11', '2024-03-12', '2024-03-13', '2024-03-14', '2024-03-15',
  '2024-03-18', '2024-03-19', '2024-03-20', '2024-03-21', '2024-03-22',
  '2024-03-25', '2024-03-26', '2024-03-27', '2024-03-28',
  '2024-04-01', '2024-04-02', '2024-04-03', '2024-04-04', '2024-04-05',
  '2024-04-08', '2024-04-09', '2024-04-10', '2024-04-11', '2024-04-12',
  '2024-04-15', '2024-04-16', '2024-04-17', '2024-04-18',
]


module.exports = async () => {
  console.log('PORTFOLIO DATA TO LAST_DATE(%s)', TARGET_DATES[0])
  const user_agent = util_randomizer.makeUserAgent()
  var last_line_date

  // Pause for {time_ms} seconds, to see what's going on.
  const delay = async (time_ms) => {
    await new Promise((res) => setTimeout(res, time_ms))
  }

  // ---- EXECUTE ---- //
  const main = async () => {
    const browser = await puppeteer.launch({
      headless: SHOW_BROWSER,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-infobars',
        '--window-position=0,0',
        '--ignore-certifcate-errors',
        '--ignore-certifcate-errors-spki-list',
        `--user-agent=${user_agent}`
      ]
    })
    // await browser.userAgent(userAgent)

    const page = (await browser.pages())[0]

    if (SHOW_BROWSER === false)
      await page.setViewport({ width: BROWSER_WIDTH, height: BROWSER_HEIGHT})
    // await page.setUserAgent(userAgent) // Re-register UserAgent
    await page.setExtraHTTPHeaders({
      'Accept-Charset': 'utf-8',
      'Content-Type': 'text/html; charset=utf-8',
      'user-agent': `${user_agent}`, 
      'upgrade-insecure-requests': '1', 
      'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8', 
      'accept-encoding': 'gzip, deflate, br', 
      'accept-language': 'en-US,en;q=0.9,en;q=0.8',
    })

    // page functions
    await page.exposeFunction('showLog', log => console.log(log))

    // pure
    const     ndx_data = await _getPureData('%5ENDX' ); await delay(util_randomizer.makeInt(DELAY_BETWEEN_SAME_SITE))
    const     spx_data = await _getPureData('%5ESPX' ); await delay(util_randomizer.makeInt(DELAY_BETWEEN_SAME_SITE))
    const    tqqq_data = await _getPureData('TQQQ'   ); await delay(util_randomizer.makeInt(DELAY_BETWEEN_SAME_SITE))
    const     vix_data = await _getPureData('%5EVIX' ); await delay(util_randomizer.makeInt(DELAY_BETWEEN_SAME_SITE))
    const usd_krw_data = await _getPureData('KRW%3DX'); await delay(util_randomizer.makeInt(DELAY_BETWEEN_SAME_SITE))
    // rsi
    const schd_data = await _getRSIData('SCHD'); await delay(util_randomizer.makeInt(DELAY_BETWEEN_SAME_SITE))
    const  xlv_data = await _getRSIData('XLV' )
    // etc
    const fear_greed_data = await _getFearGreedData(page)
    const naaim_data = await _getNAAIMData(page)
    const aaii_data = await _getAAIIData()
    const nasdaq_interest_position_data = await _getNasdaqInterestPosition();

    const rows = []
    for (const date of TARGET_DATES) {
      let [  ndx_close, ndx_volume                 ] =                      ndx_data[date] ?? ['', ''    ]
      let [  spx_close                             ] =                      spx_data[date] ?? [''        ]
      let [ tqqq_close, tqqq_volume, tqqq_dividend ] =                     tqqq_data[date] ?? ['', ''    ]
      let [ schd_close, schd_rsi, schd_dividend    ] =                     schd_data[date] ?? ['', '', '']
      let [  xlv_close,  xlv_rsi, xlv_dividend     ] =                      xlv_data[date] ?? ['', '', '']
      let [  vix_close                             ] =                      vix_data[date] ?? [''        ]
      let [ fear_and_greed                         ] =               fear_greed_data[date] ?? [''        ]
      let [ naaim                                  ] =                    naaim_data[date] ?? [''        ]
      let [ aaii_builish, aaii_bearish, aaii_gap   ] =                     aaii_data[date] ?? ['', '', '']
      let [ nasdaq_long_interest_position          ] = nasdaq_interest_position_data[date] ?? [''        ]
      let [ usd_krw_close                          ] =                  usd_krw_data[date] ?? [''        ]

      rows.push([
        date,
        ndx_close, ndx_volume, spx_close, tqqq_close,
        schd_rsi, xlv_rsi, vix_close,
        fear_and_greed, naaim, aaii_builish, aaii_bearish, aaii_gap,
        nasdaq_long_interest_position,
        usd_krw_close,
      ].join('\t'))

      if (tqqq_dividend != null)
        console.log('\ntqqq_dividend (%s): %s\n', date, tqqq_dividend)
      if (schd_dividend != null)
        console.log('\nschd_dividend (%s): %s\n', date, schd_dividend)
      if (xlv_dividend != null)
        console.log('\nxlv_dividend (%s): %s\n', date, xlv_dividend)
    }

    await createOrAppendFile(rows)

    await browser.close()
    console.log('\nEND\n')
  }


  /**
   * @param {puppeteer.Page} page 
   * @returns {[]} `[date, close, volume, dividend]`
   */
  const _getPureDataV1 = async (page, ticker) => {
    await Promise.all([
      page.waitForNavigation(),
      page.goto(`https://finance.yahoo.com/quote/${ticker}/history`)
    ])
    const output = {}
    let last_date = ''
    const xpath_trs = await page.$x('//div[@data-testid="history-table"]/div[contains(@class,"table-container")]/table/tbody/tr')
    console.log(xpath_trs);
    for (const xpath_tr of xpath_trs) {
      const xpath_tds = await xpath_tr.$$('xpath/td')
      let dividend_text = await util_puppeteer.getInnerTextFromXpathElement(page, xpath_tds[1])
      if (dividend_text.endsWith('Dividend')) {
        output[last_date].push(dividend_text.split(' ')[0]);
        continue;
      }
      let date   = await util_puppeteer.getInnerTextFromXpathElement(page, xpath_tds[0])
      let close  = await util_puppeteer.getInnerTextFromXpathElement(page, xpath_tds[4])
      let volume = await util_puppeteer.getInnerTextFromXpathElement(page, xpath_tds[6])
      last_date = date = util_datetime.makeDateString(new Date(date))
      output[date] = [close, volume]
      if (date === FROM_DATE)
        break;
    }
    return output;
  }


  /**
   * @param {string} ticker
   * @returns {object} `{date: [close, volume, dividend]}`
   */
  const _getPureData = async (ticker) => {
    const output = {}
    const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?events=capitalGain%7Cdiv%7Csplit&formatted=true&includeAdjustedClose=true&interval=1d&symbol=${ticker}&userYfid=true&range=1y&lang=en-US&region=US`, {
      "headers": {
        "accept": "*/*",
        "accept-language": "ko,ja;q=0.9,en;q=0.8",
        "priority": "u=1, i",
        "sec-ch-ua": "\"Chromium\";v=\"124\", \"Google Chrome\";v=\"124\", \"Not-A.Brand\";v=\"99\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        "Referer": `https://finance.yahoo.com/quote/${ticker}/history`,
        "Referrer-Policy": "no-referrer-when-downgrade"
      },
      "body": null,
      "method": "GET"
    });
    const json = await response.json();

    for (let i = 0; i < json['chart']['result'][0]['timestamp'].length; ++i) {
      const timestamp = json['chart']['result'][0]['timestamp'][i]
      let date = util_datetime.makeDateString(new Date(timestamp * 1000))

      let close  = json['chart']['result'][0]['indicators']['quote'][0]['close'][i]
      let volume = json['chart']['result'][0]['indicators']['quote'][0]['volume'][i]
      output[date] = [close, volume]

      if (
        json['chart']['result'][0]['events'] != null &&
        json['chart']['result'][0]['events']['dividends'] != null &&
        json['chart']['result'][0]['events']['dividends'][timestamp] != null
      ) {
        let dividend = json['chart']['result'][0]['events']['dividends'][timestamp]['amount']
        output[date].push(dividend)
      }
    }

    return output;
  }


  /**
   * @param {puppeteer.Page} page 
   * @param {string} ticker 
   * @returns {[]} `[date, close]`
   */
  const _getRSIDataV1 = async (page, ticker) => {
    await Promise.all([
      page.waitForNavigation(),
      page.goto(`https://finance.yahoo.com/quote/${ticker}/history`)
    ])
    
    const output = {}
    let last_date = ''
    const xpath_trs = await page.$x('//div[@data-testid="history-table"]/div[contains(@class,"table-container")]/table/tbody/tr')
    
    for (const xpath_tr of xpath_trs) {
      const xpath_tds = await xpath_tr.$$('xpath/td')
      let dividend_text = await util_puppeteer.getInnerTextFromXpathElement(page, xpath_tds[1])
      if (dividend_text.endsWith('Dividend')) {
        output[last_date].push(dividend_text.split(' ')[0]);
        continue
      }
      let date  = await util_puppeteer.getInnerTextFromXpathElement(page, xpath_tds[0])
      let close = await util_puppeteer.getInnerTextFromXpathElement(page, xpath_tds[4])
      
      last_date = date = util_datetime.makeDateString(new Date(date))
      close = Number.parseFloat(close);
      output[date] = [close]

      // if (date === FROM_DATE)
      //   break;
    }

    /** @type {number} */
    let last_close
    let [diff_positive, diff_negative] = [[],[]]
    let [rma_positive , rma_negative ] = [null, null]
    function calculateRsi (avg_positive, avg_negative) {
      if (avg_positive + avg_negative === 0)
        return 50
      return 100 * avg_positive / (avg_positive + avg_negative)
    }

    for (let date of Object.keys(output).reverse()) {
      const close = output[date][0]
      const diff = close - last_close

      if (rma_positive != null && rma_negative != null) {
        rma_positive = (rma_positive * 13 + Math.max(0,  diff)) /14
        rma_negative = (rma_negative * 13 + Math.max(0, -diff)) /14
        output[date].splice(1, 0, calculateRsi(rma_positive, rma_negative))

      } else if (last_close != null) {
        diff_positive.push(Math.max(0,  diff))
        diff_negative.push(Math.max(0, -diff))

        if (diff_positive.length === 14 && diff_negative.length === 14) {
          rma_positive = diff_positive.reduce((p, c) => p + c, 0) / 14
          rma_negative = diff_negative.reduce((p, c) => p + c, 0) / 14
          diff_positive = diff_negative = []
          output[date].splice(1, 0, calculateRsi(rma_positive, rma_negative))
        }
      }
      last_close = close
    }
    return output;
  }


  /**
   * @param {string} ticker 
   * @returns {object} `{date: [close, rsi, volume, dividend]}`
   */
  const _getRSIData = async (ticker) => {
    const output = await _getPureData(ticker)

    /** @type {number} */
    let last_close
    let [diff_positive, diff_negative] = [[],[]]
    let [rma_positive , rma_negative ] = [null, null]
    function calculateRsi (avg_positive, avg_negative) {
      if (avg_positive + avg_negative === 0)
        return 50
      return 100 * avg_positive / (avg_positive + avg_negative)
    }

    for (let date of Object.keys(output)) {
      const close = output[date][0]
      const diff = close - last_close

      if (rma_positive != null && rma_negative != null) {
        rma_positive = (rma_positive * 13 + Math.max(0,  diff)) /14
        rma_negative = (rma_negative * 13 + Math.max(0, -diff)) /14
        output[date].splice(1, 0, calculateRsi(rma_positive, rma_negative))

      } else if (last_close != null) {
        diff_positive.push(Math.max(0,  diff))
        diff_negative.push(Math.max(0, -diff))

        if (diff_positive.length === 14 && diff_negative.length === 14) {
          rma_positive = diff_positive.reduce((p, c) => p + c, 0) / 14
          rma_negative = diff_negative.reduce((p, c) => p + c, 0) / 14
          diff_positive = diff_negative = []
          output[date].splice(1, 0, calculateRsi(rma_positive, rma_negative))
        }
      }
      last_close = close
    }
    return output;
  }


  /**
   * @param {puppeteer.Page} page 
   * @returns {[]} `[date, value]`
   */
  async function _getFearGreedData (page) {
    await Promise.all([
      page.waitForNavigation(),
      page.goto('https://production.dataviz.cnn.io/index/fearandgreed/graphdata')
    ])
    
    const output = {}
    const xpath_pre = (await page.$x('//pre'))[0]
    const text = await util_puppeteer.getInnerTextFromXpathElement(page, xpath_pre)
    const rows = JSON.parse(text)['fear_and_greed_historical']['data']
    const from_date = new Date(FROM_DATE)
    for (let i in rows) {
      let row = rows[i]
      let date = new Date(row['x'])
      if (date.getTime() < from_date.getTime())
        continue;
      date = util_datetime.makeDateString(date)
      const value = row['y']
      output[date] = [value]
    }
    return output
  }


  /**
   * @param {puppeteer.Page} page 
   * @returns {[]} `[date, value]`
   */
  async function _getNAAIMData (page) {
    await Promise.all([
      page.waitForNavigation(),
      page.goto('https://www.naaim.org/programs/naaim-exposure-index')
    ])
    
    const output = {}
    const xpath_trs = await page.$x('//tr[@id="surveydata-subject"]')
    xpath_trs.shift()
    for (const xpath_tr of xpath_trs) {
      const xpath_tds = await xpath_tr.$$('xpath/td')
      let date  = await util_puppeteer.getInnerTextFromXpathElement(page, xpath_tds[0])
      let value = await util_puppeteer.getInnerTextFromXpathElement(page, xpath_tds[1])
      date = new Date(date)
      if (date.getTime() < new Date(FROM_DATE).getTime())
        break;
      date = util_datetime.makeDateString(date)
      output[date] = [value]
    }
    return output
  }


  /**
   * @returns {[]} `[date, value]`
   */
  async function _getAAIIData () {
    let output = {}

    // get data
    /** @type {fetch.Response} */
    const response = await fetch("https://www.aaii.com/files/surveys/sentiment.xls", {
    // const response = await fetch("http://localhost/sentiment.xls", {
      "headers": {
        "user-agent": user_agent,
        "upgrade-insecure-requests": "1",
        "content-type": "application/ms-excel; charset=UTF-8",
      },
      "referrerPolicy": "strict-origin-when-cross-origin",
      "body": null,
      "method": "GET"
    })
    const xls_data = await response.arrayBuffer()
    const workbook = xlsx.read(new Uint8Array(xls_data), {
      type: 'array',
      // type: 'binary',
      cellDates: true,
      cellNF: false,
      cellText: false,
      raw: false,
    })
    const sheet = workbook.Sheets['SENTIMENT']
    const rows = xlsx.utils.sheet_to_json(sheet, {
      header: ['date', 'bullish', 'neutral', 'bearish'],
      range: { s: { r: 1850, c: 0 }, e: { r: 3000, c: 3 } },
      blankrows: true,
    })

    // parse
    for (let row of rows) {
      if (util_javascript.checkType(row['date']) !== '[object Date]')
        break
      row['date'].setDate(row['date'].getDate() - 1)
      if (row['date'].getTime() < new Date(FROM_DATE).getTime())
        continue
      output[util_datetime.makeDateString(row['date'])] = [row['bullish'], row['bearish'], row['bullish'] - row['bearish']]
    }

    return output
  }


  /**
   * @param {puppeteer.Page} page 
   * @returns {[]} `[date, value]`
   */
  async function _getNasdaqInterestPosition (page) {
    try {
      const response = await fetch("https://dp.afreecatv.com/api/sitedata/charts", {
        "headers": {
          "accept": "application/json, text/plain, */*",
          "accept-language": "ko,ja;q=0.9,en;q=0.8",
          "sec-ch-ua": "\"Not_A Brand\";v=\"8\", \"Chromium\";v=\"120\", \"Google Chrome\";v=\"120\"",
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": "\"Windows\"",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "Referer": "https://dp.afreecatv.com/",
          "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "body": null,
        "method": "GET"
      })
      const result = await response.json()
      console.log(result)
      const nasdaq_interest_position = result.find((o) => o.name === "E-mini NASDAQ 100")
      return { [TARGET_DATES[TARGET_DATES.length - 1]]: [ nasdaq_interest_position['buyrate'] * 0.01 ] }
    } catch (e) {
      console.log('Errors on _getNasdaqInterestPosition()', e)
      return {}
    }
  }


  function createOrAppendFile(data_rows) {
    const file_path = 'output/output.txt'
    let file_rows = []
    try {
      const file_data = fs.readFileSync(file_path, { encoding: 'utf8' })
      const file_rows = file_data.split('\n')
      const last_line = file_rows.pop()
      last_line_date = new Date(last_line.split('\t').shift())
    } catch (e) {
      // no existing data
      console.trace('Error on loading the existing file\n>>', e.message)
    }

    if (last_line_date != null) {
      for (const i in data_rows) {
        const date = new Date(data_rows[i].split('\t').shift())
        if (date.getTime() < last_line_date.getTime())
          data_rows.shift()
        else
          break
      }
    }

    console.log(data_rows)

    for (let i in data_rows) {
      data_rows[i] = data_rows[i].trim()
    }

    fs.writeFileSync(file_path, [].concat(file_rows, data_rows).join('\n'), { encoding: 'utf8', flag: 'w' })
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


