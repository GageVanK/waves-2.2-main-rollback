import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { Player } from "@livepeer/react";
import {
  IconHeart,
  IconDiamond,
  IconRecycle,
  IconMessageCircle,
  IconScriptPlus,
  IconScriptMinus,
  IconMessageShare,
  IconScreenShare,
  IconCheck,
  IconHeartHandshake,
  IconX,
} from "@tabler/icons-react";
import { GiWaveCrest } from "react-icons/gi";
import {
  getFollowersForUser,
  getPostsForUser,
  getNFTsForUser,
  getSingleProfile,
  updateFollowingStatus,
  getIsFollowing,
  identity,
  submitPost,
  createPostAssociation,
  sendDiamonds,
  sendDeso,
  getExchangeRates,
} from "deso-protocol";
import {
  Grid,
  Container,
  CopyButton,
  Box,
  Overlay,
  Avatar,
  Paper,
  Group,
  Text,
  Card,
  Space,
  rem,
  Spoiler,
  Modal,
  Center,
  Divider,
  Image,
  Tabs,
  Badge,
  TypographyStylesProvider,
  createStyles,
  ActionIcon,
  Tooltip,
  Button,
  Textarea,
  Collapse,
  UnstyledButton,
  List,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { DeSoIdentityContext } from "react-deso-protocol";
import { RiUserUnfollowLine } from "react-icons/ri";
import { useDisclosure } from "@mantine/hooks";

const useStyles = createStyles((theme) => ({
  comment: {
    padding: `${theme.spacing.lg}px ${theme.spacing.xl}px`,
  },

  body: {
    paddingTop: theme.spacing.sm,
    fontSize: theme.fontSizes.sm,
    wordWrap: "break-word",
  },

  content: {
    "& > p:last-child": {
      marginBottom: 0,
    },
  },

  menuControl: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    border: 0,
    borderLeft: `${rem(1)} solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white
    }`,
  },

  button: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },

  avatar: {
    border: `${rem(2)} solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.white
    }`,
  },
}));

