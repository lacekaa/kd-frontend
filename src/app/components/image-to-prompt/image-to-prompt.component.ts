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
    const currentPrompt = this.typingArea.nativeElement.innerText.trim();
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

  // Helper: merge intervals and split text into styled spans
  mergeIntervals(textLength: number, highlights: number[][], lowlights: number[][]) {
    type Edge = { pos: number; type: 'highlight' | 'lowlight'; delta: number };
    let edges: Edge[] = [];

    highlights.forEach(([start, end]) => {
      edges.push({ pos: start, type: 'highlight', delta: +1 });
      edges.push({ pos: end, type: 'highlight', delta: -1 });
    });

    lowlights.forEach(([start, end]) => {
      edges.push({ pos: start, type: 'lowlight', delta: +1 });
      edges.push({ pos: end, type: 'lowlight', delta: -1 });
    });

    edges.sort((a, b) => a.pos - b.pos || a.delta - b.delta);

    let intervals = [];
    let highlightCount = 0;
    let lowlightCount = 0;
    let lastPos = 0;

    for (const edge of edges) {
      if (edge.pos > lastPos) {
        let type: 'confident' | 'unconfident' | 'both' | 'none' =
          highlightCount > 0 && lowlightCount > 0 ? 'both' :
            highlightCount > 0 ? 'confident' :
              lowlightCount > 0 ? 'unconfident' :
                'none';

        intervals.push({ start: lastPos, end: edge.pos, type });
        lastPos = edge.pos;
      }
      if (edge.type === 'highlight') highlightCount += edge.delta;
      else lowlightCount += edge.delta;
    }

    if (lastPos < textLength) {
      let type: 'confident' | 'unconfident' | 'both' | 'none' =
        highlightCount > 0 && lowlightCount > 0 ? 'both' :
          highlightCount > 0 ? 'confident' :
            lowlightCount > 0 ? 'unconfident' :
              'none';

      intervals.push({ start: lastPos, end: textLength, type });
    }

    return intervals;
  }

  // Rebuild editable div with combined highlight spans
  rebuildEditableWithHighlights() {
    const editableDiv = this.typingArea.nativeElement;
    const text = editableDiv.innerText;
    const textLength = text.length;

    const intervals = this.mergeIntervals(textLength, this.highlights, this.lowlights);

    editableDiv.innerHTML = ''; // Clear content

    intervals.forEach(({ start, end, type }) => {
      if (start >= end) return; // skip empty

      const span = document.createElement('span');
      span.textContent = text.slice(start, end);

      if (type === 'confident') span.classList.add('confident');
      else if (type === 'unconfident') span.classList.add('unconfident');
      else if (type === 'both') span.classList.add('both');

      console.log(`Adding span [${start}-${end}] with type ${type}: "${span.textContent}"`);
      editableDiv.appendChild(span);
    });
  }

  checkInput(){
    console.log("keystroketrackerservive length is " + this.keystrokeTrackerService.getKeystrokes().length);
    console.log("prompt length is " + this.prompt.length);

    const alertOn = this.keystrokeTrackerService.getKeystrokes().length >= this.prompt.length;
    if (!alertOn) {
      alert("It appears you have used a different input method than a physical keyboard or pasted text. Please retry.");
    }

    return (this.keystrokeTrackerService.getKeystrokes().length >= this.prompt.length);
  }

  // Mark confident selection
  onTextSelection() {
    if (!this.promptLocked) {
      this.errorMessage = 'Please set the prompt first.';
      return;
    }
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    if (range.collapsed) return;

    const editableDiv = this.typingArea.nativeElement;
    if (!editableDiv.contains(range.commonAncestorContainer)) {
      alert("Please select text from the editable area only.");
      return;
    }

    // Compute start/end indices relative to editable div text content
    const preSelectionRange = range.cloneRange();
    preSelectionRange.selectNodeContents(editableDiv);
    preSelectionRange.setEnd(range.startContainer, range.startOffset);
    const startIdx = preSelectionRange.toString().length;
    const endIdx = startIdx + range.toString().length;
    if (startIdx === endIdx) return;

    // Add to highlights if not duplicate
    if (!this.highlightService.getHighlights().some(([s, e]) => s === startIdx && e === endIdx)) {
      this.highlightService.addHighlight([startIdx, endIdx]);
      this.highlights = this.highlightService.getHighlights();
    }

    this.errorMessage = '';
    this.prompt = editableDiv.innerText;

    this.rebuildEditableWithHighlights();

    this.adjustImportantTrue();
    this.adjustUnimportantTrue();
    this.updateFormattedPrompt();

    if (selection) selection.removeAllRanges();
  }

  // Mark unconfident selection
  onTextSelectionLow() {
    if (!this.promptLocked) {
      this.errorMessage = 'Please set prompt first.';
      return;
    }
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    if (range.collapsed) return;

    const editableDiv = this.typingArea.nativeElement;
    if (!editableDiv.contains(range.commonAncestorContainer)) {
      alert("Please select text from the editable area only.");
      return;
    }

    // Compute start/end indices relative to editable div text content
    const preSelectionRange = range.cloneRange();
    preSelectionRange.selectNodeContents(editableDiv);
    preSelectionRange.setEnd(range.startContainer, range.startOffset);
    const startIdx = preSelectionRange.toString().length;
    const endIdx = startIdx + range.toString().length;
    if (startIdx === endIdx) return;

    // Add to lowlights if not duplicate
    if (!this.highlightService.getLowlights().some(([s, e]) => s === startIdx && e === endIdx)) {
      this.highlightService.addLowlight([startIdx, endIdx]);
      this.lowlights = this.highlightService.getLowlights();
    }

    this.errorMessage = '';
    this.prompt = editableDiv.innerText;

    this.rebuildEditableWithHighlights();

    this.adjustImportantTrue();
    this.adjustUnimportantTrue();
    this.updateFormattedPrompt();

    if (selection) selection.removeAllRanges();
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

    // Update the editable area content based on the prompt and highlights
    this.typingArea.nativeElement.innerHTML = this.getFormattedPrompt();
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

  sendSubmission() {
    const currentPrompt = this.typingArea.nativeElement.innerText.trim();
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

        //outsourced reset
        this.resetComponentState();
        this.experimentManagerService.incrementSubmissionCount('image-to-prompt');
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

  //beforeGPT
  // finalizeSubmission() {
  //   const currentPrompt = this.typingArea.nativeElement.innerText.trim();
  //   this.keystrokeTrackerService.setPrompt(currentPrompt);
  //   const highlights: [number, number][] = this.highlightService.getHighlights();
  //   const lowlights: [number, number][] = this.highlightService.getLowlights();
  //   if (!highlights || highlights.length === 0) {
  //     this.errorMessage = 'Please highlight at least one part of your prompt before submitting. You can do this by selecting text with your mouse and hitting "Highlight".';
  //     return;
  //   }
  //   this.keystrokes = this.keystrokeTrackerService.getKeystrokes();
  //   this.keystrokes.forEach((keystroke) => {
  //     keystroke.prompt = currentPrompt;
  //   });
  //   const uniqueParticipantId = this.keystrokeTrackerService.getParticipantId();
  //   const frequency = this.keystrokeTrackerService.getFrequency();
  //   const payload: PayloadModel = {
  //     participantId: uniqueParticipantId,
  //     experimentType: this.experimentType,
  //     experimentAttempt: this.experimentAttempt,
  //     totalAttempt: this.globalCountService.getCount(),
  //     prompt: currentPrompt,
  //     highlights: highlights,
  //     lowlights: lowlights,
  //     keystrokes: this.keystrokes,
  //   };
  //
  //   // Increase experimentAttempt by 1
  //   this.experimentAttempt++;
  //
  //   console.log('Payload being sent to the backend:', payload);
  //
  //   this.dataProcessingService.submitPayload(payload).subscribe({
  //     next: (response) => {
  //       console.log('Response from backend:', response);
  //
  //       // Reset the input field and related properties
  //       this.typingArea.nativeElement.value = ''; // Clear the textarea
  //       this.prompt = ''; // Reset the prompt property
  //       this.keystrokeTrackerService.resetKeystrokes();
  //       this.highlights = [];
  //       this.lowlights = [];
  //       this.highlightService.clearHighlights();
  //       this.highlightService.clearLowlights();
  //       this.errorMessage = '';
  //       this.promptLocked = false;
  //       this.highlightSet = false;
  //       this.unimportantTrue = false;
  //       this.importantTrue = false;
  //       this.enterSecondAttempt();
  //
  //       this.experimentManagerService.incrementSubmissionCount('image-to-prompt');
  //       this.globalCountService.incrementCount();
  //       console.log('Global count incremented:', this.globalCountService.getCount());
  //
  //       // Navigate to the next component
  //       this.experimentManagerService.moveToNextComponent();
  //     },
  //     error: (err) => {
  //       console.error('Error submitting payload:', err);
  //     },
  //   });
  //
  //   // Clear the editable content:
  //   this.typingArea.nativeElement.innerHTML = '';  // or use .innerText = '' if you prefer plain text
  //
  //   // Optionally, reset any state variables related to the prompt:
  //   this.prompt = '';
  //   this.highlights = [];
  //   this.lowlights = [];
  //
  //   // Reset promptLocked or other flags if needed
  //   this.promptLocked = false;
  // }

  finalizeSubmission() {
    if (!this.checkInput()) {
      console.log('Input check failed. Resetting component state...');
      this.resetComponentState();
    } else {
      this.sendSubmission();
    }
  }

  //falseOne
  // finalizeSubmission() {
  //   if (!this.checkInput()) {
  //     console.log('Input check failed. Resetting component state...');
  //     this.resetComponentState();
  //     return;
  //   }
  //
  //   const currentPrompt = this.typingArea.nativeElement.innerText.trim();
  //   this.keystrokeTrackerService.setPrompt(currentPrompt);
  //
  //   const highlights: [number, number][] = this.highlightService.getHighlights();
  //   const lowlights: [number, number][] = this.highlightService.getLowlights();
  //   if (!highlights || highlights.length === 0) {
  //     this.errorMessage = 'Please highlight at least one part of your prompt before submitting.';
  //     return;
  //   }
  //
  //   this.keystrokes = this.keystrokeTrackerService.getKeystrokes();
  //   this.keystrokes.forEach((keystroke) => {
  //     keystroke.prompt = currentPrompt;
  //   });
  //
  //   const uniqueParticipantId = this.keystrokeTrackerService.getParticipantId();
  //   const frequency = this.keystrokeTrackerService.getFrequency();
  //   const payload: PayloadModel = {
  //     participantId: uniqueParticipantId,
  //     experimentType: this.experimentType,
  //     experimentAttempt: this.experimentAttempt,
  //     totalAttempt: this.globalCountService.getCount(),
  //     prompt: currentPrompt,
  //     highlights: highlights,
  //     lowlights: lowlights,
  //     keystrokes: this.keystrokes,
  //   };
  //
  //   this.experimentAttempt++;
  //   this.highlightSet = false;
  //   this.unimportantTrue = false;
  //   this.importantTrue = false;
  //
  //   console.log('Payload being sent to the backend:', payload);
  //
  //   this.dataProcessingService.submitPayload(payload).subscribe({
  //     next: (response) => {
  //       console.log('Response from backend:', response);
  //       this.resetComponentState();
  //       this.experimentManagerService.incrementSubmissionCount('image-to-prompt');
  //       this.globalCountService.incrementCount();
  //       this.experimentManagerService.moveToNextComponent();
  //     },
  //     error: (err) => {
  //       console.error('Error submitting payload:', err);
  //     },
  //   });
  //   this.keystrokeTrackerService = new KeystrokeTrackerService();
  // }

  resetComponentState() {
    // Reset component properties
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

    this.typingArea.nativeElement.innerHTML = '';  // or use .innerText = '' if you prefer plain text
    this.prompt = '';
    this.highlights = [];
    this.lowlights = [];
    this.promptLocked = false;
  }

  // resetComponentState() {
  //   // Reset component properties
  //   this.prompt = '';
  //   this.keystrokes = [];
  //   this.submitted = false;
  //   // this.experimentState = [0, 0, 0, 0];
  //   this.errorMessage = '';
  //   this.promptLocked = false;
  //   this.importantTrue = false;
  //   this.unimportantTrue = false;
  //   this.highlightSet = false;
  //   this.highlights = [];
  //   this.lowlights = [];
  //   this.experimentType = 'image-to-prompt';
  //   this.experimentAttempt = 0;
  //   this.currentTotalAttempt = 0;
  //   this.secondAttempt = false;
  //
  //   // Reset services
  //   // this.keystrokeTrackerService.resetKeystrokes();
  //   this.keystrokeTrackerService = new KeystrokeTrackerService();
  //   this.highlightService.clearHighlights();
  //   this.highlightService.clearLowlights();
  //   // this.globalCountService.resetCount();
  //
  //
  //   // Reset DOM elements
  //   if (this.typingArea) {
  //     this.typingArea.nativeElement.value = '';
  //     this.typingArea.nativeElement.innerHTML = '';
  //   }
  //
  //   // Reinitialize component state
  //   this.ngOnInit();
  // }
}
