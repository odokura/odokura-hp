import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';

import styles from './index.module.css';

function Hero(): ReactNode {
  return (
    <header className={clsx('hero', styles.heroBanner)}>
      <div className="container">
        <p className={styles.eyebrow}>ODOKURA LLC</p>
        <h1 className={styles.title}>Company and app documents.</h1>
        <p className={styles.subtitle}>
          会社情報と、公開中アプリのプライバシーポリシー・利用規約を
          一元的に管理するためのサイトです。
        </p>
        <div className={styles.actions}>
          <Link className="button button--primary button--lg" to="/docs/company/overview">
            Company
          </Link>
          <Link className="button button--secondary button--lg" to="/docs/apps/hatsugo-note/overview">
            発語ノート
          </Link>
        </div>
      </div>
    </header>
  );
}

function Card(props: {label: string; title: string; body: string; to: string}): ReactNode {
  return (
    <Link className={styles.card} to={props.to}>
      <span className={styles.cardLabel}>{props.label}</span>
      <strong>{props.title}</strong>
      <p>{props.body}</p>
    </Link>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      title="ODOKURA"
      description="ODOKURA の会社情報とアプリ関連ドキュメントをまとめたサイトです。">
      <Hero />
      <main className={styles.main}>
        <section className="container">
          <div className={styles.grid}>
            <Card
              label="COMPANY"
              title="会社情報"
              body="ODOKURA の概要、公開情報、会社向けポリシーを掲載します。"
              to="/docs/company/overview"
            />
            <Card
              label="APP"
              title="発語ノート"
              body="アプリ概要、ストア掲載向けの法務文書、公開ページをまとめています。"
              to="/docs/apps/hatsugo-note/overview"
            />
            <Card
              label="LEGAL"
              title="発語ノート プライバシーポリシー"
              body="発語記録、動画、バックアップ、課金、権限利用について案内します。"
              to="/docs/apps/hatsugo-note/privacy-policy"
            />
            <Card
              label="LEGAL"
              title="発語ノート 利用規約"
              body="利用条件、Premium 機能、バックアップ、免責事項を掲載します。"
              to="/docs/apps/hatsugo-note/terms-of-service"
            />
          </div>
        </section>
      </main>
    </Layout>
  );
}
