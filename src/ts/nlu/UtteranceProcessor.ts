import { Skill } from "../interaction/Skill";
import { TextOutput } from "../output/TextOutput";
import { Intent } from "../interaction/Intent";
import { OutputFacade } from "../output/OutputFacade";
import { escapeRegex } from "../utils/StringUtils";

interface UtteranceMatch {
	text: string;
	skill: Skill;
	intent: Intent;
}

interface UtterancePattern {
	regex: RegExp;
	parameters: string[];
}

/**
 * Processes the (natural language) user input,
 * transforms it into an Intent and passes it
 * to the appropriate Skill.
 */
export class UtteranceProcessor implements TextOutput {
	private skills: Skill[] = [];
	private out: OutputFacade;
	
	public constructor(out: OutputFacade) {
		this.out = out;
	}
	
	public accept(text: string): void {
		const matches = this.skills
			.map(it => this.match(text, it))
			.filter(it => it != null);
		
		if (matches.length >= 1) {
			const match = matches.pop();
			match.skill.invoke(match.intent, this.out);
		} else {
			this.out.output("Sorry, I did not understand " + text);
		}
	}
	
	private match(text: string, skill: Skill): UtteranceMatch | null {
		
	}
	
	
	/**
	 * Tries to match an utterance pattern against a string.
	 * The pattern contains placeholders which are describing
	 * the parameters.
	 * 
	 * `set a timer for {minutes} minutes`
	 * 
	 * @param text - The text to match against
	 * @param pattern - The template string to search for
	 * @returns The intent or null if the text does not match
	 */
	private matchIntent(text: string, pattern: string): Intent | null {
		const regex = this.toRegex(pattern);
	}
	
	/**
	 * Converts an utterance pattern to a regular expression
	 * and a list of parameters.
	 */
	private toRegex(pattern: string): UtterancePattern {
		let regex = "";
		let literal = "";
		let i = 0;
		const parameters: string[] = [];
		
		while (i < pattern.length) {
			let c = pattern.charAt(i);
			if (c === "{") {
				// Append to regex
				regex += escapeRegex(literal) + "(.+?)";
				literal = "";
				
				// Add parameter
				let parameter = "";
				
				i++; // Skip '{'
				while (c !== "}") {
					parameter += c;
					i++;
					
					if (i >= pattern.length) {
						throw new Error("Could not find closing parenthesis in '" + pattern + "'");
					}
					
					c = pattern.charAt(i);
				}
				parameters.push(parameter);
			} else if (c === " ") {
				// Insensitivity to multiple spaces
				regex += "\\s+";
			} else {
				literal += c;
			}
		}
		
		if (literal.length > 0) {
			regex += escapeRegex(literal);
		}
		
		return {
			regex: new RegExp(regex),
			parameters: parameters
		};
	}
	
	public register(skill: Skill): void {
		this.skills.push(skill);
	}
	
	public unregister(skill: Skill): void {
		this.skills.splice(this.skills.indexOf(skill), 1);
	}
}
