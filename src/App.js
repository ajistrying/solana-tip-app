import { useMemo } from 'react';
import { VStack, Divider, Text, Link } from "@chakra-ui/react"
import { ExternalLinkIcon } from "@chakra-ui/icons"

import { clusterApiUrl } from '@solana/web3.js';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  getLedgerWallet,
  getPhantomWallet,
  getSlopeWallet,
  getSolflareWallet,
  getSolletExtensionWallet,
  getSolletWallet,
  getTorusWallet,
} from '@solana/wallet-adapter-wallets';

import { TipModal } from './components/TipModal';
import { Wallet } from './components/Wallet';

function App() {

  // Can be set to 'devnet', 'testnet', or 'mainnet-beta'
  const network = WalletAdapterNetwork.Mainnet;

  // You can also provide a custom RPC endpoint
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  // @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking --
  // Only the wallets you configure here will be compiled into your application
  const wallets = useMemo(() => [
    getPhantomWallet(),
    getSlopeWallet(),
    getSolflareWallet(),
    getTorusWallet({
        options: { clientId: 'Get a client ID @ https://developer.tor.us' }
    }),
    getLedgerWallet(),
    getSolletWallet({ network }),
    getSolletExtensionWallet({ network }),
  ], [network]);
  
  return ( 
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <VStack spacing={4}>
          <TipModal/>
          <Wallet/>
          <Divider width="50vw"/>
          <Text fontSize="lg">
            Built with โค๏ธ by <Link href="https://twitter.com/wellingtonajo" isExternal> Wellington A Johnson II <ExternalLinkIcon mx="1px" /> </Link>
          </Text>
          <Text fontSize="lg">
          ๐๐พFeel free to tip me as well!๐๐พ
          </Text>
          <Text>
            EsXzHx68MCcv4TKzpgu35DUnJ691JZVofKm6LrvhFNNQ
          </Text>
        </VStack>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;
