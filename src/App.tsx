import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Layout from './components/layout/Layout'
import KardsPage from './pages/KardsPage'
// import PacksPage from './pages/PacksPage'
// import GamesPage from './pages/GamesPage'
import CartPage from './pages/CartPage'
import StoragesPage from './pages/StoragesPage'
import UpdateStockPage from './pages/UpdateStockPage'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/layout/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import { CartProvider } from './contexts/CartContext'
import CreatePackPage from './pages/CreatePackPage'
import CreateKardPage from './pages/CreateKardPage'
// import ScannerPage from './pages/ScannerPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <AuthProvider>
          <ThemeProvider>
            <Router>
              <Layout>
                <Routes>
                  <Route path="/" element={<KardsPage />} />
                  {/* <Route path="/packs" element={<PacksPage />} /> */}
                  {/* <Route path="/games" element={<GamesPage />} /> */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/stock-update" element={
                    <ProtectedRoute>
                      <UpdateStockPage />
                    </ProtectedRoute>
                  } />
                  {/* <Route path="/scanner" element={<ScannerPage />} /> */}
                  <Route path="/storages" element={
                    <ProtectedRoute>
                      <StoragesPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/create" element={
                    <ProtectedRoute>
                      <Outlet />
                    </ProtectedRoute>
                  }>
                    <Route path="pack" element={<CreatePackPage />} />
                    <Route path="card" element={<CreateKardPage />} />
                    <Route path="card/:id" element={<CreateKardPage />} />
                    {/* <Route path="rarities" element={<CreateRarityPage />} /> */}
                  </Route>
                </Routes>
              </Layout>
            </Router>
          </ThemeProvider>
        </AuthProvider>
      </CartProvider>
    </QueryClientProvider>
  )
}

export default App
