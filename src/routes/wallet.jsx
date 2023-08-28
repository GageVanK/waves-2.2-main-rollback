import {
  Space,
  Center,
  Button,
  Text,
  Divider,
  Container,
  Paper,
} from "@mantine/core";
import { DeSoIdentityContext } from "react-deso-protocol";
import { useContext } from "react";
import { GiWaveCrest } from "react-icons/gi";
import { identity } from "deso-protocol";
export const Wallet = () => {
  // Using DeSoIdentityContext from DeSo
  // https://github.com/deso-protocol/react-deso-protocol
  const { currentUser, isLoading } = useContext(DeSoIdentityContext);

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
        ) : (
          <>
            <Space h="xl" />
            <Container size="30rem" px={0}>
              <Paper shadow="xl" p="lg" withBorder>
                <Center>
                  <Text c="dimmed" fw={700}>
                    Please Sign Up or Login to view your Profile.
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
