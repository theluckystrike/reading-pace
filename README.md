# Reading Pace

Reading Pace shows how long the open note takes to read. The time sits in the status bar and updates as you type. Select a paragraph and it times only that paragraph.

Most reading time counters divide every word by 200 and stop there. Reading Pace skips the parts that a reader never reads. Properties, fenced code, link targets, comments and embedded images are left out. A note full of URLs does not look like a ten minute essay.

## Features

<img src="https://raw.githubusercontent.com/theluckystrike/reading-pace/HEAD/docs/reading-pace.gif" alt="Open a note, select a passage, then run Show reading time" width="720">

### Reading time in the status bar

<img src="https://raw.githubusercontent.com/theluckystrike/reading-pace/HEAD/docs/status-bar.png" alt="The status bar shows the reading time of the open note" width="720">

The status bar shows a short label for the open note, such as "4 min read". The label changes a moment after you stop typing. Hover over it to see the word count and the pace that Reading Pace used, for example "Note: 1,234 words. 7 min read at 200 wpm."

When the active tab is not a Markdown note, such as a canvas or a PDF, the label hides. The status bar is a desktop feature of Obsidian, so on a phone or tablet use the command instead.

### Time only the selection

<img src="https://raw.githubusercontent.com/theluckystrike/reading-pace/HEAD/docs/selection.png" alt="With text selected, the status bar times only the selection" width="720">

Select some text and the label changes to "Selection 3 min read", or "Selection under 1 min read" for a short passage. Clear the selection and the label goes back to the whole note. You can turn this off in the settings if you always want the time for the full note.

### Skips what readers never see

<img src="https://raw.githubusercontent.com/theluckystrike/reading-pace/HEAD/docs/show-reading-time.png" alt="The Show reading time command prints the word count and the pace in a notice" width="720">

Reading Pace counts the prose, not the markup. It leaves out:

- The properties block at the top of the note (YAML frontmatter).
- Fenced code blocks and inline code, unless you turn on "Count code blocks".
- The target of a Markdown link. The link text still counts.
- Bare URLs, HTML tags, footnote markers and block ids.

Comments are left out too, both `%% ... %%` and `<!-- ... -->`. So are embedded images, embedded notes and the numbers at the start of an ordered list.

A wikilink with an alias counts the alias. A plain wikilink counts the name of the linked note. A `---` line at the top of a note with no closing line is a horizontal rule, not a properties block, so the text under it still counts.

### A separate pace for Chinese and Japanese

<img src="https://raw.githubusercontent.com/theluckystrike/reading-pace/HEAD/docs/cjk-pace.png" alt="Japanese text is counted per character at its own pace and added to the English words" width="720">

Chinese and Japanese do not put spaces between words, so a word count makes no sense for them. Reading Pace counts Han, Hiragana and Katakana characters on their own and times them at a separate pace, 500 characters per minute by default. A note that mixes English and Japanese gets both times added together. The tooltip then shows both counts, for example "Note: 120 words, 300 CJK characters. 2 min read at 200 wpm, 500 cpm."

### Save the time to a property

<img src="https://raw.githubusercontent.com/theluckystrike/reading-pace/HEAD/docs/save-property.png" alt="Save reading time to note properties writes the minutes into the reading_time property" width="720">

The command "Save reading time to note properties" writes the reading time of the whole note, in whole minutes, into a property. The default property name is `reading_time`. A notice confirms the write, for example "Saved reading_time: 7". Because the value is a plain number, a Bases view or a Dataview table can sort and filter your notes by it. The command always times the whole note, even when text is selected, and it replaces any value that the property already has.

## Install

When Reading Pace is listed in the community directory, open Settings, then Community plugins, then Browse, and search for "Reading Pace". Select Install, then Enable.

To install by hand, download `main.js`, `manifest.json` and `styles.css` from the latest release. Put the three files in `<vault>/.obsidian/plugins/reading-pace/`. Restart Obsidian or reload the list of community plugins, then turn on Reading Pace.

Reading Pace needs Obsidian 1.13.4 or newer. It works on desktop and on mobile, except for the status bar, which Obsidian shows only on desktop.

## Usage

1. Open a note. The reading time appears in the status bar.
2. Select some text to see the time for that text only.
3. Open the command palette and run "Show reading time" to see the full numbers in a notice. This also works on mobile.
4. Run "Save reading time to note properties" to store the minutes in the note.

You can give either command a hotkey in Settings, then Hotkeys. Reading Pace sets no default hotkeys.

Times always round up. Anything under one minute shows as "Under 1 min read". An empty note shows "0 min read". Reads over an hour use hours and minutes, such as "1 h 5 min read", or "2 h read" when the minutes come out even.

## Settings

| Setting | Default | Allowed values |
| --- | --- | --- |
| Words per minute | 200 | 50 to 1000, in steps of 10 |
| Characters per minute for CJK text | 500 | 100 to 2000, in steps of 10 |
| Count code blocks | Off | On or off |
| Show in status bar | On | On or off |
| Time the selection | On | On or off |
| Property name | `reading_time` | Letters, digits, `.`, `-` and `_`, up to 64 characters |

The status bar updates as soon as you change a setting. If a value in the saved settings file is out of range, Reading Pace moves it to the nearest allowed value. If it is not a number at all, Reading Pace uses the default. An invalid property name also falls back to `reading_time`.

## FAQ

### Why is my time shorter than in another reading time tool?

Other tools often count every character on the page, including URLs and code. Reading Pace removes the parts that nobody reads aloud. A note with many links or a long code sample can show a much lower time here. Turn on "Count code blocks" if your readers do read your code.

### What pace should I use?

Most adults read plain prose at about 200 to 250 words per minute. Use a lower number for technical writing, or a higher one if you only skim. For Chinese and Japanese text, around 500 characters per minute is a common estimate. Set your own numbers in the settings.

### Does it count Korean as CJK?

No. Korean puts spaces between words, so Reading Pace counts Korean text as words at your words per minute pace. Only Han, Hiragana and Katakana characters use the character pace.

### Why does the label disappear?

The label shows only while a Markdown note is the active tab. It also hides when "Show in status bar" is off. On mobile there is no status bar, so run the command instead.

### Does the save command change anything else in my note?

It sets one property and leaves the rest of the note alone. If the existing properties block has broken YAML, Obsidian refuses the write. Reading Pace then shows a notice that asks you to check the YAML. Fix it and run the command again.

### Can I time a whole folder?

No. Reading Pace times one note or one selection at a time.

## Payment, account and network

Reading Pace is free and open source. It has no paid features, no license key and no trial. It does not ask you to sign in or create an account. It makes no network requests of any kind, and it has no analytics, telemetry or ads. It reads only the note that is open in the editor. It writes in two places: the property that you ask it to save, and its own settings file (`data.json` in the plugin folder). The `fundingUrl` in `manifest.json` points to the author's GitHub Sponsors page. A gift there is optional and unlocks nothing.

## Support

Report a bug or ask for a feature in the issue tracker of this repository. Please include your Obsidian version, your device, and a short sample note that shows the problem. To support the work, use [GitHub Sponsors](https://github.com/sponsors/theluckystrike).

To build from source:

```
npm ci
npm run build
npm test
```

The tests run the plugin against an in-memory vault and check 13 golden cases, such as 400 words at 200 wpm giving exactly 2 minutes.

## License

MIT
