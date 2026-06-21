import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import styles from './index.module.css';

function Hero(): ReactNode {
  return (
    <section className={styles.hero}>
      <div className={styles.heroInner}>
        <p className={styles.heroEyebrow}>ODOKURA LLC</p>
        <h1 className={styles.heroTitle}>
          モバイルアプリケーション<br />ソフトウェア開発
        </h1>
        <p className={styles.heroLead}>
          テクノロジーで、日々の暮らしに寄り添うプロダクトを届けます。
        </p>
        <div className={styles.heroActions}>
          <Link className={styles.btnPrimary} to="/docs/apps/hatsugo-note/overview">
            発語ノートを見る
          </Link>
          <Link className={styles.btnGhost} to="/docs/company/overview">
            会社情報
          </Link>
        </div>
      </div>
    </section>
  );
}

function Services(): ReactNode {
  const items = [
    {
      num: '01',
      sub: 'Mobile App Development',
      title: 'モバイルアプリ開発',
      body: 'iOS・Android 向けのネイティブアプリケーションを設計・開発します。ユーザーの日常に溶け込む、使いやすいプロダクトを追求します。',
    },
    {
      num: '02',
      sub: 'Software Development',
      title: 'ソフトウェア開発',
      body: '業務用・消費者向けソフトウェアの設計・開発を行います。課題を丁寧に分析し、実用的なソリューションを提供します。',
    },
  ];

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <header className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>SERVICES</span>
          <h2 className={styles.sectionHeading}>事業内容</h2>
        </header>
        <div className={styles.serviceGrid}>
          {items.map((item) => (
            <div key={item.num} className={styles.serviceCard}>
              <span className={styles.serviceNum}>{item.num}</span>
              <p className={styles.serviceCardSub}>{item.sub}</p>
              <h3 className={styles.serviceCardTitle}>{item.title}</h3>
              <p className={styles.serviceCardBody}>{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AppShowcase(): ReactNode {
  const features = [
    '発話を日付・状態とともに記録',
    'グラフや一覧で成長を振り返り',
    '動画メモ付きで場面を保存',
    'データはデバイス保存（プライバシー優先）',
    'Basic 無料 / Premium 有料プランに対応',
  ];

  return (
    <section className={styles.sectionAlt}>
      <div className={styles.container}>
        <header className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>PRODUCTS</span>
          <h2 className={styles.sectionHeading}>提供アプリ</h2>
        </header>
        <div className={styles.appCard}>
          <div className={styles.appCardLeft}>
            <span className={styles.appBadge}>App</span>
            <h3 className={styles.appName}>発語ノート</h3>
            <p className={styles.appTagline}>子どものことばの成長を、丁寧に記録するアプリ。</p>
            <p className={styles.appDesc}>
              保護者や支援者が、子どもの発話をいつでも手軽に記録・振り返りできる設計にこだわりました。
              記録データはデバイス内に保存され、プライバシーを守りながら大切な成長を残せます。
            </p>
            <Link className={styles.appLink} to="/docs/apps/hatsugo-note/overview">
              アプリ詳細を見る
            </Link>
          </div>
          <div className={styles.appCardRight}>
            <ul className={styles.featureList}>
              {features.map((f) => (
                <li key={f} className={styles.featureItem}>
                  <span className={styles.featureDot} />
                  {f}
                </li>
              ))}
            </ul>
            <div className={styles.planRow}>
              <div className={styles.planBadge}>
                <strong>Basic</strong>
                <span>無料</span>
              </div>
              <div className={styles.planBadge}>
                <strong>Premium</strong>
                <span>動画保存 &amp; バックアップ</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Company(): ReactNode {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <header className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>COMPANY</span>
          <h2 className={styles.sectionHeading}>会社情報</h2>
        </header>
        <div className={styles.companyWrap}>
          <dl className={styles.companyDl}>
            <div className={styles.dlRow}>
              <dt>社名</dt>
              <dd>合同会社オドクラ / ODOKURA LLC</dd>
            </div>
            <div className={styles.dlRow}>
              <dt>主な事業</dt>
              <dd>モバイルアプリケーション開発、ソフトウェア開発</dd>
            </div>
            <div className={styles.dlRow}>
              <dt>提供アプリ</dt>
              <dd>発語ノート</dd>
            </div>
            <div className={styles.dlRow}>
              <dt>お問い合わせ</dt>
              <dd>
                <a href="mailto:info@odokura.jp" className={styles.mailLink}>
                  info@odokura.jp
                </a>
              </dd>
            </div>
          </dl>
          <Link className={styles.btnSecondary} to="/docs/company/overview">
            会社情報の詳細
          </Link>
        </div>
      </div>
    </section>
  );
}

function Contact(): ReactNode {
  return (
    <section className={styles.contactSection}>
      <div className={styles.container}>
        <p className={styles.contactLabel}>CONTACT</p>
        <h2 className={styles.contactTitle}>お問い合わせ</h2>
        <p className={styles.contactDesc}>
          事業に関するご相談、アプリに関するお問い合わせはメールにてお受けしています。
        </p>
        <a className={styles.btnContactPrimary} href="mailto:info@odokura.jp">
          info@odokura.jp
        </a>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      title="ODOKURA — モバイルアプリケーション・ソフトウェア開発"
      description="合同会社オドクラは、モバイルアプリケーション開発およびソフトウェア開発を行う事業者です。">
      <Hero />
      <main>
        <Services />
        <AppShowcase />
        <Company />
        <Contact />
      </main>
    </Layout>
  );
}
