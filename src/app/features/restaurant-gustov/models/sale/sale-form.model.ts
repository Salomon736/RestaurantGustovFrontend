export class SaleFormModel {
  constructor(
    public idMenu: number | null = null,
    public quantitySold: number = 1,
    public totalPrice: number | null = null
  ) { }
}
