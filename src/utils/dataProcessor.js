import Papa from 'papaparse';
import * as XLSX from 'xlsx';

// Function to normalize the keys and values of the data
const normalizeData = (data) => {
  return data.map(row => {
    const normalized = {};
    for (const key in row) {
      if (row.hasOwnProperty(key)) {
        // Normalize keys (e.g. "  Título  " -> "titulo", "Tom" -> "tom")
        const newKey = key.trim().toLowerCase()
          .replace(/[áàãâä]/g, 'a')
          .replace(/[éèêë]/g, 'e')
          .replace(/[íìîï]/g, 'i')
          .replace(/[óòõôö]/g, 'o')
          .replace(/[úùûü]/g, 'u')
          .replace(/ç/g, 'c');
        
        // Normalize values
        let val = row[key];
        if (typeof val === 'string') {
          val = val.trim();
        }
        
        normalized[newKey] = val;
      }
    }
    
    // Normalize gender values
    const rawGenero = (normalized.genero || normalized.sexo || normalized.gender || '').toString().trim().toLowerCase();
    let generoNorm = 'Não informado';
    if (rawGenero === 'm' || rawGenero === 'masculino' || rawGenero === 'homem' || rawGenero === 'male') {
      generoNorm = 'Masculino';
    } else if (rawGenero === 'f' || rawGenero === 'feminino' || rawGenero === 'mulher' || rawGenero === 'female') {
      generoNorm = 'Feminino';
    }

    // Default fallback mappings if the sheet uses specific column names
    return {
      titulo: normalized.titulo || normalized.musica || normalized.nome || '',
      tom: normalized.tom || normalized.tonalidade || '',
      cantor: normalized.cantor || normalized.vocal || normalized.ministro || '',
      genero: generoNorm,
      tipo: normalized.tipo || normalized.estilo || '',
      epoca: normalized.epoca || normalized.tempo || '',
      ...normalized,
      genero: generoNorm, // ensure normalized value wins over spread
    };
  }).filter(row => row.titulo); // only keep rows with at least a title
};

export const parseFile = async (file) => {
  return new Promise((resolve, reject) => {
    const ext = file.name.split('.').pop().toLowerCase();
    
    if (ext === 'json') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target.result);
          resolve(normalizeData(json));
        } catch (err) {
          reject('Invalid JSON file');
        }
      };
      reader.readAsText(file);
    } 
    else if (ext === 'csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => resolve(normalizeData(results.data)),
        error: (err) => reject(err.message)
      });
    } 
    else if (ext === 'xlsx' || ext === 'xls') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const json = XLSX.utils.sheet_to_json(worksheet);
          resolve(normalizeData(json));
        } catch (err) {
          reject('Error parsing Excel file');
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      reject('Unsupported file type');
    }
  });
};

export const fetchGoogleSheet = async (url) => {
  try {
    // Basic extraction of Google Sheets ID from the URL
    // e.g. https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
    const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (!match) throw new Error('Invalid Google Sheets URL');
    
    const sheetId = match[1];
    // To fetch as CSV without auth, the sheet MUST be published to web or public to anyone with link
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
    
    const response = await fetch(csvUrl);
    if (!response.ok) throw new Error('Could not fetch data. Make sure the sheet is public (Anyone with the link can view).');
    
    const csvText = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => resolve(normalizeData(results.data)),
        error: (err) => reject(err.message)
      });
    });
  } catch (err) {
    throw err;
  }
};
