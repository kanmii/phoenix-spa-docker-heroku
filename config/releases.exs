# In this file, we load production configuration and secrets
# from environment variables. You can also hardcode secrets,
# although such is generally not recommended and you have to
# remember to add this file to your .gitignore.
import Config

database_url = System.fetch_env!("DATABASE_URL")
secret_key_base = System.fetch_env!("SECRET_KEY_BASE")

database_ssl =
  case System.fetch_env!("DATABASE_SSL") do
    "true" ->
      true

    _ ->
      false
  end

port =
  System.fetch_env!("PORT")
  |> String.to_integer()

pool_size =
  (System.get_env("POOL_SIZE") || "18")
  |> String.to_integer()

host = System.fetch_env!("HOST")

check_origin = System.fetch_env!("CHECK_ORIGINS")

config :me, Me.Repo,
  url: database_url,
  pool_size: pool_size,
  ssl: database_ssl

# For production, don't forget to configure the url host
# to something meaningful, Phoenix uses this information
# when generating URLs.
#
config :me, MeWeb.Endpoint,
  http: [
    port: port,
    transport_options: [socket_opts: [:inet6]]
  ],
  url: [
    host: host,
    port: port
  ],
  secret_key_base: secret_key_base,
  check_origin: [check_origin],
  server: true
