export class MealPeriodFormModel {
  constructor(
    public nameMealPeriod: string | null = null,
    public startTime: string | null = null,
    public endTime: string | null = null,
    public color: string | null = null,
  ) { }
}
