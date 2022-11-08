const ethers = require("ethers");
const {
  abi: contractAbi
} = require("../artifacts/contracts/MarketSentiment.sol/MarketSentiment.json");
const dotEnv = require("dotenv");
dotEnv.config();

const rpcUrl = process.env.POLYGON_MUMBAI;

function getSentiment(upvotesBn, downvotesBn) {
  const sentimentBn = upvotesBn
    .mul(1000)
    .div(upvotesBn.add(downvotesBn));
  return `${ethers.utils.formatUnits(sentimentBn, 1)}%`
}

async function pollvotes(contractAddr, ticker) {
  console.log("rpcUrl", rpcUrl);
  const rpcProvider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const contractInstance = new ethers.Contract(contractAddr, contractAbi, rpcProvider);

  const [upvotes, downvotes] = await contractInstance.getVotes(ticker);
  const totalVotes = upvotes.add(downvotes);

  if (totalVotes.gt(0)) {
    const sentimentText = getSentiment(upvotes, downvotes);
    console.log(`Current sentiment for ticker ${ticker} is ${sentimentText} with ${totalVotes.toString()} total votes`);
  } else {
    console.log('No votes so far');
  }

  contractInstance.on('tickerupdated', (eventUpvotes, eventDownvotes, eventVoter, eventTicker) => {
    if (eventTicker === ticker) {
      const totalVotes = eventUpvotes.add(eventDownvotes);
      const sentimentText = getSentiment(eventUpvotes, eventDownvotes);
      console.log(`Current sentiment for ticker ${ticker} is ${sentimentText} with ${totalVotes.toString()} total votes`);
    }
  });

  await new Promise(() => {});

}

const marketSentimentContractAddr = process.argv[2];
const tickerToPoll = process.argv[3];

pollvotes(marketSentimentContractAddr, tickerToPoll);
