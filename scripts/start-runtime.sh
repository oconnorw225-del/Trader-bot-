#!/bin/bash

#################################################
# Chimera Bot Runtime Startup Script
# Starts unified server and Chimera Bot in paper trading mode
#################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CONFIG_FILE="${REPO_ROOT}/.chimera/runtime-config.json"
LOG_FILE="${REPO_ROOT}/chimera-runtime.log"
PID_FILE="${REPO_ROOT}/chimera-runtime.pid"

# Load runtime configuration
if [ ! -f "$CONFIG_FILE" ]; then
    echo -e "${RED}ERROR: Runtime configuration not found: ${CONFIG_FILE}${NC}"
    exit 1
fi

# Parse configuration
TRADING_MODE=$(jq -r '.chimera_bot.trading_mode' "$CONFIG_FILE")
RISK_LEVEL=$(jq -r '.chimera_bot.risk_level' "$CONFIG_FILE")
SAFETY_LOCK=$(jq -r '.safety.safety_lock' "$CONFIG_FILE")
MAX_RUNTIME_HOURS=$(jq -r '.safety.max_runtime_hours' "$CONFIG_FILE")

echo ""
echo -e "${CYAN}╔════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   Chimera Bot Runtime Startup              ║${NC}"
echo -e "${CYAN}║   v1.0.0 - Paper Trading Mode              ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════╝${NC}"
echo ""

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
    echo "[$(date -u +"%Y-%m-%d %H:%M:%S UTC")] [INFO] $1" >> "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
    echo "[$(date -u +"%Y-%m-%d %H:%M:%S UTC")] [SUCCESS] $1" >> "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
    echo "[$(date -u +"%Y-%m-%d %H:%M:%S UTC")] [WARNING] $1" >> "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    echo "[$(date -u +"%Y-%m-%d %H:%M:%S UTC")] [ERROR] $1" >> "$LOG_FILE"
}

# Validate environment
validate_environment() {
    log_info "Validating environment..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js not found. Please install Node.js 18+"
        exit 1
    fi
    
    local node_version=$(node --version)
    log_info "Node.js version: ${node_version}"
    
    # Check Python
    if ! command -v python3 &> /dev/null; then
        log_error "Python3 not found. Please install Python 3.8+"
        exit 1
    fi
    
    local python_version=$(python3 --version)
    log_info "Python version: ${python_version}"
    
    # Check for unified server
    if [ ! -f "${REPO_ROOT}/unified-server.js" ]; then
        log_error "Unified server not found: unified-server.js"
        exit 1
    fi
    
    # Check for Chimera Bot
    if [ ! -f "${REPO_ROOT}/chimera-bot/main.py" ]; then
        log_error "Chimera Bot not found: chimera-bot/main.py"
        exit 1
    fi
    
    log_success "Environment validation passed"
}

# Check safety settings
check_safety() {
    log_info "Checking safety settings..."
    
    if [ "$SAFETY_LOCK" != "true" ]; then
        log_error "SAFETY LOCK is not enabled! Refusing to start."
        exit 1
    fi
    
    if [ "$TRADING_MODE" != "paper" ]; then
        log_error "Trading mode is not 'paper'! Refusing to start."
        exit 1
    fi
    
    log_success "Safety checks passed"
    log_info "Trading Mode: ${TRADING_MODE}"
    log_info "Risk Level: ${RISK_LEVEL}"
    log_info "Safety Lock: ${SAFETY_LOCK}"
    log_info "Max Runtime: ${MAX_RUNTIME_HOURS} hours"
}

# Start unified server
start_unified_server() {
    log_info "Starting unified server..."
    
    cd "$REPO_ROOT"
    
    # Set environment variables
    export NODE_ENV=production
    export TRADING_MODE=paper
    export SAFETY_LOCK=true
    export USE_LIVE_TRADING=false
    export TESTNET=true
    
    # Start server in background
    node unified-server.js >> "${LOG_FILE}" 2>&1 &
    local server_pid=$!
    
    echo "$server_pid" > "${PID_FILE}.server"
    
    # Wait for server to start
    sleep 5
    
    # Check if server is running
    if ps -p $server_pid > /dev/null; then
        log_success "Unified server started (PID: ${server_pid})"
        return 0
    else
        log_error "Failed to start unified server"
        return 1
    fi
}

