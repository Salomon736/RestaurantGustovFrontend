import { MenuInterface } from "../menu/menu.interface";

export interface SaleInterface {
  id: number;
  createdAt: Date;
  quantitySold: number;
  totalPrice: number;
  idMenu: number;
  menu: MenuInterface;
}
