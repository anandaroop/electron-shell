import React, { useState } from "react";
import {
  Badge,
  Box,
  Callout,
  Flex,
  Grid,
  Heading,
  Link,
  Separator,
  Tabs,
  Text,
} from "@radix-ui/themes";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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

export const Result: React.FC<ResultProps> = (props) => {
  const { structuredOutput } = props;
  const [copied, setCopied] = useState(false);
  const [hovered, setHovered] = useState(false);

  if (!structuredOutput) return null;

  const { bio, notes, review, citations } = structuredOutput;

  const handleCopyBio = () => {
    navigator.clipboard.writeText(bio).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    });
  };

  return (
    <Flex direction="column" gap="6" pb="6">
      {/* Bio */}
      <Flex direction="column" gap="3">
        <Heading size="3" weight="bold">
          Biography
        </Heading>
        <Tabs.Root
          defaultValue="formatted"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            background: hovered ? "var(--gray-a3)" : undefined,
          }}
        >
          <Tabs.List>
            <Tabs.Trigger value="formatted">Formatted</Tabs.Trigger>
            <Tabs.Trigger value="markdown">Markdown</Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="formatted">
            <Box onClick={handleCopyBio} style={{ position: "relative", cursor: "pointer" }} pt="3">
              <Box
                className="markdown-body"
                p="2"
                style={{ fontSize: "var(--font-size-2)", lineHeight: 1.7 }}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{bio}</ReactMarkdown>
              </Box>
              {copied && (
                <Text
                  size="3"
                  style={{
                    position: "absolute",
                    top: "-10%",
                    right: "50%",
                    color: "var(--green-11)",
                    animation: "float-up-fade 1s ease-out forwards",
                    pointerEvents: "none",
                  }}
                >
                  Copied ✓
                </Text>
              )}
            </Box>
          </Tabs.Content>

          <Tabs.Content value="markdown">
            <Box p="2" onClick={handleCopyBio} style={{ position: "relative", cursor: "pointer" }}>
              <Text
                size="2"
                style={{ lineHeight: 1.7, whiteSpace: "pre-wrap", fontFamily: "monospace" }}
              >
                {bio}
              </Text>
              {copied && (
                <Text
                  size="3"
                  style={{
                    position: "absolute",
                    top: "-10%",
                    right: "50%",
                    color: "var(--green-11)",
                    animation: "float-up-fade 1s ease-out forwards",
                    pointerEvents: "none",
                  }}
                >
                  Copied ✓
                </Text>
              )}
            </Box>
          </Tabs.Content>
        </Tabs.Root>
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
        <Tabs.Root defaultValue="by-claim">
          <Tabs.List>
            <Tabs.Trigger value="by-claim">By claim</Tabs.Trigger>
            <Tabs.Trigger value="by-source">By source</Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="by-claim">
            <Flex direction="column" gap="3" pt="3">
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
          </Tabs.Content>

          <Tabs.Content value="by-source">
            <Flex direction="column" gap="3" pt="3">
              {[...new Set(citations.flatMap((c) => c.sources))].map((url) => (
                <Box
                  key={url}
                  p="3"
                  style={{
                    background: "var(--gray-a2)",
                    borderRadius: "var(--radius-2)",
                  }}
                >
                  <Flex direction="column" gap="2">
                    <Link
                      href={url}
                      target="_blank"
                      size="1"
                      color="gray"
                      style={{ wordBreak: "break-all" }}
                    >
                      {url}
                    </Link>
                    <Flex direction="column" gap="2">
                      {citations
                        .filter((c) => c.sources.includes(url))
                        .map((c, i) => (
                          <Box
                            key={i}
                            pl="2"
                            style={{
                              borderLeft: `3px solid ${c.supported ? "var(--green-8)" : "var(--red-8)"}`,
                            }}
                          >
                            <Flex align="start" gap="2">
                              <Text size="1" style={{ flexShrink: 0, marginTop: "1px" }}>
                                {c.supported ? "✓" : "✗"}
                              </Text>
                              <Text size="2" style={{ lineHeight: 1.5 }}>
                                {c.claim}
                              </Text>
                            </Flex>
                          </Box>
                        ))}
                    </Flex>
                  </Flex>
                </Box>
              ))}
            </Flex>
          </Tabs.Content>
        </Tabs.Root>
      </Flex>
    </Flex>
  );
};
