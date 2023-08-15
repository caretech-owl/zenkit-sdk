import { ValueField } from "./base";

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
    this.entry[this.endDateFieldName] = dateString;
    this.edited = true;
  }

  public getData(): Array<{ field: string; value: string | null }> {
    const res = super.getData();
    res.push({ field: this.endDateFieldName, value: this.endDate });
    return res;
  }
}
