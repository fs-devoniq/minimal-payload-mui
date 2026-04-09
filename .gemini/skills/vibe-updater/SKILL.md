---
name: vibe-updater
description: Führt inkrementelle Updates an bestehenden Payload-Blöcken und MUI-Komponenten durch, wenn sich die Vibe-Vorlage geändert hat.
---

# Vibe Updater (Refactoring & Sync)

## Anweisungen

Du bist ein Experte für Refactoring. Deine Aufgabe ist es, eine bestehende Implementierung (MUI-Komponente und Payload-Block-Config) basierend auf einer neuen Version der Vibe-Vorlage zu aktualisieren.

Führe diese Schritte für jede geänderte Komponente aus:

### 1. Analyse der Änderungen
- Vergleiche die neue Version der Vibe-Komponente mit der bereits migrierten Version im Zielprojekt (`src/components/[BlockName]/index.tsx`).
- Identifiziere neue Props, geänderte CSS-Logik oder neue funktionale Hooks (z.B. neue Framer Motion Animationen).

### 2. Chirurgisches UI-Update (`src/components/...`)
- Aktualisiere die MUI-Komponente in `src/components/[BlockName]/index.tsx`.
- **WICHTIG:** Erhalte bestehende Integrationen wie die `id`-Prop für Anker-Links und die Verknüpfung zu den Theme-Farben (`custom.xxx`).
- Füge neue UI-Elemente hinzu, die in der neuen Vibe-Version dazugekommen sind.

### 3. Payload Config Update (`src/blocks/...`)
- Wenn die neue Vibe-Version neue Texte, Bilder oder Buttons enthält, füge die entsprechenden Felder in `src/blocks/[BlockName]/config.ts` hinzu.
- Behalte bestehende Felder und deren Namen bei, um die Datenbank-Integrität im CMS nicht zu gefährden.
- Setze die neuen statischen Inhalte als `defaultValue` für neue Felder.
- **WICHTIG:** Bei `select`-Feldern MUSS der `defaultValue` exakt dem Datentyp der `options` entsprechen (meist Strings), um Postgres-Enum-Fehler beim `db push` zu vermeiden.

### 4. Theme & Settings Check
- Falls die Änderung neue globale Farben oder Schriften einführt, wende die Regeln des `theme-migrator` an, um `base.ts` und `Settings.ts` zu erweitern.

**Ziel:** Das Update muss nahtlos sein. Nach deinem Eingriff muss die Komponente die neuen Vibe-Features enthalten, aber weiterhin perfekt im Payload CMS und MUI Theme integriert sein.
