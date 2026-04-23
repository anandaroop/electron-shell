import { Flex, Spinner, Text } from "@radix-ui/themes";

export interface TodoItem {
  content: string;
  status: "pending" | "in_progress" | "completed";
}

interface TodoPanelProps {
  todos: TodoItem[];
}

function StatusIcon({ status }: { status: TodoItem["status"] }) {
  if (status === "completed")
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 16,
          height: 16,
          borderRadius: 3,
          background: "var(--green-9)",
          flexShrink: 0,
          fontSize: 10,
          color: "white",
        }}
      >
        ✓
      </span>
    );

  if (status === "in_progress") return <Spinner size="1" style={{ flexShrink: 0 }} />;

  return (
    <span
      style={{
        display: "inline-block",
        width: 16,
        height: 16,
        borderRadius: 3,
        background: "var(--gray-5)",
        flexShrink: 0,
      }}
    />
  );
}

export const TodoPanel: React.FC<TodoPanelProps> = ({ todos }) => {
  if (todos.length === 0) return null;

  return (
    <Flex
      direction="column"
      gap="2"
      p="3"
      style={{
        position: "fixed",
        bottom: 24,
        left: 24,
        background: "var(--gray-a3)",
        backdropFilter: "blur(8px)",
        borderRadius: "var(--radius-3)",
        border: "1px solid var(--gray-a5)",
        minWidth: 200,
        maxWidth: 280,
        zIndex: 100,
      }}
    >
      <Text size="4" weight="bold">
        Todo
      </Text>
      {todos.map((todo, i) => (
        <Flex key={i} align="center" gap="2">
          <StatusIcon status={todo.status} />
          <Text
            size="2"
            style={{
              opacity: todo.status === "completed" ? 0.5 : 1,
              textDecoration: todo.status === "completed" ? "line-through" : "none",
            }}
          >
            {todo.content}
          </Text>
        </Flex>
      ))}
    </Flex>
  );
};
