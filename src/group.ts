export interface IGroup {
  id: number;
  uuid: string;
  name: string;
  description: string | null;
  isAllUsers: boolean;
  externalId: string | number | null;
  originProvider: any | null;
  originData: any | null;
  userIds: Array<number>;
  subgroupIds: Array<number>;
}
