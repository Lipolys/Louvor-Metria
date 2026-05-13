import { useMemo, useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LabelList,
  PieChart, Pie, Cell, Legend, LineChart, Line, ComposedChart, Area, ReferenceLine
} from 'recharts';
import { AlertCircle, CheckCircle2, Eye, EyeOff, TrendingUp } from 'lucide-react';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#84cc16'];
const GENDER_COLORS = { 'Masculino': '#3b82f6', 'Feminino': '#ec4899', 'Não informado': '#94a3b8' };

const DataTable = ({ title, columns, data, defaultLimit }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const hasLimit = defaultLimit && data.length > defaultLimit;
  const displayData = (hasLimit && !isExpanded) ? data.slice(0, defaultLimit) : data;

  return (
    <div className="glass-panel h-full" style={{ display: 'flex', flexDirection: 'column' }}>
      {title && <h3 className="chart-title">{title}</h3>}
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
    <h3 className="chart-title">{title}</h3>
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
    
    // Variáveis de Gênero
    const generoCountMap = {};       // gênero -> nº de canções
    const generoCantorSet = {};      // gênero -> Set de cantores
    const generoTomMap = {};         // gênero -> { tom: count }
    const generoTipoMap = {};        // gênero -> { tipo: count }
    const generoEpocaMap = {};       // gênero -> { epoca: count }
    const generoExecsMap = {};       // gênero -> nº de execuções (uso real)
    const cantorGeneroMap = {};      // cantor -> gênero

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
    
    const standardCols = ['titulo', 'tom', 'cantor', 'genero', 'tipo', 'epoca'];
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
      
      const gen = d.genero || 'Não informado';
      
      let t = d.tom?.trim() || 'N/A';
      if(t && t !== 'N/A') t = t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
      tons.add(t);
      tomCountMap[t] = (tomCountMap[t] || 0) + 1;
      
      let tp = d.tipo?.trim() || 'Desconhecido';
      if (tp.length > 0) tp = tp.charAt(0).toUpperCase() + tp.slice(1).toLowerCase();
      tiposSet.add(tp);
      tipoCountMap[tp] = (tipoCountMap[tp] || 0) + 1;
      
      // Gênero aggregations
      generoCountMap[gen] = (generoCountMap[gen] || 0) + 1;
      if (!generoCantorSet[gen]) generoCantorSet[gen] = new Set();
      generoCantorSet[gen].add(c);
      cantorGeneroMap[c] = gen;
      
      if (!generoTomMap[gen]) generoTomMap[gen] = {};
      generoTomMap[gen][t] = (generoTomMap[gen][t] || 0) + 1;
      
      if (!generoTipoMap[gen]) generoTipoMap[gen] = {};
      generoTipoMap[gen][tp] = (generoTipoMap[gen][tp] || 0) + 1;
      
      if (!generoEpocaMap[gen]) generoEpocaMap[gen] = {};
      generoEpocaMap[gen][epocaFormatted] = (generoEpocaMap[gen][epocaFormatted] || 0) + 1;
      
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
      generoExecsMap[gen] = (generoExecsMap[gen] || 0) + execs;
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

    // ============================
    // Dados de Gênero
    // ============================
    const generos = Object.keys(generoCountMap).sort();
    const generoCantorCountData = generos.map(g => ({ name: g, valor: generoCantorSet[g]?.size || 0 }));
    const generoCancoesData = generos.map(g => ({ name: g, valor: generoCountMap[g] || 0, porcentagem: ((generoCountMap[g] / total) * 100).toFixed(1) + '%' }));
    
    // Tons por Gênero (stacked bar)
    const generoTomChartData = tonsArr.filter(t => t !== 'N/A').map(t => {
      const row = { name: t };
      generos.forEach(g => { row[g] = generoTomMap[g]?.[t] || 0; });
      return row;
    }).filter(row => generos.some(g => row[g] > 0)).sort((a, b) => {
      const sumA = generos.reduce((s, g) => s + a[g], 0);
      const sumB = generos.reduce((s, g) => s + b[g], 0);
      return sumB - sumA;
    }).slice(0, 12);

    // Tipos por Gênero (stacked bar)
    const generoTipoChartData = tipos.map(tp => {
      const row = { name: tp };
      generos.forEach(g => { row[g] = generoTipoMap[g]?.[tp] || 0; });
      return row;
    }).filter(row => generos.some(g => row[g] > 0)).sort((a, b) => {
      const sumA = generos.reduce((s, g) => s + a[g], 0);
      const sumB = generos.reduce((s, g) => s + b[g], 0);
      return sumB - sumA;
    });

    // Execuções por Gênero (uso real)
    const generoExecsData = generos.map(g => ({ name: g, valor: generoExecsMap[g] || 0, porcentagem: totalExecucoes > 0 ? ((generoExecsMap[g] / totalExecucoes) * 100).toFixed(1) + '%' : '0%' })).filter(x => x.valor > 0);

    // Heatmap Gênero x Tom
    const heatmapGeneroTom = buildHeatmap(generoTomMap, tonsArr, 'genero');
    // Heatmap Gênero x Tipo
    const heatmapGeneroTipo = buildHeatmap(generoTipoMap, tipos, 'genero');
    // Heatmap Gênero x Época
    const heatmapGeneroEpoca = buildHeatmap(generoEpocaMap, epocas, 'genero');

    // Perfil Comparativo por Gênero
    const generoProfiles = generos.map(g => {
      const cancoes = generoCountMap[g] || 0;
      const cantoresCount = generoCantorSet[g]?.size || 0;
      const tonsObj = generoTomMap[g] || {};
      const tiposObj = generoTipoMap[g] || {};
      let topTom = 'N/A', maxTom = 0;
      Object.entries(tonsObj).forEach(([t, c]) => { if (c > maxTom) { maxTom = c; topTom = t; } });
      let topTipo = 'N/A', maxTipo = 0;
      Object.entries(tiposObj).forEach(([tp, c]) => { if (c > maxTipo) { maxTipo = c; topTipo = tp; } });
      const mediaPorCantor = cantoresCount > 0 ? (cancoes / cantoresCount).toFixed(1) : '0';
      return { genero: g, cancoes, cantoresCount, topTom: `${topTom} (${maxTom}x)`, topTipo: `${topTipo} (${maxTipo}x)`, mediaPorCantor, execs: generoExecsMap[g] || 0 };
    });

    // ============================
    // NOVOS: 6 Análises Avançadas
    // ============================

    // A1 — Status das Canções (donut)
    const statusCountMap = {};
    todasMestres.forEach(m => { statusCountMap[m.status] = (statusCountMap[m.status] || 0) + 1; });
    const STATUS_ORDER = ['Ativa', 'Estreante', 'Esquecida', 'Nunca Cantada', 'Sem Dados'];
    const statusChartData = STATUS_ORDER
      .filter(s => statusCountMap[s] > 0)
      .map(s => ({ name: s, valor: statusCountMap[s], porcentagem: ((statusCountMap[s] / total) * 100).toFixed(1) + '%' }));
    const STATUS_COLORS = { 'Ativa': '#3b82f6', 'Estreante': '#10b981', 'Esquecida': '#f59e0b', 'Nunca Cantada': '#ef4444', 'Sem Dados': '#64748b' };

    // A2 — Pareto / Concentração
    let paretoAccum = 0;
    const allExecsSorted = todasMestres.filter(m => m.execs > 0).sort((a, b) => b.execs - a.execs);
    const paretoData = allExecsSorted.map((m, i) => {
      paretoAccum += m.execs;
      return { name: m.titulo.length > 20 ? m.titulo.substring(0, 18) + '…' : m.titulo, execs: m.execs, pctAcumulado: totalExecucoes > 0 ? parseFloat(((paretoAccum / totalExecucoes) * 100).toFixed(1)) : 0 };
    });
    const pareto80Index = paretoData.findIndex(d => d.pctAcumulado >= 80);
    const pareto80Count = pareto80Index >= 0 ? pareto80Index + 1 : paretoData.length;
    const paretoTotalSongs = paretoData.length;

    // A3 — Versatilidade dos Cantores
    const versatilityData = resumoCantor.map(c => ({
      name: c.cantor,
      'Tons Distintos': c.tonsDistintos,
      'Tipos Distintos': c.tiposDistintos,
      total: c.tonsDistintos + c.tiposDistintos
    })).sort((a, b) => b.total - a.total);

    // B2 — Canções Esquecidas (com dias sem tocar)
    const lastDateParsed = lastDate ? parseDateStr(lastDate) : new Date();
    const esquecidasData = todasMestres.filter(m => m.status === 'Esquecida').map(m => {
      const ultimaStr = ultimaExecucao[m.titulo];
      const ultimaParsed = ultimaStr ? parseDateStr(ultimaStr) : null;
      const diasSemTocar = ultimaParsed ? Math.floor((lastDateParsed - ultimaParsed) / (1000 * 60 * 60 * 24)) : 999;
      const semanasSemTocar = Math.max(1, Math.floor(diasSemTocar / 7));
      return { ...m, diasSemTocar, semanasSemTocar: semanasSemTocar + ' sem.' };
    }).sort((a, b) => b.diasSemTocar - a.diasSemTocar);

    // C1 — Tons Maiores vs Menores
    let tonsMaiores = 0, tonsMenores = 0;
    Object.entries(tomCountMap).forEach(([tom, count]) => {
      if (tom === 'N/A') return;
      if (tom.length > 1 && tom.endsWith('m')) tonsMenores += count;
      else tonsMaiores += count;
    });
    const tonsMaioresMenoresData = [
      { name: 'Maiores (alegres)', valor: tonsMaiores },
      { name: 'Menores (reflexivas)', valor: tonsMenores }
    ].filter(d => d.valor > 0);

    // D3 — Ranking de Eficiência
    const eficienciaData = Object.keys(cantorCountMap).map(c => {
      const cancoes = cantorCountMap[c];
      const execs = cantorExecsMap[c] || 0;
      const eficiencia = cancoes > 0 ? parseFloat((execs / cancoes).toFixed(2)) : 0;
      const nuncaCantadas = todasMestres.filter(m => (m.cantor?.trim() || '-') === c && m.status === 'Nunca Cantada').length;
      return {
        cantor: c, cancoes, execs, eficiencia,
        eficienciaStr: eficiencia.toFixed(1) + 'x',
        nuncaCantadas,
        pctNunca: cancoes > 0 ? ((nuncaCantadas / cancoes) * 100).toFixed(0) + '%' : '0%'
      };
    }).sort((a, b) => b.eficiencia - a.eficiencia);

    return {
      total, cantoresTotais: cantores.size, tonsTotais: tons.size, tiposTotais: tiposSet.size, totalExecucoes,
      antigas, recentes, dateColumns: sortedDates, dateCount,
      cantoresArr, generos,
      cantorChartData, epocaChartData, tomChartData, tipoChartData,
      heatmapCantorTipo, heatmapCantorTom, heatmapCantorEpoca, heatmapTipoEpoca, heatmapCantorDomingo,
      resumoCantor, cantorProfiles,
      tonsCompartilhadosArr, tonsExclusivosArr, tonsCompartilhadosChart,
      mediaCancoes, stdCancoes, equilibrioStatus,
      topCancoesArr, todasMestres,
      cantorUsoData, tomUsoData, tipoUsoData, epocaUsoData, evolucaoTemporal,
      // Gênero
      generoCantorCountData, generoCancoesData, generoTomChartData, generoTipoChartData,
      generoExecsData, heatmapGeneroTom, heatmapGeneroTipo, heatmapGeneroEpoca, generoProfiles,
      // Novos (6 análises)
      statusChartData, STATUS_COLORS,
      paretoData, pareto80Count, paretoTotalSongs,
      versatilityData,
      esquecidasData,
      tonsMaioresMenoresData,
      eficienciaData
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
        <h2 className="section-title">1. Visão Geral do Repertório</h2>
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
            <h3 className="chart-title">Canções por Cantor</h3>
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
            <h3 className="chart-title">Canções por Tom</h3>
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
            <h3 className="chart-title">Por Tipo</h3>
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
            <h3 className="chart-title">Por Época</h3>
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
            <h3 className="chart-title" style={{ margin: 0 }}>Perfil Individual por Cantor</h3>
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
        <h3 className="chart-title">Equilíbrio do Repertório</h3>
        <div className="flex-center gap-2 mb-6" style={{ color: stats.stdCancoes <= stats.mediaCancoes * 0.15 ? '#10b981' : '#f59e0b', padding: '1rem', background: stats.stdCancoes <= stats.mediaCancoes * 0.15 ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', borderRadius: '0.5rem' }}>
            {stats.stdCancoes <= stats.mediaCancoes * 0.15 ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
            <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{stats.equilibrioStatus}</span>
            <span style={{ marginLeft: 'auto', fontSize: '0.9rem', opacity: 0.8 }}>Média: {stats.mediaCancoes.toFixed(1)} | Desvio Padrão: {stats.stdCancoes.toFixed(1)}</span>
        </div>
      </div>

      {/* C1 — Tons Maiores vs Menores + A3 — Versatilidade */}
      {stats.tonsMaioresMenoresData.length > 0 && (
        <div className="dashboard-grid">
          <div className="glass-panel h-full">
            <h3 className="chart-title">Tonalidades: Maiores vs Menores</h3>
            <div style={{ height: '280px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.tonsMaioresMenoresData} cx="50%" cy="50%" innerRadius={55} outerRadius={95} dataKey="valor" paddingAngle={5} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    <Cell fill="#f59e0b" />
                    <Cell fill="#8b5cf6" />
                  </Pie>
                  <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} itemStyle={{ color: '#f8fafc' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem', marginBottom: 0 }}>
              Tons maiores (C, D, G…) tendem a ser mais alegres. Menores (Am, Em…) mais reflexivos.
            </p>
          </div>
          <div className="glass-panel h-full">
            <h3 className="chart-title">Índice de Versatilidade dos Cantores</h3>
            <div style={{ height: '280px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.versatilityData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
                  <XAxis type="number" stroke="#94a3b8" />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" width={80} tick={{ fontSize: 11 }} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} itemStyle={{ color: '#f8fafc' }} />
                  <Legend />
                  <Bar dataKey="Tons Distintos" stackId="v" fill={COLORS[1]} />
                  <Bar dataKey="Tipos Distintos" stackId="v" fill={COLORS[2]} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem', marginBottom: 0 }}>
              Quanto mais tons e tipos distintos, mais versátil o cantor.
            </p>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* PARTE 2: USO REAL E TEMPORAL (BLOCOS 18 A 28) */}
      {/* ---------------------------------------------------- */}

      {stats.dateCount > 0 ? (
          <div id="uso-real" className="animate-fade-in flex flex-col gap-10 mt-8 pt-8" style={{ scrollMarginTop: '2rem' }}>
              
              <div className="flex-between mb-6">
                <h2 className="section-title" style={{ flex: 1 }}>2. Análise de Uso Real e Execuções</h2>
                <span style={{ background: 'rgba(59,130,246,0.2)', padding: '0.3rem 0.8rem', borderRadius: '1rem', fontSize: '0.875rem', marginLeft: '1rem' }}>
                    {stats.dateCount} datas identificadas | {stats.totalExecucoes} execuções totais
                </span>
              </div>

              {/* Bloco 19: Top Canções Mais Cantadas */}
              <div className="dashboard-grid">
                  <div className="glass-panel h-full">
                    <h3 className="chart-title">Top 15 Canções Mais Cantadas</h3>
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
                    <h3 className="chart-title">Cantores que Mais Cantaram (Uso Real)</h3>
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
                <h3 className="chart-title">Evolução Temporal e Acúmulo</h3>
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

              {/* A1 — Status das Canções + A2 — Pareto */}
              <div className="dashboard-grid">
                <div className="glass-panel h-full">
                  <h3 className="chart-title">Saúde do Repertório (Status)</h3>
                  <div style={{ height: '300px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={stats.statusChartData} cx="50%" cy="50%" innerRadius={55} outerRadius={95} dataKey="valor" paddingAngle={3} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                          {stats.statusChartData.map((entry) => <Cell key={entry.name} fill={stats.STATUS_COLORS[entry.name] || '#64748b'} />)}
                        </Pie>
                        <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} itemStyle={{ color: '#f8fafc' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <DataTable title="Status do Repertório" columns={[{ header: 'Status', accessor: 'name' }, { header: 'Canções', accessor: 'valor' }, { header: '%', accessor: 'porcentagem' }]} data={stats.statusChartData} />
              </div>

              {/* A2 — Pareto / Concentração */}
              {stats.paretoData.length > 0 && (
                <div>
                  <div className="flex-between mb-4">
                    <h3 className="chart-title" style={{ margin: 0 }}>Concentração do Repertório (Pareto)</h3>
                    <span style={{ background: stats.pareto80Count <= Math.ceil(stats.paretoTotalSongs * 0.3) ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)', padding: '0.3rem 0.8rem', borderRadius: '1rem', fontSize: '0.85rem', fontWeight: 600 }}>
                      {stats.pareto80Count} de {stats.paretoTotalSongs} canções = 80% das execuções
                    </span>
                  </div>
                  <div className="glass-panel" style={{ height: '350px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={stats.paretoData.slice(0, 20)} margin={{ top: 20, right: 40, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 10, fill: '#94a3b8' }} angle={-25} textAnchor="end" height={60} />
                        <YAxis yAxisId="left" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                        <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} domain={[0, 100]} unit="%" />
                        <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} itemStyle={{ color: '#f8fafc' }} />
                        <Legend />
                        <ReferenceLine yAxisId="right" y={80} stroke="#ef4444" strokeDasharray="5 5" label={{ value: '80%', fill: '#ef4444', fontSize: 12, position: 'right' }} />
                        <Bar yAxisId="left" dataKey="execs" name="Execuções" fill={COLORS[0]} radius={[4, 4, 0, 0]} />
                        <Area yAxisId="right" dataKey="pctAcumulado" name="% Acumulado" stroke={COLORS[3]} fill="rgba(245,158,11,0.15)" strokeWidth={2} dot={{ r: 3 }} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                  {stats.pareto80Count <= Math.ceil(stats.paretoTotalSongs * 0.3) && (
                    <div className="flex-center gap-2" style={{ color: '#f59e0b', marginTop: '1rem', padding: '0.75rem 1rem', background: 'rgba(245,158,11,0.1)', borderRadius: '0.5rem', fontSize: '0.9rem' }}>
                      <AlertCircle size={18} />
                      <span>Alta concentração: apenas <strong>{stats.pareto80Count}</strong> canções dominam 80% das execuções. Considere diversificar.</span>
                    </div>
                  )}
                </div>
              )}

              {/* D3 — Ranking de Eficiência */}
              <DataTable 
                title="Ranking de Eficiência dos Cantores"
                columns={[
                  { header: 'Cantor', accessor: 'cantor' },
                  { header: 'Canções', accessor: 'cancoes' },
                  { header: 'Execuções', accessor: 'execs' },
                  { header: 'Eficiência', accessor: 'eficienciaStr' },
                  { header: 'Nunca Cantadas', accessor: 'nuncaCantadas' },
                  { header: '% Ociosa', accessor: 'pctNunca' }
                ]}
                data={stats.eficienciaData}
              />

              {/* B2 — Canções Esquecidas */}
              {stats.esquecidasData.length > 0 && (
                <div>
                  <div className="flex-between mb-4">
                    <h3 className="chart-title" style={{ margin: 0 }}>⚠️ Canções Esquecidas</h3>
                    <span style={{ background: 'rgba(245,158,11,0.2)', padding: '0.3rem 0.8rem', borderRadius: '1rem', fontSize: '0.85rem' }}>
                      {stats.esquecidasData.length} canções sem tocar recentemente
                    </span>
                  </div>
                  <DataTable
                    defaultLimit={10}
                    columns={[
                      { header: 'Canção', accessor: 'titulo' },
                      { header: 'Cantor', accessor: 'cantor' },
                      { header: 'Última Vez', accessor: 'ultima' },
                      { header: 'Tempo Parada', accessor: 'semanasSemTocar' },
                      { header: 'Total Exec.', accessor: 'execs' }
                    ]}
                    data={stats.esquecidasData}
                  />
                </div>
              )}

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
      {/* ---------------------------------------------------- */}
      {/* PARTE 3: ANÁLISE POR GÊNERO */}
      {/* ---------------------------------------------------- */}

      {stats.generos && stats.generos.length > 0 && (
        <div id="analise-genero" className="animate-fade-in flex flex-col gap-10 mt-8 pt-8" style={{ scrollMarginTop: '2rem' }}>
          <h2 className="section-title">3. Análise por Gênero</h2>

          {/* Cards comparativos por gênero */}
          <div className="dashboard-grid" style={{ gridTemplateColumns: `repeat(${Math.min(stats.generoProfiles.length, 3)}, 1fr)` }}>
            {stats.generoProfiles.map(prof => (
              <div key={prof.genero} className="glass-panel" style={{ borderLeft: `4px solid ${GENDER_COLORS[prof.genero] || '#94a3b8'}` }}>
                <h3 className="chart-title" style={{ color: GENDER_COLORS[prof.genero] || '#94a3b8' }}>{prof.genero}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="summary-card">
                    <span className="summary-label">Cantores</span>
                    <span className="summary-value" style={{ fontSize: '1.8rem', color: GENDER_COLORS[prof.genero] || '#94a3b8' }}>{prof.cantoresCount}</span>
                  </div>
                  <div className="summary-card">
                    <span className="summary-label">Canções</span>
                    <span className="summary-value" style={{ fontSize: '1.8rem' }}>{prof.cancoes}</span>
                  </div>
                  <div className="summary-card">
                    <span className="summary-label">Tom Top</span>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{prof.topTom}</span>
                  </div>
                  <div className="summary-card">
                    <span className="summary-label">Tipo Top</span>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{prof.topTipo}</span>
                  </div>
                  <div className="summary-card">
                    <span className="summary-label">Média canções/cantor</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-3)' }}>{prof.mediaPorCantor}</span>
                  </div>
                  {stats.dateCount > 0 && (
                    <div className="summary-card">
                      <span className="summary-label">Execuções</span>
                      <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-4)' }}>{prof.execs}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Cantores por Gênero (Donut) + Canções por Gênero (Bar) */}
          <div className="dashboard-grid">
            <div className="glass-panel h-full">
              <h3 className="chart-title">Cantores por Gênero</h3>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={stats.generoCantorCountData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="valor" paddingAngle={5} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                      {stats.generoCantorCountData.map((entry) => <Cell key={entry.name} fill={GENDER_COLORS[entry.name] || '#94a3b8'} />)}
                    </Pie>
                    <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} itemStyle={{ color: '#f8fafc' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="glass-panel h-full">
              <h3 className="chart-title">Canções por Gênero</h3>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.generoCancoesData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                    <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                    <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} itemStyle={{ color: '#f8fafc' }} />
                    <Bar dataKey="valor" name="Canções" radius={[4, 4, 0, 0]}>
                      {stats.generoCancoesData.map((entry) => <Cell key={entry.name} fill={GENDER_COLORS[entry.name] || '#94a3b8'} />)}
                      <LabelList dataKey="valor" position="top" fill="#f8fafc" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <DataTable title="Canções por Gênero" columns={[{ header: 'Gênero', accessor: 'name' }, { header: 'Canções', accessor: 'valor' }, { header: '%', accessor: 'porcentagem' }]} data={stats.generoCancoesData} />
          </div>

          {/* Tons por Gênero (Stacked Bar) */}
          <div className="glass-panel">
            <h3 className="chart-title">Tons por Gênero</h3>
            <div style={{ height: '400px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.generoTomChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                  <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} itemStyle={{ color: '#f8fafc' }} />
                  <Legend />
                  {stats.generos.map(g => (
                    <Bar key={g} dataKey={g} stackId="genero" fill={GENDER_COLORS[g] || '#94a3b8'} radius={stats.generos.indexOf(g) === stats.generos.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tipos por Gênero (Stacked Bar) */}
          <div className="glass-panel">
            <h3 className="chart-title">Tipos por Gênero</h3>
            <div style={{ height: '350px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.generoTipoChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                  <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} itemStyle={{ color: '#f8fafc' }} />
                  <Legend />
                  {stats.generos.map(g => (
                    <Bar key={g} dataKey={g} stackId="genero" fill={GENDER_COLORS[g] || '#94a3b8'} radius={stats.generos.indexOf(g) === stats.generos.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Heatmaps: Gênero × Tom e Gênero × Época */}
          <div className="dashboard-grid">
            <HeatmapTable title="Gênero × Tom" data={stats.heatmapGeneroTom.data} columns={stats.heatmapGeneroTom.columns} rowKey="genero" maxValue={stats.heatmapGeneroTom.max} />
            <HeatmapTable title="Gênero × Época" data={stats.heatmapGeneroEpoca.data} columns={stats.heatmapGeneroEpoca.columns} rowKey="genero" maxValue={stats.heatmapGeneroEpoca.max} />
          </div>

          {/* Execuções por Gênero (Uso Real) — só aparece se houver datas */}
          {stats.dateCount > 0 && stats.generoExecsData.length > 0 && (
            <div className="dashboard-grid">
              <div className="glass-panel h-full">
                <h3 className="chart-title">Execuções por Gênero (Uso Real)</h3>
                <div style={{ height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.generoExecsData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                      <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                      <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                      <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} itemStyle={{ color: '#f8fafc' }} />
                      <Bar dataKey="valor" name="Execuções" radius={[4, 4, 0, 0]}>
                        {stats.generoExecsData.map((entry) => <Cell key={entry.name} fill={GENDER_COLORS[entry.name] || '#94a3b8'} />)}
                        <LabelList dataKey="valor" position="top" fill="#f8fafc" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <DataTable title="Execuções por Gênero" columns={[{ header: 'Gênero', accessor: 'name' }, { header: 'Execuções', accessor: 'valor' }, { header: '%', accessor: 'porcentagem' }]} data={stats.generoExecsData} />
            </div>
          )}
        </div>
      )}
      
    </div>
  );
}
