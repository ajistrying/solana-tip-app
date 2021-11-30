import React from 'react';
import {
    WalletModalProvider,
    WalletDisconnectButton,
    WalletMultiButton
} from '@solana/wallet-adapter-react-ui';

import { VStack } from "@chakra-ui/react"

// Default styles that can be overridden by your app
require('@solana/wallet-adapter-react-ui/styles.css');

export const Wallet = () => {

    return (
        <WalletModalProvider>
            <VStack spacing={4}>
                <WalletMultiButton />
                <WalletDisconnectButton />
            </VStack>
        </WalletModalProvider>
    );
};