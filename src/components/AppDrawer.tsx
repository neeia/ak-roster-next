import { ArrowRight, Description, ExpandLess, ExpandMore, PersonSearch, ManageAccounts } from "@mui/icons-material";
import { Box, Button, Collapse, Divider, Drawer, Link, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from "@mui/material";
import { getAuth, onAuthStateChanged, signOut, User } from "firebase/auth";
import NextLink from "next/link";
import React, { useEffect, useState } from "react";
import config from "../data/config";
import { getUserStatus } from "../util/getUserStatus";
import initFirebase from "../util/initFirebase";
import LoginButton from "./LoginButton";
import RegisterButton from "./RegisterButton";


const DRAWER_WIDTH_PX = 220;
const ICON_BY_PATH = [
  <Description key="d" height="1.5rem" />,
  <ManageAccounts key="a" height="1.5rem" />,
  <PersonSearch key="c" height="1.5rem" />,
];

interface ConfigPage {
  title: string;
  description: string;
  requireLogin?: boolean;
}

const ListItemTab: React.FC<{ tabTitle: string; startOpen: boolean; icon: React.ReactNode; children?: React.ReactNode }> = ({ tabTitle, startOpen, icon, children }) => {
  const [open, setOpen] = React.useState(startOpen);
  return (
    <>
      <ListItemButton
        onClick={() => setOpen(!open)}>
        <ListItemIcon sx={{ minWidth: 0, pr: 1 }}>
          {icon}
        </ListItemIcon>
        <ListItemText primary={tabTitle} />
        {open ? <ExpandLess height="1.5rem" /> : <ExpandMore height="1.5rem" />}
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        {children}
      </Collapse>
    </>
  )
}

interface Props {
  tab: string;
  page: string;
  open: boolean;
  onDrawerToggle: () => void;
}

const AppDrawer: React.FC<Props> = React.memo((props) => {
  const { tab, page, open, onDrawerToggle } = props;
  const { siteTitle, siteUrl, tabs } = config;
  const { title: currentTab, pages } = tabs[tab as keyof typeof tabs];
  const { title: currentPage } = pages[page as keyof typeof pages] ?? {};

  initFirebase();
  const [user, setUser] = useState<User | null>();
  useEffect(() => {
    getUserStatus().then((user) => {
      setUser(user);
    })
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
  }, []);

  const [login, setLogin] = useState(false);
  const [register, setRegister] = useState(false);

  const drawerContent = (
    <>
      <Typography
        component="h1"
        variant="h4"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "48px"
        }}
      >
        <NextLink
          href={`/`}
        >
          {siteTitle}
        </NextLink>
        {/*<Offset />*/}
      </Typography>
      <Divider />
      <Box sx={{ display: user ? "none" : "grid", gridTemplateColumns: "1fr 1fr", gap: "4px", m: "4px" }}>
        <Button onClick={() => setLogin(true)}>
          Log In
        </Button>
        <Button onClick={() => setRegister(true)}>
          Register
        </Button>
        <LoginButton open={login} onClose={() => setLogin(false)}>
          <Button
            onClick={() => {
              setRegister(true);
              setLogin(false);
            }}
            sx={{ color: "text.secondary" }}
          >
            Sign Up Instead
          </Button>
        </LoginButton>
        <RegisterButton open={register} onClose={() => setRegister(false)} >
          <Button
            onClick={() => {
              setRegister(false);
              setLogin(true);
            }}
            sx={{ color: "text.secondary" }}
          >
            Log In Instead
          </Button>
        </RegisterButton>
      </Box>
      <Box sx={{ display: user ? "grid" : "none", gridTemplateColumns: "1fr 1fr", gap: "4px", m: "4px" }}>
        <Button onClick={() => { signOut(getAuth()) }}>
          Sync Data
        </Button>
        <Button onClick={() => { signOut(getAuth()) }}>
          Log Out
        </Button>
      </Box>
      <Divider />
      <List>
        {Object.entries(tabs).map(([tabPath, { title: tabTitle, pages }], i: number) => (
          <ListItemTab
            key={i}
            tabTitle={tabTitle}
            startOpen={tabTitle === currentTab}
            icon={ICON_BY_PATH[i]}
          >
            {Object.entries(pages)
              .map(([pagePath, pg]: [string, ConfigPage]) => (
                <ListItem
                  key={pg.title}
                  sx={{
                    p: 0,
                    "& .Mui-focusVisible": {
                      color: "#fff"
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 0, pr: 1, pl: 3, }}>
                    <ArrowRight height="1.5rem" />
                  </ListItemIcon>
                  <ListItemButton
                    tabIndex={-1}
                    sx={{
                      p: 0,
                      ...(currentPage === pg.title && {
                        bgcolor: "primary.main",
                        ":hover": {
                          bgcolor: "primary.main",
                          filter: "brightness(110%)"
                        },
                      })
                    }}
                    disabled={pg.requireLogin && !user}
                  >
                    <NextLink
                      href={`${tabPath}${pagePath}`}
                      passHref
                    >
                      <Link
                        sx={{
                          display: "block",
                          width: "100%",
                          px: 2,
                          py: 1.5,
                          ...(currentPage === pg.title && {
                            color: "background.paper",
                            fontWeight: "bold",
                          }),
                        }}
                        variant="body2"
                      >
                        {pg.title}
                      </Link>
                    </NextLink>
                  </ListItemButton>
                </ListItem>
              ))}
          </ListItemTab>
        ))}
      </List>
    </>
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
              xl: "none"
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
              xl: "flex"
            }
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
})

AppDrawer.displayName = "AppDrawer";
export default AppDrawer;