import { RobotMessage, UserMessage } from "@/components/Chat";
import { MilestoneBox, MilestoneRow } from "@/components/MilestoneBox";
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
  OrderedList,
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

  const { chat, pentagon, isComplete, input, setInput, ask } = useGameChat();

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
        <title>WordGameAI.com</title>
        <meta name="description" content="A chat based word guessing game" />
      </Head>
      <Grid
        as="main"
        templateRows={"1fr auto"}
        height="$100vh"
        overflow={"hidden"}
      >
        <chakra.div overflowY={"auto"}>
          <Container
            p={{
              base: 0,
              sm: 4,
            }}
            display="flex"
            flexDir={"column"}
            height="100%"
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
                WordGameAI.com
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
                      base: 4,
                      sm: 4,
                    }}
                    bg="beige"
                  >
                    <Text fontSize={"small"} fontWeight="bold">
                      {new Date().toISOString().split("T")[0]}
                    </Text>
                    <Heading color="orange.400" mb={2}>
                      Welcome &amp; Have Fun!
                    </Heading>
                    <Text as="b">Before we begin, here are some notes</Text>
                    <OrderedList spacing={2} mt={4}>
                      <ListItem>
                        The <b>AI opponent</b> thinks of a secret word.
                      </ListItem>
                      <ListItem>
                        <b>Users</b> guess the secret word by asking yes or no
                        questions.
                      </ListItem>
                      <ListItem>
                        Logical or mathematical questions{" "}
                        <em>may be misinterpreted</em> by the AI, so it&apos;s
                        best to <b>ask straightforward questions</b>.
                      </ListItem>
                      <ListItem>
                        The game is intended to be a <b>fun</b> and engaging
                        experience, rather than a rigorous test of knowledge or
                        logic.
                      </ListItem>
                      <ListItem>
                        Users should be aware that the AI&apos;s answers may
                        sometimes be <b>misleading or ambiguous</b>.
                      </ListItem>
                      <ListItem>
                        The AI&apos;s knowledge is <b>limited</b> to information
                        up to September 2021, which may affect the choice of
                        secret words and the answers provided.
                      </ListItem>
                    </OrderedList>
                  </Box>
                </Stack>

                {!isComplete ? (
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
                    justifyContent={"flex-end"}
                  >
                    {chat.length === 0 && (
                      <RobotMessage
                        message={`
                    Hello! Welcome to the guessing game. Please ask a yes/no question to start guessing the secret word.
                    
                    `}
                      />
                    )}
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
        </chakra.div>
        {!isComplete ? (
          <Container>
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
              <HStack alignItems={"stretch"} my={2}>
                <MilestoneRow values={pentagon} />
                <SimilaritySlider
                  similarity={latestSimilarity?.normalizedDistance}
                />
              </HStack>
              <HStack
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
                <Button
                  type="submit"
                  display={{
                    base: "none",
                    sm: "flex",
                  }}
                >
                  Ask
                </Button>
              </HStack>
            </chakra.form>
          </Container>
        ) : null}
      </Grid>
    </>
  );
}

export default withAuth(Game);
