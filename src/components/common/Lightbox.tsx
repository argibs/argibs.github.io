import BaseModal from './BaseModal';
import styles from './Lightbox.module.css';

interface Props {
  src: string | null;
  onClose: () => void;
  alt?: string;
}

export default function Lightbox({ src, onClose, alt = 'Expanded project image' }: Props) {
  return (
    <BaseModal
      open={!!src}
      onClose={onClose}
      variant="lightbox"
      label={`Image preview: ${alt}`}
      dialogClassName={styles.fullBleed}
    >
      {src && <img src={src} alt={alt} className={styles.image} />}
    </BaseModal>
  );
}
