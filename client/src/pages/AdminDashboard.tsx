import React, { useState, useEffect } from "react";
import {
   Box,
   Button,
   Card,
   CardContent,
   CardHeader,
   Chip,
   Divider,
   Stack,
   Typography,
   Tabs,
   Tab,
   TextField,
   Select,
   MenuItem,
   FormControl,
   InputLabel,
   IconButton,
   Dialog,
   DialogTitle,
   DialogContent,
   DialogActions,
   Table,
   TableBody,
   TableCell,
   TableContainer,
   TableHead,
   TableRow,
   Paper,
   Avatar,
   Alert,
   Snackbar,
   Tooltip,
   InputAdornment,
   type SelectChangeEvent,
   CircularProgress,
} from "@mui/material";
import {
   Edit as EditIcon,
   Delete as DeleteIcon,
   Visibility as ViewIcon,
   Search as SearchIcon,
   Add as AddIcon,
   Comment as CommentIcon,
   EmojiEvents as AwardIcon,
   Group as TeamIcon,
   Person as PersonIcon,
   Assignment as ProjectIcon,
   FilterList as FilterIcon,
   Upload as UploadIcon,
   Star as StarIcon,
   Restore as RestoreIcon,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { fetchProjects, likeProject } from "../api/projectApi";
import type { Project } from "../types/project";
import { type UserSummary } from "../api/userApi";
import {
   fetchAllUsers,
   fetchAllTeams,
   fetchAllAwards,
   fetchAllComments,
   deleteUser,
   updateUser,
   deleteProject,
   deleteTeam,
   deleteAward,
   deleteComment,
   updateUserRole,
   createAward,
   assignAwardToProject,
   removeAwardFromProject,
   uploadTeamsCSV,
   type Team,
   type Award,
   type Comment,
} from "../api/staffApi";
import { fetchCategories, type CategoryDto } from "../api/categoryApi";

// Tab panel component
interface TabPanelProps {
   children?: React.ReactNode;
   index: number;
   value: number;
}

function TabPanel(props: TabPanelProps) {
   const { children, value, index, ...other } = props;
   return (
      <div
         role="tabpanel"
         hidden={value !== index}
         id={`admin-tabpanel-${index}`}
         aria-labelledby={`admin-tab-${index}`}
         {...other}
      >
         {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
      </div>
   );
}

// Stat card component with modern design
const StatCard: React.FC<{
   label: string;
   value: number | string;
   color?: string;
   icon?: React.ReactNode;
}> = ({ label, value, color = "primary", icon }) => (
   <Card
      elevation={2}
      sx={{
         borderRadius: 3,
         transition: "transform 0.2s, box-shadow 0.2s",
         "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: 6,
         },
      }}
   >
      <CardContent sx={{ p: 3 }}>
         <Stack direction="row" alignItems="center" spacing={2}>
            {icon && (
               <Avatar
                  sx={{
                     bgcolor: `${color}.light`,
                     color: `${color}.main`,
                     width: 56,
                     height: 56,
                  }}
               >
                  {icon}
               </Avatar>
            )}
            <Box>
               <Typography
                  variant="h3"
                  fontWeight={700}
                  color={`${color}.main`}
                  sx={{ mb: 0.5 }}
               >
                  {value}
               </Typography>
               <Typography
                  color="text.secondary"
                  variant="body2"
                  fontWeight={500}
               >
                  {label}
               </Typography>
            </Box>
         </Stack>
      </CardContent>
   </Card>
);

/**
 * Admin Dashboard component
 * Identical to Staff Dashboard but with additional permission to assign staff role to users
 */
const AdminDashboard: React.FC = () => {
   const { user } = useAuth();
   const navigate = useNavigate();
   const [tabValue, setTabValue] = useState(0);
   const [projects, setProjects] = useState<Project[]>([]);
   const [loading, setLoading] = useState(true);
   const [searchTerm, setSearchTerm] = useState("");
   const [filterCategory, setFilterCategory] = useState("all");
   const [snackbar, setSnackbar] = useState({
      open: false,
      message: "",
      severity: "success" as "success" | "error" | "warning" | "info",
   });

   // Mock data states
   const [teams, setTeams] = useState<Team[]>([]);
   const [users, setUsers] = useState<UserSummary[]>([]);
   const [awards, setAwards] = useState<Award[]>([]);
   const [comments, setComments] = useState<Comment[]>([]);
   const [categories, setCategories] = useState<CategoryDto[]>([]);

   // Dialog states
   const [openProjectDialog, setOpenProjectDialog] = useState(false);
   const [openTeamDialog, setOpenTeamDialog] = useState(false);
   const [openAwardDialog, setOpenAwardDialog] = useState(false);
   const [openAssignDialog, setOpenAssignDialog] = useState(false);
   const [openEditUserDialog, setOpenEditUserDialog] = useState(false);
   const [selectedAward, setSelectedAward] = useState<Award | null>(null);
   const [selectedUser, setSelectedUser] = useState<UserSummary | null>(null);
   const [selectedItem, setSelectedItem] = useState<any>(null);
   const [selectedFile, setSelectedFile] = useState<File | null>(null);
   const [awardForm, setAwardForm] = useState({
      name: "",
      description: "",
   });
   const [editUserForm, setEditUserForm] = useState({
      name: "",
      email: "",
      role: "",
   });

   // Load all data
   useEffect(() => {
      loadAllData();
   }, []);

   const loadAllData = async () => {
      setLoading(true);
      try {
         // Load projects
         const projectsData = await fetchProjects();
         setProjects(projectsData);

         // Load users
         const usersData = await fetchAllUsers();
         setUsers(usersData);

         // Load teams
         const teamsData = await fetchAllTeams();
         setTeams(teamsData);

         // Load awards
         const awardsData = await fetchAllAwards();
         setAwards(awardsData);

         // Load comments
         const commentsData = await fetchAllComments();
         setComments(commentsData);

         // Load categories
         const categoriesData = await fetchCategories();
         setCategories(categoriesData);
      } catch (error) {
         console.error("Error loading data:", error);
         showSnackbar("Failed to load some data", "error");
      } finally {
         setLoading(false);
      }
   };

   const showSnackbar = (
      message: string,
      severity: "success" | "error" | "warning" | "info" = "success",
   ) => {
      setSnackbar({ open: true, message, severity });
   };

   const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
      setTabValue(newValue);
   };

   const handleDeleteProject = async (projectId: string) => {
      if (window.confirm("Are you sure you want to delete this project?")) {
         const success = await deleteProject(projectId);
         if (success) {
            showSnackbar("Project deleted", "info");
            setProjects(projects.filter((p) => p._id !== projectId));
         } else {
            showSnackbar("Failed to delete project", "error");
         }
      }
   };

   const handleDeleteComment = async (commentId: string) => {
      const success = await deleteComment(commentId);
      if (success) {
         setComments(comments.filter((c) => c._id !== commentId));
         showSnackbar("Comment deleted", "info");
      } else {
         showSnackbar("Failed to delete comment", "error");
      }
   };

   const handleDeleteUser = async (userId: string) => {
      if (window.confirm("Are you sure you want to delete this user?")) {
         const success = await deleteUser(userId);
         if (success) {
            showSnackbar("User deleted successfully", "info");
            loadAllData(); // Reload data
         } else {
            showSnackbar("Failed to delete user", "error");
         }
      }
   };

   const handleEditUser = (user: UserSummary) => {
      setSelectedUser(user);
      setEditUserForm({
         name: user.name,
         email: user.email,
         role: user.role,
      });
      setOpenEditUserDialog(true);
   };

   const handleUpdateUser = async () => {
      if (!selectedUser?._id) return;

      const success = await updateUser(selectedUser._id, editUserForm);
      if (success) {
         showSnackbar("User updated successfully", "success");
         setOpenEditUserDialog(false);
         loadAllData();
      } else {
         showSnackbar("Failed to update user", "error");
      }
   };

   const handleDeleteTeam = async (teamId: string) => {
      if (window.confirm("Are you sure you want to delete this team?")) {
         const success = await deleteTeam(teamId);
         if (success) {
            showSnackbar("Team deleted successfully", "info");
            setTeams(teams.filter((t) => t._id !== teamId));
         } else {
            showSnackbar("Failed to delete team", "error");
         }
      }
   };

   const handleUploadCSV = async () => {
      if (!selectedFile) return;

      try {
         // Read CSV file
         const text = await selectedFile.text();
         const lines = text.split(/\r?\n/).filter((line) => line.trim());

         if (lines.length === 0) {
            showSnackbar("CSV file is empty", "error");
            return;
         }

         // Parse CSV: teamName, email1, email2, email3...
         const teamsData = lines.map((line) => {
            const columns = line.split(",").map((col) => col.trim());
            const [name, ...memberEmails] = columns;
            return {
               name,
               memberEmails: memberEmails.filter((email) => email.length > 0),
            };
         });

         // Upload to API
         const result = await uploadTeamsCSV({ teams: teamsData });

         if (result.success) {
            showSnackbar(result.message, "success");
            if (result.errors && result.errors.length > 0) {
               console.warn("Upload errors:", result.errors);
               showSnackbar(
                  `Uploaded with ${result.errors.length} errors. Check console.`,
                  "warning",
               );
            }
            // Reload teams
            loadAllData();
         } else {
            showSnackbar(result.message || "Failed to upload CSV", "error");
         }

         setOpenTeamDialog(false);
         setSelectedFile(null);
      } catch (error) {
         console.error("Error uploading CSV:", error);
         showSnackbar("Failed to parse or upload CSV", "error");
      }
   };

   const handleDeleteAward = async (awardId: string) => {
      if (window.confirm("Are you sure you want to delete this award?")) {
         const success = await deleteAward(awardId);
         if (success) {
            showSnackbar("Award deleted successfully", "info");
            setAwards(awards.filter((a) => a._id !== awardId));
         } else {
            showSnackbar("Failed to delete award", "error");
         }
      }
   };

   const handleCreateAward = async () => {
      if (!awardForm.name || !awardForm.description) {
         showSnackbar("Please fill in all required fields", "error");
         return;
      }

      try {
         const newAward = await createAward({
            name: awardForm.name,
            description: awardForm.description,
         });

         if (newAward) {
            setAwards([...awards, newAward]);
            setOpenAwardDialog(false);
            setAwardForm({
               name: "",
               description: "",
            });
            showSnackbar("Award created successfully", "success");
         } else {
            showSnackbar("Failed to create award", "error");
         }
      } catch (error) {
         console.error("Error creating award:", error);
         showSnackbar("Failed to create award", "error");
      }
   };

   const handleAssignAward = async (projectId: string) => {
      if (!selectedAward) return;

      try {
         const success = await assignAwardToProject(
            projectId,
            selectedAward._id,
         );
         if (success) {
            setOpenAssignDialog(false);
            setSelectedAward(null);
            showSnackbar(
               `Award "${selectedAward.name}" assigned to project successfully`,
               "success",
            );
            // Optionally reload projects to show updated awards
            loadAllData();
         } else {
            showSnackbar("Failed to assign award", "error");
         }
      } catch (error) {
         console.error("Error assigning award:", error);
         showSnackbar("Failed to assign award", "error");
      }
   };

   const handleLikeProject = async (projectId: string) => {
      try {
         const result = await likeProject(projectId);
         if (result) {
            showSnackbar(
               result.data.button ? "Project liked!" : "Project unliked",
               "success",
            );
            loadAllData(); // Reload to get updated like counts
         }
      } catch (error) {
         showSnackbar("Failed to like/unlike project", "error");
      }
   };

   // Filter functions
   const filteredProjects = projects.filter((project) => {
      const matchesSearch = project.name
         .toLowerCase()
         .includes(searchTerm.toLowerCase());
      const matchesCategory =
         filterCategory === "all" || project.category?.name === filterCategory;
      return matchesSearch && matchesCategory;
   });

   // Statistics
   const stats = {
      totalProjects: projects.length,
      totalTeams: teams.length,
      totalUsers: users.length,
      totalAwards: awards.length,
   };

   return (
      <Box sx={{ bgcolor: "#f5f7fa", minHeight: "100vh", pb: 6 }}>
         <Box sx={{ py: 3, px: 2, maxWidth: 1400, mx: "auto" }}>
            {/* Header - Clean Apple/Meta Style */}
            <Card
               elevation={0}
               sx={{
                  mb: 4,
                  bgcolor: "white",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
               }}
            >
               <CardContent sx={{ py: 4 }}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                     <Avatar
                        sx={{
                           width: 64,
                           height: 64,
                           bgcolor: "error.main",
                           fontSize: "1.5rem",
                        }}
                     >
                        {user?.name?.charAt(0) || "A"}
                     </Avatar>
                     <Box sx={{ flex: 1 }}>
                        <Typography
                           variant="body2"
                           color="text.secondary"
                           sx={{ mb: 0.5 }}
                        >
                           Dashboard › Admin Management
                        </Typography>
                        <Typography
                           variant="h4"
                           fontWeight={600}
                           color="text.primary"
                           sx={{ mb: 0.5 }}
                        >
                           Admin Dashboard
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                           Welcome back, {user?.name || "Admin"}! Manage
                           projects, teams, users, awards, and moderate content.
                        </Typography>
                     </Box>
                  </Stack>
               </CardContent>
            </Card>

            {/* Statistics Cards */}
            <Box display="flex" flexWrap="wrap" gap={3} sx={{ mb: 4 }}>
               <Box sx={{ flex: "1 1 250px", minWidth: "250px" }}>
                  <StatCard
                     label="Total Projects"
                     value={stats.totalProjects}
                     icon={<ProjectIcon />}
                     color="primary"
                  />
               </Box>
            </Box>

            {/* Main Content with Tabs */}
            <Card
               elevation={0}
               sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
               }}
            >
               <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                  <Tabs
                     value={tabValue}
                     onChange={handleTabChange}
                     variant="scrollable"
                     scrollButtons="auto"
                     aria-label="admin dashboard tabs"
                     sx={{
                        "& .MuiTab-root": {
                           fontWeight: 600,
                           textTransform: "none",
                           fontSize: "0.95rem",
                        },
                     }}
                  >
                     <Tab
                        icon={<ProjectIcon />}
                        iconPosition="start"
                        label="Projects"
                     />
                     <Tab
                        icon={<TeamIcon />}
                        iconPosition="start"
                        label="Teams"
                     />
                     <Tab
                        icon={<PersonIcon />}
                        iconPosition="start"
                        label="Users"
                     />
                     <Tab
                        icon={<AwardIcon />}
                        iconPosition="start"
                        label="Awards"
                     />
                     <Tab
                        icon={<CommentIcon />}
                        iconPosition="start"
                        label="Comments"
                     />
                  </Tabs>
               </Box>

               <CardContent>
                  {/* Projects Tab */}
                  <TabPanel value={tabValue} index={0}>
                     <Stack spacing={3}>
                        {/* Search and Filters */}
                        <Stack
                           direction={{ xs: "column", sm: "row" }}
                           spacing={2}
                        >
                           <TextField
                              placeholder="Search projects..."
                              variant="outlined"
                              size="small"
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              InputProps={{
                                 startAdornment: (
                                    <InputAdornment position="start">
                                       <SearchIcon />
                                    </InputAdornment>
                                 ),
                              }}
                              sx={{ flexGrow: 1 }}
                           />
                           <FormControl size="small" sx={{ minWidth: 150 }}>
                              <InputLabel>Category</InputLabel>
                              <Select
                                 value={filterCategory}
                                 label="Category"
                                 onChange={(e: SelectChangeEvent) =>
                                    setFilterCategory(e.target.value)
                                 }
                              >
                                 <MenuItem value="all">All Categories</MenuItem>
                                 {categories.length === 0 ? (
                                    <MenuItem value="none" disabled>
                                       No categories
                                    </MenuItem>
                                 ) : (
                                    categories.map((cat) => (
                                       <MenuItem key={cat._id} value={cat.name}>
                                          {cat.name}
                                       </MenuItem>
                                    ))
                                 )}
                              </Select>
                           </FormControl>
                        </Stack>

                        {/* Projects Table */}
                        {loading ? (
                           <Box
                              sx={{
                                 display: "flex",
                                 justifyContent: "center",
                                 py: 4,
                              }}
                           >
                              <CircularProgress />
                           </Box>
                        ) : (
                           <TableContainer component={Paper} variant="outlined">
                              <Table>
                                 <TableHead>
                                    <TableRow>
                                       <TableCell>Project</TableCell>
                                       <TableCell>Team</TableCell>
                                       <TableCell>Category</TableCell>
                                       <TableCell>Semester</TableCell>
                                       <TableCell>Awards</TableCell>
                                       <TableCell align="right">
                                          Actions
                                       </TableCell>
                                    </TableRow>
                                 </TableHead>
                                 <TableBody>
                                    {filteredProjects.length === 0 ? (
                                       <TableRow>
                                          <TableCell colSpan={6} align="center">
                                             <Typography
                                                color="text.secondary"
                                                sx={{ py: 2 }}
                                             >
                                                No projects found
                                             </Typography>
                                          </TableCell>
                                       </TableRow>
                                    ) : (
                                       filteredProjects.map((project) => (
                                          <TableRow key={project._id} hover>
                                             <TableCell>
                                                <Stack>
                                                   <Typography
                                                      variant="subtitle2"
                                                      fontWeight={600}
                                                   >
                                                      {project.name}
                                                   </Typography>
                                                   <Typography
                                                      variant="caption"
                                                      color="text.secondary"
                                                      sx={{
                                                         overflow: "hidden",
                                                         textOverflow:
                                                            "ellipsis",
                                                         whiteSpace: "nowrap",
                                                         maxWidth: 300,
                                                      }}
                                                   >
                                                      {project.description}
                                                   </Typography>
                                                </Stack>
                                             </TableCell>
                                             <TableCell>
                                                {project.team ? (
                                                   <Chip
                                                      label={project.team.name}
                                                      size="small"
                                                      color="primary"
                                                      variant="outlined"
                                                   />
                                                ) : (
                                                   <Typography
                                                      variant="caption"
                                                      color="text.secondary"
                                                   >
                                                      No team assigned
                                                   </Typography>
                                                )}
                                             </TableCell>
                                             <TableCell>
                                                {project.category ? (
                                                   <Chip
                                                      label={
                                                         project.category.name
                                                      }
                                                      size="small"
                                                      color="secondary"
                                                      variant="outlined"
                                                   />
                                                ) : (
                                                   "-"
                                                )}
                                             </TableCell>
                                             <TableCell>
                                                {project.semester ? (
                                                   <Typography variant="body2">
                                                      {
                                                         project.semester
                                                            .semester
                                                      }{" "}
                                                      {project.semester.year}
                                                   </Typography>
                                                ) : (
                                                   "-"
                                                )}
                                             </TableCell>
                                             <TableCell>
                                                {project.awards &&
                                                project.awards.length > 0 ? (
                                                   <Stack
                                                      direction="row"
                                                      spacing={0.5}
                                                      flexWrap="wrap"
                                                      useFlexGap
                                                   >
                                                      {project.awards.map(
                                                         (award: any) => (
                                                            <Chip
                                                               key={award._id}
                                                               label={
                                                                  award.name
                                                               }
                                                               size="small"
                                                               color="warning"
                                                               variant="filled"
                                                               sx={{ mb: 0.5 }}
                                                            />
                                                         ),
                                                      )}
                                                   </Stack>
                                                ) : (
                                                   <Typography
                                                      variant="caption"
                                                      color="text.secondary"
                                                   >
                                                      No awards
                                                   </Typography>
                                                )}
                                             </TableCell>
                                             <TableCell align="right">
                                                <Stack
                                                   direction="row"
                                                   spacing={1}
                                                   justifyContent="flex-end"
                                                >
                                                   <Tooltip title="View">
                                                      <IconButton
                                                         size="small"
                                                         color="primary"
                                                         onClick={() =>
                                                            navigate(
                                                               `/profile/${project._id}`,
                                                            )
                                                         }
                                                      >
                                                         <ViewIcon fontSize="small" />
                                                      </IconButton>
                                                   </Tooltip>
                                                   <Tooltip title="Delete">
                                                      <IconButton
                                                         size="small"
                                                         color="error"
                                                         onClick={() =>
                                                            handleDeleteProject(
                                                               project._id,
                                                            )
                                                         }
                                                      >
                                                         <DeleteIcon fontSize="small" />
                                                      </IconButton>
                                                   </Tooltip>
                                                </Stack>
                                             </TableCell>
                                          </TableRow>
                                       ))
                                    )}
                                 </TableBody>
                              </Table>
                           </TableContainer>
                        )}
                     </Stack>
                  </TabPanel>

                  {/* Teams Tab */}
                  <TabPanel value={tabValue} index={1}>
                     <Stack spacing={3}>
                        <Stack direction="row" justifyContent="space-between">
                           <Typography variant="h6">Team Management</Typography>
                           <Button
                              variant="contained"
                              startIcon={<UploadIcon />}
                              onClick={() => setOpenTeamDialog(true)}
                           >
                              Upload CSV
                           </Button>
                        </Stack>

                        <TableContainer component={Paper} variant="outlined">
                           <Table>
                              <TableHead>
                                 <TableRow>
                                    <TableCell>Team Name</TableCell>
                                    <TableCell>Members</TableCell>
                                    <TableCell>Project</TableCell>
                                    <TableCell>Created</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                 </TableRow>
                              </TableHead>
                              <TableBody>
                                 {teams.map((team) => (
                                    <TableRow key={team._id} hover>
                                       <TableCell>
                                          <Typography
                                             variant="subtitle2"
                                             fontWeight={600}
                                          >
                                             {team.name}
                                          </Typography>
                                       </TableCell>
                                       <TableCell>
                                          <Chip
                                             label={`${team.members.length} members`}
                                             size="small"
                                             variant="outlined"
                                          />
                                       </TableCell>
                                       <TableCell>
                                          {team.project ? (
                                             typeof team.project ===
                                             "string" ? (
                                                team.project
                                             ) : (
                                                team.project.name
                                             )
                                          ) : (
                                             <Typography
                                                variant="caption"
                                                color="text.secondary"
                                             >
                                                No project assigned
                                             </Typography>
                                          )}
                                       </TableCell>
                                       <TableCell>
                                          {new Date(
                                             team.createdAt,
                                          ).toLocaleDateString()}
                                       </TableCell>
                                       <TableCell align="right">
                                          <Stack
                                             direction="row"
                                             spacing={1}
                                             justifyContent="flex-end"
                                          >
                                             <IconButton
                                                size="small"
                                                color="primary"
                                             ></IconButton>
                                             <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() =>
                                                   handleDeleteTeam(team._id)
                                                }
                                             >
                                                <DeleteIcon fontSize="small" />
                                             </IconButton>
                                          </Stack>
                                       </TableCell>
                                    </TableRow>
                                 ))}
                              </TableBody>
                           </Table>
                        </TableContainer>
                     </Stack>
                  </TabPanel>

                  {/* Users Tab */}
                  <TabPanel value={tabValue} index={2}>
                     <Stack spacing={3}>
                        <Typography variant="h6">User Management</Typography>

                        <TableContainer component={Paper} variant="outlined">
                           <Table>
                              <TableHead>
                                 <TableRow>
                                    <TableCell>User</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell>Role</TableCell>
                                    <TableCell>Team</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                 </TableRow>
                              </TableHead>
                              <TableBody>
                                 {users.map((user, index) => (
                                    <TableRow key={index} hover>
                                       <TableCell>
                                          <Stack
                                             direction="row"
                                             alignItems="center"
                                             spacing={2}
                                          >
                                             <Avatar
                                                sx={{ width: 32, height: 32 }}
                                             >
                                                {user.name.charAt(0)}
                                             </Avatar>
                                             <Typography variant="subtitle2">
                                                {user.name}
                                             </Typography>
                                          </Stack>
                                       </TableCell>
                                       <TableCell>{user.email}</TableCell>
                                       <TableCell>
                                          <Chip
                                             label={user.role}
                                             size="small"
                                             color={
                                                user.role === "admin"
                                                   ? "error"
                                                   : user.role === "staff"
                                                     ? "warning"
                                                     : "default"
                                             }
                                          />
                                       </TableCell>
                                       <TableCell>
                                          {user.team
                                             ? typeof user.team === "string"
                                                ? (teams.find(
                                                     (t) => t._id === user.team,
                                                  )?.name ?? user.team)
                                                : (user.team.name ?? "-")
                                             : "-"}
                                       </TableCell>
                                       <TableCell align="right">
                                          <Stack
                                             direction="row"
                                             spacing={1}
                                             justifyContent="flex-end"
                                          >
                                             <Tooltip title="Edit user">
                                                <IconButton
                                                   size="small"
                                                   color="primary"
                                                   onClick={() =>
                                                      handleEditUser(user)
                                                   }
                                                >
                                                   <EditIcon fontSize="small" />
                                                </IconButton>
                                             </Tooltip>
                                             <Tooltip title="Delete user">
                                                <IconButton
                                                   size="small"
                                                   color="error"
                                                   onClick={() =>
                                                      user._id &&
                                                      handleDeleteUser(user._id)
                                                   }
                                                >
                                                   <DeleteIcon fontSize="small" />
                                                </IconButton>
                                             </Tooltip>
                                          </Stack>
                                       </TableCell>
                                    </TableRow>
                                 ))}
                              </TableBody>
                           </Table>
                        </TableContainer>
                     </Stack>
                  </TabPanel>

                  {/* Awards Tab */}
                  <TabPanel value={tabValue} index={3}>
                     <Stack spacing={3}>
                        <Stack direction="row" justifyContent="space-between">
                           <Typography variant="h6">
                              Awards Management
                           </Typography>
                           <Button
                              variant="contained"
                              startIcon={<AddIcon />}
                              onClick={() => setOpenAwardDialog(true)}
                           >
                              Create Award
                           </Button>
                        </Stack>

                        <Box display="flex" flexWrap="wrap" gap={2}>
                           {awards.map((award) => (
                              <Card
                                 key={award._id}
                                 variant="outlined"
                                 sx={{ flex: "1 1 300px", minWidth: "300px" }}
                              >
                                 <CardContent>
                                    <Stack spacing={1}>
                                       <Stack
                                          direction="row"
                                          justifyContent="space-between"
                                          alignItems="start"
                                       >
                                          <AwardIcon color="warning" />
                                          <Stack direction="row" spacing={0.5}>
                                             <Tooltip title="Assign to Project">
                                                <IconButton
                                                   size="small"
                                                   color="primary"
                                                   onClick={() => {
                                                      setSelectedAward(award);
                                                      setOpenAssignDialog(true);
                                                   }}
                                                >
                                                   <AddIcon fontSize="small" />
                                                </IconButton>
                                             </Tooltip>
                                             <IconButton size="small"></IconButton>
                                             <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() =>
                                                   handleDeleteAward(award._id)
                                                }
                                             >
                                                <DeleteIcon fontSize="small" />
                                             </IconButton>
                                          </Stack>
                                       </Stack>
                                       <Typography
                                          variant="h6"
                                          fontWeight={600}
                                       >
                                          {award.name}
                                       </Typography>
                                       <Typography
                                          variant="body2"
                                          color="text.secondary"
                                       >
                                          {award.description}
                                       </Typography>
                                    </Stack>
                                 </CardContent>
                              </Card>
                           ))}
                        </Box>
                     </Stack>
                  </TabPanel>

                  {/* Comments Tab */}
                  <TabPanel value={tabValue} index={4}>
                     <Stack spacing={3}>
                        <Stack direction="row" justifyContent="space-between">
                           <Typography variant="h6">
                              Comment Moderation
                           </Typography>
                        </Stack>

                        {comments.length === 0 ? (
                           <Alert severity="info">
                              No comments to moderate
                           </Alert>
                        ) : (
                           <Stack spacing={2}>
                              {comments.map((comment) => (
                                 <Card key={comment._id} variant="outlined">
                                    <CardContent>
                                       <Stack spacing={2}>
                                          <Stack
                                             direction="row"
                                             justifyContent="space-between"
                                             alignItems="start"
                                          >
                                             <Stack
                                                direction="row"
                                                spacing={2}
                                                alignItems="center"
                                             >
                                                <Avatar
                                                   sx={{
                                                      width: 32,
                                                      height: 32,
                                                   }}
                                                >
                                                   {comment.author?.name?.charAt(
                                                      0,
                                                   ) || "?"}
                                                </Avatar>
                                                <Box>
                                                   <Typography variant="subtitle2">
                                                      {comment.author?.name ||
                                                         "Unknown User"}
                                                   </Typography>
                                                   <Typography
                                                      variant="caption"
                                                      color="text.secondary"
                                                   >
                                                      {new Date(
                                                         comment.createdAt,
                                                      ).toLocaleString()}
                                                   </Typography>
                                                </Box>
                                             </Stack>
                                          </Stack>
                                          <Typography variant="body2">
                                             {comment.content}
                                          </Typography>
                                          <Stack direction="row" spacing={1}>
                                             <Typography
                                                variant="caption"
                                                color="text.secondary"
                                             >
                                                Project:{" "}
                                                {typeof comment.project ===
                                                "object"
                                                   ? comment.project?.name ||
                                                     "Unknown"
                                                   : comment.project ||
                                                     "Unknown"}
                                             </Typography>
                                          </Stack>
                                          <Stack direction="row" spacing={1}>
                                             <Button
                                                size="small"
                                                variant="outlined"
                                                color="error"
                                                startIcon={<DeleteIcon />}
                                                onClick={() =>
                                                   handleDeleteComment(
                                                      comment._id,
                                                   )
                                                }
                                             >
                                                Delete
                                             </Button>
                                          </Stack>
                                       </Stack>
                                    </CardContent>
                                 </Card>
                              ))}
                           </Stack>
                        )}
                     </Stack>
                  </TabPanel>
               </CardContent>
            </Card>

            {/* Snackbar for notifications */}
            <Snackbar
               open={snackbar.open}
               autoHideDuration={6000}
               onClose={() => setSnackbar({ ...snackbar, open: false })}
               anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
               <Alert
                  onClose={() => setSnackbar({ ...snackbar, open: false })}
                  severity={snackbar.severity}
                  sx={{ width: "100%" }}
               >
                  {snackbar.message}
               </Alert>
            </Snackbar>

            {/* Team Dialog - Upload CSV */}
            <Dialog
               open={openTeamDialog}
               onClose={() => {
                  setOpenTeamDialog(false);
                  setSelectedFile(null);
               }}
               maxWidth="sm"
               fullWidth
            >
               <DialogTitle>Upload Teams CSV</DialogTitle>
               <DialogContent>
                  <Stack spacing={3} sx={{ mt: 2 }}>
                     <Alert severity="info">
                        Upload a CSV file containing team information.
                     </Alert>

                     <Box
                        sx={{
                           border: "2px dashed",
                           borderColor: "divider",
                           borderRadius: 2,
                           p: 4,
                           textAlign: "center",
                           backgroundColor: "background.default",
                           cursor: "pointer",
                           "&:hover": {
                              borderColor: "primary.main",
                              backgroundColor: "action.hover",
                           },
                        }}
                        onClick={() =>
                           document.getElementById("csv-upload-input")?.click()
                        }
                     >
                        <input
                           id="csv-upload-input"
                           type="file"
                           accept=".csv"
                           style={{ display: "none" }}
                           onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                 setSelectedFile(file);
                              }
                           }}
                        />
                        <UploadIcon
                           sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}
                        />
                        <Typography variant="body1" gutterBottom>
                           {selectedFile
                              ? selectedFile.name
                              : "Click to select CSV file or drag and drop"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                           Supported format: .csv
                        </Typography>
                     </Box>

                     {selectedFile && (
                        <Alert severity="success">
                           File selected: {selectedFile.name} (
                           {(selectedFile.size / 1024).toFixed(2)} KB)
                        </Alert>
                     )}
                  </Stack>
               </DialogContent>
               <DialogActions>
                  <Button
                     onClick={() => {
                        setOpenTeamDialog(false);
                        setSelectedFile(null);
                     }}
                  >
                     Cancel
                  </Button>
                  <Button
                     variant="contained"
                     disabled={!selectedFile}
                     onClick={handleUploadCSV}
                  >
                     Upload
                  </Button>
               </DialogActions>
            </Dialog>

            {/* Edit User Dialog */}
            <Dialog
               open={openEditUserDialog}
               onClose={() => setOpenEditUserDialog(false)}
               maxWidth="sm"
               fullWidth
            >
               <DialogTitle>Edit User</DialogTitle>
               <DialogContent>
                  <Stack spacing={2} sx={{ mt: 2 }}>
                     <TextField
                        label="Name"
                        fullWidth
                        variant="outlined"
                        value={editUserForm.name}
                        onChange={(e) =>
                           setEditUserForm({
                              ...editUserForm,
                              name: e.target.value,
                           })
                        }
                     />
                     <TextField
                        label="Email"
                        fullWidth
                        variant="outlined"
                        type="email"
                        value={editUserForm.email}
                        onChange={(e) =>
                           setEditUserForm({
                              ...editUserForm,
                              email: e.target.value,
                           })
                        }
                     />
                     <FormControl fullWidth>
                        <InputLabel>Role</InputLabel>
                        <Select
                           value={editUserForm.role}
                           label="Role"
                           onChange={(e) =>
                              setEditUserForm({
                                 ...editUserForm,
                                 role: e.target.value,
                              })
                           }
                        >
                           <MenuItem value="visitor">Visitor</MenuItem>
                           <MenuItem value="capstoneStudent">
                              Capstone Student
                           </MenuItem>
                           <MenuItem value="staff">Staff</MenuItem>
                        </Select>
                     </FormControl>
                  </Stack>
               </DialogContent>
               <DialogActions>
                  <Button onClick={() => setOpenEditUserDialog(false)}>
                     Cancel
                  </Button>
                  <Button variant="contained" onClick={handleUpdateUser}>
                     Update
                  </Button>
               </DialogActions>
            </Dialog>

            {/* Award Dialog */}
            <Dialog
               open={openAwardDialog}
               onClose={() => setOpenAwardDialog(false)}
               maxWidth="sm"
               fullWidth
            >
               <DialogTitle>Create Award</DialogTitle>
               <DialogContent>
                  <Stack spacing={2} sx={{ mt: 2 }}>
                     <TextField
                        label="Award Name"
                        fullWidth
                        variant="outlined"
                        value={awardForm.name}
                        onChange={(e) =>
                           setAwardForm({ ...awardForm, name: e.target.value })
                        }
                        required
                     />
                     <TextField
                        label="Description"
                        fullWidth
                        multiline
                        rows={3}
                        variant="outlined"
                        value={awardForm.description}
                        onChange={(e) =>
                           setAwardForm({
                              ...awardForm,
                              description: e.target.value,
                           })
                        }
                        required
                     />
                  </Stack>
               </DialogContent>
               <DialogActions>
                  <Button
                     onClick={() => {
                        setOpenAwardDialog(false);
                        setAwardForm({
                           name: "",
                           description: "",
                        });
                     }}
                  >
                     Cancel
                  </Button>
                  <Button variant="contained" onClick={handleCreateAward}>
                     Create
                  </Button>
               </DialogActions>
            </Dialog>

            {/* Assign Award Dialog */}
            <Dialog
               open={openAssignDialog}
               onClose={() => {
                  setOpenAssignDialog(false);
                  setSelectedAward(null);
               }}
               maxWidth="sm"
               fullWidth
            >
               <DialogTitle>Assign Award to Project</DialogTitle>
               <DialogContent>
                  <Stack spacing={2} sx={{ mt: 2 }}>
                     {selectedAward && (
                        <Paper sx={{ p: 2, bgcolor: "grey.50" }}>
                           <Typography variant="h6" gutterBottom>
                              {selectedAward.name}
                           </Typography>
                           <Typography variant="body2" color="text.secondary">
                              {selectedAward.description}
                           </Typography>
                        </Paper>
                     )}

                     <Typography variant="subtitle1" sx={{ mt: 2 }}>
                        Select a project to assign this award to:
                     </Typography>

                     <Stack
                        spacing={1}
                        sx={{ maxHeight: 300, overflow: "auto" }}
                     >
                        {projects.map((project) => (
                           <Paper
                              key={project._id}
                              sx={{
                                 p: 2,
                                 cursor: "pointer",
                                 "&:hover": { bgcolor: "action.hover" },
                              }}
                              onClick={() => handleAssignAward(project._id)}
                           >
                              <Typography variant="subtitle2" fontWeight={600}>
                                 {project.name}
                              </Typography>
                              <Typography
                                 variant="body2"
                                 color="text.secondary"
                              >
                                 {project.description}
                              </Typography>
                              {project.team && (
                                 <Chip
                                    label={project.team.name}
                                    size="small"
                                    variant="outlined"
                                    sx={{ mt: 1 }}
                                 />
                              )}
                           </Paper>
                        ))}
                     </Stack>
                  </Stack>
               </DialogContent>
               <DialogActions>
                  <Button
                     onClick={() => {
                        setOpenAssignDialog(false);
                        setSelectedAward(null);
                     }}
                  >
                     Cancel
                  </Button>
               </DialogActions>
            </Dialog>
         </Box>
      </Box>
   );
};

export default AdminDashboard;
