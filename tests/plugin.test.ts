import { describe, expect, it } from 'vitest';
import { App, Editor } from 'obsidian-test-mocks/obsidian';
import { readingTime } from '../src/core/index';
import vectors from './vectors/reading-pace.json';
import ReadingPacePlugin from '../src/main';
import { describeReading } from '../src/reading';
import { DEFAULT_SETTINGS, normalizeSettings } from '../src/settings';
import manifest from '../manifest.json';

class TestEditor extends (Editor as unknown as new () => Editor) {}

function makePlugin() {
	const app = App.createConfigured__({ files: { 'notes/a.md': '# Hello world' } });
	return new ReadingPacePlugin(app as never, manifest as never);
}

describe('golden vectors (packages/spec/vectors/reading-pace.json)', () => {
	for (const c of vectors.cases) {
		it(c.name, () => {
			const [text, options] = c.args as [string, Record<string, unknown>];
			expect(readingTime(text, options)).toEqual(c.expected);
		});
	}
});

describe('settings', () => {
	it('loads defaults from an empty data.json', async () => {
		const plugin = makePlugin();
		await plugin.loadSettings();
		expect(plugin.settings).toEqual(DEFAULT_SETTINGS);
	});

	it('repairs out-of-range and wrong-type values', () => {
		expect(
			normalizeSettings({ wordsPerMinute: 99999, cjkCharsPerMinute: 'fast', includeCode: 'yes', propertyName: 'bad name!' }),
		).toEqual({ ...DEFAULT_SETTINGS, wordsPerMinute: 1000 });
		expect(normalizeSettings({ wordsPerMinute: '250' }).wordsPerMinute).toBe(250);
	});
});

describe('describeReading', () => {
	const note = Array.from({ length: 600 }, () => 'word').join(' ');

	it('times the whole note when nothing is selected', () => {
		const v = describeReading(note, '', DEFAULT_SETTINGS);
		expect(v.scope).toBe('note');
		expect(v.text).toBe('3 min read');
		expect(v.detail).toBe('Note: 600 words. 3 min read at 200 wpm.');
	});

	it('times only the selection when one exists', () => {
		const v = describeReading(note, 'just three words', DEFAULT_SETTINGS);
		expect(v.scope).toBe('selection');
		expect(v.text).toBe('Selection under 1 min read');
	});

	it('ignores the selection when the setting is off', () => {
		const v = describeReading(note, 'just three words', { ...DEFAULT_SETTINGS, countSelection: false });
		expect(v.scope).toBe('note');
	});

	it('mentions CJK pace only when CJK text is present', () => {
		const v = describeReading('日本語', '', DEFAULT_SETTINGS);
		expect(v.detail).toBe('Note: 0 words, 3 CJK characters. Under 1 min read at 200 wpm, 500 cpm.');
	});
});

describe('plugin wiring', () => {
	it('registers both commands and a status bar item', async () => {
		const plugin = makePlugin();
		await plugin.onload();
		const mock = plugin as unknown as { commands__: Map<string, unknown>; statusBarItems__: HTMLElement[] };
		expect([...mock.commands__.keys()].sort()).toEqual(['save-reading-time-property', 'show-reading-time']);
		expect(mock.statusBarItems__.length).toBe(1);
	});

	it('show-reading-time reads the editor it is given', async () => {
		const plugin = makePlugin();
		await plugin.onload();
		const cmd = (plugin as unknown as { commands__: Map<string, { editorCallback: (e: unknown, v: unknown) => void }> }).commands__.get(
			'show-reading-time',
		);
		const editor = new TestEditor();
		editor.setValue(Array.from({ length: 400 }, () => 'word').join(' '));
		expect(() => cmd?.editorCallback(editor, {})).not.toThrow();
		expect(describeReading(editor.getValue(), editor.getSelection(), plugin.settings).text).toBe('2 min read');
	});
});
