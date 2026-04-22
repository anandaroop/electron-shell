import dedent from "dedent";

export const SYSTEM_PROMPT = dedent`
  You will search for the latest pro basketball result and summarize it in haiku form.

  - You must use a Todo list
  - You must use the /fetch-scores skill to obtain the game result
  - Return one haiku stanza, describing the match
`;
