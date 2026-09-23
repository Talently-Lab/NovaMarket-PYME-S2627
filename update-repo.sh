#!/usr/bin/env zsh
# =============================================================================
# update-repo.sh — NovaMarket PYME
# Script de sincronización diaria para la rama feature/qa-automation
# Uso: ./update-repo.sh
# =============================================================================

set -euo pipefail   # Corta la ejecución si cualquier comando falla

# ─── Colores para la terminal ─────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
RESET='\033[0m'

RAMA_OBJETIVO="feature/qa-automation"
RAMA_BASE="develop"

echo ""
echo "${BOLD}${BLUE}========================================${RESET}"
echo "${BOLD}${BLUE}  NovaMarket — Sincronización de rama  ${RESET}"
echo "${BOLD}${BLUE}========================================${RESET}"
echo ""

# ─── PASO 1: Estado actual del repo ──────────────────────────────────────────
echo "${BOLD}[1/6] Estado actual del repositorio${RESET}"
echo "──────────────────────────────────────"
git status
echo ""

# ─── PASO 2: Detectar cambios sin commitear ───────────────────────────────────
if ! git diff-index --quiet HEAD -- 2>/dev/null || [ -n "$(git ls-files --others --exclude-standard)" ]; then
  echo "${YELLOW}⚠️  Hay cambios sin commitear en el repositorio.${RESET}"
  echo ""
  echo "¿Qué querés hacer?"
  echo "  ${BOLD}1)${RESET} Guardar cambios temporalmente con stash y continuar"
  echo "  ${BOLD}2)${RESET} Commitear los cambios ahora antes de continuar"
  echo "  ${BOLD}3)${RESET} Descartar todos los cambios y continuar (⚠️  irreversible)"
  echo "  ${BOLD}4)${RESET} Salir y decidir manualmente"
  echo ""
  printf "Elegí una opción [1-4]: "
  read opcion

  case "$opcion" in
    1)
      echo ""
      echo "${BLUE}→ Guardando cambios en stash...${RESET}"
      git stash push -m "stash automático - update-repo.sh $(date '+%Y-%m-%d %H:%M')"
      echo "${GREEN}✓ Cambios guardados. Podés recuperarlos con: git stash pop${RESET}"
      ;;
    2)
      echo ""
      printf "Mensaje del commit: "
      read mensaje_commit
      git add .
      git commit -m "$mensaje_commit"
      echo "${GREEN}✓ Commit creado.${RESET}"
      ;;
    3)
      echo ""
      echo "${RED}⚠️  Descartando todos los cambios locales...${RESET}"
      git checkout -- .
      git clean -fd
      echo "${GREEN}✓ Cambios descartados.${RESET}"
      ;;
    4|*)
      echo ""
      echo "${YELLOW}Saliendo. Resolvé los cambios manualmente y volvé a ejecutar el script.${RESET}"
      exit 0
      ;;
  esac
  echo ""
fi

# ─── PASO 3: Fetch del remoto ─────────────────────────────────────────────────
echo "${BOLD}[2/6] Trayendo cambios del remoto (fetch)${RESET}"
echo "──────────────────────────────────────"
git fetch --all --prune
echo "${GREEN}✓ Fetch completado.${RESET}"
echo ""

# ─── PASO 4: Cambiar a la rama objetivo ───────────────────────────────────────
echo "${BOLD}[3/6] Cambiando a ${RAMA_OBJETIVO}${RESET}"
echo "──────────────────────────────────────"
git checkout "$RAMA_OBJETIVO"
echo "${GREEN}✓ En rama: ${RAMA_OBJETIVO}${RESET}"
echo ""

# ─── PASO 5: Actualizar la rama con el remoto ─────────────────────────────────
echo "${BOLD}[4/6] Actualizando ${RAMA_OBJETIVO} con origin${RESET}"
echo "──────────────────────────────────────"
if git ls-remote --exit-code --heads origin "$RAMA_OBJETIVO" > /dev/null 2>&1; then
  git pull origin "$RAMA_OBJETIVO"
  echo "${GREEN}✓ Rama actualizada con origin/${RAMA_OBJETIVO}${RESET}"
else
  echo "${YELLOW}⚠️  La rama ${RAMA_OBJETIVO} no tiene remoto todavía. Se omite el pull.${RESET}"
fi
echo ""

# ─── PASO 6: Traer cambios de develop ─────────────────────────────────────────
echo "${BOLD}[5/6] Incorporando cambios de ${RAMA_BASE}${RESET}"
echo "──────────────────────────────────────"
echo "${BLUE}→ Ejecutando: git merge origin/${RAMA_BASE}${RESET}"

if git merge "origin/$RAMA_BASE" --no-edit; then
  echo "${GREEN}✓ Merge completado sin conflictos.${RESET}"
else
  echo ""
  echo "${RED}✗ Hay conflictos de merge. El script se detiene aquí.${RESET}"
  echo ""
  echo "${YELLOW}Archivos con conflictos:${RESET}"
  git diff --name-only --diff-filter=U
  echo ""
  echo "Pasos para resolver:"
  echo "  1. Abrí cada archivo listado arriba y resolvé los conflictos (buscá los marcadores <<<<<<< / =======  / >>>>>>>)"
  echo "  2. Hacé: git add <archivo>"
  echo "  3. Hacé: git commit"
  echo ""
  exit 1
fi
echo ""

# ─── RESUMEN FINAL ────────────────────────────────────────────────────────────
echo "${BOLD}${GREEN}========================================${RESET}"
echo "${BOLD}${GREEN}  ✓ Sincronización completada           ${RESET}"
echo "${BOLD}${GREEN}========================================${RESET}"
echo ""
echo "${BOLD}Rama actual:${RESET}    $(git branch --show-current)"
echo "${BOLD}Último commit:${RESET}  $(git log -1 --format='%h — %s (%ar)')"
echo ""

# Verificar si hay algo que requiera atención
AHEAD=$(git rev-list --count "origin/$RAMA_OBJETIVO"..HEAD 2>/dev/null || echo "0")
if [ "$AHEAD" -gt 0 ]; then
  echo "${YELLOW}⚠️  Tenés ${AHEAD} commit(s) locales que aún no fueron pusheados.${RESET}"
  echo "   Cuando estés listo: ${BOLD}git push origin ${RAMA_OBJETIVO}${RESET}"
  echo ""
fi

STASH_COUNT=$(git stash list | wc -l | tr -d ' ')
if [ "$STASH_COUNT" -gt 0 ]; then
  echo "${YELLOW}⚠️  Tenés ${STASH_COUNT} entrada(s) en el stash sin recuperar.${RESET}"
  echo "   Para verlas: ${BOLD}git stash list${RESET}"
  echo "   Para recuperar la última: ${BOLD}git stash pop${RESET}"
  echo ""
fi

echo "${GREEN}Todo listo. Podés empezar a trabajar.${RESET}"
echo ""
