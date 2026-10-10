// End-to-end smoke test in a real Obsidian (wdio-obsidian-service). Run: npm run build && npm run test:e2e
// OBSIDIAN_VERSIONS is a space separated list of app/installer pairs. CI runs "earliest/earliest" and
// "latest/latest" on ubuntu-latest under Xvfb. "earliest" here means the first PUBLIC release at or above
// minAppVersion: Obsidian ships most x.y.0 builds to Insiders only, and those need an account to download.
// Set OBSIDIAN_EMAIL and OBSIDIAN_PASSWORD (an Insiders account) and OBSIDIAN_ALLOW_BETA=1 to test the exact minAppVersion.
import { readFileSync } from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import ObsidianLauncher from 'obsidian-launcher';

const cacheDir = process.env.OBSIDIAN_CACHE ?? path.join(os.homedir(), '.cache', 'obsidian-launcher');
const { minAppVersion } = JSON.parse(readFileSync('manifest.json', 'utf8')) as { minAppVersion: string };

const parts = (v: string) => v.split(/[.-]/).slice(0, 3).map(Number);
const cmp = (a: string, b: string) => {
	const [x, y] = [parts(a), parts(b)];
	for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return (x[i] ?? 0) - (y[i] ?? 0);
	return 0;
};

/** First public (non-Insiders) Obsidian release that is at least minAppVersion. */
async function earliestPublic(): Promise<string> {
	if (process.env.OBSIDIAN_ALLOW_BETA === '1') return 'earliest';
	const versions = await new ObsidianLauncher({ cacheDir }).getVersions();
	const ok = versions
		.filter((v) => !v.isBeta && !!v.downloads?.asar && cmp(v.version, minAppVersion) >= 0)
		.sort((a, b) => cmp(a.version, b.version));
	if (!ok[0]) throw new Error(`no public Obsidian release at or above minAppVersion ${minAppVersion}`);
	if (ok[0].version !== minAppVersion) console.log(`wdio: minAppVersion ${minAppVersion} is Insiders-only, testing ${ok[0].version}`);
	return ok[0].version;
}

const pairs = (process.env.OBSIDIAN_VERSIONS ?? 'earliest/earliest latest/latest')
	.split(/\s+/)
	.filter(Boolean)
	.map((pair) => pair.split('/'));
const versions = await Promise.all(
	pairs.map(async ([app, installer]) => [app === 'earliest' ? await earliestPublic() : (app ?? 'latest'), installer ?? 'earliest']),
);

export const config: WebdriverIO.Config = {
	runner: 'local',
	framework: 'mocha',
	specs: ['./test/e2e/**/*.e2e.ts'],
	maxInstances: Number(process.env.WDIO_MAX_INSTANCES ?? 1),
	capabilities: versions.map(([appVersion, installerVersion]) => ({
		browserName: 'obsidian',
		browserVersion: appVersion,
		'wdio:obsidianOptions': {
			installerVersion,
			plugins: ['.'],
			vault: 'test/e2e/vault',
		},
	})),
	services: ['obsidian'],
	reporters: ['obsidian'],
	// Shared download cache for every product; CI caches the same folder.
	cacheDir,
	mochaOpts: { ui: 'bdd', timeout: 120_000 },
	logLevel: 'warn',
};
