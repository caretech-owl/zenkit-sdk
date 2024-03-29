import axios from "axios";
import fs from "fs";

import * as workspacesJsonData from "./data/test_users_me_workspaces.json";
import * as elementJsonData from "./data/test_lists_elements.json";
import * as entriesJsonData from "./data/test_lists_entries.json";

import { MockCollectionCollection } from "./data/test_orm";
import { IEntry } from "../src";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;
let collection: MockCollectionCollection;

describe("Zenkit API operations", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  beforeEach(() => {
    collection = new MockCollectionCollection(
      workspacesJsonData.array[0].lists[0]
    );
    mockedAxios.get.mockResolvedValue({
      status: 200,
      data: elementJsonData.array,
    });
  });

  it("should create a valid ORM", async () => {
    const res = await collection.generateORM();
    const orm = fs.readFileSync("tests/data/test_orm.ts").toString();
    const lineRes = res.split("\n").splice(1);
    const ormRes = orm.split("\n").splice(1);
    for (let i = 0; i < lineRes.length; ++i) {
      expect(lineRes[i]).toBe(ormRes[i]);
    }
  });

  it("should populate typed fields", async () => {
    mockedAxios.post.mockResolvedValue({
      status: 200,
      data: entriesJsonData.array,
    });
    await collection.populate();
    const retData = JSON.parse(
      JSON.stringify(entriesJsonData.array[3])
    ) as IEntry;
    retData.id = 10;
    mockedAxios.post.mockResolvedValue({
      status: 200,
      data: retData,
    });
    expect(collection.entry(1)?.textField.value).toBe("First Task");
    expect(collection.entry(1)?.numberField.value).toBe(42);
    expect(collection.entry(1)?.linkField.value).not.toBeNull;
    const entry = await collection.createEntry("<Will not be used>");
    expect(entry.id).toBe(10);
    expect(entry.textField.edited).toBeFalsy();
    entry.textField.set("Just Created");
    expect(entry.textField.edited).toBeTruthy();
  });
});
