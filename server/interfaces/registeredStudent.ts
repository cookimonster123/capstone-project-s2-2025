/**
 * Interface for bulk operation result from MongoDB bulkWrite
 * Represents the result of a bulk upsert operation
 */
export interface IBulkUpsertResult {
   /** Number of documents inserted */
   insertedCount: number;
   /** Number of documents matched and modified */
   modifiedCount: number;
   /** Number of documents upserted (inserted due to upsert operation) */
   upsertedCount: number;
   /** Number of documents deleted */
   deletedCount: number;
   /** Number of documents matched */
   matchedCount: number;
   /** Whether the operation was acknowledged by the server */
   acknowledged?: boolean;
   /** Map of operation index to inserted document id */
   insertedIds: { [key: number]: any };
   /** Map of operation index to upserted document id */
   upsertedIds: { [key: number]: any };
   /** Mongoose-specific properties */
   mongoose?: {
      validationErrors: Error[];
      results: (Error | any | null)[];
   };
}
