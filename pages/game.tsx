import { RobotMessage, UserMessage } from "@/components/Chat";
import { SimilaritySlider } from "@/components/SimilaritySlider";
import { withAuth } from "@/components/WithAuth";
import { useTodayGameInfo } from "@/service/game";
import { useGameChat } from "@/service/useGameChat";
import {
  Box,
  Button,
  chakra,
  CircularProgress,
  Container,
  GlobalStyle,
  Grid,
  Heading,
  HStack,
  Input,
  List,
  ListIcon,
  ListItem,
  Stack,
  Text,
  UnorderedList,
} from "@chakra-ui/react";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { FaCheck, FaInfo } from "react-icons/fa";

function Game() {
  const [info, infoLoading, er] = useTodayGameInfo();

  const { chat, isComplete, input, setInput, ask } = useGameChat();

  const listRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      listRef.current?.children[
        listRef.current?.children.length - 1
      ].scrollIntoView({ behavior: "smooth" });
    }, 0);
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat]);

  const latestSimilarity = [...chat]
    .reverse()
    .find((c) => c.normalizedDistance);

  return (
    <>
      <Head>
        <title>GPTordle</title>
        <meta name="description" content="A chat based word guessing game" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <chakra.main>
        <Container
          p={{
            base: 0,
            sm: 4,
          }}
          display="flex"
          flexDir={"column"}
          pb={"100px"}
        >
          <Stack
            p={{
              base: 1,
              sm: 4,
            }}
            alignContent="center"
          >
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
            <>
              <Stack alignItems={"stretch"} spacing={0}>
                <Box
                  p={{
                    base: 1,
                    sm: 4,
                  }}
                  bg="beige"
                >
                  <Text fontSize={"small"} fontWeight="bold">
                    {new Date().toISOString().split("T")[0]}
                  </Text>
                  <Heading color="orange.400">{info.title}</Heading>
                  <Text>{info.message}</Text>
                </Box>
              </Stack>

              {!isComplete && chat.length ? (
                <Stack
                  flex={1}
                  spacing={4}
                  border={{
                    base: "none",
                    sm: "1px solid",
                  }}
                  ref={listRef}
                  borderColor={{
                    base: "none",
                    sm: "gray.200",
                  }}
                  p={4}
                  rounded={"md"}
                >
                  {chat.map((message, i) =>
                    message.role === "user" ? (
                      <>
                        <UserMessage
                          message={message.content}
                          isError={!!message.errorMessage}
                          isLoading={message.state === "loading"}
                          key={i}
                        />
                      </>
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
              ) : null}

              {isComplete ? (
                <Grid flex={1} placeContent="center">
                  <Stack alignItems={"center"}>
                    <Text fontSize={"4xl"}>🎉</Text>
                    <Heading>Yay congratulations</Heading>
                    <Text textColor={"gray.500"}>You guessed the word!</Text>
                  </Stack>
                </Grid>
              ) : null}

              {!isComplete && !chat.length ? (
                <Grid flex={1} placeContent="center">
                  <Stack alignItems={"center"}>
                    <Text fontSize={"4xl"}>🤔</Text>
                    <Heading>Ask a question</Heading>
                    <Text textColor={"gray.500"}>
                      <UnorderedList>
                        <ListItem>The AI is holding a secret word</ListItem>
                        <ListItem>
                          Ask questions to find out what it is
                        </ListItem>
                      </UnorderedList>
                    </Text>
                  </Stack>
                </Grid>
              ) : null}
            </>
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
        {!isComplete ? (
          <Container
            position={{
              base: "fixed",
              sm: "sticky",
            }}
            bottom={0}
          >
            <chakra.form
              mt={4}
              bg={"white"}
              borderTop={{
                base: "1px solid",
                sm: "none",
              }}
              borderColor={{
                base: "gray.200",
                sm: "none",
              }}
              pt={{
                base: 2,
                sm: 0,
              }}
              onSubmit={(e) => {
                e.preventDefault();
                ask();
              }}
            >
              {latestSimilarity?.normalizedDistance && (
                <SimilaritySlider
                  similarity={latestSimilarity.normalizedDistance}
                />
              )}
              <HStack
                px={{
                  base: 4,
                  sm: 0,
                }}
                pb={{
                  base: 4,
                }}
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
            </chakra.form>
          </Container>
        ) : null}
      </chakra.main>
    </>
  );
}

export default withAuth(Game);
