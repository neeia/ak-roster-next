import {
  ArrowRight,
  Description,
  ExpandLess,
  ExpandMore,
  PersonSearch,
} from "@mui/icons-material";
import {
  Box,
  Button,
  CircularProgress,
  Collapse,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import config from "data/config";
import DiscordInvite from "./app/DiscordInvite";
import LoginForm from "./app/LoginDialog";
import RegisterForm from "./app/RegisterDialog";
import { useRouter } from "next/router";
import Logo from "./app/Logo";
import AccountContextMenu from "./app/AccountContextMenu";
import { UserContext } from "pages/_app";
import { skipToken } from "@reduxjs/toolkit/query";
import { useAccountGetQuery, useAccountUpdateMutation } from "store/extendAccount";
import { interactive } from "styles/theme/appTheme";
import randomName from "util/randomName";
import JumpTo from "./base/JumpTo";

const DRAWER_WIDTH_PX = 220;
const ICON_BY_PATH = [
  <Description key="d" height="1.5rem" />,
  <PersonSearch key="c" height="1.5rem" />,
  <svg
    key="0"
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
  >
    <path
      fill="currentColor"
      d="M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2
      m0 2v4h10V4H7m0 6v2h2v-2H7m4 0v2h2v-2h-2m4 0v2h2v-2h-2m-8 4v2h2v-2H7
      m4 0v2h2v-2h-2m4 0v2h2v-2h-2m-8 4v2h2v-2H7m4 0v2h2v-2h-2m4 0v2h2v-2h-2Z"
    />
  </svg>,
];

interface ConfigPage {
  title: string;
  description: string;
  requireLogin?: boolean;
}

const ListItemTab: React.FC<{
  tabTitle: string;
  startOpen: boolean;
  icon: React.ReactNode;
  children?: React.ReactNode;
}> = ({ tabTitle, startOpen, icon, children }) => {
  const [open, setOpen] = React.useState(startOpen);
  return (
    <>
      <ListItemButton onClick={() => setOpen(!open)}>
        <ListItemIcon sx={{ minWidth: 0, pr: 1 }}>{icon}</ListItemIcon>
        <ListItemText primary={tabTitle} />
        {open ? <ExpandLess height="1.5rem" /> : <ExpandMore height="1.5rem" />}
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        {children}
      </Collapse>
    </>
  );
};

interface Props {
  tab: string;
  page: string;
  open: boolean;
  onDrawerToggle: () => void;
}

const AppDrawer = React.memo((props: Props) => {
  const { tab, page, open, onDrawerToggle } = props;
  const { tabs } = config;
  const { title: currentTab, pages, requireLogin: r1 } = tabs[tab];
  const { title: currentPage, requireLogin: r2 } = pages[page];
  const requireLogin = r1 || r2;
  const [trigger, out] = useAccountUpdateMutation();

  const user = useContext(UserContext);
  const [username, setUsername] = useState<string | null>();
  const { data: accountData, isSuccess } = useAccountGetQuery(user ? { user_id: user.id } : skipToken);
  useEffect(() => {
    if (user && accountData) {
      if (accountData.display_name) {
        setUsername(accountData.display_name);
      }
      else if (!accountData.display_name) {
        const genName = randomName();
        trigger({ user_id: user.id, username: genName, display_name: genName, private: false, });
      }
    }
    if (!user && requireLogin) router.push("/");
  }, [accountData])

  const router = useRouter();

  const [login, setLogin] = useState(false);
  const [register, setRegister] = useState(false);

  const drawerContent = (
    <Box sx={{ height: "100%", maxHeight: "100%", overflow: "hidden", display: "flex", flexDirection: "column", gap: "16px", py: "16px" }}>
      <JumpTo onClick={() => {
        const main = document.getElementById("app-main");
        if (!main) return;
        const el = findFirstFocusableElement(main);
        if (el) (el as HTMLElement).focus();
      }}>skip to main content</JumpTo>
      <Logo hideSubtitle
        sx={{ width: "100%", height: "200px", }}
        LinkProps={{ sx: { position: "relative" } }}
      >
        <Typography sx={{ position: "absolute", fontSize: "0.625rem", lineHeight: 0, bottom: 7.5, right: 8, }}>3.0</Typography>
      </Logo>
      <Divider />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}
      >
        {!user ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "4px",
              mx: "8px"
            }}
          >
            <Button onClick={() => setLogin(true)}>Log In</Button>
            <Button onClick={() => setRegister(true)}>Register</Button>
          </Box>
        ) : null}
        <LoginForm open={login} onClose={() => setLogin(false)} />
        <RegisterForm open={register} onClose={() => setRegister(false)} />
        {user ? (
          <>
            <Box sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              width: "100%",
              maxWidth: "600px",
              backgroundColor: "background.paper",
              borderRadius: 1,
              px: 2,
            }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography sx={{ fontSize: "0.875rem", color: "text.secondary" }}>Signed in as</Typography>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    {username ?? <CircularProgress size={24} />}
                  </Box>
                </Box>
                <AccountContextMenu />
              </Box>
            </Box>
          </>
        ) : null}
      </Box>
      <Divider />
      <List sx={{
        height: "100%",
        overflowY: "auto",
        scrollbarColor: "#6b6b6b transparent",
        scrollbarWidth: "thin",
        '*::-webkit-scrollbar': {
          width: "12px"
        },
        '*::-webkit-scrollbar-track': {
          background: "transparent",
        },
        '*::-webkit-scrollbar-thumb': {
          backgroundColor: "#6b6b6b",
          borderRadius: 4,
          border: "transparent",
          outline: "transparent",
        },
      }}>
        {Object.entries(tabs)
          .filter(([_, { exclude }]) => !exclude)
          .map(
            ([tabPath, { title: tabTitle, pages }], i: number) => (
              <ListItemTab
                key={i}
                tabTitle={tabTitle}
                startOpen={tabTitle === currentTab}
                icon={ICON_BY_PATH[i]}
              >
                {Object.entries(pages).map(
                  ([pagePath, pg]: [string, ConfigPage]) => (
                    <ListItem key={pg.title}
                      disablePadding
                      sx={{
                        ...(currentPage === pg.title && {
                          borderLeftWidth: "8px",
                          borderLeftStyle: "solid",
                          borderColor: "primary.main",
                          fontWeight: "bold",
                        }),
                      }}
                    >
                      <ListItemButton component="a" href={`${tabPath}${pagePath}`}
                        sx={{
                          p: 0,
                          ...(currentPage === pg.title && interactive),
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 0, pr: 1, pl: 3 }}>
                          <ArrowRight height="1.5rem" />
                        </ListItemIcon>
                        <ListItemText
                          sx={{
                            display: "block",
                            width: "100%",
                            px: 1,
                            py: 2,
                            m: 0,
                          }}
                          primaryTypographyProps={{
                            sx: {
                              fontSize: "1rem",
                              lineHeight: 1,
                            }
                          }}
                          primary={pg.title}
                        />
                      </ListItemButton>
                    </ListItem>
                  )
                )}
              </ListItemTab>
            )
          )}
      </List>
      <Divider />
      <DiscordInvite />
    </Box>
  );

  return (
    <Box
      component="nav"
      gridArea="drawer"
      sx={{
        width: {
          xs: 0,
          xl: `${DRAWER_WIDTH_PX}px`,
        },
      }}
    >
      <Drawer
        variant="temporary"
        anchor="left"
        open={open}
        onClose={onDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        PaperProps={{
          sx: {
            width: DRAWER_WIDTH_PX,
            display: {
              xs: "flex",
              xl: "none",
            },
            boxShadow: 6,
            backgroundImage: "none",
          },
        }}
      >
        {drawerContent}
      </Drawer>
      <Drawer
        variant="permanent"
        open
        PaperProps={{
          sx: {
            width: DRAWER_WIDTH_PX,
            display: {
              xs: "none",
              xl: "flex",
            },
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
});

AppDrawer.displayName = "AppDrawer";
export default AppDrawer;


const findFirstFocusableElement = (container: HTMLElement) => {
  return Array.from(container.getElementsByTagName("*")).find(isFocusable);
};

const isFocusable = (item: any) => {
  if (item.tabIndex < 0) {
    return false;
  }
  switch (item.tagName) {
    case "A":
      return !!item.href;
    case "INPUT":
      return item.type !== "hidden" && !item.disabled;
    case "SELECT":
    case "TEXTAREA":
    case "BUTTON":
      return !item.disabled;
    default:
      return false;
  }
};