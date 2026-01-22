
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage/Page';
import SignupPage from './pages/SignupPage/Page';
import ProductPage from './pages/ProductPage/Page';
import ProductDetailPage from './pages/ProductPage/Detail';
import CartPage from './pages/CartPage/Page';
import OrderPage from './pages/OrderPage/Page';
import PaymentPage from './pages/PaymentPage/Page';
import SettlementPage from './pages/SettlementPage/Page';

function App() {
    return (
        <Router>
            <Routes>
                <Route element={<Layout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/products" element={<ProductPage />} />
                    <Route path="/products/:id" element={<ProductDetailPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/orders/new" element={<OrderPage />} />
                    <Route path="/payment/:orderId" element={<PaymentPage />} />
                    <Route path="/settlement" element={<SettlementPage />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
