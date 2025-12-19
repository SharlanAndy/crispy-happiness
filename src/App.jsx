import { BrowserRouter } from 'react-router-dom';
import { ToastProvider } from './contexts/ToastContext';
import { Web3Provider } from './web3/AppProvider';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <Web3Provider>
      <ToastProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ToastProvider>
    </Web3Provider>
  );
}

export default App;
