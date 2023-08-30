import {
  createStyles,
  Footer,
  rem,
  Modal,
  ActionIcon,
  Group,
  getStylesRef,
  Text
} from "@mantine/core";
import { useState, useContext, useEffect } from "react";
import {
  IconBellRinging,
  IconUser,
  IconHome2,
  IconDeviceDesktopAnalytics,
  IconReceipt2,
} from "@tabler/icons-react";
import { RxCardStackPlus } from "react-icons/rx";
import { SignAndSubmitTx } from "../../routes/sign-and-submit-tx";
import { useNavigate } from "react-router-dom";
import { DeSoIdentityContext } from "react-deso-protocol";
import {
  getUnreadNotificationsCount,
 
  setNotificationMetadata
} from "deso-protocol";

const useStyles = createStyles((theme) => ({
  footer: {
    marginTop: rem(120),
    borderTop: `${rem(1)} solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[2]
    }`,
    [theme.fn.largerThan("sm")]: {
      display: "none",
    },
  },

  link: {
    ...theme.fn.focusStyles(),
    display: "flex",
    alignItems: "center",
    textDecoration: "none",

    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[1]
        : theme.colors.gray[7],
    padding: `${theme.spacing.sm} ${theme.spacing.sm}`,

    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[6]
          : theme.colors.gray[0],
      color: theme.colorScheme === "dark" ? theme.white : theme.black,

      [`& .${getStylesRef("icon")}`]: {
        color: theme.colorScheme === "dark" ? theme.white : theme.black,
      },
    },
  },

  linkIcon: {
    ref: getStylesRef("icon"),
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[2]
        : theme.colors.gray[6],
    marginRight: theme.spacing.sm,
  },

  linkActive: {
    "&, &:hover": {
      backgroundColor: theme.fn.variant({
        variant: "light",
        color: theme.primaryColor,
      }).background,
      color: theme.fn.variant({ variant: "light", color: theme.primaryColor })
        .color,
      [`& .${getStylesRef("icon")}`]: {
        color: theme.fn.variant({ variant: "light", color: theme.primaryColor })
          .color,
      },
    },
  },
}));

export const MantineFooter = () => {
  const [slowTransitionOpened, setSlowTransitionOpened] = useState(false);
  const { currentUser } = useContext(DeSoIdentityContext);
  const navigate = useNavigate();
  const [active, setActive] = useState("Home");
  const { classes, cx } = useStyles();
const [unreadNotifs, setUnreadNotifs] = useState(0);
 const fetchUnreadNotifications = async () => {
    const notifData = await getUnreadNotificationsCount({
      PublicKeyBase58Check: currentUser.PublicKeyBase58Check,
    });

    console.log(notifData);
    setUnreadNotifs(notifData.NotificationsCount)
  };

   // Fetch the followingPosts when the currentUser changes
   useEffect(() => {
    if (currentUser) {
     
      fetchUnreadNotifications();
    }
  }, [currentUser]);

  const resetUnreadNotifications = async () => {
    const notifData = await getUnreadNotificationsCount({
      PublicKeyBase58Check: currentUser.PublicKeyBase58Check,
    });
    await setNotificationMetadata({
      PublicKeyBase58Check: currentUser.PublicKeyBase58Check,
      UnreadNotifications: 0,
      LastUnreadNotificationIndex:  notifData.LastUnreadNotificationIndex
    });

    setUnreadNotifs(0)
  };

  return (
    <>
      <Modal
        opened={slowTransitionOpened}
        onClose={() => setSlowTransitionOpened(false)}
        transitionProps={{ transition: "pop" }}
      >
        <SignAndSubmitTx />
      </Modal>

      <Footer p="md" className={classes.footer}>
        <Group position="center" spacing="lg" grow noWrap>
          <ActionIcon
            size="xl"
            radius="xl"
            className={cx(classes.link, {
              [classes.linkActive]: active === "/",
            })}
            onClick={() => {
              setActive("/");
              navigate("/");
            }}
          >
            <IconHome2 size="1.4rem" className={classes.actionIcon} />
          </ActionIcon>

          <ActionIcon
            size="xl"
            radius="xl"
            className={cx(classes.link, {
              [classes.linkActive]: active === "/profile",
            })}
            onClick={() => {
              setActive("/profile");
              navigate("/profile");
            }}
          >
            <IconUser size="1.4rem" className={classes.actionIcon} />
          </ActionIcon>

          {currentUser && (
            <ActionIcon
              onClick={() => setSlowTransitionOpened(true)}
              color="blue"
              size="xl"
              radius="md"
              variant="filled"
            >
              <RxCardStackPlus size="1.7rem" />
            </ActionIcon>
          )}

          <ActionIcon
            size="xl"
            radius="xl"
            className={cx(classes.link, {
              [classes.linkActive]: active === "/wallet",
            })}
            onClick={() => {
              setActive("/wallet");
              navigate("/wallet");
            }}
          >
            <IconReceipt2 size="1.4rem" className={classes.actionIcon} />
          </ActionIcon>

          <ActionIcon
            size="xl"
            radius="xl"
            className={cx(classes.link, {
              [classes.linkActive]: active === "/notifications",
            })}
            onClick={() => {
              setActive("/notifications");
              navigate("/notifications");
              resetUnreadNotifications()
            }}
          >
             { unreadNotifs > 0 && (
          <Text  className={classes.notificationCount} fz="sm" fw={700} c="orange">{unreadNotifs}</Text>
        )}
            <IconBellRinging size="1.4rem" className={classes.actionIcon} />
          </ActionIcon>
        </Group>
      </Footer>
    </>
  );
};
