#!/bin/bash
# ==================================================
# 🚀 Script d'export automatique du schéma Supabase
# ==================================================
# Ce script exporte la structure complète de la base Supabase
# (tables, contraintes, policies, triggers...) vers un fichier SQL.
# ==================================================

set -e

# Vérifie la présence du dossier
mkdir -p supabase

echo "🧩 Export du schéma Supabase en cours..."
npx supabase db dump --schema public --file supabase/schema.sql

echo "✅ Schéma exporté avec succès dans supabase/schema.sql"
