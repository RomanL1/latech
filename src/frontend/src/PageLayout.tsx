import { Outlet } from 'react-router';
import { Header } from './shared/components/header/Header';

export function PageLayout() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
    </>
  );
}
