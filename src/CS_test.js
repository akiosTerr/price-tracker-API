const ClapScrap = require('../modules/clapScrap/src/ClapScrap');
const { userAgent } = require('./lib/UA.json');

const CS = new ClapScrap(userAgent);

const main = async () => {
	const { response, page } = await CS.launchBot(
		'https://www.mercadolivre.com.br/memoria-ram-8gb-1x8gb-kingston-kvr16s118-valueram/p/MLB6062286#reco_item_pos=1&reco_backend=machinalis-cheaper-product2&reco_backend_type=low_level&reco_client=similar-cheaper&reco_id=425db6dd-3871-4a7b-b9d7-2222446913e1'
	);
	const xpath =
		'//*[@id="root-app"]/div[2]/div[2]/div[1]/div[1]/div[1]/div[2]/div[3]/div[1]/div/span/span[2]';
	const headers = response.headers();
	const arr = ['abc', '321', '$#@'];
	console.log(CS.test(arr));
	console.log(headers.status);
	const text = await CS.evalXpath(page, xpath);
	const browser = CS.getBrowser();
	console.log(text);
	browser.close();
};
main();
