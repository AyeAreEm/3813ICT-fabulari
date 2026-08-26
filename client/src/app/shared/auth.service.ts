import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthUser } from './models';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storageKey = 'fabulari_auth_user';
  private userSubject = new BehaviorSubject<AuthUser | null>(this.readFromStorage());

  constructor(private http: HttpClient) {}

  user$ = this.userSubject.asObservable();

  get currentUser(): AuthUser | null {
    return this.userSubject.value;
  }

  get isLoggedIn(): boolean {
    return !!this.currentUser;
  }

  login(email: string | null | undefined, password: string | null | undefined): Observable<boolean> {
    return this.http.post<AuthUser>('http://localhost:3000/auth/login', { email, password }).pipe(
      map((res) => {
        localStorage.setItem(this.storageKey, JSON.stringify(res));
        this.userSubject.next(res);
        return true;
      }),
      catchError(() => {
        return of(false);
      })
    );
  }

  signup(
    firstName: string | null | undefined,
    lastName: string | null | undefined,
    dob: string | null | undefined,
    email: string | null | undefined,
    password: string | null | undefined
  ): Observable<boolean> {
    return this.http.post<AuthUser>('http://localhost:3000/auth/signup', { firstName, lastName, dob, email, password }).pipe(
      map((res) => {
        localStorage.setItem(this.storageKey, JSON.stringify(res));
        this.userSubject.next(res);
        return true;
      }),
      catchError(() => {
        return of(false);
      })
    );
  }

  logout() {
    localStorage.removeItem(this.storageKey);
    this.userSubject.next(null);
  }

  private readFromStorage(): AuthUser | null {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  }
}
