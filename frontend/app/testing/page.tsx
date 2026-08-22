"use client";

import {
  createDrop,
  createDropWithFiles,
  getDrop,
  getDrops,
  uploadDropFile,
} from "@/lib/api/drops";
import { createGuestDropWithFile } from "@/lib/api/guest";
import { getSharedDrop } from "@/lib/api/share";

export default function ApiTest() {
  async function testCreateDrop() {
    const drop = await createDrop({
      title: "Frontend test Drop",
      content: "Created from Next.js",
      expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      max_views: 3,
    });

    console.log(drop);
  }

  async function testSharedDrop() {
    const result = await getDrops();

    console.log(result);

    if (result.items.length > 0) {
      const drop = await getDrop(result.items[0].id);
      console.log(drop);
    }
  }

  return (
    <>
      <button onClick={() => void testSharedDrop()}>Open shared Drop</button>
      <input
        type="file"
        onChange={async (event) => {
          const file = event.target.files?.[0];

          const drop = await createGuestDropWithFile({
            drop: {
              title: "Guest frontend test",
              content: "Guest upload from Next.js",
              expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
              max_views: 1,
            },
            file,
          });

          console.log(drop);
        }}
      />
    </>
  );
}
