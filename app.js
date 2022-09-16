const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const Web3 = require('web3');
const _abi = require('./abi/token.json');
let tradingState;
let jeetPreventTime;
let blockTime;
let jeetState;
let countTime;
let mutableTime;
let jeetCount;
require('dotenv').config();

const app = express();

app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Express on Vercel");
});

app.get('/getTotalData', async (req, res) => {
  res.json({
    tradingState,
    jeetState,
    countTime,
    jeetCount
  });
})

const getDataFromContract = async () => {
  const web3 = new Web3(new Web3.providers.HttpProvider(process.env.RPC_URL));
  const tokenContract = new web3.eth.Contract(_abi, process.env.CONSTRACT_ADDRESS);

  tradingState = await tokenContract.methods.tradingState().call();
  
  jeetCount = await tokenContract.methods.jeetCount().call();
  jeetState = await tokenContract.methods.getJeetState().call();

  blockTime = await tokenContract.methods.getTimeStamp().call();
  const _jeetPreventTime = await tokenContract.methods.jeetPreventTime().call();
  if (!jeetState && _jeetPreventTime !== jeetPreventTime) {
    mutableTime = Date.now() + (_jeetPreventTime - blockTime) * 1000;
  }
  jeetPreventTime = _jeetPreventTime;
  countTime = mutableTime - Date.now();
  if(countTime < 0) countTime = 0;
}

const interval = setInterval(getDataFromContract, 1000);

module.exports = app;
