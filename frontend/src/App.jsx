import { useState, useEffect, useRef, useMemo } from 'react'
import ForceGraph2D from 'react-force-graph-2d'
import './App.css'

const t = {
  en: {
    heroTitle: "TAKE A STEP INTO THE FUTURE WITH US!",
    heroSub: "Our goal is to prepare graduates who can think critically in all directions through education. Analyze the social graph and find the true influencers using the PageRank algorithm.",
    card1Title: "Network Connections",
    card1Desc: "Enter connections as source,target (one per line) or upload a CSV/TXT file.",
    calcBtn: "Calculate PageRank",
    calculating: "Calculating...",
    card2Title: "PageRank Results",
    nodes: "Total Nodes:",
    edges: "Total Edges:",
    rank: "Rank",
    node: "User Node",
    score: "Score",
    noResults: "No results yet. Enter data and click calculate.",
    uploadBtn: "Upload File (.csv, .txt)",
    settings: "Algorithm Settings",
    alpha: "Damping Factor (α)",
    iter: "Max Iterations",
    graphTab: "Interactive Graph"
  },
  ru: {
    heroTitle: "СДЕЛАЙ ШАГ В БУДУЩЕЕ ВМЕСТЕ С НАМИ!",
    heroSub: "Наша цель — подготовить выпускников, способных критически мыслить во всех направлениях. Проанализируйте социальный граф и найдите истинных лидеров мнений с помощью алгоритма PageRank.",
    card1Title: "Сетевые связи",
    card1Desc: "Введите связи как source,target или загрузите CSV/TXT файл.",
    calcBtn: "Рассчитать PageRank",
    calculating: "Вычисляется...",
    card2Title: "Результаты PageRank",
    nodes: "Всего узлов:",
    edges: "Всего связей:",
    rank: "Ранг",
    node: "Пользователь",
    score: "Оценка",
    noResults: "Пока нет результатов. Введите данные и нажмите рассчитать.",
    uploadBtn: "Загрузить файл (.csv, .txt)",
    settings: "Настройки алгоритма",
    alpha: "Коэффициент затухания (α)",
    iter: "Макс. итераций",
    graphTab: "Интерактивный Граф"
  },
  uz: {
    heroTitle: "BIZ BILAN KELAJAKKA QADAM QO'YING!",
    heroSub: "Bizning maqsadimiz – barcha yo'nalishlarda tanqidiy fikrlay oladigan bitiruvchilarni tayyorlash. Ijtimoiy grafni tahlil qiling va haqiqiy yetakchilarni toping.",
    card1Title: "Tarmoq aloqalari",
    card1Desc: "Aloqalarni source,target formatida kiriting yoki CSV/TXT yuklang.",
    calcBtn: "PageRank-ni hisoblash",
    calculating: "Hisoblanmoqda...",
    card2Title: "Natijalar",
    nodes: "Jami tugunlar:",
    edges: "Jami aloqalar:",
    rank: "Daraja",
    node: "Foydalanuvchi",
    score: "Bahosi",
    noResults: "Hozircha natijalar yo'q.",
    uploadBtn: "Fayl yuklash (.csv, .txt)",
    settings: "Algoritm sozlamalari",
    alpha: "So'nish koeffitsienti (α)",
    iter: "Maks. iteratsiyalar",
    graphTab: "Interaktiv Graf"
  }
}

const INITIAL_DATASET = `Quincy Jones,Michael Jackson
Paul McCartney,Michael Jackson
Diana Ross,Michael Jackson
Stevie Wonder,Michael Jackson
Janet Jackson,Michael Jackson
Sony Music,Michael Jackson
Epic Records,Michael Jackson
MTV,Michael Jackson
John Landis,Michael Jackson
Slash,Michael Jackson
Eddie Van Halen,Michael Jackson
Brooke Shields,Michael Jackson
Elizabeth Taylor,Michael Jackson
Bubbles The Chimp,Michael Jackson
Neverland Ranch,Michael Jackson
Teddy Riley,Michael Jackson
Lionel Richie,Michael Jackson
Ivanka Trump,Donald Trump
Melania Trump,Donald Trump
Fox News,Donald Trump
Rudy Giuliani,Donald Trump
Mike Pence,Donald Trump
Steve Bannon,Donald Trump
Jared Kushner,Donald Trump
Trump Organization,Donald Trump
NBC,Donald Trump
Vince McMahon,Donald Trump
Don King,Donald Trump
Sean Hannity,Donald Trump
Tucker Carlson,Donald Trump
Elon Musk,Donald Trump
Mar-a-Lago,Donald Trump
Roger Stone,Donald Trump
Kellyanne Conway,Donald Trump
Macaulay Culkin,Michael Jackson
Macaulay Culkin,Donald Trump
Oprah Winfrey,Michael Jackson
Oprah Winfrey,Donald Trump
Larry King,Michael Jackson
Larry King,Donald Trump
Princess Diana,Michael Jackson
Princess Diana,Donald Trump
Madonna,Michael Jackson
Madonna,Donald Trump
Bill Clinton,Michael Jackson
Bill Clinton,Donald Trump
Al Sharpton,Michael Jackson
Al Sharpton,Donald Trump
Pepsi,Michael Jackson
Pepsi,Donald Trump
Andy Warhol,Michael Jackson
Andy Warhol,Donald Trump
Nelson Mandela,Michael Jackson
Nelson Mandela,Donald Trump
Mike Tyson,Michael Jackson
Mike Tyson,Donald Trump`;

