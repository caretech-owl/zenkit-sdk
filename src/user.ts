import axios from "axios";
import { BASE_URL, EP_GET_CURRENT_USER } from "./config";
import type { IWebhook } from "./webhook";
import { assertReturnCode } from "./utils";
import { IChat } from "./chat";
export interface IUser {
  id: number;
  shortId: string;
  uuid: string;
  fullname: string;
  initials: string;
  username: string;
  settings: { chats?: Array<IChat> };
}

export async function getCurrentUser(): Promise<IUser | null> {
  const res: { status: number; data: IUser } = await axios.get(
    EP_GET_CURRENT_USER
  );
  try {
    assertReturnCode(res, 200);
    return res.data;
  } catch {
    console.error(
      "Did not receive a valid user response. Is your API key valid?"
    );
  }
  return null;
}

export async function deleteWebhook(webhook: IWebhook): Promise<boolean> {
  const res = await axios.delete(`${BASE_URL}/webhooks/${webhook.id}`);
  return res.status == 200;
}

export async function silenceAll(): Promise<void> {
  await axios.put("https://chat.zenkit.com/api/v1/users/me/settings", {
    notificationSettings: {
      general: {
        toast: false,
        notification: false,
        email: false,
        pushNotification: false,
        desktopNotification: false,
      },
      activities: {
        toast: false,
        notification: false,
        email: false,
        pushNotification: false,
        desktopNotification: false,
      },
      comments: {
        toast: false,
        notification: false,
        email: false,
        pushNotification: false,
        desktopNotification: false,
      },
      mentions: {
        toast: false,
        notification: false,
        email: false,
        pushNotification: false,
        desktopNotification: false,
      },
      reminders: {
        toast: false,
        notification: false,
        email: false,
        pushNotification: false,
        desktopNotification: false,
      },
    },
  });
}
