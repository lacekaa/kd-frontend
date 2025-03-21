export class Keystroke {
  participantId: string;
  prompt: string;
  highlight: string;
  keystrokeId: number;
  pressTime: number;
  releaseTime: number;
  letter: string;
  keycode: number;

  constructor(
    participantId: string,
    prompt: string,
    highlight: string,
    keystrokeId: number,
    pressTime: number,
    releaseTime: number,
    letter: string,
    keycode: number
  ) {
    this.participantId = participantId;
    this.prompt = prompt;
    this.highlight = highlight;
    this.keystrokeId = keystrokeId;
    this.pressTime = pressTime;
    this.releaseTime = releaseTime;
    this.letter = letter;
    this.keycode = keycode;
  }
}
