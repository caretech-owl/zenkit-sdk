import type { IComment } from "./comment";
import type { IUser } from "./user";
import type { Webhook } from "./webhook";

export interface IChat {
  uuid: string;
  workspaceId?: number;
  listId?: number;
}

export enum UserRole {
  UNKNOWN = 0,
  READ_ONLY = 1,
  WRITE_ONLY = 2,
  COMMENTER = 3,
  CONTRIBUTOR = 4,
  USER = 5,
  ADMIN = 6,
  OWNER = 7,
}

export interface IUserAccess {
  userInfo: IUser;
  userAccessIds: Array<{ uuid: string; role: UserRole }>;
  groupAccessIds: Array<{ uuid: string; role: UserRole }>;
}

export interface IChatGroup {
  id: number;
  name: string;
  createCommentWebhook: (address: string) => Promise<Webhook | null>;
  listComments: (limit: number) => Promise<Array<IComment>>;
  deleteComment: (comment: IComment) => Promise<boolean>;
  comment: (
    message: string,
    parent?: string,
    fileId?: number
  ) => Promise<IComment | null>;
  setUserRole: ((userId: number, role: UserRole) => Promise<boolean>) &
    ((user: IUser, role: UserRole) => Promise<boolean>);
  getUserRole: ((userId: number) => Promise<UserRole>) &
    ((user: IUser) => Promise<UserRole>);
  removeUser: ((userId: number) => Promise<boolean>) &
    ((user: IUser) => Promise<boolean>);
  listUsers: (roles?: Array<UserRole>) => Promise<Array<IUser>>;
}
