import { BskyAgent } from "@atproto/api";
import dotenv from "dotenv";

dotenv.config();

const user: string = process.env.ATP_USER ?? "";
const pass: string = process.env.ATP_PASS ?? "";

if (user == "" || pass == "") process.exit();

const agent = new BskyAgent({
  service: "https://bsky.social",
  persistSession: (evt, sess) => {},
});

async function followAll() {
  await agent.login({
    identifier: user,
    password: pass,
  });
  let cursor: string | undefined = undefined;
  let users = 0;
  const alphabets = [...Array(26).keys()].map((n) =>
    String.fromCharCode(97 + n)
  );
  const numbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
  while (true) {
    for (let searchTerm of alphabets.concat(numbers)) {
      console.log(searchTerm);
      let response: any = await agent
        .searchActors({
          term: searchTerm,
          limit: 100,
          cursor: cursor,
        })
        .catch((e) => console.log(e));
      for (let e of response.data.actors) {
        console.log(`Following: ${e.did}`);
        let r = await agent.follow(e.did);
        console.log(r);
        await new Promise((f) => setTimeout(f, 50));
      }
      users += response.data.actors.length;
      cursor = response.data.cursor;
      await new Promise((f) => setTimeout(f, 50));
    }
  }
}
