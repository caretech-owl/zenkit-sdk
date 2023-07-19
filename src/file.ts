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

export async function deleteFile(uuid: string): Promise<IFile> {
  const res = await axios.delete(`${BASE_URL}/files/${uuid}`);
  return res.data as IFile;
}
