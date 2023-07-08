import { EP_GET_CURRENT_USER, EP_GET_WORKSPACES } from "../src/config";
import Zenkit from "../src/zenkit";
import axios from "axios";

import * as workspacesJsonData from "./data/test_collection_workspaces.json";
import * as userJsonData from "./data/test_collection_user.json";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("Zenkit API operations", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  beforeEach(() => {
    mockedAxios.get.mockImplementation((url) => {
      switch (url) {
        case EP_GET_CURRENT_USER:
          return Promise.resolve({
            status: 200,
            data: userJsonData,
          });
        case EP_GET_WORKSPACES:
          return Promise.resolve({
            status: 200,
            data: workspacesJsonData.data,
          });
        default:
          return Promise.reject(new Error(`Endpoint ${url} is invalid.`));
      }
    });
  });

  it("should create a valid object", async () => {
    const zenkit = await Zenkit.createAsync();
    expect(zenkit.my).not.toBeNull();
    expect(zenkit.workspace(".")).not.toBeNull();
  });

  it("should get the workspace 'Test Bot Workspace'", async () => {
    const zenkit = await Zenkit.createAsync();
    const workspace = zenkit.workspace("Test Bot Workspace");
    if (!workspace) {
      fail("Workspace not defined!");
    }
    const collection = workspace.collection("Test Collection");
    if (collection === null) {
      fail("Collection is null");
    }
    expect(workspace.collection("CollectionThatDoesNotExist")).toBeNull();
    expect(collection.entry(0)).toBeNull();
    expect(collection.entry("Eine Neue Aufgabe")).toBeNull();
  });
});
