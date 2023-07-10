export default interface IComment {
  id: number;
  uuid: string;
  message: string;
  parentUUID: string | null;
  listId: number;
  listUUID: string;
  workspaceId: number;
  workspaceUUID: number;
  userId: number;
  created_at: string;
  updated_at: string;
}
