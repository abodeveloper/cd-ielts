import { Group } from "../../groups/types";

export interface Student {
  id: number;
  username: string;
  full_name: string;
  phone: string;
  role: string;
  group: Group;
}
