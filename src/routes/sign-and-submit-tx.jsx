import {
  updateProfile,
  identity,
  submitPost,
  getSingleProfile,
  uploadImage,
} from "deso-protocol";
import {
  useContext,
  useRef,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { RiImageAddFill } from "react-icons/ri";

import {
  Button,
  Center,
  Space,
  Paper,
  Text,
  Textarea,
  Group,
  Loader,
  Avatar,
  Container,
  Tooltip,
  Badge,
  TextInput,
  FileButton,
  ActionIcon,
  Image,
} from "@mantine/core";
import { getDisplayName } from "../helpers";
import { DeSoIdentityContext } from "react-deso-protocol";
import { Welcome } from "../components/Welcome";
import { useCreateAsset, useAssetMetrics, Player } from "@livepeer/react";
import { Asset } from "../components/VideoUpload";
import { useDropzone } from "react-dropzone";
import { IconCheck } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";

export const SignAndSubmitTx = () => {
  const { currentUser, isLoading } = useContext(DeSoIdentityContext);
  const [newUsername, setNewUsername] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [imageURL, setImageURL] = useState("");

  const handleUploadImage = async () => {
    try {
      const response = await uploadImage({
        UserPublicKeyBase58Check: currentUser.PublicKeyBase58Check,
        file: imageFile,
      });

      setImageURL(response.ImageURL);
      console.log(response);
    } catch (error) {
      console.log("Something happened: " + error);
    }
  };

  useEffect(() => {
    if (imageFile) {
      handleUploadImage(); // Automatically trigger upload when imageFile is set
    }
  }, [imageFile]); // This effect runs whenever imageFile changes

  const handleUpdateUsername = async () => {
    try {
      await updateProfile({
        UpdaterPublicKeyBase58Check: currentUser.PublicKeyBase58Check,
        ProfilePublicKeyBase58Check: "",
        NewUsername: newUsername,
        MinFeeRateNanosPerKB: 1000,
        NewCreatorBasisPoints: 100,
        NewDescription: "",
        NewStakeMultipleBasisPoints: 12500,
      });
    } catch (error) {
      console.log("something happened: " + error);
    }

    window.location.reload();
  };

  const formRef = useRef(null);

  if (isLoading) {
    return (
      <Center>
        <Loader variant="bars" />
      </Center>
    );
  }

  if (!currentUser || !currentUser.BalanceNanos) {
    return (
      <>
        <Welcome />
        <Space h="md" />

        <Container size="30rem" px={0}>
          <Paper m="md" shadow="lg" radius="sm" p="xl" withBorder>
            <Group>
              <Avatar size="md" radius="xl" alt="Profile Picture" />
              <Text fz="lg" fw={777} variant="gradient" truncate></Text>
            </Group>
            <Space h="sm" />
            <Textarea
              disabled
              name="body"
              radius="md"
              autosize
              placeholder="Login or Sign Up to Create!"
              variant="filled"
              size="md"
            />
            <Space h="sm" />
            <Group postion="apart">
              <Tooltip label="Login or Sign Up to Create!">
                <Button
                  raduis="sm"
                  data-disabled
                  sx={{ "&[data-disabled]": { pointerEvents: "all" } }}
                  onClick={(event) => event.preventDefault()}
                >
                  Create
                </Button>
              </Tooltip>
            </Group>
          </Paper>
        </Container>
      </>
    );
  } else {
    if (currentUser.ProfileEntryResponse === null) {
      return (
        <>
          <Paper m="md" shadow="lg" radius="sm" p="xl" withBorder>
            <Center>
              <Badge
                size="md"
                radius="sm"
                variant="gradient"
                gradient={{ from: "indigo", to: "cyan", deg: 45 }}
              >
                Enter Username
              </Badge>

              <Space h="xs" />
            </Center>
            <Group position="center" grow>
              <TextInput
                type="text"
                label="Username"
                value={newUsername}
                placeholder="New username"
                onChange={async (e) => {
                  setNewUsername(e.target.value);
                  e.preventDefault();

                  let regex = /^[a-zA-Z0-9_]*$/;
                  if (!regex.test(e.target.value)) {
                    setErrorMessage(
                      "Username cannot contain special characters"
                    );
                    setIsButtonDisabled(true);
                  } else {
                    setErrorMessage("");

                    try {
                      const request = {
                        PublicKeyBase58Check: "",
                        Username: e.target.value,
                        NoErrorOnMissing: true,
                      };

                      try {
                        const userFound = await getSingleProfile(request);

                        if (userFound === null) {
                          setErrorMessage("");
                          setIsButtonDisabled(false);
                        } else {
                          setErrorMessage("Username is not available");
                          setIsButtonDisabled(true);
                        }
                      } catch (error) {
                        setIsButtonDisabled(true);
                        setErrorMessage("");
                      }
                    } catch (error) {
                      console.log(error);
                    }
                  }
                }}
                error={errorMessage}
              />
            </Group>

            <Space h="sm" />

            <Group position="right">
              <Button
                disabled={isButtonDisabled}
                onClick={handleUpdateUsername}
              >
                Update
              </Button>
            </Group>
          </Paper>
        </>
      );
    } else {
      return (
        <>
          <Container size="30rem" px={0}>
            <Paper m="md" shadow="lg" radius="sm" p="xl" withBorder>
              <form
                ref={formRef}
                onSubmit={async (e) => {
                  e.preventDefault();
                  const form = formRef.current;

                  // check if the user can make a post
                  if (
                    !identity.hasPermissions({
                      TransactionCountLimitMap: {
                        SUBMIT_POST: 1,
                      },
                    })
                  ) {
                    // if the user doesn't have permissions, request them
                    // and abort the submit
                    identity.requestPermissions({
                      GlobalDESOLimit: 10000000, // 0.01 DESO
                      TransactionCountLimitMap: {
                        SUBMIT_POST: 3,
                      },
                    });
                    return;
                  }

                  const body = form.elements.body.value;

                  await submitPost({
                    UpdaterPublicKeyBase58Check:
                      currentUser.PublicKeyBase58Check,
                    BodyObj: {
                      Body: body,
                      ImageURLs: imageURL ? [imageURL] : [],
                      VideoURLs: [],
                    },
                  }).then((resp) => {
                    notifications.show({
                      title: "Success",
                      icon: <IconCheck size="1.1rem" />,
                      color: "green",
                      message: "Post was successfully submitted!",
                    });
                  });

                  // Reset the form after submission
                  form.reset();
                }}
              >
                <Group>
                  <Avatar
                    size="lg"
                    radius="xl"
                    src={`https://node.deso.org/api/v0/get-single-profile-picture/${currentUser?.PublicKeyBase58Check}`}
                    alt="Profile Picture"
                  />
                  <Text fz="lg" fw={777} variant="gradient" truncate>
                    {getDisplayName(currentUser)}
                  </Text>
                </Group>
                <Space h="sm" />
                <Textarea
                  name="body"
                  radius="md"
                  autosize
                  placeholder="Let them hear your voice!"
                  variant="filled"
                  size="md"
                />
                <Space h="sm" />
                {imageURL && (
                  <div>
                    <p>Uploaded Image:</p>
                    <Image
                      src={imageURL}
                      alt="Uploaded"
                      maw={240}
                      mx="auto"
                      radius="md"
                    />
                  </div>
                )}
                <Group postion="apart">
                  <Button
                    variant="gradient"
                    gradient={{ from: "cyan", to: "indigo" }}
                    raduis="sm"
                    type="submit"
                  >
                    Create
                  </Button>

                  <FileButton
                    onChange={setImageFile}
                    accept="image/png,image/jpeg"
                  >
                    {(props) => (
                      <Tooltip label="Upload Image">
                        <ActionIcon
                          color="blue"
                          size="lg"
                          variant="default"
                          {...props}
                        >
                          <RiImageAddFill size="1.2rem" />
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </FileButton>
                </Group>
              </form>
            </Paper>
          </Container>
        </>
      );
    }
  }
};