export const Wave = () => {
  const { classes } = useStyles();
  const location = useLocation();
  const { pathname } = location;
  const navigate = useNavigate();
  const userName = pathname.substring(pathname.lastIndexOf("/") + 1);
  const [posts, setPosts] = useState([]);
  const [NFTs, setNFTs] = useState([]);
  const [profile, setProfile] = useState([]);
  const [followerInfo, setFollowers] = useState({ followers: 0, following: 0 });
  const [activeTab, setActiveTab] = useState("first");
  const { currentUser } = useContext(DeSoIdentityContext);
  const [isFollowingUser, setisFollowingUser] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [opened, { open, close }] = useDisclosure(false);

  const [openedSub, { open: openSub, close: closeSub }] = useDisclosure(false);
  // Retrieve the user's DESO balance from profile.DESOBalanceNanos
  const userDESOBalance = profile.DESOBalanceNanos;
  console.log(userDESOBalance);
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileData = await getSingleProfile({
          Username: userName,
          NoErrorOnMissing: true,
        });

        setProfile(profileData.Profile);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchProfile();
  }, [userName]);

  useEffect(() => {
    if (profile) {
      const fetchFollowerInfo = async () => {
        try {
          const following = await getFollowersForUser({
            PublicKeyBase58Check: profile.PublicKeyBase58Check,
          });
          const followers = await getFollowersForUser({
            PublicKeyBase58Check: profile.PublicKeyBase58Check,
            GetEntriesFollowingUsername: true,
          });

          setFollowers({ following, followers });
        } catch (error) {
          console.error("Error fetching follower information:", error);
        }
      };

      fetchFollowerInfo();
    }
  }, [profile]);

  useEffect(() => {
    if (currentUser) {
      const getIsFollowingData = async () => {
        try {
          const result = await getIsFollowing({
            PublicKeyBase58Check: currentUser.PublicKeyBase58Check,
            IsFollowingPublicKeyBase58Check: profile.PublicKeyBase58Check,
          });

          setisFollowingUser(result.IsFollowing);
        } catch (error) {
          console.error("Error checking if following:", error);
        }
      };

      getIsFollowingData();
    }
  }, [currentUser, profile, userName, isFollowingUser]);

  const getIsFollowingData = async () => {
    try {
      const result = await getIsFollowing({
        PublicKeyBase58Check: currentUser.PublicKeyBase58Check,
        IsFollowingPublicKeyBase58Check: profile.PublicKeyBase58Check,
      });

      setisFollowingUser(result.IsFollowing);
    } catch (error) {
      console.error("Error checking if following:", error);
    }
  };

  const followUser = async () => {
    await updateFollowingStatus({
      MinFeeRateNanosPerKB: 1000,
      IsUnfollow: false,
      FollowedPublicKeyBase58Check: profile.PublicKeyBase58Check,
      FollowerPublicKeyBase58Check: currentUser.PublicKeyBase58Check,
    });
    getIsFollowingData();
    notifications.show({
      title: "Success",
      icon: <IconCheck size="1.1rem" />,
      color: "green",
      message: `You successfully followed ${userName}`,
    });
  };

  const unfollowUser = async () => {
    await updateFollowingStatus({
      MinFeeRateNanosPerKB: 1000,
      IsUnfollow: true,
      FollowedPublicKeyBase58Check: profile.PublicKeyBase58Check,
      FollowerPublicKeyBase58Check: currentUser.PublicKeyBase58Check,
    });
    getIsFollowingData();
    notifications.show({
      title: "Success",
      icon: <IconCheck size="1.1rem" />,
      color: "red",
      message: `You successfully unfollowed ${userName}`,
    });
  };

  const fetchPosts = async () => {
    try {
      const postData = await getPostsForUser({
        PublicKeyBase58Check: profile.PublicKeyBase58Check,
        NumToFetch: 25,
      });
      setPosts(postData.Posts);
    } catch (error) {
      console.error("Error fetching user posts:", error);
    }
  };
  const subTier1 = async () => {
    try {
      const exchangeRateData = await getExchangeRates({
        PublicKeyBase58Check: profile.PublicKeyBase58Check,
      });
      console.log(exchangeRateData);

      const subscriptionAmount = 5; // $5 USD
      const usdCentsPerDeSoExchangeRate =
        exchangeRateData.USDCentsPerDeSoCoinbase;
      const nanosPerDeSo = 0.000000001; // 1 Nano is 0.000000001 DeSo

      // Calculate the equivalent amount in DeSo
      const equivalentDeSoAmount =
        (subscriptionAmount * 100) / usdCentsPerDeSoExchangeRate;

      // Calculate the equivalent amount in Nanos
      const equivalentNanosAmount = Math.floor(
        equivalentDeSoAmount / nanosPerDeSo
      );

      // Convert to an integer
      const equivalentNanosInt = Number(equivalentNanosAmount);

      await sendDeso({
        SenderPublicKeyBase58Check: currentUser.PublicKeyBase58Check,
        RecipientPublicKeyOrUsername: profile.PublicKeyBase58Check,
        AmountNanos: equivalentNanosInt,
        MinFeeRateNanosPerKB: 1000,
      });
    } catch (error) {
      if (error.message.includes("RuleErrorInsufficientBalance")) {
        notifications.show({
          title: "Insufficient Balance",
          icon: <IconX size="1.1rem" />,
          color: "red",
          message:
            "Hey there, please add DeSo to your Wallet to complete this transaction.",
        });
      } else {
        console.error("Error submitting transaction:", error);
      }
    }
  };

  const subTier2 = async () => {
    try {
      const exchangeRateData = await getExchangeRates({
        PublicKeyBase58Check: profile.PublicKeyBase58Check,
      });
      console.log(exchangeRateData);

      const subscriptionAmount = 15; // $5 USD
      const usdCentsPerDeSoExchangeRate =
        exchangeRateData.USDCentsPerDeSoCoinbase;
      const nanosPerDeSo = 0.000000001; // 1 Nano is 0.000000001 DeSo

      // Calculate the equivalent amount in DeSo
      const equivalentDeSoAmount =
        (subscriptionAmount * 100) / usdCentsPerDeSoExchangeRate;

      // Calculate the equivalent amount in Nanos
      const equivalentNanosAmount = Math.floor(
        equivalentDeSoAmount / nanosPerDeSo
      );

      // Convert to an integer
      const equivalentNanosInt = Number(equivalentNanosAmount);

      await sendDeso({
        SenderPublicKeyBase58Check: currentUser.PublicKeyBase58Check,
        RecipientPublicKeyOrUsername: profile.PublicKeyBase58Check,
        AmountNanos: equivalentNanosInt,
        MinFeeRateNanosPerKB: 1000,
      });
    } catch (error) {
      if (error.message.includes("RuleErrorInsufficientBalance")) {
        notifications.show({
          title: "Insufficient Balance",
          icon: <IconX size="1.1rem" />,
          color: "red",
          message:
            "Hey there, please add DeSo to your Wallet to complete this transaction.",
        });
      } else {
        console.error("Error submitting transaction:", error);
      }
    }
  };

  const subTier3 = async () => {
    try {
      const exchangeRateData = await getExchangeRates({
        PublicKeyBase58Check: profile.PublicKeyBase58Check,
      });
      console.log(exchangeRateData);

      const subscriptionAmount = 25; // $5 USD
      const usdCentsPerDeSoExchangeRate =
        exchangeRateData.USDCentsPerDeSoCoinbase;
      const nanosPerDeSo = 0.000000001; // 1 Nano is 0.000000001 DeSo

      // Calculate the equivalent amount in DeSo
      const equivalentDeSoAmount =
        (subscriptionAmount * 100) / usdCentsPerDeSoExchangeRate;

      // Calculate the equivalent amount in Nanos
      const equivalentNanosAmount = Math.floor(
        equivalentDeSoAmount / nanosPerDeSo
      );

      // Convert to an integer
      const equivalentNanosInt = Number(equivalentNanosAmount);

      await sendDeso({
        SenderPublicKeyBase58Check: currentUser.PublicKeyBase58Check,
        RecipientPublicKeyOrUsername: profile.PublicKeyBase58Check,
        AmountNanos: equivalentNanosInt,
        MinFeeRateNanosPerKB: 1000,
      });
    } catch (error) {
      if (error.message.includes("RuleErrorInsufficientBalance")) {
        notifications.show({
          title: "Insufficient Balance",
          icon: <IconX size="1.1rem" />,
          color: "red",
          message:
            "Hey there, please add DeSo to your Wallet to complete this transaction.",
        });
      } else {
        console.error("Error submitting transaction:", error);
      }
    }
  };

  const fetchNFTs = async (limit) => {
    try {
      const nftData = await getNFTsForUser({
        UserPublicKeyBase58Check: profile.PublicKeyBase58Check,
        IsForSale: true,
      });

      const nftKeys = Object.keys(nftData.NFTsMap);
      const limitedNFTKeys = nftKeys.slice(0, limit);

      const limitedNFTs = limitedNFTKeys.reduce((result, key) => {
        result[key] = nftData.NFTsMap[key];
        return result;
      }, {});

      setNFTs(limitedNFTs);
      console.log(limitedNFTs);
    } catch (error) {
      console.error("Error fetching user NFTs:", error);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);

    // Fetch posts if the "Posts" tab is selected
    if (tab === "first") {
      fetchPosts();
    }

    // Fetch NFTs if the "NFTs" tab is selected
    if (tab === "second") {
      fetchNFTs(25);
    }
  };

  useEffect(() => {
    fetchPosts(); // Fetch posts initially
  }, [profile.PublicKeyBase58Check]);

  useEffect(() => {
    fetchNFTs(25); // Fetch NFTs initially
  }, [profile.PublicKeyBase58Check]);

  const [commentToggles, setCommentToggles] = useState({});

  const [comment, setComment] = useState("");

  // Add a new state variable to track the current comment post hash
  const [commentPostHash, setCommentPostHash] = useState("");

  // Function to handle comment submission
  const submitComment = async () => {
    try {
      await submitPost({
        UpdaterPublicKeyBase58Check: currentUser.PublicKeyBase58Check,
        ParentStakeID: commentPostHash, // Use the commentPostHash as ParentStakeID
        BodyObj: {
          Body: comment,
          VideoURLs: [],
          ImageURLs: [],
        },
      });

      notifications.show({
        title: "Success",
        icon: <IconCheck size="1.1rem" />,
        color: "green",
        message: "Your comment was submitted!",
      });
    } catch (error) {
      alert("Error submitting comment. Please try again.");
      console.error("Error submitting comment:", error);
    }

    // Reset the comment and commentPostHash state after submitting
    setComment("");
    setCommentPostHash("");
  };

  // Function to handle toggling the comment section
  const handleCommentToggle = (postHash) => {
    // Update the commentPostHash state when the user clicks on the comment button
    setCommentPostHash(postHash);
    setCommentToggles((prevState) => ({
      ...prevState,
      [postHash]: !prevState[postHash],
    }));
  };

  const [repostSuccess, setRepostSuccess] = useState(false);
  const [currentPostHash, setCurrentPostHash] = useState("");
  const submitRepost = async (postHash) => {
    try {
      await submitPost({
        UpdaterPublicKeyBase58Check: currentUser.PublicKeyBase58Check,
        RepostedPostHashHex: postHash,
        BodyObj: {
          Body: "",
          VideoURLs: [],
          ImageURLs: [],
        },
      });
      setRepostSuccess(true);
      setCurrentPostHash(postHash);
    } catch (error) {
      alert("Error submitting Repost. Please try again.");
      console.error("Error submitting Repost:", error);
    }
  };

  const [heartSuccess, setHeartSuccess] = useState(false);
  const [currentHeartPostHash, setCurrentHeartPostHash] = useState("");
  const submitHeart = async (postHash) => {
    try {
      await createPostAssociation({
        TransactorPublicKeyBase58Check: currentUser.PublicKeyBase58Check,
        PostHashHex: postHash,
        AssociationType: "Reaction",
        AssociationValue: "Heart",
        MinFeeRateNanosPerKB: 1000,
      });
      setHeartSuccess(true);
      setCurrentHeartPostHash(postHash);
    } catch (error) {
      alert("Error submitting heart. Please try again.");
      console.error("Error submitting heart:", error);
    }
  };

  const [diamondTipSuccess, setDiamondTipSuccess] = useState(false);
  const [currentDiamondPostHash, setCurrentDiamondPostHash] = useState("");

  const sendDiamondTip = async (postHash, postPubKey) => {
    setCurrentDiamondPostHash(postHash);

    try {
      await sendDiamonds({
        ReceiverPublicKeyBase58Check: postPubKey,
        SenderPublicKeyBase58Check: currentUser.PublicKeyBase58Check,
        DiamondPostHashHex: postHash,
        DiamondLevel: 1,
        MinFeeRateNanosPerKB: 1000,
      });
      setDiamondTipSuccess(true);
    } catch (error) {
      alert("Error submitting diamond. Please try again.");
      console.error("Error submitting diamond:", error);
    }
  };

  const replaceURLs = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const atSymbolRegex = /(\S*@+\S*)/g;

    return text
      .replace(urlRegex, (url) => `<a href="${url}" target="_blank">${url}</a>`)
      .replace(atSymbolRegex, (match) => ` ${match} `);
  };

  return (
    <>
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Card.Section>
          <Image
            src={profile.ExtraData?.FeaturedImageURL || null}
            height={200}
            withPlaceholder
          />
        </Card.Section>

        <Center>
          <Avatar
            size={80}
            radius={80}
            src={
              `https://node.deso.org/api/v0/get-single-profile-picture/${profile.PublicKeyBase58Check}` ||
              profile.ExtraData.LargeProfilePicURL
            }
            alt="Profile Picture"
            mx="auto"
            mt={-30}
            className={classes.avatar}
          />
        </Center>

        <Center>
          {profile !== null ? (
            <>
              <Text fz="lg" fw={777} variant="gradient" truncate>
                {userName}
              </Text>
            </>
          ) : (
            <Text fz="lg" fw={777} variant="gradient" truncate>
              User does not exist
            </Text>
          )}
        </Center>

        <Space h="md" />
        <Card.Section>
          {profile &&
          profile.ExtraData &&
          profile.ExtraData.WavesStreamPlaybackId &&
          profile.ExtraData.WavesStreamTitle ? (
            <Player
              playbackId={profile.ExtraData?.WavesStreamPlaybackId}
              title={profile.ExtraData?.WavesStreamTitle}
              
            />
          ) : (
            <Divider
              my="xs"
              label={
                <>
                  <Paper radius="xl" p="md" withBorder>
                    <Text c="dimmed" fw={500} fs="md">
                      Not live right now.
                    </Text>
                  </Paper>
                </>
              }
              labelPosition="center"
            />
          )}
        </Card.Section>
        <Space h="md" />

        <Space h="md" />

        <Paper shadow="xl" radius="md" p="xl">
          <Group>
            <CopyButton
              value={`https://waves-2.vercel.app/wave/${userName}`}
              timeout={2000}
            >
              {({ copied, copy }) => (
                <Button
                  size="sm"
                  color={copied ? "teal" : "blue"}
                  onClick={copy}
                >
                  {copied ? (
                    <>
                      <Tooltip label="Copied Wave">
                        <IconCheck size={16} />
                      </Tooltip>
                    </>
                  ) : (
                    <>
                      <Tooltip label="Share their Wave with this Link">
                        <IconScreenShare size={16} />
                      </Tooltip>
                    </>
                  )}
                </Button>
              )}
            </CopyButton>

            <Button rightIcon={<GiWaveCrest size="1rem" />} onClick={openSub}>
              Subscribe
            </Button>
            <Modal
              size="auto"
              opened={openedSub}
              onClose={closeSub}
              centered
              transitionProps={{ transition: "fade" }}
            >
              <Paper shadow="xl" p="xl" withBorder>
                <Text fw={700} c="dimmed" align="center">
                  {" "}
                  Join {userName}'s Wave and Subscribe to contribute to their
                  growth.
                </Text>
                <Space h="md" />
                <Center>
                  <IconHeartHandshake size="2.3rem" />
                </Center>
                <Space h="md" />
                <Center>
                  <Box>
                    <Grid>
                      <Grid.Col lg={4} sm={7}>
                        <Paper shadow="xl" p="xl" withBorder>
                          <List>
                            <Text fw={700} align="center">
                              Tier 1
                            </Text>
                            <Divider my="sm" />
                            <Space h="md" />
                            <List.Item>
                              <Text size="xs">1-Month Subcription</Text>
                            </List.Item>
                            <List.Item>
                              <Text size="xs">1-Wave Point</Text>
                            </List.Item>
                            <List.Item>
                              <Text size="xs">1-Month Subscriber NFT</Text>
                            </List.Item>
                          </List>
                          <Space h="md" />
                          <Center>
                            <Button
                              onClick={subTier1}
                              variant="light"
                              radius="md"
                              fullWidth
                            >
                              $5.00
                            </Button>
                          </Center>
                        </Paper>
                      </Grid.Col>
                      <Grid.Col lg={4} sm={7}>
                        <Paper shadow="xl" p="xl" withBorder>
                          <List>
                            <Text fw={700} align="center">
                              Tier 2
                            </Text>
                            <Divider my="sm" />
                            <Space h="md" />
                            <List.Item>
                              <Text size="xs">3-Month Subcription</Text>
                            </List.Item>
                            <List.Item>
                              <Text size="xs">3-Wave Points</Text>
                            </List.Item>
                            <List.Item>
                              <Text size="xs">3-Month Subscriber NFT</Text>
                            </List.Item>
                          </List>
                          <Space h="md" />
                          <Center>
                            <Button
                              onClick={subTier2}
                              variant="light"
                              radius="md"
                              fullWidth
                            >
                              $15.00
                            </Button>
                          </Center>
                        </Paper>
                      </Grid.Col>
                      <Grid.Col lg={4} sm={7}>
                        <Paper shadow="xl" p="xl" withBorder>
                          <List>
                            <Text fw={700} align="center">
                              Tier 3
                            </Text>
                            <Divider my="sm" />
                            <Space h="md" />
                            <List.Item>
                              <Text size="xs">6-Month Subcription</Text>
                            </List.Item>
                            <List.Item>
                              <Text size="xs">6-Wave Points</Text>
                            </List.Item>
                            <List.Item>
                              <Text size="xs">6-Month Subscriber NFT</Text>
                            </List.Item>
                          </List>
                          <Space h="md" />
                          <Center>
                            <Button
                              onClick={subTier3}
                              variant="light"
                              radius="md"
                              fullWidth
                            >
                              $25.00
                            </Button>
                          </Center>
                        </Paper>
                      </Grid.Col>
                    </Grid>
                    {currentUser &&
                      profile &&
                      currentUser.PublicKeyBase58Check ===
                        profile.PublicKeyBase58Check && (
                        <Overlay center>
                          <Container size="md" px={0}>
                            <Space h={77} />
                            <Paper shadow="xl" p="lg" withBorder>
                              <Text fw={500}>
                                Can't Subscribe to yourself. Switch Accounts to
                                Subscribe!
                              </Text>
                              <Divider my="sm" />
                              <Button
                                leftIcon={<GiWaveCrest size="1rem" />}
                                variant="gradient"
                                gradient={{ from: "cyan", to: "indigo" }}
                                onClick={() => identity.login()}
                                fullWidth
                              >
                                Switch Account
                              </Button>
                            </Paper>
                          </Container>
                        </Overlay>
                      )}

                    {!currentUser && (
                      <Overlay center>
                        <Container size="md" px={0}>
                          <Space h={77} />
                          <Paper shadow="xl" p="lg" withBorder>
                            <Text fw={500}>
                              Please Signup or Login to Subscribe.
                            </Text>
                            <Divider my="sm" />
                            <Button
                              leftIcon={<GiWaveCrest size="1rem" />}
                              variant="gradient"
                              gradient={{ from: "cyan", to: "indigo" }}
                              onClick={() => identity.login()}
                              fullWidth
                            >
                              Sign Up
                            </Button>
                            <Space h="sm" />
                            <Button
                              fullWidth
                              variant="default"
                              onClick={() => identity.login()}
                            >
                              Login
                            </Button>
                          </Paper>
                        </Container>
                      </Overlay>
                    )}
                  </Box>
                </Center>
              </Paper>
            </Modal>
          </Group>
          <Space h="sm" />
          <Text
            fz="sm"
            style={{
              maxWidth: "100%",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "wrap",
            }}
            dangerouslySetInnerHTML={{
              __html:
                profile && profile.Description
                  ? replaceURLs(profile.Description.replace(/\n/g, "<br> "))
                  : "",
            }}
          />
        </Paper>

        <Space h="sm" />

        <Center>
          {followerInfo.followers && followerInfo.followers.NumFollowers ? (
            <Text fz="sm">
              Followers: {followerInfo.followers.NumFollowers}
            </Text>
          ) : (
            <Text fz="sm">Followers: 0</Text>
          )}

          <Space w="sm" />
          <Divider size="sm" orientation="vertical" />
          <Space w="sm" />
          {followerInfo.following && followerInfo.following.NumFollowers ? (
            <Text fz="sm">
              Following: {followerInfo.following.NumFollowers}
            </Text>
          ) : (
            <Text fz="sm">Following: 0</Text>
          )}
        </Center>
        <Space h="md" />
        <Space h="md" />
        {currentUser ? (
          isFollowingUser ? (
            <Group noWrap spacing={0}>
              <Button
                fullWidth
                variant="gradient"
                gradient={{ from: "cyan", to: "indigo" }}
                className={classes.button}
              >
                Following
              </Button>
              <Tooltip
                label="Unfollow User"
                color="gray"
                withArrow
                arrowPosition="center"
              >
                <ActionIcon
                  variant="filled"
                  color="indigo"
                  size={36}
                  className={classes.menuControl}
                  onClick={unfollowUser}
                >
                  <RiUserUnfollowLine size="1rem" stroke={1.5} />
                </ActionIcon>
              </Tooltip>
            </Group>
          ) : (
            <Button
              fullWidth
              variant="gradient"
              gradient={{ from: "cyan", to: "indigo" }}
              radius="md"
              onClick={followUser}
            >
              Follow
            </Button>
          )
        ) : (
          <Button
            fullWidth
            variant="gradient"
            gradient={{ from: "cyan", to: "indigo" }}
            radius="md"
            onClick={() => identity.login()}
          >
            Login to Follow
          </Button>
        )}
      </Card>

      <Space h="xl" />

      <Tabs radius="sm" value={activeTab} onTabChange={handleTabChange}>
        <Tabs.List grow position="center">
          <Tabs.Tab value="first">
            <Text fz="sm">Posts</Text>
          </Tabs.Tab>

          <Tabs.Tab value="second">
            <Text fz="sm">NFTs</Text>
          </Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="first">
          {posts && posts.length > 0 ? (
            posts.map((post, index) => (
              <Paper
                m="md"
                shadow="lg"
                radius="md"
                p="xl"
                withBorder
                key={post.PostHashHex}
                className={classes.comment}
              >
                <Group position="right">
                  <Tooltip label="Go to Post">
                    <ActionIcon
                      color="blue"
                      size="sm"
                      variant="light"
                      onClick={() => {
                        navigate(`/post/${post.PostHashHex}`);
                      }}
                    >
                      <IconMessageShare />
                    </ActionIcon>
                  </Tooltip>
                </Group>
                <Center>
                  {post.ProfileEntryResponse &&
                  post.ProfileEntryResponse.ExtraData?.LargeProfilePicURL ? (
                    <Avatar
                      radius="xl"
                      size="lg"
                      src={
                        post.ProfileEntryResponse.ExtraData?.LargeProfilePicURL
                      }
                    />
                  ) : (
                    <Avatar
                      radius="xl"
                      size="lg"
                      src={`https://node.deso.org/api/v0/get-single-profile-picture/${profile.PublicKeyBase58Check}`}
                    />
                  )}

                  <Space w="xs" />
                  <Text weight="bold" size="sm">
                    {userName}
                  </Text>
                </Center>

                <Spoiler
                  maxHeight={222}
                  showLabel={
                    <>
                      <Space h="xs" />
                      <Tooltip label="Show More">
                        <IconScriptPlus />
                      </Tooltip>
                    </>
                  }
                  hideLabel={
                    <>
                      <Space h="xs" />
                      <Tooltip label="Show Less">
                        <IconScriptMinus />
                      </Tooltip>
                    </>
                  }
                >
                  <TypographyStylesProvider>
                    <Space h="sm" />
                    {post && post.Body && (
                      <Text
                        align="center"
                        size="md"
                        className={classes.body}
                        dangerouslySetInnerHTML={{
                          __html: replaceURLs(
                            post.Body.replace(/\n/g, "<br> ")
                          ),
                        }}
                      />
                    )}
                  </TypographyStylesProvider>
                </Spoiler>

                <Space h="md" />
                {post.PostExtraData?.EmbedVideoURL && (
             
             <Group  style={{
                   
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
                  <iframe
                    style={{
                      height: "50vh",
                      width: "100vw",
                      border: "none",
                      borderRadius: "22px",
                    }}
                      src={post.PostExtraData.EmbedVideoURL}
                    />
                  </Group>
                )}
                {post.VideoURLs && (
                  <iframe
                    style={{ width: "100%", height: "100%" }}
                    src={post.VideoURLs}
                    title={post.PostHashHex}
                  />
                )}

                {post.ImageURLs && (
                  <Group position="center">
                    <UnstyledButton
                      onClick={() => {
                        setSelectedImage(post.ImageURLs[0]);
                        open();
                      }}
                    >
                      <Image
                        src={post.ImageURLs[0]}
                        radius="md"
                        alt="post-image"
                        fit="contain"
                      />
                    </UnstyledButton>
                  </Group>
                )}

                {post.RepostedPostEntryResponse && (
                  <Paper
                    m="md"
                    shadow="lg"
                    radius="md"
                    p="xl"
                    withBorder
                    key={post.RepostedPostEntryResponse.PostHashHex}
                    className={classes.comment}
                  >
                    <Group position="right">
                      <Tooltip label="Go to Post">
                        <ActionIcon
                          color="blue"
                          size="sm"
                          variant="light"
                          onClick={() => {
                            navigate(
                              `/post/${post.RepostedPostEntryResponse.PostHashHex}`
                            );
                          }}
                        >
                          <IconMessageShare />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                    <Center>
                      <ActionIcon
                        onClick={() => {
                          navigate(
                            `/wave/${post.RepostedPostEntryResponse.ProfileEntryResponse?.Username}`
                          );
                        }}
                        variant="transparent"
                      >
                        <Avatar
                          radius="xl"
                          size="lg"
                          src={
                            post.RepostedPostEntryResponse?.ProfileEntryResponse
                              ?.ExtraData?.LargeProfilePicURL ||
                            `https://node.deso.org/api/v0/get-single-profile-picture/${post.RepostedPostEntryResponse?.ProfileEntryResponse?.PublicKeyBase58Check}`
                          }
                        />

                        <Space w="xs" />
                        <Text weight="bold" size="sm">
                          {
                            post.RepostedPostEntryResponse.ProfileEntryResponse
                              ?.Username
                          }
                        </Text>
                      </ActionIcon>
                    </Center>
                    <Spoiler
                      maxHeight={222}
                      showLabel={
                        <>
                          <Space h="xs" />
                          <Tooltip label="Show More">
                            <IconScriptPlus />
                          </Tooltip>
                        </>
                      }
                      hideLabel={
                        <>
                          <Space h="xs" />
                          <Tooltip label="Show Less">
                            <IconScriptMinus />
                          </Tooltip>
                        </>
                      }
                    >
                      <TypographyStylesProvider>
                        <Space h="sm" />
                        {post.RepostedPostEntryResponse && (
                          <Text
                            align="center"
                            size="md"
                            className={classes.body}
                            dangerouslySetInnerHTML={{
                              __html: replaceURLs(
                                post.RepostedPostEntryResponse.Body.replace(
                                  /\n/g,
                                  "<br> "
                                )
                              ),
                            }}
                          />
                        )}
                      </TypographyStylesProvider>
                    </Spoiler>
                    <Space h="md" />
                    {post.RepostedPostEntryResponse.PostExtraData
                      ?.EmbedVideoURL && (
                        <Group  style={{
                   
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}>
                              <iframe
                                style={{
                                  height: "50vh",
                                  width: "100vw",
                                  border: "none",
                                  borderRadius: "22px",
                                }}
                          title="embed"
                          src={
                            post.RepostedPostEntryResponse.PostExtraData
                              .EmbedVideoURL
                          }
                        />
                      </Group>
                    )}
                    {post.RepostedPostEntryResponse.VideoURLs && (
                      <iframe
                        style={{ width: "100%", height: "100%" }}
                        src={post.RepostedPostEntryResponse.VideoURLs}
                        title={post.RepostedPostEntryResponse.PostHashHex}
                      />
                    )}

                    {post.RepostedPostEntryResponse.ImageURLs &&
                      post.RepostedPostEntryResponse.ImageURLs.length > 0 && (
                        <Group position="center">
                          <UnstyledButton
                            onClick={() => {
                              setSelectedImage(
                                post.RepostedPostEntryResponse.ImageURLs[0]
                              );
                              open();
                            }}
                          >
                            <Image
                              src={post.RepostedPostEntryResponse.ImageURLs[0]}
                              radius="md"
                              alt="repost-image"
                              fit="contain"
                            />
                          </UnstyledButton>
                        </Group>
                      )}
                  </Paper>
                )}

                <Space h="md" />

                <Center>
                  <Tooltip
                    transition="slide-down"
                    withArrow
                    position="bottom"
                    label="Like"
                  >
                    <ActionIcon
                      onClick={() =>
                        currentUser && submitHeart(post.PostHashHex)
                      }
                      variant="subtle"
                      radius="md"
                      size={36}
                    >
                      <IconHeart
                        color={
                          heartSuccess &&
                          currentHeartPostHash === post.PostHashHex
                            ? "red"
                            : "white"
                        }
                        size={18}
                        stroke={1.5}
                      />
                    </ActionIcon>
                  </Tooltip>
                  <Text size="xs" color="dimmed">
                    {post.LikeCount}
                  </Text>

                  <Space w="sm" />

                  <Tooltip
                    transition="slide-down"
                    withArrow
                    position="bottom"
                    label="Repost"
                  >
                    <ActionIcon
                      onClick={() =>
                        currentUser && submitRepost(post.PostHashHex)
                      }
                      variant="subtle"
                      radius="md"
                      size={36}
                    >
                      <IconRecycle
                        color={
                          repostSuccess && currentPostHash === post.PostHashHex
                            ? "#228BE6"
                            : "#FFFFFF"
                        }
                        size={18}
                        stroke={1.5}
                      />
                    </ActionIcon>
                  </Tooltip>
                  <Text size="xs" color="dimmed">
                    {post.RepostCount}
                  </Text>

                  <Space w="sm" />

                  <Tooltip
                    transition="slide-down"
                    withArrow
                    position="bottom"
                    label="Diamonds"
                  >
                    <ActionIcon
                      onClick={() =>
                        currentUser &&
                        sendDiamondTip(
                          post.PostHashHex,
                          post.PosterPublicKeyBase58Check
                        )
                      }
                      variant="subtle"
                      radius="md"
                      size={36}
                    >
                      <IconDiamond
                        color={
                          diamondTipSuccess &&
                          currentDiamondPostHash === post.PostHashHex
                            ? "#228BE6"
                            : "#FFFFFF"
                        }
                        size={18}
                        stroke={1.5}
                      />
                    </ActionIcon>
                  </Tooltip>
                  <Text size="xs" color="dimmed">
                    {post.DiamondCount}
                  </Text>

                  <Space w="sm" />

                  <Tooltip
                    transition="slide-down"
                    withArrow
                    position="bottom"
                    label="Comments"
                  >
                    <ActionIcon
                      onClick={() => handleCommentToggle(post.PostHashHex)}
                      variant="subtle"
                      radius="md"
                      size={36}
                    >
                      <IconMessageCircle size={18} stroke={1.5} />
                    </ActionIcon>
                  </Tooltip>
                  <Text size="xs" color="dimmed">
                    {post.CommentCount}
                  </Text>
                </Center>
                <Collapse in={commentToggles[post.PostHashHex]}>
                  <>
                    {currentUser && currentUser.ProfileEntryResponse ? (
                      <>
                        <Textarea
                          placeholder="Empower."
                          description="Your comment"
                          variant="filled"
                          value={comment}
                          onChange={(event) => setComment(event.target.value)}
                        />
                        <Space h="sm" />
                        <Group position="right">
                          <Button radius="md" onClick={() => submitComment()}>
                            Comment
                          </Button>
                        </Group>
                      </>
                    ) : (
                      <>
                        <Textarea
                          placeholder="Please Login/Signup or Set username to Comment."
                          description="Your comment"
                          variant="filled"
                          disabled
                        />
                        <Space h="sm" />
                        <Group position="right">
                          <Button radius="md" disabled>
                            Comment
                          </Button>
                        </Group>
                      </>
                    )}
                  </>
                </Collapse>
              </Paper>
            ))
          ) : (
            <Center>
              <Space h="md" />

              <Badge
                size="md"
                radius="sm"
                variant="gradient"
                gradient={{ from: "indigo", to: "cyan", deg: 45 }}
              >
                Post something to view them here!
              </Badge>

              <Space h={222} />
            </Center>
          )}
        </Tabs.Panel>
        <Tabs.Panel value="second">
          {NFTs && Object.keys(NFTs).length > 0 ? (
            Object.keys(NFTs).map((key, index) => {
              const nft = NFTs[key];
              return (
                <Paper
                  m="md"
                  shadow="lg"
                  radius="md"
                  p="xl"
                  withBorder
                  key={index}
                  className={classes.comment}
                >
                  <Center>
                    <Avatar
                      size="lg"
                      radius="xl"
                      src={
                        `https://node.deso.org/api/v0/get-single-profile-picture/${profile.PublicKeyBase58Check}` ||
                        null
                      }
                      alt="Profile Picture"
                    />
                    <Space w="xs" />
                    <Text weight="bold" size="sm">
                      {userName}
                    </Text>
                  </Center>
                  <Space h="sm" />
                  <TypographyStylesProvider>
                    <Text
                      align="center"
                      size="md"
                      className={classes.body}
                      dangerouslySetInnerHTML={{
                        __html: replaceURLs(
                          nft && nft.PostEntryResponse.Body
                            ? nft.PostEntryResponse.Body.replace(/\n/g, "<br> ")
                            : ""
                        ),
                      }}
                    />
                  </TypographyStylesProvider>

                  <Space h="md" />
                  {nft.PostEntryResponse.VideoURLs && (
                    <iframe
                      style={{ width: "100%", height: "100%" }}
                      src={nft.PostEntryResponse.VideoURLs}
                      title={nft.PostEntryResponse.PostHashHex}
                    />
                  )}
                  {nft.PostEntryResponse.ImageURLs && (
                    <Group position="center">
                      <UnstyledButton
                        onClick={() => {
                          setSelectedImage(nft.PostEntryResponse.ImageURLs[0]);
                          open();
                        }}
                      >
                        <Image
                          src={nft.PostEntryResponse.ImageURLs[0]}
                          radius="md"
                          alt="repost-image"
                          fit="contain"
                        />
                      </UnstyledButton>
                    </Group>
                  )}

                  <Space h="md" />

                  <Center>
                    <Tooltip
                      transition="slide-down"
                      withArrow
                      position="bottom"
                      label="Like"
                    >
                      <ActionIcon
                        onClick={() =>
                          currentUser &&
                          submitHeart(nft.PostEntryResponse.PostHashHex)
                        }
                        variant="subtle"
                        radius="md"
                        size={36}
                      >
                        <IconHeart
                          color={
                            heartSuccess &&
                            currentHeartPostHash ===
                              nft.PostEntryResponse.PostHashHex
                              ? "red"
                              : "white"
                          }
                          size={18}
                          stroke={1.5}
                        />
                      </ActionIcon>
                    </Tooltip>
                    <Text size="xs" color="dimmed">
                      {nft.PostEntryResponse.LikeCount}
                    </Text>

                    <Space w="sm" />

                    <Tooltip
                      transition="slide-down"
                      withArrow
                      position="bottom"
                      label="Repost"
                    >
                      <ActionIcon
                        onClick={() =>
                          currentUser &&
                          submitRepost(nft.PostEntryResponse.PostHashHex)
                        }
                        variant="subtle"
                        radius="md"
                        size={36}
                      >
                        <IconRecycle
                          color={
                            repostSuccess &&
                            currentPostHash ===
                              nft.PostEntryResponse.PostHashHex
                              ? "#228BE6"
                              : "#FFFFFF"
                          }
                          size={18}
                          stroke={1.5}
                        />
                      </ActionIcon>
                    </Tooltip>
                    <Text size="xs" color="dimmed">
                      {nft.PostEntryResponse.RepostCount}
                    </Text>

                    <Space w="sm" />

                    <Tooltip
                      transition="slide-down"
                      withArrow
                      position="bottom"
                      label="Diamonds"
                    >
                      <ActionIcon
                        onClick={() =>
                          currentUser &&
                          sendDiamondTip(
                            nft.PostEntryResponse.PostHashHex,
                            nft.PostEntryResponse.PosterPublicKeyBase58Check
                          )
                        }
                        variant="subtle"
                        radius="md"
                        size={36}
                      >
                        <IconDiamond
                          color={
                            diamondTipSuccess &&
                            currentDiamondPostHash ===
                              nft.PostEntryResponse.PostHashHex
                              ? "#228BE6"
                              : "#FFFFFF"
                          }
                          size={18}
                          stroke={1.5}
                        />
                      </ActionIcon>
                    </Tooltip>
                    <Text size="xs" color="dimmed">
                      {nft.PostEntryResponse.DiamondCount}
                    </Text>

                    <Space w="sm" />

                    <Tooltip
                      transition="slide-down"
                      withArrow
                      position="bottom"
                      label="Comments"
                    >
                      <ActionIcon
                        onClick={() =>
                          handleCommentToggle(nft.PostEntryResponse.PostHashHex)
                        }
                        variant="subtle"
                        radius="md"
                        size={36}
                      >
                        <IconMessageCircle size={18} stroke={1.5} />
                      </ActionIcon>
                    </Tooltip>
                    <Text size="xs" color="dimmed">
                      {nft.PostEntryResponse.CommentCount}
                    </Text>
                  </Center>
                  <Collapse
                    in={commentToggles[nft.PostEntryResponse.PostHashHex]}
                  >
                    <>
                      {currentUser && currentUser.ProfileEntryResponse ? (
                        <>
                          <Textarea
                            placeholder="Empower."
                            description="Your comment"
                            variant="filled"
                            value={comment}
                            onChange={(event) => setComment(event.target.value)}
                          />
                          <Space h="sm" />
                          <Group position="right">
                            <Button radius="md" onClick={() => submitComment()}>
                              Comment
                            </Button>
                          </Group>
                        </>
                      ) : (
                        <>
                          <Textarea
                            placeholder="Please Login/Signup or Set username to Comment."
                            description="Your comment"
                            variant="filled"
                            disabled
                          />
                          <Space h="sm" />
                          <Group position="right">
                            <Button radius="md" disabled>
                              Comment
                            </Button>
                          </Group>
                        </>
                      )}
                    </>
                  </Collapse>
                </Paper>
              );
            })
          ) : (
            <Center>
              <Space h="md" />

              <Badge
                size="md"
                radius="sm"
                variant="gradient"
                gradient={{ from: "indigo", to: "cyan", deg: 45 }}
              >
                Mint/Buy some NFTs to view them here!
              </Badge>

              <Space h={222} />
            </Center>
          )}
        </Tabs.Panel>
      </Tabs>

      <Modal opened={opened} onClose={close} size="auto" centered>
        <Image src={selectedImage} radius="md" alt="post-image" fit="contain" />
      </Modal>
    </>
  );
};
