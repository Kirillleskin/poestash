import { Injectable } from '@angular/core';
import { Currency } from '../models/currency';
import { ninjaToPoeApiTags } from '../data/ninja-poe-api-tags';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {

  public currencies: Currency[] = [];

  constructor() {}
    
  setUpCurrencies(data: any) {
    if (!data) {
      return;
    }

    const lines = data.lines;
    const currencyDetails = data.currencyDetails;

    for (const line of lines) {
      if (!line.detailsId) {
        continue;
      }

      const tag = ninjaToPoeApiTags.find((x) => x[line.detailsId]);
      if (!tag) {
        continue;
      }

      const apiTag: any = tag[line.detailsId];
      if (!apiTag) {
        continue;
      }

      const currency = currencyDetails.find(x => x.name === line.currencyTypeName);
      this.currencies.push({
        apiTagName: apiTag,
        currencyTypeName: line.currencyTypeName,
        chaosEquivalent: line.chaosEquivalent,
        image: currency ? currency.icon : null
      } as Currency);
    }

    const chaosCurrency = currencyDetails.find(x => x.name === 'Chaos Orb');

    this.currencies.push({
      apiTagName: 'chaos',
      currencyTypeName: 'Chaos Orb',
      chaosEquivalent: 1,
      image: chaosCurrency ? chaosCurrency.icon : null
    } as Currency);
  }

  calculateFullPriceAtChaosEquivalentByTagName(amount: number, tagName: string, stashItem: any): number {
    const currency = this.currencies.find(x => x.apiTagName === tagName);
    if (!currency) {
      throw(new Error(`calculateFullPriceAtChaosEquivalentByTagName: currency by tag name ${tagName} wasn't found. Stash id: ${stashItem ? stashItem.id : ''}. Item typeLine: ${stashItem.typeLine}`));
    }

    return amount * currency.chaosEquivalent;
  }

  calculateFullPriceAtChaosEquivalentByCurrencyTypeName(amount: number, currencyTypeName: string, stashItem: any): number {
    const currency = this.currencies.find(x => x.currencyTypeName === currencyTypeName);
    if (!currency) {
      throw(new Error(`calculateFullPriceAtChaosEquivalentByCurrencyTypeName: currency by currency type name ${currencyTypeName} wasn't found. Stash id: ${stashItem ? stashItem.id : ''}. Item typeLine: ${stashItem.typeLine}`));
    }

    return amount * currency.chaosEquivalent;
  }

  getCurrencyTypeNameByTagName(tagName: string, stashItem: any): string {
    const currency = this.currencies.find(x => x.apiTagName === tagName);
    if (!currency) {
      throw(new Error(`getCurrencyTypeNameByTagName: currency by api tag name ${tagName} wasn't found. Stash id: ${stashItem ? stashItem.id : ''}. Item typeLine: ${stashItem.typeLine}`));
    }

    return currency.currencyTypeName;
  }

  getCurrencyImageByTagName(tagName: string, stashItem: any): string {
    const currency = this.currencies.find(x => x.apiTagName === tagName);
    if (!currency) {
      throw(new Error(`getCurrencyImageByTagName: currency by api tag name ${tagName} wasn't found. Stash id: ${stashItem ? stashItem.id : ''}. Item typeLine: ${stashItem.typeLine}`));
    }

    return currency.image;
  }

  getCurrencyImageByTypeName(typeName: string, stashItem: any): string {
    const currency = this.currencies.find(x => x.currencyTypeName === typeName);
    if (!currency) {
      throw(new Error(`getCurrencyImageByTypeName: currency by api type name ${typeName} wasn't found. Stash id: ${stashItem ? stashItem.id : ''}. Item typeLine: ${stashItem.typeLine}`));
    }

    return currency.image;
  }
}
