import {
  Player,
  useCreateStream,
  useUpdateStream,
  Broadcast,
  useStreamSession 
} from "@livepeer/react";
import { useMemo, useState, useContext, useEffect, useRef } from "react";
import { useDisclosure } from "@mantine/hooks";
import {
  updateProfile,
  getIsFollowing,
  updateFollowingStatus,
  submitPost,
  getSingleProfile
} from "deso-protocol";
import {
  Title,
  Input,
  Paper,
  Textarea,
  Group,
  Button,
  Space,
  Center,
  CopyButton,
  Tabs,
  Tooltip,
  Card,
  Badge,
  Loader,
  Text,
  createStyles,
  Progress,
  Divider, 
  Accordion, 
  useMantineTheme, rem, Collapse, UnstyledButton, ActionIcon, PasswordInput, Switch, HoverCard, Overlay,
  Image
} from "@mantine/core";
import { TwitchPlayer, TwitchChat } from "react-twitch-embed";
import { IconCopy,IconRocket,  IconCheck, IconScreenShare, IconAt, IconBrandYoutube, IconBrandTwitch, IconKey, IconUser } from "@tabler/icons-react";
import { useInterval } from "@mantine/hooks";
import { DeSoIdentityContext } from "react-deso-protocol";
import { RiKickLine } from 'react-icons/ri';
import { AiOutlineLink } from 'react-icons/ai';
import { GrLaunch } from 'react-icons/gr';
import { VscKey } from 'react-icons/vsc';
import { BiUserCircle } from 'react-icons/bi';
import { TiInfoLargeOutline } from 'react-icons/ti';
import xeenon from "../assets/xeenonLogo.gif"


const useStyles = createStyles((theme) => ({
  button: {
    position: "relative",
    transition: "background-color 150ms ease",
  },

  progress: {
    ...theme.fn.cover(-1),
    height: "auto",
    backgroundColor: "transparent",
    zIndex: 0,
  },

  label: {
    position: "relative",
    zIndex: 1,
  },
}));

