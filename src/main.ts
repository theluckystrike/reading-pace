import { Editor, MarkdownView, Notice, Plugin, debounce } from 'obsidian';
import { describeReading } from './reading';
import { DEFAULT_SETTINGS, ReadingPaceSettingTab, normalizeSettings, type ReadingPaceSettings } from './settings';

export default class ReadingPacePlugin extends Plugin {
	settings: ReadingPaceSettings = { ...DEFAULT_SETTINGS };
	private statusEl: HTMLElement | null = null;
	private readonly scheduleRefresh = debounce(() => this.refreshStatusBar(), 300, true);

	async onload(): Promise<void> {
		await this.loadSettings();
		this.addSettingTab(new ReadingPaceSettingTab(this.app, this));

		this.statusEl = this.addStatusBarItem();
		this.statusEl.addClass('reading-pace-status');

		this.addCommand({
			id: 'show-reading-time',
			name: 'Show reading time',
			editorCallback: (editor: Editor) => {
				const view = describeReading(editor.getValue(), editor.getSelection(), this.settings);
				new Notice(view.detail);
			},
		});

		this.addCommand({
			id: 'save-reading-time-property',
			name: 'Save reading time to note properties',
			editorCheckCallback: (checking: boolean, editor: Editor, ctx) => {
				const file = ctx.file;
				if (!file) return false;
				if (!checking) {
					const view = describeReading(editor.getValue(), '', this.settings);
					const key = this.settings.propertyName;
					void this.app.fileManager
						.processFrontMatter(file, (fm: Record<string, unknown>) => {
							fm[key] = view.result.minutes;
						})
						.then(
							() => new Notice(`Saved ${key}: ${view.result.minutes}`),
							() => new Notice(`Could not save ${key}. Check the YAML in the properties block of this note.`),
						);
				}
				return true;
			},
		});

		this.registerEvent(this.app.workspace.on('active-leaf-change', () => this.refreshStatusBar()));
		this.registerEvent(this.app.workspace.on('editor-change', () => this.scheduleRefresh()));
		this.registerDomEvent(activeDocument, 'selectionchange', () => this.scheduleRefresh());
		this.app.workspace.onLayoutReady(() => this.refreshStatusBar());
	}

	onunload(): void {
		this.scheduleRefresh.cancel();
	}

	/** Updates or hides the status bar item for the active Markdown note. */
	refreshStatusBar(): void {
		const el = this.statusEl;
		if (!el) return;
		const editor = this.app.workspace.getActiveViewOfType(MarkdownView)?.editor;
		if (!this.settings.showStatusBar || !editor) {
			el.setText('');
			el.toggleClass('reading-pace-hidden', true);
			return;
		}
		const view = describeReading(editor.getValue(), editor.getSelection(), this.settings);
		el.toggleClass('reading-pace-hidden', false);
		el.setText(view.text);
		el.setAttr('aria-label', view.detail);
	}

	async loadSettings(): Promise<void> {
		this.settings = normalizeSettings((await this.loadData()) as Partial<ReadingPaceSettings> | null);
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}
}
