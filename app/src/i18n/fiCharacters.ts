import type { CharacterId } from '@/theme/characters';

/**
 * Each character's voice in Finnish. The same keys for every character, so
 * any screen can speak through whichever character the user picked. Rules
 * for every line (also checked in characterVoices.test.ts):
 * - Encourage habits; never comment on eating less, calories or weight.
 * - Notifications stay neutral and short.
 * - The chat intro always says the character is not a doctor.
 */
export type CharacterVoice = {
  name: string;
  /** What the character is, e.g. "punajuuri". */
  species: string;
  /** Genitive/elative forms used in UI sentences ("Kysy Nupulta"). */
  ablative: string;
  /** One-line summary in the picker. */
  tagline: string;
  /** Three personality traits shown as chips. */
  traits: readonly [string, string, string];
  /** Self-introduction while the user browses the picker. */
  intro: string;
  /** First words after the picker / in onboarding. */
  hello: string;
  greetings: {
    morning: string;
    day: string;
    evening: string;
    night: string;
    streak: string;
    loggedToday: string;
    waterDone: string;
    cookTonight: string;
    welcomeBack: string;
  };
  empty: {
    diary: string;
    search: string;
    favorites: string;
    plan: string;
    mine: string;
    shopping: string;
  };
  celebrate: {
    /** Said on any celebration. */
    cheer: string;
    achievement: string;
    level: string;
    water: string;
  };
  chat: {
    intro: string;
    thinking: string;
  };
  notify: {
    breakfast: string;
    lunch: string;
    dinner: string;
    snack: string;
    water: string;
  };
};

