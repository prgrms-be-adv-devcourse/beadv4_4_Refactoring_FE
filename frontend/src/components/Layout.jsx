
import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { Outlet } from 'react-router-dom';

const Layout = ({ children }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />
            <main style={{ flex: 1 }}>
                {/* Outlet for nested routes, or children if used as wrapper */}
                {children || <Outlet />}
            </main>
            <Footer />
        </div>
    );
};

export default Layout;
