defmodule MeWeb.Endpoint do
  use Phoenix.Endpoint, otp_app: :me

  # The session will be stored in the cookie and signed,
  # this means its contents can be read but not tampered with.
  # Set :encryption_salt if you would also like to encrypt it.
  @session_options [
    store: :cookie,
    key: "_me_key",
    signing_salt: "6/qRol0h"
  ]

  socket "/socket", MeWeb.UserSocket,
    websocket: true,
    longpoll: false

  socket "/live", Phoenix.LiveView.Socket, websocket: [connect_info: [session: @session_options]]

  # Serve at "/" the static files from "priv/static" directory.
  #
  # You should set gzip to true if you are running phx.digest
  # when deploying your static files in production.
  plug Plug.Static,
    at: "/",
    from: "assets/build",
    gzip: false,
    only: ~w(
      index.html
      static
      icons
      asset-manifest.json
      manifest.json
      precache-manifest
      robots.txt
      service-worker.js
    )

  # Code reloading can be explicitly enabled under the
  # :code_reloader configuration of your endpoint.
  if code_reloading? do
    plug Phoenix.CodeReloader
    plug Phoenix.Ecto.CheckRepoStatus, otp_app: :me
  end

  plug Phoenix.LiveDashboard.RequestLogger,
    param_key: "request_logger",
    cookie_key: "request_logger"

  plug Plug.RequestId
  plug Plug.Telemetry, event_prefix: [:phoenix, :endpoint]

  plug Plug.Parsers,
    parsers: [:urlencoded, :multipart, :json],
    pass: ["*/*"],
    json_decoder: Phoenix.json_library()

  plug Plug.MethodOverride
  plug Plug.Head
  plug Plug.Session, @session_options

  unless Application.get_env(:me, :no_cors) do
    plug(
      Corsica,
      origins: "*",
      allow_headers: ~w(Accept Content-Type Authorization Origin)
    )
  end

  plug MeWeb.Router
end
