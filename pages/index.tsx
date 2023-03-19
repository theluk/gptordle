import Head from "next/head";

import {
  Box,
  Heading,
  Container,
  Text,
  Button,
  Stack,
  Icon,
  useColorModeValue,
  createIcon,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverHeader,
  PopoverBody,
  HStack,
  SimpleGrid,
} from "@chakra-ui/react";
import Link from "next/link";

import {
  FiHeart,
  FiCpu,
  FiHelpCircle,
  FiCalendar,
  FiSmile,
  FiTrendingUp,
  FiAward,
} from "react-icons/fi";

import Footer from "../components/footer";
import { useUser } from "@/service/user";
import { auth } from "@/service/firebase";
import { signInAnonymously } from "firebase/auth";
import { useRouter } from "next/router";
import PentagonChart from "@/components/PentagonChart";
import { Feature } from "@/components/Feature";

export default function Home() {
  const { loading } = useUser();
  const router = useRouter();

  const data = [
    { field: "Field1", value: 0.5 },
    { field: "", value: 0.8 },
    { field: "Field3", value: 0.1 },
    { field: "Field4", value: 0.9 },
    { field: "Field5", value: 0.5 },
  ];

  return (
    <>
      <Head>
        <title>WordGameAI.com</title>
        <meta name="description" content="A chat based word guessing game" />
      </Head>

      <Stack h="$100vh">
        <Container maxW={"3xl"} flex={1}>
          <Stack
            as={Box}
            flex="1"
            textAlign={"center"}
            spacing={{ base: 8, md: 14 }}
            py={{ base: 20, md: 36 }}
          >
            <Box>
              <Text
                color={"green.400"}
                fontWeight={"black"}
                fontSize={{ base: "lg", sm: "xl", md: "2xl" }}
              >
                WordGameAI.com
              </Text>
            </Box>
            <Heading
              fontWeight={600}
              fontSize={{ base: "2xl", sm: "4xl", md: "6xl" }}
              lineHeight={"110%"}
            >
              Ready for a Challenge? <br />
              <Text as={"span"} color={"orange.400"}>
                Let&apos;s play an Exciting Word Guessing Game!
              </Text>
            </Heading>
            <Text color={"gray.500"}>
              Can you guess the secret word in 10 questions or less?
            </Text>
            <Stack
              direction={"column"}
              spacing={3}
              align={"center"}
              alignSelf={"center"}
              position={"relative"}
            >
              <Button
                colorScheme={"green"}
                bg={"green.400"}
                rounded={"full"}
                px={6}
                _hover={{
                  bg: "green.500",
                }}
                isLoading={loading}
                onClick={() => {
                  signInAnonymously(auth).then(() => router.push("/game"));
                }}
              >
                Let&apos;s Play!
              </Button>
              <Popover>
                <PopoverTrigger>
                  <Button variant={"link"} colorScheme={"blue"} size={"sm"}>
                    Learn more
                  </Button>
                </PopoverTrigger>

                <PopoverContent>
                  <PopoverArrow />
                  <PopoverCloseButton />
                  <PopoverHeader>
                    <HStack spacing={3} alignItems="center">
                      <Icon as={FiHeart} color={"red.500"} />{" "}
                      <Text>Free & Open Source</Text>
                    </HStack>
                  </PopoverHeader>
                  <PopoverBody textAlign={"left"} as={Stack}>
                    <p>
                      This game is free and open source. You can find the source
                      code on{" "}
                      <Button
                        as={Link}
                        href="https://github.com/theluk/gptordle"
                        passHref
                        variant={"link"}
                        textDecoration={"underline"}
                      >
                        GitHub
                      </Button>
                    </p>
                    <Text fontSize={"lg"} fontWeight="black">
                      What is it about?
                    </Text>
                    <p>
                      We are in a game and I am your game opponent. I hold a
                      secret word that you need to guess using yes/no questions.
                    </p>
                    F
                  </PopoverBody>
                </PopoverContent>
              </Popover>
              <Box>
                <Icon
                  as={Arrow}
                  color={useColorModeValue("gray.800", "gray.300")}
                  w={71}
                  position={"absolute"}
                  right={-71}
                  top={"10px"}
                />
                <Text
                  fontSize={"lg"}
                  fontFamily={"Caveat"}
                  position={"absolute"}
                  right={"-70px"}
                  top={"-15px"}
                  transform={"rotate(10deg)"}
                >
                  Free
                </Text>
              </Box>
            </Stack>
            <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={10}>
              <Feature
                icon={<Icon as={FiCpu} w={10} h={10} />}
                title={"AI-Powered Opponent"}
                text={
                  "Experience a unique and engaging game with an AI-driven opponent, designed to challenge your wit and guessing abilities."
                }
              />
              <Feature
                icon={<Icon as={FiHelpCircle} w={10} h={10} />}
                title={"Yes or No Questions"}
                text={
                  "Use strategic yes or no questions to unravel the mystery of the daily secret word, testing your deductive reasoning and problem-solving skills."
                }
              />
              <Feature
                icon={<Icon as={FiCalendar} w={10} h={10} />}
                title={"Daily Secret Word"}
                text={
                  "All players receive the same secret word each day, providing a shared challenge and fostering a sense of community."
                }
              />
              <Feature
                icon={<Icon as={FiSmile} w={10} h={10} />}
                title={"Fun and Casual Gameplay"}
                text={
                  "Enjoy a light-hearted, entertaining game that&apos;s perfect for quick breaks, group activities, or friendly competition."
                }
              />
              <Feature
                icon={<Icon as={FiTrendingUp} w={10} h={10} />}
                title={"Color-Coded Progress Indicators"}
                text={
                  "Receive real-time feedback through colored indicators, letting you know how close or far you are from guessing the secret word for added gamification."
                }
              />
              <Feature
                icon={<Icon as={FiAward} w={10} h={10} />}
                title={"Upcoming Leaderboard"}
                text={
                  "Get ready for a leaderboard feature, which will showcase top performers and foster a competitive environment among players."
                }
              />
            </SimpleGrid>
          </Stack>
        </Container>
        <Footer />
      </Stack>
    </>
  );
}