function App() {
  const [edgesInput, setEdgesInput] = useState(INITIAL_DATASET);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [alpha, setAlpha] = useState(0.85);
  const [maxIter, setMaxIter] = useState(100);

  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'en');

  const fileInputRef = useRef(null);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 400 });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  useEffect(() => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.offsetWidth,
        height: 500
      });
    }
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: 500
        });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [results]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      setEdgesInput(evt.target.result);
    };
    reader.readAsText(file);
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
        body: JSON.stringify({ edges, alpha: parseFloat(alpha), max_iter: parseInt(maxIter) })
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

  const maxScore = useMemo(() => {
    if (!results || !results.top_10.length) return 1;
    return results.top_10[0].score;
  }, [results]);

  return (
    <div className="app-container">
      <header className="header">
        <div className="logo-text">
          <img src="/logo.png" alt="Logo" style={{height: '40px', objectFit: 'contain'}} />
          <span style={{marginLeft: '12px'}}>Profi University</span>
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
          
          <div className="settings-panel">
            <div className="setting-group">
              <label>{t[lang].alpha}: {alpha}</label>
              <input 
                type="range" 
                min="0.1" max="0.99" step="0.01" 
                value={alpha} 
                onChange={(e) => setAlpha(e.target.value)} 
              />
            </div>
            <div className="setting-group">
              <label>{t[lang].iter}: {maxIter}</label>
              <input 
                type="number" 
                min="10" max="500" 
                value={maxIter} 
                onChange={(e) => setMaxIter(e.target.value)} 
              />
            </div>
          </div>

          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px'}}>
            <p style={{margin: 0, color: 'var(--profi-text)', opacity: 0.7, fontSize: '14px'}}>
              {t[lang].card1Desc}
            </p>
            <label className="upload-btn">
              {t[lang].uploadBtn}
              <input 
                type="file" 
                accept=".csv,.txt" 
                style={{display: 'none'}} 
                ref={fileInputRef}
                onChange={handleFileUpload} 
              />
            </label>
          </div>

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
                    <th style={{width: '40%'}}>{t[lang].score}</th>
                  </tr>
                </thead>
                <tbody>
                  {results.top_10.map((item, index) => {
                    const percent = (item.score / maxScore) * 100;
                    return (
                      <tr key={item.node}>
                        <td>
                          <span className={`rank-badge ${index === 0 ? 'rank-1' : ''}`}>
                            #{index + 1}
                          </span>
                        </td>
                        <td style={{fontWeight: '600'}}>{item.node}</td>
                        <td>
                          <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                            <span>{item.score.toFixed(4)}</span>
                            <div className="progress-bg">
                              <div className="progress-fill" style={{width: `${percent}%`}}></div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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

      {results && results.graph_data && (
        <section className="graph-section" ref={containerRef}>
          <div className="card" style={{margin: '0 40px 40px 40px'}}>
            <h2>{t[lang].graphTab}</h2>
            <div className="graph-container" style={{background: theme === 'dark' ? '#0a0a0a' : '#f9fbfd'}}>
              <ForceGraph2D
                width={dimensions.width - 60}
                height={dimensions.height}
                graphData={results.graph_data}
                nodeAutoColorBy="group"
                nodeVal={node => node.val || 1}
                nodeCanvasObject={(node, ctx, globalScale) => {
                  const label = node.id;
                  const fontSize = 14 / globalScale;
                  ctx.font = `${fontSize}px Sans-Serif`;
                  const r = Math.sqrt(Math.max(0, node.val || 1)) * 4;
                  
                  ctx.beginPath();
                  ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
                  ctx.fillStyle = node.color || '#ccc';
                  ctx.fill();

                  ctx.textAlign = 'center';
                  ctx.textBaseline = 'top';
                  ctx.fillStyle = theme === 'dark' ? '#eeeeee' : '#222222';
                  ctx.fillText(label, node.x, node.y + r + 2/globalScale);
                }}
                linkColor={() => theme === 'dark' ? '#444' : '#ccc'}
                backgroundColor={theme === 'dark' ? '#0a0a0a' : '#f9fbfd'}
              />
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

export default App
