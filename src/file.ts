import { open } from "node:fs/promises";
import type { ReadStream } from "fs";
import FormData from "form-data";
import axios from "axios";
import { basename } from "path";
import { BASE_URL } from "./config";
import { assertReturnCode } from "./utils";

export interface IFile {
  id: number;
  uuid: string;
  size: number;
  fileName: string;
  mimetype: string;
  isImage: boolean;
  uploaderId: number;
}

export class File {
  public data: IFile;

  public get name(): string {
    return this.data.fileName;
  }

  public get mimetype(): string {
    return this.data.mimetype;
  }

  public get id(): number {
    return this.data.id;
  }

  public constructor(data: IFile) {
    this.data = data;
  }

  public async delete(): Promise<void> {
    const res = await axios.delete(`${BASE_URL}/files/${this.data.id}`);
    assertReturnCode(res, 200);
  }

  public static async addFile(
    data: ReadStream | Buffer,
    fileName: string,
    targetUrl: string
  ): Promise<File> {
    const form = new FormData();
    form.append("file", data, fileName);
    const res = await axios.post(targetUrl, form, {
      headers: {
        ...form.getHeaders(),
      },
    });
    return new File(res.data as IFile);
  }

  public static async uploadFile(
    filePath: string,
    targetUrl: string
  ): Promise<File | null> {
    const file = await open(filePath);
    if (file) {
      return await File.addFile(
        file.createReadStream(),
        basename(filePath),
        targetUrl
      );
    }
    return null;
  }

  public static async getFiles(
    listIds: Array<number>,
    query?: string,
    limit = 1000,
    skip = 0
  ): Promise<Array<File>> {
    const parameters: {
      skip: number;
      listIds?: Array<number>;
      limit: number;
      searchQuery?: string;
    } = {
      skip: skip,
      limit: limit,
    };

    if (listIds) {
      parameters.listIds = listIds;
    }
    if (query) {
      parameters.searchQuery = query;
    }

    const res: { status: number; data?: { files?: Array<IFile> } } =
      await axios.post(`${BASE_URL}/users/me/files`, parameters);
    return (res.data?.files || []).map((f) => new File(f));
  }
}
