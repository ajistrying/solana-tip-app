import React, {useEffect, useState} from 'react';
import {  Alert, AlertIcon, Link, 
  AlertTitle, AlertDescription, 
  CloseButton, Container, 
  Text, Button, IconButton, 
  NumberInput, NumberInputField, 
  Input, Flex, Spinner, VStack } from "@chakra-ui/react"
import { SearchIcon, CheckIcon, EditIcon, AddIcon, RepeatIcon, ExternalLinkIcon } from '@chakra-ui/icons'
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletAlert } from "./WalletAlert";
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL, Transaction } from '@solana/web3.js';

export const TipModal = () => {

  const SOL_WALLET_LENGTH = 44;
  const NETWORK = "devnet"

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

  //Tip Action Validation
  const [ isTipActionErrorSet, setIsTipActionErrorSet ] = useState(false);
  const [ tipActionError, setTipActionError ] = useState("");

  // App Loading State
  const [ isTipProcessLoading, setIsTipProcessLoading ] = useState(false);

  // Successful Tip State
  const [ isTipProcessCompleted, setIsTipProcessCompleted ] = useState(false);
  const [ transactionSignature, setTransactionSignature] = useState("")

  // Hooks
  const { connection } = useConnection();
  const { publicKey, signTransaction, wallet } = useWallet();

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

      if(publicKey == addressToSearch) {
        throw new Error("Cannot send to the same wallet you're connected to!")
      }

      const accountInfo = await connection.getAccountInfo(searchablePubKey);

      if(addressToSearch && accountInfo && addressToSearch.length === SOL_WALLET_LENGTH) {
        setDidFindAddress(true);
        setIsAddressSearchErrorSet(false);
        setAddressSearchError("");
      } else if(addressToSearch.length !== SOL_WALLET_LENGTH) {
        throw new Error("Invalid wallet address, please try again")
      } else if(accountInfo === null) {
        throw new Error("You may be searching a newly created wallet, please try another or activate that wallet!")
      }
    } catch (error) {
      setIsAddressSearchErrorSet(true)
      setAddressSearchError(`${error.message}`)
    }
   
  }

  const performTip = async (sendingAddress, amount_in_sol, receivingAddress) => {

    try {

      setIsTipProcessLoading(true);

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
      
      // Request the sender to sign the transaction, returns a Transaction object
      let signedTransaction = await signTransaction(transaction);

      // Send a transaction that has already been signed and serialized into the wire format
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());

      // Confirm whether the transaction went through or not
      await connection.confirmTransaction(signature);

      setIsTipProcessLoading(false);
      setIsTipProcessCompleted(true);
      setTransactionSignature(signature);

    } catch (error) {
      setIsTipProcessLoading(false);
      setIsTipProcessCompleted(false);
      setIsTipActionErrorSet(true);
      setTipActionError(`${error.message}`);
    }
    
  }

  const resetTipProcess = () => {
    setIsTipProcessCompleted(false);
    setIsTipProcessLoading(false);
    setIsTipActionErrorSet(false);
    setIsSolAmountErrorSet(false);
    setDidConfirmSolAmount(false);
    setDidFindAddress(false);
    setIsAddressSearchErrorSet(false);
    setAddressToSearch("");
    setTransactionSignature("");
  }

  return (
    <>
      {isTipProcessCompleted ?
        <>
        <VStack>
          <Text fontSize="6xl">Success!</Text>
          <Button size='md' colorScheme='teal' variant='outline'>
            <Link fontSize='xl' href={`https://explorer.solana.com/tx/${transactionSignature}?cluster=${NETWORK}`} isExternal>
              View your confirmed payment on Solana Explorer <ExternalLinkIcon mx='2px' />
            </Link>
          </Button>
          <Button 
            ml="2" 
            px="6"
            rightIcon={<RepeatIcon />} 
            colorScheme="teal" 
            variant="outline"
            onClick={resetTipProcess}
          >
            Tip More Solana
          </Button>

        </VStack>
        </>
        :
        <>
          {isTipProcessLoading ? 
            <Container pt="20" maxW="xl" centerContent>
              <Spinner size="xl" />
            </Container>
            :
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
                  {wallet ?
                    <>
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
                      <Alert 
                        status="info"
                        alignItems="center"
                        justifyContent="center"
                        textAlign="center"
                        width="300px"
                        borderRadius="md"
                      >
                        <AlertIcon />
                        Min Tip: 0.05
                        Max Tip: 50
                      </Alert>
      
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
                        <Alert status="error" borderRadius="md">
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
                          {isTipActionErrorSet &&
                            <Alert status="error" borderRadius="md">
                              <AlertIcon />
                              <AlertTitle mr={2}>Error: </AlertTitle>
                              <AlertDescription mr={8} >{tipActionError}</AlertDescription>
                              <CloseButton 
                                position="absolute" 
                                right="8px" 
                                top="8px"
                                onClick={() => {
                                    setTipActionError("");
                                    setIsTipActionErrorSet(false);
                                  }
                                }
                              />
                            </Alert>
                          }
                        </>
                      }
                    </>
                  : 
                    <WalletAlert/>
                  }
                </>
              }
            </VStack>
          }
        </>
      }
    </>
  )
}
