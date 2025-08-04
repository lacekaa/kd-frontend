import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {KeystrokeTrackerService} from '../../services/keystroke-tracker.service';
import {HighlightService} from '../../services/highlight.service';
import {Router} from '@angular/router';
import {DataProcessingService, PayloadModel} from '../../services/data-processing.service';
import {NgIf, PlatformLocation} from '@angular/common';
import {ExperimentManagerService} from '../../services/experiment-manager.service';
import {GlobalCountService} from '../../services/global-count.service';

@Component({
  selector: 'app-image-to-prompt',
  imports: [
    NgIf
  ],
  templateUrl: './image-to-prompt.component.html',
  styleUrl: './image-to-prompt.component.css'
})
export class ImageToPromptComponent {
  @ViewChild('typingArea') typingArea!: ElementRef<HTMLTextAreaElement>;
  prompt: string = '';
  keystrokes: any[] = [];
  submitted: boolean = false;
  errorMessage: string = '';
  promptLocked: boolean = false;
  importantTrue:boolean = false;
  unimportantTrue:boolean = false;
  secondAttempt: boolean = false;
  highlightSet: boolean = false;
  highlights: [number, number][] = [];
  lowlights: [number, number][] = [];
  experimentType: string = 'image-to-prompt';
  experimentAttempt: number = 0;
  currentTotalAttempt: number = 0;

  constructor(
    private keystrokeTrackerService: KeystrokeTrackerService,
    private highlightService: HighlightService,
    private router: Router,
    private dataProcessingService: DataProcessingService,
    private experimentManagerService: ExperimentManagerService,
    private globalCountService: GlobalCountService,
    private platformLocation: PlatformLocation
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
  //     this.router.navigate(['/thank-you']);
  //   }
  //   this.keystrokeTrackerService.setPrompt(this.prompt);
  // }

  ngOnInit(): void {
    this.keystrokeTrackerService.setPrompt(this.prompt);
    this.experimentAttempt = this.experimentManagerService.getSubmissionCount('image-to-prompt');
    this.secondAttempt = this.experimentAttempt === 1;
  }

  getHighlightRanges(): [number, number][] {
    return this.highlightService.getHighlights();
  }

  adjustImportantTrue(){
    this.importantTrue = (this.highlightService.getHighlights().length > 0);
    this.adjustHighlightSet();
  }

  adjustUnimportantTrue() {
    this.unimportantTrue = (this.highlightService.getLowlights().length > 0);
    this.adjustHighlightSet();
  }

  adjustHighlightSet() {
    this.highlightSet = this.importantTrue && this.unimportantTrue;
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

  enterSecondAttempt(){
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

    // Avoid duplicate highlights
    if (!this.highlightService.getHighlights().some(([start, end]) => start === startIdx && end === endIdx)) {
      this.highlightService.addHighlight([startIdx, endIdx]);
      this.highlights = this.highlightService.getHighlights();
    }

    this.errorMessage = '';
    this.prompt = this.typingArea.nativeElement.value;

    this.adjustImportantTrue();
    this.adjustUnimportantTrue();
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

    // Avoid duplicate lowlights
    if (!this.highlightService.getLowlights().some(([start, end]) => start === startIdx && end === endIdx)) {
      this.highlightService.addLowlight([startIdx, endIdx]);
      this.lowlights = this.highlightService.getLowlights();
    }

    this.errorMessage = '';
    this.prompt = this.typingArea.nativeElement.value;


    this.adjustImportantTrue();
    this.adjustUnimportantTrue();
    this.updateFormattedPrompt();
  }

  resetLastEntry() {
    const lastEntry = this.highlightService.removeLastCombinedEntry();

    if (lastEntry) {
      if (lastEntry.type === 'highlight') {
        this.highlights = this.highlightService.getHighlights();
      } else if (lastEntry.type === 'lowlight') {
        this.lowlights = this.highlightService.getLowlights();
      }
    }

    this.adjustImportantTrue();
    this.adjustUnimportantTrue();
    this.updateFormattedPrompt();
  }


  getFormattedPrompt(): string {
    if (!this.prompt) {
      return '';
    }

    const promptArray = this.prompt.split(''); // Split the prompt into individual characters
    const formattedPrompt = promptArray.map((char, index) => {
      // Determine the color class for each character
      let colorClass = 'black';

      const isInHighlight = this.highlights.some(([start, end]) => index >= start && index < end);
      const isInLowlight = this.lowlights.some(([start, end]) => index >= start && index < end);

      if (isInHighlight && isInLowlight) {
        colorClass = 'both'; // Apply 'multi' if index is in both highlights and lowlights
      } else if (isInHighlight) {
        colorClass = 'confident'; // Apply 'green' if index is only in highlights
      } else if (isInLowlight) {
        colorClass = 'unconfident'; // Apply 'blue' if index is only in lowlights
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
        this.unimportantTrue = false;
        this.importantTrue = false;
        this.enterSecondAttempt();

        this.experimentManagerService.incrementSubmissionCount('image-to-prompt');
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
