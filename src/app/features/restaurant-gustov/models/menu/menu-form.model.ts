export class MenuFormModel {
  constructor(
    public menuDate: string | null = null,
    public quantity: number = 1,
    public idDish: number | null = null,
    public idMealPeriod: number | null = null
  ) { }
}
