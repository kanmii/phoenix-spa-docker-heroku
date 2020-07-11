#!/usr/bin/env bash

set -e

if [ "$MIX_ENV" == "prod" ]; then
  if [ -n "$CREATE_DATABASE" ]; then
    wait-until "bin/me eval "Me.Release.create""
  else
    wait-until "bin/me eval "Me.Release.migrate""
  fi

  bin/me start
else
  node_name="${DEV_NODE_NAME:-$MIX_ENV}"
  cookie="${DEV_COOKIE:-"me-cookie"}"

  wait-until "mix ecto.create"
  mix ecto.migrate

  # we need the node name so we can attach ao remote iex console thus:
  # iex --sname pick_a_name \
  #   --cookie me-cookie \
  #   --remsh $node_name@containerId

  echo -e "\n-----------------NODE NAME/cookie----------------"
  echo -e "Node name:\t\t$node_name"
  echo -e "   Cookie:\t\t$cookie"
  echo -e "-------------------------------------------------\n"

  # An easy way to attach to a running iex session in this container
  echo 'alias conn-iex="iex --sname console --cookie ${DEV_COOKIE} --remsh ${DEV_NODE_NAME}@${HOSTNAME}"' >> $HOME/.bashrc

  elixir --sname $node_name --cookie $cookie -S mix phx.server
fi
