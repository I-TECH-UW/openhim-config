#!/bin/bash
echo "Waiting for $API_URL"

retry=10
i=0
while [ $i -lt $retry ]
do
  echo "Try $i"

  i=`expr $i + 1`
  res=`curl -sSk  "$API_URL/heartbeat"`

  if [[ $res =~ "master" ]]; then
    echo "OpenHIM is up!"
    break
  fi
  sleep 10
done

# Run the main container command.
node ./load-openhim-config.js --apiUrl=$API_URL