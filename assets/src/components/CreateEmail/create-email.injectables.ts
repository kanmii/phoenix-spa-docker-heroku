/* istanbul ignore file */
import { FormInput, ServerResponse } from "./create-email.utils";
import { getBackendUrls } from "../../utils/get-backend-urls";

export async function createEmailMutation(
  input: FormInput,
): Promise<ServerResponse> {
  const url = getBackendUrls().apiUrl;

  const fetchResult = await fetch(`${url}/emails`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      data: input,
    }),
  });

  return await fetchResult.json();
}

export type CreateEmailMutationType = {
  createEntry: typeof createEmailMutation;
};
