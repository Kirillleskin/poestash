import { Component, OnInit } from '@angular/core';

import { ToastrService } from 'ngx-toastr';
import { MatTableDataSource } from '@angular/material/table';
import { PoeStashService } from 'src/core/services/poe-stash.service';
import { UtilityService } from 'src/core/services/utility.service';
import { NinjaApiService } from 'src/core/services/ninja-api.service';
import { CurrencyService } from 'src/core/services/currency.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  currencyData: any;
  fragmentsData: any;

  currencies: any[] = [];
  currencyCodes: string[] = [];

  parser: DOMParser = new DOMParser();

  offersList: any[] = [];

  dataLoad = false;

  dataSource = new MatTableDataSource<any>();

  constructor(
    private httpService: NinjaApiService,
    private poeStashService: PoeStashService,
    private currencyService: CurrencyService,
    private utilService: UtilityService,
    private toastr: ToastrService,
  ) {
  }

  ngOnInit() {
    this.loadCurrencySettings();
    this.loadNextPoeNinjaChangeId();


    this.poeStashService.tradeItems.subscribe(data => {
      if (!data || !data.length) {
        return;
      }
      this.processLoadedData(data);
    });
  }

  loadNextPoeNinjaChangeId() {
    this.poeStashService.loadNextPoeNinjaChangeId().subscribe(data => {
      this.getPublicStash(data.next_change_id);
    });
  }

  async getPublicStash(id: string = null) {
    await this.utilService.delay(1000);
    this.poeStashService.getPublicStashData(id).subscribe(data => {
      this.poeStashService.processData(data, id);
      this.getPublicStash(data.next_change_id);
    });
  }

  loadCurrencySettings() {
    this.httpService.getCurrencySettings().subscribe(data => this.currencyService.setUpCurrencies(data));
  }

  createMessage(data: any) {
    const msg = `@${data.ign} Hi, I'd like to buy your ${data.tradePrice.amount} ${data.tradePrice.currencyTypeName} for my ${data.price.amount} ${data.price.currencyTypeName} in Blight.`;
    this.toastr.success(msg, 'Copied');
    this.utilService.copyToClipboard(msg);
  }

  toggleLoad() {
    console.log(
     this.offersList
    );
  }
  
  processLoadedData(data: any) {
    for (const item of data) {
      const refresheedItemIndex: number = this.offersList.findIndex(x => x.id === item.id);
      if (refresheedItemIndex !== -1) {
        const changed: any = this.offersList[refresheedItemIndex].changed || null;
        this.offersList.splice(refresheedItemIndex, 1);
        item.changed = changed + 1;
      }
      this.offersList.push(item);
    }
    
    this.dataSource.data = this.offersList.sort((a, b) => b.profit - a.profit);
  }
}
