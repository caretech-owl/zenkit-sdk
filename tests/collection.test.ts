import axios from "axios";

import * as workspacesJsonData from "./data/test_users_me_workspaces.json";
import * as entriesJsonData from "./data/test_lists_entries.json";
import * as elementJsonData from "./data/test_lists_elements.json";
import { Collection } from "../src/collection";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;
let collection: Collection;

describe("Zenkit API operations", () => {
  beforeEach(() => {
    collection = new Collection(workspacesJsonData.array[0].lists[0]);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  beforeEach(() => {
    mockedAxios.get.mockResolvedValue({
      status: 200,
      data: elementJsonData.array,
    });
    mockedAxios.post.mockResolvedValue({
      status: 200,
      data: entriesJsonData,
    });
  });

  it("should populate a collection", async () => {
    expect(collection.id).toBe(421);
    expect(collection.name).toBe("Mock Collection");
    expect(collection.entry(1)).toBeNull();
    expect(collection.entry("First Task")).toBeNull();
    await collection.populate();
    expect(collection.entry(1)?.primaryKey).toBe("First Task");
    expect(collection.entry("First Task")?.id).toBe(1);
    expect(collection.entry(1)).toBe(collection.entry("First Task"));
    expect(collection.entry(2)).toBe(collection.entry("Second Task"));
    expect(collection.entry(0)).toBeNull();
  });
});
