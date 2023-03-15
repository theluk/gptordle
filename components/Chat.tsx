import {
  Alert,
  AlertDescription,
  AlertIcon,
  Avatar,
  Box,
  CircularProgress,
  Flex,
  HStack,
  Stack,
  Text,
} from "@chakra-ui/react";
import { ReactElement, ReactNode } from "react";
import { FaUser } from "react-icons/fa";
import { FiCpu } from "react-icons/fi";

type MessageProps = {
  isLoading?: boolean;
  isError?: boolean;
  message: ReactNode;
  avatar: ReactElement;
  align: "left" | "right";
};

const Message = ({
  align,
  avatar,
  message,
  isError,
  isLoading,
}: MessageProps) => {
  return (
    <Flex
      alignItems={"flex-start"}
      justifyContent={align === "left" ? "flex-start" : "flex-end"}
      //
    >
      <Stack
        maxW="sm"
        alignItems={align === "left" ? "flex-start" : "flex-end"}
        order={align === "left" ? 2 : 1}
      >
        <Flex alignItems={"flex-start"} flexDirection={"column"}>
          <Box
            rounded={"lg"}
            py={2}
            px={4}
            display={"inline-block"}
            fontSize="lg"
            bg={align === "left" ? "gray.200" : "blue.500"}
            roundedTopLeft={align === "left" ? "none" : "lg"}
            roundedTopRight={align === "left" ? "lg" : "none"}
            textColor={align === "left" ? "black" : "white"}
          >
            {isError ? (
              <Alert status="error">
                <AlertIcon />
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            ) : isLoading ? (
              <HStack spacing={2} alignItems="center">
                <CircularProgress isIndeterminate color="green.400" />
                <Text>Thinking...</Text>
              </HStack>
            ) : null}
            {!isError && !isLoading ? message : null}
          </Box>
        </Flex>
      </Stack>
      <Avatar
        width={8}
        height={8}
        flexShrink={0}
        icon={avatar}
        mr={align === "left" ? 1 : 0}
        ml={align === "right" ? 1 : 0}
        order={align === "left" ? 1 : 2}
      />
    </Flex>
  );
};

export function RobotMessage(props: {
  message: ReactNode;
  isLoading?: boolean;
  isError?: boolean;
  className?: string;
}) {
  return <Message {...props} avatar={<FiCpu />} align="left" />;
}

export function UserMessage(props: {
  isLoading?: boolean;
  isError?: boolean;
  message: ReactNode;
  className?: string;
}) {
  return <Message {...props} avatar={<FaUser />} align="right" />;
}
