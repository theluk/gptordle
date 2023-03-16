import { Avatar, Box } from "@chakra-ui/react";
import { motion } from "framer-motion";

type Props = {
  /** a number between 0.0 and 1.0 */
  similarity: number;
};

/**
 * A horizontal slider that shows the similarity between two words.
 * When the slider is below 0.4 it is red, between 0.4 and 0.6 it is yellow, and above 0.6 it is green.
 * On each position, an icon is shown to indicate the similarity.
 * Below 0.4, the icon 🥶 is shown. Between 0.4 and 0.6, the icon 🤔 is shown. Between 0.6 and 0.8 the icon 😃 is shown. Above 0.8, the icon 🥳 is shown.
 */
export function SimilaritySlider({ similarity }: Props) {
  return (
    <Box display="flex" alignItems="center" justifyContent="center">
      <Avatar
        size="md"
        bg={"transparent"}
        icon={
          similarity < 0.4 ? (
            <Box as="span" role="img" aria-label="cold">
              🥶
            </Box>
          ) : similarity < 0.6 ? (
            <Box as="span" role="img" aria-label="thinking">
              🤔
            </Box>
          ) : similarity < 0.8 ? (
            <Box as="span" role="img" aria-label="smile">
              😃
            </Box>
          ) : (
            <Box as="span" role="img" aria-label="party">
              🥳
            </Box>
          )
        }
      />
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        w="100%"
        h={8}
        bg="gray.200"
        borderRadius="lg"
        position={"relative"}
      >
        <Box
          as={motion.div}
          animate={{
            width: `${similarity * 100}%`,
          }}
          h={3}
          bg={
            similarity < 0.4
              ? "red.400"
              : similarity < 0.6
              ? "yellow.400"
              : "green.400"
          }
          borderRadius="md"
        />
      </Box>
    </Box>
  );
}
