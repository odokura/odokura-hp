import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import styles from './index.module.css';

const additionalLinks = [
  {
    label: 'App overview',
    to: '/docs/apps/hatsugo-note/overview',
  },
  {
    label: 'Company',
    to: '/docs/company/overview',
  },
  {
    label: 'Contact',
    href: 'mailto:info@odokura.jp',
  },
] as const;

export default function Home(): ReactNode {
  return (
    <Layout title="ODOKURA" description="ODOKURA LLC / Hatsu-go" noFooter>
      <main>
        <section className={`${styles.page} homepage-minimal-root`}>
          <div className={styles.frame}>
            <div className={styles.frameBar}>
              <span className={styles.meta}>ODOKURA</span>
              <span className={styles.frameMark}>
                <span className={styles.edition}>MMXXVI / 01</span>
                <span className={styles.seal} aria-hidden="true" />
              </span>
            </div>
            <div className={styles.stage}>
              <div className={styles.stageOuter}>
                <div className={styles.stageInner} />
              </div>
            </div>
            <nav className={styles.linkRail} aria-label="Primary">
              {additionalLinks.map((item) =>
                'to' in item ? (
                  <Link key={item.label} className={styles.railLink} to={item.to}>
                    {item.label}
                  </Link>
                ) : (
                  <a key={item.label} className={styles.railLink} href={item.href}>
                    {item.label}
                  </a>
                ),
              )}
            </nav>
          </div>
        </section>
      </main>
    </Layout>
  );
}
