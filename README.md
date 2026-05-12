# 🎵 Louvor Metria

> **v1.0.0** — Dashboard analítico de repertório musical para igrejas. Local-first, sem servidor, sem coleta de dados.

Um painel interativo e glassmórfico construído com **React + Vite**, projetado para líderes de ministério de música que desejam analisar profundamente o repertório da sua congregação — incluindo frequência de uso, perfil por cantor, heatmaps de participação e evolução temporal.

---

## ✨ Funcionalidades

### Parte 1 — Visão Geral do Repertório
- Contadores gerais (total de canções, cantores, tonalidades e tipos)
- Gráficos de barras e pizza por Cantor, Tom, Tipo e Época
- Heatmaps cruzados: Cantor × Tipo, Cantor × Tom, Cantor × Época, Tipo × Época
- Perfil individual por cantor (tom favorito, tipo favorito, distribuição Antigas/Recentes)
- Análise de tonalidades compartilhadas entre cantores (exclusivas vs. compartilhadas)
- Indicador de Equilíbrio do Repertório (desvio padrão por cantor)

### Parte 2 — Análise de Uso Real e Execuções *(requer colunas de data)*
- Top 15 canções mais executadas em culto (com gráfico e tabela)
- Cantores que mais cantaram (uso real, não apenas presença no repertório)
- Uso real por Tonalidade, Tipo e Época
- Gráfico de linha: Evolução Temporal — Volume, Estreias e Acúmulo de Repertório
- Heatmap de Participação: Cantor × Domingo
- Resumo Executivo (todas as canções com status: Ativa, Estreante, Esquecida, Nunca Cantada)

---

## 📂 Formato do Arquivo

Carregue um arquivo `.csv`, `.xlsx` ou `.json`. As colunas mínimas necessárias são:

| Coluna     | Descrição                                           |
|------------|-----------------------------------------------------|
| `Titulo`   | Nome da canção                                      |
| `Cantor`   | Responsável pela regência / vocal principal         |
| `Tom`      | Tonalidade (ex: `C`, `D`, `G#`)                     |
| `Tipo`     | Gênero/estilo (ex: `Louvor`, `Adoração`, `Hino`)    |
| `Epoca`    | Período (ex: `Antiga`, `Recente`)                   |

### Rastreio de Execuções (Análise Temporal)
Para habilitar a **Parte 2**, adicione colunas de datas ao arquivo com o formato `DD/MM/AAAA`. Preencha cada célula com `TRUE` (ou `X`) para indicar que a canção foi executada naquele domingo, ou deixe em branco / `FALSE` caso contrário.

**Exemplo:**

| Titulo          | Cantor | Tom | Tipo   | Epoca   | 06/04/2025 | 13/04/2025 | 20/04/2025 |
|-----------------|--------|-----|--------|---------|------------|------------|------------|
| Quão Grande és Tu | João | G | Hino   | Antiga  | TRUE       | FALSE      | TRUE       |
| Digno és        | Maria  | C | Louvor | Recente | FALSE      | TRUE       | FALSE      |

> Um arquivo modelo está disponível em [`public/modelo.csv`](public/modelo.csv).

---

## 🚀 Como Rodar Localmente

```bash
# Clone o repositório
git clone https://github.com/Lipolys/Louvor-Metria.git
cd Louvor-Metria

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

Acesse em `http://localhost:5173`.

### Build de Produção
```bash
npm run build
npm run preview
```

---

## 🛠️ Tecnologias

| Biblioteca       | Uso                                        |
|------------------|--------------------------------------------|
| React 19         | UI e gerenciamento de estado               |
| Vite 8           | Bundler e servidor de desenvolvimento      |
| Recharts         | Todos os gráficos interativos              |
| PapaParse        | Leitura e parsing de arquivos CSV          |
| SheetJS (xlsx)   | Leitura de arquivos Excel (.xlsx)          |
| Lucide React     | Ícones                                     |

---

## 📁 Estrutura do Projeto

```
ipg-dashboard/
├── public/
│   └── modelo.csv          # Planilha modelo para referência
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx   # Motor analítico central (28 blocos)
│   │   └── DataInput.jsx   # Modal de carregamento de arquivo
│   ├── utils/
│   │   └── dataProcessor.js # Parser e normalizador de dados
│   ├── App.jsx             # Layout principal e sidebar
│   ├── index.css           # Design system glassmórfico
│   └── main.jsx            # Ponto de entrada
├── package.json
└── README.md
```

---

## 🔒 Privacidade

Todos os dados são processados **inteiramente no seu navegador**. Nenhum dado é enviado para servidores externos. O aplicativo funciona offline após o carregamento inicial.

---

## 📋 Roadmap (v2.0)

- [ ] Exportação dos gráficos como imagem (PNG)
- [ ] Sistema de snapshots para comparação histórica
- [ ] Inserção de dados sem auxílio de CSV ou planilhas

---

## 📄 Licença

MIT © Louvor Metria
