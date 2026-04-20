import { useState } from 'react';
import { useFetchJSON } from '../../hooks/useFetchJSON';
import type { ChallengeDay } from '../../types';
import CalendarGrid from './CalendarGrid';
import ChallengeModal from './ChallengeModal';
import Lightbox from '../common/Lightbox';
import SectionPanel from '../common/SectionPanel';
import { asset } from '../../utils/asset';
import styles from './ChallengeView.module.css';

export default function ChallengeView() {
  const { data, loading, error } = useFetchJSON<ChallengeDay[]>(asset('challenge2025.json'));
  const [openDay, setOpenDay] = useState<ChallengeDay | null>(null);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  return (
    <SectionPanel id="challenge">
      {loading && <p>Loading...</p>}
      {error && <p>Failed to load challenge data.</p>}
      {!loading && !error && (
        <>
          <header className={styles.header}>
            <h1 className={styles.title}>30 Day Map Challenge 2025</h1>
            <p className={styles.subtitle}>November 2025 - Daily Mapping Challenge</p>
          </header>
          <CalendarGrid days={data ?? []} onOpenDay={setOpenDay} />
          <ChallengeModal
            day={openDay}
            onClose={() => setOpenDay(null)}
            onImageClick={setLightboxSrc}
          />
          <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
        </>
      )}
    </SectionPanel>
  );
}
