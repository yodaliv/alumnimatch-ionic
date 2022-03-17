import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { UtilsService } from './utils.service';
import { HttpHeaders, HttpErrorResponse, HttpClient, HttpXsrfTokenExtractor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError, finalize } from 'rxjs/operators';
import { NavController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  APIURL = environment.BASEURL + 'api/'; 
  public loggedInZoom = false;
  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private utils: UtilsService,
    private navCtrl: NavController
  ) {
      console.log(this.APIURL);
   }

  get(url: string, loading = false): Observable<any> {
    if (loading) {
      this.utils.showLoading();
    }
    return this.http.get(this.APIURL + url, { headers: this.setHttpHeaders() }).pipe(
      map(res => {
        return res;
      }),
      catchError((err) => {
        return this.handleErrors(err);
      }),
      finalize(() => {
        if (loading) {
          this.utils.hideLoading();
        }
      })
    );
  }

  post(url, body, loading = false) {
    if (loading) {
      this.utils.showLoading();
    }
    return this.http.post(this.APIURL + url, body, { headers: this.setHttpHeaders() }).pipe(
      map(res => {
        return res;
      }),
      catchError((err) => {
        return this.handleErrors(err);
      }),
      finalize(() => {
        if (loading) {
          this.utils.hideLoading();
        }
      })
    );
  }

  delete(url, loading = false) {
    if (loading) {
      this.utils.showLoading();
    }
    return this.http.delete(this.APIURL + url, {headers: this.setHttpHeaders()}).pipe(
      map(res => {
        return res;
      }),
      catchError((err) => {
        return this.handleErrors(err);
      }),
      finalize(() => {
        if (loading) {
          this.utils.hideLoading();
        }
      })
    );
  }

  put(url, body, loading = false) {
    if (loading) {
      this.utils.showLoading();
    }
    return this.http.put(this.APIURL + url, body, { headers: this.setHttpHeaders() }).pipe(
      map(res => {
        return res;
      }),
      catchError((err) => {
        return this.handleErrors(err);
      }),
      finalize(() => {
        if (loading) {
          this.utils.hideLoading();
        }
      })
    );
  }

  upload(url: string, file: File, body: any, loading = false) {
    if (loading) {
      this.utils.showLoading();
    }
    const formData: FormData = new FormData();
    if (file) {
      formData.append('file', file, file.name);
    }
    if (body) {
      for ( const key in body ) {
        if (key) {
          formData.append(key, body[key]);
        }
      }
    }
    const headers = this.setHttpHeaders();
    headers.set('Content-Type', 'multipart/form-data');
    // tslint:disable-next-line: object-literal-shorthand
    return this.http.post(this.APIURL + url, formData, { headers: headers }).pipe(
      map(res => {
        return res;
      }),
      catchError((err) => {
        return this.handleErrors(err);
      }),
      finalize(() => {
        this.utils.hideLoading();
      })
    );
  }

  getJSON(filename: string) {
    return this.http.get(`assets/json/${filename}`);
  }

  private setHttpHeaders() {
    const token = localStorage.getItem('token');
    const header = new HttpHeaders({Authorization: `Bearer ${token}`});
    //console.log("Header", header)
    return header;
  }

  private handleErrors(error: HttpErrorResponse) {
    if ( error.status === 401 ) {
      if (!localStorage.token) {
        console.log('guest invalid attempt');
        this.utils.presentAlert("You have to be a member to do that!","Please Log in or Sign up");
        this.navCtrl.navigateForward('/auth');
      } else {
        console.log('Token Expired - Signout');
        this.auth.signout();
      }
    }
    return throwError(error);
  }
}
