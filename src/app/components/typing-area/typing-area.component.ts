// typing-area.component.ts
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { KeystrokeTrackerService } from '../../services/keystroke-tracker.service';
import { HighlightService } from '../../services/highlight.service';

@Component({
  selector: 'app-typing-area',
  templateUrl: './typing-area.component.html',
  styleUrls: ['./typing-area.component.css'],
})
export class TypingAreaComponent implements OnInit {
  @ViewChild('typingArea') typingArea!: ElementRef<HTMLTextAreaElement>;
  // This initial prompt is just a placeholder which can be overwritten by typing
  prompt: string = 'Type this sentence to record keystroke data.';
  keystrokes: any[] = [];

  constructor(
    private keystrokeTrackerService: KeystrokeTrackerService,
    private highlightService: HighlightService
  ) {}

  ngOnInit(): void {
    // Initially set the prompt in the tracker service
    this.keystrokeTrackerService.setPrompt(this.prompt);
  }

  onKeyDown(event: KeyboardEvent) {
    this.keystrokeTrackerService.trackKeydown(event);
  }

  onKeyUp(event: KeyboardEvent) {
    this.keystrokeTrackerService.trackKeyup(event);
  }

  onTextSelection() {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      this.highlightService.setHighlight(selection.toString());
    }
  }

  /**
   * Capture keystrokes and log payload to the console.
   * Now, instead of always using a static prompt, this method will use the current value
   * of the textarea (i.e. what the user has typed) as the prompt.
   *
   * When your backend is ready, you can uncomment the HttpClient code.
   */
  sendKeystrokes() {
    // Read the current value of the textarea as prompt
    const currentPrompt = this.typingArea.nativeElement.value;

    // Update the prompt in the service if needed
    this.keystrokeTrackerService.setPrompt(currentPrompt);

    this.keystrokes = this.keystrokeTrackerService.getKeystrokes();
    const highlight = this.highlightService.getHighlight();

    const payload = {
      participantId: 10001,
      prompt: currentPrompt,
      highlight: highlight,
      keystrokes: this.keystrokes,
    };

    console.log('Payload to be sent:', payload);

    // Uncomment the following block when your backend is ready:
    /*
    this.http.post('http://your-backend.com/keystrokes', payload).subscribe(
      (response) => {
        console.log('Data sent successfully:', response);
      },
      (error) => {
        console.error('Error sending data:', error);
      }
    );
    */

    this.keystrokeTrackerService.resetKeystrokes();
  }
}
