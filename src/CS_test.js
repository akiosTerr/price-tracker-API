const ClapScrap = require('../modules/clapScrap/src/ClapScrap');
const { userAgent } = require('./lib/UA.json');

const CS = new ClapScrap(userAgent);

const main = async () => {
	const { response, page } = await CS.launchBot(
		'https://produto.mercadolivre.com.br/MLB-715334682-memoria-ddr3-8gb-1600mhz-pc-12800-vengeance-corsair-0635-_JM',
		false
	);

	const xpath =
		'//*[@id="root-app"]/div/div[3]/div/div[2]/div[1]/div/div[2]/div/div[1]/div/span/span[2]';

	const headers = response.headers();

	console.log(headers.status);

	const text = await CS.evalXpath(page, xpath);

	console.log(text);
};
main();
