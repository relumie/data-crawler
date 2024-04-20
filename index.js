
// ---- Puppeteer ---- //
// import runPuppeteer from './run_puppeteer.js';
// runPuppeteer();


// ---- Crawlee ---- //
// import runCrawlee from './run_crawlee.js';
// runCrawlee();


// ---- Crawlee-Router ---- //
// import fakeUserAgent from './fake_user_agent_crawlee.js';
// fakeUserAgent();


// --- musinsa.com --- //
const execute = require('./src/crawlers/execute.js')
try {
	console.log(new Date())
	execute()
} catch (e) {
  console.log(new Date())
}
