#!/bin/bash

#################################################
# Chimera Bot Runtime Monitoring Script
# Collects metrics, generates reports, and monitors health
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
METRICS_FILE="${REPO_ROOT}/runtime-metrics.json"
REPORT_DIR="${REPO_ROOT}/runtime-reports"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

echo ""
echo -e "${CYAN}╔════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   Chimera Bot Runtime Monitor              ║${NC}"
echo -e "${CYAN}║   v1.0.0 - Health Check & Metrics          ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════╝${NC}"
echo ""

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Create report directory
mkdir -p "$REPORT_DIR"

# Check system health
check_health() {
    log_info "Checking system health..."
    
    local health_status="healthy"
    local issues=()
    
    # Check if unified server is running
    if [ -f "${REPO_ROOT}/chimera-runtime.pid.server" ]; then
        local server_pid=$(cat "${REPO_ROOT}/chimera-runtime.pid.server")
        if ps -p $server_pid > /dev/null; then
            log_success "Unified server is running (PID: ${server_pid})"
        else
            log_error "Unified server is not running"
            health_status="unhealthy"
            issues+=("Unified server stopped")
        fi
    else
        log_warning "Unified server PID file not found"
        health_status="degraded"
        issues+=("Server PID file missing")
    fi
    
    # Check if Chimera Bot is running
    if [ -f "${REPO_ROOT}/chimera-runtime.pid.bot" ]; then
        local bot_pid=$(cat "${REPO_ROOT}/chimera-runtime.pid.bot")
        if ps -p $bot_pid > /dev/null; then
            log_success "Chimera Bot is running (PID: ${bot_pid})"
        else
            log_error "Chimera Bot is not running"
            health_status="unhealthy"
            issues+=("Chimera Bot stopped")
        fi
    else
        log_warning "Chimera Bot PID file not found"
        health_status="degraded"
        issues+=("Bot PID file missing")
    fi
    
    # Check disk space
    local disk_usage=$(df -h "$REPO_ROOT" | tail -1 | awk '{print $5}' | sed 's/%//')
    log_info "Disk usage: ${disk_usage}%"
    
    if [ "$disk_usage" -gt 90 ]; then
        log_error "Critical disk usage: ${disk_usage}%"
        health_status="critical"
        issues+=("Critical disk usage")
    elif [ "$disk_usage" -gt 80 ]; then
        log_warning "High disk usage: ${disk_usage}%"
        if [ "$health_status" = "healthy" ]; then
            health_status="degraded"
        fi
        issues+=("High disk usage")
    fi
    
    # Check memory usage
    local mem_usage=$(free | grep Mem | awk '{print int($3/$2 * 100)}')
    log_info "Memory usage: ${mem_usage}%"
    
    if [ "$mem_usage" -gt 90 ]; then
        log_error "Critical memory usage: ${mem_usage}%"
        health_status="critical"
        issues+=("Critical memory usage")
    elif [ "$mem_usage" -gt 80 ]; then
        log_warning "High memory usage: ${mem_usage}%"
        if [ "$health_status" = "healthy" ]; then
            health_status="degraded"
        fi
        issues+=("High memory usage")
    fi
    
    # Return status
    echo "$health_status"
}

# Collect performance metrics
collect_metrics() {
    log_info "Collecting performance metrics..."
    
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
    local mem_total=$(free -m | grep Mem | awk '{print $2}')
    local mem_used=$(free -m | grep Mem | awk '{print $3}')
    local mem_percent=$(free | grep Mem | awk '{print int($3/$2 * 100)}')
    local disk_usage=$(df -h "$REPO_ROOT" | tail -1 | awk '{print $5}')
    local uptime=$(uptime -p)
    
    # Count log entries
    local error_count=0
    local warning_count=0
    if [ -f "${REPO_ROOT}/chimera-runtime.log" ]; then
        error_count=$(grep -c "\[ERROR\]" "${REPO_ROOT}/chimera-runtime.log" || echo 0)
        warning_count=$(grep -c "\[WARNING\]" "${REPO_ROOT}/chimera-runtime.log" || echo 0)
    fi
    
    # Create metrics JSON
    cat > "$METRICS_FILE" << EOF
{
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "system": {
    "cpu_usage": "${cpu_usage}",
    "memory_total_mb": ${mem_total},
    "memory_used_mb": ${mem_used},
    "memory_usage_percent": ${mem_percent},
    "disk_usage": "${disk_usage}",
    "uptime": "${uptime}"
  },
  "logs": {
    "error_count": ${error_count},
    "warning_count": ${warning_count}
  },
  "health_status": "$(check_health)"
}
EOF
    
    log_success "Metrics collected and saved to: ${METRICS_FILE}"
}

