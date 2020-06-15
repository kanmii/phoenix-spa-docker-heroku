import { Reducer, Dispatch } from "react";
import { wrapReducer } from "../../logger";
import immer, { Draft } from "immer";
import {
  parseStringError,
  StringyErrorPayload,
  GENERIC_SERVER_ERROR,
  CommonErrorsState,
} from "../../utils/common-errors";
import {
  StateValue,
  SuccessVal,
  EmptyVal,
  FetchingVal,
} from "../../utils/types";
import {
  GenericGeneralEffect,
  getGeneralEffects,
  GenericEffectDefinition,
  GenericHasEffect,
} from "../../utils/effects";
import { FetchEmailsType } from "./app.injectables";
import { scrollIntoView } from "../../utils/scroll-into-view";
import { Email } from "../CreateEmail/create-email.utils";

export enum ActionType {
  COMMON_ERROR = "@app/common-error",
  SERVER_SUCCESS = "@app/server-success",
  CREATE_EMAIL_SUCCESS = "@app/create-email-success",
}

export const reducer: Reducer<StateMachine, Action> = (state, action) =>
  wrapReducer(
    state,
    action,
    (prevState, { type, ...payload }) => {
      return immer(prevState, (proxy) => {
        proxy.effects.general.value = StateValue.noEffect;
        delete proxy.effects.general[StateValue.hasEffects];

        switch (type) {
          case ActionType.COMMON_ERROR:
            handleCommonErrorAction(proxy, payload as StringyErrorPayload);
            break;

          case ActionType.SERVER_SUCCESS:
            handleServerSuccessAction(proxy, payload as ServerSuccessPayload);
            break;

          case ActionType.CREATE_EMAIL_SUCCESS:
            handleEmailCreatedAction(
              proxy,
              payload as CreateEmailSuccessPayload,
            );
        }
      });
    },

    // true,
  );

////////////////////////// STATE UPDATE SECTION /////////////////

export function initState(): StateMachine {
  return {
    effects: {
      general: {
        value: StateValue.hasEffects,
        hasEffects: {
          context: {
            effects: [
              {
                key: "fetchEmailsEffect",
                ownArgs: {},
              },
            ],
          },
        },
      },
    },
    states: {
      emails: {
        value: StateValue.fetching,
      },
    },
  };
}

function handleCommonErrorAction(
  proxy: DraftState,
  payload: StringyErrorPayload,
) {
  const errors = parseStringError(payload.error);

  const commonErrorsState = {
    value: StateValue.commonErrors,
    commonErrors: {
      context: {
        errors,
      },
    },
  } as EmailsState;

  proxy.states.emails = {
    ...proxy.states.emails,
    ...commonErrorsState,
  };

  const effects = getGeneralEffects(proxy);

  effects.push({
    key: "scrollIntoViewEffect",
    ownArgs: {},
  });
}

function handleServerSuccessAction(
  proxy: DraftState,
  payload: ServerSuccessPayload,
) {
  const {
    states: { emails: success },
  } = proxy;

  const { emails } = payload;

  if (emails.length) {
    const emailsState = success as Draft<EmailsSuccess>;
    emailsState.value = StateValue.success;
    emailsState.success = {
      context: {
        emails,
      },
    };
  } else {
    (success as Draft<EmailsEmpty>).value = StateValue.empty;
  }
}

function handleEmailCreatedAction(
  proxy: DraftState,
  payload: CreateEmailSuccessPayload,
) {
  const {
    states: { emails },
  } = proxy;

  const { email } = payload;
  const emailsSuccess = emails as Draft<EmailsSuccess>;

  switch (emails.value) {
    case StateValue.success:
      emails.success.context.emails.unshift(email);
      break;

    default:
      emailsSuccess.value = StateValue.success;
      emailsSuccess.success = {
        context: {
          emails: [email],
        },
      };
      break;
  }
}

////////////////////////// END STATE UPDATE SECTION ////////////

////////////////////////// EFFECTS SECTION /////////////////////////

const fetchEmailsEffect: DefFetchEmailsEffect["func"] = async (
  _,
  props,
  effectArgs,
) => {
  const { fetchEmails } = props;
  const { dispatch } = effectArgs;

  try {
    const response = await fetchEmails();

    const validResponse = response && response.data && response.data;

    if (!validResponse) {
      dispatch({
        type: ActionType.COMMON_ERROR,
        error: GENERIC_SERVER_ERROR,
      });

      return;
    }

    dispatch({
      type: ActionType.SERVER_SUCCESS,
      emails: validResponse,
    });
  } catch (error) {
    dispatch({
      type: ActionType.COMMON_ERROR,
      error,
    });
  }
};

type DefFetchEmailsEffect = EffectDefinition<"fetchEmailsEffect">;

const scrollIntoViewEffect: DefScrollToTopEffect["func"] = () => {
  scrollIntoView("");
};

type DefScrollToTopEffect = EffectDefinition<"scrollIntoViewEffect", {}>;

export const effectFunctions = {
  fetchEmailsEffect: fetchEmailsEffect,
  scrollIntoViewEffect,
};

////////////////////////// END EFFECTS SECTION /////////////////////////

////////////////////////// TYPES SECTION ////////////////////

type DraftState = Draft<StateMachine>;

export type StateMachine = Readonly<GenericGeneralEffect<EffectType>> &
  Readonly<{
    states: Readonly<{
      emails: EmailsState;
    }>;
  }>;

////////////////////////// STRINGY TYPES SECTION ///////////

export type EmailsState =
  | EmailsSuccess
  | CommonErrorsState
  | EmailsEmpty
  | Readonly<{
      value: FetchingVal;
    }>;

type EmailsEmpty = Readonly<{
  value: EmptyVal;
}>;

export type EmailsSuccess = Readonly<{
  value: SuccessVal;
  success: {
    context: {
      emails: Email[];
    };
  };
}>;

type ServerSuccessPayload = Readonly<{
  emails: ServerResponse["data"];
}>;

type CreateEmailSuccessPayload = Readonly<{
  email: Email;
}>;

export type Action =
  | ({
      type: ActionType.COMMON_ERROR;
    } & StringyErrorPayload)
  | ({
      type: ActionType.SERVER_SUCCESS;
    } & ServerSuccessPayload)
  | ({
      type: ActionType.CREATE_EMAIL_SUCCESS;
    } & CreateEmailSuccessPayload);

export interface EffectArgs {
  dispatch: DispatchType;
}

export type DispatchType = Dispatch<Action>;

export type AppChildProps = {
  appDispatch: DispatchType;
};

export type Props = FetchEmailsType;

type EffectDefinition<
  Key extends keyof typeof effectFunctions,
  OwnArgs = {}
> = GenericEffectDefinition<EffectArgs, Props, Key, OwnArgs>;

type EffectType = DefFetchEmailsEffect | DefScrollToTopEffect;
export type EffectState = GenericHasEffect<EffectType>;
type EffectList = EffectType[];

export interface FormInput {
  email: string;
}

export type ServerResponse = Readonly<{
  data: Email[];
}>;
