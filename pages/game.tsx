import { withAuth } from "@/components/WithAuth";
import { useTodayGameInfo } from "@/service/game";
import { useLoggedInUser } from "@/service/user";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  CircularProgress,
  Container,
  Grid,
  Heading,
  Stack,
  Text,
} from "@chakra-ui/react";
import Head from "next/head";
import Link from "next/link";

function Game() {
  const [info, infoLoading, er] = useTodayGameInfo();

  return (
    <>
      <Head>
        <title>GPTordle</title>
        <meta name="description" content="A chat based word guessing game" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main>
        <Container minHeight={"100vh"} display="flex" flexDir={"column"}>
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
            <Grid flex="1" placeContent="center">
              <Stack alignItems={"stretch"} spacing={0}>
                <Box p={8} bg="beige">
                  <Text fontSize={"small"} fontWeight="bold">
                    {new Date().toISOString().split("T")[0]}
                  </Text>
                  <Heading color="orange.400">{info.title}</Heading>
                  <Text>{info.message}</Text>
                </Box>
                <Alert>
                  <AlertIcon />
                  <AlertDescription>
                    The development is currently in progress. Please check back
                    later.
                  </AlertDescription>
                </Alert>
              </Stack>
            </Grid>
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
