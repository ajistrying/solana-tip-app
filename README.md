# Welcome to the Solana Tip App!

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

I leveraged the [solana/wallet-adapter](https://github.com/solana-labs/wallet-adapter) and [solana/web3.js](https://github.com/solana-labs/solana-web3.js) packages in order to create this app as well, so shoutout to everyone who worked on those two libraries to make working with common solana api functionality in javascript possible/ a breeze!

## Motivation
I'm a hands-on learner, and when I first heard about Solana, I knew I had to build something around it in order to best understand it. This is the first project that came to mind once I understood the tools that were avialable to me.

I'm open sourcing this in the spirit of mst web3 projects being open sourced, although I wouldn't consider this a biug web3 project, its a start!

## Usage
1. Clone the repo into your fav directory and run `yarn start`
2. When you've pulled the code down, make sure you have two solana wallets to test with, and make sure to change the network to 'devnet'! This is located in the App.js file at:
`const network = WalletAdapterNetwork.Devnet;`
For reference, the full list of options is: 'Devnet', 'Testnet', or 'Mainnet'.
3. Have fun tipping!



_** Note: Solana's mainnet is still in beta at the time of this writing, due to the nature of this new technology evolving, I'll try my best to keep this updated, but make sure you know where you are sending your solana at all time, double and triple check the address/addresses you are sending to!!!! **_