const Arrow = createIcon({
  displayName: "Arrow",
  viewBox: "0 0 72 24",
  path: (
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M0.600904 7.08166C0.764293 6.8879 1.01492 6.79004 1.26654 6.82177C2.83216 7.01918 5.20326 7.24581 7.54543 7.23964C9.92491 7.23338 12.1351 6.98464 13.4704 6.32142C13.84 6.13785 14.2885 6.28805 14.4722 6.65692C14.6559 7.02578 14.5052 7.47362 14.1356 7.6572C12.4625 8.48822 9.94063 8.72541 7.54852 8.7317C5.67514 8.73663 3.79547 8.5985 2.29921 8.44247C2.80955 9.59638 3.50943 10.6396 4.24665 11.7384C4.39435 11.9585 4.54354 12.1809 4.69301 12.4068C5.79543 14.0733 6.88128 15.8995 7.1179 18.2636C7.15893 18.6735 6.85928 19.0393 6.4486 19.0805C6.03792 19.1217 5.67174 18.8227 5.6307 18.4128C5.43271 16.4346 4.52957 14.868 3.4457 13.2296C3.3058 13.0181 3.16221 12.8046 3.01684 12.5885C2.05899 11.1646 1.02372 9.62564 0.457909 7.78069C0.383671 7.53862 0.437515 7.27541 0.600904 7.08166ZM5.52039 10.2248C5.77662 9.90161 6.24663 9.84687 6.57018 10.1025C16.4834 17.9344 29.9158 22.4064 42.0781 21.4773C54.1988 20.5514 65.0339 14.2748 69.9746 0.584299C70.1145 0.196597 70.5427 -0.0046455 70.931 0.134813C71.3193 0.274276 71.5206 0.70162 71.3807 1.08932C66.2105 15.4159 54.8056 22.0014 42.1913 22.965C29.6185 23.9254 15.8207 19.3142 5.64226 11.2727C5.31871 11.0171 5.26415 10.5479 5.52039 10.2248Z"
      fill="currentColor"
    />
  ),
});
