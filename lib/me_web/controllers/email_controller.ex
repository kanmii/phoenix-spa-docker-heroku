defmodule MeWeb.EmailController do
  use MeWeb, :controller

  alias Me.Api
  alias Me.Api.Email

  action_fallback MeWeb.FallbackController

  def index(conn, _params) do
    emails = Api.list_emails()
    render(conn, "index.json", emails: emails)
  end

  def create(conn, %{"data" => email_params}) do
    with {:ok, %Email{} = email} <- Api.create_email(email_params) do
      conn
      |> put_status(:created)
      |> put_resp_header("location", Routes.email_path(conn, :show, email))
      |> render("show.json", email: email)
    end
  end

  def show(conn, %{"id" => id}) do
    email = Api.get_email!(id)
    render(conn, "show.json", email: email)
  end

  def update(conn, %{"id" => id, "email" => email_params}) do
    email = Api.get_email!(id)

    with {:ok, %Email{} = email} <- Api.update_email(email, email_params) do
      render(conn, "show.json", email: email)
    end
  end

  def delete(conn, %{"id" => id}) do
    email = Api.get_email!(id)

    with {:ok, %Email{}} <- Api.delete_email(email) do
      send_resp(conn, :no_content, "")
    end
  end
end
