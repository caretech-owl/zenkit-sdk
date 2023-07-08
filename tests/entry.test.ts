import { IElement } from "../src/element";
import { Entry, IEntry } from "../src/entry";
import TextField from "../src/fields/text";
import NumberField from "../src/fields/number";
import * as elementDataJson from "./data/test_collection_elements.json";
import * as entryDataJson from "./data/test_collection_entries.json";

import axios from "axios";

let entry: Entry;

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("test entry", () => {
  beforeEach(() => {
    const elements: Array<IElement> = [];
    for (const elementJson of elementDataJson.data) {
      if (elementJson) {
        elements.push(elementJson as IElement);
      }
    }
    entry = new Entry(entryDataJson["listEntries"][0] as IEntry, elements);
  });

  it("should create an entry", async () => {
    expect(entry.fieldNames).toContain("Text Field");
    expect(entry.fieldNames).not.toContain("Last Updated");
    expect(entry.field("Text Field")).not.toBeNull();
    const field = entry.field("Text Field") as TextField;
    const value = field.value;
    expect(field.edited).toBeFalsy();
    field.set("New Text");
    expect(value).not.toBe(field.value);
    expect(field.value).toBe("New Text");
    expect(field.edited).toBeTruthy;
    const primary = entry.field("Primary Text Field") as TextField;
    expect(primary.value).toBe(entry.key);
    primary.set("new Value");
    expect(entry.key).toBe("new Value");
  });

  it("should commit changes ", async () => {
    let called = false;
    mockedAxios.put.mockImplementation((url, data) => {
      expect(called).toBeFalsy();
      called = true;
      return Promise.resolve({
        status: 200,
      });
      //   return Promise.reject(new Error(`Endpoint ${url} is invalid.`));
    });
    await entry.commit();
    await entry.commit();
    const text = entry.field("Text Field") as TextField;
    const digits = entry.field("Number Field") as NumberField;
  });
});
