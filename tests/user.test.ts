import { getCurrentUser } from "../src/user";

describe("test get user info", () => {
  it("should return a user", async () => {
    const user = await getCurrentUser();
    expect(user).not.toBeNull();
    expect(user!.id).not.toBeUndefined();
  });
});
