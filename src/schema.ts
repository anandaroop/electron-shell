import { omit } from "lodash";
import { z } from "zod";

export const OutputSchema = z.object({
  haikus: z.string().array().describe("an array of haiku stanzas, one haiku per element"),
});

export type OutputType = z.infer<typeof OutputSchema>;

export const OUTPUT_SCHEMA = omit(z.toJSONSchema(OutputSchema), "$schema");
