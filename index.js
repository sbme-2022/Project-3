const fetch = require('node-fetch');
const mongoose = require('mongoose');
require('dotenv').config()

mongoose.connect('mongodb://localhost/currency-convertor')
  .then(() => console.log("Conected to MongoDB..."))
  .catch((error) => console.log(error));

const convertorSchema = new mongoose.Schema({
  base: String,
  rates: {
    type: Map,
    of: Number
  }
});
const Convertor = mongoose.model('Convertor', convertorSchema);

var myHeaders = new fetch.Headers();
myHeaders.append("apikey", process.env.CURRENCY_CONVERTOR_API_KEY);

var requestOptions = {
  method: 'GET',
  redirect: 'follow',
  headers: myHeaders
};


var symbolsList = []
async function getSymbols() {
  try {
    const response = await fetch("https://api.apilayer.com/exchangerates_data/symbols", requestOptions);
    const result = await response.text();
    jsonrResult = JSON.parse(result);
    symbols = jsonrResult.symbols;
    console.log('sympols', symbols);
    for (var i in symbols) {
      symbolsList.push(i);
    }
  } catch (error) {
    console.log('error', error);
  }
}
// getSymbols()
//   .then(result => console.log(symbolsList));


async function getFromApiAndUpdateDB() {
  var convertor = await Convertor.find({ base: 'EGP' });
  var base = 'EGP';
  const response = await fetch(`https://api.apilayer.com/exchangerates_data/latest?&base=${base}`, requestOptions)
  const result = await response.text();
  jsonrResult = JSON.parse(result);
  convertor = await Convertor.updateOne({ base: 'EGP' }, {
    $set: {
      base: base,
      rates: jsonrResult.rates
    }
  });
  console.log(convertor);
  // await convertor.save();
}
// getFromApiAndUpdateDB();


// convertor(from x to y) = amount * rate ... rate = rate(y)/rate(x)
async function getRateFromDB(from, to) {
  try {
    var rate;
    await Convertor.find().then(
      result => {
        console.log('result', result);
        if (from.toUpperCase === 'EGP') {
          rate = result[0].rates.get(to.toUpperCase());
        }
        rate = (result[0].rates.get(to.toUpperCase())) / (result[0].rates.get(from.toUpperCase()));
        console.log('rate', rate);
      }
    )
  } catch (error) {
    console.log('error', error);
  }
}
// getRateFromDB('XAU', 'usd');

async function convertData(from, to, amount) {
  try {
    const response = await fetch(`https://api.apilayer.com/exchangerates_data/convert?to=${to.toUpperCase()}&from=${from.toUpperCase()}&amount=${amount}`, requestOptions);
    const result = await response.text();
    jsonrResult = JSON.parse(result);
    console.log('result', jsonrResult);
    console.log('from', jsonrResult.query.from);
    console.log('to', jsonrResult.query.to);
    console.log('rate', jsonrResult.info.rate);

    const convertor = new Convertor({
      from: jsonrResult.query.from,
      to: jsonrResult.query.to,
      rate: jsonrResult.info.rate
    });
    console.log(convertor);
    convertor.save();
  } catch (error) {
    console.log('error', error);
  }
}
// convertData('XAU', 'USD', 20);