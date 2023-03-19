import { arrayUnion, setDoc, updateDoc } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { PlayMessage, usePlay } from "./play";

type GameChat = {
  isComplete: boolean;
  chat: PlayMessage[];
  pentagon: {
    score: number;
    label: string | null;
  }[];
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
    pentagon: play?.data()?.pentagon || [
      {
        score: 0,
        label: null,
      },
      {
        score: 0,
        label: null,
      },
      {
        score: 0,
        label: null,
      },
      {
        score: 0,
        label: null,
      },
      {
        score: 0,
        label: null,
      },
    ],
    isComplete: play?.data()?.isComplete || false,
    chat: useMemo(() => play?.data()?.chat || [], [play]),
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
            pentagon: [],
          });
        } else {
          await updateDoc(play.ref, {
            chat: [...play.data().chat, nextMessage],
          });
        }

        setInput("");
      }
    },
  };
}
