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

let followers: Array<any> = [];

async function getFollowers() {
  await agent.login({
    identifier: user,
    password: pass,
  });

  const profile = await agent.getProfile({ actor: "alasdairb.com" });
  const follow_count = profile.data.followsCount ?? 0;

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
    await new Promise((f) => setTimeout(f, 50));
  }
  console.log(followers.length);
}

// async function getFollowers() {
//   await agent.login({
//     identifier: user,
//     password: pass,
//   });

//   const profile = await agent.getProfile({ actor: "alasdairb.com" });

//   let response = await agent.getFollowers({
//     actor: "alasdairb.com",
//     limit: 10,
//   });
//   console.log(`Getting followers...${followers.length}`);
//   followers.push(...response.data.followers);
//   console.log(followers.length);
// }

async function deleteFollows() {
  await agent.login({
    identifier: user,
    password: pass,
  });

  console.log("delete");
  let i = 0;
  for (let follower of followers) {
    console.log(i);
    i++;
    if (!follower.viewer.following) continue;
    let response = await agent.deleteFollow(follower.viewer.following);
    await new Promise((f) => setTimeout(f, 50));
  }
}

getFollowers().then(() => deleteFollows());
