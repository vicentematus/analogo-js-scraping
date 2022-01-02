const puppeteer = require('puppeteer');
const fs = require('fs');
const moment = require('moment');
let store = {
	name: 'Sur Analogo',
	url: 'https://www.suranalogo.cl/',
	films: [],
	darkroom: [],
	accesories: [],
};

class Suranalogo {
	constructor() {}

	categories() {
		return ['FILM', 'ACCESORIES', 'BOOKS', 'CAMERAS', 'DARKROOM'];
	}

	products() {
		return this.products;
	}
	category_paths() {
		return {
			FILM: [
				'https://suranalogo.cl/pelicula-b/n-35mm',
				'https://suranalogo.cl/pelicula-b/n-format0-120',
				'https://suranalogo.cl/cargas',
				'https://suranalogo.cl/pelicula-35mm/color-35mm',
				'https://suranalogo.cl/pelicula-35mm/pelicula-color-formato-120',
			],
			ACCESORIES: [
				'https://suranalogo.cl/accesorios/pilas',
				'https://suranalogo.cl/accesorios/tapas',
				'https://suranalogo.cl/accesorios/filtros',
				'https://suranalogo.cl/accesorios/correas',
			],
		};
	}

	discover_categories() {}
}

const suranalogo = new Suranalogo();

console.log(suranalogo.categories());

/*Funcion que scrapea solamente la primera pagina, los divs de los products y extrae la informacion de esta.*/
async function surAnalogoScrape(url) {
	const browser = await puppeteer.launch({ headless: true });
	const page = await browser.newPage();
	await page.goto(url);

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

		store.films.push(film);

		console.log(rolloName, rolloPrice, link);
	}

	console.log(store);
	fs.writeFileSync('json/suranalogo.json', JSON.stringify(store));

	await browser.close();
}

/*Funcion que scrapea solamente la primera pagina, los divs de los products y extrae la informacion de esta.*/

async function scrapeProduct(url) {
	const browser = await puppeteer.launch({ headless: true });
	const page = await browser.newPage();
	await page.goto(url);
	console.log('sad');

	const informacion_div = await page.$(
		'.form-horizontal',
		(el) => el.innerHTML
	);

	const brand = await informacion_div.$eval(
		'.col-12.brand.hidden-sm-down',
		(el) => el.innerText
	);

	const name = await informacion_div.$eval('h1', (el) => el.innerText);

	const description = await informacion_div.$eval(
		'body > div.container.product-page > div > div.col-lg-4.col-md-5.col-12 > form > div > div:nth-child(3) > div.form-group.row.description > div > div',
		(el) => el.innerText
	);

	const condition = 'https://schema.org/OfferItemCondition';
	const price = await informacion_div.$eval(
		'#product-form-price-2',
		(el) => el.innerText
	);

	const time_stamp = moment().format();

	const currency = 'CLP';
	const SKU = null;
	let stock;
	try {
		stock = await informacion_div.$eval(
			'.product-form-stock',
			(el) => el.innerText || null
		);
	} catch (error) {
		stock = 0;
	}

	const seller = 'Suranalogo';

	console.log(brand, name);
	console.log(description);
	console.log('Precio', price);
	console.log('time_stamp', time_stamp);
	console.log('Stock:', stock);
	console.log('Condition', condition);

	const product = {
		name: name,
		brand: brand,
		description: description,
		price: price,
		currency: currency,
		SKU: SKU,
		stock: stock,
		time_stamp: time_stamp,
		condition: condition,
		seller: seller,
	};

	store.films.push(product);

	await browser.close();
	fs.writeFileSync('json/suranalogo.json', JSON.stringify(store.films));
}

//surAnalogoScrape('https://suranalogo.cl/pelicula-b/n-35mm');

const urls = [
	'https://suranalogo.cl/rollo-ilford-fp4-125-35mm-36-exp-blanco-y-negro',
	'https://suranalogo.cl/promo-3-cu-rollos-carga-pelicula-blanco-y-negro-35mm-kentmere-100-24-exp',
];

for (let link of urls) {
	scrapeProduct(link);
}
console.log(store.films);
