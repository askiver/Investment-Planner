import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function NewPage() {
  return (
    <div>
      <h2>Welcome to the New Page!</h2>
      <p>This is a new page visible from the root of the site.</p>
    </div>
  );
}

function App() {
  const [count, setCount] = useState(0)
  const [showNewPage, setShowNewPage] = useState(false)
  const [assets, setAssets] = useState<any[]>([]);

  // Asset form state
  const [form, setForm] = useState({
    name: '',
    initial_value: '',
    expected_return: '',
    variance: '',
    tax_rate: '',
  });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!showNewPage) {
      fetch('http://localhost:8000/assets')
        .then(res => res.json())
        .then(data => setAssets(data));
    }
  }, [showNewPage]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    // Basic validation
    if (!form.name || !form.initial_value || !form.expected_return || !form.variance || !form.tax_rate) {
      setFormError('All fields are required.');
      return;
    }
    const asset = {
      id: crypto.randomUUID(),
      name: form.name,
      initial_value: parseFloat(form.initial_value),
      expected_return: parseFloat(form.expected_return),
      variance: parseFloat(form.variance),
      tax_rate: parseFloat(form.tax_rate),
    };
    try {
      const res = await fetch('http://localhost:8000/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(asset),
      });
      if (!res.ok) {
        const err = await res.json();
        setFormError(err.detail || 'Error creating asset');
        return;
      }
      setAssets(prev => [...prev, asset]);
      setForm({ name: '', initial_value: '', expected_return: '', variance: '', tax_rate: '' });
    } catch (err) {
      setFormError('Network error');
    }
  };

  return (
    <>
      <nav style={{ marginBottom: 20 }}>
        <button onClick={() => setShowNewPage(false)}>Home</button>
        <button onClick={() => setShowNewPage(true)}>New Page</button>
      </nav>
      {showNewPage ? (
        <NewPage />
      ) : (
        <>
          <div>
            <a href="https://vite.dev" target="_blank">
              <img src={viteLogo} className="logo" alt="Vite logo" />
            </a>
            <a href="https://react.dev" target="_blank">
              <img src={reactLogo} className="logo react" alt="React logo" />
            </a>
          </div>
          <h1>Vite + React</h1>
          <div className="card">
            <button onClick={() => setCount((count) => count + 1)}>
              count is {count}
            </button>
            <p>
              Edit <code>src/App.tsx</code> and save to test HMR
            </p>
          </div>
          <h2>Add Asset</h2>
          <form onSubmit={handleFormSubmit} style={{ marginBottom: 20 }}>
            <input name="name" placeholder="Name" value={form.name} onChange={handleFormChange} />{' '}
            <input name="initial_value" placeholder="Initial Value" type="number" value={form.initial_value} onChange={handleFormChange} step="any" />{' '}
            <input name="expected_return" placeholder="Expected Return (e.g. 0.07)" type="number" value={form.expected_return} onChange={handleFormChange} step="any" />{' '}
            <input name="variance" placeholder="Variance (e.g. 0.15)" type="number" value={form.variance} onChange={handleFormChange} step="any" />{' '}
            <input name="tax_rate" placeholder="Tax Rate (e.g. 0.22)" type="number" value={form.tax_rate} onChange={handleFormChange} step="any" />{' '}
            <button type="submit">Add</button>
            {formError && <div style={{ color: 'red' }}>{formError}</div>}
          </form>
          <h2>Assets from backend:</h2>
          <ul>
            {assets.map(asset => (
              <li key={asset.id}>{asset.name} (${asset.initial_value})</li>
            ))}
          </ul>
          <p className="read-the-docs">
            Click on the Vite and React logos to learn more
          </p>
        </>
      )}
    </>
  )
}

export default App
