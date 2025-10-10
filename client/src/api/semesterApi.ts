import { BASE_API_URL } from "../config/api";

export interface SemesterDto {
   _id: string;
   year: number;
   semester: "S1" | "S2";
   isActive: boolean;
   startDate?: string;
   endDate?: string;
   createdAt?: string;
   updatedAt?: string;
}

export interface SemesterPayload {
   year: number;
   semester: "S1" | "S2";
   isActive?: boolean;
   startDate?: string; // ISO date string
   endDate?: string; // ISO date string
}

export const fetchSemesters = async (query?: {
   year?: number;
   semester?: "S1" | "S2";
   isActive?: boolean;
}): Promise<SemesterDto[]> => {
   try {
      const params = new URLSearchParams();
      if (typeof query?.year === "number")
         params.set("year", String(query.year));
      if (query?.semester) params.set("semester", query.semester);
      if (typeof query?.isActive === "boolean")
         params.set("isActive", String(query.isActive));

      const url = `${BASE_API_URL}/semesters${params.toString() ? `?${params.toString()}` : ""}`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) {
         console.warn("Failed to fetch semesters", res.status);
         return [];
      }
      const data = await res.json();
      return data.semesters || [];
   } catch (err) {
      console.error("Error fetching semesters:", err);
      return [];
   }
};

export const createSemester = async (
   payload: SemesterPayload,
): Promise<
   | { success: true; data: SemesterDto }
   | { success: false; error: string; status: number }
> => {
   try {
      const res = await fetch(`${BASE_API_URL}/semesters`, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         credentials: "include",
         body: JSON.stringify(payload),
      });

      const status = res.status;
      let body: any = null;
      try {
         body = await res.json();
      } catch (_) {
         body = null;
      }

      if (!res.ok) {
         const error = body?.error || `HTTP_${status}`;
         return { success: false, error, status };
      }
      return { success: true, data: body?.semester };
   } catch (err) {
      console.error("Error creating semester:", err);
      return { success: false, error: "NETWORK_ERROR", status: 0 };
   }
};

export const deleteSemesters = async (filter: {
   year?: number;
   semester?: "S1" | "S2";
   id?: string;
}): Promise<{ deletedCount: number } | null> => {
   try {
      const url = filter.id
         ? `${BASE_API_URL}/semesters/${filter.id}`
         : `${BASE_API_URL}/semesters`;
      const res = await fetch(url, {
         method: "DELETE",
         headers: { "Content-Type": "application/json" },
         credentials: "include",
         body: filter.id
            ? undefined
            : JSON.stringify({ year: filter.year, semester: filter.semester }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      return { deletedCount: data.deletedCount ?? 0 };
   } catch (err) {
      console.error("Error deleting semesters:", err);
      return null;
   }
};
