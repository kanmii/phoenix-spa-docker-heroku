# This file is responsible for configuring your application
# and its dependencies with the aid of the Mix.Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.

# General application configuration
import Config

database_url = System.get_env("DATABASE_URL")

port =
  System.get_env("PORT", "4000")
  |> String.to_integer()

host = System.get_env("HOST", "localhost")

config :me,
  ecto_repos: [Me.Repo]

# Configure your database
config :me, Me.Repo,
  url: database_url,
  show_sensitive_data_on_connection_error: true,
  pool_size: 10

# Configures the endpoint
config :me, MeWeb.Endpoint,
  url: [host: host],
  http: [port: port],
  secret_key_base: "4aTUwjX2u1fUoEAC/6p/ESROwg6zrud2JvtJ86hu5yVpB+fTXlC6wAESl6QwVoSW",
  render_errors: [view: MeWeb.ErrorView, accepts: ~w(json), layout: false],
  pubsub_server: Me.PubSub,
  live_view: [signing_salt: "r25Hzn6s"]

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Use Jason for JSON parsing in Phoenix
config :phoenix, :json_library, Jason

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{Mix.env()}.exs"
