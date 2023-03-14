require('dotenv').config();

//Packages
const axios = require('axios');
const cheerio = require('cheerio');

const formData = require('form-data');
const Mailgun = require('mailgun.js');
const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_KEY,
});

//url to scrape
const url = process.env.TARGET_URL;

const product = { name: '', price: '', link: '' };

//Set interval // for every 12 hour
const handle = setInterval(scrape, 43200000);

async function scrape() {
  //Fetch the data
  const { data } = await axios.get(url);

  //Load up the HTML with cheerio
  const $ = cheerio.load(data);

  //The container holding all the elements
  const item = $('div.pr-in-cn');

  //Extract the data
  product.name = $(item).find('div h1.pr-new-br').text();
  product.link = url;

  const price = $(item)
    .find('div span.prc-dsc')
    .first()
    .text()
    .replace(/[,]/g, '.');

  const priceNum = parseInt(price);
  product.price = priceNum;

  const priceTreshold = 420;

  //Send an email
  if (priceNum < priceTreshold) {
    console.log(product);

    mg.messages
      .create('sandbox322835d33b78427c87e79c9db5cd34b9.mailgun.org', {
        from: process.env.EMAIL,
        to: process.env.EMAIL,
        subject: `Price Decrease of ${product.name}`,
        text: `The price of ${product.name} decreased below ${priceTreshold}. Product link = ${url}`,
      })
      .then((msg) => console.log(msg))
      .catch((err) => console.log(err));
  }
}

scrape();
