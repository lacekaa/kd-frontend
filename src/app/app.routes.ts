// app.routes.ts
import {Routes} from '@angular/router';
import {TypingAreaComponent} from './components/typing-area/typing-area.component';
import {SubmittedComponent} from './components/submitted/submitted.component';
import {RegisterUserComponent} from './components/register-user/register-user.component';

export const routes: Routes = [
  {path: 'typing-area', component: TypingAreaComponent},
  {path: 'thank-you', component: SubmittedComponent},
  {path: '', component: RegisterUserComponent},
];
