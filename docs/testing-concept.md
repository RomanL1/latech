# Testkonzept

## Ziele

- Alle zentralen Funktionen der Applikation sollen korrekt funktionieren und den definierten Anforderungen entsprechen.
- Fehler und Schwachstellen sollen möglichst früh erkannt und behoben werden können.
- Die Applikation soll unter Last von mehreren simultanen Nutzer-Zugriffen stabil laufen und keine Systemfehler erzeugen.
- Integrationen mit Datenbanken, APIs oder anderen Systemen sollen erwartungsgemäss funktionieren.
- Regressionen zwischen Releases sollen früh erkannt und verhindert werden können.
- Teilbereiche des Systems sollen nicht durch Nutzer-Auswirkung kompromittiert werden.

## Umfang

### In Scope

- Kernfunktionalität einzelner Komponenten
- Integration zwischen einzelnen Komponenten
- Penetration Testing der LaTeX Render-Engine
- System unter hoher Last aussetzen
- Manuelle Verifikation des LaTeX Rendering
- Support für Chromium-basierte Browser

### Out of Scope

- Nutzung auf Mobilen Geräten
- Resilienz bei Ausfall einzelner Komponenten
- Support für nicht-Chromium-basierte Browser

## Testarten & Tools

Folgende Arten von Tests werden im System durchgeführt:

| Testart           | Zweck                                                                   | Eingesetzte Tools                               |
| ----------------- | ----------------------------------------------------------------------- | ----------------------------------------------- |
| Unit Tests        | Funktionalität isolierter <br>Einheiten testen                          | JUnit<br>vitest                                 |
| Integration Tests | Zusammenspiel mehrerer <br>Komponenten testen                           | JUnit<br>vitest<br>Playwright<br>Testcontainers |
| Last Tests        | Funktionalität des Systems <br>unter hoher Last testen                  | k6                                              |
| Penetration Tests | System auf mögliche<br>Angriffsvektoren absichern                       | JUnit<br>Playwright Testcontainers              |
| Visual Testing    | Korrektheit von visuell dargestellten <br>Funktionalitäten verifizieren |                                                 |

## Teststrategie

### Unit- & Integration Tests

Unit Tests sowie Integration Tests laufen als Teil der Continuous Integration in GitHub Actions. Diese werden ausgelöst bei

- Erstellung eines Pull Requests in den `main` Branch
- Commit in den `main` Branch

So sichern wir ab, dass bei Änderungen am Sourcecode keine Regression der vorhandenen Funktionalität auftritt.

### Last Tests

Um die Funktionalität unter Last von simultanen Nutzer-Zugriffen zu gewährleisten, können wir mittels [k6](https://k6.io/) künstliche Nutzer-Last über einen kurzen Zeitraum simulieren.

Über die Railway-Metriken können wir die Last auf CPU, Memory und schlussendlich Hosting-Kosten aufgrund der Last auswerten und beurteilen. Die Beurteilung erfolgt somit von Auge und kann nicht automatisiert werden.

Für Änderungen am selben Dokument kann schliesslich auch eine Aussage zur Konsistenz der erzeugten Daten gemacht werden.

Massnahmen für ausschlagende Last auf das System könnten sein:

- Erhöhung von Replikas einer Komponente (horizontale Skalierung)
- Einbau von Caching für zuvor erzeugte Ressourcen

### Penetration Tests

Mit Penetration Tests erhoffen wir uns, mögliche Angriffsvektoren durch etwa die LaTeX Render Engine Szenarien zu testen, welche potenziell zur Kompromittierung durch Nutzer-Input entstehen können. Wir möchten folgende Angriffsszenarien testen:

- Schreiben und Lesen des Filesystems
- Erzeugen von Prozessen
- Lesen von weitere Systemressourcen

Wir beziehen uns auf bekannte Sicherheits-Lücken von LaTeX Engines, welche aufgrund von Nutzer-Input nicht garantieren können, dass solche Zugriffe unmöglich sind.

Diese Tests sind nur teilweise automatisiert, da die Verifikation nur von Auge zu beurteilen ist.

### Visual Testing

Die Verifikation, ob der eingegebene LaTeX Code auch das korrekte Dokument rendert, erfolgt lediglich von Auge.

Hierfür werden vor-definierte Dokumente eingelesen, welche verschiedenste LaTeX-Funktionalitäten abdecken, so etwa:

- Mathematische Symbole
- Listen
- Abbildungen
- Text Formatierung
- Eigene definierte Makros

Von Auge wird dann ermittelt, ob diese Funktionalitäten korrekt dargestellt werden. Schliesslich werden die Resultate dokumentiert.

## Umgebungen

Automatisierte Tests als Bestandteil von Continuous Integration laufen isoliert in einer Linux-Umgebung von GitHub Actions. Das umfasst sowohl Unit-Tests als auch Integration-Tests. Für Integration Tests könnten zudem unter anderem Testcontainer hochgefahren werden.

Last-Tests laufen auf einer dedizierten Staging-Umgebung, welche auf Railway mittels Linux-basierten Containern verteilt wird.

Penetration Tests betreffen nur besonders kritische Teile des Systems in einer kontrollierten, isolierten Umgebung, etwa einer dedizierten Staging Umgebung.

Visual Tests werden auf einer dedizierten Staging-Umgebung durchgeführt.

## Testfälle

### Integration Tests

tbd

### Last Tests

Beispiele (to be challenged)

- 10 Nutzer, welche über 5 Minuten Schreib-Operationen an einem Dokument auslösen
- 100 Nutzer, welche über 5 Minute jeweils ein neues Dokument anlegen
- 100 Nutzer, welche über 5 Minuten jeweils an verschiedenen Dokumenten Schreib-Operationen auslösen
- 100 Nutzer, welche über 5 Minuten für verschiedene Dokumente Render-Anfragen in kurzen Abständen machen.

Last kann auch über Zeiträume schwankend simuliert werden.

### Penetration Tests

tbd

### Visual Tests

tbd
