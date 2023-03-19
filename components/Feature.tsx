import { Stack, Flex, Text } from "@chakra-ui/react";
import { ReactElement } from "react";
interface FeatureProps {
  title: string;
  text: string;
  icon: ReactElement;
}

export const Feature = ({ title, text, icon }: FeatureProps) => {
  return (
    <Stack>
      <Flex
        w={16}
        h={16}
        alignSelf={"center"}
        align={"center"}
        justify={"center"}
        color={"orange.400"}
        rounded={"full"}
        bg={"gray.100"}
        mb={1}
      >
        {icon}
      </Flex>
      <Text fontWeight={600}>{title}</Text>
      <Text color={"gray.600"}>{text}</Text>
    </Stack>
  );
};
