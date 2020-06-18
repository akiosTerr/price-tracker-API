const puppeter = require('puppeteer');

function ClapScrap(UA) {
	this.init(UA);
}

ClapScrap.prototype = {
	init: (UA) => {
		this.UA = UA;
	},
	launchBot: async (url, headless = true) => {
		const browser = await puppeter.launch({
			headless: headless,
			args: [`--user-agent=${this.UA}`],
		});
		const page = await browser.newPage();
		const response = await page.goto(url);

		return { page, response };
	},
	getImageURL: async (page, xpath) => {
		const [el] = await page.$x(xpath);
		const src = await el.getProperty('src');
		const srcTxt = await src.jsonValue();
		return srcTxt;
	},
	evalXpath: async (page, xpath) => {
		await page.waitForXPath(xpath);
		const [elHandle] = await page.$x(xpath);
		const property = await page.evaluate((el) => el.textContent, elHandle);
		return property;
	},
	getText: async (page, handler) => {
		const text = await page.$eval(handler, (e) => e.innerText);
		return text;
	},
	getTexts: async (page, handlers) => {
		let texts = [];
		handlers.map(async (handler) => {
			const text = await page.$eval(handler, (e) => e.innerText);
			texts.push(text);
		});
		return texts;
	},
};

module.exports = ClapScrap;
