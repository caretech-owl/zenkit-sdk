export interface IFile {
  id: number;
  uuid: string;
  size: number;
  fileName: string;
  mimetype: string;
  isImage: boolean;
  uploaderId: number;
}
