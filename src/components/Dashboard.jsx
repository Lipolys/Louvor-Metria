import { useMemo, useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LabelList,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';
import { AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#84cc16'];

const DataTable = ({ title, columns, data, defaultLimit }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const hasLimit = defaultLimit && data.length > defaultLimit;
  const displayData = (hasLimit && !isExpanded) ? data.slice(0, defaultLimit) : data;

  return (
    <div className="glass-panel h-full" style={{ display: 'flex', flexDirection: 'column' }}>
      {title && <h3 className="mb-4 text-xl font-bold">{title}</h3>}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10">
              {columns.map((col, i) => (
                <th key={i} className="p-2 font-semibold text-slate-300">{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayData.map((row, i) => (
              <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                {columns.map((col, j) => (
                  <td key={j} className="p-2 text-slate-300">
                      {col.accessor === 'status' ? (
                          <span style={{ 
                              padding: '0.2rem 0.5rem', 
                              borderRadius: '4px', 
                              fontSize: '0.8rem',
                              background: row[col.accessor] === 'Nunca Cantada' ? 'rgba(239,68,68,0.2)' : 
                                          row[col.accessor] === 'Esquecida' ? 'rgba(245,158,11,0.2)' :
                                          row[col.accessor] === 'Estreante' ? 'rgba(16,185,129,0.2)' :
                                          row[col.accessor] === 'Ativa' ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.1)',
                              color: row[col.accessor] === 'Nunca Cantada' ? '#fca5a5' : 
                                     row[col.accessor] === 'Esquecida' ? '#fcd34d' :
                                     row[col.accessor] === 'Estreante' ? '#6ee7b7' :
                                     row[col.accessor] === 'Ativa' ? '#93c5fd' : '#cbd5e1'
                          }}>
                              {row[col.accessor]}
                          </span>
                      ) : (
                          row[col.accessor]
                      )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {hasLimit && (
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="btn btn-secondary mt-4 w-full flex-center gap-2"
          style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.05)', border: 'none' }}
        >
          {isExpanded ? (
            <><EyeOff size={16} /> Ocultar detalhes</>
          ) : (
            <><Eye size={16} /> Mostrar todos ({data.length})</>
          )}
        </button>
      )}
    </div>
  );
};

const HeatmapTable = ({ title, data, columns, rowKey, maxValue }) => (
  <div>
    <h3 className="mb-4 text-xl font-bold">{title}</h3>
    <div className="glass-panel overflow-x-auto">
      <table className="w-full text-center border-collapse">
        <thead>
          <tr className="border-b border-white/10">
            <th className="p-3 font-semibold text-slate-300 text-left border-r border-white/10 capitalize" style={{ minWidth: '120px' }}>{rowKey}</th>
            {columns.map(col => (
              <th key={col} className="p-3 font-semibold text-slate-300 border-r border-white/10 last:border-0" style={{ minWidth: '80px' }}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
              <td className="p-3 text-slate-300 text-left font-medium border-r border-white/10">{row[rowKey]}</td>
              {columns.map(col => {
                const val = row[col] || 0;
                let intensity = 0;
                if(val > 0 && maxValue > 0) intensity = Math.max(0.15, val / maxValue);
                return (
                <td 
                  key={col} 
                  className="p-3 font-bold border-r border-white/10 last:border-0 transition-all duration-300"
                  style={{ 
                    backgroundColor: val > 0 ? `rgba(239, 68, 68, ${intensity})` : 'transparent',
                    color: val > (maxValue / 2) ? '#fff' : '#cbd5e1'
                  }}
                >
                  {val > 0 ? val : '-'}
                </td>
              )})}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default function Dashboard({ data }) {
  const [selectedCantor, setSelectedCantor] = useState('');
  
  const stats = useMemo(() => {
    if (!data || data.length === 0) return null;

    const total = data.length;
    const cantores = new Set();
    const tons = new Set();
    const tiposSet = new Set();
    
    let antigas = 0;
    let recentes = 0;
    
    const cantorCountMap = {};
    const tomCountMap = {};
    const tipoCountMap = {};
    
    const cantorTipoMap = {};
    const cantorTomMap = {};
    const cantorEpocaMap = {};
    const tipoEpocaMap = {};
    const tonsPorCantorMap = {}; 
    const execucoesPorCancao = {}; 
    
    // Novas Variáveis para Análise de Execução Temporal (Blocos 20 a 28)
    const cantorExecsMap = {};
    const tomExecsMap = {};
    const tipoExecsMap = {};
    const epocaExecsMap = {};
    const execsPorDataMap = {}; 
    const estreiasPorDataMap = {}; 
    const primeiraExecucao = {}; 
    const ultimaExecucao = {}; 
    const cantorDataMap = {}; 
    
    const standardCols = ['titulo', 'tom', 'cantor', 'tipo', 'epoca'];
    const dateColumns = data.length > 0 ? Object.keys(data[0]).filter(k => !standardCols.includes(k.toLowerCase())) : [];

    const parseDateStr = (str) => {
        const parts = str.split(/[\/\-]/);
        if (parts.length >= 2) {
            let d = parts[0], m = parts[1], y = parts.length > 2 ? parts[2] : new Date().getFullYear().toString();
            if (y.length === 2) y = "20" + y;
            return new Date(y, m - 1, d);
        }
        return new Date(0);
    };

    const sortedDates = [...dateColumns].sort((a, b) => parseDateStr(a) - parseDateStr(b));

    sortedDates.forEach(d => {
        execsPorDataMap[d] = 0;
        estreiasPorDataMap[d] = 0;
    });

    data.forEach(d => {
      const ep = d.epoca?.toString().toLowerCase().trim() || 'desconhecido';
      const epocaFormatted = ep.includes('antiga') ? 'Antiga' : (ep.includes('recente') ? 'Recente' : 'Desconhecida');
      if (ep.includes('antiga')) antigas++;
      else if (ep.includes('recente')) recentes++;
      
      const c = d.cantor?.trim() || 'Desconhecido';
      cantores.add(c);
      cantorCountMap[c] = (cantorCountMap[c] || 0) + 1;
      
      let t = d.tom?.trim() || 'N/A';
      if(t && t !== 'N/A') t = t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
      tons.add(t);
      tomCountMap[t] = (tomCountMap[t] || 0) + 1;
      
      let tp = d.tipo?.trim() || 'Desconhecido';
      if (tp.length > 0) tp = tp.charAt(0).toUpperCase() + tp.slice(1).toLowerCase();
      tiposSet.add(tp);
      tipoCountMap[tp] = (tipoCountMap[tp] || 0) + 1;
      
      if (!cantorTipoMap[c]) cantorTipoMap[c] = {};
      cantorTipoMap[c][tp] = (cantorTipoMap[c][tp] || 0) + 1;
      
      if (!cantorTomMap[c]) cantorTomMap[c] = {};
      cantorTomMap[c][t] = (cantorTomMap[c][t] || 0) + 1;
      
      if (!cantorEpocaMap[c]) cantorEpocaMap[c] = {};
      cantorEpocaMap[c][epocaFormatted] = (cantorEpocaMap[c][epocaFormatted] || 0) + 1;
      
      if (!tipoEpocaMap[tp]) tipoEpocaMap[tp] = {};
      tipoEpocaMap[tp][epocaFormatted] = (tipoEpocaMap[tp][epocaFormatted] || 0) + 1;
      
      if (!tonsPorCantorMap[t]) tonsPorCantorMap[t] = new Set();
      tonsPorCantorMap[t].add(c);
      
      // Análise Temporal
      const titulo = d.titulo?.trim() || 'Desconhecido';
      let execs = 0;
      let pVez = null;
      let uVez = null;

      sortedDates.forEach(date => {
          const val = d[date]?.toString().trim().toUpperCase();
          if (val && val !== '' && val !== 'FALSE' && val !== '0' && val !== 'FALSO') {
              execs++;
              execsPorDataMap[date] = (execsPorDataMap[date] || 0) + 1;
              if (!pVez) pVez = date;
              uVez = date;
              
              if (!cantorDataMap[c]) cantorDataMap[c] = {};
              cantorDataMap[c][date] = (cantorDataMap[c][date] || 0) + 1;
          }
      });
      
      execucoesPorCancao[titulo] = (execucoesPorCancao[titulo] || 0) + execs;
      
      if (pVez && !primeiraExecucao[titulo]) {
          primeiraExecucao[titulo] = pVez;
          estreiasPorDataMap[pVez] = (estreiasPorDataMap[pVez] || 0) + 1;
      }
      if (uVez) ultimaExecucao[titulo] = uVez;

      // Agregações de Uso Real
      cantorExecsMap[c] = (cantorExecsMap[c] || 0) + execs;
      if (t !== 'N/A') tomExecsMap[t] = (tomExecsMap[t] || 0) + execs;
      tipoExecsMap[tp] = (tipoExecsMap[tp] || 0) + execs;
      epocaExecsMap[epocaFormatted] = (epocaExecsMap[epocaFormatted] || 0) + execs;
    });

    // Repertório
    const cantorChartData = Object.keys(cantorCountMap).map(k => ({ name: k, valor: cantorCountMap[k], porcentagem: ((cantorCountMap[k] / total) * 100).toFixed(1) + '%' })).sort((a, b) => b.valor - a.valor);
    const epocaChartData = [
      { name: 'Antigas', valor: antigas, porcentagem: ((antigas / total) * 100).toFixed(1) + '%' },
      { name: 'Recentes', valor: recentes, porcentagem: ((recentes / total) * 100).toFixed(1) + '%' }
    ].filter(d => d.valor > 0);
    const tomChartData = Object.keys(tomCountMap).map(k => ({ name: k, valor: tomCountMap[k], porcentagem: ((tomCountMap[k] / total) * 100).toFixed(1) + '%' })).sort((a, b) => b.valor - a.valor);
    const tipoChartData = Object.keys(tipoCountMap).map(k => ({ name: k, valor: tipoCountMap[k], porcentagem: ((tipoCountMap[k] / total) * 100).toFixed(1) + '%' })).sort((a, b) => b.valor - a.valor);

    const buildHeatmap = (mapObj, colKeys, rowLabel) => {
        const hData = Object.keys(mapObj).sort().map(rowKey => {
            const row = { [rowLabel]: rowKey };
            colKeys.forEach(col => row[col] = mapObj[rowKey][col] || 0);
            return row;
        });
        let maxVal = 0;
        hData.forEach(row => colKeys.forEach(col => { if(row[col] > maxVal) maxVal = row[col]; }));
        return { data: hData, max: maxVal, columns: colKeys };
    };

    const tipos = Array.from(tiposSet).sort();
    const tonsArr = Array.from(tons).sort();
    const epocas = ['Antiga', 'Recente', 'Desconhecida'].filter(e => Object.keys(tipoEpocaMap).some(tp => tipoEpocaMap[tp][e] > 0));
    const cantoresArr = Array.from(cantores).sort();

    const heatmapCantorTipo = buildHeatmap(cantorTipoMap, tipos, 'cantor');
    const heatmapCantorTom = buildHeatmap(cantorTomMap, tonsArr, 'cantor');
    const heatmapCantorEpoca = buildHeatmap(cantorEpocaMap, epocas, 'cantor');
    const heatmapTipoEpoca = buildHeatmap(tipoEpocaMap, epocas, 'tipo');
    const heatmapCantorDomingo = buildHeatmap(cantorDataMap, sortedDates, 'cantor');

    // Perfil Individual e Equilíbrio
    const resumoCantor = [];
    const cantorProfiles = {};
    Object.keys(cantorCountMap).forEach(c => {
        const cancoes = cantorCountMap[c];
        const tonsDistintos = Object.keys(cantorTomMap[c] || {}).length;
        const tiposDistintos = Object.keys(cantorTipoMap[c] || {}).length;
        
        let tomMaisCantado = 'N/A'; let maxTom = 0;
        Object.entries(cantorTomMap[c] || {}).forEach(([t, count]) => { if (count > maxTom) { maxTom = count; tomMaisCantado = t; }});
        let tipoMaisCantado = 'N/A'; let maxTipo = 0;
        Object.entries(cantorTipoMap[c] || {}).forEach(([tp, count]) => { if (count > maxTipo) { maxTipo = count; tipoMaisCantado = tp; }});

        const ant = cantorEpocaMap[c]?.['Antiga'] || 0;
        const rec = cantorEpocaMap[c]?.['Recente'] || 0;

        const profile = {
            cantor: c, cancoes, tonsDistintos, tiposDistintos,
            tomMaisCantado: `${tomMaisCantado} (${maxTom}x)`, tipoMaisCantado: `${tipoMaisCantado} (${maxTipo}x)`,
            antigas: ant, recentes: rec
        };
        resumoCantor.push(profile);
        cantorProfiles[c] = profile;
    });
    resumoCantor.sort((a, b) => b.cancoes - a.cancoes);

    // Tons Compartilhados
    let tonsCompartilhadosCount = 0; let tonsExclusivosCount = 0;
    const tonsCompartilhadosArr = []; const tonsExclusivosArr = [];
    Object.entries(tonsPorCantorMap).forEach(([t, cantSet]) => {
        const cArr = Array.from(cantSet).sort();
        const obj = { tom: t, cantoresStr: cArr.join(', '), count: cArr.length };
        if (cArr.length > 1) { tonsCompartilhadosCount++; tonsCompartilhadosArr.push(obj); } 
        else { tonsExclusivosCount++; tonsExclusivosArr.push(obj); }
    });
    tonsCompartilhadosArr.sort((a, b) => b.count - a.count); tonsExclusivosArr.sort((a, b) => a.tom.localeCompare(b.tom));
    const tonsCompartilhadosChart = [{ name: 'Exclusivos (1 cantor)', valor: tonsExclusivosCount }, { name: 'Compartilhados (≥2)', valor: tonsCompartilhadosCount }];

    const mediaCancoes = cantores.size > 0 ? total / cantores.size : 0;
    const variancia = resumoCantor.reduce((acc, c) => acc + Math.pow(c.cancoes - mediaCancoes, 2), 0) / (cantores.size || 1);
    const stdCancoes = Math.sqrt(variancia);

    let equilibrioStatus = 'Desequilíbrio significativo — considere redistribuir canções.';
    if (stdCancoes <= mediaCancoes * 0.15) equilibrioStatus = 'Repertório bem equilibrado!';
    else if (stdCancoes <= mediaCancoes * 0.30) equilibrioStatus = 'Pequeno desequilíbrio — pode ser intencional.';

    // Análises Temporais e Listas Finais
    const dateCount = sortedDates.length;
    const totalExecucoes = Object.values(cantorExecsMap).reduce((acc, val) => acc + val, 0);

    const todasMestres = [];
    const topCancoesArr = [];

    const lastDate = dateCount > 0 ? sortedDates[sortedDates.length - 1] : null;
    const last3Dates = sortedDates.slice(-3);

    Object.keys(execucoesPorCancao).forEach(titulo => {
        const execs = execucoesPorCancao[titulo];
        const rowData = data.find(r => (r.titulo?.trim() || 'Desconhecido') === titulo);

        let status = 'Sem Dados';
        if (dateCount > 0) {
            if (execs === 0) status = 'Nunca Cantada';
            else {
                const uVez = ultimaExecucao[titulo];
                const pVez = primeiraExecucao[titulo];
                if (pVez === lastDate) status = 'Estreante';
                else if (last3Dates.includes(uVez)) status = 'Ativa';
                else status = 'Esquecida';
            }
        }

        const obj = {
            titulo,
            cantor: rowData?.cantor || '-',
            execs,
            primeira: primeiraExecucao[titulo] || '-',
            ultima: ultimaExecucao[titulo] || '-',
            status,
            cobertura: dateCount > 0 ? ((execs / dateCount) * 100).toFixed(1) + '%' : '0%'
        };

        todasMestres.push(obj);
        if (execs > 0) topCancoesArr.push(obj);
    });

    todasMestres.sort((a,b) => b.execs - a.execs);
    topCancoesArr.sort((a,b) => b.execs - a.execs).splice(15);

    // Gráficos de Uso Real
    const formatUso = (mapObj) => Object.keys(mapObj).map(k => ({ 
        name: k, 
        valor: mapObj[k], 
        porcentagem: totalExecucoes > 0 ? ((mapObj[k] / totalExecucoes) * 100).toFixed(1) + '%' : '0%' 
    })).filter(x => x.valor > 0).sort((a, b) => b.valor - a.valor);

    const cantorUsoData = formatUso(cantorExecsMap);
    const tomUsoData = formatUso(tomExecsMap);
    const tipoUsoData = formatUso(tipoExecsMap);
    const epocaUsoData = formatUso(epocaExecsMap);

    let acumulado = 0;
    const evolucaoTemporal = sortedDates.map(date => {
        const estreias = estreiasPorDataMap[date] || 0;
        acumulado += estreias;
        return {
            date,
            'Canções Tocadas': execsPorDataMap[date] || 0,
            'Estreias': estreias,
            'Acúmulo Repertório': acumulado
        };
    });

    return {
      total, cantoresTotais: cantores.size, tonsTotais: tons.size, tiposTotais: tiposSet.size, totalExecucoes,
      antigas, recentes, dateColumns: sortedDates, dateCount,
      cantoresArr,
      cantorChartData, epocaChartData, tomChartData, tipoChartData,
      heatmapCantorTipo, heatmapCantorTom, heatmapCantorEpoca, heatmapTipoEpoca, heatmapCantorDomingo,
      resumoCantor, cantorProfiles,
      tonsCompartilhadosArr, tonsExclusivosArr, tonsCompartilhadosChart,
      mediaCancoes, stdCancoes, equilibrioStatus,
      topCancoesArr, todasMestres,
      cantorUsoData, tomUsoData, tipoUsoData, epocaUsoData, evolucaoTemporal
    };

  }, [data]);

  useEffect(() => {
    if (stats && stats.cantoresArr.length > 0) {
      setSelectedCantor(prev => prev || stats.cantoresArr[0]);
    }
  }, [stats]);

  if (!stats) return null;

  return (
    <div className="animate-fade-in flex flex-col gap-10">
      
      {/* ---------------------------------------------------- */}
      {/* PARTE 1: REPERTÓRIO (BLOCOS 5 A 16) */}
      {/* ---------------------------------------------------- */}
      
      <div id="visao-geral" style={{ scrollMarginTop: '2rem' }}>
        <h2 className="mb-6 text-2xl font-bold" style={{ color: 'var(--accent-1)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>1. Visão Geral do Repertório</h2>
        <div className="dashboard-grid mb-4">
          <div className="glass-panel summary-card">
            <span className="summary-label">Total de Canções</span>
            <span className="summary-value">{stats.total}</span>
          </div>
          <div className="glass-panel summary-card">
            <span className="summary-label">Cantores Diferentes</span>
            <span className="summary-value">{stats.cantoresTotais}</span>
          </div>
          <div className="glass-panel summary-card">
            <span className="summary-label">Tonalidades Distintas</span>
            <span className="summary-value">{stats.tonsTotais}</span>
          </div>
          <div className="glass-panel summary-card">
            <span className="summary-label">Tipos Distintos</span>
            <span className="summary-value">{stats.tiposTotais}</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
          <div className="glass-panel h-full">
            <h3 className="mb-4 text-xl font-bold">Canções por Cantor</h3>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.cantorChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                  <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} itemStyle={{ color: '#f8fafc' }} />
                  <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
                    {stats.cantorChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    <LabelList dataKey="valor" position="top" fill="#f8fafc" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <DataTable columns={[{ header: 'Cantor', accessor: 'name' }, { header: 'Canções', accessor: 'valor' }]} data={stats.cantorChartData} />
      </div>

      <div className="dashboard-grid">
          <div className="glass-panel h-full">
            <h3 className="mb-4 text-xl font-bold">Canções por Tom</h3>
            <div style={{ height: '350px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.tomChartData.slice(0, 10)} margin={{ top: 20, right: 30, left: 0, bottom: 5 }} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
                  <XAxis type="number" stroke="#94a3b8" />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" width={80} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} itemStyle={{ color: '#f8fafc' }} />
                  <Bar dataKey="valor" fill={COLORS[1]} radius={[0, 4, 4, 0]}><LabelList dataKey="valor" position="right" fill="#f8fafc" /></Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <DataTable columns={[{ header: 'Tom', accessor: 'name' }, { header: 'Canções', accessor: 'valor' }]} data={stats.tomChartData} />
      </div>

      <div className="dashboard-grid">
          <div className="glass-panel h-full">
            <h3 className="mb-4 text-xl font-bold">Por Tipo</h3>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.tipoChartData} cx="50%" cy="50%" outerRadius={100} dataKey="valor" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {stats.tipoChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} itemStyle={{ color: '#f8fafc' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="glass-panel h-full">
            <h3 className="mb-4 text-xl font-bold">Por Época</h3>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.epocaChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="valor" paddingAngle={5} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {stats.epocaChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={index === 0 ? COLORS[0] : COLORS[2]} />)}
                  </Pie>
                  <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} itemStyle={{ color: '#f8fafc' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <DataTable title="Resumo Época" columns={[{ header: 'Época', accessor: 'name' }, { header: 'Nº', accessor: 'valor' }, { header: '%', accessor: 'porcentagem' }]} data={stats.epocaChartData} />
      </div>

      <HeatmapTable title="Cantor × Tipo" data={stats.heatmapCantorTipo.data} columns={stats.heatmapCantorTipo.columns} rowKey="cantor" maxValue={stats.heatmapCantorTipo.max} />
      <HeatmapTable title="Cantor × Tom" data={stats.heatmapCantorTom.data} columns={stats.heatmapCantorTom.columns} rowKey="cantor" maxValue={stats.heatmapCantorTom.max} />
      
      <div className="dashboard-grid">
        <HeatmapTable title="Cantor × Época" data={stats.heatmapCantorEpoca.data} columns={stats.heatmapCantorEpoca.columns} rowKey="cantor" maxValue={stats.heatmapCantorEpoca.max} />
        <HeatmapTable title="Tipo × Época" data={stats.heatmapTipoEpoca.data} columns={stats.heatmapTipoEpoca.columns} rowKey="tipo" maxValue={stats.heatmapTipoEpoca.max} />
      </div>

      <div className="glass-panel">
        <div className="flex-between mb-6">
            <h3 className="text-xl font-bold m-0">Perfil Individual por Cantor</h3>
            <select value={selectedCantor} onChange={e => setSelectedCantor(e.target.value)} className="input-field" style={{ width: 'auto', minWidth: '200px' }}>
                {stats.cantoresArr.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
        </div>
        {stats.cantorProfiles[selectedCantor] && (
            <div className="dashboard-grid mb-0">
                <div className="summary-card" style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '1.5rem' }}>
                    <span className="summary-label">Total de Canções</span><span className="summary-value" style={{ color: 'var(--accent-1)' }}>{stats.cantorProfiles[selectedCantor].cancoes}</span>
                </div>
                <div className="summary-card" style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '1.5rem' }}>
                    <span className="summary-label">Tom mais cantado</span><span className="summary-value" style={{ color: 'var(--accent-2)' }}>{stats.cantorProfiles[selectedCantor].tomMaisCantado}</span>
                </div>
                <div className="summary-card" style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '1.5rem' }}>
                    <span className="summary-label">Tipo mais cantado</span><span className="summary-value" style={{ color: 'var(--accent-3)' }}>{stats.cantorProfiles[selectedCantor].tipoMaisCantado}</span>
                </div>
                <div className="summary-card" style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '1.5rem' }}>
                    <span className="summary-label">Tons / Tipos distintos</span><span className="summary-value" style={{ color: 'var(--accent-4)' }}>{stats.cantorProfiles[selectedCantor].tonsDistintos} / {stats.cantorProfiles[selectedCantor].tiposDistintos}</span>
                </div>
                <div className="summary-card" style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '1.5rem' }}>
                    <span className="summary-label">Canções Antigas</span><span className="summary-value" style={{ color: 'var(--accent-5)' }}>{stats.cantorProfiles[selectedCantor].antigas}</span>
                </div>
                <div className="summary-card" style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '1.5rem' }}>
                    <span className="summary-label">Canções Recentes</span><span className="summary-value" style={{ color: 'var(--accent-1)' }}>{stats.cantorProfiles[selectedCantor].recentes}</span>
                </div>
            </div>
        )}
      </div>

      <div>
        <h3 className="mb-4 text-xl font-bold">Equilíbrio do Repertório</h3>
        <div className="flex-center gap-2 mb-6" style={{ color: stats.stdCancoes <= stats.mediaCancoes * 0.15 ? '#10b981' : '#f59e0b', padding: '1rem', background: stats.stdCancoes <= stats.mediaCancoes * 0.15 ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', borderRadius: '0.5rem' }}>
            {stats.stdCancoes <= stats.mediaCancoes * 0.15 ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
            <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{stats.equilibrioStatus}</span>
            <span style={{ marginLeft: 'auto', fontSize: '0.9rem', opacity: 0.8 }}>Média: {stats.mediaCancoes.toFixed(1)} | Desvio Padrão: {stats.stdCancoes.toFixed(1)}</span>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* PARTE 2: USO REAL E TEMPORAL (BLOCOS 18 A 28) */}
      {/* ---------------------------------------------------- */}

      {stats.dateCount > 0 ? (
          <div id="uso-real" className="animate-fade-in flex flex-col gap-10 mt-8 pt-8" style={{ scrollMarginTop: '2rem' }}>
              
              <div className="flex-between mb-6">
                <h2 className="text-2xl font-bold" style={{ color: 'var(--accent-1)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', flex: 1 }}>2. Análise de Uso Real e Execuções</h2>
                <span style={{ background: 'rgba(59,130,246,0.2)', padding: '0.3rem 0.8rem', borderRadius: '1rem', fontSize: '0.875rem', marginLeft: '1rem' }}>
                    {stats.dateCount} datas identificadas | {stats.totalExecucoes} execuções totais
                </span>
              </div>

              {/* Bloco 19: Top Canções Mais Cantadas */}
              <div className="dashboard-grid">
                  <div className="glass-panel h-full">
                    <h3 className="mb-4 text-xl font-bold">Top 15 Canções Mais Cantadas</h3>
                    <div style={{ height: '350px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.topCancoesArr} margin={{ top: 20, right: 30, left: 0, bottom: 5 }} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
                          <XAxis type="number" stroke="#94a3b8" />
                          <YAxis dataKey="titulo" type="category" stroke="#94a3b8" width={100} tick={{fontSize: 11}} />
                          <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} itemStyle={{ color: '#f8fafc' }} />
                          <Bar dataKey="execs" name="Execuções" fill={COLORS[0]} radius={[0, 4, 4, 0]}>
                            <LabelList dataKey="execs" position="right" fill="#f8fafc" />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <DataTable defaultLimit={15} columns={[{ header: 'Canção', accessor: 'titulo' }, { header: 'Execuções', accessor: 'execs' }, { header: 'Cobertura', accessor: 'cobertura' }]} data={stats.topCancoesArr} />
              </div>

              {/* Blocos 21 a 24: Uso Real */}
              <div className="dashboard-grid">
                  <div className="glass-panel h-full">
                    <h3 className="mb-4 text-xl font-bold">Cantores que Mais Cantaram (Uso Real)</h3>
                    <div style={{ height: '300px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.cantorUsoData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                          <XAxis dataKey="name" stroke="#94a3b8" />
                          <YAxis stroke="#94a3b8" />
                          <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} itemStyle={{ color: '#f8fafc' }} />
                          <Bar dataKey="valor" fill={COLORS[4]} radius={[4, 4, 0, 0]}><LabelList dataKey="valor" position="top" fill="#f8fafc" /></Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <DataTable columns={[{ header: 'Cantor', accessor: 'name' }, { header: 'Execuções', accessor: 'valor' }, { header: '%', accessor: 'porcentagem' }]} data={stats.cantorUsoData} />
              </div>

              <div className="dashboard-grid">
                  <DataTable title="Tons (Uso Real)" columns={[{ header: 'Tom', accessor: 'name' }, { header: 'Nº', accessor: 'valor' }]} data={stats.tomUsoData} />
                  <DataTable title="Tipos (Uso Real)" columns={[{ header: 'Tipo', accessor: 'name' }, { header: 'Nº', accessor: 'valor' }]} data={stats.tipoUsoData} />
                  <DataTable title="Épocas (Uso Real)" columns={[{ header: 'Época', accessor: 'name' }, { header: 'Nº', accessor: 'valor' }]} data={stats.epocaUsoData} />
              </div>

              {/* Blocos 25 e 26: Evolução Temporal */}
              <div>
                <h3 className="mb-4 text-xl font-bold">Evolução Temporal e Acúmulo</h3>
                <div className="glass-panel" style={{ height: '400px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats.evolucaoTemporal} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="date" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} itemStyle={{ color: '#f8fafc' }} />
                      <Legend />
                      <Line type="monotone" dataKey="Canções Tocadas" stroke={COLORS[0]} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="Estreias" stroke={COLORS[3]} strokeWidth={2} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="Acúmulo Repertório" stroke={COLORS[2]} strokeWidth={3} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bloco 27: Heatmap Cantor x Domingo */}
              <HeatmapTable title="Participação: Cantor × Domingo" data={stats.heatmapCantorDomingo.data} columns={stats.heatmapCantorDomingo.columns} rowKey="cantor" maxValue={stats.heatmapCantorDomingo.max} />

              {/* Bloco 28: Tabela Mestre Resumo Executivo */}
              <DataTable 
                  defaultLimit={5}
                  title="Resumo Executivo (Todas as Canções)" 
                  columns={[
                      { header: 'Canção', accessor: 'titulo' },
                      { header: 'Cantor', accessor: 'cantor' },
                      { header: 'Execuções', accessor: 'execs' },
                      { header: 'Primeira Vez', accessor: 'primeira' },
                      { header: 'Última Vez', accessor: 'ultima' },
                      { header: 'Status', accessor: 'status' }
                  ]} 
                  data={stats.todasMestres} 
              />
          </div>
      ) : (
          <div className="glass-panel flex-center mt-8 p-8" style={{ flexDirection: 'column', color: 'var(--text-secondary)' }}>
              <AlertCircle size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
              <p>Adicione colunas de datas com "TRUE" ou "X" na sua planilha para ver as Análises de Uso Real e Temporais (Ranking, Evolução, Esquecidas).</p>
          </div>
      )}
      
    </div>
  );
}
