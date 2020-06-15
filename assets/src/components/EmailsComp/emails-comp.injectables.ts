/* istanbul ignore file */
import {
  FormInput,
  ServerResponse,
  ServerResponseSuccess,
} from "./emails-comp.utils";
import { getBackendUrls } from "../../utils/get-backend-urls";

export async function createEmailMutation(input: FormInput): Promise<ServerResponse> {
  const url = getBackendUrls().apiUrl;

  const fetchResult = await fetch(`${url}/emails`, {
    headers: {
      "Content-Type": "application/json",
      body: JSON.stringify(input),
    },
  });

  return await fetchResult.json();
}

export function onLoginSuccess(data: ServerResponseSuccess["email"]) {
  //
}

export type LoginMutationType = {
  login: typeof createEmailMutation;
};
