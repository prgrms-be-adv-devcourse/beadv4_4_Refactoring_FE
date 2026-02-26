
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage/Page';
import SignupPage from './pages/SignupPage/Page';
import ProductPage from './pages/ProductPage/Page';
import ProductCreatePage from './pages/ProductPage/Create';
import ProductEditPage from './pages/ProductPage/Edit';
import ProductDetailPage from './pages/ProductPage/Detail';
import CartPage from './pages/CartPage/Page';
import OrderPage from './pages/OrderPage/Page';
import PaymentPage from './pages/PaymentPage/Page';
import SettlementPage from './pages/SettlementPage/Page';
import OrderSuccessPage from './pages/OrderPage/Success';
import PaymentSuccessPage from './pages/PaymentPage/Success';
import PaymentFailPage from './pages/PaymentPage/Fail';
import MyPage from './pages/MyPage/Page';
import OrderDetailPage from './pages/OrderPage/OrderDetailPage';

function App() {
  return (
      <Router>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/products" element={<ProductPage />} />
            <Route path="/products/new" element={<ProductCreatePage />} />
            <Route path="/products/create" element={<ProductCreatePage />} />
            <Route path="/products/:id/edit" element={<ProductEditPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/orders/new" element={<OrderPage />} />
            <Route path="/orders/success/:orderId" element={<OrderSuccessPage />} />
            <Route path="/payment/success" element={<PaymentSuccessPage />} />
            <Route path="/payment/fail" element={<PaymentFailPage />} />
            <Route path="/payment/:orderId" element={<PaymentPage />} />
            <Route path="/settlement" element={<SettlementPage />} />
            <Route path="/orders/:orderId" element={<OrderDetailPage />} />
            <Route path="/mypage" element={<MyPage />} />
          </Route>
        </Routes>
      </Router>
  );
}

export default App;
