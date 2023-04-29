<script lang="ts">
  import { BskyAgent } from "@atproto/api";

  const agent = new BskyAgent({
    service: "https://bsky.social",
    persistSession: (evt, sess) => {},
  });

  async function getFollowers() {
    await agent.login({
      identifier: import.meta.env.VITE_USER,
      password: import.meta.env.VITE_PASS,
    });

    const profile = await agent.getProfile({ actor: "alasdairb.com" });
    const follow_count = profile.data.followsCount ?? 0;

    let followers: Array<any> = [];

    let cursor = undefined;
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

  async function getAllActors() {
    await agent.login({
      identifier: "alasdairb.com",
      password: "nzfb-buwt-hyx4-lejl",
    });
    let cursor = undefined;
    let users = 0;
    while (true) {
      let response = await agent.searchActors({
        term: "a",
        limit: 100,
        cursor: cursor,
      });
      for (let e of response.data.actors) {
        console.log(`Following: ${e.did}`);
        let r = await agent.follow(e.did);
        console.log(r);
        await new Promise((f) => setTimeout(f, 5000));
      }
      users += response.data.actors.length;
      cursor = response.data.cursor;
      await new Promise((f) => setTimeout(f, 5000));
    }
  }
</script>

<h1>hello</h1>

<button on:click={getFollowers}>Get followers</button>
<button on:click={getAllActors}>Get all actors</button>
