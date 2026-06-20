import { useState } from 'react'
import './App.css'

function App() {
  const [edgesInput, setEdgesInput] = useState('user1,user2\nuser2,user3\nuser3,user1\nuser4,user2\nuser5,user1');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const handleCalculate = async () => {
    setLoading(true);
    setError(null);
    try {
      // Parse CSV-like input
      const lines = edgesInput.split('\n').map(line => line.trim()).filter(line => line);
      const edges = lines.map(line => {
        const parts = line.split(',');
        if (parts.length < 2) throw new Error(`Invalid line format: ${line}`);
        return { source: parts[0].trim(), target: parts[1].trim() };
      });

      const response = await fetch(`${API_URL}/calculate_pagerank`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ edges })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="logo-text">
          <span className="logo-accent">| |</span>
          <span>Profi University</span>
        </div>
      </header>

      <section className="hero">
        <h1>TAKE A STEP INTO THE FUTURE WITH US!</h1>
        <p>Our goal is to prepare graduates who can think critically in all directions through education. Analyze the social graph and find the true influencers using the PageRank algorithm.</p>
      </section>

      <main className="main-content">
        <div className="card">
          <h2>Network Connections</h2>
          <p style={{marginBottom: '15px', color: '#666', fontSize: '14px'}}>
            Enter connections as <code>source,target</code> (one per line). This simulates users subscribing to other users.
          </p>
          <textarea 
            value={edgesInput}
            onChange={(e) => setEdgesInput(e.target.value)}
            placeholder="userA,userB"
          ></textarea>
          <button 
            className="btn-primary" 
            onClick={handleCalculate}
            disabled={loading || !edgesInput.trim()}
          >
            {loading ? 'Calculating...' : 'Calculate PageRank'}
          </button>
          {error && <div className="error-msg" style={{marginTop: '15px'}}>{error}</div>}
        </div>

        <div className="card">
          <h2>PageRank Results</h2>
          {results ? (
            <div>
              <p style={{marginBottom: '20px', color: '#666'}}>
                Total Nodes: {results.nodes} | Total Edges: {results.edges}
              </p>
              <table className="results-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>User Node</th>
                    <th>PageRank Score</th>
                  </tr>
                </thead>
                <tbody>
                  {results.top_10.map((item, index) => (
                    <tr key={item.node}>
                      <td>
                        <span className={`rank-badge ${index === 0 ? 'rank-1' : ''}`}>
                          #{index + 1}
                        </span>
                      </td>
                      <td style={{fontWeight: '600'}}>{item.node}</td>
                      <td>{item.score.toFixed(4)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{color: '#999', textAlign: 'center', padding: '40px 0'}}>
              No results yet. Enter data and click calculate.
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default App
