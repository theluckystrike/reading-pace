import { PluginSettingTab, type SettingDefinitionItem } from 'obsidian';
import { clampNumber } from './core/index';
import type ReadingPacePlugin from './main';

export interface ReadingPaceSettings {
	wordsPerMinute: number;
	cjkCharsPerMinute: number;
	includeCode: boolean;
	showStatusBar: boolean;
	countSelection: boolean;
	propertyName: string;
}

export const DEFAULT_SETTINGS: ReadingPaceSettings = {
	wordsPerMinute: 200,
	cjkCharsPerMinute: 500,
	includeCode: false,
	showStatusBar: true,
	countSelection: true,
	propertyName: 'reading_time',
};

export const LIMITS = {
	wordsPerMinute: [50, 1000],
	cjkCharsPerMinute: [100, 2000],
} as const;

/** Fills gaps and repairs bad values from saved data, so a hand-edited data.json never breaks the plugin. */
export function normalizeSettings(saved: Partial<Record<keyof ReadingPaceSettings, unknown>> | null | undefined): ReadingPaceSettings {
	const s = saved ?? {};
	const bool = (v: unknown, d: boolean) => (typeof v === 'boolean' ? v : d);
	const prop = typeof s.propertyName === 'string' ? s.propertyName.trim() : '';
	return {
		wordsPerMinute: clampNumber(s.wordsPerMinute, LIMITS.wordsPerMinute[0], LIMITS.wordsPerMinute[1], DEFAULT_SETTINGS.wordsPerMinute),
		cjkCharsPerMinute: clampNumber(s.cjkCharsPerMinute, LIMITS.cjkCharsPerMinute[0], LIMITS.cjkCharsPerMinute[1], DEFAULT_SETTINGS.cjkCharsPerMinute),
		includeCode: bool(s.includeCode, DEFAULT_SETTINGS.includeCode),
		showStatusBar: bool(s.showStatusBar, DEFAULT_SETTINGS.showStatusBar),
		countSelection: bool(s.countSelection, DEFAULT_SETTINGS.countSelection),
		propertyName: /^[\w.-]{1,64}$/.test(prop) ? prop : DEFAULT_SETTINGS.propertyName,
	};
}

function rangeCheck(min: number, max: number) {
	return (value: number): string | void => {
		if (!Number.isFinite(value) || value < min || value > max) return `Use a number from ${min} to ${max}.`;
	};
}

export class ReadingPaceSettingTab extends PluginSettingTab {
	plugin: ReadingPacePlugin;

	constructor(app: ConstructorParameters<typeof PluginSettingTab>[0], plugin: ReadingPacePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	getSettingDefinitions(): SettingDefinitionItem[] {
		return [
			{
				name: 'Words per minute',
				desc: 'Reading speed for languages that put spaces between words. Most adults read 200 to 250.',
				control: {
					type: 'number',
					key: 'wordsPerMinute',
					defaultValue: DEFAULT_SETTINGS.wordsPerMinute,
					min: LIMITS.wordsPerMinute[0],
					max: LIMITS.wordsPerMinute[1],
					step: 10,
					validate: rangeCheck(LIMITS.wordsPerMinute[0], LIMITS.wordsPerMinute[1]),
				},
			},
			{
				name: 'Characters per minute for CJK text',
				desc: 'Reading speed for Chinese and Japanese, counted per character. Around 500 is typical.',
				control: {
					type: 'number',
					key: 'cjkCharsPerMinute',
					defaultValue: DEFAULT_SETTINGS.cjkCharsPerMinute,
					min: LIMITS.cjkCharsPerMinute[0],
					max: LIMITS.cjkCharsPerMinute[1],
					step: 10,
					validate: rangeCheck(LIMITS.cjkCharsPerMinute[0], LIMITS.cjkCharsPerMinute[1]),
				},
			},
			{
				name: 'Count code blocks',
				desc: 'Off skips fenced code, which most readers scan rather than read.',
				control: { type: 'toggle', key: 'includeCode', defaultValue: DEFAULT_SETTINGS.includeCode },
			},
			{
				name: 'Show in status bar',
				desc: 'Shows the reading time of the open note at the bottom of the window. Desktop only.',
				control: { type: 'toggle', key: 'showStatusBar', defaultValue: DEFAULT_SETTINGS.showStatusBar },
			},
			{
				name: 'Time the selection',
				desc: 'When text is selected, the status bar and the command time only the selection.',
				control: { type: 'toggle', key: 'countSelection', defaultValue: DEFAULT_SETTINGS.countSelection },
			},
			{
				name: 'Property name',
				desc: 'Property that the save command writes the minutes into.',
				control: {
					type: 'text',
					key: 'propertyName',
					defaultValue: DEFAULT_SETTINGS.propertyName,
					validate: (v: string) => (/^[\w.-]{1,64}$/.test(v.trim()) ? undefined : 'Use letters, digits, dots, dashes or underscores.'),
				},
			},
		];
	}

	async setControlValue(key: string, value: unknown): Promise<void> {
		await super.setControlValue(key, value);
		this.plugin.settings = normalizeSettings(this.plugin.settings);
		this.plugin.refreshStatusBar();
	}
}
