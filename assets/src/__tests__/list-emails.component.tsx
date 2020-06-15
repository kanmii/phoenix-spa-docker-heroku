/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars*/
import React, { ComponentType } from "react";
import { render, cleanup } from "@testing-library/react";
import { ListEmails } from "../components/ListEmails/list-emails.components";
import { Props } from "../components/ListEmails/list-emails.utils";
import { StateValue } from "../utils/types";
import {
  emptyEmailsSelector,
  fetchEmailsErrorSelector,
  deleteEmailSelector
} from "../components/ListEmails/list-emails.dom";
import { Email } from "../components/CreateEmail/create-email.utils";

afterEach(() => {
  cleanup();
});

it("renders empty emails", () => {
  const { ui } = makeComp();

  render(ui);

  expect(
    document.getElementsByClassName(emptyEmailsSelector).item(0),
  ).not.toBeNull();

  expect(
    document.getElementsByClassName(fetchEmailsErrorSelector).item(0),
  ).toBeNull();


  expect(
    document.getElementsByClassName(deleteEmailSelector).item(0),
  ).toBeNull();
});

it("renders errors", () => {
  const { ui } = makeComp({
    props: {
      emails: {
        value: StateValue.commonErrors,
        commonErrors: {
          context: {
            errors: "",
          },
        },
      },
    },
  });

  render(ui);

  expect(
    document.getElementsByClassName(emptyEmailsSelector).item(0),
  ).toBeNull();

  expect(
    document.getElementsByClassName(fetchEmailsErrorSelector).item(0),
  ).not.toBeNull();

  expect(
    document.getElementsByClassName(deleteEmailSelector).item(0),
  ).toBeNull();
});

it("renders emails", () => {
  const { ui } = makeComp({
    props: {
      emails: {
        value: StateValue.success,
        success: {
          context: {
            emails: [
              {
                id: "a",
                email: "a",
              } as Email,
            ],
          },
        },
      },
    },
  });

  render(ui);

  expect(
    document.getElementsByClassName(deleteEmailSelector).item(0),
  ).not.toBeNull();

  expect(
    document.getElementsByClassName(emptyEmailsSelector).item(0),
  ).toBeNull();

  expect(
    document.getElementsByClassName(fetchEmailsErrorSelector).item(0),
  ).toBeNull();
});

////////////////////////// HELPER FUNCTIONS ///////////////////////////

const ListEmailsP = ListEmails as ComponentType<Partial<Props>>;

function makeComp({ props = {} }: { props?: Partial<Props> } = {}) {
  const emails = props.emails || {
    value: StateValue.empty,
  };

  return {
    ui: <ListEmailsP {...props} emails={emails} />,
  };
}
