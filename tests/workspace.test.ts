import { getWorkspace } from "../src/workspace";

describe("test get workspace info", () => {
  it("should return a workspace id", async () => {
    const workspace = await getWorkspace("CareTech O??");
    expect(workspace).not.toBeNull();
    expect(workspace?.name).toBe("CareTech OWL");
  });
});
