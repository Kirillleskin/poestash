import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HtmlParser } from '@angular/compiler';

@Injectable({
  providedIn: 'root'
})
export class NinjaApiService {

  private headers: HttpHeaders;
  private headers2: HttpHeaders;

    constructor(
        private http: HttpClient,
    ) {
        this.headers = new HttpHeaders();
        this.headers2 = new HttpHeaders({
          'Accept': 'text/html, application/xhtml+xml, */*',
          'Content-Type': 'application/x-www-form-urlencoded'
        });
        this.headers.set('Accept', 'application/json');
        this.headers.set('Content-Type', 'application/json');
    }
    
    public getCurrencySettings(): Observable<any> {
      const options = {
        headers: this.headers,
        params: {
          league: 'Blight'
        }
      };

      return this.http.get(`https://poe.ninja/api/Data/GetCurrencyOverview`, options);
    }

    public getFragmentsSettings(): Observable<any> {
      const options = {
        headers: this.headers,
        params: {
          league: 'Blight'
        }
      };

      return this.http.get(`https://poe.ninja/api/Data/GetFragmentOverview`, options);
    }
}
