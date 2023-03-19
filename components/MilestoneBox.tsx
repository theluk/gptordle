import {
  Box,
  HStack,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Square,
  Text,
} from "@chakra-ui/react";
import Image from "next/image";

export function MilestoneRow({
  values,
}: {
  values: { score: number; label: string | null }[];
}) {
  const all0 = values.every((value) => value.score === 0);

  const comp = (
    <HStack justifyContent={"space-between"} flex={1}>
      {values.map((value, index) => (
        <MilestoneBox key={index} value={value.score} label={value.label} />
      ))}
    </HStack>
  );

  if (all0) {
    return (
      <Popover>
        <PopoverTrigger>{comp}</PopoverTrigger>
        <PopoverContent>
          <PopoverArrow />
          <PopoverCloseButton />
          <PopoverHeader>Similarity</PopoverHeader>
          <PopoverBody>
            Those indicators show how similar your question are to the searched
            word. The greener the indicator, the more similar your question is
            to the searched word.
            <Image
              src="/indicators.png"
              width={370}
              height={49}
              alt="indicators showing similarity"
            />
          </PopoverBody>
        </PopoverContent>
      </Popover>
    );
  }

  return comp;
}

function getColor(value: number): string {
  return value < 0.6 ? "red.500" : value < 0.8 ? "yellow.500" : "green.500";
}

// a square box initially gray, then based on a value, it has a progress growing from bottom to top, and the color gradually changes from red, to yellow, to gren
export function MilestoneBox({
  value,
  label,
}: {
  value: number;
  label: string | null;
}) {
  return (
    <Popover>
      <PopoverTrigger>
        <Box
          border={"1px solid"}
          borderColor={"gray.200"}
          borderRadius={"md"}
          overflow={"hidden"}
          position={"relative"}
          flex={1}
          h={"100%"}
        >
          <Box
            bg={getColor(value)}
            w={"100%"}
            h={`${value * 100}%`}
            position={"absolute"}
            bottom={0}
            left={0}
            transition={"all 0.5s ease"}
          />
        </Box>
      </PopoverTrigger>
      {label && (
        <PopoverContent>
          <PopoverArrow />
          <PopoverCloseButton />
          <PopoverHeader>
            <Text>🎉 You reached a milestone!</Text>
          </PopoverHeader>
          <PopoverBody>
            <Text>
              You guessed <b>&quot;{label}&quot;</b> correctly
            </Text>
          </PopoverBody>
        </PopoverContent>
      )}
    </Popover>
  );
}
