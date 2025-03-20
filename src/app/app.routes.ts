// app.routes.ts
import { Routes } from '@angular/router';
import { TypingAreaComponent } from './components/typing-area/typing-area.component';
import { SubmittedComponent } from './components/submitted/submitted.component';

export const routes: Routes = [
  { path: '', component: TypingAreaComponent },
  { path: 'thank-you', component: SubmittedComponent },
];
