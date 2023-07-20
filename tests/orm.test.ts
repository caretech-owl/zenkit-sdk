import axios from "axios";
import fs from "fs";

import * as workspacesJsonData from "./data/test_users_me_workspaces.json";
import * as elementJsonData from "./data/test_lists_elements.json";
import { Collection } from "../src/collection";
import generateORM from "../src/orm";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;
let collection: Collection;

describe("Zenkit API operations", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  beforeEach(() => {
    collection = new Collection(workspacesJsonData.array[0].lists[0]);
    mockedAxios.get.mockResolvedValue({
      status: 200,
      data: elementJsonData.array,
    });
  });

  it("should create a valid ORM", async () => {
    await collection.getElements();
    const res = await generateORM(collection);
    const orm = fs.readFileSync("tests/data/test_orm.ts").toString();
    const lineRes = res.split("\n").splice(3);
    const ormRes = orm.split("\n").splice(3);
    for (let i = 0; i < lineRes.length; ++i) {
      expect(lineRes[i]).toBe(ormRes[i]);
    }
  });
});
