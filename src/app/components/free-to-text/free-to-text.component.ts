import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {KeystrokeTrackerService} from '../../services/keystroke-tracker.service';
import {HighlightService} from '../../services/highlight.service';
import {Router} from '@angular/router';
import {DataProcessingService, PayloadModel} from '../../services/data-processing.service';
import {NgIf, PlatformLocation} from '@angular/common';
import {ExperimentManagerService} from '../../services/experiment-manager.service';
import {GlobalCountService} from '../../services/global-count.service';

@Component({
  selector: 'app-free-to-text',
  imports: [
    NgIf
  ],
  templateUrl: './free-to-text.component.html',
  styleUrl: './free-to-text.component.css'
})
export class FreeToTextComponent implements OnInit{
  @ViewChild('typingArea') typingArea!: ElementRef<HTMLTextAreaElement>;
  prompt: string = '';
  keystrokes: any[] = [];
  submitted: boolean = false;
  errorMessage: string = '';
  promptLocked: boolean = false;
  importantTrue:boolean = false;
  unimportantTrue:boolean = false;
  highlightSet: boolean = false;
  highlights: [number, number][] = [];
  lowlights: [number, number][] = [];
  experimentType: string = 'prompt-to-text'; // Default experiment type
  experimentAttempt: number = 0;
  currentTotalAttempt: number = 0;
  secondAttempt: boolean = false;

  constructor(
    private keystrokeTrackerService: KeystrokeTrackerService,
    private highlightService: HighlightService,
    private router: Router,
    private dataProcessingService: DataProcessingService,
    private platformLocation: PlatformLocation,
    private globalCountService: GlobalCountService,
    private experimentManagerService: ExperimentManagerService
  ) {
    // Verhindert das Zurückgehen im Browser
    history.pushState(null, '', location.href);
    this.platformLocation.onPopState(() => {
      history.pushState(null, '', location.href);
    });
  }

  // ngOnInit(): void {
  //   const submissionStatus = sessionStorage.getItem('submitted');
  //   if (submissionStatus === 'true') {
  //     this.router.navigate(['/text-to-prompt']);
  //   }
  //   this.keystrokeTrackerService.setPrompt(this.prompt);
  // }

  ngOnInit(): void {
    this.keystrokeTrackerService.setPrompt(this.prompt);
    this.experimentAttempt = this.experimentManagerService.getSubmissionCount('free-to-text');
    this.secondAttempt = this.experimentAttempt === 1;
  }

  getHighlightRanges(): [number, number][] {
    return this.highlightService.getHighlights();
  }

  lockPrompt() {
    const currentPrompt = this.typingArea.nativeElement.value;
    if (currentPrompt.length < 10) {
      this.errorMessage = 'Prompt too short';
      return;
    }
    this.promptLocked = true;
    this.keystrokeTrackerService.setPrompt(currentPrompt);
    this.prompt = currentPrompt;
    this.errorMessage = ''; // Clear any previous error message
  }

  enterSecondAttempt() {
    this.secondAttempt = true;
  }

  onKeyDown(event: KeyboardEvent) {
    if (this.promptLocked) {
      return;
    }
    const currentPrompt = this.typingArea.nativeElement.value;
    this.keystrokeTrackerService.setPrompt(currentPrompt);
    this.keystrokeTrackerService.trackKeydown(event);
  }

  onKeyUp(event: KeyboardEvent) {
    if (this.promptLocked) {
      return;
    }
    this.keystrokeTrackerService.trackKeyup(event);
  }

  updateFormattedPrompt() {
    const formattedPrompt = this.getFormattedPrompt();
    console.log('Formatted Prompt:', formattedPrompt); // Debugging output
    const displayElement = document.getElementById('formattedPromptContainer');
    if (displayElement) {
      displayElement.innerHTML = ''; // Clear existing content
      displayElement.innerHTML = formattedPrompt; // Add the updated content
    }
  }

  onTextSelection() {
    if (!this.promptLocked) {
      this.errorMessage = 'Please set the prompt first.';
      return;
    }
    const textarea = this.typingArea.nativeElement;
    const startIdx = textarea.selectionStart;
    const endIdx = textarea.selectionEnd;
    if (startIdx === endIdx) {
      return;
    }

    // Remove the range from lowlights if it exists there
    this.lowlights = this.lowlights.filter(([start, end]) => !(start === startIdx && end === endIdx));

    // Avoid duplicate highlights
    if (!this.highlights.some(([start, end]) => start === startIdx && end === endIdx)) {
      this.highlightService.addHighlight([startIdx, endIdx]);
      this.highlights = this.highlightService.getHighlights();
    }

    this.errorMessage = '';
    this.prompt = this.typingArea.nativeElement.value;
    // this.highlightSet = true;
    this.importantTrue = true;
    if (this.importantTrue && this.unimportantTrue) {
      this.highlightSet = true;
    }

    // Update the visualization after updating highlights
    this.updateFormattedPrompt();
  }

