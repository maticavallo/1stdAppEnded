
import React, { useEffect, useState } from "react";
import "./Coin.css";
import { Button } from "web3uikit";
const ethers = require("ethers");
const  {
  abi: contractAbi
} = require("../artifacts/contract/MarketSentiment.sol");

const dotEnv = require("dotenv");

const rpcUrl = process.env.POLYGON_MUMBAI;
dotEnv.config();

function Coin({ perc, getSentiment, pollvotes, setModalToken, setVisible }) {
  const [color, setColor] = useState();
  
  const { isAuthenticated} = pollvotes();

  useEffect(() => {
    if (perc < 50) {
      setColor("#c43d08");
    } else {
      setColor("green");
    }
  }, [perc]);

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

  return (
    <>
      <div>
        <div className="token">{}</div>
        <div className="circle" style={{ boxShadow: `0 0 20px ${color}` }}>
          <div
            className="wave"
            style={{
              marginTop: `${100 - perc}%`,
              boxShadow: `0 0 20px ${color}`,
              backgroundColor: color,
            }}
          ></div>
          <div className="percentage">{perc}%</div>
        </div>

        <div className="votes">
          <Button 
            onClick={() => {
              if(isAuthenticated){
                
              }else{
                alert("Authenicate to Vote")
              }}} 
            text="Up" 
            theme="primary" 
            type="button" 
          />

          <Button
            color="red"
            onClick={() => {
              if(isAuthenticated){
                
              }else{
                alert("Authenicate to Vote")
              }}}
            text="Down"
            theme="colored"
            type="button"
          />
        </div>
        <div className="votes">
        </div>
      </div>      
    </>
  )

}

export default Coin;
*/
