import { ArrayField } from "./base";

export default class ReferencesField extends ArrayField<string> {
  suffix: string = "references";
}
