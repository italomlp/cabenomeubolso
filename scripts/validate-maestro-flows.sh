#!/usr/bin/env bash
#
# Validate the syntax of every Maestro flow under .maestro/.
#
# `maestro check-syntax` accepts one file at a time, so this script iterates
# over each flow and reports every failure before exiting non-zero.
#
# The Maestro CLI is a local development dependency (see .maestro/README.md).
# Set MAESTRO_OPTIONAL=1 to skip validation when it is not installed — used by
# the CI "Maestro flow syntax" job, which is best-effort until Maestro is
# provisioned there.
#
# Usage:
#   npm run maestro:syntax
#   ./scripts/validate-maestro-flows.sh
#   MAESTRO_OPTIONAL=1 ./scripts/validate-maestro-flows.sh
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FLOWS_DIR="${ROOT_DIR}/.maestro"

if ! command -v maestro >/dev/null 2>&1; then
  if [[ "${MAESTRO_OPTIONAL:-0}" == "1" ]]; then
    echo "maestro: CLI not found — skipping syntax validation (MAESTRO_OPTIONAL=1)."
    exit 0
  fi
  echo "error: maestro CLI not found. Install it (https://maestro.mobile.dev) or" >&2
  echo "       run with MAESTRO_OPTIONAL=1 to skip this check." >&2
  exit 1
fi

shopt -s nullglob
flows=("${FLOWS_DIR}"/*.yaml)

if [[ ${#flows[@]} -eq 0 ]]; then
  echo "maestro: no flows found under ${FLOWS_DIR}."
  exit 0
fi

failed=0
for flow in "${flows[@]}"; do
  if maestro check-syntax "${flow}"; then
    echo "ok: ${flow}"
  else
    echo "error: syntax check failed for ${flow}" >&2
    failed=1
  fi
done

if [[ ${failed} -ne 0 ]]; then
  echo "maestro: one or more flows failed syntax validation." >&2
  exit 1
fi

echo "maestro: ${#flows[@]} flow(s) passed syntax validation."
