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

async function getFollowers() {
  await agent.login({
    identifier: user,
    password: pass,
  });

  const profile = await agent.getProfile({ actor: "alasdairb.com" });
  const follow_count = profile.data.followsCount ?? 0;

  let followers: Array<any> = [];

  let cursor: string | undefined = undefined;
  while (true) {
    if (follow_count == 0 || followers.length >= follow_count) break;
    let response = await agent.getFollowers({
      actor: "alasdairb.com",
      limit: 100,
      cursor: cursor,
    });
    console.log(`Getting followers...${followers.length}`);
    followers.push(...response.data.followers);
    cursor = response.data.cursor;
  }
  console.log(followers.length);
}

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
        await new Promise((f) => setTimeout(f, 1000));
      }
      users += response.data.actors.length;
      cursor = response.data.cursor;
      await new Promise((f) => setTimeout(f, 2000));
    }
  }
}