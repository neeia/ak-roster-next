import React, { useContext, useEffect } from "react";
import { AppBar, Box, Container, IconButton, ThemeProvider, Toolbar, Typography } from "@mui/material";
import config from "data/config";
import MenuIcon from "@mui/icons-material/Menu";
import AppDrawer from "./AppDrawer";
import Head from "./app/Head";
import { server } from "util/server";
import createTheme, { brand } from "styles/theme/appTheme";
import { UserContext } from "pages/_app";
import { useRouter } from "next/router";
import useAccount from "util/hooks/useAccount";

interface Props {
  tab: string;
  page: string;
  header?: React.ReactNode;
  children?: React.ReactNode;
}
const Layout = React.memo((props: Props) => {
  const { page, tab, children, header } = props;
  const { siteDescription, tabs } = config;
  const { pages, requireLogin: r1 } = tabs[tab];
  const { title, description, requireLogin: r2 } = pages[page];

  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const handleDrawerToggle = React.useCallback(() => {
    setDrawerOpen((open) => !open);
  }, []);

  const user = useContext(UserContext);
  const router = useRouter();
  const requireLogin = r1 || r2;

  const [account, , { loading }] = useAccount();
  useEffect(() => {
    if (!user && !loading && requireLogin) router.push("/");
  }, [user, account, loading, requireLogin, router]);

  return (
    <ThemeProvider theme={createTheme(brand[tab] ?? brand.DEFAULT)}>
      <Head title={title} url={`${server}${tab ?? ""}${page}`} description={description ?? siteDescription} />
      <Box
        display="grid"
        height="100%"
        gridTemplateAreas={'"drawer header" "drawer main"'}
        gridTemplateRows="auto 1fr auto"
        sx={{
          gridTemplateColumns: {
            xs: "0px 1fr",
            xl: "220px 1fr",
          },
        }}
      >
        <AppDrawer tab={tab} page={page} open={drawerOpen} onDrawerToggle={handleDrawerToggle} />
        <AppBar position="sticky" enableColorOnDark sx={{ gridArea: "header" }}>
          <Toolbar variant="dense" sx={{ gap: 1 }}>
            {header ?? (
              <>
                <IconButton
                  color="inherit"
                  aria-label="navigation menu"
                  edge="start"
                  onClick={handleDrawerToggle}
                  sx={{
                    mr: 2,
                    display: {
                      xl: "none",
                    },
                  }}
                >
                  <MenuIcon sx={{ color: "background.paper" }} />
                </IconButton>
                <Box component="span" sx={{ verticalAlign: "bottom" }}>
                  <Typography component="h1" variant="h5" noWrap sx={{ display: "inline", verticalAlign: "baseline" }}>
                    {title}
                  </Typography>
                </Box>
              </>
            )}
          </Toolbar>
        </AppBar>
        <Container
          id="app-main"
          component="main"
          maxWidth="xxl"
          sx={{ gridArea: "main", p: { xs: 1, sm: 2 }, position: "relative" }}
        >
          {children}
        </Container>
      </Box>
    </ThemeProvider>
  );
});
Layout.displayName = "Layout";
export default Layout;
