defmodule MeWeb.PageController do
  use MeWeb, :controller

  plug :put_layout, false

  def index(conn, _) do
    conn
    |> put_resp_header("content-type", "text/html")
    |> render("index.html")
  end

  def healthz(conn, _) do
    text(conn, "ok")
  end
end
