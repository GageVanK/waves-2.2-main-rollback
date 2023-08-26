import { Space, Center, Badge, Text, Divider } from "@mantine/core";
import { DeSoIdentityContext } from "react-deso-protocol";
import { useContext } from "react";

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
            <Center>
              <Badge
                size="md"
                radius="sm"
                variant="gradient"
                gradient={{ from: "indigo", to: "cyan", deg: 45 }}
              >
                Login to pay 50% less in fees
              </Badge>
            </Center>
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
