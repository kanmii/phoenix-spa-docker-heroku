defmodule MeWeb.EmailView do
  use MeWeb, :view
  alias MeWeb.EmailView

  def render("index.json", %{emails: emails}) do
    %{
      data:
        render_many(
          emails,
          EmailView,
          "email.json"
        )
    }
  end

  def render("show.json", %{email: email}) do
    %{
      data:
        render_one(
          email,
          EmailView,
          "email.json"
        )
    }
  end

  def render("email.json", %{email: email}) do
    %{
      id: email.id,
      email: email.email
    }
  end
end
