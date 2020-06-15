/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { ComponentType } from "react";
import { render, cleanup, wait } from "@testing-library/react";
import { App } from "../components/App/app.component";
import {
  Props,
  ServerResponse,
  initState,
  effectFunctions,
  StateMachine,
  EffectState,
  EffectArgs,
  reducer,
  EmailsSuccess,
  ActionType,
} from "../components/App/app.utils";
import { fetchEmailsFn } from "../components/App/app.injectables";
import { scrollIntoView } from "../utils/scroll-into-view";
import { StateValue } from "../utils/types";
import { CommonErrorsState } from "../utils/common-errors";

const mockLoadingId = "a";
jest.mock("../components/Loading/loading.component", () => {
  return () => <div id={mockLoadingId} />;
});

const mockLoginId = "b";
jest.mock("../components/EmailsComp/emails-comp.component", () => {
  return () => <div id={mockLoginId} />;
});

jest.mock("../components/App/app.injectables");
const mockFetchEmailsFn = fetchEmailsFn as jest.Mock;

jest.mock("../utils/scroll-into-view");
const mockScrollIntoView = scrollIntoView as jest.Mock;

let mockState = (null as unknown) as StateMachine;
let mockDispatch = (null as unknown) as jest.Mock;

afterEach(() => {
  cleanup();
  jest.resetAllMocks();
  mockState = null as any;
});

afterAll(() => {
  delete window.fetchErrors;
});

describe("components", () => {
  it("fetch error", async () => {
    mockFetchEmailsFn.mockRejectedValue(new Error("a"));

    const { ui } = makeComp();

    render(ui);
    expect(document.getElementById(mockLoadingId)).not.toBeNull();
    expect(document.getElementById(mockLoginId)).toBeNull();
    expect(mockScrollIntoView).not.toHaveBeenCalled();

    await wait(() => true);

    expect(document.getElementById(mockLoadingId)).toBeNull();
    expect(document.getElementById(mockLoginId)).not.toBeNull();
    expect(mockScrollIntoView).toHaveBeenCalled();
  });

  it("shows loading indicator when fetching/ empty fetch", async () => {
    mockFetchEmailsFn.mockResolvedValue({
      data: [],
    } as ServerResponse);

    const { ui } = makeComp();

    render(ui);
    expect(document.getElementById(mockLoadingId)).not.toBeNull();
    expect(document.getElementById(mockLoginId)).toBeNull();

    await wait(() => true);

    expect(document.getElementById(mockLoadingId)).toBeNull();
    expect(document.getElementById(mockLoginId)).not.toBeNull();
  });
});

describe("reducer", () => {
  const props = {
    fetchEmails: mockFetchEmailsFn,
  } as Props;

  let effectArgs = (null as unknown) as EffectArgs;

  beforeEach(() => {
    mockDispatch = jest.fn((action) => {
      if (!mockState) {
        mockState = initState();
      }

      mockState = reducer(mockState, action);
    });

    effectArgs = {
      dispatch: mockDispatch as any,
    };
  });

  it("fetch success", async () => {
    mockFetchEmailsFn.mockResolvedValue({
      data: [
        {
          id: "1",
          email: "a",
        },
      ],
    } as ServerResponse);

    mockState = initState();

    const { key, ownArgs } = getEffects(mockState)[0];
    const func = effectFunctions[key];

    let emailsState = mockState.states.emails;
    expect(emailsState.value).toBe(StateValue.fetching);

    await func(ownArgs as any, props, effectArgs);

    const success = [
      {
        id: "1",
        email: "a",
      },
    ];

    expect(mockDispatch.mock.calls[0][0].emails).toEqual(success);

    emailsState = mockState.states.emails;
    expect(emailsState.value).toBe(StateValue.success);

    expect((emailsState as EmailsSuccess).success.context.emails).toEqual(
      success,
    );
  });

  it("fetch invalid data", async () => {
    mockFetchEmailsFn.mockResolvedValue({} as ServerResponse);

    mockState = initState();

    const { key, ownArgs } = getEffects(mockState)[0];
    const func = effectFunctions[key];

    let emailsState = mockState.states.emails;
    expect(emailsState.value).toBe(StateValue.fetching);

    await func(ownArgs as any, props, effectArgs);

    expect(mockDispatch.mock.calls[0][0].type).toEqual(ActionType.COMMON_ERROR);

    emailsState = mockState.states.emails;
    expect(emailsState.value).toBe(StateValue.commonErrors);

    expect(
      (emailsState as CommonErrorsState).commonErrors.context.errors,
    ).toBeDefined();
  });
});

////////////////////////// HELPER FUNCTIONS ///////////////////////////

const AppP = App as ComponentType<Partial<Props>>;

function makeComp({ props = {} }: { props?: Partial<Props> } = {}) {
  return {
    ui: <AppP {...props} fetchEmails={mockFetchEmailsFn}></AppP>,
  };
}

function getEffects(state: StateMachine) {
  return (state.effects.general as EffectState).hasEffects.context.effects;
}
