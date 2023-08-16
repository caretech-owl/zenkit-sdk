// TODO PUT https://base.zenkit.com/api/v1/users/me/notifications
// {update: {isNew: false, isRead: true}, where: {notificationId: 130356251}}

import axios from "axios";
import { EP_GET_NOTIFICATIONS_EP } from "./config";
import { assertReturnCode } from "./utils";

export interface INotification {
  appTypes: Array<string>;
  appType: string;
  id: number;
  shortId: string;
  uuid: string;
  notificationType: string;
  isRead: boolean;
  isNew: boolean;
  created_at: string;
  updated_at: string;
  senderId: number;
  listId: number | null;
  workspaceId: number | null;
  listEntryId: number | null;
  elementId: number | null;
  visible: true;
  senderDisplayname: string;
  senderUsername: string;
  senderInitials: string;
}

export class Notification {
  public data;
  private constructor(data: INotification) {
    this.data = data;
  }

  public static async getNotifications(
    isRead?: boolean
  ): Promise<Array<Notification>> {
    const params: { isRead?: boolean } = {};
    if (isRead !== undefined) {
      params.isRead = isRead;
    }
    const res: {
      status: number;
      data: { notifications: Array<INotification> };
    } = await axios.get(EP_GET_NOTIFICATIONS_EP, { params: params });
    assertReturnCode(res, 200);
    return res.data.notifications.map((n) => new Notification(n));
  }

  public async markNotificationRead(): Promise<void> {
    const res = await axios.put(EP_GET_NOTIFICATIONS_EP, {
      update: {
        isNew: false,
        isRead: true,
      },
      where: { notificationId: this.data.id },
    });
    assertReturnCode(res, 200);
    return;
  }

  public async markWorkspaceRead(): Promise<void> {
    const res = await axios.put(EP_GET_NOTIFICATIONS_EP, {
      update: {
        isNew: false,
        isRead: true,
      },
      where: { workspaceId: this.data.workspaceId },
    });
    assertReturnCode(res, 200);
    return;
  }

  public async markListRead(): Promise<void> {
    const res = await axios.put(EP_GET_NOTIFICATIONS_EP, {
      update: {
        isNew: false,
        isRead: true,
      },
      where: { listId: this.data.workspaceId },
    });
    assertReturnCode(res, 200);
    return;
  }
}
