import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Currency } from '../models/currency';
import { TradeItem } from '../models/trade-item';
import { CurrencyService } from './currency.service';

@Injectable({
  providedIn: 'root'
})
export class PoeStashService {

  public tradeItems = new BehaviorSubject<any[]>([]);

  private headers: HttpHeaders;

  constructor(
      private http: HttpClient,
      private currencyService: CurrencyService
  ) {
      this.headers = new HttpHeaders();
      this.headers.set('Accept', 'application/json');
      this.headers.set('Content-Type', 'application/json');
  }
  
  public loadNextPoeNinjaChangeId(): Observable<any> {
    const options = {
      headers: this.headers
    };

    return this.http.get(`https://poe.ninja/api/Data/GetStats`, options);
  }
  
  public getPublicStashData(id: any = null): Observable<any> {
    const _params = id ? {id} : {};
    const options = {
      headers: this.headers,
      params: _params
    };

    return this.http.get(`http://www.pathofexile.com/api/public-stash-tabs`, options);
  }

  processData(data: any, id: any) {
    const currstashes = data.stashes.filter(x => x.public === true && x.league === 'Blight' && x.stashType === 'CurrencyStash');
    for (const stash of currstashes) {
      const _data = stash.items.filter(x => !!x.note && x.frameType === 5);
      const items: TradeItem[] = [];
      for (const stashItem of _data) {
        try {
          const tradeItemData = this.setUpPrice(stashItem);
          if (tradeItemData) {
            items.push(this.CreateTradeItem(stashItem, tradeItemData, stash.lastCharacterName));
          }  
        } catch (e) {
          // console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++');
          // console.log(e);
          // console.log(stashItem);
          // console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++');
        }
      }
      this.tradeItems.next(items);
    }
  }

  CreateTradeItem(stashItem: any, tradeItemData: any, ign: string) {
    return {
      id: stashItem.id,
      image: stashItem.icon,
      title: stashItem.typeLine,
      price: tradeItemData.price,
      tradePrice: tradeItemData.tradePrice,
      profit: tradeItemData.profit,
      stackSize: stashItem.stackSize,
      ign
    } as TradeItem;
  }

  setUpPrice(stashItem: any) {
    if (!stashItem.note) {
      return;
    }

    const price: string[] = stashItem.note.split(' '); // pricetype amount currencytype

    if (!price || price.length < 3 || price[0] !== '~price' && price[0] !== '~b/o') {
      throw(new Error(`Price alert with price ${price}`));
    }

    if (!price[1].length) {
      return;
    }

    const tradeItemData: any = {};

    if (price[1].length && price[1].indexOf('/') !== -1) {
      const tradeCurrencies: string[] = price[1].split('/');
      
      if (!tradeCurrencies || tradeCurrencies.length < 2) {
        throw(new Error(`Price alert with price ${price}`));
      }

      const priceChaosEquivalent = this.currencyService.calculateFullPriceAtChaosEquivalentByTagName(Number(tradeCurrencies[0]), price[2], stashItem);
      const tradeChaosEquivalent = this.currencyService.calculateFullPriceAtChaosEquivalentByCurrencyTypeName(Number(tradeCurrencies[1]), stashItem.typeLine, stashItem);
      tradeItemData.profit = (tradeChaosEquivalent - priceChaosEquivalent).toFixed(2);
      
      if (tradeItemData.profit < 5) {
        return;
      }

      tradeItemData.price = {
        currencyTypeName: this.currencyService.getCurrencyTypeNameByTagName(price[2], stashItem),
        chaosEquivalent: priceChaosEquivalent,
        amount: Number(tradeCurrencies[0]),
        image: this.currencyService.getCurrencyImageByTagName(price[2], stashItem),
      } as Currency;

      tradeItemData.tradePrice = {
        currencyTypeName: stashItem.typeLine,
        chaosEquivalent: tradeChaosEquivalent,
        amount: Number(tradeCurrencies[1]),
        image: this.currencyService.getCurrencyImageByTypeName(stashItem.typeLine, stashItem),
      } as Currency;


      return tradeItemData;
    } else if (price[1].length) {
      
      const priceChaosEquivalent = this.currencyService.calculateFullPriceAtChaosEquivalentByTagName(Number(price[1]), price[2], stashItem);
      const tradeChaosEquivalent = this.currencyService.calculateFullPriceAtChaosEquivalentByCurrencyTypeName(1, stashItem.typeLine, stashItem);
      tradeItemData.profit = (tradeChaosEquivalent - priceChaosEquivalent).toFixed(2);
      
      if (tradeItemData.profit < 5) {
        return;
      }

      tradeItemData.price = {
        currencyTypeName: this.currencyService.getCurrencyTypeNameByTagName(price[2], stashItem),
        chaosEquivalent: priceChaosEquivalent,
        amount: Number(price[1]),
        image: this.currencyService.getCurrencyImageByTagName(price[2], stashItem),
      } as Currency;

      tradeItemData.tradePrice = {
        currencyTypeName: stashItem.typeLine,
        chaosEquivalent: tradeChaosEquivalent,
        amount: 1,
        image: this.currencyService.getCurrencyImageByTypeName(stashItem.typeLine, stashItem),
      } as Currency;

      tradeItemData.profit = (tradeItemData.tradePrice.chaosEquivalent - tradeItemData.price.chaosEquivalent).toFixed(2);

      return tradeItemData;
    }

    console.log('KEKWKEKWKEKWKEKWKEKWKEKWKEKWKEKWKEKWKEKWKEKWKEKWKEKWKEKWKEKWKEKW');
    console.log(stashItem);
    console.log('KEKW');

    return;
  }
}
