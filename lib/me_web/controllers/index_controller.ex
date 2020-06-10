defmodule MeWeb.IndexController do
  use MeWeb, :controller

  plug :put_layout, false

  def index(conn, _) do
    conn
    |> text("ok")
  end
end
