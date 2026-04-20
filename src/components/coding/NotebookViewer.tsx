import { useEffect, useState, type ReactElement } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-python';
import './prism-custom.css';
import { asset } from '../../utils/asset';
import styles from './NotebookViewer.module.css';

interface NotebookCell {
  cell_type: 'markdown' | 'code' | 'raw';
  source: string[];
  outputs?: NotebookOutput[];
}

interface NotebookOutput {
  output_type: string;
  text?: string | string[];
  data?: Record<string, string | string[]>;
  traceback?: string[];
}

function toStr(val: string | string[]): string {
  return Array.isArray(val) ? val.join('') : val;
}

interface Props {
  notebookPath: string;
  onImageClick?: (src: string) => void;
}

function renderMarkdown(source: string): string {
  let html = source;
  html = html.replace(/^#{1,6}\s+(.+)$/gm, (match, text) => {
    const level = match.trim().indexOf(' ');
    return `<h${level}>${text}</h${level}>`;
  });
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  html = html.replace(/\n/g, '<br/>');
  return html;
}

function renderOutputs(outputs: NotebookOutput[], onImageClick?: (src: string) => void): ReactElement[] {
  return outputs.map((out, i) => {
    if (out.output_type === 'stream' && out.text) {
      return <pre key={i} className={styles.outputText}>{toStr(out.text)}</pre>;
    }
    if ((out.output_type === 'execute_result' || out.output_type === 'display_data') && out.data) {
      if (out.data['image/png']) {
        const src = `data:image/png;base64,${toStr(out.data['image/png'])}`;
        return (
          <div key={i} className={styles.imageWrap}>
            <img
              className={styles.outputImage}
              src={src}
              alt="output"
              onClick={() => onImageClick?.(src)}
            />
            <span className={styles.expandHint}>Click the image to expand</span>
          </div>
        );
      }
      if (out.data['text/plain']) {
        return <pre key={i} className={styles.outputText}>{toStr(out.data['text/plain'])}</pre>;
      }
    }
    if (out.output_type === 'error' && out.traceback) {
      return <pre key={i} className={styles.outputError}>{out.traceback.join('\n').replace(/\x1b\[[0-9;]*m/g, '')}</pre>;
    }
    return null as unknown as ReactElement;
  }).filter(Boolean);
}

export default function NotebookViewer({ notebookPath, onImageClick }: Props) {
  const [cells, setCells] = useState<NotebookCell[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(asset(notebookPath))
      .then((r) => r.json())
      .then((nb) => {
        const parsed: NotebookCell[] = nb.cells.map((c: { cell_type: string; source: string[]; outputs?: NotebookOutput[] }) => ({
          cell_type: c.cell_type,
          source: c.source,
          outputs: c.outputs || [],
        }));
        setCells(parsed);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [notebookPath]);

  if (loading) return <div className={styles.viewer}><p>Loading notebook...</p></div>;
  if (cells.length === 0) return <div className={styles.viewer}><p>Could not load notebook.</p></div>;

  return (
    <div className={styles.viewer}>
      {cells.map((cell, i) => (
        <div key={i} className={`${styles.cell} ${styles[cell.cell_type]}`}>
          {cell.cell_type === 'markdown' ? (
            <div
              className={styles.markdownContent}
              dangerouslySetInnerHTML={{ __html: renderMarkdown(cell.source.join('')) }}
            />
          ) : cell.cell_type === 'code' ? (
            <>
              <div className={styles.codeLabel}>Code</div>
              <div className={styles.codeBlock}>
                {cell.source.join('').split('\n').map((line, li) => (
                  <div key={li} className={styles.codeLine}>
                    <span className={styles.lineNum}>{li + 1}</span>
                    <code
                      className={styles.lineCode}
                      dangerouslySetInnerHTML={{
                        __html: Prism.highlight(line || ' ', Prism.languages.python, 'python'),
                      }}
                    />
                  </div>
                ))}
              </div>
              {cell.outputs && cell.outputs.length > 0 && (
                <div className={styles.outputs}>
                  <div className={styles.outputLabel}>Output</div>
                  {renderOutputs(cell.outputs, onImageClick)}
                </div>
              )}
            </>
          ) : (
            <pre className={styles.codeContent}>{cell.source.join('')}</pre>
          )}
        </div>
      ))}
    </div>
  );
}
