import axios from "axios";

import { getCurrentWorkspaces } from "../src/workspace";
import * as workspaceJsonData from "./data/test_collection_workspaces.json";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("test get workspace info", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should return a workspace id", async () => {
    mockedAxios.get.mockResolvedValue({
      status: 200,
      data: workspaceJsonData.data,
    });

    let workspaces = await getCurrentWorkspaces();
    expect(workspaces.size).toBe(1);
    expect(workspaces.get(1281787)?.id).toBe(1281787);
  });
});
