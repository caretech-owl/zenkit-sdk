import Zenkit from "../src/zenkit";

// describe("Zenkit API operations", () => {
//   it("should create a valid object", async () => {
//     const zenkit = await Zenkit.createAsync();
//     expect(zenkit.my).not.toBeNull();
//     expect(zenkit.workspace(".")).not.toBeNull();
//   });

//   it("should get the workspace 'Test Bot Workspace'", async () => {
//     const zenkit = await Zenkit.createAsync();
//     const workspace = zenkit.workspace("Test Bot Workspace");
//     if (!workspace) {
//       fail("Workspace not defined!");
//     }
//     expect(workspace.collection("Test Collection")).not.toBeNull();
//     expect(workspace.collection("CollectionThatDoesNotExist")).toBeNull();
//   });
// });
