const fetch = require('node-fetch');
const mongoose = require('mongoose');

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
myHeaders.append("apikey", "UtNXP4lARPKAFZu6Tn4LXlc22SO73kSf");

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


async function uploadToDB() {
  // for (var i in symbolsList) {
    var i = 'EGP'; 
    const response = await fetch(`https://api.apilayer.com/exchangerates_data/latest?&base=${i}`, requestOptions)
    const result = await response.text();
    jsonrResult = JSON.parse(result);
    const convertor = new Convertor({
      base: i,
      rates: jsonrResult.rates
    });
    console.log(convertor);
    await convertor.save();
    // }
}
// uploadToDB();


async function getRateFromDB(from, to){
  const convertor = await Convertor.find({base: from.toUpperCase()}).then(
  result => console.log('to', result)

  );
  console.log('from', convertor);
  // const convertorTo = convertor.rates;
}
getRateFromDB('egp','usd');


async function convertData() {
  try {
    const response = await fetch("https://api.apilayer.com/exchangerates_data/convert?to={to}&from={from}&amount={amount}", requestOptions);
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
// convertData();