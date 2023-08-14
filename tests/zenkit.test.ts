import { EP_GET_CURRENT_USER, EP_GET_WORKSPACES } from "../src/config";
import Zenkit from "../src/zenkit";
import axios from "axios";

import * as workspacesJsonData from "./data/test_users_me_workspaces.json";
import * as userJsonData from "./data/test_auth_currentuser.json";
import { MockCollectionCollection } from "./data/test_orm";

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
            data: workspacesJsonData.array,
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
    expect(zenkit.workspaces).toHaveLength(1);
  });

  it("should get the workspace 'Test Bot Workspace'", async () => {
    const zenkit = await Zenkit.createAsync();
    const workspace = zenkit.workspace("Mock Workspace");
    if (!workspace) {
      fail("Workspace not defined!");
    }
    const collection = workspace.collection("Mock Collection");
    if (collection === null) {
      fail("Collection is null");
    }
    expect(workspace.collection("CollectionThatDoesNotExist")).toBeNull();
    expect(collection.entry(0)).toBeNull();
    expect(collection.entry("First Task")).toBeNull();
  });

  it("should get a collection from ORM", async () => {
    const zenkit = await Zenkit.createAsync();
    const collection = zenkit.collection(MockCollectionCollection);
    expect(collection?.name).toBe("Mock Collection");
  });

  it("should return chats and comment", async () => {
    const zenkit = await Zenkit.createAsync();
    expect(Array.from(zenkit.chats)).toHaveLength(2);
    expect(zenkit.chat(42)).toBe(zenkit.workspace(42));
    const chat = zenkit.chat(421);
    if (!chat) {
      fail("Chat is null!");
    }
    expect(chat).toBe(zenkit.collection(421));

    mockedAxios.post.mockImplementation((url) => {
      if (url.indexOf(`/lists/${chat.id}/activities`) === -1) {
        return Promise.reject({ status: 403, data: {} });
      }
      return Promise.resolve({
        status: 200,
        data: {},
      });
    });

    const res = await chat?.comment("hello world");
    expect(res).not.toBeNull();
  });
});
