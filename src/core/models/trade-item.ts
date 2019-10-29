import { Currency } from './currency';

export interface TradeItem {
  id: number;
  title: string;
  image: string;
  price: Currency;
  tradePrice: Currency;
  stackSize: number;
  ign?: string;
}
