export class Keystroke {
  participantId: string;
  frequency: string;
  latinSquareType: number;
  prompt: string;
  highlights: [number, number][];
  lowlights: [number, number][];
  keystrokeId: number;
  pressTime: number;
  releaseTime: number;
  letter: string;
  keycode: number;

  constructor(
    participantId: string,
    frequency: string,
    latinSquareType: number,
    prompt: string,
    highlights: [number, number][],
    lowlights: [number, number][],
    keystrokeId: number,
    pressTime: number,
    releaseTime: number,
    letter: string,
    keycode: number
  ) {
    this.participantId = participantId;
    this.frequency = frequency;
    this.latinSquareType = latinSquareType;
    this.prompt = prompt;
    this.highlights = highlights;
    this.lowlights = lowlights;
    this.keystrokeId = keystrokeId;
    this.pressTime = pressTime;
    this.releaseTime = releaseTime;
    this.letter = letter;
    this.keycode = keycode;
  }
}
