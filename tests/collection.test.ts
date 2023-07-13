import axios from "axios";

import * as workspacesJsonData from "./data/test_collection_workspaces.json";
import * as entriesJsonData from "./data/test_collection_entries.json";
import * as elementJsonData from "./data/test_collection_elements.json";
import { Collection } from "../src/collection";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;
let collection: Collection;

describe("Zenkit API operations", () => {
  beforeEach(() => {
    collection = new Collection(workspacesJsonData.data[0].lists[0]);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  beforeEach(() => {
    mockedAxios.get.mockResolvedValue({
      status: 200,
      data: elementJsonData.data,
    });
    mockedAxios.post.mockResolvedValue({
      status: 200,
      data: entriesJsonData,
    });
  });

  it("should populate a collection", async () => {
    expect(collection.id).toBe(3207438);
    expect(collection.name).toBe("Test Collection");
    expect(collection.entry(1)).toBeNull();
    expect(collection.entry("Eine Neue Aufgabe")).toBeNull();
    await collection.populate();
    expect(collection.entry(1)?.primaryKey).toBe("Eine Neue Aufgabe");
    expect(collection.entry("Eine Neue Aufgabe")?.id).toBe(1);
    expect(collection.entry(0)).toBeNull();
  });

  it("should populate a collection", async () => {
    expect(collection.id).toBe(3207438);
    expect(collection.name).toBe("Test Collection");
    expect(collection.entry(1)).toBeNull();
    expect(collection.entry("Eine Neue Aufgabe")).toBeNull();
    await collection.populate();
    expect(collection.entry(1)?.primaryKey).toBe("Eine Neue Aufgabe");
    expect(collection.entry("Eine Neue Aufgabe")?.id).toBe(1);
    expect(collection.entry(0)).toBeNull();
  });
});
