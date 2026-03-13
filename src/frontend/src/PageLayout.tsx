import { Outlet } from 'react-router';

export function PageLayout() {
  return (
    <>
      <header>LaTeCH</header>
      <main>
        <Outlet />
      </main>
    </>
  );
}