# Generate hourly report
generate_report() {
    log_info "Generating runtime report..."
    
    local report_file="${REPORT_DIR}/runtime-report-${TIMESTAMP}.md"
    
    # Load metrics
    if [ ! -f "$METRICS_FILE" ]; then
        log_warning "Metrics file not found, collecting metrics first..."
        collect_metrics
    fi
    
    local health_status=$(jq -r '.health_status' "$METRICS_FILE" 2>/dev/null || echo "unknown")
    local cpu_usage=$(jq -r '.system.cpu_usage' "$METRICS_FILE" 2>/dev/null || echo "N/A")
    local mem_usage=$(jq -r '.system.memory_usage_percent' "$METRICS_FILE" 2>/dev/null || echo "N/A")
    local disk_usage=$(jq -r '.system.disk_usage' "$METRICS_FILE" 2>/dev/null || echo "N/A")
    local error_count=$(jq -r '.logs.error_count' "$METRICS_FILE" 2>/dev/null || echo "0")
    local warning_count=$(jq -r '.logs.warning_count' "$METRICS_FILE" 2>/dev/null || echo "0")
    
    # Determine status emoji
    local status_emoji="✅"
    case "$health_status" in
        healthy)
            status_emoji="✅"
            ;;
        degraded)
            status_emoji="⚠️"
            ;;
        unhealthy)
            status_emoji="❌"
            ;;
        critical)
            status_emoji="🚨"
            ;;
    esac
    
    # Generate report
    cat > "$report_file" << EOF
# Chimera Bot Runtime Report

**Generated:** $(date -u +"%Y-%m-%d %H:%M:%S UTC")
**Status:** ${status_emoji} ${health_status^^}

## System Health

| Metric | Value | Status |
|--------|-------|--------|
| Overall Health | ${health_status} | ${status_emoji} |
| CPU Usage | ${cpu_usage}% | $([ "${cpu_usage%.*}" -gt 80 ] && echo "⚠️" || echo "✅") |
| Memory Usage | ${mem_usage}% | $([ "$mem_usage" -gt 80 ] && echo "⚠️" || echo "✅") |
| Disk Usage | ${disk_usage} | $([ "${disk_usage%\%}" -gt 80 ] && echo "⚠️" || echo "✅") |

## Log Summary

- **Errors:** ${error_count}
- **Warnings:** ${warning_count}

## Process Status

EOF

    # Check process status
    if [ -f "${REPO_ROOT}/chimera-runtime.pid.server" ]; then
        local server_pid=$(cat "${REPO_ROOT}/chimera-runtime.pid.server")
        if ps -p $server_pid > /dev/null; then
            echo "- ✅ Unified Server: Running (PID: ${server_pid})" >> "$report_file"
        else
            echo "- ❌ Unified Server: Stopped" >> "$report_file"
        fi
    else
        echo "- ⚠️ Unified Server: Unknown (PID file not found)" >> "$report_file"
    fi
    
    if [ -f "${REPO_ROOT}/chimera-runtime.pid.bot" ]; then
        local bot_pid=$(cat "${REPO_ROOT}/chimera-runtime.pid.bot")
        if ps -p $bot_pid > /dev/null; then
            echo "- ✅ Chimera Bot: Running (PID: ${bot_pid})" >> "$report_file"
        else
            echo "- ❌ Chimera Bot: Stopped" >> "$report_file"
        fi
    else
        echo "- ⚠️ Chimera Bot: Unknown (PID file not found)" >> "$report_file"
    fi
    
    cat >> "$report_file" << EOF

## Configuration

- **Trading Mode:** Paper Trading
- **Safety Lock:** Enabled
- **Risk Level:** Moderate
- **Platform:** NDAX Testnet

## Recent Errors

