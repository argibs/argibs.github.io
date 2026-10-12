import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { mkdir, readFile, realpath, writeFile } from 'node:fs/promises';
import { dirname, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import notebookjs from 'notebookjs';
import { JSDOM } from 'jsdom';
import Prism from 'prismjs';
import 'prismjs/components/prism-python.js';

const css = readFileSync(new URL('./notebook-preview.css', import.meta.url), 'utf8');
// Only this fixed script may execute. Notebook scripts/MIME JavaScript are never enabled.
const bridge = `let expandedImageControl=null;
document.addEventListener('click',function(event){const control=event.target.closest('button[data-notebook-image]');if(!control)return;const image=control.querySelector('img');expandedImageControl=control;parent.postMessage({type:'portfolio-notebook-image',src:image.getAttribute('src'),alt:image.alt},'*');});
window.addEventListener('message',function(event){if(event.source===parent&&event.data?.type==='portfolio-notebook-restore-image-focus'&&expandedImageControl?.isConnected)expandedImageControl.focus();});
document.addEventListener('keydown',function(event){if(event.key==='Escape'){event.preventDefault();parent.postMessage({type:'portfolio-notebook-escape'},'*');}});parent.postMessage({type:'portfolio-notebook-ready'},'*');`;
const hash = (text) => createHash('sha256').update(text).digest('base64');
const policy = `default-src 'none'; script-src 'sha256-${hash(bridge)}'; style-src 'sha256-${hash(css)}'; img-src data:; font-src 'none'; connect-src 'none'; frame-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'`;

const isText = (value) => typeof value === 'string' || (Array.isArray(value) && value.every((item) => typeof item === 'string'));
const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const isCount = (value) => value === null || (Number.isInteger(value) && value >= 0);

function validateNotebook(notebook) {
  if (notebook?.nbformat !== 4 || !Array.isArray(notebook.cells)) throw new Error('Malformed notebook: expected nbformat 4 cells');
  notebook.cells.forEach((cell, index) => {
    const fail = (field) => { throw new Error(`Malformed notebook: cell ${index + 1} ${field}`); };
    if (!isRecord(cell) || !['code', 'markdown', 'raw'].includes(cell.cell_type) || !isText(cell.source)) fail('requires a supported cell type and textual source');
    if (cell.cell_type !== 'code') return;
    if (!Array.isArray(cell.outputs)) fail('requires an outputs array');
    if (!isCount(cell.execution_count)) fail('requires an integer or null execution_count');
    cell.outputs.forEach((output, outputIndex) => {
      const field = `output ${outputIndex + 1}`;
      if (!isRecord(output)) fail(`${field} must be an object`);
      switch (output.output_type) {
        case 'display_data':
        case 'execute_result': {
          if (!isRecord(output.data)) fail(`${field} requires a MIME data bundle`);
          for (const [mime, value] of Object.entries(output.data)) {
            if (!/^[\w!#$&^.+-]+\/[\w!#$&^.+-]+$/.test(mime)) fail(`${field} has an invalid MIME type`);
            if ((mime.startsWith('text/') || ['image/png', 'image/jpeg', 'image/svg+xml', 'application/javascript'].includes(mime)) && !isText(value)) fail(`${field} ${mime} requires textual data`);
          }
          if (output.output_type === 'execute_result' && !isCount(output.execution_count)) fail(`${field} requires an integer or null execution_count`);
          break;
        }
        case 'stream':
          if (!['stdout', 'stderr'].includes(output.name) || !isText(output.text)) fail(`${field} requires a stream name and textual stream text`);
          break;
        case 'error':
          if (typeof output.ename !== 'string' || typeof output.evalue !== 'string' || !Array.isArray(output.traceback) || !output.traceback.every((line) => typeof line === 'string')) fail(`${field} requires error strings and a textual traceback array`);
          break;
        default:
          fail(`${field} has an unsupported output_type`);
      }
    });
  });
}

function canonicalRenderInput(notebook) {
  // NotebookJS also accepts v3 aliases, some with precedence over v4 fields.
  // Project only the fields this v4 rendering path validates and needs. Never
  // spread notebook/cell/output objects back into the library input.
  const metadata = {};
  if (typeof notebook.metadata?.language_info?.name === 'string') {
    metadata.language_info = { name: notebook.metadata.language_info.name };
  }
  if (typeof notebook.metadata?.kernelspec?.language === 'string') {
    metadata.kernelspec = { language: notebook.metadata.kernelspec.language };
  }
  return {
    nbformat: 4,
    metadata,
    cells: notebook.cells.map((cell) => {
      const canonical = { cell_type: cell.cell_type, metadata: {}, source: structuredClone(cell.source) };
      if (cell.cell_type !== 'code') return canonical;
      canonical.execution_count = cell.execution_count;
      canonical.outputs = cell.outputs.map((output) => {
        const base = { output_type: output.output_type };
        switch (output.output_type) {
          case 'stream':
            return { ...base, name: output.name, text: structuredClone(output.text) };
          case 'error':
            return { ...base, ename: output.ename, evalue: output.evalue, traceback: [...output.traceback] };
          case 'execute_result':
            return { ...base, metadata: {}, data: structuredClone(output.data), execution_count: output.execution_count };
          case 'display_data':
            return { ...base, metadata: {}, data: structuredClone(output.data) };
          default:
            throw new Error('Malformed notebook: unsupported output_type');
        }
      });
      return canonical;
    }),
  };
}

export function renderNotebook(notebook, title) {
  validateNotebook(notebook);

  notebookjs.executeJavaScript = false;
  notebookjs.display_priority = notebookjs.display_priority.filter((mime) => !['javascript', 'application/javascript'].includes(mime));
  // The library sanitizes Markdown/HTML. Sanitize the entire rendered document too,
  // so all output types receive the same policy before adding our own fixed shell.
  const rendered = notebookjs.parse(canonicalRenderInput(notebook)).render();
  const dom = new JSDOM('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="portfolio-notebook-preview" content="1"></head><body><main></main></body></html>');
  const doc = dom.window.document;
  const main = doc.querySelector('main');
  main.innerHTML = notebookjs.sanitizer(rendered.outerHTML);
  main.querySelectorAll('script, style, link, meta, base, iframe, object, embed, form, input, textarea, select, button, audio, video, source, svg').forEach((element) => element.remove());
  main.querySelectorAll('*').forEach((element) => {
    for (const attribute of [...element.attributes]) {
      const name = attribute.name.toLowerCase();
      if (name.startsWith('on') || ['style', 'srcset', 'action', 'formaction', 'target', 'id', 'name'].includes(name) ||
        (name === 'href' && !attribute.value.startsWith('#')) ||
        (name === 'src' && !/^data:image\/(?:png|jpeg);base64,[a-z\d+/=\s]+$/i.test(attribute.value))) {
        element.removeAttribute(attribute.name);
      }
    }
  });
  main.querySelectorAll('img').forEach((image, index) => {
    image.alt ||= `${title} \u2014 saved notebook output ${index + 1}`;
    if (!image.classList.contains('nb-image-output') || !image.hasAttribute('src')) return;
    image.setAttribute('src', image.getAttribute('src').replace(/\s/g, ''));
    const control = doc.createElement('button');
    control.type = 'button';
    control.className = 'nb-image-control';
    control.setAttribute('data-notebook-image', '');
    control.setAttribute('aria-label', `Expand image: ${image.alt}`);
    image.replaceWith(control);
    control.append(image);
    const hint = doc.createElement('span');
    hint.textContent = 'Expand image';
    control.append(hint);
  });
  // Highlight decoded textContent, not the library's HTML-escaped highlighter input.
  main.querySelectorAll('pre code').forEach((code) => {
    const language = code.getAttribute('data-language') || code.className.match(/(?:lang|language)-([\w-]+)/)?.[1] || 'text';
    if (Prism.languages[language]) {
      code.innerHTML = Prism.highlight(code.textContent, Prism.languages[language], language);
      code.className = `language-${language}`;
    }
  });
  const titleElement = doc.createElement('title');
  titleElement.textContent = title;
  const csp = doc.createElement('meta');
  csp.httpEquiv = 'Content-Security-Policy';
  csp.content = policy;
  const style = doc.createElement('style');
  style.textContent = css;
  doc.head.append(csp, titleElement, style);
  const script = doc.createElement('script');
  script.textContent = bridge;
  doc.body.append(script);
  return dom.serialize();
}

export async function generatePreviews(publicDir = resolve('public')) {
  const projects = JSON.parse(await readFile(resolve(publicDir, 'coding_projects.json'), 'utf8'));
  if (!Array.isArray(projects)) throw new Error('Malformed coding projects manifest');
  const sourceRoot = await realpath(resolve(publicDir, 'assets/coding_projects'));
  for (const project of projects) {
    const path = project.notebook;
    if (typeof path !== 'string' || !/^assets\/coding_projects\/(?:[\w-]+\/)*[\w.-]+\.ipynb$/i.test(path)) {
      throw new Error(`Unsafe notebook path: ${path}`);
    }
    const source = await realpath(resolve(publicDir, path));
    if (!source.startsWith(sourceRoot + sep)) throw new Error(`Notebook escapes source directory: ${path}`);
    const notebook = JSON.parse(await readFile(source, 'utf8'));
    const html = renderNotebook(notebook, project.title || 'Notebook preview');
    const output = resolve(publicDir, 'notebook-previews', path.replace(/\.ipynb$/i, '.html'));
    await mkdir(dirname(output), { recursive: true });
    await writeFile(output, html);
  }
  return projects.length;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const count = await generatePreviews();
  console.log(`Generated ${count} local notebook preview(s).`);
}
