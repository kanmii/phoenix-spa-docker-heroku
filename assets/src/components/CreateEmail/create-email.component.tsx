import React, { useReducer, useCallback, MouseEvent } from "react";
import Header from "../Header/header.component";
import "./create-email.styles.scss";
import {
  Props,
  effectFunctions,
  reducer,
  initState,
  ActionType,
  CallerProps,
  FormField,
} from "./create-email.utils";
import { FieldError } from "../../utils/common-errors";
import FormCtrlError from "../FormCtrlError/form-ctrl-error.component";
import {
  emailInputId,
  emailErrorId,
  submitId,
  notificationId,
  emailFieldId,
} from "./create-email.dom";
import makeClassNames from "classnames";
import { warningClassName, errorClassName } from "../../utils/utils.dom";
import { StateValue, InputChangeEvent } from "../../utils/types";
import { useRunEffects } from "../../utils/use-run-effects";
import { formFieldErrorClass } from "../../utils/utils.dom";
import { createEmailMutation } from "./create-email.injectables";

export function CreateEmail(props: Props) {
  const [stateMachine, dispatch] = useReducer(reducer, undefined, initState);

  const {
    states: {
      submission: submissionState,
      form: {
        fields: { email: emailState },
      },
    },
    effects: { general: generalEffects },
  } = stateMachine;

  useRunEffects(generalEffects, effectFunctions, props, { dispatch });

  const onSubmit = useCallback((e: MouseEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch({
      type: ActionType.SUBMISSION,
    });
  }, []);

  const onCloseNotification = useCallback(() => {
    dispatch({
      type: ActionType.CLOSE_SUBMIT_NOTIFICATION,
    });
  }, []);

  const onEmailChanged = useCallback((e: InputChangeEvent) => {
    const node = e.currentTarget;
    dispatch({
      type: ActionType.FORM_CHANGED,
      value: node.value,
      fieldName: "email",
    });
  }, []);

  let warningText = "";

  if (submissionState.value === StateValue.warning) {
    warningText = submissionState.warning.context.warning;
  }

  let errorText = "";
  if (submissionState.value === StateValue.commonErrors) {
    errorText = submissionState.commonErrors.context.errors;
  }

  return (
    <>
      <Header />

      <form onSubmit={onSubmit} className="emails-component form">
        {(warningText || errorText) && (
          <div
            id={notificationId}
            className={makeClassNames({
              notification: true,
              [warningClassName]: !!warningText,
              [errorClassName]: !!errorText,
            })}
          >
            <button
              type="button"
              className="delete"
              onClick={onCloseNotification}
            />
            {warningText || errorText}
          </div>
        )}

        <Email state={emailState} onFieldChanged={onEmailChanged} />
      </form>
    </>
  );
}

function Email(props: FieldComponentProps) {
  const { state, onFieldChanged } = props;

  let emailValue = "";
  let emailErrors: null | FieldError = null;

  if (state.states.value === StateValue.changed) {
    const {
      context: { formValue },
      states,
    } = state.states.changed;
    emailValue = formValue;

    if (states.value === StateValue.invalid) {
      emailErrors = states.invalid.context.errors;
    }
  }

  return (
    <div
      className={makeClassNames({
        field: true,
        [emailFieldId]: true,
        [formFieldErrorClass]: !!emailErrors,
      })}
    >
      <label htmlFor={emailInputId} className="label form__label">
        Enter email
      </label>

      <div
        className={makeClassNames({
          "field form__field has-addons": true,
        })}
      >
        <div className="control form__control-wrapper">
          <input
            className="input"
            type="text"
            id={emailInputId}
            value={emailValue}
            onChange={onFieldChanged}
            autoComplete="off"
          />
        </div>

        <div className="control">
          <button
            type="submit"
            id={submitId}
            className={makeClassNames({
              button: true,
              "is-primary": !emailErrors,
              "is-danger": !!emailErrors,
            })}
          >
            Create
          </button>
        </div>
      </div>

      {emailErrors && (
        <FormCtrlError id={emailErrorId}>
          {emailErrors.map((errorText, index) => {
            return (
              <div key={index}>
                <span>{errorText}</span>
              </div>
            );
          })}
        </FormCtrlError>
      )}
    </div>
  );
}

// istanbul ignore next:
export default (props: CallerProps) => {
  return <CreateEmail {...props} createEntry={createEmailMutation} />;
};

interface FieldComponentProps {
  state: FormField;
  onFieldChanged: (e: InputChangeEvent) => void;
}
