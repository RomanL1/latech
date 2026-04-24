import { Outlet } from 'react-router';
import styles from './PageLayout.module.css';

export function PageLayout() {
  return (
    <div className={styles.page}>
      {/* <Header /> */}
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
