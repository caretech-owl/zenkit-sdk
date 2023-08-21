import { open } from "node:fs/promises";
import type { ReadStream } from "fs";
import FormData from "form-data";
import axios from "axios";
import { basename } from "path";
import { BASE_URL } from "./config";

export interface IFile {
  id: number;
  uuid: string;
  size: number;
  fileName: string;
  mimetype: string;
  isImage: boolean;
  uploaderId: number;
}

export async function addFile(
  data: ReadStream | Buffer,
  fileName: string,
  targetUrl: string
): Promise<IFile> {
  const form = new FormData();
  form.append("file", data, fileName);
  const res = await axios.post(targetUrl, form, {
    headers: {
      ...form.getHeaders(),
    },
  });
  return res.data as IFile;
}

export async function uploadFile(
  filePath: string,
  targetUrl: string
): Promise<IFile | null> {
  const file = await open(filePath);
  if (file) {
    return await addFile(
      file.createReadStream(),
      basename(filePath),
      targetUrl
    );
  }
  return null;
}

export async function deleteFile(fileId: number): Promise<IFile> {
  const res = await axios.delete(`${BASE_URL}/files/${fileId}`);
  return res.data as IFile;
}

export async function getFiles(
  listId: number,
  query?: string,
  limit = 1000,
  skip = 0
): Promise<Array<IFile>> {
  const parameters: {
    skip: number;
    listIds?: Array<number>;
    limit: number;
    searchQuery?: string;
  } = {
    skip: skip,
    limit: limit,
  };

  if (listId) {
    parameters.listIds = [listId];
  }
  if (query) {
    parameters.searchQuery = query;
  }

  const res: { status: number; data: { files: Array<IFile> } } =
    await axios.post(`${BASE_URL}/users/me/files`, parameters);
  return res.data.files;
}
