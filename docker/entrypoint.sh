#!/bin/bash

set -e

until  mix ecto.migrate ; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done

node_name="${DEV_NODE_NAME:-$MIX_ENV}"
cookie="${DEV_COOKIE:-"me-cookie"}"

# we need the node name so we can attach ao remote iex console thus:
# iex --sname pick_a_name \
#   --cookie ebnis-dev-cookie \
#   --remsh $node_name@containerId

echo -e "\n\n-------------NODE NAME/cookie----------------"
echo -e "Node name:\t\t$node_name"
echo -e "Cookie\t\t$cookie"
echo -e "\n\n"

elixir --sname $node_name --cookie $cookie -S mix phx.server
