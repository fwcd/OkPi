declare module "mic" {
	import { Transform } from "stream";
	
	function mic(options: {
		endian?: string;
		bitwidth?: number;
		encoding?: string;
		rate?: number;
		channels?: number;
		device?: string;
		exitOnSilence?: number;
		fileType?: string;
		debug?: boolean;
	}): Mic;
	
	interface Mic {
		start(): void;
		
		stop(): void;
		
		pause(): void;
		
		resume(): void;
		
		getAudioStream(): Transform;
	}
	
	export default mic;
}