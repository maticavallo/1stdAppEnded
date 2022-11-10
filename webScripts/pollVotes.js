// Imports Ethers.js library
const ethers = require("ethers");
// Imports Contract ABI from the solidity project
const {
  abi: contractAbi
} = require("../artifacts/contracts/MarketSentiment.sol/MarketSentiment.json");

// Imports dotEnv to get environment variables from the .env file
const dotEnv = require("dotenv");
dotEnv.config();

const rpcUrl = process.env.POLYGON_MUMBAI;

// Function to compute the sentiment percentage in string format based on upvotes and downvotes BigNumbers
function getSentiment(upvotesBn, downvotesBn) {
  const sentimentBn = upvotesBn
    .mul(1000)
    .div(upvotesBn.add(downvotesBn));
  return `${ethers.utils.formatUnits(sentimentBn, 1)}%`
}

async function pollvotes(contractAddr, ticker) {
  console.log("rpcUrl", rpcUrl);

  // Declares the provider to connect directly to the RPC, not through Metamask, so information may also be presented to non-Metamask users
  const rpcProvider = new ethers.providers.JsonRpcProvider(rpcUrl);

  // Connects contract instance for RPC provider
  const contractInstanceForRpc = new ethers.Contract(contractAddr, contractAbi, rpcProvider);

  // Gets current votes status for a particular ticker
  const [upvotes, downvotes] = await contractInstanceForRpc.getVotes(ticker);
  const totalVotes = upvotes.add(downvotes);

  // Only computes and displays sentiment if votes are more than zero, so theres no div by zero
  if (totalVotes.gt(0)) {
    const sentimentText = getSentiment(upvotes, downvotes);
    console.log(`Current sentiment for ticker ${ticker} is ${sentimentText} with ${totalVotes.toString()} total votes`);
  } else {
    console.log('No votes so far');
  }

  // Subscribes to the 'tickerupdated' to display the updated votes
  contractInstanceForRpc.on('tickerupdated', (eventUpvotes, eventDownvotes, eventVoter, eventTicker) => {

    // In this case only events related to this ticker update the display
    if (eventTicker === ticker) {
      const totalVotes = eventUpvotes.add(eventDownvotes);
      const sentimentText = getSentiment(eventUpvotes, eventDownvotes);
      console.log(`Current sentiment for ticker ${ticker} is ${sentimentText} with ${totalVotes.toString()} total votes`);
    }
  });

  // Keeps the command line script executing idly while waiting for events, do not copy to the react project 
  await new Promise(() => {});

}

// Gets the contract address and ticker from the command line argument

const marketSentimentContractAddr = process.argv[2];
const tickerToPoll = process.argv[3];

pollvotes(marketSentimentContractAddr, tickerToPoll);
