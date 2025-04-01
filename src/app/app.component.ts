import { Component } from '@angular/core';
import {RouterModule, RouterOutlet} from '@angular/router';
import {TypingAreaComponent} from './components/typing-area/typing-area.component';
// import {FinishButtonComponent} from './components/finish-button/finish-button.component';
import {HighlightService} from './services/highlight.service';
import {KeystrokeTrackerService} from './services/keystroke-tracker.service';
import {HttpClient, HttpClientModule} from '@angular/common/http';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterModule, HttpClientModule],
  template: '<router-outlet></router-outlet>',
  // templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'kd-frontend';
}
