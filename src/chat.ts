import type { IAcivityType, IActivity, IComment } from "./comment";
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

export interface IChatRoom {
  id: number;

  createCommentWebhook: (address: string) => Promise<Webhook | null>;
  getComments: (limit: number) => Promise<Array<IComment>>;
  getActivities: (
    type: IAcivityType,
    limit: number,
    skip: number
  ) => Promise<Array<IActivity>>;
  deleteComment: (comment: IComment) => Promise<boolean>;
  comment: (
    message: string,
    parent?: string,
    fileId?: number
  ) => Promise<IComment | null>;
}

export interface IChatGroup extends IChatRoom {
  name: string;

  setUserRole: ((userId: number, role: UserRole) => Promise<boolean>) &
    ((user: IUser, role: UserRole) => Promise<boolean>);
  getUserRole: ((userId: number) => Promise<UserRole>) &
    ((user: IUser) => Promise<UserRole>);
  removeUser: ((userId: number) => Promise<boolean>) &
    ((user: IUser) => Promise<boolean>);
  getUsers: (roles?: Array<UserRole>) => Promise<Array<IUser>>;
}
