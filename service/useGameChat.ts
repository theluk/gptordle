import { arrayUnion, setDoc, updateDoc } from "firebase/firestore";
import { useState } from "react";
import { PlayMessage, usePlay } from "./play";

type GameChat = {
  isComplete: boolean;
  chat: PlayMessage[];
  input: string;
  setInput: (input: string) => void;
  ask: () => void;
};

export function useGameChat(): GameChat {
  const [play] = usePlay();

  const [input, setInput] = useState("");

  return {
    input,
    setInput,
    isComplete: play?.data()?.isComplete || false,
    chat: play?.data()?.chat || [],
    ask: async () => {
      if (play) {
        if (input.length < 2) {
          return;
        }

        const nextMessage: PlayMessage = {
          content: input,
          errorMessage: null,
          role: "user",
          state: "success",
        };

        if (!play.exists()) {
          await setDoc(play.ref, {
            chat: [nextMessage],
            isComplete: false,
          });
        } else {
          console.log("appending", nextMessage);
          await updateDoc(play.ref, {
            chat: [...play.data().chat, nextMessage],
          });
        }

        setInput("");
      }
    },
  };
}
