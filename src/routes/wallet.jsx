import {
  Space,
  Center,
  Button,
  Text,
  Divider,
  Container,
  Paper,
  Group, 
  CopyButton, 
  ActionIcon, Tooltip, Avatar
} from "@mantine/core";
import { DeSoIdentityContext } from "react-deso-protocol";
import { useContext, useEffect ,useState } from "react";
import { GiWaveCrest } from "react-icons/gi";
import { identity, getSingleProfile, getExchangeRates } from "deso-protocol";
import { IconCheck, IconKey } from '@tabler/icons-react';

export const Wallet = () => {
  // Using DeSoIdentityContext from DeSo
  // https://github.com/deso-protocol/react-deso-protocol
  const { currentUser, isLoading } = useContext(DeSoIdentityContext);
  const [userDesoBalance, setUserDesoBalance] = useState(0); 
  const [usdBalance, setUsdBalance] = useState(0);
  const [desoPrice, setDesoPrice] = useState(0);
  const nanosPerDeSo = 0.000000001
  
  const getBalance = async () => {
   
console.log(currentUser)
  const nanosBalance = currentUser.BalanceNanos;
  const desoBalance = nanosBalance * nanosPerDeSo;
  const roundedDesoBalance = Math.round(desoBalance * 100) / 100;

  setUserDesoBalance(roundedDesoBalance)

  const exchangeRateData = await getExchangeRates({
    PublicKeyBase58Check: currentUser.PublicKeyBase58Check,
  });



  const desoPriceInDollars = exchangeRateData.USDCentsPerDeSoCoinbase / 100;
  setDesoPrice(desoPriceInDollars);  

  const usdCentsPerDeSoExchangeRate = exchangeRateData.USDCentsPerDeSoCoinbase;
  
  
  const usdBalance = (desoBalance * usdCentsPerDeSoExchangeRate) / 100;
  const roundedUsdBalance = Math.round(usdBalance * 100) / 100;
  setUsdBalance(roundedUsdBalance);
  }
 
useEffect(() => {
 
    getBalance();

}, []);

  return (
    <>
      <Divider
        my="xs"
        label={
          <>
            <Text fw={444} fz="xl">
              Wallet
            </Text>
          </>
        }
        labelPosition="center"
      />
      <Space h="xl" />
      <div>
        {currentUser ? (
          <>
          <Center>
           <Paper shadow="xl" p="lg" withBorder>
            <Group>
           <Avatar
                mx="auto"
               
                src={
                  `https://node.deso.org/api/v0/get-single-profile-picture/${currentUser.PublicKeyBase58Check}` ||
                  null
                }
                alt="Profile Picture"
              />
      <Text fw={700} c='dimmed'> {currentUser.ProfileEntryResponse.Username}'s Wallet</Text>
           <CopyButton value={currentUser.PublicKeyBase58Check} timeout={2000}>
      {({ copied, copy }) => (
        <Tooltip label={copied ? 'Copied' : 'Copy Your Public Key'} withArrow position="right">
          <ActionIcon color={copied ? 'teal' : 'gray'} onClick={copy}>
            {copied ? <IconCheck size="1rem" /> : <IconKey size="1rem" />}
          </ActionIcon>
        </Tooltip>
      )}
    </CopyButton>
    </Group>
    <Space h='xs'/>
    <Paper shadow="xl" p="lg" withBorder>
           <Text fz="xl" align='center'>Your Balance</Text>
           <Divider my="sm" />
        
        
           
           <Space h='xs'/>
            <Text fw={500} c='dimmed' align='center' >{userDesoBalance} $DESO = ${usdBalance} USD</Text>
            <Space h='lg'/>
            <Divider size="xl" orientation="vertical" />
            <Space h='lg'/>
            <Text fz="xl" align='center'>$DESO Exchange Rate</Text>
          <Divider my="sm" />
          <Space h='xs'/>
          <Text fw={500} c='dimmed' align='center'>1 $DESO = ${desoPrice} USD</Text>
          </Paper>
            </Paper>
            <Space w='xs'/>

         
          </Center>
          <Space h='md'/>
          <iframe
            title="heroswap"
            width="100%"
            style={{
              border: "none",
              borderRadius: "22px",
              minHeight: "60vh",
            }}
            src={`https://heroswap.com/widget?affiliateAddress=${currentUser.PublicKeyBase58Check}`}
          />
        </>
        ) : (
          <>
            <Space h="xl" />
            <Container size="30rem" px={0}>
              <Paper shadow="xl" p="lg" withBorder>
                <Center>
                  <Text c="dimmed" fw={700}>
                    Please Sign Up or Login to view your Wallet.
                  </Text>
                </Center>
                <Space h="xs" />
                <Center>
                  <Text size="sm"  fw={555}>
                    HeroSwap can be used Anonymously or Login to save 50% in fees.
                  </Text>
                </Center>
                <Space h="md" />
                <Center>
                  <Button
                    fullWidth
                    leftIcon={<GiWaveCrest size="1rem" />}
                    variant="gradient"
                    gradient={{ from: "cyan", to: "indigo" }}
                    onClick={() => identity.login()}
                  >
                    Sign Up
                  </Button>
                  <Space w="xs" />
                  <Button
                    fullWidth
                    variant="default"
                    onClick={() => identity.login()}
                  >
                    Login
                  </Button>
                </Center>
              </Paper>
            </Container>
            <Space h="md" />
            <iframe
              title="heroswap"
              width="100%"
              style={{
                border: "none",
                borderRadius: "22px",
                minHeight: "50vh",
              }}
              src="https://heroswap.com/widget?affiliateAddress=BC1YLfjx3jKZeoShqr2r3QttepoYmvJGEs7vbYx1WYoNmNW9FY5VUu6"
            />
          </>
        )}
      </div>
      <Space h={222} />
    </>
  );
};
