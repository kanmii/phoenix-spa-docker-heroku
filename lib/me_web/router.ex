defmodule MeWeb.Router do
  use MeWeb, :router

  pipeline :browser do
    plug :accepts, ["html"]
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/api", MeWeb do
    pipe_through :api
    resources "/emails", EmailController, except: [:new, :edit]
  end

  scope "/", MeWeb do
    pipe_through :browser

    get "/healthz", PageController, :healthz
    get "/*path", PageController, :index
  end
end
