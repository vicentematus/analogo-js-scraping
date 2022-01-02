const puppeteer = require('puppeteer');
const fs = require('fs');
let store = {
	name: 'Sur Analogo',
	url: 'https://www.suranalogo.cl/',
	films: [
		{
			black_white: [],
		},
		{
			color: [],
		},
	],
};
async function surAnalogoScrape(url) {
	const browser = await puppeteer.launch({ headless: true });
	const page = await browser.newPage();
	await page.goto(url);
	console.log('sad');
	const rollos = await page.$$('.col-lg-3.col-md-3.col-6');

	for (const rollo of rollos) {
		const rolloName = await rollo.$eval('h4', (el) => el.innerText);
		const rolloPrice = await rollo.$eval(
			'.list-price',
			(el) => el.innerText
		);
		const link = await rollo.$eval('a', (el) => el.href);

		const film = {
			name: rolloName,
			price: rolloPrice,
			link: link,
		};

		store.films[0].black_white.push(film);

		console.log(rolloName, rolloPrice, link);
	}

	console.log(store);
	fs.writeFileSync('json/suranalogo.json', JSON.stringify(store));

	await browser.close();
}

surAnalogoScrape('https://suranalogo.cl/pelicula-b/n-35mm');
