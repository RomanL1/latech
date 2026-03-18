# PDF Preview POC

## Überblick

Diese Branch enthält einen kleinen Proof of Concept für die Darstellung eines festen PDF-Dokuments innerhalb einer React-/Vite-Anwendung.

Ziel war es, eine einfache Vorschauseite zu erstellen, auf der:

* links statischer HTML-Inhalt angezeigt wird
* rechts eine PDF-Vorschau gerendert wird
* ein festes Testdokument aus dem Projekt geladen wird
* die Lösung lokal in der Entwicklungsumgebung getestet werden kann

## Umgesetzte Änderungen

Folgende Punkte wurden in dieser Branch umgesetzt:

### 1. Vorschauseite erstellt

Es wurde eine neue Seite für die PDF-Vorschau angelegt.

* `src/pages/preview/PreviewPage.tsx`

Diese Seite verwendet ein zweispaltiges Layout:

* linke Seite: HTML-/React-Inhalt
* rechte Seite: PDF-Rendering über PDF.js

### 2. PDF.js integriert

Für das Rendern des PDF-Dokuments wurde `pdfjs-dist` eingebunden.

Verwendet wird:

* `pdfjs-dist`
* `pdf.worker.mjs`

Der Worker wird explizit gesetzt, damit PDF.js korrekt in der Vite-Umgebung funktioniert.

### 3. Statisches PDF eingebunden

Das PDF wird als feste Datei aus dem Projekt geladen.

Empfohlener Speicherort:

* `public/docs/test.pdf`

Dadurch kann das Dokument direkt über folgenden Pfad geladen werden:

* `/docs/test.pdf`

### 4. Layout für den POC aufgebaut

Die Vorschauseite verwendet ein einfaches Grid-Layout mit zwei Spalten:

* links erläuternder Inhalt
* rechts PDF-Canvas

Damit lässt sich die Darstellung eines Dokuments neben zusätzlichem Text oder UI-Elementen gut testen.

## Projektstruktur

Eine mögliche Struktur sieht so aus:

```text
frontend/
  public/
    docs/
      test.pdf
  src/
    pages/
      preview/
        PreviewPage.tsx
```

## Verwendete Technologien

* React
* Vite
* TypeScript
* PDF.js (`pdfjs-dist`)
* Bun als bevorzugter Package Manager

## Installation und Start

Da das Projekt bereits auf Bun ausgelegt ist, sollte vorzugsweise Bun verwendet werden.

### Abhängigkeiten installieren

```bash
bun install
```

### Entwicklungsserver starten

```bash
bun run dev
```

Danach kann die Anwendung lokal im Browser geöffnet werden.

* `http://localhost:xxxx/preview`

## Beispielimplementierung

Die Vorschauseite lädt das PDF aus `public/docs/test.pdf` und rendert die erste Seite in ein Canvas.

Wichtige Punkte der Implementierung:

* `pdfjsLib.getDocument("/docs/test.pdf")`
* explizite Konfiguration des PDF-Workers
* Rendering auf ein `canvas`
* weisser Hintergrund für bessere Lesbarkeit
* Schutz vor globalen CSS-Effekten wie `filter` oder `transform`

## Bekannte Probleme

### Darstellung des PDF war zunächst invertiert

Während der Entwicklung wurde festgestellt, dass das PDF in der Vorschau teilweise dunkel oder gespiegelt dargestellt wurde.
Ursache waren sehr wahrscheinlich globale CSS-Regeln, die auf `canvas` oder übergeordnete Container angewendet wurden.

Zur Absicherung wurden folgende Massnahmen getroffen:

* `background: "#fff"`
* `filter: "none"`
* `transform: "none"`
