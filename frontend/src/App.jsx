import { useState, useEffect } from 'react'
import './App.css'

const t = {
  en: {
    heroTitle: "TAKE A STEP INTO THE FUTURE WITH US!",
    heroSub: "Our goal is to prepare graduates who can think critically in all directions through education. Analyze the social graph and find the true influencers using the PageRank algorithm.",
    card1Title: "Network Connections",
    card1Desc: "Enter connections as source,target (one per line). This simulates users subscribing to other users.",
    calcBtn: "Calculate PageRank",
    calculating: "Calculating...",
    card2Title: "PageRank Results",
    nodes: "Total Nodes:",
    edges: "Total Edges:",
    rank: "Rank",
    node: "User Node",
    score: "PageRank Score",
    noResults: "No results yet. Enter data and click calculate."
  },
  ru: {
    heroTitle: "СДЕЛАЙ ШАГ В БУДУЩЕЕ ВМЕСТЕ С НАМИ!",
    heroSub: "Наша цель — подготовить выпускников, способных критически мыслить во всех направлениях. Проанализируйте социальный граф и найдите истинных лидеров мнений с помощью алгоритма PageRank.",
    card1Title: "Сетевые связи",
    card1Desc: "Введите связи в формате source,target (по одной на строку). Это симулирует подписку пользователей друг на друга.",
    calcBtn: "Рассчитать PageRank",
    calculating: "Вычисляется...",
    card2Title: "Результаты PageRank",
    nodes: "Всего узлов:",
    edges: "Всего связей:",
    rank: "Ранг",
    node: "Пользователь",
    score: "Оценка PageRank",
    noResults: "Пока нет результатов. Введите данные и нажмите рассчитать."
  },
  uz: {
    heroTitle: "BIZ BILAN KELAJAKKA QADAM QO'YING!",
    heroSub: "Bizning maqsadimiz – barcha yo'nalishlarda tanqidiy fikrlay oladigan bitiruvchilarni tayyorlash. Ijtimoiy grafni tahlil qiling va PageRank algoritmi yordamida haqiqiy yetakchilarni toping.",
    card1Title: "Tarmoq aloqalari",
    card1Desc: "Aloqalarni source,target formatida kiriting (har bir qatorga bittadan). Bu foydalanuvchilarning bir-biriga obuna bo'lishini simulyatsiya qiladi.",
    calcBtn: "PageRank-ni hisoblash",
    calculating: "Hisoblanmoqda...",
    card2Title: "PageRank natijalari",
    nodes: "Jami tugunlar:",
    edges: "Jami aloqalar:",
    rank: "Daraja",
    node: "Foydalanuvchi",
    score: "PageRank bahosi",
    noResults: "Hozircha natijalar yo'q. Ma'lumotlarni kiriting va hisoblashni bosing."
  }
}

function App() {
  const [edgesInput, setEdgesInput] = useState('user1,user2\nuser2,user3\nuser3,user1\nuser4,user2\nuser5,user1');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Default theme and language
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'en');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleCalculate = async () => {
    setLoading(true);
    setError(null);
    try {
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
        
        <div className="header-controls">
          <select 
            className="control-btn" 
            value={lang} 
            onChange={(e) => setLang(e.target.value)}
          >
            <option value="en">EN</option>
            <option value="ru">RU</option>
            <option value="uz">UZ</option>
          </select>
          
          <button className="control-btn" onClick={toggleTheme}>
            {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
          </button>
        </div>
      </header>

      <section className="hero">
        <h1>{t[lang].heroTitle}</h1>
        <p>{t[lang].heroSub}</p>
      </section>

      <main className="main-content">
        <div className="card">
          <h2>{t[lang].card1Title}</h2>
          <p style={{marginBottom: '15px', color: 'var(--profi-text)', opacity: 0.7, fontSize: '14px'}}>
            {t[lang].card1Desc}
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
            {loading ? t[lang].calculating : t[lang].calcBtn}
          </button>
          {error && <div className="error-msg" style={{marginTop: '15px'}}>{error}</div>}
        </div>

        <div className="card">
          <h2>{t[lang].card2Title}</h2>
          {results ? (
            <div>
              <p style={{marginBottom: '20px', color: 'var(--profi-text)', opacity: 0.8}}>
                {t[lang].nodes} {results.nodes} | {t[lang].edges} {results.edges}
              </p>
              <table className="results-table">
                <thead>
                  <tr>
                    <th>{t[lang].rank}</th>
                    <th>{t[lang].node}</th>
                    <th>{t[lang].score}</th>
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
            <div style={{color: 'var(--profi-text)', opacity: 0.5, textAlign: 'center', padding: '40px 0'}}>
              {t[lang].noResults}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default App
