# Requirements
The following requirements were discussed with Ron Porath and Dieter Arnold on the 27th of February 2026.

- [Dokumentverwaltung](#dokumentverwaltung)
- [Editor](#editor)
- [Kollaboration](#kollaboration)
- [Preview](#preview)

## Dokumentverwaltung
- Dokumente können von einem User erstellt werden
- Dokumente können über die Eingabe der ID in der URL bearbeitet werden (`/document/12345)
- Zuletzt erstellte & geöffnete Dokumente sind auf dem Gerät ersichtlich
- Keine Authentisierung oder Autorisierung benötigt
- Dokument-Templates stehen zur Auswahl vor Erstellung eines Dokuments
- Passwort wird vom Autor bestimmt und muss von Bearbeitern eingegeben werden
- Optional:
	- Projekte bestehen aus mehreren Dokumenten
	- Authentication & Authorisation

## Editor
- Manuelle Eingabe von LaTeX möglich
- Einsetzen von LaTeX Templates in Form von Buttons möglich
	- Einfach: Bullet Point List generiert einfache `itemize` Liste mit einem Eintrag
	- Parametrisiert: Für Tables kann zuerst die Dimension (etwa 3x4) gewählt werden, aus welcher dann eine LaTeX Tabelle mit leeren Zellen generiert wird
	- Unterstützte Strukturen:
		- Gängige Mathematische Symbole (vgl. Wolfram Alpha oder Mathway) als Button-Grid
		- Listen (Bullet Point, Nummeriert)
		- Textstil (Bold, Cursive, Underlined, Subscript, Superscript, Strike-through)
		- Text Hierarchien (Normal, Heading, Sub-Heading)
		- Tabellen (Dimension wählbar; per Default mit Outline für alle Zellen)
- Grundlegendes Syntax Highlighting
	- Literals
	- Kontrollsequenz (`\text`, `\int`)
	- Argumente (`{123}`, `[456]`)
	- Mathematische Symbole (`+`, `-`)
	- Ungültige Tokens
	- Unterschiedlich für Text/Math Modes
- Zeilennummer auf der linken Seite des Editors
- Bilder (Storage & Rendering)


## Kollaboration
- Beliebig viele Bearbeiter können an einem Dokument arbeiten
- Cursor-Position der Bearbeiter sind im Editor ersichtlich mit zugewiesenen Farben und generierten Pseudo Namen (à la "Anonymous Wombat")
- Cursor-Position passt sich an, wenn ein weiterer User den vorhergehenden Text erweitert/verkürzt
- Gleichzeitiges Bearbeiten an verschiedenen Cursor-Positionen kann zusammengeführt werden
- Gleichzeitiges Bearbeiten an derselben Cursor-Position kann zusammengeführt werden
- Undo/Redo (löscht nur eigene Commits, nicht solche von anderen Bearbeitern)
- Optional
	- Versionshistorie visuell darstellen
	

## Preview
- Compile on Demand
- Es wird der letzte gültige Zustand gerendert. Ungültige Tokens werden somit nicht gerendert
- Download als PDF möglich
- Pending Changes
- Optional
	- Compile on change
