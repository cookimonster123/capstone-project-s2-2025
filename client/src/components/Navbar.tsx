import React from "react";
import { NavLink } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import { useAuth } from "../context/AuthContext";
import { fetchUserById } from "../api/userApi";
import DarkModeToggle from "./common/DarkModeToggle";

// Adjust these imports to your real asset names if needed.
import logo from "../assets/capstone.svg";
import defaultAvatar from "../assets/default_avatar.jpg";

/** Single source of truth for header height. */
export const NAV_HEIGHT = 80;

/** Centralized nav links – maintain in one place. */
const links = [
   { label: "About", to: "/about" },
   { label: "Projects", to: "/projects" },
];

const Navbar: React.FC = () => {
   const { isLoggedIn, signOut, user } = useAuth();
   const [menuEl, setMenuEl] = React.useState<null | HTMLElement>(null);
   const [fullUser, setFullUser] = React.useState<any>(null);
   const [mobileOpen, setMobileOpen] = React.useState(false);

   React.useEffect(() => {
      const loadUserDetails = async () => {
         if (!user?.id) return;
         try {
            const data = await fetchUserById(user.id);
            setFullUser(data);
         } catch (error) {
            console.error("Failed to fetch user details:", error);
         }
      };
      loadUserDetails();
   }, [user?.id]);

   // Determine dashboard path based on user role
   const getDashboardPath = () => {
      if (!user) return "/profile";
      switch (user.role) {
         case "admin":
            return "/admin";
         case "staff":
            return "/staff";
         default:
            return "/profile";
      }
   };

   const avatarSrc = (() => {
      if (
         user &&
         Object.prototype.hasOwnProperty.call(user, "profilePicture")
      ) {
         return user.profilePicture && user.profilePicture.trim() !== ""
            ? user.profilePicture
            : defaultAvatar; // explicit cleared -> default
      }

      if (
         fullUser?.user?.profilePicture &&
         fullUser.user.profilePicture.trim() !== ""
      ) {
         return fullUser.user.profilePicture;
      }

      return defaultAvatar;
   })();

   return (
      <AppBar
         position="fixed"
         elevation={0}
         sx={{
            backgroundColor: (theme) =>
               theme.palette.mode === "dark"
                  ? "rgba(21, 27, 43, 0.85)"
                  : "rgba(251, 251, 253, 0.72)",
            backdropFilter: "saturate(180%) blur(20px)",
            WebkitBackdropFilter: "saturate(180%) blur(20px)",
            color: "text.primary",
            borderBottom: (theme) =>
               theme.palette.mode === "dark"
                  ? "1px solid rgba(255, 255, 255, 0.08)"
                  : "1px solid rgba(0, 0, 0, 0.06)",
            height: NAV_HEIGHT,
            justifyContent: "center",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "&::before": {
               content: '""',
               position: "absolute",
               top: 0,
               left: 0,
               right: 0,
               height: "1px",
               background: (theme) =>
                  theme.palette.mode === "dark"
                     ? "linear-gradient(90deg, transparent, rgba(0, 153, 255, 0.3) 50%, transparent)"
                     : "linear-gradient(90deg, transparent, rgba(0, 102, 204, 0.2) 50%, transparent)",
               opacity: 0.3,
            },
            // Scroll 效果
            "@media (prefers-reduced-motion: no-preference)": {
               "&:hover": {
                  backgroundColor: (theme) =>
                     theme.palette.mode === "dark"
                        ? "rgba(21, 27, 43, 0.95)"
                        : "rgba(255, 255, 255, 0.85)",
               },
            },
         }}
      >
         <Toolbar
            sx={{
               minHeight: NAV_HEIGHT,
               px: { xs: 2, sm: 3, md: 5, lg: 6 },
               maxWidth: 1850,
               width: "100%",
               mx: "auto",
            }}
         >
            {/* Left: logo + primary links */}
            <Box
               sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: { xs: 2, md: 4, lg: 5 },
                  flexGrow: 1,
               }}
            >
               <NavLink
                  to="/"
                  style={{ display: "flex", alignItems: "center" }}
               >
                  <Box
                     component="img"
                     src={logo}
                     alt="Site logo"
                     sx={{
                        width: { xs: 180, sm: 200, md: 225 },
                        height: 40,
                        objectFit: "contain",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        filter: "drop-shadow(0 0 0 transparent)",
                        "&:hover": {
                           opacity: 0.8,
                           filter:
                              "drop-shadow(0 2px 8px rgba(0,102,204,0.15))",
                           transform: "translateY(-1px)",
                        },
                     }}
                  />
               </NavLink>

               <Box sx={{ display: { xs: "none", md: "flex" }, gap: 0.5 }}>
                  {links.map((l) => (
                     <Button
                        key={l.to}
                        component={NavLink}
                        to={l.to}
                        variant="text"
                        sx={{
                           textTransform: "none",
                           borderRadius: 1.5,
                           px: 2.5,
                           py: 1,
                           color: "text.primary",
                           fontSize: 15,
                           fontWeight: 400,
                           letterSpacing: "-0.01em",
                           position: "relative",
                           transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                           "&::after": {
                              content: '""',
                              position: "absolute",
                              bottom: 8,
                              left: "50%",
                              transform: "translateX(-50%)",
                              width: 0,
                              height: 2,
                              borderRadius: 1,
                              bgcolor: "primary.main",
                              transition:
                                 "width 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                           },
                           "&:hover": {
                              bgcolor: (theme) =>
                                 theme.palette.mode === "dark"
                                    ? "rgba(255, 255, 255, 0.05)"
                                    : "rgba(0, 0, 0, 0.03)",
                              color: "primary.main",
                           },
                           "&.active": {
                              color: "#06c",
                              fontWeight: 500,
                              "&::after": {
                                 width: "calc(100% - 20px)",
                              },
                           },
                        }}
                     >
                        {l.label}
                     </Button>
                  ))}
               </Box>
            </Box>

            {/* Right: Upload + Auth */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
               {/* Mobile menu button */}
               <IconButton
                  edge="end"
                  onClick={() => setMobileOpen(true)}
                  sx={{ display: { xs: "inline-flex", md: "none" } }}
                  aria-label="open navigation menu"
               >
                  <MenuIcon />
               </IconButton>

               {/* Dark Mode Toggle */}
               <Box sx={{ display: { xs: "none", md: "inline-flex" } }}>
                  <DarkModeToggle />
               </Box>

               <Button
                  component={NavLink}
                  to="/upload"
                  variant="contained"
                  sx={{
                     textTransform: "none",
                     borderRadius: 2,
                     px: 3,
                     py: 1,
                     bgcolor: "#06c",
                     color: "#fff",
                     fontSize: 15,
                     fontWeight: 500,
                     letterSpacing: "-0.01em",
                     boxShadow: "0 1px 3px rgba(0,102,204,0.12)",
                     transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                     "&:hover": {
                        bgcolor: "#0077ed",
                        boxShadow: "0 4px 12px rgba(0,102,204,0.2)",
                        transform: "translateY(-1px)",
                     },
                     "&:active": {
                        transform: "translateY(0)",
                        boxShadow: "0 1px 3px rgba(0,102,204,0.12)",
                     },
                     display: { xs: "none", md: "inline-flex" },
                  }}
               >
                  Upload
               </Button>

               {!isLoggedIn ? (
                  <Button
                     component={NavLink}
                     to="/sign-in"
                     variant="outlined"
                     sx={{
                        textTransform: "none",
                        borderRadius: 2,
                        px: 3,
                        py: 1,
                        borderColor: "divider",
                        color: "text.primary",
                        fontSize: 15,
                        fontWeight: 500,
                        letterSpacing: "-0.01em",
                        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                        "&:hover": {
                           borderColor: "primary.main",
                           bgcolor: (theme) =>
                              theme.palette.mode === "dark"
                                 ? "rgba(0, 153, 255, 0.08)"
                                 : "rgba(0, 102, 204, 0.04)",
                           color: "primary.main",
                        },
                        display: { xs: "none", md: "inline-flex" },
                     }}
                  >
                     Sign in
                  </Button>
               ) : (
                  <>
                     {/* Keep account avatar visible on md+, hide on xs in favor of drawer */}
                     <Box sx={{ display: { xs: "none", md: "inline-flex" } }}>
                        <Tooltip
                           title={
                              user?.name
                                 ? `${user.name} · Account`
                                 : "Account menu"
                           }
                           placement="bottom"
                        >
                           <Avatar
                              src={avatarSrc}
                              alt={
                                 user?.name
                                    ? `${user.name} avatar`
                                    : "User avatar"
                              }
                              onClick={(e) => setMenuEl(e.currentTarget)}
                              sx={{
                                 width: 40,
                                 height: 40,
                                 cursor: "pointer",
                                 border: "2px solid rgba(0,0,0,0.06)",
                                 transition:
                                    "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                                 "&:hover": {
                                    transform: "scale(1.08)",
                                    borderColor: "#06c",
                                    boxShadow: "0 0 0 3px rgba(0,102,204,0.1)",
                                 },
                              }}
                              imgProps={{
                                 style: {
                                    // Help animated GIFs update correctly in filtered/blurred headers
                                    willChange: "transform",
                                    transform: "translateZ(0)",
                                    imageRendering: "auto",
                                 },
                              }}
                           />
                        </Tooltip>
                     </Box>
                     <Menu
                        id="account-menu"
                        anchorEl={menuEl}
                        open={Boolean(menuEl)}
                        onClose={() => setMenuEl(null)}
                        disableScrollLock
                        transformOrigin={{
                           horizontal: "right",
                           vertical: "top",
                        }}
                        anchorOrigin={{
                           horizontal: "right",
                           vertical: "bottom",
                        }}
                        PaperProps={{
                           elevation: 0,
                           sx: {
                              mt: 1.5,
                              borderRadius: 2.5,
                              minWidth: 200,
                              border: "1px solid #e5e5e7",
                              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                              bgcolor: "rgba(255,255,255,0.98)",
                              backdropFilter: "blur(20px)",
                           },
                        }}
                        MenuListProps={{
                           sx: { py: 1 },
                        }}
                     >
                        <MenuItem
                           component={NavLink}
                           to={getDashboardPath()}
                           sx={{
                              mx: 1,
                              borderRadius: 1.5,
                              px: 2,
                              py: 1.25,
                              fontSize: 15,
                              color: "#1d1d1f",
                              transition: "all 0.2s ease",
                              "&:hover": {
                                 bgcolor: "rgba(0,102,204,0.06)",
                                 color: "#06c",
                              },
                           }}
                        >
                           <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {user?.role === "admin"
                                 ? "Admin Dashboard"
                                 : user?.role === "staff"
                                   ? "Staff Dashboard"
                                   : "Profile"}
                           </Typography>
                        </MenuItem>
                        <Divider sx={{ my: 1, borderColor: "#e5e5e7" }} />
                        <MenuItem
                           onClick={() => {
                              signOut();
                              setMenuEl(null);
                           }}
                           sx={{
                              mx: 1,
                              borderRadius: 1.5,
                              px: 2,
                              py: 1.25,
                              fontSize: 15,
                              color: "#d63939",
                              fontWeight: 500,
                              transition: "all 0.2s ease",
                              "&:hover": {
                                 bgcolor: "rgba(214,57,57,0.06)",
                              },
                           }}
                        >
                           Log out
                        </MenuItem>
                     </Menu>
                  </>
               )}
            </Box>

            {/* Mobile Drawer */}
            <Drawer
               anchor="right"
               open={mobileOpen}
               onClose={() => setMobileOpen(false)}
               PaperProps={{ sx: { width: 280, p: 1.5 } }}
            >
               <Box
                  sx={{
                     display: "flex",
                     alignItems: "center",
                     justifyContent: "space-between",
                     mb: 1,
                  }}
               >
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                     Menu
                  </Typography>
                  <IconButton
                     aria-label="close"
                     onClick={() => setMobileOpen(false)}
                  >
                     <MenuIcon />
                  </IconButton>
               </Box>
               <List sx={{ pt: 0 }}>
                  {/* Theme toggle for mobile */}
                  <ListItem sx={{ px: 0.5 }}>
                     <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        Appearance
                     </Typography>
                     <Box sx={{ ml: "auto" }}>
                        <DarkModeToggle />
                     </Box>
                  </ListItem>
                  <Divider sx={{ my: 1 }} />
                  {links.map((l) => (
                     <ListItemButton
                        key={l.to}
                        component={NavLink}
                        to={l.to}
                        onClick={() => setMobileOpen(false)}
                     >
                        <ListItemText primary={l.label} />
                     </ListItemButton>
                  ))}
                  <Divider sx={{ my: 1 }} />
                  <ListItemButton
                     component={NavLink}
                     to="/upload"
                     onClick={() => setMobileOpen(false)}
                  >
                     <ListItemText primary="Upload" />
                  </ListItemButton>
                  {!isLoggedIn ? (
                     <ListItemButton
                        component={NavLink}
                        to="/sign-in"
                        onClick={() => setMobileOpen(false)}
                     >
                        <ListItemText primary="Sign in" />
                     </ListItemButton>
                  ) : (
                     <>
                        <ListItemButton
                           component={NavLink}
                           to={getDashboardPath()}
                           onClick={() => setMobileOpen(false)}
                        >
                           <ListItemText
                              primary={
                                 user?.role === "admin"
                                    ? "Admin Dashboard"
                                    : user?.role === "staff"
                                      ? "Staff Dashboard"
                                      : "Profile"
                              }
                           />
                        </ListItemButton>
                        <ListItemButton
                           onClick={() => {
                              signOut();
                              setMobileOpen(false);
                           }}
                        >
                           <ListItemText primary="Log out" />
                        </ListItemButton>
                     </>
                  )}
               </List>
            </Drawer>
         </Toolbar>
      </AppBar>
   );
};

export default Navbar;
