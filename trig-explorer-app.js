// App.js
import React from 'react';
import TrigExplorer from './TrigExplorer';
import './App.css';

function App() {
  return (
    <div className="App">
      <TrigExplorer />
    </div>
  );
}

export default App;

// TrigExplorer.js
import React, { useState, useEffect } from 'react';
import './TrigExplorer.css';

const TrigExplorer = () => {
  // Paramètres de base avec valeurs par défaut
  const [func, setFunc] = useState('sin');
  const [a, setA] = useState(1);
  const [b, setB] = useState(1);
  const [c, setC] = useState(0);
  const [d, setD] = useState(0);
  const [zoom, setZoom] = useState(1);
  
  // Options disponibles (avec C et D inversés selon les spécifications)
  const fractions = [1/6, 1/5, 1/4, 1/3, 1/2, 1, 2, 3, 4, 5, 6];
  const translationValues = [-6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6];
  
  // Valeurs pour C: -2π à 2π avec sauts de π/4
  const piValues = [];
  for (let i = -8; i <= 8; i++) {
    piValues.push(i * Math.PI/4);
  }
  
  // Formatage des valeurs spéciales
  const formatFraction = (val) => {
    if (val === 1/6) return "1/6";
    if (val === 1/5) return "1/5";
    if (val === 1/4) return "1/4";
    if (val === 1/3) return "1/3";
    if (val === 1/2) return "1/2";
    return val.toString();
  };
  
  const formatPi = (val) => {
    // Pour les valeurs entières de π
    if (val === 0) return "0";
    if (val === Math.PI) return "π";
    if (val === -Math.PI) return "-π";
    if (val === 2*Math.PI) return "2π";
    if (val === -2*Math.PI) return "-2π";
    
    // Pour les fractions de π
    if (val === Math.PI/4) return "π/4";
    if (val === -Math.PI/4) return "-π/4";
    if (val === Math.PI/2) return "π/2";
    if (val === -Math.PI/2) return "-π/2";
    if (val === 3*Math.PI/4) return "3π/4";
    if (val === -3*Math.PI/4) return "-3π/4";
    if (val === 3*Math.PI/2) return "3π/2";
    if (val === -3*Math.PI/2) return "-3π/2";
    if (val === 5*Math.PI/4) return "5π/4";
    if (val === -5*Math.PI/4) return "-5π/4";
    if (val === 7*Math.PI/4) return "7π/4";
    if (val === -7*Math.PI/4) return "-7π/4";
    
    // Si aucune correspondance exacte n'est trouvée
    return (val/Math.PI).toFixed(2) + "π";
  };
  
  // Construction de la formule mathématique
  const getFormula = () => {
    let formula = "";
    
    // Partie A
    if (a !== 1) {
      formula += a;
    }
    
    // Fonction
    formula += func + "(";
    
    // Partie B
    if (b !== 1) {
      formula += b + "x";
    } else {
      formula += "x";
    }
    
    // Partie C
    if (c !== 0) {
      formula += c > 0 ? " + " + formatPi(c) : " - " + formatPi(Math.abs(c));
    }
    
    formula += ")";
    
    // Partie D
    if (d !== 0) {
      formula += d > 0 ? " + " + d : " - " + Math.abs(d);
    }
    
    return formula;
  };
  
  // Fonction pour générer les points du graphique
  const generatePoints = () => {
    const basePoints = [];
    const transformedPoints = [];
    
    const range = 4 * Math.PI * zoom;
    const step = range / 500; // Augmentation de la résolution pour mieux détecter les asymptotes
    
    let prevX = null;
    let prevY = null;
    let prevBaseY = null;
    
    for (let x = -range/2; x <= range/2; x += step) {
      // Calcul de la valeur de base
      let baseY = null;
      if (func === 'sin') {
        baseY = Math.sin(x);
      } else if (func === 'cos') {
        baseY = Math.cos(x);
      } else {
        // Pour tan, on vérifie si on est près d'une asymptote
        const cosVal = Math.cos(x);
        if (Math.abs(cosVal) < 0.01) continue; // Éviter les points trop proches d'une asymptote
        baseY = Math.tan(x);
        // Limiter les valeurs extrêmes
        if (baseY > 5) baseY = 5;
        if (baseY < -5) baseY = -5;
      }
      
      // Calcul de la valeur transformée
      let transformedY = null;
      if (func === 'sin') {
        transformedY = a * Math.sin(b * x + c) + d;
      } else if (func === 'cos') {
        transformedY = a * Math.cos(b * x + c) + d;
      } else {
        // Pour tan, on vérifie si on est près d'une asymptote
        const cosVal = Math.cos(b * x + c);
        if (Math.abs(cosVal) < 0.01) continue; // Éviter les points trop proches d'une asymptote
        
        transformedY = a * Math.tan(b * x + c) + d;
        // Limiter les valeurs extrêmes
        if (transformedY > 5) transformedY = 5;
        if (transformedY < -5) transformedY = -5;
      }
      
      // Vérification pour éviter les lignes à travers les asymptotes (pour la tangente)
      if (func === 'tan') {
        // Si on a un point précédent et qu'on constate un grand saut, on crée une discontinuité
        if (prevY !== null && Math.abs(transformedY - prevY) > 2) {
          // Ajouter un point null pour créer une discontinuité
          transformedPoints.push({ x, y: null });
        }
        
        if (prevBaseY !== null && Math.abs(baseY - prevBaseY) > 2) {
          // Ajouter un point null pour la fonction de base aussi
          basePoints.push({ x, y: null });
        }
      }
      
      basePoints.push({ x, y: baseY });
      transformedPoints.push({ x, y: transformedY });
      
      prevX = x;
      prevY = transformedY;
      prevBaseY = baseY;
    }
    
    return { basePoints, transformedPoints };
  };
  
  // Rendu du graphique
  const renderGraph = () => {
    // Générer les données des points
    const { basePoints, transformedPoints } = generatePoints();
    
    // Définir la hauteur et largeur du graphique
    const width = 800;
    const height = 400;
    
    // Calculer l'échelle pour le rendu
    const scaleX = width / (4 * Math.PI * zoom);
    const scaleY = height / 10;
    
    // Préparation pour le rendu SVG des chemins
    const createSvgPath = (points) => {
      if (points.length === 0) return '';
      
      let path = '';
      let drawing = false;
      
      points.forEach((point, i) => {
        const x = width/2 + point.x * scaleX;
        
        // Si le point est null ou en dehors des limites, on interrompt le dessin
        if (point.y === null || x < 0 || x > width) {
          drawing = false;
          return;
        }
        
        const y = height/2 - point.y * scaleY;
        
        // Si on ne dessine pas, commencer un nouveau chemin
        if (!drawing) {
          path += `M ${x} ${y} `;
          drawing = true;
        } else {
          path += `L ${x} ${y} `;
        }
      });
      
      return path;
    };
    
    // Construire les chemins SVG
    const basePath = createSvgPath(basePoints);
    const transformedPath = createSvgPath(transformedPoints);
    
    // Calculer les marques de l'axe X
    const xTicks = [];
    for (let i = -4; i <= 4; i++) {
      xTicks.push({
        x: width/2 + i * Math.PI * scaleX,
        label: i === 0 ? '' : `${i}π`
      });
    }

    // Calculer les marques de l'axe Y
    const yTicks = [];
    for (let i = -5; i <= 5; i++) {
      if (i !== 0) { // On saute 0 car c'est l'origine
        yTicks.push({
          y: height/2 - i * scaleY,
          label: i.toString()
        });
      }
    }
    
    return (
      <svg width="100%" height="400" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
        {/* Fond de grille légère */}
        <defs>
          <pattern id="smallGrid" width={scaleX * Math.PI/4} height={scaleY/2} patternUnits="userSpaceOnUse">
            <path d={`M ${scaleX * Math.PI/4} 0 L 0 0 0 ${scaleY/2}`} fill="none" stroke="#f0f0f0" strokeWidth="0.5"/>
          </pattern>
          <pattern id="grid" width={scaleX * Math.PI} height={scaleY} patternUnits="userSpaceOnUse">
            <rect width={scaleX * Math.PI} height={scaleY} fill="url(#smallGrid)"/>
            <path d={`M ${scaleX * Math.PI} 0 L 0 0 0 ${scaleY}`} fill="none" stroke="#e0e0e0" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width={width} height={height} fill="url(#grid)" />
        
        {/* Axes principaux */}
        <line x1="0" y1={height/2} x2={width} y2={height/2} stroke="#999" strokeWidth="1" />
        <line x1={width/2} y1="0" x2={width/2} y2={height} stroke="#999" strokeWidth="1" />
        
        {/* Graduations sur l'axe X */}
        {xTicks.map((tick, i) => (
          <g key={`x-${i}`}>
            <line x1={tick.x} y1={height/2-5} x2={tick.x} y2={height/2+5} stroke="#666" strokeWidth="1" />
            <text x={tick.x} y={height/2+20} textAnchor="middle" fontSize="12">{tick.label}</text>
          </g>
        ))}
        
        {/* Graduations sur l'axe Y */}
        {yTicks.map((tick, i) => (
          <g key={`y-${i}`}>
            <line x1={width/2-5} y1={tick.y} x2={width/2+5} y2={tick.y} stroke="#666" strokeWidth="1" />
            <text x={width/2-15} y={tick.y+4} textAnchor="end" fontSize="12">{tick.label}</text>
          </g>
        ))}
        
        {/* Fonction de base */}
        {basePath && <path d={basePath} stroke="blue" strokeWidth="2" fill="none" />}
        
        {/* Fonction transformée */}
        {transformedPath && <path d={transformedPath} stroke="red" strokeWidth="2" fill="none" />}
        
        {/* Légende */}
        <g transform={`translate(${width-150}, 20)`}>
          <line x1="0" y1="0" x2="20" y2="0" stroke="blue" strokeWidth="2" />
          <text x="25" y="5" fontSize="12">{func}(x)</text>
          <line x1="0" y1="20" x2="20" y2="20" stroke="red" strokeWidth="2" />
          <text x="25" y="25" fontSize="12">{getFormula()}</text>
        </g>
      </svg>
    );
  };
  
  // Chargement des paramètres depuis l'URL lors du montage du composant
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    
    if (params.has('func')) setFunc(params.get('func'));
    if (params.has('a')) setA(parseFloat(params.get('a')));
    if (params.has('b')) setB(parseFloat(params.get('b')));
    if (params.has('c')) setC(parseFloat(params.get('c')));
    if (params.has('d')) setD(parseFloat(params.get('d')));
    if (params.has('zoom')) setZoom(parseFloat(params.get('zoom')));
  }, []);
  
  return (
    <div className="container">
      <h1 className="title">Explorateur de Fonctions Trigonométriques</h1>
      <h3 className="subtitle">Formule générale: A·f(B·x+C)+D</h3>
      
      <div className="panel">
        <div className="control-grid">
          {/* Sélection de fonction */}
          <div className="control-group">
            <h3 className="control-title">Fonction</h3>
            <div className="button-group">
              {['sin', 'cos', 'tan'].map((f) => (
                <button 
                  key={f}
                  className={`button ${func === f ? 'active-button' : ''}`}
                  onClick={() => setFunc(f)}
                >
                  {f}(x)
                </button>
              ))}
            </div>
          </div>
          
          {/* Paramètre A */}
          <div className="control-group">
            <h3 className="control-title">A (amplitude)</h3>
            <div className="slider-container">
              <input 
                type="range" 
                min="0" 
                max={fractions.length-1} 
                value={fractions.indexOf(a)}
                onChange={(e) => setA(fractions[parseInt(e.target.value)])}
              />
              <div className="slider-legend">
                <span>1/6</span>
                <span className="slider-value">{formatFraction(a)}</span>
                <span>6</span>
              </div>
            </div>
          </div>
          
          {/* Paramètre B */}
          <div className="control-group">
            <h3 className="control-title">B (période)</h3>
            <div className="slider-container">
              <input 
                type="range" 
                min="0" 
                max={fractions.length-1} 
                value={fractions.indexOf(b)}
                onChange={(e) => setB(fractions[parseInt(e.target.value)])}
              />
              <div className="slider-legend">
                <span>1/6</span>
                <span className="slider-value">{formatFraction(b)}</span>
                <span>6</span>
              </div>
            </div>
          </div>
          
          {/* Paramètre C */}
          <div className="control-group">
            <h3 className="control-title">C (transl. horizontale)</h3>
            <div className="slider-container">
              <input 
                type="range" 
                min="0" 
                max={piValues.length-1} 
                value={piValues.indexOf(c)}
                onChange={(e) => setC(piValues[parseInt(e.target.value)])}
              />
              <div className="slider-legend">
                <span>-2π</span>
                <span className="slider-value">{formatPi(c)}</span>
                <span>2π</span>
              </div>
            </div>
          </div>
          
          {/* Paramètre D */}
          <div className="control-group">
            <h3 className="control-title">D (transl. verticale)</h3>
            <div className="slider-container">
              <input 
                type="range" 
                min="0" 
                max={translationValues.length-1} 
                value={translationValues.indexOf(d)}
                onChange={(e) => setD(translationValues[parseInt(e.target.value)])}
              />
              <div className="slider-legend">
                <span>-6</span>
                <span className="slider-value">{d}</span>
                <span>6</span>
              </div>
            </div>
          </div>
          
          {/* Zoom */}
          <div className="control-group">
            <h3 className="control-title">Zoom</h3>
            <div className="slider-container">
              <input 
                type="range" 
                min="0.5" 
                max="2" 
                step="0.1" 
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
              />
              <div className="slider-legend">
                <span>0.5x</span>
                <span className="slider-value">{zoom.toFixed(1)}x</span>
                <span>2.0x</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="formula">
          Formule: {getFormula()}
        </div>
      </div>
      
      <div className="panel">
        <div className="graph">
          {renderGraph()}
        </div>
      </div>
      
      <div className="panel">
        <h2>Effets des paramètres</h2>
        <div className="info-grid">
          <div className="info-box info-a">
            <h3>Coefficient A</h3>
            <p>Multiplie la fonction par une constante, modifiant son amplitude.</p>
            <ul>
              <li>A &gt; 1 : amplifie l'amplitude</li>
              <li>0 &lt; A &lt; 1 : réduit l'amplitude</li>
              <li>A &lt; 0 : inverse la courbe</li>
            </ul>
          </div>
          
          <div className="info-box info-b">
            <h3>Coefficient B</h3>
            <p>Modifie la période de la fonction.</p>
            <ul>
              <li>B &gt; 1 : réduit la période</li>
              <li>0 &lt; B &lt; 1 : augmente la période</li>
              <li>Période = (2π/B) pour sin et cos, (π/B) pour tan</li>
            </ul>
          </div>
          
          <div className="info-box info-c">
            <h3>Paramètre C</h3>
            <p>Translation horizontale de -C/B unités.</p>
            <ul>
              <li>C &gt; 0 : déplace vers la gauche</li>
              <li>C &lt; 0 : déplace vers la droite</li>
            </ul>
          </div>
          
          <div className="info-box info-d">
            <h3>Paramètre D</h3>
            <p>Translation verticale.</p>
            <ul>
              <li>D &gt; 0 : déplace vers le haut</li>
              <li>D &lt; 0 : déplace vers le bas</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrigExplorer;

// App.css
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f5f5f5;
}

