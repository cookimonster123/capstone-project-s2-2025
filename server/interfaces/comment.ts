import { Document, Types } from "mongoose";
/**
 * Interface for comment data
 */
export interface CommentData {
   _id?: string;
   content: string;
   author: string;
   project: string;
   createdAt: Date;
   updatedAt: Date;
}

/**
 * Interface for query comment
 */
export interface QueryComment {
   project?: string;
   author?: string;
}

/**
 * Interface for Comment Document type
 */
export interface CommentDoc extends Document {
   _id: Types.ObjectId;
   content: string;
   author:
      | Types.ObjectId
      | {
           _id: Types.ObjectId;
           name: string;
           email: string;
           profilePicture?: string;
        };
   project: Types.ObjectId | { _id: Types.ObjectId; name: string };
   createdAt: Date;
   updatedAt: Date;
}
