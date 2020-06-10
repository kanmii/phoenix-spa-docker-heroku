defmodule MeWeb.Router do
  use MeWeb, :router

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/api", MeWeb do
    pipe_through :api
  end

  scope "/", MeWeb do
    get("/*path", IndexController, :index)
  end
end
