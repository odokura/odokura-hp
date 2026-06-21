import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import styles from './index.module.css';

function HomeFrame(): ReactNode {
  return (
    <section className={styles.page}>
      <div className={styles.frame}>
        <div className={styles.frameBar}>
          <span className={styles.meta}>ODOKURA</span>
          <span className={styles.meta}>MONOCHROME FRAME / 2026</span>
        </div>

        <div className={styles.stage}>
          <div className={styles.stageOuter}>
            <div className={styles.stageInner}>
              <span className={styles.stageLabel}>ARTWORK COMING LATER</span>
            </div>
          </div>
        </div>

        <div className={styles.copyBlock}>
          <p className={styles.kicker}>Mobile application by ODOKURA LLC</p>
          <h1 className={styles.title}>Hatsu-go</h1>
          <p className={styles.statement}>first words, quietly kept.</p>
        </div>

        <nav className={styles.linkRail} aria-label="Primary">
          <Link className={styles.railLink} to="/docs/apps/hatsugo-note/overview">
            App overview
          </Link>
          <Link className={styles.railLink} to="/docs/company/overview">
            Company
          </Link>
          <a className={styles.railLink} href="mailto:info@odokura.jp">
            Contact
          </a>
        </nav>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const layoutProps = {
    title: 'ODOKURA — Hatsu-go',
    description: 'ODOKURA LLC / Hatsu-go',
    noNavbar: true,
    noFooter: true,
  } as const;

  return (
    <Layout {...(layoutProps as never)}>
      <main>
        <HomeFrame />
      </main>
    </Layout>
  );
}