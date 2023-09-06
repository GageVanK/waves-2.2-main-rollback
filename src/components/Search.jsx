import { ActionIcon, Modal, Button, TextInput, Space, useMantineTheme, Text } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";
import { getSingleProfile } from "deso-protocol";
import { useNavigate } from "react-router";

export const Search = (props: TextInputProps) => {
  const [opened, { open, close }] = useDisclosure(false);
  const [value, setValue] = useState("");
  const [userNotFound, setuserNotFound] = useState(false);
  const navigate = useNavigate();
  const theme = useMantineTheme();
  const SearchUser = async () => {
    const request = {
      Username: value,
      NoErrorOnMissing: true,
    };

    const response = await getSingleProfile(request);

    if (response === null) {
      setuserNotFound(true);
      return;
    }

    const state = {
      userPublicKey: response.Profile.PublicKeyBase58Check,
      userName: response.Profile.Username
        ? response.Profile.Username
        : response.Profile.PublicKeyBase58Check,
      description: response.Profile.Description
        ? response.Profile.Description
        : null,
      largeProfPic:
        response.Profile.ExtraData &&
        response.Profile.ExtraData.LargeProfilePicURL
          ? response.Profile.ExtraData.LargeProfilePicURL
          : null,
      featureImage:
        response.Profile.ExtraData &&
        response.Profile.ExtraData.FeaturedImageURL
          ? response.Profile.ExtraData.FeaturedImageURL
          : null,
    };

    setuserNotFound(false)

    navigate(`/wave/${response.Profile.Username}`, {
      state,
    });
  };

  return (
    <>
      
        <TextInput
          value={value}
          onChange={(event) => setValue(event.currentTarget.value)}
          radius="xl"
      size="md"
          placeholder="Search DeSo Username"
          variant="filled"
          error={userNotFound ? userNotFound : null}
          withAsterisk
        
          rightSection={
            <ActionIcon onClick={() => {
              SearchUser();
            }} size={32} radius="xl" color={theme.primaryColor} variant="light">
              {theme.dir === 'ltr' ? (
                <IconSearch size="1.1rem" stroke={1.5} />
              ) : (
                <IconSearch size="1.1rem" stroke={1.5} />
              )}
            </ActionIcon>
          }
          rightSectionWidth={42}
          {...props}
        />

        
   
    </>
  );
};
