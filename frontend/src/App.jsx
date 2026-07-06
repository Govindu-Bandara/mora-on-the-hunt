import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { OrderProvider } from './context/OrderContext';
import { AppRoutes } from './routes/AppRoutes';

function App() {
  return (
    <AuthProvider>
      <OrderProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
        <Toaster
          position="top-center"
          toastOptions={{
            style: { background: '#0b1d3a', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' },
          }}
        />
      </OrderProvider>
    </AuthProvider>
  );
}

export default App;
