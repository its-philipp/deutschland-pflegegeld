# Deutschland Pflegegeld

Quellcode von [deutschland-pflegegeld.de](https://deutschland-pflegegeld.de) —
Orientierung bei Pflegegrad, Pflegegeld, Antrag und den Kosten eines
Pflegeheims.

## Warum der Code offen liegt

Wer hier landet, muss meist gleichzeitig etwas entscheiden und etwas
beantragen. Zwei Dinge auf dieser Seite sollten deshalb nachlesbar sein statt
geglaubt:

**Die Beträge.** Jede Zahl aus dem SGB XI steht an genau einer Stelle
(`src/data/leistungen.ts`), mit Fundstelle, URL und Abrufdatum. Kein Betrag
steht im Fließtext — eine Zahl in einer Seite veraltet still.

**Das Bewertungsmodell.** Die Pflegegrad-Selbsteinschätzung rechnet nach § 15
SGB XI mit Anlage 1 und 2. Das Modell enthält zwei Stellen, an denen andere
Rechner danebenliegen, und beide sind hier nachvollziehbar implementiert:

- **Modul 2 und Modul 3 werden nicht addiert.** § 15 Abs. 3 Satz 2 gibt beiden
  einen *gemeinsamen* gewichteten Punkt — den höheren der beiden. Wer addiert,
  liegt bis zu 15 Gesamtpunkte zu hoch; bei Grad-Grenzen alle rund 20 Punkte ist
  das leicht ein ganzer Pflegegrad.
- **Modul 5 ist nicht „je Kriterium eine Stufe".** Es besteht aus vier Blöcken,
  die zusammen höchstens 15 Punkte ergeben.

`npm run check:pflegegrad` prüft **169 Aussagen** gegen den erhobenen Datensatz
— keine Beispiele, sondern Invarianten. Die schärfste: alle Module auf Maximum
ergeben exakt 100 Gesamtpunkte. Sie fällt sofort, wenn ein Gewicht, eine
Bereichsgrenze oder die Modul-2/3-Regel falsch ist.

Außerdem: kein Backend, keine Datenbank, kein Analytics. Die Rechner laufen
vollständig im Browser, Schriften liegen im eigenen Bundle statt bei einem CDN.

## Was der Code nicht ist

Keine Pflegeberatung und keine Zusage über einen Pflegegrad. Die Einschätzung
ist Orientierung; entschieden wird nach einer Begutachtung durch den
Medizinischen Dienst und einen Bescheid der Pflegekasse.

Zwei Dinge kann der Rechner grundsätzlich nicht: § 15 Abs. 4 (besondere
Bedarfskonstellationen, die auch unter 90 Punkten zu Pflegegrad 5 führen) ist
eine pflegefachliche Entscheidung, keine Rechnung. Und bei Kindern wird mit
altersentsprechend entwickelten Kindern verglichen — was ein Formular nicht
abbilden kann.

## Fehler gefunden?

Ein falscher Betrag, eine geänderte Vorschrift, ein Rechenschritt, der nicht zu
Ihrem Gutachten passt: bitte melden — formlos an
kontakt@deutschland-pflegegeld.de.

## Lokal bauen

```bash
npm install
npm run check   # astro check + die 169 Aussagen zum Bewertungsmodell
npm run build
```

## Lizenz

MIT (siehe `LICENSE`). Die zitierten Rechtsvorschriften unterliegen ihren
eigenen Bedingungen; Normtexte stammen von
[gesetze-im-internet.de](https://www.gesetze-im-internet.de), die
Eigenanteil-Daten vom [vdek](https://www.vdek.com).
