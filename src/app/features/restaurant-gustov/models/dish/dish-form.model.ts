export class DishFormModel {
  constructor(
    public name: string | null = null,
    public description: string | null = null,
    public image: string | null = null,
    public price: number | null = null,
  ) { }
}
