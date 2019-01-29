import { SpeechAssistant } from "./SpeechAssistant";
import { SpeechRecognitionEngine } from "../speech/SpeechRecognitionEngine";
import { Skill } from "../interaction/Skill";
import { UtteranceProcessor } from "../nlu/UtteranceProcessor";

/**
 * The default speech assistant built for this project.
 */
export class OkPiAssistant implements SpeechAssistant {
	private engine: SpeechRecognitionEngine;
	private uttProcessor = new UtteranceProcessor();
	
	public constructor(engine: SpeechRecognitionEngine) {
		this.engine = engine;
	}
	
	public launch(): void {
		this.engine.start();
	}
	
	public registerSkills(...skills: Skill[]): void {
		skills.forEach(skill => this.uttProcessor.register(skill));
	}
	
	public unregisterSkills(...skills: Skill[]): void {
		skills.forEach(skill => this.uttProcessor.unregister(skill));
	}
}
