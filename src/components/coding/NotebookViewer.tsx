import { useEffect, useRef, useState } from 'react';
import { asset } from '../../utils/asset';
import styles from './NotebookViewer.module.css';

interface Props {
  notebookPath: string;
  title: string;
  imageOpen?: boolean;
  onImageClick?: (src: string, alt: string) => void;
}

function NotebookPreview({ notebookPath, title, imageOpen = false, onImageClick }: Props) {
  const [attempt, setAttempt] = useState(0);
  const [available, setAvailable] = useState(false);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const frameRef = useRef<HTMLIFrameElement>(null);
  const expandedImage = useRef(false);
  const previewUrl = asset(`notebook-previews/${notebookPath.replace(/\.ipynb$/i, '.html')}`);

  useEffect(() => {
    const controller = new AbortController();
    // Check for missing files and the Pages/Vite SPA fallback before creating a frame.
    // The preview itself is rendered by the browser, not parsed as notebook cells here.
    fetch(previewUrl, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error('Preview not found');
        const html = await response.text();
        if (!html.includes('name="portfolio-notebook-preview"')) throw new Error('Not a notebook preview');
        if (!controller.signal.aborted) setAvailable(true);
      })
      .catch(() => { if (!controller.signal.aborted) setState('error'); });
    return () => controller.abort();
  }, [previewUrl, attempt]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const frame = frameRef.current;
      // A sandbox without allow-same-origin has an opaque origin, so origin alone
      // cannot authenticate it. Accept only this frame's actual browsing context.
      if (!frame?.contentWindow || event.source !== frame.contentWindow) return;
      if (event.data?.type === 'portfolio-notebook-ready') setState('ready');
      if (event.data?.type === 'portfolio-notebook-image' && !imageOpen) {
        const { src, alt } = event.data;
        if (typeof src !== 'string' || !/^data:image\/(?:png|jpeg);base64,(?:[a-z\d+/]{4})*(?:[a-z\d+/]{2}==|[a-z\d+/]{3}=)?$/i.test(src) || src.endsWith(',')) return;
        onImageClick?.(src, typeof alt === 'string' && alt.trim() ? alt : `${title} \u2014 saved notebook output`);
      }
      if (event.data?.type === 'portfolio-notebook-escape') {
        // Let Radix's topmost dialog handler process Escape, including nested dialogs.
        frame.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [imageOpen, onImageClick, title]);

  useEffect(() => {
    if (imageOpen) {
      expandedImage.current = true;
      return;
    }
    if (!expandedImage.current) return;
    // Restore the opaque frame, then its own remembered control after Radix cleanup.
    const timer = window.setTimeout(() => {
      frameRef.current?.focus();
      frameRef.current?.contentWindow?.postMessage({ type: 'portfolio-notebook-restore-image-focus' }, '*');
    }, 0);
    return () => window.clearTimeout(timer);
  }, [imageOpen]);

  return <div className={styles.viewer}>
    <a href={asset(notebookPath)} download className={styles.download}>Download original notebook (.ipynb)</a>
    {state === 'loading' && <p role="status">Loading notebook preview&hellip;</p>}
    {state === 'error' && <div role="alert">
      <p>Could not load the notebook preview. You can still download the original notebook.</p>
      <button type="button" onClick={() => {
        setAvailable(false);
        setState('loading');
        setAttempt((current) => current + 1);
      }}>Retry preview</button>
    </div>}
    {available && state !== 'error' && <iframe
      key={attempt} ref={frameRef} src={previewUrl}
      title={`${title} \u2014 saved notebook preview`}
      sandbox="allow-scripts" loading="lazy" referrerPolicy="no-referrer"
      className={styles.frame} onError={() => setState('error')}
    />}
  </div>;
}

export default function NotebookViewer(props: Props) {
  return <NotebookPreview key={props.notebookPath} {...props} />;
}
