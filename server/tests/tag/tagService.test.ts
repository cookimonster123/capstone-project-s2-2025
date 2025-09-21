import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { Tag, Project } from "@models";
import {
   addNewTag,
   findAllTags,
   findTagByName,
   removeTag,
   bindTagToProject,
   removeTagFromProject,
   addTagToProject,
} from "../../services/tagService";

describe("Tag Service Tests", () => {
   let mongoServer: MongoMemoryServer;
   let projectId: mongoose.Types.ObjectId;

   beforeAll(async () => {
      if (mongoose.connection.readyState !== 0) {
         await mongoose.disconnect();
      }

      mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);
   });

   beforeEach(async () => {
      await Tag.deleteMany({});
      await Project.deleteMany({});

      const project = await Project.create({
         name: "Test Project",
         team: new mongoose.Types.ObjectId(),
         semester: new mongoose.Types.ObjectId(),
         description: "A test project",
         category: new mongoose.Types.ObjectId(),
         links: [],
         tags: [],
      });

      projectId = project._id;
   });

   afterAll(async () => {
      await mongoose.disconnect();
      await mongoServer.stop();
   });

   test("should create a new tag", async () => {
      const result = await addNewTag("test-tag");
      expect(result.success).toBe(true);
      expect(result.data?.name).toBe("test-tag");
      expect(result.data?.mentions).toBe(0);
      expect(result.data?.projects).toEqual([]);
   });

   test("should not create duplicate tag", async () => {
      await addNewTag("test-tag");
      const result = await addNewTag("test-tag");
      expect(result.success).toBe(false);
      expect(result.error).toBe("Tag already exists");
   });

   test("should find all tags", async () => {
      await addNewTag("tag1");
      await addNewTag("tag2");

      const result = await findAllTags();
      expect(result.success).toBe(true);
      expect(result.data?.length).toBe(2);
   });

   test("should find tag by name", async () => {
      await addNewTag("tag-find");
      const result = await findTagByName("tag-find");
      expect(result.success).toBe(true);
      expect(result.data?.name).toBe("tag-find");
   });

   test("should fail to find non-existent tag", async () => {
      const result = await findTagByName("nonexistent");
      expect(result.success).toBe(false);
      expect(result.error).toBe("Tag not found");
   });

   test("should bind an existing tag to a project", async () => {
      await addNewTag("bind-tag");
      const result = await bindTagToProject("bind-tag", projectId.toString());
      expect(result.success).toBe(true);
      expect(result.data?.projects).toContain(projectId.toString());
      expect(result.data?.mentions).toBe(1);
   });

   test("should remove a bound tag from a project and delete tag if mentions = 0", async () => {
      await addNewTag("remove-tag");
      await bindTagToProject("remove-tag", projectId.toString());

      const removeResult = await removeTagFromProject(
         "remove-tag",
         projectId.toString(),
      );
      expect(removeResult.success).toBe(true);

      const findResult = await findTagByName("remove-tag");
      expect(findResult.success).toBe(false);
      expect(findResult.error).toBe("Tag not found");
   });

   test("should create and bind a tag in one step using addTagToProject", async () => {
      const result = await addTagToProject(
         "new-tag-project",
         projectId.toString(),
      );
      expect(result.success).toBe(true);
      expect(result.data?.name).toBe("new-tag-project");
      expect(result.data?.projects).toContain(projectId.toString());
   });

   test("should enforce max 5 tags per project", async () => {
      for (let i = 1; i <= 5; i++) {
         await addTagToProject(`tag-${i}`, projectId.toString());
      }

      const result = await addTagToProject("tag-6", projectId.toString());
      expect(result.success).toBe(false);
      expect(result.error).toBe("MAX_TAGS_REACHED");
   });

   test("should remove a tag entirely and unbind from all projects", async () => {
      // Create a second project
      const project2 = await Project.create({
         name: "Second Project",
         team: new mongoose.Types.ObjectId(),
         semester: new mongoose.Types.ObjectId(),
         description: "Another project",
         category: new mongoose.Types.ObjectId(),
         links: [],
         tags: [],
      });

      // Create the tag and bind it to the first project
      await addNewTag("full-remove-tag");
      await bindTagToProject("full-remove-tag", projectId.toString());

      // Bind the same tag to the second project
      await bindTagToProject("full-remove-tag", project2._id.toString());

      // Verify it's bound to both projects
      let tagCheck = await Tag.findOne({ name: "full-remove-tag" });
      expect(tagCheck?.projects.length).toBe(2);

      // Remove the tag entirely
      const removeResult = await removeTag("full-remove-tag");
      expect(removeResult.success).toBe(true);

      // Ensure tag no longer exists
      const findResult = await Tag.findOne({ name: "full-remove-tag" });
      expect(findResult).toBeNull();

      // Ensure projects no longer reference the tag
      const updatedProject1 = await Project.findById(projectId);
      const updatedProject2 = await Project.findById(project2._id);

      expect(updatedProject1?.tags).not.toContainEqual(tagCheck?._id);
      expect(updatedProject2?.tags).not.toContainEqual(tagCheck?._id);
   });
});
