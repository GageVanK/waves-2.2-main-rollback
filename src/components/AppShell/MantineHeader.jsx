import { identity } from "deso-protocol";
import { useContext, useState, useEffect } from "react";
import { DeSoIdentityContext } from "react-deso-protocol";
import { getDisplayName } from "../../helpers";
import Pride from "../../assets/pride.png";
import {
  createStyles,
  Menu,
  Header,
  Group,
  Button,
  Text,
  Divider,
  Box,
  Burger,
  Drawer,
  ScrollArea,
  getStylesRef,
  rem,
  Loader,
  UnstyledButton,
  Space,
  Image,
  Badge
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { GiWaveCrest } from "react-icons/gi";
import { Search } from "../Search";
import {
  IconBellRinging,
  IconUser,
  IconReceipt2,
  IconHome2,
  IconDeviceDesktopAnalytics,
  IconLogout,
  IconSwitchHorizontal,
  IconChevronRight,
  IconSearch,
} from "@tabler/icons-react";
import { Link, useLocation } from "react-router-dom";

const useStyles = createStyles((theme) => ({
  buttonBox: {
    maxWidth: "222px",
  },
  link: {
    display: "flex",
    alignItems: "center",
    height: "100%",
    paddingLeft: theme.spacing.md,
    paddingRight: theme.spacing.md,
    textDecoration: "none",
    color: theme.colorScheme === "dark" ? theme.white : theme.black,
    fontWeight: 500,
    fontSize: theme.fontSizes.sm,

    [theme.fn.smallerThan("sm")]: {
      height: rem(42),
      display: "flex",
      alignItems: "center",
      width: "100%",
    },

    ...theme.fn.hover({
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[6]
          : theme.colors.gray[0],
    }),
  },

  subLink: {
    width: "100%",
    padding: `${theme.spacing.xs} ${theme.spacing.md}`,
    borderRadius: theme.radius.md,

    ...theme.fn.hover({
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[7]
          : theme.colors.gray[0],
    }),

    "&:active": theme.activeStyles,
  },

  dropdownFooter: {
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[7]
        : theme.colors.gray[0],
    margin: `calc(${theme.spacing.md} * -1)`,
    marginTop: theme.spacing.sm,
    padding: `${theme.spacing.md} calc(${theme.spacing.md} * 2)`,
    paddingBottom: theme.spacing.xl,
    borderTop: `${rem(1)} solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[1]
    }`,
  },

  hiddenMobile: {
    [theme.fn.smallerThan("sm")]: {
      display: "none",
    },
  },

  hiddenDesktop: {
    [theme.fn.largerThan("sm")]: {
      display: "none",
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

const data = [
  { link: "/", label: "Home", icon: IconHome2 },

  { link: "/profile", label: "Profile", icon: IconUser },
  { link: "/discover", label: "Discover", icon: IconDeviceDesktopAnalytics },
  { link: "/notifications", label: "Notifications", icon: IconBellRinging },
  { link: "/wallet", label: "Wallet", icon: IconReceipt2 },
];

export const MantineHeader = () => {
  const { currentUser, alternateUsers, isLoading } =
    useContext(DeSoIdentityContext);
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] =
    useDisclosure(false);
  const { classes, theme, cx } = useStyles();

  const location = useLocation();
  const [active, setActive] = useState(() => {
    const currentPage = data.find((item) => item.link === location.pathname);
    return currentPage ? currentPage.label : "Home";
  });

  const links = data.map((item) => (
    <Link
      to={item.link}
      className={cx(classes.link, {
        [classes.linkActive]: item.label === active,
      })}
      key={item.label}
      onClick={() => {
        closeDrawer();
        setActive(item.label);
      }}
    >
      <item.icon className={classes.linkIcon} stroke={1.5} />
      <Space h="xs" />
      <span>{item.label}</span>
    </Link>
  ));

  const handleUserSwitch = (publicKey) => {
    identity.setActiveUser(publicKey);
  };

  const handleLogout = () => {
    if (alternateUsers && alternateUsers.length > 0) {
      const firstAlternateUser = alternateUsers[0];
      identity.logout().then(() => {
        handleUserSwitch(firstAlternateUser.PublicKeyBase58Check);
      });
    } else {
      identity.logout();
    }
  };

  return (
    <nav className="main-nav">
      <div className="main-nav__user-actions">
        {isLoading ? (
          <Loader variant="bars" />
        ) : (
          <>
            <Box pb={5}>
              <Header height={60} px="md">
                <Group position="apart" sx={{ height: "100%" }}>
                  <UnstyledButton to="/" component={Link}>
                    <Group>
                      <Text
                        fz="xl"
                        fw={1000}
                        inherit
                        variant="gradient"
                        component="span"
                      >
                        Waves
                      </Text>
                   <Badge size="xs" radius="xs" variant="filled">BETA</Badge>
                    </Group>
                  </UnstyledButton>

                  <Group className={classes.hiddenMobile}>
                    {isLoading ? (
                      <div>Loading...</div>
                    ) : (
                      <>
                        <Search />
                        {!currentUser && (!alternateUsers || alternateUsers.length === 0) && (
                          <>
                            <Button
                              variant="default"
                              onClick={() => identity.login()}
                            >
                              Login
                            </Button>
                            <Button
                              leftIcon={<GiWaveCrest size="1rem" />}
                              variant="gradient"
                              gradient={{ from: "cyan", to: "indigo" }}
                              onClick={() => identity.login()}
                            >
                              Sign Up
                            </Button>
                          </>
                        )}

                        {!!currentUser && (
                          <Menu
                            trigger="hover"
                            openDelay={100}
                            closeDelay={400}
                            shadow="md"
                            width={200}
                            zIndex={1000000}
                          >
                            <Menu.Target>
                              <Button
                                leftIcon={<GiWaveCrest size="1rem" />}
                                variant="gradient"
                                gradient={{ from: "cyan", to: "indigo" }}
                              >
                                {getDisplayName(currentUser)}
                              </Button>
                            </Menu.Target>

                            <Menu.Dropdown>
                              {alternateUsers?.length > 0 && (
                                <Menu.Label>Accounts</Menu.Label>
                              )}

                              {alternateUsers?.map((user) => (
                                <Menu.Item
                                  icon={<IconUser size={17} />}
                                  key={user.PublicKeyBase58Check}
                                  onClick={() =>
                                    identity.setActiveUser(
                                      user.PublicKeyBase58Check
                                    )
                                  }
                                  style={{
                                    maxWidth: "190px", // Adjust the maximum width as needed
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                >
                                  {getDisplayName(user)}
                                </Menu.Item>
                              ))}

                              <Menu.Divider />

                              <Menu.Label>Visit DeSo Wallet</Menu.Label>
                              <Menu.Item
                                onClick={() =>
                                  window.open(
                                    "https://wallet.deso.com/",
                                    "_blank"
                                  )
                                }
                                icon={<IconReceipt2 size={17} />}
                              >
                                DeSo Wallet
                              </Menu.Item>

                              <Menu.Divider />

                              <Menu.Item
                                icon={<IconSwitchHorizontal size={17} />}
                                onClick={() => identity.login()}
                              >
                                Add Account
                              </Menu.Item>

                              <Menu.Item
                                icon={<IconLogout size={17} />}
                                onClick={handleLogout}
                              >
                                Logout
                              </Menu.Item>
                            </Menu.Dropdown>
                          </Menu>
                        )}
                      </>
                    )}
                  </Group>

                  <Group position="right" className={classes.hiddenDesktop}>
                   

                    <Burger
                      opened={drawerOpened}
                      onClick={toggleDrawer}
                      className={classes.hiddenDesktop}
                    />
                  </Group>
                </Group>
              </Header>

              <Drawer
                opened={drawerOpened}
                onClose={closeDrawer}
                size="77%"
                padding="md"
                title={
                  <>
                  <Group>
                   <Text
                        fz="xl"
                        fw={1000}
                        inherit
                        variant="gradient"
                        component="span"
                      >
                        Waves
                      </Text>
                   <Badge size="xs" radius="xs" variant="filled">BETA</Badge>
                   </Group>
                   </>
                }
                className={classes.hiddenDesktop}
                zIndex={1000000}
              >
                <ScrollArea h={`calc(100vh - ${rem(60)})`} mx="-md">
                  <Divider
                    my="sm"
                    color={theme.colorScheme === "dark" ? "dark.5" : "gray.1"}
                  />
 <Search />
  <Divider
                    my="sm"
                    color={theme.colorScheme === "dark" ? "dark.5" : "gray.1"}
                  />
                  {links}
                  <Divider
                    my="sm"
                    color={theme.colorScheme === "dark" ? "dark.5" : "gray.1"}
                  />

                  <Group position="center" grow pb="xl" px="md">
                    {isLoading ? (
                      <div>Loading...</div>
                    ) : (
                      <>
                        {!currentUser && (
                          <>
                            <Button
                              onClick={() => identity.login()}
                              variant="default"
                            >
                              Log in
                            </Button>
                            <Button
                              leftIcon={<GiWaveCrest size="1rem" />}
                              variant="gradient"
                              gradient={{ from: "cyan", to: "indigo" }}
                              onClick={() => identity.login()}
                            >
                              Sign Up
                            </Button>
                          </>
                        )}

                        {!!currentUser && (
                          <Menu
                            openDelay={100}
                            closeDelay={400}
                            shadow="md"
                            width={200}
                            rightIcon={<IconChevronRight size="1rem" />}
                          >
                            <Menu.Target>
                              <Button
                                leftIcon={<GiWaveCrest size="1rem" />}
                                variant="gradient"
                                gradient={{ from: "cyan", to: "indigo" }}
                                className={classes.buttonBox}
                              >
                                {getDisplayName(currentUser)}
                              </Button>
                            </Menu.Target>

                            <Menu.Dropdown>
                              {alternateUsers?.length > 0 && (
                                <Menu.Label>Accounts</Menu.Label>
                              )}

                              {alternateUsers?.map((user) => (
                                <Menu.Item
                                  style={{
                                    maxWidth: "190px", // Adjust the maximum width as needed
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                  icon={<IconUser size={17} />}
                                  key={user.PublicKeyBase58Check}
                                  onClick={() =>
                                    identity.setActiveUser(
                                      user.PublicKeyBase58Check
                                    )
                                  }
                                >
                                  <Text fs="sm" truncate="end">
                                    {getDisplayName(user)}
                                  </Text>
                                </Menu.Item>
                              ))}

                              <Menu.Divider />
                              <Menu.Label>Visit DeSo Wallet</Menu.Label>
                              <Menu.Item
                                onClick={() =>
                                  window.open(
                                    "https://wallet.deso.com/",
                                    "_blank"
                                  )
                                }
                                icon={<IconReceipt2 size={17} />}
                              >
                                DeSo Wallet
                              </Menu.Item>
                              <Menu.Divider />
                              <Menu.Item
                                icon={<IconSwitchHorizontal size={17} />}
                                onClick={() => identity.login()}
                              >
                                Add Account
                              </Menu.Item>

                              <Menu.Item
                                icon={<IconLogout size={17} />}
                                onClick={() => identity.logout()}
                              >
                                Logout
                              </Menu.Item>
                            </Menu.Dropdown>
                          </Menu>
                        )}
                      </>
                    )}
                  </Group>
                </ScrollArea>
              </Drawer>
            </Box>
          </>
        )}
      </div>
    </nav>
  );
};