import type { ImgHTMLAttributes } from 'react';
import { useLazyImage } from '../../hooks/useLazyImage';

interface Props extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
}

export default function LazyImage({ src, alt, ...rest }: Props) {
  const [ref, resolvedSrc] = useLazyImage(src);
  return <img ref={ref} src={resolvedSrc} alt={alt} loading="lazy" {...rest} />;
}
