"use client";
import axios from "axios";
import styles from "./page.module.css";
import { ChangeEvent, useRef, useState } from "react";
import { OpenAiPollingbehavior } from "./types";

export default function Home() {
  const [personId, setPersonId] = useState<
    "1063423088051438" | "1591457695102340"
  >("1063423088051438");
  const inputRef = useRef<HTMLInputElement>(null);
  const [pollingBehavior, setPollingBehavior] =
    useState<OpenAiPollingbehavior>("recursive");

  function handleChangePerson(e: ChangeEvent<HTMLInputElement>) {
    setPersonId(e.target.value as typeof personId);
  }

  function handleChangeBehavior(e: ChangeEvent<HTMLInputElement>) {
    setPollingBehavior(e.target.value as OpenAiPollingbehavior);
  }

  function handleSubmit() {
    const message = inputRef.current?.value;
    if (!message) {
      return;
    }
    axios
      .get(
        `/api/simulate-send?personId=${personId}&messageText=${message}&pollingBehavior=${pollingBehavior}`
      )
      .finally(() => {
        inputRef.current!.value = "";
      });
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <p>message will arrive on instagram to:</p>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "1rem",
          }}
        >
          <div>
            <input
              type="radio"
              id="diego"
              name="drone"
              value="1063423088051438"
              onChange={handleChangePerson}
              checked={personId === "1063423088051438"}
            />
            <label htmlFor="diego">Diego</label>
          </div>
          or
          <div>
            <input
              type="radio"
              id="max"
              name="drone"
              value="1591457695102340"
              onChange={handleChangePerson}
              checked={personId === "1591457695102340"}
            />
            <label htmlFor="dewey">Max</label>
          </div>
        </div>
        <p>and behavior is</p>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "1rem",
          }}
        >
          <div>
            <input
              type="radio"
              id="recursive"
              name="recursive"
              value="recursive"
              onChange={handleChangeBehavior}
              checked={pollingBehavior === "recursive"}
            />
            <label htmlFor="recursive">Recursive</label>
          </div>
          or
          <div>
            <input
              type="radio"
              id="long-task"
              name="long-task"
              value="long-task"
              onChange={handleChangeBehavior}
              checked={pollingBehavior === "long-task"}
            />
            <label htmlFor="long-task">Long-Task</label>
          </div>
        </div>

        <input type="text" placeholder="Message..." ref={inputRef} />
        <button onClick={handleSubmit}>Chiedi</button>
      </main>
    </div>
  );
}
