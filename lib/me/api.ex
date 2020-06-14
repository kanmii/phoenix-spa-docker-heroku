defmodule Me.Api do
  alias Me.Api.EmailApi

  defdelegate list_emails, to: EmailApi

  defdelegate get_email!(id), to: EmailApi

  defdelegate create_email(attrs \\ %{}), to: EmailApi

  defdelegate update_email(email, attrs), to: EmailApi

  defdelegate delete_email(email), to: EmailApi

  defdelegate change_email(email, attrs \\ %{}), to: EmailApi
end
