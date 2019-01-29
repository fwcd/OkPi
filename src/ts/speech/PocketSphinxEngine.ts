import { PsDecoder } from "pocketsphinx";
import { AudioInput } from "../input/AudioInput";
import { TextOutput } from "../output/TextOutput";
import { SpeechRecognitionEngine } from "./SpeechRecognitionEngine";

const KEYPHRASE_SEARCH_KEY = "keyphraseSearch";

enum ListenMode {
	UTTERANCE, KEYPHRASE
}

export class PocketSphinxEngine implements SpeechRecognitionEngine {
	private decoder: PsDecoder;
	private keyphrase: string;
	private input: AudioInput;
	private output?: TextOutput;
	private uttTimeoutMs: number;
	private listening = false;
	private mode = ListenMode.KEYPHRASE;
	private defaultSearchKey: string;
	
	public constructor(params: {
		decoder: PsDecoder;
		input: AudioInput;
		uttTimeoutMs: number;
	}) {
		this.decoder = params.decoder;
		this.input = params.input;
		this.uttTimeoutMs = params.uttTimeoutMs;
		this.defaultSearchKey = this.decoder.getSearch();
		
		this.setupListeners();
	}
	
	private setupListeners(): void {
		this.input.addDataListener(data => {
			this.decoder.processRaw(data, false, false);
			const hyp = this.decoder.hyp();
			
			if (hyp != null) {
				const hypstr = hyp.hypstr; // The utterance
				
				switch (this.mode) {
					case ListenMode.KEYPHRASE: {
						// Heard the keyphrase
						console.log("Heard keyphrase '" + hypstr + "', listening for utterance..."); // TODO: Better logging
						this.listenForNextUtterance();
						
						// TODO: Implement proper responses (in the utterance listen mode below)
						// and block the data input (add a boolean flag) while the output is running,
						// so that the speaker output does not feed back into the microphone
						this.output.accept("I have heard " + hypstr);
						
						// Re-listen for keyphrases if it still listens for utterances after a given timeout
						setTimeout(() => {
							if (this.mode == ListenMode.UTTERANCE) {
								this.listenForNextKeyphrase();
							}
						}, this.uttTimeoutMs);
						break;
					};
					case ListenMode.UTTERANCE: {
						// Heard an utterance
						this.output.accept(hypstr);
						break;
					};
				}
			}
		});
	}
	
	private listenForNextKeyphrase(): void {
		this.endUtt();
		this.decoder.setSearch(KEYPHRASE_SEARCH_KEY);
		this.mode = ListenMode.KEYPHRASE;
		this.startUtt();
	}
	
	private listenForNextUtterance(): void {
		this.endUtt();
		this.decoder.setSearch(this.defaultSearchKey);
		this.mode = ListenMode.UTTERANCE;
		this.startUtt();
	}
	
	private startUtt(): void {
		if (!this.listening) {
			this.decoder.startUtt();
			this.listening = true;
		}
	}
	
	private endUtt(): void {
		if (this.listening) {
			this.decoder.endUtt();
			this.listening = false;
		}
	}
	
	public setKeyphrase(keyphrase: string): void {
		this.keyphrase = keyphrase;
		this.decoder.setKeyphrase(KEYPHRASE_SEARCH_KEY, keyphrase);
	}
	
	public setOutput(output: TextOutput): void {
		this.output = output;
	}
	
	public getKeyphrase(): string {
		return this.keyphrase;
	}
	
	public start(): void {
		this.input.start();
		this.listenForNextKeyphrase();
	}
	
	public stop(): void {
		this.input.stop();
		this.endUtt();
	}
}
