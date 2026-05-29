#!/usr/bin/env bash
#
# Docker deployment script for Loss Analyser App (Vite + React frontend).
#
# Usage:
#   ./deploy.sh              # build image and start container
#   ./deploy.sh build        # build image only
#   ./deploy.sh start        # start existing container (or create from image)
#   ./deploy.sh stop         # stop container
#   ./deploy.sh restart      # stop, rebuild, and start
#   ./deploy.sh logs         # follow container logs
#   ./deploy.sh status       # show container status
#   ./deploy.sh remove       # stop and remove container
#
# Environment (optional overrides):
#   IMAGE_NAME          Docker image name (default: loss-analyser-app)
#   CONTAINER_NAME      Container name (default: loss-analyser-app)
#   VITE_FRONTEND_URL   Local frontend URL (port used for Docker mapping; see .env)
#   HOST_PORT           Override port (defaults to port from VITE_FRONTEND_URL)
#   VITE_API_BASE_URL   Backend API URL baked into the build (see .env)
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

IMAGE_NAME="${IMAGE_NAME:-loss-analyser-app}"
CONTAINER_NAME="${CONTAINER_NAME:-loss-analyser-app}"
IMAGE_TAG="${IMAGE_TAG:-latest}"

load_env() {
  if [[ -f .env ]]; then
    # shellcheck disable=SC1091
    set -a
    source .env
    set +a
  fi
}

port_from_frontend_url() {
  local url="${1:-}"
  if [[ "$url" =~ :([0-9]+)(/|$) ]]; then
    echo "${BASH_REMATCH[1]}"
  else
    echo "7005"
  fi
}

load_env

VITE_API_BASE_URL="${VITE_API_BASE_URL:-https://floodbot.cnc.claims:7001}"
VITE_FRONTEND_URL="${VITE_FRONTEND_URL:-http://localhost:7005}"
HOST_PORT="${HOST_PORT:-$(port_from_frontend_url "$VITE_FRONTEND_URL")}"

require_docker() {
  if ! command -v docker >/dev/null 2>&1; then
    echo "Error: docker is not installed or not in PATH." >&2
    exit 1
  fi
  if ! docker info >/dev/null 2>&1; then
    echo "Error: Docker daemon is not running or you lack permission to use it." >&2
    exit 1
  fi
}

container_exists() {
  docker ps -a --format '{{.Names}}' | grep -Fxq "$CONTAINER_NAME"
}

container_running() {
  docker ps --format '{{.Names}}' | grep -Fxq "$CONTAINER_NAME"
}

build_image() {
  echo "Building image ${IMAGE_NAME}:${IMAGE_TAG} (API: ${VITE_API_BASE_URL}, frontend: ${VITE_FRONTEND_URL})..."
  docker build \
    --build-arg "VITE_API_BASE_URL=${VITE_API_BASE_URL}" \
    --build-arg "VITE_FRONTEND_URL=${VITE_FRONTEND_URL}" \
    -t "${IMAGE_NAME}:${IMAGE_TAG}" \
    .
  echo "Image built: ${IMAGE_NAME}:${IMAGE_TAG}"
}

start_container() {
  if container_running; then
    echo "Container '${CONTAINER_NAME}' is already running on port ${HOST_PORT}."
    return 0
  fi

  if container_exists; then
    echo "Starting existing container '${CONTAINER_NAME}'..."
    docker start "$CONTAINER_NAME"
  else
    echo "Creating and starting container '${CONTAINER_NAME}' on port ${HOST_PORT}..."
    docker run -d \
      --name "$CONTAINER_NAME" \
      --restart unless-stopped \
      -p "${HOST_PORT}:80" \
      "${IMAGE_NAME}:${IMAGE_TAG}"
  fi

  echo "App available at ${VITE_FRONTEND_URL}"
}

stop_container() {
  if container_running; then
    echo "Stopping container '${CONTAINER_NAME}'..."
    docker stop "$CONTAINER_NAME"
  else
    echo "Container '${CONTAINER_NAME}' is not running."
  fi
}

remove_container() {
  stop_container || true
  if container_exists; then
    echo "Removing container '${CONTAINER_NAME}'..."
    docker rm "$CONTAINER_NAME"
  fi
}

show_status() {
  if container_exists; then
    docker ps -a --filter "name=^${CONTAINER_NAME}$" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
  else
    echo "Container '${CONTAINER_NAME}' does not exist."
  fi
  if docker image inspect "${IMAGE_NAME}:${IMAGE_TAG}" >/dev/null 2>&1; then
    echo ""
    docker images "${IMAGE_NAME}" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedSince}}"
  else
    echo "Image '${IMAGE_NAME}:${IMAGE_TAG}' not found. Run: ./deploy.sh build"
  fi
}

show_logs() {
  if ! container_exists; then
    echo "Container '${CONTAINER_NAME}' does not exist." >&2
    exit 1
  fi
  docker logs -f "$CONTAINER_NAME"
}

cmd="${1:-deploy}"

require_docker

case "$cmd" in
  build)
    build_image
    ;;
  start)
    if ! docker image inspect "${IMAGE_NAME}:${IMAGE_TAG}" >/dev/null 2>&1; then
      echo "Image not found. Building first..."
      build_image
    fi
    start_container
    ;;
  stop)
    stop_container
    ;;
  restart)
    stop_container || true
    build_image
    if container_exists; then
      docker rm "$CONTAINER_NAME"
    fi
    start_container
    ;;
  logs)
    show_logs
    ;;
  status)
    show_status
    ;;
  remove)
    remove_container
    ;;
  deploy)
    build_image
    if container_exists; then
      echo "Replacing existing container..."
      docker rm -f "$CONTAINER_NAME" >/dev/null 2>&1 || true
    fi
    start_container
    ;;
  *)
    echo "Unknown command: $cmd" >&2
    echo "Usage: $0 [deploy|build|start|stop|restart|logs|status|remove]" >&2
    exit 1
    ;;
esac
