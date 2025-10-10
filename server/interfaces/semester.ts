export interface SemesterPayload {
   year: number;
   semester: "S1" | "S2";
   isActive?: boolean;
   startDate?: string | Date;
   endDate?: string | Date;
}

export interface GetSemesterQuery {
   year?: number;
   semester?: "S1" | "S2";
   isActive?: boolean;
}
