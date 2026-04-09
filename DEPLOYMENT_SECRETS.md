# Deployment Secrets Guide

Diese Anleitung beschreibt die GitHub Secrets, die für das vollautomatisierte Deployment dieses Projekts in einen Docker Swarm benötigt werden.

## Einrichtung

Gehe in deinem GitHub Repository zu:
**Settings** > **Secrets and variables** > **Actions** > **New repository secret**

## Erforderliche Secrets

| Secret Name | Beschreibung | Beispielwert |
| :--- | :--- | :--- |
| `DEPLOY_HOST` | Die IP-Adresse oder Domain deines Docker Swarm Managers. | `87.106.232.205` |
| `DEPLOY_USER` | Der SSH-Benutzername für den Zugriff auf den Server. | `deploy` |
| `DEPLOY_SSH_PRIVATE_KEY` | Dein privater SSH-Schlüssel (muss auf dem Server in `authorized_keys` hinterlegt sein). | `-----BEGIN OPENSSH PRIVATE KEY----- ...` |
| `DOCKER_PULL_USERNAME` | Dein GitHub Benutzername (für den Zugriff auf ghcr.io). | `dein-github-name` |
| `DOCKER_PULL_SECRET` | Ein GitHub Personal Access Token (PAT) mit `read:packages` Berechtigung. | `ghp_aB1c2D3e4F5g6H7i8J9k0L...` |
| `PAYLOAD_SECRET` | Ein zufälliger, sicherer String für die Payload CMS Verschlüsselung. | `7e9f2b8a1c3d4e5f6a7b8c9d0e1f2a3b` |
| `DB_USER` | Der Benutzername für die PostgreSQL Datenbank. | `payload_admin` |
| `DB_PASSWORD` | Das Passwort für die PostgreSQL Datenbank. | `sicheres_db_passwort_123!` |
| `DB_NAME` | Der Name der PostgreSQL Datenbank. | `payload_db` |

## Funktionsweise der Automatisierung

1.  **Dynamische Namen:** Der Stack-Name und alle Docker-Ressourcen werden automatisch vom Namen deines GitHub Repositories abgeleitet.
2.  **Secret Management:** Vor jedem Deployment löscht die GitHub Action (falls möglich) die alten Secrets im Swarm und erstellt sie neu mit den aktuellen Werten aus GitHub.
3.  **DATABASE_URL:** Die Verbindungs-URL für Payload wird automatisch im Workflow zusammengebaut:
    `postgres://${DB_USER}:${DB_PASSWORD}@${REPO_NAME}_db:5432/${DB_NAME}`
4.  **Isolation:** Durch das Mapping von dynamischen Swarm-Secrets (`source`) auf feste Pfade im Container (`target: payload_env`) bleibt der App-Code komplett generisch.
