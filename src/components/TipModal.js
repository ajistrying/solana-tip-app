import React, {useEffect, useState} from 'react';
import {  Alert, AlertIcon, AlertTitle, AlertDescription, CloseButton, Text, Button, IconButton, NumberInput, NumberInputField, Input, Flex, VStack } from "@chakra-ui/react"
import { SearchIcon, CheckIcon, EditIcon, AddIcon } from '@chakra-ui/icons'
import { useConnection, useWallet } from '@solana/wallet-adapter-react';

import { PublicKey, SystemProgram, LAMPORTS_PER_SOL, Transaction } from '@solana/web3.js';

export const TipModal = () => {

  const SOL_WALLET_LENGTH = 44;

  const [walletAddress, setWalletAddress ] = useState(null);

  // Solana wallet address validation state management
  const [ addressToSearch, setAddressToSearch ] = useState("");
  const [ addressSearchError, setAddressSearchError] = useState("");
  const [ isAddressSearchErrorSet, setIsAddressSearchErrorSet] = useState(false);
  const [ didFindAddress, setDidFindAddress ] = useState(false);
  

  // Sol amount input validation
  const [ tipValue, setTipValue ] = useState(0.05);
  const [ didConfirmSolAmount, setDidConfirmSolAmount] = useState(false);
  const [ solAmountError, setSolAmountError ] = useState("");
  const [ isSolAmountErrorSet, setIsSolAmountErrorSet ] = useState(false);


  // Hooks
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useWallet();

  useEffect(() => {
    if(publicKey) {
      const publicKeyString = publicKey.toString();
      setWalletAddress(publicKeyString);
    }
  },[publicKey]);


  // Custom utility functions
  const validateTipValue = (amount) => {

    const parsedAmount = Number(amount);

    if(parsedAmount < 0.05) {
      setIsSolAmountErrorSet(true);
      setSolAmountError("Entered amount is too low, must be above 0.05 SOL");
    } else if(parsedAmount > 50) {
      setIsSolAmountErrorSet(true);
      setSolAmountError("Entered amount is too high, must be below 50 SOL");
    } else {
      setIsSolAmountErrorSet(false);
      setSolAmountError("");
      setDidConfirmSolAmount(true);
      setTipValue(amount);
    }
  }

  const editAddress = () => {
    setDidFindAddress(false);
    setDidConfirmSolAmount(false);
    setIsSolAmountErrorSet(false);
  }

  const editConfirmedSolAmount = () => {
    setDidConfirmSolAmount(false);
  }

  const searchForAddress = async () => {
    try {
      setTipValue(0.05);
      const searchablePubKey = new PublicKey(addressToSearch);
      const accountInfo = await connection.getAccountInfo(searchablePubKey);
      if(addressToSearch && accountInfo && addressToSearch.length === SOL_WALLET_LENGTH) {
        setDidFindAddress(true);
        setIsAddressSearchErrorSet(false);
        setAddressSearchError("");
      } else if(addressToSearch.length !== SOL_WALLET_LENGTH) {
        throw new Error("Invalid wallet address")
      }
    } catch (error) {
      setIsAddressSearchErrorSet(true)
      setAddressSearchError(`${error.message}, please try again`)
    }
   
  }

  
  const performTip = async (sendingAddress, amount_in_sol, receivingAddress) => {

    const senderAddress = new PublicKey(sendingAddress);

    // Create the transfer instructions 
    const transactionInstruction = SystemProgram.transfer(
      {
        fromPubkey: senderAddress,
        lamports: amount_in_sol * LAMPORTS_PER_SOL,
        toPubkey: new PublicKey(receivingAddress)
      }
    );

    // Initialize a new transaction instance and add the instructions to it 
    const transaction = new Transaction().add(transactionInstruction);

    // Set transaction variables
    transaction.feePayer = senderAddress;
    transaction.recentBlockhash = await (await connection.getRecentBlockhash()).blockhash;

    transaction ? console.log('transaction created successfully') : console.log('transaction created unsuccessfully');
    
    // Request the sender to sign the transaction, returns a Transaction object
    let signedTransaction = await signTransaction(transaction)

    signedTransaction ? console.log('signed transaction created successfully') : console.log('signed transaction created unsuccessfully');

    // Send a transaction that has already been signed and serialized into the wire format
    const signature = await connection.sendRawTransaction(signedTransaction.serialize());

    // Confirm whether the transaction went through or not
    await connection.confirmTransaction(signature);
    
  }

  return (
  <VStack 
    spacing={4}
    pt="10"
  >
    <Text fontSize="3xl">Tip Someone Some Solana!</Text>
    <Text fontSize="xl">Step 1: Enter a solana address</Text>
    <VStack>
      <Flex>
        <Input 
          variant="outline" 
          placeholder="Enter an address" 
          value={addressToSearch}
          disabled={didFindAddress ? true : false}
          onChange={event => {
            event.preventDefault();
            setAddressToSearch(event.target.value)}
          }
        />
        {didFindAddress ? 
          <IconButton
            ml="2"
            aria-label="Found address" 
            colorScheme="teal" 
            variant="outline" 
            disabled="true" 
            icon={<CheckIcon />} 
          /> : 
          <Button 
            ml="2" 
            px="6"
            rightIcon={<SearchIcon />} 
            colorScheme="teal" 
            variant="outline"
            onClick={searchForAddress}
          >
          Find
          </Button>
        }
      </Flex>
      { didFindAddress && 
        <Button 
          ml="2" 
          px="6"
          rightIcon={<EditIcon />} 
          colorScheme="teal" 
          variant="outline"
          onClick={editAddress}
        >
          Edit Address
        </Button>
      }
      
      {isAddressSearchErrorSet &&
        <Alert status="error">
          <AlertIcon />
          <AlertTitle mr={2}>Error: </AlertTitle>
          <AlertDescription mr={8} >{addressSearchError}</AlertDescription>
          <CloseButton 
            position="absolute" 
            right="8px" 
            top="8px"
            onClick={() => {
              setAddressSearchError("")
              setIsAddressSearchErrorSet(false)
              }
            }
          />
        </Alert>
      }
      
    </VStack>
    {didFindAddress && 
      <>
        <Text fontSize="xl">Step 2: Enter an amount of Sol you'd like to tip</Text>
        <Flex alignItems="center">
          <NumberInput 
            size="md" 
            maxW={24} 
            defaultValue={1} 
            min={0.05}
            max={50}
            disabled={didConfirmSolAmount ? true : false}
            keepWithinRange={false}
            clampValueOnBlur={false}
            onChange={(valueString) => setTipValue(valueString)}
            value={tipValue}
          >
            <NumberInputField/>
          </NumberInput>
          <Text ml="2" fontSize="xl">SOL</Text>
        </Flex>
        <Text fontSize="sm">min: 0.05 max: 50</Text>

        { didConfirmSolAmount ? 
          <Button 
            ml="2" 
            px="6"
            rightIcon={<EditIcon />} 
            colorScheme="teal" 
            variant="outline"
            onClick={() => {editConfirmedSolAmount(null)}}
          >
            Edit Amount
          </Button>
          :
          <Button 
            ml="2" 
            px="6"
            rightIcon={<AddIcon />} 
            colorScheme="teal" 
            variant="outline"
            onClick={() => {
              validateTipValue(tipValue);
            }}
          >
          Confirm Amount
          </Button>
        }

        {isSolAmountErrorSet &&
          <Alert status="error">
            <AlertIcon />
            <AlertTitle mr={2}>Error: </AlertTitle>
            <AlertDescription mr={8} >{solAmountError}</AlertDescription>
            <CloseButton 
              position="absolute" 
              right="8px" 
              top="8px"
              onClick={() => {
                  setSolAmountError("");
                  setIsSolAmountErrorSet(false);
                }
              }
            />
          </Alert>
        }

        { didConfirmSolAmount &&
          <>
            <Text fontSize="xl">Step 3: Tip away!</Text>
            <Button 
              ml="2" 
              colorScheme="teal" 
              variant="outline"
              onClick={() => {
                performTip(walletAddress, tipValue, addressToSearch)
              }}
            >
              Tip Solana
            </Button>
          </>
        }
      </>
    }
  </VStack>
  )
}

// TODO: Look at potentially adding in a step counter to the sol amount input
// TODO: Add in "Made with :heart_emoji: by @wellingtonajo, feel free to tip me sol! - solana address: [solana address here]"
// TODO: Clean up unnecessary log statements
// TODO: Make sure it looks good on mobile????
// TODO: Add in more comments as documentation

