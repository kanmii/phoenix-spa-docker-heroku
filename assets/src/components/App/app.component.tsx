import React, { useReducer } from "react";
import "./app.scss";
import Loading from "../Loading/loading.component";
import CreateEmail from "../CreateEmail/create-email.component";
import {
  reducer,
  initState,
  effectFunctions,
  Props,
  StateMachine,
  DispatchType,
} from "./app.utils";
import { useRunEffects } from "../../utils/use-run-effects";
import { hot } from "react-hot-loader";
import { StateValue } from "../../utils/types";
import { fetchEmailsFn } from "./app.injectables";
import ListEmails from "../ListEmails/list-emails.components";

export function App(props: Props) {
  const [stateMachine, dispatch] = useReducer(reducer, undefined, initState);

  const {
    states: { emails: emailsState },
    effects: { general: generalEffects },
  } = stateMachine;

  useRunEffects(generalEffects, effectFunctions, props, { dispatch });

  return emailsState.value === StateValue.fetching ? (
    <Loading />
  ) : (
    <AppChild state={stateMachine} dispatch={dispatch} />
  );
}

function AppChild(props: { state: StateMachine; dispatch: DispatchType }) {
  const {
    state: {
      states: { emails: emailsState },
    },
    dispatch,
  } = props;

  return (
    <div className="app-component">
      <CreateEmail callerProp={true} appDispatch={dispatch} />

      <ListEmails emails={emailsState} />
    </div>
  );
}

// istanbul ignore next:
export default hot(module)(() => {
  return <App fetchEmails={fetchEmailsFn} />;
});
