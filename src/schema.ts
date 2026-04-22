import { omit } from "lodash";
import { z } from "zod";

export const Haiku = z.object({
  haikus: z.string().array().describe("an array of haiku stanzas, one haiku per element"),
});

export type HaikuType = z.infer<typeof Haiku>;

export const HAIKU_SCHEMA = omit(z.toJSONSchema(Haiku), "$schema");
