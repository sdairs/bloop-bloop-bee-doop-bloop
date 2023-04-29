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

let follows: Array<any> = [];

async function getfollows() {
  await agent.login({
    identifier: user,
    password: pass,
  });

  const profile = await agent.getProfile({ actor: "alasdairb.com" });
  const follow_count = profile.data.followsCount ?? 0;

  let cursor: string | undefined = undefined;
  while (true) {
    if (follow_count == 0 || follows.length >= follow_count) break;
    let response = await agent.getFollows({
      actor: "alasdairb.com",
      limit: 100,
      cursor: cursor,
    });
    console.log(`Got follows...${response.data.follows.length}`);
    follows.push(...response.data.follows);
    console.log(`Total follows...${follows.length}`);
    cursor = response.data.cursor;
    await new Promise((f) => setTimeout(f, 50));
  }
}

async function deleteFollows() {
  await agent.login({
    identifier: user,
    password: pass,
  });

  console.log("delete");
  let i = 0;
  for (let follower of follows) {
    console.log(i);
    i++;
    if (follower.viewer.following == undefined) {
      console.log("Skipping");
      continue;
    }
    let response = await agent.deleteFollow(follower.viewer.following);
    console.log(response);
    await new Promise((f) => setTimeout(f, 50));
  }
}

getfollows().then(() => {
  console.log(follows.length);
  deleteFollows();
});
