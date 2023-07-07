import { ArrayField } from "./base";

export default class PersonsField extends ArrayField<number> {
  suffix: string = "persons";
}
