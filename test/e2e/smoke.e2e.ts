import { browser, expect } from '@wdio/globals';
import { obsidianPage } from 'wdio-obsidian-service';
import { lastNotice, pluginId, reloadPlugin } from './load';

// 400 plain words at the default 200 words per minute is exactly 2 minutes (golden vector).
const note = Array.from({ length: 40 }, () => 'Reading time counts each of these ten plain words once.').join(' ');

describe(`${pluginId} smoke test`, function () {
	it('is enabled and reloads with no console errors', async function () {
		const state = await reloadPlugin(pluginId);
		expect(state).toEqual({ enabled: true, reloaded: true, errors: [] });
	});

	it('shows the reading time in the status bar and in a notice', async function () {
		await obsidianPage.write('Smoke.md', note);
		await obsidianPage.openFile('Smoke.md');
		await browser.waitUntil(async () => (await browser.$('.reading-pace-status').getText()) === '2 min read', {
			timeout: 5000,
			timeoutMsg: 'status bar never showed "2 min read"',
		});
		await browser.executeObsidianCommand(`${pluginId}:show-reading-time`);
		await browser.waitUntil(async () => (await lastNotice()) === 'Note: 400 words. 2 min read at 200 wpm.', {
			timeout: 5000,
			timeoutMsg: 'no "Note: 400 words" notice',
		});
	});
});
