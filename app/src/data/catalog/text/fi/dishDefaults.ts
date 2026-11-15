import type { DishDefaults } from '../types';

/**
 * Default storage and reheating advice per dish type. A recipe overrides them
 * when it needs something else (e.g. a salad with fish, a crispy oven dish).
 */
export const FI_DISH_DEFAULTS: DishDefaults = {
  storage: {
    soup: 'Jäähdytä nopeasti ja säilytä kannellisessa rasiassa jääkaapissa 2–3 päivää. Keiton voi pakastaa annoksina 3 kuukaudeksi.',
    stew: 'Jäähdytä nopeasti ja säilytä kannellisessa rasiassa jääkaapissa 3 päivää. Pata pakastuu hyvin 3 kuukaudeksi.',
    pasta: 'Säilytä jääkaapissa kannellisessa rasiassa 2 päivää.',
    rice: 'Jäähdytä riisi nopeasti ja säilytä jääkaapissa enintään 1–2 päivää.',
    potato: 'Säilytä jääkaapissa kannellisessa rasiassa 2 päivää.',
    oven: 'Säilytä jääkaapissa kannellisessa rasiassa 2–3 päivää.',
    casserole: 'Säilytä vuoassa kelmulla peitettynä jääkaapissa 3 päivää. Laatikko pakastuu hyvin annospaloina.',
    stir_fry: 'Paras heti. Säilytä tähteet jääkaapissa 1–2 päivää.',
    salad: 'Paras heti. Säilytä kastike erikseen; valmis salaatti säilyy jääkaapissa 1 päivän.',
    bowl: 'Säilytä osat erikseen jääkaapissa 2 päivää ja kokoa kulho vasta syödessä.',
    wrap: 'Säilytä täyte ja leivät erikseen jääkaapissa 2 päivää.',
    patty: 'Säilytä kypsät pihvit tai pyörykät jääkaapissa 2–3 päivää. Ne pakastuvat hyvin.',
    pie: 'Säilytä jääkaapissa kelmulla peitettynä 2–3 päivää. Piiras pakastuu paloina.',
    porridge: 'Säilytä jääkaapissa kannellisessa rasiassa 2 päivää.',
    egg: 'Paras heti. Säilytä tähteet jääkaapissa enintään 1 päivä.',
    sandwich: 'Paras heti. Eväänä säilytä jääkaapissa ja syö samana päivänä.',
    pancake: 'Säilytä jäähtyneet letut tai pannukakku jääkaapissa 2 päivää. Ne pakastuvat hyvin.',
    smoothie: 'Paras heti. Säilytä suljetussa pullossa jääkaapissa enintään 1 päivä ja ravista ennen juomista.',
    snack: 'Säilytä jääkaapissa kannellisessa rasiassa 2–3 päivää.',
    other: 'Säilytä jääkaapissa kannellisessa rasiassa 2 päivää.',
  },
  reheating: {
    soup: 'Kuumenna kattilassa sekoitellen kiehuvaksi. Lisää tilkka vettä, jos keitto on paksuuntunut.',
    stew: 'Kuumenna kattilassa miedolla lämmöllä sekoitellen tai mikrossa kannen alla, kunnes kauttaaltaan kuuma.',
    pasta: 'Kuumenna pannulla tilkan vettä kanssa tai mikrossa kannen alla sekoittaen välillä.',
    rice: 'Kuumenna mikrossa kannen alla tai pannulla, kunnes riisi on kauttaaltaan höyryävän kuumaa.',
    potato: 'Kuumenna mikrossa kannen alla tai uunissa 175 asteessa noin 15 minuuttia.',
    oven: 'Kuumenna uunissa 175 asteessa 10–15 minuuttia, niin pinta pysyy rapeana. Mikro käy kiireessä.',
    casserole: 'Kuumenna peitettynä uunissa 175 asteessa 20–25 minuuttia tai annos mikrossa.',
    stir_fry: 'Kuumenna kuumalla pannulla nopeasti sekoitellen.',
    salad: 'Tarjoa kylmänä. Lämpimät osat voi kuumentaa erikseen pannulla.',
    bowl: 'Kuumenna lämpimät osat mikrossa tai pannulla ja lisää kylmät osat vasta sitten.',
    wrap: 'Kuumenna täyte pannulla ja lämmitä leivät kuivalla pannulla juuri ennen syömistä.',
    patty: 'Kuumenna pannulla tai uunissa 175 asteessa noin 10 minuuttia.',
    pie: 'Kuumenna uunissa 175 asteessa noin 15 minuuttia, niin pohja pysyy rapeana.',
    porridge: 'Lisää tilkka maitoa tai vettä ja kuumenna kattilassa tai mikrossa sekoittaen.',
    egg: 'Kuumenna miedolla lämmöllä pannulla tai lyhyesti mikrossa.',
    sandwich: 'Tarjoa sellaisenaan. Lämpimän leivän voi lämmittää pannulla tai uunissa.',
    pancake: 'Lämmitä pannulla, mikrossa tai uunissa 175 asteessa noin 5 minuuttia.',
    smoothie: 'Ei lämmitetä. Ravista tai sekoita ennen juomista.',
    snack: 'Tarjoa sellaisenaan.',
    other: 'Kuumenna pannulla tai mikrossa kunnes kauttaaltaan kuuma.',
  },
};
