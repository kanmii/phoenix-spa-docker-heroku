defmodule Me.ApiTest do
  use Me.DataCase

  alias Me.Api

  describe "emails" do
    alias Me.Api.Email

    @valid_attrs %{email: "some email"}
    @update_attrs %{email: "some updated email"}
    @invalid_attrs %{email: nil}

    def email_fixture(attrs \\ %{}) do
      {:ok, email} =
        attrs
        |> Enum.into(@valid_attrs)
        |> Api.create_email()

      email
    end

    test "list_emails/0 returns all emails" do
      email = email_fixture()
      assert Api.list_emails() == [email]
    end

    test "get_email!/1 returns the email with given id" do
      email = email_fixture()
      assert Api.get_email!(email.id) == email
    end

    test "create_email/1 with valid data creates a email" do
      assert {:ok, %Email{} = email} = Api.create_email(@valid_attrs)
      assert email.email == "some email"
    end

    test "create_email/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Api.create_email(@invalid_attrs)
    end

    test "update_email/2 with valid data updates the email" do
      email = email_fixture()
      assert {:ok, %Email{} = email} = Api.update_email(email, @update_attrs)
      assert email.email == "some updated email"
    end

    test "update_email/2 with invalid data returns error changeset" do
      email = email_fixture()
      assert {:error, %Ecto.Changeset{}} = Api.update_email(email, @invalid_attrs)
      assert email == Api.get_email!(email.id)
    end

    test "delete_email/1 deletes the email" do
      email = email_fixture()
      assert {:ok, %Email{}} = Api.delete_email(email)
      assert_raise Ecto.NoResultsError, fn -> Api.get_email!(email.id) end
    end

    test "change_email/1 returns a email changeset" do
      email = email_fixture()
      assert %Ecto.Changeset{} = Api.change_email(email)
    end
  end
end
