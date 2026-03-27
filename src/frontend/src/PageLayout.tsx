import { Outlet } from 'react-router';
import { Header } from './shared/components/header/Header';
import styles from './PageLayout.module.css';

export function PageLayout() {
  return (
    <>
      <Header />
      <main className={styles.main}>
        <Outlet />
      </main>
    </>
  );
}
