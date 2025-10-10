import { Team, User } from "@models";
import type { FilterQuery, SortOrder } from "mongoose";

export async function findTeamsPaginated(options: {
   page?: number;
   limit?: number;
   q?: string;
   sort?: string;
   order?: "asc" | "desc";
}): Promise<{
   success: boolean;
   data?: {
      items: any[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
   };
   error?: string;
}> {
   try {
      const {
         page = 1,
         limit = 20,
         q,
         sort = "createdAt",
         order = "desc",
      } = options || {};

      const skip = (page - 1) * limit;
      const query: FilterQuery<typeof Team> = {} as any;
      if (q && q.trim()) {
         const rx = new RegExp(q.trim(), "i");
         (query as any).name = rx;
      }

      const sortSpec: Record<string, SortOrder> = {
         [sort]: order === "asc" ? 1 : -1,
      };

      const [items, total] = await Promise.all([
         Team.find(query)
            .populate("members", "name email")
            .populate("project", "name")
            .sort(sortSpec)
            .skip(skip)
            .limit(limit),
         Team.countDocuments(query),
      ]);

      const totalPages = Math.max(1, Math.ceil(total / limit));
      return { success: true, data: { items, total, page, limit, totalPages } };
   } catch (error) {
      console.error("Error in findTeamsPaginated service:", error);
      return { success: false, error: "Failed to fetch teams" };
   }
}

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
