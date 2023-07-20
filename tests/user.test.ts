import { getCurrentUser } from "../src/user";
import axios from "axios";
import * as userJsonData from "./data/test_auth_currentuser.json";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("test get user info", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should return a user", async () => {
    mockedAxios.get.mockResolvedValue({
      status: 200,
      data: userJsonData,
    });
    const user = await getCurrentUser();
    expect(user).not.toBeNull();
    expect(user!.id).not.toBeUndefined();
    expect(user!.username).toBe("max");
    expect(user!.fullname).toBe("Max Mustermann");
  });

  it("should return a user", async () => {
    mockedAxios.get.mockResolvedValue({
      status: 200,
      data: userJsonData,
    });
    const user = await getCurrentUser();
    expect(user).not.toBeNull();
    expect(user!.id).not.toBeUndefined();
    expect(user!.username).toBe("max");
    expect(user!.fullname).toBe("Max Mustermann");
  });

  it("should return the users", async () => {
    mockedAxios.get.mockResolvedValue({
      status: 200,
      data: userJsonData,
    });
    const user = await getCurrentUser();
    if (!user) {
      fail("User is null!");
    }
    expect(user).not.toBeNull();
    expect(user.id).not.toBeUndefined();
    expect(user.username).toBe("max");
    expect(user.fullname).toBe("Max Mustermann");
    expect(user.settings.chats).not.toBeUndefined();
    expect(user.settings.chats).toHaveLength(2);
  });
});
