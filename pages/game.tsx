import { RobotMessage, UserMessage } from "@/components/Chat";
import { withAuth } from "@/components/WithAuth";
import { useTodayGameInfo } from "@/service/game";
import { useGameChat } from "@/service/useGameChat";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  Heading,
  HStack,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react";
import Head from "next/head";
import Link from "next/link";

function Game() {
  const [info, infoLoading, er] = useTodayGameInfo();

  const { chat, input, setInput, ask } = useGameChat();

  return (
    <>
      <Head>
        <title>GPTordle</title>
        <meta name="description" content="A chat based word guessing game" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main>
        <Container
          p={{
            base: 0,
            sm: 4,
          }}
          minHeight={"100vh"}
          maxHeight={"100vh"}
          display="flex"
          flexDir={"column"}
        >
          <Stack p={4} alignContent="center">
            <Text
              as={Link}
              href="/"
              textAlign={"center"}
              color={"green.400"}
              fontWeight={"black"}
              fontSize={{ base: "lg", sm: "xl", md: "2xl" }}
            >
              GPTordle
            </Text>
          </Stack>
          {infoLoading ? (
            <Grid flex={1} placeContent="center">
              <CircularProgress isIndeterminate color="green.400" />
            </Grid>
          ) : null}

          {info ? (
            <Stack flex="1" maxH={"100vh"}>
              <Stack alignItems={"stretch"} spacing={0}>
                <Box p={8} bg="beige">
                  <Text fontSize={"small"} fontWeight="bold">
                    {new Date().toISOString().split("T")[0]}
                  </Text>
                  <Heading color="orange.400">{info.title}</Heading>
                  <Text>{info.message}</Text>
                </Box>
              </Stack>
              <Stack
                flex={1}
                spacing={4}
                border={{
                  base: "none",
                  sm: "1px solid",
                }}
                borderColor={{
                  base: "none",
                  sm: "gray.200",
                }}
                p={4}
                rounded={"md"}
                overflowY={"auto"}
              >
                {chat.map((message, i) =>
                  message.role === "user" ? (
                    <UserMessage
                      message={message.content}
                      isError={!!message.errorMessage}
                      isLoading={message.state === "loading"}
                      key={i}
                    />
                  ) : (
                    <RobotMessage
                      message={message.content}
                      isError={!!message.errorMessage}
                      isLoading={message.state === "loading"}
                      key={i}
                    />
                  )
                )}
              </Stack>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  ask();
                }}
              >
                <HStack
                  px={{
                    base: 4,
                    sm: 0,
                  }}
                  pb={process.env.NEXT_PUBLIC_EMULATE ? 124 : 0}
                  alignItems="center"
                  justifyContent="center"
                  flexDirection={"row"}
                >
                  <Input
                    required
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask a question"
                  />
                  <Button type="submit">Ask</Button>
                </HStack>
              </form>
            </Stack>
          ) : null}

          {!info && !infoLoading ? (
            <Grid minHeight={"100vh"} placeContent="center">
              <Stack alignItems={"center"}>
                <Text fontSize={"4xl"}>😥</Text>
                <Heading>No game today</Heading>
                <Text textColor={"gray.500"}>... yet 🤫</Text>
              </Stack>
            </Grid>
          ) : null}
        </Container>
      </main>
    </>
  );
}

export default withAuth(Game);
