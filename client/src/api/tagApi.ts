import { BASE_API_URL } from "../config/api";

export interface TagData {
   name: string;
   projects?: string[];
   mentions: number;
}

export interface TagsResponse {
   tags: TagData[];
}

/**
 * Fetch all tags (public)
 */
export const fetchTags = async (): Promise<TagData[]> => {
   const res = await fetch(`${BASE_API_URL}/tags`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
   });
   if (!res.ok) {
      throw new Error(`Failed to fetch tags: ${res.status} ${res.statusText}`);
   }
   const data: TagsResponse = await res.json();
   return data.tags || [];
};

/**
 * Bind a tag to a project (auth required). If the tag doesn't exist, backend will create then bind.
 */
export const addTagToProject = async (
   projectId: string,
   tagName: string,
): Promise<void> => {
   const res = await fetch(`${BASE_API_URL}/projects/${projectId}/tags`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ tagName }),
   });
   if (!res.ok) {
      let msg = `Failed to add tag: ${res.status} ${res.statusText}`;
      try {
         const err = await res.json();
         if (err?.error) msg = err.error;
      } catch {}
      throw new Error(msg);
   }
};

/**
 * Unbind a tag from a project (auth required)
 */
export const removeTagFromProject = async (
   projectId: string,
   tagName: string,
): Promise<void> => {
   const res = await fetch(`${BASE_API_URL}/projects/${projectId}/tags`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ tagName }),
   });
   if (!res.ok) {
      let msg = `Failed to remove tag: ${res.status} ${res.statusText}`;
      try {
         const err = await res.json();
         if (err?.error) msg = err.error;
      } catch {}
      throw new Error(msg);
   }
};
