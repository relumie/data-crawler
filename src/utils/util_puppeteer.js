
const path = require('path')
const fs = require('fs')

module.exports = {
  mouseCursorHover,
  localDummyHtmlTest,
	getInnerTextFromXpathElement,
}

/** 버튼 호버(hover)할 경우 사용 */
async function mouseCursorHover (page) {
	const brand_category_button_candidates = await page.$$('a[data-gnb="brands"]');
	await brand_category_button_candidates[0].hover();

	// 속성까지 얻어내는 예시
	// for (let image of imageItems) {
	//     //hover on each element handle
	//     await image.hover();
	//     //use elementHandle getProperty method to get the current src
	//     productMap.push({'Image Src': await (await image.getProperty('src')).jsonValue()});
	// }
}

/** 로컬 파일을 읽을 때 사용 */
async function localDummyHtmlTest (page) {
	/// for es module style
	// const __dirname = new URL('.', import.meta.url).pathnameimport path from 'path';
	// const __dirname = path.resolve();
	// const full_path = path.join(__dirname, '../crawlers/dummy.html').substring(1)
	const full_path = path.join(__dirname, '../crawlers/dummy.html')
	var content_html = fs.readFileSync(full_path, 'utf8')
	await page.setContent(content_html)
}

async function getInnerTextFromXpathElement (page, xpath_element) {
	return await page.evaluate(async (element) => {
		return element && element.innerText.trim()
	}, xpath_element)
}