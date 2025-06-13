// app.routes.ts
import {Routes} from '@angular/router';
import {TypingAreaComponent} from './components/typing-area/typing-area.component';
import {SubmittedComponent} from './components/submitted/submitted.component';
import {RegisterUserComponent} from './components/register-user/register-user.component';
import {ExplanationComponent} from './components/explanation/explanation.component';
import {ImageToPromptComponent} from './components/image-to-prompt/image-to-prompt.component';
import {TextToPromptComponent} from './components/text-to-prompt/text-to-prompt.component';
import {FreeToTextComponent} from './components/free-to-text/free-to-text.component';

export const routes: Routes = [
  {path: 'typing-area', component: TypingAreaComponent},
  {path: 'thank-you', component: SubmittedComponent},
  {path: 'explanation', component: ExplanationComponent},
  {path: 'image-to-prompt', component: ImageToPromptComponent},
  {path: 'text-to-prompt', component: TextToPromptComponent},
  {path: 'free-to-text', component: FreeToTextComponent},
  {path: '', component: RegisterUserComponent},
];
