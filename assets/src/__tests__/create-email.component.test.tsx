/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { ComponentType } from "react";
import { render, cleanup, waitForElement, wait } from "@testing-library/react";
import { CreateEmail } from "../components/CreateEmail/create-email.component";
import {
  emailInputId,
  emailErrorId,
  submitId,
  notificationId,
  emailFieldId,
} from "../components/CreateEmail/create-email.dom";
import {
  Props, //
  initState,
  reducer,
  ActionType,
  StateMachine,
  EffectState,
  effectFunctions,
  EffectArgs,
  Action,
  ServerResponse,
  FormInput,
} from "../components/CreateEmail/create-email.utils";
import { CommonErrorsState } from "../utils/common-errors";
import { fillField } from "../tests.utils";
import {
  warningClassName,
  errorClassName, //
} from "../utils/utils.dom";
import { scrollIntoView } from "../utils/scroll-into-view";
import { formFieldErrorClass } from "../utils/utils.dom";
import { getParentFieldEl } from "../tests.utils";
import {
  createEmailMutation,
  onLoginSuccess,
} from "../components/CreateEmail/create-email.injectables";

jest.mock("../components/Header/header.component", () => () => null);

jest.mock("../utils/scroll-into-view");
const mockScrollIntoView = scrollIntoView as jest.Mock;

jest.mock("../components/CreateEmail/create-email.injectables");
const mockLoginFn = createEmailMutation as jest.Mock;
const mockOnLoginSuccess = onLoginSuccess as jest.Mock;

let stateMachine = (null as unknown) as StateMachine;

afterEach(() => {
  cleanup();
  jest.resetAllMocks();
  (stateMachine as any) = null;
});

describe("components", () => {
  it("reset/form errors/login success", async () => {
    const { ui } = makeComp();
    render(ui);

    // submit without completing any form input
    const submitEl = getSubmit();
    expect(mockScrollIntoView).not.toHaveBeenCalled();
    submitEl.click();

    let notificationEl = await waitForElement(getNotification);
    // we get warning
    expect(notificationEl.classList).toContain(warningClassName);
    expect(mockScrollIntoView).toHaveBeenCalled();

    closeNotification(notificationEl);
    expect(getNotification()).toBeNull();

    const emailInputEl = getEmailInput();
    const invalidEmailVal = "a@b.";
    fillField(emailInputEl, invalidEmailVal);

    expect(getEmailErrorEl()).toBeNull();

    submitEl.click();

    notificationEl = await waitForElement(getNotification);
    // we get error
    expect(notificationEl.classList).toContain(errorClassName);
    expect(getEmailErrorEl()).not.toBeNull();

    const emailInputParentFieldEl = getParentFieldEl(
      emailInputEl,
      emailFieldId,
    );

    expect(emailInputParentFieldEl.classList).toContain(formFieldErrorClass);

    const validEmailVal = "a@b.com";
    fillField(emailInputEl, validEmailVal);

    const success = {
      id: "1",
      email: "a",
    };

    mockLoginFn.mockResolvedValueOnce({
      data: {
        __typename: "success",
        email: success,
      },
    } as ServerResponse);

    submitEl.click();

    await wait(() => true);

    const calls = mockLoginFn.mock.calls[0][0] as FormInput;

    expect(calls).toEqual({
      email: validEmailVal,
    } as FormInput);

    expect(mockOnLoginSuccess).toHaveBeenCalledWith(success);
  });

  it("reset/server errors", async () => {
    const { ui } = makeComp();
    render(ui);

    // submit without completing any form input
    const submitEl = getSubmit();
    expect(mockScrollIntoView).not.toHaveBeenCalled();

    const emailInputEl = getEmailInput();
    const emailVal = "a@b.com";
    fillField(emailInputEl, emailVal);

    mockLoginFn.mockResolvedValue({
      data: {
        __typename: "errors",
        errors: {
          email: ["a"],
        },
      },
    } as ServerResponse);

    expect(getNotification()).toBeNull();
    expect(getEmailErrorEl()).toBeNull();
    expect(mockScrollIntoView).not.toHaveBeenCalled();

    submitEl.click();
    await waitForElement(getNotification);

    expect(getEmailErrorEl()).not.toBeNull();
    expect(mockScrollIntoView).toHaveBeenCalled();
  });
});

describe("reducer", () => {
  const props = ({ login: mockLoginFn } as unknown) as Props;

  const effectArgs = {
    dispatch: mockDispatch as any,
  } as EffectArgs;

  test("submission/invalid response", async () => {
    mockLoginFn.mockResolvedValue({});
    await submitAndRunEffect();

    expect(
      (stateMachine.states.submission as CommonErrorsState).commonErrors.context
        .errors,
    ).toBeDefined();
  });

  test("submission/exception", async () => {
    mockLoginFn.mockRejectedValue(new Error("a"));
    await submitAndRunEffect();

    expect(
      (stateMachine.states.submission as CommonErrorsState).commonErrors.context
        .errors,
    ).toBeDefined();
  });

  function completeFormInStateMachine(state?: StateMachine) {
    if (!state) {
      state = initState();
    }

    return reducer(state, {
      type: ActionType.FORM_CHANGED,
      value: "a@b.com",
      fieldName: "email",
    });
  }

  function submitAndRunEffect() {
    stateMachine = completeFormInStateMachine();

    stateMachine = reducer(stateMachine, {
      type: ActionType.SUBMISSION,
    });

    expect(
      (stateMachine.states.submission as CommonErrorsState).commonErrors,
    ).toBeUndefined();

    const { key, ownArgs } = getEffects(stateMachine)[0];
    const func = effectFunctions[key];

    return func(ownArgs as any, props, effectArgs);
  }

  function mockDispatch(action: Action) {
    stateMachine = reducer(stateMachine, action);
  }
});

////////////////////////// HELPER FUNCTIONS ///////////////////////////

const CreateEmailP = CreateEmail as ComponentType<Partial<Props>>;

function makeComp({ props = {} }: { props?: Partial<{}> } = {}) {
  return {
    ui: <CreateEmailP {...props} login={mockLoginFn} />,
  };
}

function getEmailInput() {
  return document.getElementById(emailInputId) as HTMLInputElement;
}

function getSubmit() {
  return document.getElementById(submitId) as HTMLElement;
}

function getNotification() {
  return document.getElementById(notificationId) as HTMLElement;
}

function closeNotification(notificationEl: HTMLElement) {
  (notificationEl
    .getElementsByClassName("delete")
    .item(0) as HTMLElement).click();
}

function getEmailErrorEl() {
  return document.getElementById(emailErrorId) as HTMLElement;
}

function getEffects(state: StateMachine) {
  return (state.effects.general as EffectState).hasEffects.context.effects;
}
