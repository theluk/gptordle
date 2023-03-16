// pages/_app.js
import { UserProvider } from "@/service/user";
import { ChakraProvider, theme } from "@chakra-ui/react";
import { AppProps } from "next/app";
import Head from "next/head";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="height=device-height, width=device-width, initial-scale=1.0"
        />
      </Head>

      <ChakraProvider
        theme={{
          ...theme,
          styles: {
            ...theme.styles,
            global: {
              ...theme.styles.global,
              body: {
                minHeight: "auto !important",
              },
            },
          },
        }}
      >
        <UserProvider>
          <Component {...pageProps} />
        </UserProvider>
      </ChakraProvider>
    </>
  );
}

export default MyApp;
