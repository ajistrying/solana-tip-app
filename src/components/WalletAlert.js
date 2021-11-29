import { Alert, AlertIcon, Container } from "@chakra-ui/react"

export const WalletAlert = () => {

  return (
    <Container centerContent>
      <Alert status="warning" borderRadius="md">
        <AlertIcon />
        Please connect a solana wallet to continue with the tipping process
      </Alert>
    </Container>
  )
  
}