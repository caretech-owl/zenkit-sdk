import axios from "axios";
import { BASE_URL } from "./config";

export enum TriggerType {
  NOTIFICATION = 2,
  COMMENT = 4,
}

export interface IWebhook {
  id: number;
  triggerType: TriggerType;
  url: string;
  workspaceId?: number;
  listId?: number;
  listEntryId?: number;
}

export async function createWebhook(
  address: string,
  triggerType: TriggerType,
  workspaceId: number | null = null,
  listId: number | null = null,
  listEntryId: number | null = null
): Promise<IWebhook | null> {
  const res = await axios.post(`${BASE_URL}/webhooks`, {
    triggerType: triggerType,
    url: address,
    workspaceId: workspaceId,
    listId: listId,
    listEntryId: listEntryId,
  });
  if (res.status === 200) {
    return res.data as IWebhook;
  }
  return null;
}
