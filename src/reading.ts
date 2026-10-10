import { readingTime, type ReadingResult } from './core/index';
import type { ReadingPaceSettings } from './settings';

export interface ReadingView {
	scope: 'note' | 'selection';
	result: ReadingResult;
	/** Status bar text, e.g. "4 min read" or "Selection 1 min read". */
	text: string;
	/** Longer line for the tooltip and the notice. */
	detail: string;
}

const fmt = new Intl.NumberFormat('en-US');

/** Picks the selection or the whole note and turns it into status bar and notice text. */
export function describeReading(note: string, selection: string, settings: ReadingPaceSettings): ReadingView {
	const useSelection = settings.countSelection && selection.trim().length > 0;
	const result = readingTime(useSelection ? selection : note, {
		wordsPerMinute: settings.wordsPerMinute,
		cjkCharsPerMinute: settings.cjkCharsPerMinute,
		includeCode: settings.includeCode,
	});
	const parts = [`${fmt.format(result.words)} ${result.words === 1 ? 'word' : 'words'}`];
	if (result.cjkChars > 0) parts.push(`${fmt.format(result.cjkChars)} CJK characters`);
	const pace = `${settings.wordsPerMinute} wpm` + (result.cjkChars > 0 ? `, ${settings.cjkCharsPerMinute} cpm` : '');
	return {
		scope: useSelection ? 'selection' : 'note',
		result,
		text: useSelection ? `Selection ${lowerFirst(result.label)}` : result.label,
		detail: `${useSelection ? 'Selection' : 'Note'}: ${parts.join(', ')}. ${result.label} at ${pace}.`,
	};
}

function lowerFirst(s: string): string {
	return s.startsWith('Under') ? 'u' + s.slice(1) : s;
}