export const fiCharacters: Record<CharacterId, CharacterVoice> = {
  nuppu: {
    name: 'Nuppu',
    species: 'punajuuri',
    ablative: 'Nupulta',
    tagline: 'Lämmin ja huolehtiva punajuuri',
    traits: ['Lempeä', 'Huolehtiva', 'Vähän runollinen'],
    intro: 'Hei, olen Nuppu, punajuuri syvältä mullasta. Kuljen rinnallasi rauhassa: suunnitellaan hyvät päivälliset ja pidetään kirjaa ilman stressiä.',
    hello: 'Ihana, että valitsit minut! Tehdään arjen ruoasta helppoa ja hyvää – yhdessä.',
    greetings: {
      morning: 'Huomenta! Aamu on kuin tuore juurikas – täynnä hyvää. Mitä aamupalaksi?',
      day: 'Hei! Kiva nähdä sinua taas.',
      evening: 'Iltaa! Miten päiväsi on mennyt?',
      night: 'Myöhä jo. Hyvää yötä, kun on sen aika.',
      streak: 'Taas viikko täynnä kirjauksia. Olen sinusta ylpeä!',
      loggedToday: 'Hyvin kirjattu tänään. Jatketaan samaan malliin.',
      waterDone: 'Vesitavoite täynnä! Juuretkin kiittävät.',
      cookTonight: 'Tänään on kokkausilta. Resepti odottaa listalla.',
      welcomeBack: 'Ihana nähdä sinua taas! Aloitetaan siitä, mihin jäätiin.',
    },
    empty: {
      diary: 'Päivä on vielä tyhjä. Aloitetaanko vaikka aamupalasta?',
      search: 'Tällä haulla ei löytynyt mitään. Kokeillaanko toista sanaa?',
      favorites: 'Sydämellä merkityt reseptit kasvavat tänne kuin taimet.',
      plan: 'Tehdäänkö yhdessä ruokalista? Vastaa muutamaan kysymykseen.',
      mine: 'Omat ruokasi ja ateriasi säilyvät täällä hyvässä tallessa.',
      shopping: 'Ostoslista syntyy, kun hyväksyt ruokalistan.',
    },
    celebrate: {
      cheer: 'Voi miten hienoa!',
      achievement: 'Tämä ansaitsee halauksen. Hyvin tehty!',
      level: 'Kasvat kuin punajuuri hyvässä mullassa!',
      water: 'Vesitavoite täynnä – juuret kiittävät!',
    },
    chat: {
      intro: 'Hei, olen Nuppu! Kysy ruoasta, reseptivinkeistä tai kirjauksistasi. En ole lääkäri, mutta autan mielelläni arjen ruokapulmissa.',
      thinking: 'Nuppu miettii…',
    },
    notify: {
      breakfast: 'Hyvää huomenta! Muistatko kirjata aamupalan?',
      lunch: 'Lounasaika – kirjaa ateria, kun ehdit.',
      dinner: 'Mitä tänään syötiin? Päivällisen voi kirjata yhdellä napautuksella.',
      snack: 'Pieni muistutus: välipalan voi kirjata nopeasti.',
      water: 'Pieni vesitauko? Lasillinen tekee hyvää.',
    },
  },

  porkkis: {
    name: 'Porkkis',
    species: 'porkkana',
    ablative: 'Porkkikselta',
    tagline: 'Energinen porkkana ja tsemppari',
    traits: ['Energinen', 'Kannustava', 'Aina liikkeellä'],
    intro: 'Moi! Porkkis tässä, rapsakka porkkana täynnä virtaa! Mä tsemppaan sua joka päivä – pienet teot, isot fiilikset. Mennään!',
    hello: 'Jee, tiimi on kasassa! Mä huolehdin, että meininki pysyy hyvänä. Aloitetaan!',
    greetings: {
      morning: 'Huomenta, huippu! Tankataan aamupala ja lähdetään!',
      day: 'Moi taas! Hyvää vauhtia päivään?',
      evening: 'Iltaa! Kerro, mitä päivään mahtui!',
      night: 'Nyt lepoa! Huomenna taas täysillä.',
      streak: 'Viikon putki! Olet ihan liekeissä!',
      loggedToday: 'Kirjaukset rullaa! Juuri näin!',
      waterDone: 'Vesitavoite täynnä! High five!',
      cookTonight: 'Kokkausilta! Esiliina päälle ja menoksi!',
      welcomeBack: 'Hei, kiva kun tulit takaisin! Hypätään suoraan vauhtiin!',
    },
    empty: {
      diary: 'Tyhjä päivä = puhdas lähtöviiva! Lisätäänkö eka ruoka?',
      search: 'Ei osumia! Kokeillaan toista sanaa – kyllä se löytyy!',
      favorites: 'Merkkaa suosikit sydämellä, niin ne on tässä heti käsillä!',
      plan: 'Tehdään ruokalista! Pari kysymystä ja homma on hoidossa!',
      mine: 'Omat ruoat ja ateriat tänne – nopea lisäys ensi kerralla!',
      shopping: 'Hyväksy ruokalista, niin ostoslista on heti valmis!',
    },
    celebrate: {
      cheer: 'Jesss!',
      achievement: 'Uusi saavutus! Sä teit sen!',
      level: 'Tasonnousu! Kasvat kuin porkkana kesällä!',
      water: 'Vesitavoite täynnä! Täyttä virtaa!',
    },
    chat: {
      intro: 'Moi, Porkkis tässä! Kysy ruoasta, resepteistä tai kirjauksista. En ole lääkäri, mutta arjen ruokajutuissa autan täysillä!',
      thinking: 'Porkkis pohtii…',
    },
    notify: {
      breakfast: 'Huomenta! Aamupala kirjaan ja päivä käyntiin!',
      lunch: 'Lounastauko! Kirjaa ateria, kun ehdit.',
      dinner: 'Päivällinen syöty? Yksi napautus ja se on kirjattu!',
      snack: 'Välipala? Nopea kirjaus, niin pysyt kärryillä!',
      water: 'Vesitauko! Lasillinen ja jatketaan!',
    },
  },

  aava: {
    name: 'Aava',
    species: 'avokado',
    ablative: 'Aavalta',
    tagline: 'Rauhallinen ja tasapainoinen avokado',
    traits: ['Rauhallinen', 'Läsnä', 'Lempeä'],
    intro: 'Hei. Olen Aava, avokado, ja minulla on aina aikaa. Hengitetään hetki. Syödään hyvin, kuunnellaan kehoa ja edetään omaan tahtiin.',
    hello: 'Kiitos, että valitsit minut. Otetaan rauhallisesti – pieni hyvä teko riittää tänäänkin.',
    greetings: {
      morning: 'Hyvää huomenta. Aloitetaan päivä rauhassa ja hyvällä aamupalalla.',
      day: 'Hei. Muista pysähtyä hetkeksi tänään.',
      evening: 'Hyvää iltaa. Miltä päivä tuntui?',
      night: 'Ilta on hiljentynyt. Lepää hyvin.',
      streak: 'Viikko tasaista kirjaamista. Tämä on tasapainoa.',
      loggedToday: 'Kirjasit päivän ruoat. Hienoa huomaavaisuutta.',
      waterDone: 'Vesitavoite täynnä. Kehosi kiittää.',
      cookTonight: 'Tänään kokataan. Nautitaan valmistamisesta.',
      welcomeBack: 'Tervetuloa takaisin. Jatketaan siitä, mihin jäätiin – ilman kiirettä.',
    },
    empty: {
      diary: 'Päivä on vielä tyhjä. Lisää ensimmäinen ruoka, kun on sopiva hetki.',
      search: 'Tällä haulla ei löytynyt mitään. Kokeile toista sanaa.',
      favorites: 'Kun jokin resepti ilahduttaa, merkitse se sydämellä. Se odottaa täällä.',
      plan: 'Tehdään ruokalista rauhassa. Muutama kysymys riittää.',
      mine: 'Omat ruokasi ja ateriasi kokoontuvat tänne.',
      shopping: 'Ostoslista syntyy, kun hyväksyt ruokalistan.',
    },
    celebrate: {
      cheer: 'Ihanaa.',
      achievement: 'Uusi saavutus. Pysähdy hetkeksi iloitsemaan.',
      level: 'Uusi taso. Kasvu on tapahtunut hiljaa ja varmasti.',
      water: 'Vesitavoite täynnä. Kehosi kiittää.',
    },
    chat: {
      intro: 'Hei, olen Aava. Kysy ruoasta, resepteistä tai kirjauksistasi. En ole lääkäri, mutta pohdin kanssasi mielelläni arjen ruokakysymyksiä.',
      thinking: 'Aava miettii rauhassa…',
    },
    notify: {
      breakfast: 'Hyvää huomenta. Muistathan kirjata aamupalan.',
      lunch: 'Lounashetki. Kirjaa ateria, kun ehdit.',
      dinner: 'Ilta on tullut. Päivällisen voi kirjata yhdellä napautuksella.',
      snack: 'Pieni muistutus: välipalan kirjaaminen käy nopeasti.',
      water: 'Hetki itsellesi: lasillinen vettä.',
    },
  },

  tomppa: {
    name: 'Tomppa',
    species: 'tomaatti',
    ablative: 'Tompalta',
    tagline: 'Intohimoinen kotikokki-tomaatti',
    traits: ['Intohimoinen', 'Hauska', 'Ruokahullu'],
    intro: 'Tervehdys, olen Tomppa! Tomaatti, jonka sydän sykkii hyvälle ruoalle. Valkosipulia, basilikaa ja kunnon kastiketta – tehdään arjesta herkullista!',
    hello: 'Bravo, valitsit kokin! Lupaan, että arkiruoasta tulee juhlaa.',
    greetings: {
      morning: 'Huomenta! Hyvä aamupala on päivän alkupala!',
      day: 'Hei! Mitä hyvää tänään syödään?',
      evening: 'Iltaa! Tuoksuuko keittiössä jo jokin herkullinen?',
      night: 'Keittiö kiinni tältä päivältä. Hyvää yötä!',
      streak: 'Viikon putki! Tätä kutsun mestarikokin otteeksi!',
      loggedToday: 'Kirjaukset kunnossa – kuin hyvin maustettu kastike!',
      waterDone: 'Vesitavoite täynnä! Tomaatti tietää, vesi on tärkeää!',
      cookTonight: 'Kokkausilta! Lämmitä pannu – tänään tehdään taikoja!',
      welcomeBack: 'Kas, tuttu kokki palasi keittiöön! Tervetuloa!',
    },
    empty: {
      diary: 'Lautanen on tyhjä! Mitä tänään syötiin?',
      search: 'Ei löytynyt! Vaihdetaan mausteita – kokeile toista sanaa.',
      favorites: 'Sydämellä merkityt herkut odottavat täällä!',
      plan: 'Tehdään menu! Pari kysymystä, ja keittiö on valmis.',
      mine: 'Omat reseptit ja ateriat – kotikokin aarrearkku!',
      shopping: 'Hyväksy ruokalista, niin teen ostoslistan!',
    },
    celebrate: {
      cheer: 'Bravo!',
      achievement: 'Uusi saavutus! Kokki ansaitsee aplodit!',
      level: 'Uusi taso! Keittiöön syntyi uusi tähti!',
      water: 'Vesitavoite täynnä! Mehukasta!',
    },
    chat: {
      intro: 'Hei, Tomppa täällä! Kysy resepteistä, ruoasta tai kirjauksistasi. En ole lääkäri, mutta keittiöasioissa olen intohimoinen apuri!',
      thinking: 'Tomppa hämmentää ajatuksia…',
    },
    notify: {
      breakfast: 'Huomenta! Kirjaa aamupala, niin päivä alkaa maukkaasti.',
      lunch: 'Lounasaika! Kirjaa ateria, kun ehdit.',
      dinner: 'Mitä pöytään katettiin? Kirjaa päivällinen yhdellä napautuksella.',
      snack: 'Välipala-aika? Kirjaus käy nopeasti.',
      water: 'Lasillinen vettä, kokki!',
    },
  },

  mustis: {
    name: 'Mustis',
    species: 'mustikka',
    ablative: 'Mustikselta',
    tagline: 'Utelias ja viisas metsän mustikka',
    traits: ['Utelias', 'Tietäväinen', 'Rauhallinen'],
    intro: 'Hei, olen Mustis, mustikka suomalaisesta metsästä. Rakastan pieniä faktoja ja hyviä kysymyksiä. Opitaan yhdessä, mikä sinulle toimii.',
    hello: 'Mainio valinta! Tiesitkö, että pienistä tavoista kasvaa isoja muutoksia? Aloitetaan.',
    greetings: {
      morning: 'Huomenta! Aamupala antaa päivälle hyvän pohjan.',
      day: 'Hei! Mitä tänään oppisimme ruoasta?',
      evening: 'Iltaa! Kerätäänkö päivän havainnot talteen?',
      night: 'Metsä nukkuu jo. Hyvää yötä!',
      streak: 'Seitsemän päivän putki. Tilastollisesti erinomaista!',
      loggedToday: 'Hyvät merkinnät tänään. Data kiittää!',
      waterDone: 'Vesitavoite täynnä. Mustikkakin on lähes 85 % vettä!',
      cookTonight: 'Tänään kokataan. Resepti on valmiina listalla.',
      welcomeBack: 'Tervetuloa takaisin! Tauot kuuluvat elämään.',
    },
    empty: {
      diary: 'Ei vielä merkintöjä. Ensimmäinen havainto voisi olla aamupala.',
      search: 'Hmm, ei osumia. Kokeile toista sanaa tai lyhyempää hakua.',
      favorites: 'Kun merkitset reseptin sydämellä, kerään sen tänne.',
      plan: 'Tehdään ruokalista. Muutama kysymys, ja suunnitelma on valmis.',
      mine: 'Omat ruokasi ja ateriasi tallentuvat tähän kokoelmaan.',
      shopping: 'Ostoslista syntyy, kun hyväksyt ruokalistan.',
    },
    celebrate: {
      cheer: 'Erinomaista!',
      achievement: 'Uusi saavutus kirjattu tutkimuspäiväkirjaan!',
      level: 'Uusi taso. Tietoa ja taitoa kertyy!',
      water: 'Vesitavoite täynnä. Hyvä havainto!',
    },
    chat: {
      intro: 'Hei, olen Mustis! Kysy ruoasta, ravintoaineista tai kirjauksistasi. En ole lääkäri, mutta kerron mielelläni, mitä tiedän.',
      thinking: 'Mustis tutkii asiaa…',
    },
    notify: {
      breakfast: 'Huomenta! Muistatko kirjata aamupalan?',
      lunch: 'Lounasaika. Kirjaa ateria, kun ehdit.',
      dinner: 'Päivällinen syöty? Kirjaus käy yhdellä napautuksella.',
      snack: 'Välipalan voi kirjata nopeasti.',
      water: 'Vesihetki: lasillinen nyt?',
    },
  },

  sitru: {
    name: 'Sitru',
    species: 'sitruuna',
    ablative: 'Sitrulta',
    tagline: 'Pirteä ja sanavalmis sitruuna',
    traits: ['Pirteä', 'Nokkela', 'Raikas'],
    intro: 'Hei, Sitru täällä! Olen sitruuna, mutta en ole hapan – lupaan! Tuon päivään raikkautta, vitsejä ja helppoja ruokaideoita.',
    hello: 'Sitruunamehua ja hymyä – tästä tulee raikas yhteistyö!',
    greetings: {
      morning: 'Huomenta, aurinkoinen! Puristetaan päivästä paras irti!',
      day: 'Hei! Raikasta päivää!',
      evening: 'Iltaa! Kerro, mitä kivaa tänään tapahtui.',
      night: 'Myöhäistä jo. Kuori itsesi peiton alle!',
      streak: 'Viikon putki! Ihan sitruunan keltaista kultaa!',
      loggedToday: 'Kirjaukset tehty! Zest-pisteet sinulle!',
      waterDone: 'Vesitavoite täynnä! Lisää siivu sitruunaa juhlan kunniaksi!',
      cookTonight: 'Kokkausilta! Puristetaan maku esiin!',
      welcomeBack: 'Kappas, tuttu naama! Raikasta, että palasit!',
    },
    empty: {
      diary: 'Päivä on tyhjä kuin puristettu sitruuna. Lisätäänkö jotain?',
      search: 'Ei osumia! Kokeillaan toisella sanalla.',
      favorites: 'Sydämellä merkityt herkut kerääntyvät tänne!',
      plan: 'Tehdään ruokalista! Pari kysymystä ja valmista.',
      mine: 'Omat ruoat ja ateriat – oma pieni hedelmätarha!',
      shopping: 'Hyväksy ruokalista, niin ostoslista ponnahtaa esiin!',
    },
    celebrate: {
      cheer: 'Mahtavaa!',
      achievement: 'Uusi saavutus! Ihan sitruunan raikas suoritus!',
      level: 'Uusi taso! Kypsyt kuin sitruuna auringossa!',
      water: 'Vesitavoite täynnä! Raikasta!',
    },
    chat: {
      intro: 'Hei, olen Sitru! Kysy ruoasta, resepteistä tai kirjauksistasi. En ole lääkäri, mutta raikkaita ruokaideoita löytyy!',
      thinking: 'Sitru puristaa vastausta…',
    },
    notify: {
      breakfast: 'Huomenta! Aamupala kirjaan, niin päivä on raikas.',
      lunch: 'Lounasaika! Kirjaa ateria, kun ehdit.',
      dinner: 'Päivällinen syöty? Yksi napautus riittää.',
      snack: 'Välipala? Nopea kirjaus!',
      water: 'Raikas muistutus: lasillinen vettä!',
    },
  },

  kanttu: {
    name: 'Kanttu',
    species: 'kantarelli',
    ablative: 'Kantulta',
    tagline: 'Kiireetön metsäretkeilijä-kantarelli',
    traits: ['Kiireetön', 'Luontoihminen', 'Sesongin tuntija'],
    intro: 'No terve! Kanttu olen, kantarelli kuusikon reunalta. Tiedän, milloin mikin on parhaimmillaan. Otetaan iisisti ja syödään sesongin mukaan.',
    hello: 'Hyvä valinta, ystävä. Kuljetaan tämä polku yhdessä, kiirettä pitämättä.',
    greetings: {
      morning: 'Huomenta! Aamu on parasta aikaa metsässä ja keittiössä.',
      day: 'Päivää! Mitäs sinne kuuluu?',
      evening: 'Iltaa! Joko päivän retki on takana?',
      night: 'Jo on myöhä. Metsäkin nukkuu – nukutaan mekin.',
      streak: 'Viikon putki! Kuin kantarelleja kuusikossa: lisää vaan löytyy.',
      loggedToday: 'Kirjaukset tehty. Hyvin se menee.',
      waterDone: 'Vesitavoite täynnä. Kuin sateen jälkeen metsässä!',
      cookTonight: 'Tänään kokataan. Pannu kuumaksi, ei hätäillä.',
      welcomeBack: 'No kas, tervetuloa takaisin! Polku odotti.',
    },
    empty: {
      diary: 'Kori on vielä tyhjä. Mitäs tänään on syöty?',
      search: 'Ei löytynyt tältä mättäältä. Kokeillaan toista sanaa.',
      favorites: 'Kun löydät mieleisen reseptin, merkitse se sydämellä. Säilötään tänne.',
      plan: 'Tehdäänkö ruokalista? Pari kysymystä vain.',
      mine: 'Omat ruoat ja ateriat – kuin omat sienipaikat.',
      shopping: 'Ostoslista syntyy, kun hyväksyt ruokalistan.',
    },
    celebrate: {
      cheer: 'No niin!',
      achievement: 'Uusi saavutus! Kultainen löytö.',
      level: 'Uusi taso! Kasvat kuin sieni sateella.',
      water: 'Vesitavoite täynnä. Raikasta kuin metsälähde.',
    },
    chat: {
      intro: 'Terve, Kanttu tässä! Kysy ruoasta, sesongista tai kirjauksistasi. En ole lääkäri, mutta arjen ruokajutuissa autan mielelläni.',
      thinking: 'Kanttu tuumii…',
    },
    notify: {
      breakfast: 'Huomenta! Muistatko kirjata aamupalan?',
      lunch: 'Lounasaika. Kirjaa ateria, kun ehdit.',
      dinner: 'Päivällinen syöty? Kirjaus käy yhdellä napautuksella.',
      snack: 'Välipalan voi kirjata nopeasti.',
      water: 'Vesitauko, ystävä.',
    },
  },

  ruis: {
    name: 'Ruis',
    species: 'ruisleipä',
    ablative: 'Ruikselta',
    tagline: 'Sisukas ja perinteinen ruisleipä',
    traits: ['Sisukas', 'Jämpti', 'Kuiva huumori'],
    intro: 'Päivää. Ruis. Ruisleipä. En puhu paljon, mutta pidän sanani. Syödään kunnolla, tehdään suunnitelma ja pidetään siitä kiinni.',
    hello: 'Hyvä. Sovittu. Tästä lähdetään.',
    greetings: {
      morning: 'Huomenta. Aamupala ensin, sitten muut asiat.',
      day: 'Päivää. Hyvin menee.',
      evening: 'Iltaa. Päivä tuli tehtyä.',
      night: 'Myöhä on. Nukkumaan.',
      streak: 'Viikon putki. Sisua on.',
      loggedToday: 'Kirjattu. Ei siitä sen enempää – hyvä.',
      waterDone: 'Vesi juotu. Asiallista.',
      cookTonight: 'Tänään kokataan. Resepti on listalla.',
      welcomeBack: 'Kas. Takaisin ollaan. Jatketaan.',
    },
    empty: {
      diary: 'Tyhjää. Kirjataan jotain.',
      search: 'Ei löytynyt. Toinen sana.',
      favorites: 'Merkitse hyvät reseptit sydämellä. Ne pysyvät tässä.',
      plan: 'Ruokalista tekemättä. Muutama kysymys, niin hoidetaan.',
      mine: 'Omat ruoat ja ateriat tänne. Kätevää.',
      shopping: 'Hyväksy ruokalista ensin. Lista tulee siitä.',
    },
    celebrate: {
      cheer: 'Hyvä.',
      achievement: 'Saavutus. Ansaittu.',
      level: 'Taso nousi. Ruiskin kohoaa aikanaan.',
      water: 'Vesitavoite täynnä. Hyvä.',
    },
    chat: {
      intro: 'Ruis. Kysy ruoasta, resepteistä tai kirjauksista. En ole lääkäri. Arjen ruokajutuissa autan.',
      thinking: 'Ruis miettii…',
    },
    notify: {
      breakfast: 'Huomenta. Aamupala kirjaan.',
      lunch: 'Lounas. Kirjaa, kun ehdit.',
      dinner: 'Päivällinen. Yksi napautus.',
      snack: 'Välipala? Kirjaa se.',
      water: 'Vettä. Lasillinen.',
    },
  },
};
