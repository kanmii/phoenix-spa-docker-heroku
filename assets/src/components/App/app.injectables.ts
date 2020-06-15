/* istanbul ignore file */
import { ServerResponse } from "./app.utils";
import { getBackendUrls } from "../../utils/get-backend-urls";

export async function fetchEmailsFn(): Promise<ServerResponse> {
  const url = getBackendUrls().apiUrl;
  const fetchResult = await fetch(`${url}/emails`);
  return await fetchResult.json();
}

export type FetchEmailsType = {
  fetchEmails: typeof fetchEmailsFn;
};
