import axios from "axios";

import { getCurrentWorkspaces } from "../src/workspace";
import * as workspaceJsonData from "./data/test_users_me_workspaces.json";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("test get workspace info", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should return a workspace id", async () => {
    mockedAxios.get.mockResolvedValue({
      status: 200,
      data: workspaceJsonData.array,
    });
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    let workspaces = await getCurrentWorkspaces();
    expect(workspaces!.size).toBe(1);
    expect(workspaces!.get(42)?.id).toBe(42);
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  it("should throw an error", async () => {
    mockedAxios.get.mockResolvedValue({
      status: 403,
      error: {},
    });
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    let workspaces = await getCurrentWorkspaces();
    expect(consoleSpy).toHaveBeenCalled();
  });
});
