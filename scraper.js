require('dotenv').config();

//Packages
const axios = require('axios');
const cheerio = require('cheerio');

// account SID and authToken info stored in env file
// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;
// const client = require('twilio')(accountSid, authToken);

const sgMail = require('@sendgrid/mail');
const client = sgMail.setApiKey(process.env.SENDGRID_API_KEY);

//url to scrape
const url =
  'https://www.trendyol.com/tchibo/cafissimo-caffe-crema-rich-aroma-96-adet-kapsul-kahve-p-821481';

const product = { name: '', price: '', link: '' };

//Set interval // for every 10 second
const handle = setInterval(scrape, 100000);
//Set interval // for every 12 hour
// const handle = setInterval(scrape, 43200000);

async function scrape() {
  //Fetch the data
  const { data } = await axios.get(url);

  //Load up the HTML with cheerio
  const $ = cheerio.load(data);

  //The container holding all the elements inside that we need!
  const item = $('div.pr-in-cn');

  //Extract the data that we need
  product.name = $(item).find('div h1.pr-new-br').text();
  product.link = url;

  const price = $(item)
    .find('div span.prc-dsc')
    .first()
    .text()
    .replace(/[,]/g, '.');

  //Converting the string value of price to an integer
  const priceNum = parseInt(price);
  product.price = priceNum;

  console.log(product);

  const priceTreshold = 500;
  //Send an SMS
  if (priceNum < priceTreshold) {
    const msg = {
      to: 'enver.hergelink@gmail.com',
      from: 'enver.hergelink@gmail.com',
      subject: `Price Decrease of ${product.name}`,
      text: `The price of ${product.name} decreased below ${priceTreshold}`,
    };

    client
      .send(msg)
      .then(() => {
        console.log('Email Sent');
      })
      .catch((error) => {
        console.log(error);
      });
  }
}

scrape();
