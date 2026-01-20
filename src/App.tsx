import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Counter } from './components/Counter';
import { Targets } from './pages/Targets';
import { Stats } from './pages/Stats';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Counter />} />
          <Route path="/targets" element={<Targets />} />
          <Route path="/stats" element={<Stats />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