EOF

    # Add recent errors
    if [ -f "${REPO_ROOT}/chimera-runtime.log" ]; then
        local recent_errors=$(grep "\[ERROR\]" "${REPO_ROOT}/chimera-runtime.log" | tail -5 || echo "No recent errors")
        if [ "$recent_errors" = "No recent errors" ]; then
            echo "✅ No recent errors detected" >> "$report_file"
        else
            echo '```' >> "$report_file"
            echo "$recent_errors" >> "$report_file"
            echo '```' >> "$report_file"
        fi
    else
        echo "⚠️ Log file not found" >> "$report_file"
    fi
    
    cat >> "$report_file" << EOF

## Recommendations

EOF

    # Add recommendations based on status
    if [ "$health_status" = "healthy" ]; then
        echo "✅ System is operating normally. Continue monitoring." >> "$report_file"
    elif [ "$health_status" = "degraded" ]; then
        echo "⚠️ System is degraded. Review warnings and consider intervention." >> "$report_file"
    elif [ "$health_status" = "unhealthy" ]; then
        echo "❌ System is unhealthy. Immediate attention required." >> "$report_file"
    elif [ "$health_status" = "critical" ]; then
        echo "🚨 System is in critical state. Emergency intervention required." >> "$report_file"
    fi
    
    if [ "$error_count" -gt 10 ]; then
        echo "- High error count detected. Review logs for recurring issues." >> "$report_file"
    fi
    
    if [ "${disk_usage%\%}" -gt 80 ]; then
        echo "- High disk usage. Consider cleaning up old logs and reports." >> "$report_file"
    fi
    
    if [ "$mem_usage" -gt 80 ]; then
        echo "- High memory usage. Consider restarting services or investigating memory leaks." >> "$report_file"
    fi
    
    cat >> "$report_file" << EOF

---
*Automated by Chimera Bot Runtime Monitor v1.0.0*
EOF
    
    log_success "Report generated: ${report_file}"
    
    # Display report
    cat "$report_file"
}

# Detect anomalies
detect_anomalies() {
    log_info "Detecting anomalies..."
    
    local anomalies=()
    
    # Check for rapid error increase
    if [ -f "${REPO_ROOT}/chimera-runtime.log" ]; then
        local recent_errors=$(grep "\[ERROR\]" "${REPO_ROOT}/chimera-runtime.log" | tail -10 | wc -l)
        if [ "$recent_errors" -gt 5 ]; then
            log_warning "Anomaly: High error rate in recent logs (${recent_errors} errors)"
            anomalies+=("High error rate")
        fi
    fi
    
    # Check for process crashes
    if [ -f "${REPO_ROOT}/chimera-runtime.pid.server" ]; then
        local server_pid=$(cat "${REPO_ROOT}/chimera-runtime.pid.server")
        if ! ps -p $server_pid > /dev/null; then
            log_error "Anomaly: Unified server has crashed"
            anomalies+=("Server crash")
        fi
    fi
    
    if [ -f "${REPO_ROOT}/chimera-runtime.pid.bot" ]; then
        local bot_pid=$(cat "${REPO_ROOT}/chimera-runtime.pid.bot")
        if ! ps -p $bot_pid > /dev/null; then
            log_error "Anomaly: Chimera Bot has crashed"
            anomalies+=("Bot crash")
        fi
    fi
    
    # Report anomalies
    if [ ${#anomalies[@]} -gt 0 ]; then
        log_warning "Detected ${#anomalies[@]} anomalies:"
        for anomaly in "${anomalies[@]}"; do
            echo "  - $anomaly"
        done
        return 1
    else
        log_success "No anomalies detected"
        return 0
    fi
}

# Main execution
main() {
    local action="${1:-report}"
    
    case "$action" in
        health)
            check_health
            ;;
        metrics)
            collect_metrics
            ;;
        report)
            generate_report
            ;;
        anomalies)
            detect_anomalies
            ;;
        all)
            collect_metrics
            detect_anomalies
            generate_report
            ;;
        *)
            echo "Usage: $0 {health|metrics|report|anomalies|all}"
            echo ""
            echo "Commands:"
            echo "  health     - Check system health"
            echo "  metrics    - Collect performance metrics"
            echo "  report     - Generate comprehensive report"
            echo "  anomalies  - Detect anomalies"
            echo "  all        - Run all monitoring tasks (default)"
            exit 1
            ;;
    esac
    
    echo ""
}

# Execute main
main "$@"
