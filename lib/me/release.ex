defmodule Me.Release do
  @app :me

  def migrate do
    load_app()

    for repo <- repos() do
      IO.inspect(repo)

      {:ok, _, _} =
        Ecto.Migrator.with_repo(
          repo,
          &Ecto.Migrator.run(&1, :up, all: true)
        )
    end
  end

  def create do
    load_app()

    for repo <- repos() do
      create_repo(repo)
    end
  end

  defp create_repo(repo) do
    case repo.__adapter__.storage_up(repo.config) do
      :ok ->
        "The database for #{inspect(repo)} has been created"

      {:error, :already_up} ->
        "The database for #{inspect(repo)} has already been created"

      {:error, term} ->
        raise "The database for #{inspect(repo)} couldn't be created: #{inspect(term)}"
    end
  end

  def rollback(repo, version) do
    load_app()

    {:ok, _, _} =
      Ecto.Migrator.with_repo(
        repo,
        &Ecto.Migrator.run(&1, :down, to: version)
      )
  end

  defp repos do
    Application.fetch_env!(@app, :ecto_repos)
  end

  defp load_app do
    Application.ensure_all_started(:ssl)
    Application.load(@app)
  end
end
