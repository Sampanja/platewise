// Developer helper: node scripts/fineli/search.mjs <fineliDir> <word> [word…]
// Prints matching Fineli foods with id and macros, to pick `fineli` ids for ingredients.
import { readFineli } from './read-fineli.mjs';

const [dir, ...words] = process.argv.slice(2);
const foods = readFineli(dir);
for (const w of words) {
  const re = new RegExp(w, 'i');
  console.log(`# ${w}`);
  for (const f of foods.values()) {
    if (re.test(f.name)) console.log(`${f.id}\t${f.name}\t${f.kcal} kcal P${f.proteinG} C${f.carbsG} F${f.fatG}`);
  }
}
