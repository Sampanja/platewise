// Reads the THL Fineli open data package (CSV files, Latin-1, ';'-separated,
// decimal comma). Shared by build-ingredients.mjs and the search helper.
// Fineli © THL, CC BY 4.0. https://fineli.fi
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

function rows(dir, file) {
  const text = readFileSync(join(dir, file)).toString('latin1');
  const [header, ...lines] = text.split(/\r?\n/).filter(Boolean);
  const keys = header.split(';');
  return lines.map((line) => Object.fromEntries(line.split(';').map((v, i) => [keys[i], v])));
}

const num = (v) => (v === undefined || v === '' ? 0 : Number(String(v).replace(',', '.')));

/** Map FOODID → { id, name, kcal, proteinG, carbsG, fatG, fiberG, sugarG, saltG, diets[] } per 100 g edible part. */
export function readFineli(dir) {
  const names = new Map(rows(dir, 'foodname_FI.csv').map((r) => [Number(r.FOODID), r.FOODNAME]));
  const foods = new Map();
  for (const r of rows(dir, 'food.csv')) {
    const id = Number(r.FOODID);
    foods.set(id, { id, name: names.get(id) ?? r.FOODNAME, foodType: r.FOODTYPE, process: r.PROCESS, kJ: 0, proteinG: 0, carbsG: 0, fatG: 0, fiberG: 0, sugarG: 0, saltMg: 0, satFatG: 0, vitDUg: 0, vitCMg: 0, b12Ug: 0, folateUg: 0, ironMg: 0, calciumMg: 0, potassiumMg: 0, magnesiumMg: 0, zincMg: 0, diets: [] });
  }
  // Units as in Fineli: grams for FASAT, mg for VITC and the minerals, µg for VITD, VITB12 and FOL.
  const field = {
    ENERC: 'kJ', PROT: 'proteinG', CHOAVL: 'carbsG', FAT: 'fatG', FIBC: 'fiberG', SUGAR: 'sugarG', NACL: 'saltMg',
    FASAT: 'satFatG', VITD: 'vitDUg', VITC: 'vitCMg', VITB12: 'b12Ug', FOL: 'folateUg',
    FE: 'ironMg', CA: 'calciumMg', K: 'potassiumMg', MG: 'magnesiumMg', ZN: 'zincMg',
  };
  for (const r of rows(dir, 'component_value.csv')) {
    const key = field[r.EUFDNAME];
    const food = foods.get(Number(r.FOODID));
    if (key && food) food[key] = num(r.BESTLOC);
  }
  for (const r of rows(dir, 'specdiet.csv')) foods.get(Number(r.FOODID))?.diets.push(r.SPECDIET);
  const out = new Map();
  const r1 = (x) => Math.round(x * 10) / 10;
  for (const f of foods.values()) {
    out.set(f.id, {
      id: f.id,
      name: f.name,
      kcal: Math.round(f.kJ / 4.184),
      proteinG: r1(f.proteinG),
      carbsG: r1(f.carbsG),
      fatG: r1(f.fatG),
      fiberG: r1(f.fiberG),
      sugarG: r1(f.sugarG),
      saltG: Math.round(f.saltMg / 10) / 100,
      satFatG: r1(f.satFatG),
      vitDUg: r1(f.vitDUg),
      vitCMg: r1(f.vitCMg),
      b12Ug: r1(f.b12Ug),
      folateUg: r1(f.folateUg),
      ironMg: r1(f.ironMg),
      calciumMg: Math.round(f.calciumMg),
      potassiumMg: Math.round(f.potassiumMg),
      magnesiumMg: Math.round(f.magnesiumMg),
      zincMg: r1(f.zincMg),
      diets: f.diets.sort(),
    });
  }
  return out;
}