# Start Chimera Bot
start_chimera_bot() {
    log_info "Starting Chimera Bot in paper trading mode..."
    
    cd "${REPO_ROOT}/chimera-bot"
    
    # Set environment variables
    export TRADING_MODE=paper
    export RISK_LEVEL="$RISK_LEVEL"
    export SAFETY_LOCK=true
    export PLATFORM=ndax
    export TESTNET=true
    export LOG_LEVEL=INFO
    
    # Start Chimera Bot in background
    python3 main.py >> "${LOG_FILE}" 2>&1 &
    local bot_pid=$!
    
    echo "$bot_pid" > "${PID_FILE}.bot"
    
    # Wait for bot to initialize
    sleep 5
    
    # Check if bot is running
    if ps -p $bot_pid > /dev/null; then
        log_success "Chimera Bot started (PID: ${bot_pid})"
        return 0
    else
        log_error "Failed to start Chimera Bot"
        return 1
    fi
}

# Monitor processes
monitor_processes() {
    log_info "Monitoring runtime system..."
    
    if [ -f "${PID_FILE}.server" ]; then
        local server_pid=$(cat "${PID_FILE}.server")
        if ! ps -p $server_pid > /dev/null; then
            log_error "Unified server has stopped unexpectedly"
            return 1
        fi
    fi
    
    if [ -f "${PID_FILE}.bot" ]; then
        local bot_pid=$(cat "${PID_FILE}.bot")
        if ! ps -p $bot_pid > /dev/null; then
            log_error "Chimera Bot has stopped unexpectedly"
            return 1
        fi
    fi
    
    return 0
}

# Graceful shutdown
shutdown_system() {
    log_info "Initiating graceful shutdown..."
    
    # Stop Chimera Bot
    if [ -f "${PID_FILE}.bot" ]; then
        local bot_pid=$(cat "${PID_FILE}.bot")
        if ps -p $bot_pid > /dev/null; then
            log_info "Stopping Chimera Bot (PID: ${bot_pid})..."
            kill -TERM $bot_pid 2>/dev/null || true
            sleep 5
            
            # Force kill if still running
            if ps -p $bot_pid > /dev/null; then
                log_warning "Force stopping Chimera Bot..."
                kill -KILL $bot_pid 2>/dev/null || true
            fi
        fi
        rm -f "${PID_FILE}.bot"
    fi
    
    # Stop unified server
    if [ -f "${PID_FILE}.server" ]; then
        local server_pid=$(cat "${PID_FILE}.server")
        if ps -p $server_pid > /dev/null; then
            log_info "Stopping unified server (PID: ${server_pid})..."
            kill -TERM $server_pid 2>/dev/null || true
            sleep 5
            
            # Force kill if still running
            if ps -p $server_pid > /dev/null; then
                log_warning "Force stopping unified server..."
                kill -KILL $server_pid 2>/dev/null || true
            fi
        fi
        rm -f "${PID_FILE}.server"
    fi
    
    log_success "System shutdown complete"
}

# Setup signal handlers
trap 'shutdown_system; exit 0' SIGTERM SIGINT

# Main execution
main() {
    # Validate environment
    validate_environment
    
    # Check safety settings
    check_safety
    
    # Start services
    if ! start_unified_server; then
        log_error "Failed to start unified server"
        exit 1
    fi
    
    if ! start_chimera_bot; then
        log_error "Failed to start Chimera Bot"
        shutdown_system
        exit 1
    fi
    
    log_success "Runtime system started successfully"
    
    # Calculate end time
    local end_time=$(($(date +%s) + ($MAX_RUNTIME_HOURS * 3600)))
    local end_time_readable=$(date -d "@$end_time" +"%Y-%m-%d %H:%M:%S")
    
    log_info "Runtime will end at: ${end_time_readable}"
    
    # Monitor loop
    while [ $(date +%s) -lt $end_time ]; do
        if ! monitor_processes; then
            log_error "Process monitoring detected failure"
            shutdown_system
            exit 1
        fi
        
        # Sleep for 60 seconds before next check
        sleep 60
    done
    
    log_info "Maximum runtime reached (${MAX_RUNTIME_HOURS} hours)"
    shutdown_system
    
    log_success "Runtime session completed successfully"
}

# Execute main
main "$@"
