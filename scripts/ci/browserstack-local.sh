
#!/bin/bash

set -eo pipefail

if [ -z "$BROWSERSTACK_ACCESS_KEY" ]; then
  echo "Ensure BROWSERSTACK_ACCESS_KEY is set"
  exit 2
fi

if [ -z "$BROWSERSTACK_LOCAL_IDENTIFIER" ]; then
  echo "Ensure BROWSERSTACK_LOCAL_IDENTIFIER is set"
  exit 1
fi

set -u

BROWSERSTACK_LOCAL_PROGRAM=/usr/local/bin/BrowserStackLocal
BROWSERSTACK_LOCAL_PID_NAME=browserstack-local
BROWSERSTACK_LOCAL_LOG_FILE=browserstack-local.log

case "$1" in
  start)
    echo "Starting BrowserStackLocal"
    echo ""

    $BROWSERSTACK_LOCAL_PROGRAM \
      --daemon start \
      --key $BROWSERSTACK_ACCESS_KEY \
      --local-identifier $BROWSERSTACK_LOCAL_IDENTIFIER \
      --force \
      --only-automate \
      --enable-logging-for-api \
      --log-file $BROWSERSTACK_LOCAL_LOG_FILE \
      --verbose 2 | \
        tee /dev/tty | \
        jq -er 'if .state == "connected" then .pid else empty end' > ${BROWSERSTACK_LOCAL_PID_NAME}.pid
    ;;
  check)
    pid=$(cat ${BROWSERSTACK_LOCAL_PID_NAME}.pid) || true
    if [ ! -z "$pid" ]; then
      echo "BrowserStackLocal is running with PID: $pid"
      echo $?
    else
      echo "BrowserStackLocal is not running"
      exit 1
    fi
    ;;
  stop)
    echo "Stopping BrowserStackLocal";
    $BROWSERSTACK_LOCAL_PROGRAM \
      --daemon stop \
      --key $BROWSERSTACK_ACCESS_KEY

    rm -f ${BROWSERSTACK_LOCAL_PID_NAME}.pid
    ;;
  *)
    echo "Usage : $0 start|stop";;
esac
