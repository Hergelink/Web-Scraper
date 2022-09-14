//Packages
const axios = require('axios');
const cheerio = require('cheerio');

require('dotenv').config();
// account SID and authToken info stored in env file
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

//url to scrape
const url =
  'https://www.amazon.com.tr/Apple-10-%C3%A7ekirdekli-16-%C3%A7ekirdekli-GPUya-sahip-Apple-M1/dp/B09JQZ2QM7/ref=sr_1_4_sspa?__mk_tr_TR=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=25N03ESUXTMKD&keywords=macbook&qid=1663075531&sprefix=macbook%2Caps%2C129&sr=8-4-spons&psc=1&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUFSVVY2UkpISTQzNFUmZW5jcnlwdGVkSWQ9QTAxMzEwMDlOWVhDOVlUQ0o1Q0ImZW5jcnlwdGVkQWRJZD1BMDIzMDUzMTFKNFJCM0lCU1g2OUEmd2lkZ2V0TmFtZT1zcF9hdGYmYWN0aW9uPWNsaWNrUmVkaXJlY3QmZG9Ob3RMb2dDbGljaz10cnVl';

const product = { name: '', price: '', link: '' };

//Set interval // for every 10 second
const handle = setInterval(scrape, 10000);

async function scrape() {
  //Fetch the data
  const { data } = await axios.get(url);

  //Load up the HTML with cheerio
  const $ = cheerio.load(data);

  //The container holding all the elements inside that we need!
  const item = $('div#dp-container');

  //Extract the data that we need
  product.name = $(item).find('h1 span#productTitle').text();
  product.link = url;
  const price = $(item)
    .find('span span.a-price-whole')
    .first()
    .text()
    .replace(/[.,]/g, '');

  //Converting the string value of price to an integer
  const priceNum = parseInt(price);
  product.price = priceNum;

  console.log(product);
  
  //Send an SMS
  if (priceNum < 50000) {
    client.messages
      .create({
        body: `The price of ${product.name} went below ${price}. Purchase it at ${product.link}`,
        //from is for the senders & to is the reciever phone number
        from: '',
        to: '',
      })
      .then((message) => {
        console.log(message);
        clearInterval(handle);
      });
  }
}

scrape();
