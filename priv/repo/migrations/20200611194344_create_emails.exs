defmodule Me.Repo.Migrations.CreateEmails do
  use Ecto.Migration

  def change do
    create table(:emails) do
      add :email, :string, null: false

      timestamps()
    end

    :emails
    |> unique_index([:email])
    |> create()
  end
end
