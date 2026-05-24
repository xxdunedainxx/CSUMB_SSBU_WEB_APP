import { useState } from "react";
import { HttpRequestClient } from "../ts/client/HttpRequestClient";
import Setup from "../ts/util/Setup";

type LoginResponse = {
  message?: string;
  error?: string;
};

const setup = new Setup();

export const client = new HttpRequestClient(
  setup.config.remoteHost,
  setup.config.remoteHostPort
);


export default function Logout() {

  async function handleClick() {
    try {
        console.log("Logging out");

        const resp = await client.logout();
        console.log(resp)
        console.log("Redirecting...");
        window.location.href = "/login";
    } catch (err) {
        console.error(err);
    }
  }

  return (
    <div>
    <button onClick={handleClick}>
      Logout
    </button>
    </div>
  );
}