import { Space, Center, Paper, Text, Divider } from "@mantine/core";
export const Settings = () => {
  return (
    <>
      <Divider
        my="xs"
        label={
          <>
            <Text fw={444} fz="xl">
              Settings
            </Text>
          </>
        }
        labelPosition="center"
      />
      <Space h="xl" />
      <Center>
        <Paper shadow="xl" radius="lg" p="xl" withBorder>
          <Text
            size="xl"
            variant="gradient"
            gradient={{ from: "indigo", to: "cyan", deg: 45 }}
          >
            Coming soon
          </Text>
        </Paper>
      </Center>
      <Space h={222} />
    </>
  );
};
