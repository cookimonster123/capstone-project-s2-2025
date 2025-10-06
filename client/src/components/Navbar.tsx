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
import { useAuth } from "../context/AuthContext";
import { fetchUserById } from "../api/userApi";

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
   const { isLoggedIn, signIn, signOut, user } = useAuth();
   const [menuEl, setMenuEl] = React.useState<null | HTMLElement>(null);
   const [fullUser, setFullUser] = React.useState<any>(null);

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
            backgroundColor: "#fff",
            color: "inherit",
            borderBottom: "1px solid #ccc",
            height: NAV_HEIGHT,
            justifyContent: "center",
         }}
      >
         <Toolbar sx={{ minHeight: NAV_HEIGHT, px: 4 }}>
            {/* Left: logo + primary links */}
            <Box
               sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  flexGrow: 1,
               }}
            >
               <NavLink to="/">
                  <Box
                     component="img"
                     src={logo}
                     alt="Site logo"
                     sx={{ width: 225, height: 40, objectFit: "contain" }}
                  />
               </NavLink>

               <Box sx={{ display: "flex", gap: 2 }}>
                  {links.map((l) => (
                     <Button
                        key={l.to}
                        component={NavLink}
                        to={l.to}
                        variant="contained"
                        disableElevation
                        sx={{
                           textTransform: "none",
                           borderRadius: 2,
                           px: 2.25,
                           py: 1.25,
                           bgcolor: "#f6f7f9",
                           color: "black",
                           "&:hover": { bgcolor: "#eceff3" },
                           // Active route highlight from NavLink's .active class
                           "&.active": {
                              bgcolor: "#e8f0fe",
                              boxShadow: "inset 0 0 0 1px #1a73e8",
                              color: "#1a73e8",
                           },
                        }}
                     >
                        {l.label}
                     </Button>
                  ))}
               </Box>
            </Box>

            {/* Right: Upload + Auth */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 3, pr: 1 }}>
               <Button
                  component={NavLink}
                  to="/upload"
                  variant="contained"
                  color="primary"
                  sx={{
                     textTransform: "none",
                     borderRadius: 2,
                     px: 2.5,
                     py: 1,
                  }}
               >
                  Upload
               </Button>

               {!isLoggedIn ? (
                  <Button
                     component={NavLink}
                     to="/sign-in"
                     variant="contained"
                     color="primary"
                     sx={{
                        textTransform: "none",
                        borderRadius: 2,
                        px: 2.5,
                        py: 1,
                     }}
                  >
                     Sign in
                  </Button>
               ) : (
                  <>
                     <Tooltip
                        title={
                           user?.name
                              ? `${user.name} · Account`
                              : "Account menu"
                        }
                     >
                        <Avatar
                           src={avatarSrc}
                           alt={
                              user?.name ? `${user.name} avatar` : "User avatar"
                           }
                           onClick={(e) => setMenuEl(e.currentTarget)}
                           sx={{
                              width: 44,
                              height: 44,
                              cursor: "pointer",
                              border: "1px solid #d6dae1",
                              "&:hover": {
                                 boxShadow: "0 0 0 3px rgba(26,115,232,.15)",
                              },
                           }}
                        />
                     </Tooltip>
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
                           elevation: 3,
                           sx: { mt: 1.5, borderRadius: 2, minWidth: 180 },
                        }}
                     >
                        <MenuItem component={NavLink} to={getDashboardPath()}>
                           <Typography variant="body2">
                              {user?.role === "admin"
                                 ? "Admin Dashboard"
                                 : user?.role === "staff"
                                   ? "Staff Dashboard"
                                   : "Profile"}
                           </Typography>
                        </MenuItem>
                        <Divider />
                        <MenuItem
                           onClick={() => {
                              signOut();
                              setMenuEl(null);
                           }}
                           sx={{ color: "#d63939", fontWeight: 600 }}
                        >
                           Log out
                        </MenuItem>
                     </Menu>
                  </>
               )}
            </Box>
         </Toolbar>
      </AppBar>
   );
};

export default Navbar;
