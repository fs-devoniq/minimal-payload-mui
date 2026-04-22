# Datenschutzerklärung – Technische Datenerfassung (Entwickler-Vorlage)

> Zweck: Diese Liste dient zur Erfassung aller technisch relevanten Datenverarbeitungen für die Erstellung einer DSGVO-konformen Datenschutzerklärung.
> Hinweis: Keine Rechtsberatung – nur technische Fakten dokumentieren.

---

## Projektinformationen

- **Projektname:**
- **Kunde / Firma:**
- **Domain:**
- **Projektverantwortlicher (Dev):**
- **Datum:**

---

## Hosting & Infrastruktur

- **Hosting-Anbieter:** IONOS
- **Serverstandort (Land / Region):** Deutschland (Berlin)
- **Servertyp:** VPS
- **CDN im Einsatz:** Nein

### Logfiles

- **Erhobene Daten:**
  - [x] IP-Adresse
  - [x] Datum / Uhrzeit
  - [x] Aufgerufene URL
  - [x] Referrer
  - [x] User-Agent
  - [ ] Sonstiges:

- **Speicherdauer der Logs:** 4 Wochen
- **Zugriff auf Logs:** Der Zugriff auf Server-Logdaten ist auf berechtigte Administratoren beschränkt. Der Zugriff erfolgt ausschließlich über gesicherte Authentifizierungsverfahren. Eine Weitergabe der Logdaten an Dritte findet nicht statt, sofern keine gesetzliche Verpflichtung besteht.

### Backups

- **Backup-Anbieter / Ort:**
- **Backup-Intervall:**
- **Aufbewahrungsdauer:**
- **Verschlüsselung:** (Ja / Nein)

---

## Externe Dienste & Drittanbieter

> Liste alle Dienste, die Daten an externe Server senden (CDN, Fonts, Analytics, Zahlungsdienste, APIs, etc.)

| Dienst | Anbieter | Zweck | Datenarten | Serverland | Cookies | Consent nötig |
| ------ | -------- | ----- | ---------- | ---------- | ------- | ------------- |
|        |          |       |            |            |         |               |
|        |          |       |            |            |         |               |

---

## Formulare & Dateneingaben

> Jedes Formular separat erfassen.

| Formularname | Felder | Pflichtfelder | Speicherung | Übertragung | Empfänger |
| ------------ | ------ | ------------- | ----------- | ----------- | --------- |
|              |        |               |             |             |           |
|              |        |               |             |             |           |

Zusätzliche Hinweise:

- Spam-Schutz (Captcha, Honeypot, etc.):
- Logging der Formularzugriffe:

---

## Cookies, LocalStorage & SessionStorage

> Auch technisch notwendige Cookies erfassen.

| Name | Typ                   | Zweck | Laufzeit | Anbieter | Notwendig | Consent nötig |
| ---- | --------------------- | ----- | -------- | -------- | --------- | ------------- |
|      | Cookie / LocalStorage |       |          |          |           |               |
|      |                       |       |          |          |           |               |

---

## Tracking & Analyse

- **Tracking im Einsatz:** (Ja / Nein)
- **Tool(s):**
- **IP-Anonymisierung:** (Ja / Nein)
- **Cookielos möglich:** (Ja / Nein)
- **Consent-Management:** (Tool / Eigenlösung)
- **Skripte erst nach Zustimmung geladen:** (Ja / Nein)

---

## Benutzerkonten / Authentifizierung

- **Login vorhanden:** (Ja / Nein)
- **Gespeicherte Daten:**
- **Passwort-Hashing:** (Algorithmus)
- **Session-Verwaltung:**
- **2FA:** (Ja / Nein)
- **Account-Löschung möglich:** (Ja / Nein)

---

## Zahlungsabwicklung (falls vorhanden)

- **Zahlungsanbieter:**
- **Verarbeitete Daten:**
- **Weiterleitung / iFrame / API:**
- **Speicherung eigener Zahlungsdaten:** (Ja / Nein)

---

## Newsletter / Marketing (falls vorhanden)

- **Tool:**
- **Double-Opt-in:** (Ja / Nein)
- **Gespeicherte Daten:**
- **Abmeldung möglich:** (Ja / Nein)

---

## Sicherheitsmaßnahmen (technisch)

- **HTTPS / TLS:** Ja
- **Firewall / WAF:** Keine lokale Host-Firewall (UFW inaktiv). Netzwerkzugriff erfolgt über Docker-iptables-Regeln und Provider-Firewall (IONOS). Keine separate Web Application Firewall (WAF) im Einsatz.
- **Rate-Limiting:** Kein explizites Rate-Limiting oder Brute-Force-Schutz konfiguriert.
- **Backups:** Automatische Snapshots durch Hostinganbieter (IONOS). Keine lokalen oder separaten Offsite-Backups konfiguriert.
- **Monitoring:** System- und Service-Monitoring via Prometheus und Node Exporter. Zugriff nur administrativ.

---

## Sonstige Datenverarbeitung

> Alles, was oben nicht abgedeckt ist.

-
-
- ***

## Übergabe an Kunde / Datenschutz

- **Dokument übergeben am:**
- **Empfänger:**
- **Hinweis:** Rechtliche Prüfung durch Kunde / Anwalt erforderlich.
