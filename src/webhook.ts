import axios from "axios";
import { EP_GET_WEBHOOKS, EP_EDIT_WEBHOOKS } from "./config";

export enum TriggerType {
  ENTRY = 0,
  ACTIVITY = 1,
  NOTIFICATION = 2,
  SYSTEM_MESSAGE = 3,
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

export class Webhook {
  public data: IWebhook;

  public static async createWebhook(
    address: string,
    triggerType: TriggerType,
    workspaceId: number | null = null,
    listId: number | null = null,
    listEntryId: number | null = null
  ): Promise<Webhook | null> {
    const res = await axios.post(EP_EDIT_WEBHOOKS, {
      triggerType: triggerType,
      url: address,
      workspaceId: workspaceId,
      listId: listId,
      listEntryId: listEntryId,
    });
    if (res.status === 200) {
      return new Webhook(res.data as IWebhook);
    }
    return null;
  }

  public static async getWebhooks(): Promise<Array<Webhook>> {
    const res = await axios.get(EP_GET_WEBHOOKS);
    return (res.data as Array<IWebhook>).map((hook) => new Webhook(hook));
  }

  private constructor(data: IWebhook) {
    this.data = data;
  }

  public async delete(): Promise<boolean> {
    const res = await axios.delete(`${EP_EDIT_WEBHOOKS}/${this.data.id}`);
    return res.status == 200;
  }
}
