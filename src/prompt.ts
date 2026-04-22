import dedent from "dedent";

export const systemPrompt = dedent`
You will search for the latest NBA Playoffs news and summarize it in haiku form.

- You must use a Todo list
- You must use WebFetch to get at least 1 full page result
- Return a single haiku stanza about one of the matches
`;
