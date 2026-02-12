import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Counter } from './components/Counter';
import { Targets } from './pages/Targets';
import { Stats } from './pages/Stats';
import { Settings } from './pages/Settings';
import { Collections } from './pages/Collections';
import { ThemeProvider } from './lib/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Counter />} />
            <Route path="/collections" element={<Collections />} />
            <Route path="/targets" element={<Targets />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
