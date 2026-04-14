import BaseModal from './BaseModal';
import styles from './Lightbox.module.css';

interface Props {
  src: string | null;
  onClose: () => void;
}

export default function Lightbox({ src, onClose }: Props) {
  return (
    <BaseModal
      open={!!src}
      onClose={onClose}
      variant="lightbox"
      showCloseButton={false}
      dialogClassName={styles.fullBleed}
    >
      {src && <img src={src} alt="" className={styles.image} />}
    </BaseModal>
  );
}
