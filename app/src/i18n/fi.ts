/** Finnish UI strings. Placeholders use `{name}` and are filled with `format`. */
export const fi = {
  common: {
    priceEstimate: 'hinta-arvio',
    perServing: '/ annos',
    minutes: '{count} min',
    servings: '{count} annosta',
  },
  macros: {
    energy: 'energia',
    protein: 'proteiini',
    carbs: 'hiilihydr.',
    fat: 'rasva',
    a11yPerServing: '{value} {unit} {label} per annos',
  },
  recipe: {
    addToPlan: 'Lisää suunnitelmaan',
    addedToPlan: 'Lisätty suunnitelmaan',
    swap: 'Vaihda resepti',
    lunchTomorrow: 'Riittää huomisen lounaaksi',
    imageLabel: 'Annoskuva: {title}',
  },
  showcase: {
    overline: 'Tämän illan päivällinen',
    title: 'Hyvää ruokaa, selkeä lista',
    shoppingTitle: 'Ostoslista',
    shoppingHint: 'Napauta rivi, kun tuote on korissa.',
    budgetTitle: 'Viikon budjetti',
    budgetUsed: '{used} / {total}',
    budgetLeft: 'Jäljellä {amount}',
    listDone: 'Kaikki korissa!',
    shoppingProgress: '{done} / {total} korissa',
  },
} as const;

export type Strings = typeof fi;
