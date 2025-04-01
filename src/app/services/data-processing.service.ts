import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PayloadModel {
  participantId: string;
  prompt: string;
  highlights: string[];
  keystrokes: {
    keystrokeId: number;
    pressTime: number;
    releaseTime: number;
    letter: string;
    keycode: number;
  }[];
}

@Injectable({
  providedIn: 'root',
})
export class DataProcessingService {
  private apiUrl = 'http://localhost:5018/api/data-processing/submit';

  constructor(private http: HttpClient) {}

  submitPayload(payload: PayloadModel): Observable<any> {
    return this.http.post<any>(this.apiUrl, payload);
  }
}
