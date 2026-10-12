import type { ImgHTMLAttributes } from 'react';

interface Props extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
}

export default function LazyImage({ src, alt, ...rest }: Props) {
  return <img src={src} alt={alt} loading="lazy" {...rest} />;
}
