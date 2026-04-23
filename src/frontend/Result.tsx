import React from "react";
import { Badge, Box, Callout, Flex, Grid, Heading, Link, Separator, Text } from "@radix-ui/themes";
import { OutputType } from "../schema";

interface ResultProps {
  structuredOutput: OutputType;
}

const reviewTypeColor: Record<
  "uncertainty" | "missing_information" | "other",
  "yellow" | "red" | "gray"
> = {
  uncertainty: "yellow",
  missing_information: "red",
  other: "gray",
};

const reviewTypeLabel: Record<"uncertainty" | "missing_information" | "other", string> = {
  uncertainty: "Uncertain",
  missing_information: "Missing info",
  other: "Other",
};

export const Result: React.FC<ResultProps> = ({ structuredOutput }) => {
  if (!structuredOutput) return null;

  const { bio, notes, review, citations } = structuredOutput;

  return (
    <Flex direction="column" gap="6" pb="6">
      {/* Bio */}
      <Flex direction="column" gap="3">
        <Heading size="3" weight="bold">
          Biography
        </Heading>
        <Text size="2" style={{ lineHeight: 1.7 }}>
          {bio}
        </Text>
      </Flex>

      <Separator size="4" />

      {/* Notes */}
      {notes && (
        <>
          <Flex direction="column" gap="3">
            <Heading size="3" weight="bold">
              Editor notes
            </Heading>
            <Callout.Root color="gray" variant="surface" size="1">
              <Callout.Text size="2">{notes}</Callout.Text>
            </Callout.Root>
          </Flex>

          <Separator size="4" />
        </>
      )}

      {/* Review items */}
      {review.length > 0 && (
        <>
          <Flex direction="column" gap="3">
            <Heading size="3" weight="bold">
              Items to review
            </Heading>
            <Grid gap="2" style={{ gridTemplateColumns: "max-content 1fr" }}>
              {review.map((item, i) => (
                <React.Fragment key={i}>
                  <Badge color={reviewTypeColor[item.type]} size="1" style={{ alignSelf: "start" }}>
                    {reviewTypeLabel[item.type]}
                  </Badge>
                  <Text size="2">{item.item}</Text>
                </React.Fragment>
              ))}
            </Grid>
          </Flex>

          <Separator size="4" />
        </>
      )}

      {/* Citations */}
      <Flex direction="column" gap="3">
        <Heading size="3" weight="bold">
          Citations
        </Heading>
        <Flex direction="column" gap="3">
          {citations.map((citation, i) => (
            <Box
              key={i}
              p="3"
              style={{
                background: "var(--gray-a2)",
                borderRadius: "var(--radius-2)",
                borderLeft: `3px solid ${citation.supported ? "var(--green-8)" : "var(--red-8)"}`,
              }}
            >
              <Flex direction="column" gap="2">
                <Flex align="start" gap="2">
                  <Text size="1" style={{ flexShrink: 0, marginTop: "1px" }}>
                    {citation.supported ? "✓" : "✗"}
                  </Text>
                  <Text size="2" style={{ lineHeight: 1.5 }}>
                    {citation.claim}
                  </Text>
                </Flex>
                <Flex direction="column" gap="1" style={{ paddingLeft: "1.2rem" }}>
                  {citation.sources.map((url, j) => (
                    <Link
                      key={j}
                      href={url}
                      target="_blank"
                      size="1"
                      color="gray"
                      style={{ wordBreak: "break-all" }}
                    >
                      {url}
                    </Link>
                  ))}
                </Flex>
              </Flex>
            </Box>
          ))}
        </Flex>
      </Flex>
    </Flex>
  );
};