export const Stream = () => {
  const { currentUser } = useContext(DeSoIdentityContext);
  const [streamName, setStreamName] = useState("");
  const [isFollowingWaves, setisFollowingWaves] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [disable, { toggle }] = useDisclosure(false);
  const { classes, theme } = useStyles();
  const [progress, setProgress] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState("first");
  const [openedMulti, { toggle: toggleMulti }] = useDisclosure(true);
  const embed = useRef(); // We use a ref instead of state to avoid rerenders.
  

  const handleReady = (e) => {
    embed.current = e;
  };
  const getColor = (color) => theme.colors[color][theme.colorScheme === 'dark' ? 8 : 7];
  const interval = useInterval(
    () =>
      setProgress((current) => {
        if (current < 100) {
          return current + 1;
        }

        interval.stop();
        setLoaded(true);
        return 0;
      }),
    20
  );

  // Allowing user to create streams via livepeers useCreateStream hook
  const {
    mutate: createStream,
    data: stream,
    status,
  } = useCreateStream(streamName ? { name: streamName } : null);

  const isLoading = useMemo(() => status === "loading", [status]);

  const streamId = stream?.id;

  const showOverlay = !!stream;
  const { mutate: suspendStream } = useUpdateStream({
    streamId,
    suspend: true,
  });

  const handleEndStream = async () => {
    suspendStream?.();
    setStreamName("");
    try {
      await updateProfile({
        UpdaterPublicKeyBase58Check: currentUser.PublicKeyBase58Check,
        ProfilePublicKeyBase58Check: "",
        NewUsername: "",
        MinFeeRateNanosPerKB: 1000,
        NewCreatorBasisPoints: 100,
        NewDescription: "",
        NewStakeMultipleBasisPoints: 12500,
        ExtraData: {
          WavesStreamPlaybackId: "",
          WavesStreamTitle: "",
        },
      });
    } catch (error) {
      console.log("something happened: " + error);
    }
  };
console.log(stream)
  const { mutate: recordStream } = useUpdateStream({
    streamId,
    record: true,
  });
  const handleEnableRecording = async () => {
    recordStream?.()
    console.log(recordStream)
  };
  const [isRecordingEnabled, setIsRecordingEnabled] = useState(false); 

  const [twitchStreamKey, setTwitchStreamKey] = useState("");
  const [twitchUsername, setTwitchUsername] = useState("");
  const [twitchInput, setTwitchInput] = useState("");
  const { mutate: twitchMultistream,  error, isSuccess, status: twitchStatus } = useUpdateStream({
  streamId,
  multistream: {
    targets: [
      {
        profile: 'source',
        spec: {
          name: "Twitch",
          url: `rtmp://live.twitch.tv/app/${twitchStreamKey}` // Use the RTMP URL entered by the user
        },
      },
    ],
  },
    
  });

  const handleEnableTwitchMultistream = async () => {
    setTwitchUsername(twitchInput)
    twitchMultistream?.()
  };


 const [ytStreamKey, setYTStreamKey] = useState("");
 const [ytStreamURL, setYTStreamURL] = useState("");
  const { mutate: youtubeMultistream, status: ytmulti,  } = useUpdateStream({
    streamId,
    multistream: {
      targets: [
        {
          profile: 'source',
          spec: {
            name: "Youtube",
            url: `${ytStreamURL}/${ytStreamKey}` // Use the RTMP URL entered by the user
          },
        },
      ],
    },
      
    });

    const handleEnableYTMultistream = async () => {
      youtubeMultistream?.()
    };
  
    const [kickStreamKey, setKickStreamKey] = useState("");
    const [kickStreamURL, setKickStreamURL] = useState("");
     const { mutate: kickMultistream, error: kickmulti,  } = useUpdateStream({
       streamId,
       multistream: {
         targets: [
           {
             profile: 'source',
             spec: {
               name: "Kick",
               url: `${kickStreamURL}/app/${kickStreamKey}` // Use the RTMP URL entered by the user
             },
           },
         ],
       },
         
       });
   
       const handleEnableKickMultistream = async () => {
        kickMultistream?.()
       };


   const [xeenonStreamKey, setXeenonStreamKey] = useState("");
    const [xeenonStreamURL, setXeenonStreamURL] = useState("");
     const { mutate: xeenonMultistream, error: xeenonMulti,  } = useUpdateStream({
       streamId,
       multistream: {
         targets: [
           {
             profile: 'source',
             spec: {
               name: "Xeenon",
               url: `${xeenonStreamURL}${xeenonStreamKey}` // Use the RTMP URL entered by the user
             },
           },
         ],
       },
         
       });
   
       const handleEnableXeenonMultistream = async () => {
        xeenonMultistream?.()
       };




  //On the instance where a user clicks off their profile while streaming or the 'end wave' doesnt work
  //Users can clear the playbackid and title
  const clearWave = async () => {
    try {
      await updateProfile({
        UpdaterPublicKeyBase58Check: currentUser.PublicKeyBase58Check,
        ProfilePublicKeyBase58Check: "",
        NewUsername: "",
        MinFeeRateNanosPerKB: 1000,
        NewCreatorBasisPoints: 100,
        NewDescription: "",
        NewStakeMultipleBasisPoints: 12500,
        ExtraData: {
          WavesStreamPlaybackId: "",
          WavesStreamTitle: "",
          WavesStreamID: "",
        },
      });
    } catch (error) {
      console.log("something happened: " + error);
    }
  };

  
  useEffect(() => {
    const getUpdatedProfile = async () => {
      if (setIsButtonDisabled) {
      try {
        const result = await getSingleProfile({
          PublicKeyBase58Check: currentUser?.PublicKeyBase58Check,
        });

        console.log(result)
      } catch (error) {
        console.log("Something went wrong:", error);
      }
    };

  }  
  }, [setIsButtonDisabled]);
  useEffect(() => {
    const isFollowingPublicKey = async () => {
      try {
        const result = await getIsFollowing({
          PublicKeyBase58Check: currentUser?.PublicKeyBase58Check,
          IsFollowingPublicKeyBase58Check:
            "BC1YLfjx3jKZeoShqr2r3QttepoYmvJGEs7vbYx1WYoNmNW9FY5VUu6",
        });

        setisFollowingWaves(result.IsFollowing);
      } catch (error) {
        console.log("Something went wrong:", error);
      }
    };

    isFollowingPublicKey();
  }, [currentUser]);

  const attachStreamToDesoProfile = async () => {
    try {
      setIsButtonDisabled(true);

      if (isFollowingWaves === false) {
        await updateFollowingStatus({
          MinFeeRateNanosPerKB: 1000,
          IsUnfollow: false,
          FollowedPublicKeyBase58Check:
            "BC1YLfjx3jKZeoShqr2r3QttepoYmvJGEs7vbYx1WYoNmNW9FY5VUu6",
          FollowerPublicKeyBase58Check: currentUser.PublicKeyBase58Check,
        });
      }
      await updateProfile({
        UpdaterPublicKeyBase58Check: currentUser.PublicKeyBase58Check,
        ProfilePublicKeyBase58Check: "",
        NewUsername: "",
        MinFeeRateNanosPerKB: 1000,
        NewCreatorBasisPoints: 100,
        NewDescription: "",
        NewStakeMultipleBasisPoints: 12500,
        ExtraData: {
          WavesStreamPlaybackId: stream?.playbackId,
          WavesStreamTitle: stream?.name,
          WavesStreamID: stream?.id,
        },
      });

      submitPost({
        UpdaterPublicKeyBase58Check: currentUser.PublicKeyBase58Check,
        BodyObj: {
          Body: `${stream?.name}\nTo Subscribe and ensure the best viewing experience, visit: \nhttps://waves-2.vercel.app/wave/${currentUser.ProfileEntryResponse.Username}`,
          VideoURLs: [`https://lvpr.tv/?v=${stream?.playbackId}`],
          ImageURLs: [],
        },
      });
    } catch (error) {
      console.log("something happened: " + error);
      setIsButtonDisabled(false);
    }
  };

  return (
    <Paper shadow="sm" p="lg" withBorder>
       
       <HoverCard width={280} closeDelay={700} shadow="md">
        <HoverCard.Target>
        <ActionIcon radius="xl" size="sm" variant="outline">
      <TiInfoLargeOutline />
      </ActionIcon >
        </HoverCard.Target>
        <HoverCard.Dropdown>
          <Text fw={500} size="sm">
            Before you start streaming select what type of Stream you want.
          </Text>
          <Space h="xs" />
          <Text fw={500} size="sm">
            Streaming via your Webcam is the easiest way to go Live. Once you have created a Stream name just allow access to you Camera/Audio. No 3rd party software is required. It is also Mobile Friendly! 
          </Text>
          <Space h="xs" />
          <Text fw={500} size="sm">
            Streaming via OBS Studio or Streamlabs is great for Gamers and more experienced Streamers. You'll be given a 1-time use Stream Key/URL to go Live!
          </Text>
        </HoverCard.Dropdown>
      </HoverCard>
      <Space h="md" />
      <Tabs
        variant="pills"
        radius="md"
        value={activeTab}
        onTabChange={setActiveTab}
       isDisabled={showOverlay}
      >
        
        
        <Tabs.List position="center">
       
          <Tabs.Tab value="first">Stream via OBS/StreamLabs</Tabs.Tab>
          <Tabs.Tab value="second">
            Stream via Webcam (Mobile Friendly)
          </Tabs.Tab>
        </Tabs.List>
      
        <Space h="md" />
        <Tabs.Panel value="first">
          {" "}
          <Space h="md" />
          <Center>
            <Text fz="lg" fw={777} c="dimmed" truncate>
              Start Streaming
            </Text>
          </Center>
          <Space h="md" />
          <Textarea
            placeholder="Enter Stream Title"
            variant="filled"
            radius="md"
            disabled={disable}
            onChange={(e) => setStreamName(e.target.value)}
          />
          <Space h="xl" />
          {status === "success" && (
            <>
              {streamName ? (
                <>
                              <Card shadow="sm" p="lg" radius="md" withBorder>
                              <HoverCard width={280} closeDelay={700} shadow="md">
        <HoverCard.Target>
        <ActionIcon radius="xl" size="sm" variant="outline">
      <TiInfoLargeOutline    />
      </ActionIcon >
        </HoverCard.Target>
        <HoverCard.Dropdown>
          <Text fw={500} size="sm">
            Now that you have created your stream, copy & paste your Stream URL/Key into OBS Studio or Streamlabs to go Live. 
          </Text>
          <Space h="xs" />
          <Text  fw={500}  size="sm">
            Once your stream is Active, Launch your Wave to your DeSo Account to bring your broadcast to the blockchain!
          </Text>
        </HoverCard.Dropdown>
      </HoverCard>
      
      <Space h="md" />
                              <Group position="center">
                    <Title order={1}><Text radius="sm" fw={700} fz="lg" >
                          {streamName}
                        </Text> </Title>
                      </Group>
                     
                      <Divider my="sm" />
                  
     
      
                      <Group position="center">
                        <CopyButton
                          value="rtmp://rtmp.livepeer.com/live"
                          timeout={2000}
                        >
                          {({ copied, copy }) => (
                            <Button
                              fullWidth
                              color={copied ? "teal" : "blue"}
                              onClick={copy}
                            >
                              {copied ? (
                                <>
                                  <Center>
                                    <h4>Stream Server</h4>
                                    <Space w="xs" />
                                    <IconCheck size={16} />
                                  </Center>
                                </>
                              ) : (
                                <>
                                  <Center>
                                    <h4>Stream Server</h4>
                                    <Space w="xs" />
                                    <IconCopy size={16} />
                                  </Center>
                                </>
                              )}
                            </Button>
                          )}
                        </CopyButton>
                      </Group>
                      <Space h="md" />
                      <Group position="center">
                        <CopyButton value={stream.streamKey} timeout={2000}>
                          {({ copied, copy }) => (
                            <Button
                              fullWidth
                              color={copied ? "teal" : "blue"}
                              onClick={copy}
                            >
                              {copied ? (
                                <>
                                  <Center>
                                    <h4>Stream Key</h4>
                                    <Space w="xs" />
                                    <IconCheck size={16} />
                                  </Center>
                                </>
                              ) : (
                                <>
                                  <Center>
                                    <h4>Stream Key</h4>
                                    <Space w="xs" />
                                    <IconKey size={16} />
                                  </Center>
                                </>
                              )}
                            </Button>
                          )}
                        </CopyButton>

                        <Button
                        rightIcon={<IconRocket size="1rem" />}
                        
                          fullWidth
                          className={classes.button}
                          onClick={() => {
                            attachStreamToDesoProfile();
                            loaded
                              ? setLoaded(false)
                              : !interval.active && interval.start();
                          }}
                          color={loaded ? "teal" : "blue"}
                        >
                          <div className={classes.label}>
                            {progress !== 0
                              ? "Launching"
                              : loaded
                              ? "Launched"
                              : "Launch Wave to Deso"}
                          </div>
                          {progress !== 0 && (
                            <Progress
                              value={progress}
                              className={classes.progress}
                              color={theme.fn.rgba(
                                theme.colors[theme.primaryColor][2],
                                0.35
                              )}
                              radius="sm"
                            />
                          )}
                        </Button>
                      </Group>
                      <Space h="md" />
                      
                    </Card>
                    <Space h="md" />
                  <Group position="center" >
         <Button variant="gradient" gradient={{ from: 'indigo', to: 'cyan' }} fullWidth radius="xl" size="md" onClick={toggleMulti}> <Text align='center' fw={700} fz="lg">Multistream</Text></Button>
      </Group>

      <Collapse in={openedMulti}>
      <Divider my="sm" />
 <Paper shadow="md" radius="md" p="lg" withBorder>
 <HoverCard width={280} closeDelay={700} shadow="md">
        <HoverCard.Target>
        <ActionIcon radius="xl"  size="sm" variant="outline">
      <TiInfoLargeOutline />
      </ActionIcon >
        </HoverCard.Target>
        <HoverCard.Dropdown>
          <Text fw={500} size="sm">
            Broadcast your Stream to multiple platforms with Multistreaming!
          </Text>
          <Space h="xs" />
          <Text fw={500} size="sm">
           Just paste in the necessary information and click the Launch button.
          </Text>
          <Space h="xs" />
          <Text fw={500} size="sm">
           It is recommended to have separate tabs open of your Multistreams to ensure everything is working! 
          </Text>
          <Space h="xs" />
          <Text fw={500} size="sm">
           Be sure to set the Stream Title, Category, etc in the apps you are multistreaming to.
          </Text>
        </HoverCard.Dropdown>
      </HoverCard>
      <Space h="xs" />
<Accordion variant="separated" radius="md" defaultValue="Youtube">
      <Accordion.Item value="Youtube">
      <Accordion.Control icon={<IconBrandYoutube size={rem(30)} color={getColor('red')} />}><Text c="dimmed" fw={500}>Youtube</Text></Accordion.Control>
      <Accordion.Panel>
      
      <Input
        icon={<BiUserCircle />}
        placeholder="Enter Your Youtube Stream URL"
        radius="md"
        value={ytStreamURL}
        onChange={(e) => setYTStreamURL(e.target.value)}
      />
      <Space h="md" />
        <PasswordInput 
        icon={<AiOutlineLink />}
        placeholder="Enter Your Youtube Stream Key"
        radius="md"
        value={ytStreamKey}
        onChange={(e) => setYTStreamKey(e.target.value)}
      />
      <Space h="md" />
      <Group position="right">
        <Button
          rightIcon={<IconRocket size="1rem" />}
          variant="light"
          size="xs"
          onClick={handleEnableYTMultistream}
        >
          Launch
        </Button>
        {ytmulti && <div>{ytmulti.message}</div>}
        </Group>

 
     
     
    </Accordion.Panel>
      </Accordion.Item>

      <Accordion.Item value="Twitch">
      <Accordion.Control icon={<IconBrandTwitch size={rem(30)} color={getColor('grape')} />}><Text c="dimmed" fw={500}>Twitch</Text></Accordion.Control>
      <Accordion.Panel>   
      <Input
        icon={<BiUserCircle />}
        placeholder="Enter Your Twitch Username"
        radius="md"
        value={twitchInput}
        onChange={(e) => setTwitchInput(e.target.value)}
      />
      <Space h="md" />
        <PasswordInput 
        icon={<VscKey />}
        placeholder="Enter Your Twitch Stream Key"
        radius="md"
        value={twitchStreamKey}
        onChange={(e) => setTwitchStreamKey(e.target.value)}
      />
      <Space h="md" />
      <Group position="right">
        <Button
          rightIcon={<IconRocket size="1rem" />}
          variant="light"
          size="xs"
          onClick={handleEnableTwitchMultistream}
        >
          Launch
        </Button>
        {error && <div>{error.message}</div>}
        </Group>

        {twitchUsername &&
        <>
        <Space h="md"/>
        <Center>
    <TwitchPlayer
    channel={twitchUsername}
    width={333}
    muted
    onReady={handleReady}
    id="1"
  />
  <Space w="md"/>
  <TwitchChat   channel={twitchUsername} darkMode /></Center></>}
       </Accordion.Panel>
      </Accordion.Item>

      <Accordion.Item value="Kick">
      <Accordion.Control icon={<RiKickLine size={rem(30)} color='green' />}> <Text c="dimmed" fw={500}>Kick</Text></Accordion.Control>
      <Accordion.Panel> 
      <Input
      icon={<AiOutlineLink />}
      placeholder="Enter Kick Stream URL"
      radius="md"
      value={kickStreamURL}
      onChange={(e) => setKickStreamURL(e.target.value)}
      
    />

<Space h="md" />
      <PasswordInput 
      icon={<VscKey />}
      placeholder="Enter Kick Stream Key"
      radius="md"
      value={kickStreamKey}
      onChange={(e) => setKickStreamKey(e.target.value)}
    />  <Space h="md" />
    <Group position='right'>
     <Button        onClick={handleEnableKickMultistream}  rightIcon={<IconRocket size="1rem" />} variant="light" size="xs">
      Launch
    </Button>
    </Group>
   </Accordion.Panel>
      </Accordion.Item>

    
      <Accordion.Item value="Xeenon">
      <Accordion.Control icon={<Image src={xeenon} height="33px" width="22px"  />}> <Space w={1} /><Text c="dimmed" fw={500}>Xeenon</Text></Accordion.Control>
      <Accordion.Panel> 
      <Input
      icon={<AiOutlineLink />}
      placeholder="Enter Xeenon Stream URL"
      radius="md"
      value={xeenonStreamURL}
      onChange={(e) => setXeenonStreamURL(e.target.value)}
      
    />

<Space h="md" />
      <PasswordInput 
      icon={<VscKey />}
      placeholder="Enter Xeenon Stream Key"
      radius="md"
      value={xeenonStreamKey}
      onChange={(e) => setXeenonStreamKey(e.target.value)}
    />  <Space h="md" />
    <Group position='right'>
     <Button        onClick={handleEnableXeenonMultistream}  rightIcon={<IconRocket size="1rem" />} variant="light" size="xs">
      Launch
    </Button>
    </Group>
   </Accordion.Panel>
      </Accordion.Item>
     
    </Accordion>
     
    </Paper>
      </Collapse>
                      
                         
                          
                    
        
                
              
               
                    
         
                    
                
                  <Space h="md" />
                  <Group position="center">
                    <Player
                      title={stream?.name}
                      playbackId={stream?.playbackId}
                      
                      muted
                    />
                  </Group>

                  <Space h="md" />
                  <Group position="center">
                    <Button
                      fullWidth
                      color="red"
                      radius="xl"
                      onClick={handleEndStream}
                    >
                      End Wave
                    </Button>
                  </Group>
                </>
              ) : (
                <Group position="center">
                  <p>Wave suspended. Refresh to create a new Wave.</p>
                </Group>
              )}
            </>
          )}
          {status === "loading" && (
            <Group position="center">
              <Loader size="sm" />
            </Group>
          )}
          {status === "error" && (
            <Group position="center">
              <p>Error occurred while creating your wave.</p>
            </Group>
          )}
          <Space h="md" />
          {!stream && (
            <Group position="center">
              <Button
                radius="xl"
                onClick={() => {
                  toggle();

                  createStream?.(); // Create the stream and store the result
                }}
                disabled={isLoading || !createStream}
              >
                Create Wave
              </Button>
            </Group>
          )}
          <Space h="md" />
          <Group>
            <CopyButton
              value={`https://waves-2.vercel.app/wave/${currentUser.ProfileEntryResponse.Username}`}
              timeout={2000}
            >
              {({ copied, copy }) => (
                <Button
                  size="xs"
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
                      <Tooltip label="Share your Wave">
                        <IconScreenShare size={16} />
                      </Tooltip>
                    </>
                  )}
                </Button>
              )}
            </CopyButton>

            <Tooltip label="Clear Idle Wave from your profile">
              <Button size="xs" color="red" onClick={clearWave}>
                Clear Wave
              </Button>
            </Tooltip>
          </Group>
        </Tabs.Panel>
        <Tabs.Panel value="second">
          {" "}
          <Space h="md" />
          <Center>
            <Text fz="lg" fw={777} c="dimmed" truncate>
              Start Streaming
            </Text>
          </Center>
          <Space h="md" />
          <Textarea
            placeholder="Enter Stream Title"
            variant="filled"
            radius="md"
            disabled={disable}
            onChange={(e) => setStreamName(e.target.value)}
          />
          <Space h="xl" />
          {status === "success" && (
            <>
              {streamName ? (
                <>
              
                  <Center>
                    <Card shadow="sm" p="lg" radius="md" withBorder>
                    <HoverCard width={280} closeDelay={700} shadow="md">
        <HoverCard.Target>
        <ActionIcon radius="xl"  size="sm" variant="outline">
      <TiInfoLargeOutline />
      </ActionIcon >
        </HoverCard.Target>
        <HoverCard.Dropdown>
          <Text fw={500} size="sm">
            You will be asked to allow Camera/Audio Access for you device. 
          </Text>
          <Space h="xs" />
          <Text fw={500} size="sm">
            Now just Launch your Wave to DeSo!
          </Text>
         
        </HoverCard.Dropdown>
      </HoverCard>
      <Space h="xs" />
                    <Group position="center">
                    <Title order={1}><Text radius="sm" fw={700} fz="lg" >
                          {streamName}
                        </Text> </Title>
                      </Group>
                     
                      <Divider my="sm" />
                 
      
                      <Group position="center">
                        <Button
                          fullWidth
                          className={classes.button}
                          onClick={() => {
                            attachStreamToDesoProfile();
                            loaded
                              ? setLoaded(false)
                              : !interval.active && interval.start();
                          }}
                          color={loaded ? "teal" : "blue"}
                        >
                          <div className={classes.label}>
                            {progress !== 0
                              ? "Launching"
                              : loaded
                              ? "Launched"
                              : "Launch Wave to Deso"}
                          </div>
                          {progress !== 0 && (
                            <Progress
                              value={progress}
                              className={classes.progress}
                              color={theme.fn.rgba(
                                theme.colors[theme.primaryColor][2],
                                0.35
                              )}
                              radius="sm"
                            />
                          )}
                        </Button>
                      </Group>
                      <Space h="md" />
                      
                    </Card>
                    <Space h="xl" />
                  </Center>
                  <Space h="md" />
                  <Group position="center">
                    <Broadcast
                      title={stream?.name}
                      streamKey={stream.streamKey}
                      
                      muted
                    />
                  </Group>

                  <Space h="md" />
                  <Group position="center">
                    <Button
                      fullWidth
                      color="red"
                      radius="xl"
                      onClick={handleEndStream}
                    >
                      End Wave
                    </Button>
                  </Group>
                </>
              ) : (
                <Group position="center">
                  <p>Wave suspended. Refresh to create a new Wave.</p>
                </Group>
              )}
            </>
          )}
          {status === "loading" && (
            <Group position="center">
              <Loader size="sm" />
            </Group>
          )}
          {status === "error" && (
            <Group position="center">
              <p>Error occurred while creating your wave.</p>
            </Group>
          )}
          <Space h="md" />
          {!stream && (
            <Group position="center">
              <Button
                radius="xl"
                onClick={() => {
                  toggle();

                  createStream?.(); // Create the stream and store the result
                }}
                disabled={isLoading || !createStream}
              >
                Create Wave
              </Button>
            </Group>
          )}
          <Space h="md" />
          <Group>
            <CopyButton
              value={`https://waves-2.vercel.app/wave/${currentUser.ProfileEntryResponse.Username}`}
              timeout={2000}
            >
              {({ copied, copy }) => (
                <Button
                  size="xs"
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
                      <Tooltip label="Share your Wave">
                        <IconScreenShare size={16} />
                      </Tooltip>
                    </>
                  )}
                </Button>
              )}
            </CopyButton>

            <Tooltip label="Clear Idle Wave from your profile">
              <Button size="xs" color="red" onClick={clearWave}>
                Clear Wave
              </Button>
            </Tooltip>
          </Group>
        </Tabs.Panel>
      </Tabs>
    </Paper>
  );
};
