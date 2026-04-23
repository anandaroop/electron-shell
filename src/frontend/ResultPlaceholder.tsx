import { Flex, Spinner } from "@radix-ui/themes";
import React from "react";

interface ResultPlaceholderProps {
  loading: boolean;
}

export const ResultPlaceholder: React.FC<ResultPlaceholderProps> = (props) => {
  const { loading } = props;

  return (
    <Flex direction="column" gap="5">
      <Flex align="center" justify="center" height="200px" style={{ background: "var(--gray-a4)" }}>
        <Spinner loading={loading} />
      </Flex>
      <Flex align="center" justify="center" height="100px" style={{ background: "var(--gray-a4)" }}>
        <Spinner loading={loading} />
      </Flex>
      <Flex align="center" justify="center" height="150px" style={{ background: "var(--gray-a4)" }}>
        <Spinner loading={loading} />
      </Flex>
      <Flex align="center" justify="center" height="400px" style={{ background: "var(--gray-a4)" }}>
        <Spinner loading={loading} />
      </Flex>
    </Flex>
  );
};
