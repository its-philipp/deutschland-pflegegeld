/**
 * Die Zahlen der Bundesland-Seiten gegen die vdek-Quelle nachrechnen.
 *
 * Jede der 16 Seiten trägt vier Aussagen, die nicht in der Quelle stehen,
 * sondern aus ihr folgen: den Eigenanteil im ersten Jahr, den
 * Bundesdurchschnitt, die Differenz mit Richtung („293 € mehr") und den Platz
 * unter den 16 Ländern. Eine falsche Zahl sieht dabei aus wie eine richtige —
 * niemand rechnet beim Lesen nach, und der Build kann es nicht.
 *
 * Der Prüfer liest die **gerenderten Sätze aus `dist/`** und rechnet sie aus
 * `src/data/sources/vdek-eigenanteile.json` nach. Er ruft den Seitencode nicht
 * auf; sonst würde er denselben Fehler zweimal machen und ihn bestätigen.
 *
 * DREI FALLSTRICKE, jeder davon hat beim Entwurf einen Fehlalarm erzeugt und
 * steht deshalb hier:
 *
 *  1. **Nicht selbst subtrahieren.** Die Regel „mit Zuschuss = ohne Zuschuss −
 *     Zuschuss" ergibt an 16 Stellen eine Abweichung von genau 1 €. Der vdek
 *     rundet Zuschuss und Ergebnis unabhängig voneinander; `_meta.validierung`
 *     im Datensatz hält das ausdrücklich fest und schreibt vor, die
 *     **veröffentlichten** Werte zu verwenden. Genau das tut die Seite, und
 *     genau daran misst dieser Prüfer.
 *  2. **Das Bundesland kommt aus dem Slug, nicht aus dem Text.** Jede Seite
 *     trägt eine Vergleichstabelle mit allen 16 Ländern; wer das Land aus dem
 *     Fließtext errät, erwischt das erste in der Tabelle.
 *  3. **Platz 1 ist das günstigste Land.** Die Seite schreibt das selbst hin.
 *     Absteigend sortiert liefert das Spiegelbild — 16 Abweichungen, alle
 *     falsch.
 *
 * Aufruf: npm run build && npm run check:zahlen
 */
import { readFileSync } from 'node:fs';

const quelle = JSON.parse(readFileSync('src/data/sources/vdek-eigenanteile.json', 'utf8'));
const roh = quelle.laender;
const laenderAlle = Array.isArray(roh) ? roh : Object.values(roh);
const bund = laenderAlle.find((l) => l.code === 'BUND');
const laender = laenderAlle.filter((l) => l.code !== 'BUND');

/** Der Wert, den die Seite als „im ersten Jahr" ausweist. */
const erstesJahr = (l) => l.eigenbeteiligung_mit_zuschuss.bis_12_monate;
const bundwert = erstesJahr(bund);

// Platz 1 = am günstigsten (Fallstrick 3).
const rang = new Map(
  [...laender].sort((a, b) => erstesJahr(a) - erstesJahr(b)).map((l, i) => [l.name, i + 1]),
);

const slug = (name) =>
  name
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const text = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ');
const zahl = (s) => Number(s.replace(/[^\d]/g, ''));

const fehler = [];
let seiten = 0;
let aussagen = 0;

for (const land of laender) {
  // Fallstrick 2: über den Slug, nicht über den Text.
  const datei = `dist/pflegeheim-kosten-${slug(land.name)}/index.html`;
  let t;
  try {
    t = text(readFileSync(datei, 'utf8'));
  } catch {
    fehler.push(`${land.name}: ${datei} fehlt`);
    continue;
  }
  seiten++;
  const soll = erstesJahr(land);

  const eig = t.match(/durchschnittlich ([\d.]+) € im Monat/);
  if (!eig) fehler.push(`${land.name}: kein Eigenanteil im Text gefunden`);
  else {
    aussagen++;
    if (zahl(eig[1]) !== soll) fehler.push(`${land.name}: Eigenanteil ${eig[1]} € auf der Seite, ${soll} € in der Quelle`);
  }

  const diff = t.match(/Das sind ([\d.]+) € (mehr|weniger) als im Bundesdurchschnitt \(([\d.]+) €\)/);
  if (diff) {
    aussagen += 2;
    if (zahl(diff[3]) !== bundwert) {
      fehler.push(`${land.name}: Bundesdurchschnitt ${diff[3]} € auf der Seite, ${bundwert} € in der Quelle`);
    }
    const richtung = soll > bundwert ? 'mehr' : 'weniger';
    if (zahl(diff[1]) !== Math.abs(soll - bundwert) || diff[2] !== richtung) {
      fehler.push(
        `${land.name}: „${diff[1]} € ${diff[2]}", gerechnet ${Math.abs(soll - bundwert)} € ${richtung}`,
      );
    }
  }

  const platz = t.match(/auf Platz (\d+) von 16/);
  if (platz) {
    aussagen++;
    if (Number(platz[1]) !== rang.get(land.name)) {
      fehler.push(`${land.name}: Platz ${platz[1]} auf der Seite, ${rang.get(land.name)} gerechnet`);
    }
  }
}

console.log(`${seiten} Bundesland-Seiten gelesen, ${aussagen} Aussagen nachgerechnet`);
if (fehler.length) {
  console.error(`\n${fehler.length} Abweichung(en):`);
  for (const f of fehler) console.error(`  ✗ ${f}`);
  process.exit(1);
}
console.log('Eigenanteil, Bundesdurchschnitt, Differenz und Platz stimmen überall mit der Quelle überein.');
