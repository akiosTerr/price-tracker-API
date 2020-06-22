const ClapScrap = require('./lib/ClapScrap');
const { userAgent } = require('./data/UA.json');

const CS = new ClapScrap(userAgent);

const main = async () => {
	const { response, page } = await CS.launchBot('https://www.youtube.com/');

	const headers = response.headers();

	console.log(headers.status);
};
main();
