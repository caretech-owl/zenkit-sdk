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

export class Webhook {
  public data: IWebhook;

  public static async createWebhook(
    address: string,
    triggerType: TriggerType,
    workspaceId: number | null = null,
    listId: number | null = null,
    listEntryId: number | null = null
  ): Promise<Webhook | null> {
    const res = await axios.post(`${BASE_URL}/webhooks`, {
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
    const res = await axios.get(`${BASE_URL}/users/me/webhooks`);
    return (res.data as Array<IWebhook>).map((hook) => new Webhook(hook));
  }

  private constructor(data: IWebhook) {
    this.data = data;
  }

  public async delete(): Promise<boolean> {
    const res = await axios.delete(`${BASE_URL}/webhooks/${this.data.id}`);
    return res.status == 200;
  }
}
