import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Counter } from './components/Counter';
import { Targets } from './pages/Targets';
import { Stats } from './pages/Stats';
import { Settings } from './pages/Settings';
import { Collections } from './pages/Collections';
import { Admin } from './pages/Admin';
import { AdhkarHistory } from './pages/AdhkarHistory';
import { ThemeProvider } from './lib/ThemeContext';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Counter />} />
              <Route path="/collections" element={<Collections />} />
              <Route path="/targets" element={<Targets />} />
              <Route path="/stats" element={<Stats />} />
              <Route path="/history" element={<AdhkarHistory />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/admin" element={<Admin />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