.App {
  text-align: center;
}

// TrigExplorer.css
.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.title {
  text-align: center;
  color: #2c3e50;
}

.subtitle {
  text-align: center;
  color: #34495e;
  margin-top: -10px;
  margin-bottom: 20px;
  font-weight: normal;
}

.panel {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.control-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 15px;
}

.control-group {
  background-color: #f8f9fa;
  padding: 10px;
  border-radius: 5px;
}

.control-title {
  margin: 0 0 10px 0;
  font-size: 16px;
  font-weight: bold;
}

.button-group {
  display: flex;
  gap: 5px;
}

.button {
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: #e0e0e0;
}

.active-button {
  background-color: #3498db;
  color: white;
}

.slider-container {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.slider-legend {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.slider-value {
  font-weight: bold;
  text-align: center;
}

.formula {
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  margin: 15px 0;
}

.graph {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
  position: relative;
  border: 1px solid #ddd;
  border-radius: 5px;
  overflow: hidden;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.info-box {
  padding: 10px;
  border-radius: 5px;
}

.info-a { background-color: #fff8e1; }
.info-b { background-color: #e8f5e9; }
.info-c { background-color: #e3f2fd; }
.info-d { background-color: #f3e5f5; }

/* Ajouter une responsive design pour petits écrans */
@media (max-width: 768px) {
  .control-grid {
    grid-template-columns: 1fr;
  }
}

// index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// index.css
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}

// package.json
{
  "name": "trig-explorer",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@testing-library/jest-dom": "^5.17.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/user-event": "^14.4.3",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1",
    "web-vitals": "^3.4.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}

// public/index.html
<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta
      name="description"
      content="Explorateur de fonctions trigonométriques"
    />
    <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />
    <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
    <title>Explorateur de Fonctions Trigonométriques</title>
  </head>
  <body>
    <noscript>Vous devez activer JavaScript pour exécuter cette application.</noscript>
    <div id="root"></div>
  </body>
</html>
