export interface IGroup {
  id: number;
  uuid: string;
  name: string;
  description: string | null;
  isAllUsers: boolean;
  externalId: string | number | null;
  originProvider: unknown;
  originData: unknown;
  userIds: Array<number>;
  subgroupIds: Array<number>;
}
