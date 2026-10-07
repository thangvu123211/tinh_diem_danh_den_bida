import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './header/header';
import Footer from './footer/footer';
import './guest-layout.css';

export default function GuestLayout() {
  useEffect(() => {
    document.title = 'Bida Club — Tính điểm';
  }, []);

  return (
    <>
      <Header />
      <main className="guest-main">
        <div className="guest-content">
          <Outlet />
        </div>
        <Footer />
      </main>
    </>
  );
}