  onTextSelectionLow() {
    if (!this.promptLocked) {
      this.errorMessage = 'Please set prompt first.';
      return;
    }
    const textarea = this.typingArea.nativeElement;
    const startIdx = textarea.selectionStart;
    const endIdx = textarea.selectionEnd;
    if (startIdx === endIdx) {
      return;
    }

    // Remove the range from highlights if it exists there
    this.highlights = this.highlights.filter(([start, end]) => !(start === startIdx && end === endIdx));

    // Avoid duplicate lowlights
    if (!this.lowlights.some(([start, end]) => start === startIdx && end === endIdx)) {
      this.highlightService.addLowlight([startIdx, endIdx]);
      this.lowlights = this.highlightService.getLowlights();
    }

    this.unimportantTrue = true;

    if (this.importantTrue && this.unimportantTrue) {
      this.highlightSet = true;
    }

    this.errorMessage = '';
    this.prompt = this.typingArea.nativeElement.value;
    // Update the visualization after updating lowlights
    this.updateFormattedPrompt();
  }


  sendKeystrokes() {
    const currentPrompt = this.typingArea.nativeElement.value;
    this.keystrokeTrackerService.setPrompt(currentPrompt);
    this.prompt = currentPrompt;
    this.keystrokes = this.keystrokeTrackerService.getKeystrokes();
  }

  /**
   * Returns the prompt as a formatted HTML string.
   * This method segments the prompt based on the highlight ranges (stored in this.highlights).
   * Segments outside any highlight range are wrapped in a span with class "black", and
   * segments within a highlight range are wrapped in a span with class "red".
   *
   * Future: To add anti_highlights, include them in the segmentation logic below.
   */
  getFormattedPrompt(): string {
    if (!this.prompt) {
      return '';
    }

    const promptArray = this.prompt.split(''); // Split the prompt into individual characters
    const formattedPrompt = promptArray.map((char, index) => {
      // Determine the color class for each character
      let colorClass = 'black';
      for (const [start, end] of this.highlights) {
        if (index >= start && index < end) {
          colorClass = 'red';
          break;
        }
      }
      for (const [start, end] of this.lowlights) {
        if (index >= start && index < end) {
          colorClass = 'green';
          break;
        }
      }
      // Return the character wrapped with a span and the appropriate class
      return `<span class="${colorClass}">${this.escapeHtml(char)}</span>`;
    });

    return formattedPrompt.join(''); // Join the characters back into a single string
  }

  /**
   * Escapes special HTML characters for safe display.
   */
  escapeHtml(text: string): string {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  finalizeSubmission() {
    const currentPrompt = this.typingArea.nativeElement.value;
    this.keystrokeTrackerService.setPrompt(currentPrompt);
    const highlights: [number, number][] = this.highlightService.getHighlights();
    const lowlights: [number, number][] = this.highlightService.getLowlights();
    if (!highlights || highlights.length === 0) {
      this.errorMessage = 'Please highlight at least one part of your prompt before submitting. You can do this by selecting text with your mouse and hitting "Highlight".';
      return;
    }
    this.keystrokes = this.keystrokeTrackerService.getKeystrokes();
    this.keystrokes.forEach((keystroke) => {
      keystroke.prompt = currentPrompt;
    });
    const uniqueParticipantId = this.keystrokeTrackerService.getParticipantId();
    const frequency = this.keystrokeTrackerService.getFrequency();
    const payload: PayloadModel = {
      participantId: uniqueParticipantId,
      experimentType: this.experimentType,
      experimentAttempt: this.experimentAttempt,
      totalAttempt: this.globalCountService.getCount(),
      prompt: currentPrompt,
      highlights: highlights,
      lowlights: lowlights,
      keystrokes: this.keystrokes,
    };

    // Increase experimentAttempt by 1
    this.experimentAttempt++;

    console.log('Payload being sent to the backend:', payload);

    this.dataProcessingService.submitPayload(payload).subscribe({
      next: (response) => {
        console.log('Response from backend:', response);

        // Reset the input field and related properties
        this.typingArea.nativeElement.value = ''; // Clear the textarea
        this.prompt = ''; // Reset the prompt property
        this.keystrokeTrackerService.resetKeystrokes();
        this.highlights = [];
        this.lowlights = [];
        this.highlightService.clearHighlights();
        this.highlightService.clearLowlights();
        this.errorMessage = '';
        this.promptLocked = false;
        this.highlightSet = false;
        this.experimentManagerService.incrementSubmissionCount('free-to-text');
        this.enterSecondAttempt();

        this.globalCountService.incrementCount();
        console.log('Global count incremented:', this.globalCountService.getCount());

        // Navigate to the next component
        this.experimentManagerService.moveToNextComponent();
      },
      error: (err) => {
        console.error('Error submitting payload:', err);
      },
    });
  }
}
