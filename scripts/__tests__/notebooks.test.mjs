import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { JSDOM } from 'jsdom';
import { createHash } from 'node:crypto';
import { afterEach, describe, expect, it } from 'vitest';
import { generatePreviews, renderNotebook } from '../notebooks.mjs';

const notebook = {
  nbformat: 4, nbformat_minor: 5, metadata: { language_info: { name: 'python' } },
  cells: [
    { cell_type: 'markdown', metadata: {}, source: ['# Example\n\n**Saved** results\n\n| A | B |\n|---|---|\n|1|2|\n'] },
    { cell_type: 'code', metadata: {}, execution_count: 1, source: ['print("<saved> & result")'], outputs: [
      { output_type: 'stream', name: 'stdout', text: ['saved output\n'] },
      { output_type: 'display_data', data: { 'image/png': 'iVBORw0KGgo=', 'text/plain': '<Figure>' }, metadata: {} },
      { output_type: 'execute_result', data: { 'text/plain': ['42 < 100'] }, metadata: {}, execution_count: 1 },
    ] },
  ],
};

const dirs = [];
afterEach(async () => { await Promise.all(dirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true }))); });

describe('static notebook previews', () => {
  it('renders library Markdown, highlighted code and saved PNG/plain-text output as a complete document', () => {
    const html = renderNotebook(notebook, 'Example notebook');
    const doc = new JSDOM(html).window.document;
    expect(html).toMatch(/^<!doctype html>/i);
    expect(doc.title).toBe('Example notebook');
    expect(doc.querySelector('h1')?.textContent).toBe('Example');
    expect(doc.querySelector('strong')?.textContent).toBe('Saved');
    expect(doc.querySelector('table td')?.textContent).toBe('1');
    expect(doc.querySelector('pre code')?.textContent).toBe('print("<saved> & result")');
    expect(doc.querySelector('pre code .token')).not.toBeNull();
    expect(doc.querySelector('img')?.getAttribute('src')).toBe('data:image/png;base64,iVBORw0KGgo=');
    expect(doc.querySelector('img')?.alt).toBeTruthy();
    expect(doc.body.textContent).toContain('saved output');
    expect(doc.body.textContent).toContain('42 < 100');
  });

  it('sanitizes notebook HTML, disables executable MIME output and authorizes only the fixed control bridge', () => {
    const malicious = structuredClone(notebook);
    malicious.cells[0].source = ['<script>window.evil=1</script><img src="https://evil.example/image" onerror="alert(1)"><iframe src="https://evil.example"></iframe><a href="javascript:alert(1)">bad link</a><style>body{display:none}</style>'];
    malicious.cells[1].outputs.push(
      { output_type: 'display_data', data: { 'application/javascript': 'window.evil=2', 'text/plain': 'safe fallback' } },
      { output_type: 'display_data', data: { 'application/javascript': 'window.evil=3' } },
      { output_type: 'display_data', data: { 'text/html': '<img src="/secret" onload="alert(1)"><script>window.evil=4</script><form action="https://evil.example"><input></form>' } },
    );
    const doc = new JSDOM(renderNotebook(malicious, '<Unsafe title>')).window.document;
    expect(doc.title).toBe('<Unsafe title>');
    expect(doc.querySelectorAll('script')).toHaveLength(1);
    expect(doc.querySelector('script')?.textContent).not.toContain('evil');
    expect(doc.body.textContent).toContain('safe fallback');
    expect(doc.querySelector('iframe, form, input, [onerror], [onload], a[href^="javascript:"], img[src^="http"], img[src^="/"]')).toBeNull();
    const policy = doc.querySelector('meta[http-equiv="Content-Security-Policy"]')?.content;
    expect(policy).toContain("default-src 'none'");
    expect(policy).toMatch(/script-src 'sha256-[^']+'/);
    expect(policy).not.toContain("script-src 'unsafe-inline'");
    expect(doc.querySelector('script')?.textContent).toContain('Escape');
    expect(doc.querySelector('script')?.textContent).toContain('postMessage');
  });

  it('rejects malformed notebooks rather than publishing empty or partial previews', () => {
    for (const input of [{}, { nbformat: 4, cells: 'bad' }, { nbformat: 4, cells: [{ cell_type: 'markdown', source: 123 }] }]) {
      expect(() => renderNotebook(input, 'Invalid')).toThrow(/notebook/i);
    }
  });

  it('renders validated v4 cells even when a legacy worksheets override is present', () => {
    const input = { ...structuredClone(notebook), worksheets: [] };
    const doc = new JSDOM(renderNotebook(input, 'Example notebook')).window.document;
    expect(doc.querySelector('h1')?.textContent).toBe('Example');
    expect(doc.querySelector('pre code')?.textContent).toBe('print("<saved> & result")');
  });

  it.each([
    { mime: 'text/plain', data: 'Validated saved output', alias: 42 },
    { mime: 'image/png', data: 'iVBORw0KGgo=', alias: 42 },
    { mime: 'text/html', data: '<strong>Validated saved output</strong>', alias: '<strong>Legacy override</strong>' },
  ])('renders only validated output.data for $mime, not its legacy top-level override', ({ mime, data, alias }) => {
    const input = structuredClone(notebook);
    input.cells[1].outputs = [{ output_type: 'display_data', data: { [mime]: data }, [mime]: alias }];
    const doc = new JSDOM(renderNotebook(input, 'Example notebook')).window.document;
    if (mime === 'image/png') {
      expect(doc.querySelector('button img')?.getAttribute('src')).toBe('data:image/png;base64,iVBORw0KGgo=');
    } else {
      expect(doc.querySelector('.nb-output')?.textContent).toBe('Validated saved output');
    }
  });

  it.each([
    { alias: 'input', value: [42] },
    { alias: 'prompt_number', value: 999 },
    { alias: 'language', value: 'javascript' },
  ])('ignores legacy cell.$alias in favor of validated v4 source, count, and language metadata', ({ alias, value }) => {
    const input = structuredClone(notebook);
    input.cells[1][alias] = value;
    const before = structuredClone(input);
    const doc = new JSDOM(renderNotebook(input, 'Example notebook')).window.document;
    expect(doc.querySelector('pre code')?.textContent).toBe('print("<saved> & result")');
    expect(doc.querySelector('.nb-input')?.getAttribute('data-prompt-number')).toBe('1');
    expect(doc.querySelector('pre code')?.getAttribute('data-language')).toBe('python');
    expect(input).toEqual(before);
  });

  it('uses standard stream names and coalesces streams without the legacy stream alias', () => {
    const input = structuredClone(notebook);
    input.cells[1].outputs = [
      { output_type: 'stream', name: 'stdout', text: ['first'], stream: 'stderr' },
      { output_type: 'stream', name: 'stdout', text: ['second'], stream: 'legacy' },
    ];
    const before = structuredClone(input);
    const doc = new JSDOM(renderNotebook(input, 'Example notebook')).window.document;
    expect(doc.querySelectorAll('.nb-output')).toHaveLength(1);
    expect(doc.querySelector('.nb-stdout')?.textContent).toBe('firstsecond');
    expect(input).toEqual(before);
  });

  it('uses standard language metadata instead of a legacy metadata.language override', () => {
    const input = structuredClone(notebook);
    input.metadata.language = 'javascript';
    const doc = new JSDOM(renderNotebook(input, 'Example notebook')).window.document;
    expect(doc.querySelector('pre code')?.getAttribute('data-language')).toBe('python');
  });

  it.each([
    { name: 'missing code outputs', cell: { cell_type: 'code', source: '', execution_count: null } },
    { name: 'invalid code execution count', cell: { cell_type: 'code', source: '', execution_count: 'one', outputs: [] } },
    { name: 'missing display data', output: { output_type: 'display_data' } },
    { name: 'missing execute-result data', output: { output_type: 'execute_result', execution_count: 1 } },
    { name: 'non-object MIME bundle', output: { output_type: 'display_data', data: [] } },
    { name: 'invalid MIME key', output: { output_type: 'display_data', data: { invalid: 'text' } } },
    { name: 'non-text rendered MIME', output: { output_type: 'display_data', data: { 'text/plain': 42 } } },
    { name: 'missing stream text', output: { output_type: 'stream', name: 'stdout' } },
    { name: 'invalid stream text', output: { output_type: 'stream', name: 'stdout', text: [42] } },
    { name: 'missing traceback', output: { output_type: 'error', ename: 'Error', evalue: 'failure' } },
    { name: 'non-array traceback', output: { output_type: 'error', ename: 'Error', evalue: 'failure', traceback: 'failure' } },
    { name: 'unknown output', output: { output_type: 'unexpected', data: { 'text/plain': 'text' } } },
  ])('rejects $name with a descriptive structure error', ({ cell, output }) => {
    const invalid = structuredClone(notebook);
    invalid.cells[1] = cell ?? { ...invalid.cells[1], outputs: [output] };
    expect(() => renderNotebook(invalid, 'Invalid')).toThrow(/Malformed notebook.*cell 2/i);
  });

  it('turns saved PNG/JPEG outputs into native controls whose fixed bridge opens and restores the actual image button', () => {
    const images = structuredClone(notebook);
    images.cells[1].outputs.push({ output_type: 'display_data', data: { 'image/jpeg': '/9j/AA==' }, metadata: {} });
    const messages = [];
    const dom = new JSDOM(renderNotebook(images, 'Example notebook'), {
      runScripts: 'dangerously',
      beforeParse(window) { window.postMessage = (message) => messages.push(message); },
    });
    const doc = dom.window.document;
    const buttons = [...doc.querySelectorAll('button')];
    expect(buttons).toHaveLength(2);
    for (const button of buttons) {
      expect(button.type).toBe('button');
      expect(button.getAttribute('aria-label')).toMatch(/Expand.*saved notebook output/i);
      button.focus();
      button.click();
      expect(messages.at(-1)).toEqual({ type: 'portfolio-notebook-image', src: button.querySelector('img').src, alt: button.querySelector('img').alt });
      doc.body.tabIndex = -1;
      doc.body.focus();
      dom.window.dispatchEvent(new dom.window.MessageEvent('message', { source: null, data: { type: 'portfolio-notebook-restore-image-focus' } }));
      expect(doc.activeElement).toBe(doc.body);
      dom.window.dispatchEvent(new dom.window.MessageEvent('message', { source: dom.window.parent, data: { type: 'portfolio-notebook-restore-image-focus' } }));
      expect(doc.activeElement).toBe(button);
    }
    const script = doc.querySelector('script').textContent;
    const digest = createHash('sha256').update(script).digest('base64');
    expect(doc.querySelector('meta[http-equiv="Content-Security-Policy"]').content).toContain(`script-src 'sha256-${digest}'`);
    dom.window.close();
  });

  async function fixture(path = 'assets/coding_projects/example.ipynb') {
    const dir = await mkdtemp(join(tmpdir(), 'portfolio-notebook-test-'));
    dirs.push(dir);
    const publicDir = join(dir, 'public');
    await mkdir(join(publicDir, 'assets/coding_projects'), { recursive: true });
    await writeFile(join(publicDir, 'coding_projects.json'), JSON.stringify([{ title: 'Example', notebook: path }]));
    await writeFile(join(publicDir, 'assets/coding_projects/example.ipynb'), JSON.stringify(notebook));
    return publicDir;
  }

  it('generates the local preview without changing the original notebook', async () => {
    const publicDir = await fixture();
    const original = await readFile(join(publicDir, 'assets/coding_projects/example.ipynb'));
    await generatePreviews(publicDir);
    const html = await readFile(join(publicDir, 'notebook-previews/assets/coding_projects/example.html'), 'utf8');
    expect(new JSDOM(html).window.document.querySelector('h1')?.textContent).toBe('Example');
    expect(await readFile(join(publicDir, 'assets/coding_projects/example.ipynb'))).toEqual(original);
  });

  it.each(['../outside.ipynb', 'assets/coding_projects/../../outside.ipynb', '/etc/passwd', 'https://evil.example/n.ipynb', 'assets/coding_projects/missing.ipynb'])('fails generation for unsafe or missing notebook path %s', async (path) => {
    await expect(generatePreviews(await fixture(path))).rejects.toThrow();
  });
});
