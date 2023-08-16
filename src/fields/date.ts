import { type FieldValueType, ValueField } from "./base";

export default class DateField extends ValueField<string> {
  private get endDateFieldName(): string {
    return `${this.element.uuid}_endDate`;
  }

  public get date(): string {
    return this.value;
  }

  public get startDate(): string {
    return this.value;
  }

  public get endDate(): string | null {
    const val = this.entry[this.endDateFieldName];
    if (val === null) {
      return null;
    }
    return val as string;
  }

  public setEndDate(dateString: string | null): void {
    this.edited = this.edited || dateString != this.endDate;
    this.entry[this.endDateFieldName] = dateString;
  }

  public getData(): Array<{ field: string; value: FieldValueType }> {
    const res = super.getData();
    res.push({
      field: `${this.element.uuid}_hasTime`,
      value:
        (this.endDate?.indexOf(":") || -1) > -1 || this.value.indexOf(":") > -1,
    });
    res.push({ field: this.endDateFieldName, value: this.endDate });
    return res;
  }
}
