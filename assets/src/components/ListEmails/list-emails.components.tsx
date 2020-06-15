import React from "react";
import "./list-emails.scss";
import { CallerProps, Props } from "./list-emails.utils";
import { StateValue } from "../../utils/types";

export function ListEmails(props: Props) {
  const { emails } = props;

  switch (emails.value) {
    case StateValue.success: {
      return (
        <div>
          <div className="message subscribers-message">
            <div className="message-header">
              <p>See our cool subscribers</p>
            </div>
          </div>

          {emails.success.context.emails.map(({ email, id }, index) => {
            return (
              <div key={id} className="box">
                <div className="media">
                  <div className="media-left">
                    <button
                      className="button is-primary is-small is-light"
                      style={{
                        fontWeight: 700,
                      }}
                    >
                      Update
                    </button>
                  </div>

                  <div className="media-content">
                    <div className="content">{email}</div>
                  </div>

                  <div className="media-right">
                    <button className="delete"></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    case StateValue.empty: {
      return <div> No emails yet. Be the first to add your email. </div>;
    }

    case StateValue.commonErrors: {
      return (
        <div>
          Errors were encountered while fetching emails:{" "}
          {emails.commonErrors.context.errors}
        </div>
      );
    }

    default:
      throw new Error("not all cases handled");
  }
}

export default (props: CallerProps) => {
  return (
    <div className="list-emails-component">
      <ListEmails {...props} />
    </div>
  );
};
