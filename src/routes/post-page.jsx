import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import {
  
  getSinglePost,
  submitPost,
  createPostAssociation,
  sendDiamonds,
} from "deso-protocol";
import {
  Avatar,
  createStyles,
  Paper,
  Modal,
  Group,
  Text,
  Space,
  Center,
  Collapse,
 
  UnstyledButton,
  Textarea,
  Button,
  ActionIcon,
  TypographyStylesProvider,
  Spoiler,
  Tooltip,
  Image,
  Divider,
} from "@mantine/core";
import {
  IconHeart,
  IconScriptPlus,
  IconScriptMinus,
  IconDiamond,
  IconRecycle,
  IconMessageCircle,
  IconCheck
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { DeSoIdentityContext } from "react-deso-protocol";
import { TikTok } from "react-tiktok";

import { notifications } from "@mantine/notifications";

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
}));

export const PostPage = () => {
  const location = useLocation();
  const { pathname } = location;
  const navigate = useNavigate();
  const postHash = pathname.substring(pathname.lastIndexOf("/") + 1);
  const [singlePost, setSinglePost] = useState({});
  const [comments, setComments] = useState([]);
  const { classes } = useStyles();
  const { currentUser } = useContext(DeSoIdentityContext);
  
  const [selectedImage, setSelectedImage] = useState("");
  const [opened, { open, close }] = useDisclosure(false);
  
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const postData = await getSinglePost({
          PostHashHex: postHash,
          CommentLimit: 10,
        });

        setComments(postData.PostFound.Comments);
        setSinglePost(postData.PostFound);
      } catch (error) {
        console.error("Error fetching post:", error);
      }
    };

    fetchPost();
  }, [postHash]);
  console.log(singlePost);
  const replaceURLs = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const atSymbolRegex = /(\S*@+\S*)/g;

    return text
      .replace(urlRegex, (url) => `<a href="${url}" target="_blank">${url}</a>`)
      .replace(atSymbolRegex, (match) => ` ${match} `);
  };

  const [comment, setComment] = useState("");

  const submitComment = async () => {
    try {
      await submitPost({
        UpdaterPublicKeyBase58Check: currentUser.PublicKeyBase58Check,
        ParentStakeID: postHash,
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

    // Reset the comment state after submitting
    setComment("");
  };

  const [repostSuccess, setRepostSuccess] = useState(false);

  const submitRepost = async () => {
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
    } catch (error) {
      alert("Error submitting Repost. Please try again.");
      console.error("Error submitting Repost:", error);
    }
  };

  const [heartSuccess, setHeartSuccess] = useState(false);

  const submitHeart = async () => {
    try {
      await createPostAssociation({
        TransactorPublicKeyBase58Check: currentUser.PublicKeyBase58Check,
        PostHashHex: postHash,
        AssociationType: "REACTION",
        AssociationValue: "LOVE",
        MinFeeRateNanosPerKB: 1000,
      });
      setHeartSuccess(true);
    } catch (error) {
      alert("Error submitting heart. Please try again.");
      console.error("Error submitting heart:", error);
    }
  };

  const [diamondTipSuccess, setDiamondTipSuccess] = useState(false);

  const sendDiamondTip = async () => {
    try {
      await sendDiamonds({
        ReceiverPublicKeyBase58Check: singlePost.PosterPublicKeyBase58Check,
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

  return (
    <>
    
      <Paper
        m="md"
        shadow="lg"
        radius="md"
        p="xl"
        withBorder
        key={postHash}
        className={classes.comment}
      >
        <Center>
          <ActionIcon
            onClick={() => {
              navigate(`/wave/${singlePost.ProfileEntryResponse?.Username}`);
            }}
            variant="transparent"
          >
            <Avatar
              radius="xl"
              size="lg"
              src={`https://node.deso.org/api/v0/get-single-profile-picture/${singlePost.ProfileEntryResponse?.PublicKeyBase58Check}`}
            />
            <Space w="xs" />
            <Text weight="bold" size="sm">
              {singlePost.ProfileEntryResponse?.Username}
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
            <Text
              align="center"
              size="md"
              className={classes.body}
              dangerouslySetInnerHTML={{
                __html: replaceURLs(
                  singlePost && singlePost.Body
                    ? singlePost.Body.replace(/\n/g, "<br> ")
                    : ""
                ),
              }}
            />
          </TypographyStylesProvider>
        </Spoiler>

        <Space h="xl" />
        {singlePost.ImageURLs && (
              <Group position="center">
               <UnstyledButton
                      onClick={() => {
                        setSelectedImage(singlePost.ImageURLs[0]);
                        open();
                      }}
                    >
                  <Image
                    src={singlePost.ImageURLs[0]}
                    radius="md"
                    alt="post-image"
                    fit="contain"
                  />
                </UnstyledButton>
              </Group>
            )}
             {singlePost.VideoURLs && (
                  <iframe
                    style={{ width: "100%", height: "100%" }}
                    src={singlePost.VideoURLs}
                    title={singlePost.PostHashHex}
                  />
                )}
        {singlePost.PostExtraData?.EmbedVideoURL && (
          
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
                          }} title="embed" src={singlePost.PostExtraData.EmbedVideoURL} />
</Group>


        )}

{singlePost.RepostedPostEntryResponse && (
                  <Paper
                    m="md"
                    shadow="lg"
                    radius="md"
                    p="xl"
                    withBorder
                    key={singlePost.RepostedPostEntryResponse.PostHashHex}
                    className={classes.comment}
                  >
                    <Center>
                      <ActionIcon
                        onClick={() => {
                          navigate(
                            `/wave/${singlePost.RepostedPostEntryResponse.ProfileEntryResponse?.Username}`
                          );
                        }}
                        variant="transparent"
                      >
                        <Avatar
                          radius="xl"
                          size="lg"
                          src={
                            singlePost.RepostedPostEntryResponse?.ProfileEntryResponse
                              ?.ExtraData?.LargeProfilePicURL ||
                            `https://node.deso.org/api/v0/get-single-profile-picture/${singlePost.RepostedPostEntryResponse?.ProfileEntryResponse?.PublicKeyBase58Check}`
                          }
                        />

                        <Space w="xs" />
                        <Text weight="bold" size="sm">
                          {
                            singlePost.RepostedPostEntryResponse.ProfileEntryResponse
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
                        <Text
                          align="center"
                          size="md"
                          className={classes.body}
                          dangerouslySetInnerHTML={{
                            __html: replaceURLs(
                              singlePost.RepostedPostEntryResponse.Body.replace(
                                /\n/g,
                                "<br> "
                              )
                            ),
                          }}
                        />
                      </TypographyStylesProvider>
                    </Spoiler>

                    <Space h="md" />
                    

                    {singlePost.RepostedPostEntryResponse.VideoURLs && (
                      <iframe
                        style={{ width: "100%", height: "100%" }}
                        src={singlePost.RepostedPostEntryResponse.VideoURLs}
                        title={singlePost.RepostedPostEntryResponse.PostHashHex}
                      />
                    )}
                    {singlePost.RepostedPostEntryResponse.ImageURLs &&
                      singlePost.RepostedPostEntryResponse.ImageURLs.length > 0 && (
                        <Group position="center">
                          <UnstyledButton
                            onClick={() => {
                              setSelectedImage(
                                singlePost.RepostedPostEntryResponse.ImageURLs[0]
                              );
                              open();
                            }}
                          >
                            <Image
                              src={singlePost.RepostedPostEntryResponse.ImageURLs[0]}
                              radius="md"
                              alt="repost-image"
                              fit="contain"
                            />
                         </UnstyledButton>
                        </Group>
                      )}
                  </Paper>
                )}
        <Space h="xl" />
        <Center>
          <Tooltip
            transition="slide-down"
            withArrow
            position="bottom"
            label="Like"
          >
            <ActionIcon
              onClick={() => currentUser && submitHeart()}
              variant="subtle"
              radius="md"
              size={36}
            >
              <IconHeart
                color={heartSuccess ? "red" : "white"}
                size={18}
                stroke={1.5}
              />
            </ActionIcon>
          </Tooltip>
          <Text size="xs" color="dimmed">
            {singlePost?.LikeCount}
          </Text>

          <Space w="sm" />

          <Tooltip
            transition="slide-down"
            withArrow
            position="bottom"
            label="Repost"
          >
            <ActionIcon
              onClick={() => currentUser && submitRepost()}
              variant="subtle"
              radius="md"
              size={36}
            >
              <IconRecycle
                color={repostSuccess ? "#228BE6" : "#FFFFFF"}
                size={18}
                stroke={1.5}
              />
            </ActionIcon>
          </Tooltip>
          <Text size="xs" color="dimmed">
            {singlePost?.RepostCount}
          </Text>

          <Space w="sm" />

          <Tooltip
            transition="slide-down"
            withArrow
            position="bottom"
            label="Diamonds"
          >
            <ActionIcon
              onClick={() => currentUser && sendDiamondTip()}
              variant="subtle"
              radius="md"
              size={36}
            >
              <IconDiamond
                color={diamondTipSuccess ? "#228BE6" : "#FFFFFF"}
                size={18}
                stroke={1.5}
              />
            </ActionIcon>
          </Tooltip>
          <Text size="xs" color="dimmed">
            {singlePost?.DiamondCount}
          </Text>

          <Space w="sm" />

          <Tooltip
            transition="slide-down"
            withArrow
            position="bottom"
            label="Comments"
          >
            <ActionIcon variant="subtle" radius="md" size={36}>
              <IconMessageCircle size={18} stroke={1.5} />
            </ActionIcon>
          </Tooltip>
          <Text size="xs" color="dimmed">
            {singlePost?.CommentCount}
          </Text>
        </Center>
        <Space h="sm" />
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
        
      </Paper>
    
      {comments && comments.length > 0 ? (
        comments.map((comment) => (
          <>
          
          <Paper
            m="md"
            shadow="lg"
            radius={66}
            p="xl"
            withBorder
            key={comment.PostHashHex}
            className={classes.comment}
          >
            <Center>
              <ActionIcon
                onClick={() => {
                  navigate(`/wave/${comment.ProfileEntryResponse.Username}`);
                }}
                variant="transparent"
              >
                <Avatar
                  radius="xl"
                  size="lg"
                  src={`https://node.deso.org/api/v0/get-single-profile-picture/${comment.PosterPublicKeyBase58Check}`}
                />
                <Space w="xs" />
                <Text weight="bold" size="sm">
                  {comment.ProfileEntryResponse.Username}
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
                <Text
                  align="center"
                  size="md"
                  className={classes.body}
                  dangerouslySetInnerHTML={{
                    __html: replaceURLs(comment.Body.replace(/\n/g, "<br> ")),
                  }}
                />
              </TypographyStylesProvider>
            </Spoiler>

            {comment.ImageURLs && (
              <Group position="center">
               <UnstyledButton
                            onClick={() => {
                              setSelectedImage(
                                comment.ImageURLs[0]
                              );
                              open();
                            }}
                          >
                  <Image
                    src={comment.ImageURLs[0]}
                    radius="md"
                    alt="post-image"
                    fit="contain"
                  />
                </UnstyledButton>
              </Group>
            )}
          </Paper>
          
          
          </>
        ))
      ) : (
        <></>
      )}
      <Space h={111}/>
      <Modal opened={opened} onClose={close} size="auto" centered>
        <Image src={selectedImage} radius="md" alt="post-image" fit="contain" />
      </Modal>

    </>
  );
};
