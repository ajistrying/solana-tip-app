import React, {useEffect, useState} from 'react';
import {  Alert, AlertIcon, AlertTitle, AlertDescription, CloseButton, Text, Button, IconButton, NumberInput, NumberInputField, Input, Flex, VStack } from "@chakra-ui/react"
import { SearchIcon, CheckIcon, EditIcon, AddIcon } from '@chakra-ui/icons'
import { useConnection, useWallet } from '@solana/wallet-adapter-react';

import { PublicKey } from '@solana/web3.js';

export const TipModal = () => {

  const [walletAddress, setWalletAddress ] = useState(null);
  const [tipValue, setTipValue] = useState(0.05);
  const [ addressToSearch, setAddressToSearch ] = useState("");
  const [ addressSearchError, setAddressSearchError] = useState("");
  const [ isAddressSearchErrorSet, setIsAddressSearchErrorSet] = useState(false);
  const [ didFindAddress, setDidFindAddress ] = useState(false);
  const [ didConfirmSolAmount, setDidConfirmSolAmount] = useState(false);

  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  useEffect(() => {
    if(publicKey) {
      setWalletAddress(publicKey.toString())
    }
  },[publicKey]);

  const parseValue = (tipValue) => {
    Number(tipValue)
  }

  const editAddress = () => {
    setDidFindAddress(false);
    setDidConfirmSolAmount(false);
  }

  const editConfirmedSolAmount = () => {
    setDidConfirmSolAmount(false);
  }

  const searchForAddress = async () => {
    try {
      const searchablePubKey = new PublicKey(addressToSearch);
      const accountInfo = await connection.getAccountInfo(searchablePubKey);
      if(addressToSearch && accountInfo) {
        setDidFindAddress(true);
        setIsAddressSearchErrorSet(false)
        setAddressSearchError("");
      }
    } catch (error) {
      setIsAddressSearchErrorSet(true)
      setAddressSearchError(`${error}`)
    }
   
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
            onChange={(valueString) => setTipValue(parseValue(valueString))}
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
            onClick={() => {setDidConfirmSolAmount(tipValue)}}
          >
          Confirm Amount
          </Button>
        }

        { didConfirmSolAmount &&
          <>
            <Text fontSize="xl">Step 3: Tip away!</Text>
            <Button 
              ml="2" 
              colorScheme="teal" 
              variant="outline"
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

// TODO: Implement friendly user errors for sol input field
// TODO: Look at potentially adding in a step counter to the sol amount input
// TODO: Implement Tip Solana functionality
