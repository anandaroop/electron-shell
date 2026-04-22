import { omit } from "lodash";
import { z } from "zod";

export const OutputSchema = z.object({
  bio: z.string().describe("The final synthesized biography text."),
  notes: z.string().describe("Any other information of interest to the user."),
  citations: z
    .array(
      z.object({
        claim: z
          .string()
          .describe(
            "A factual claim made in the bio, which should be directly supported by the source. The claim should mirror the wording in the generated bio as much as possible."
          ),
        sources: z
          .string()
          .array()
          .describe(
            "A list of URLs which support this claim. The URL *MUST* be one of the sources consulted during this process and *MUST* textually support this claim."
          ),
        supported: z
          .boolean()
          .describe(
            "Whether the claim is supported by the provided sources. Set to false if the claim turns out to be unsupported by any of the sources. It is OK to admit that a claim is unsupported, the user would rather know that sooner than later."
          ),
      })
    )
    .describe(
      "A list of factual claims made in the bio, in the order they appear, with their corresponding sources."
    ),
  review: z
    .array(
      z.object({
        type: z.enum(["uncertainty", "missing_information", "other"]),
        item: z.string().describe("The specific item that requires attention or action."),
      })
    )
    .describe("A list of items that require user attention or action."),
});

export type OutputType = z.infer<typeof OutputSchema>;

export const OUTPUT_SCHEMA = omit(z.toJSONSchema(OutputSchema), "$schema");
