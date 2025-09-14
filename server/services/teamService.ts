import { Team, User } from "@models";

export async function addUserToTeam(
   userId: string,
   teamId: string,
): Promise<void> {
   try {
      const team = await Team.findById(teamId);
      if (!team) {
         throw new Error("Team not found");
      }

      const user = await User.findById(userId);
      if (!user) {
         throw new Error("User not found");
      }

      team.members.push(user._id);
      await team.save();
   } catch (error) {
      console.error("Error adding user to team:", error);
      throw error;
   }
}
