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
