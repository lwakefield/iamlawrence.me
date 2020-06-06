title: The "old" way and commentary on Deno
published: 2020/06/06

---

Writing software for the internet has come a long way since I started ~10 years ago. The "frontend" and the "backend" have moved further apart, which is positive in terms of "separation of concerns" but negative in terms of the moving parts necessary for a website.

As the title suggests, this post is going to be about two things: "the old way of writing internet software" and "my experiences with Deno". This is not intended as a critique, just "some person's" experiences.

I took [Deno](https://deno.land/) for a spin around the block. Deno is a new runtime for JavaScript and TypeScript - it is directly comparable to node.js. Before scoffing at "yet another JavaScript thingy" - it is worth noting that Deno is authored by Ryan Dahl, who is the original author of node.js. I don't know Ryan personally, but I do know he ["hates almost all software"](https://tinyclouds.org/rant.html) and ["has regrets about fundamental design choices made for node.js"](https://tinyclouds.org/rant.html).

Deno is a result of Ryan's efforts to fix fundamental flaws with node.js.

Deno is not a new programming language. If you know JavaScript or TypeScript, you can run `deno` and be dropped into a REPL which you are familiar with.

## The "Old" Way

Let's switch gears away from Deno. When playing with a new technology, I like to implement a toy project. I try to choose an un-ambitious project, so that I can focus on learning and experiencing the tech instead of doing creative thinking or problem solving. For Deno, I built Detwit - a twitter clone which you can find [here](https://github.com/lwakefield/detwit). You can make posts, follow users and react to stuff - nothing too complicated at all. I also made a decision _to have no browser-side JavaScript_.


![A screenshot of detwit](https://user-images.githubusercontent.com/5688923/83943441-28ebdd00-a7ca-11ea-94fd-121a09d89e0d.png)

I like the idea of a website that runs without browser-side JavaScript. The website which hosts this blog can run without JavaScript enabled. Though, I don't think I have ever written a website that intentionally runs without JavaScript, because the last website that I did this for, "no JavaScript" wasn't an intentional choice - it was just the way it was done.

I was expecting this to be annoying - having to deal with a lack of tooling to do simple things. But it wasn't. _It was liberating and everything just worked_.

The contemporary model for a website can be described as: "A JavaScript application is loaded in the browser then listens for interactions from the user. When data or changes are required, an HTTP request is made to an api (usually in JSON form). When a response is received from the api, the application must update the state, and the UI".

Without JavaScript, the "old" model is not able to talk to the server without navigating away from the current location. Interactions with the server are instead done with good ol' `<form>` so the model can be described as "A websites contains forms. When a form is submitted to the server, the server persists those changes and then tells the browser what to do next (either by returning some HTML or a 30X)".

I think many have been tricked by the many layers of tooling required for modern development. "hot-reloading" never "just works" for me. It might have at some point, but nowadays, I make a change to the code, wait for the browser to pick it up, it usually doesn't, then I reload the browser. When working on Detwit, I used `watchexec restart -s SIGKILL deno server.ts`[0] - every time the code changed I would wait a few hundred milliseconds for the code to compile, then reload the browser and my changes would be there. This way ended up being faster, and I knew exactly what was happening.

I broke a lot of rules with CSS as well - and it felt good. Instead of `import ./styles.css` somewhere, I used `<style>` and `style=""`. There are issues with this of course: lots of duplication, no re-usability, poor browser-compatibility, inability to cache styles and other performance benefits. But it was fast and there were no flashes of unstyled content while developing.

What stood out to me the most, was _how fast everything was_. When I hit the "post" or "like" button it felt like the changes were instantaneous. I cannot remember the last time I felt this way in a modern web application. Usually it goes like this: you click the button, there is a loading indicator, then a pretty "success" toast animates and finally the UI updates so that I can see the result of my interaction.

Of course, this is not a fair comparison - I am developing locally - there is a nominal amount of latency in what I am doing between the browser and the server, and the server and the database. The biggest difference here, is the JavaScript in the browser. Every time I load a new modern web application, you can _feel_ the browser chugging along trying to get the JavaScript parsed and interpreted so that you can actually see something. Every time you interact, it is the same thing - chugging while JavaScript is interpreted and waiting on network requests, then finally you get some visual feedback. With no JavaScript in the browser, you simply don't feel those pains.

It was nice to not have to worry about managing state. Every request that comes into the server has the state fetched, the page is rendered and the browser need not worry about state at all.

This might read like a rant and maybe it is, but I do appreciate that JavaScript _is_ needed in the browser and is not going anywhere. The Detwit toy project, is just that - a toy. It is _dead_ simple right now and also missing functionality like error messages or persisting form data across reloads. For anything that requires more complicated interactions (think multi-step forms, or auto-saving a big document), JavaScript in the browser is going to be a necessary evil.

## Commentary on Deno

First off, deno is easy to set up. You browse to the homepage, and the install instructions are there for a handful of platforms. I'm running on MacOS, so I can just run `brew install deno`. I hope that Deno aims to maintain backward compatibility. If this is not the case, I am guessing I can download deno locally to projects since it ships as a single executable?

Top-level `await` works as you would expect. Too often in node.js, I am writing a one-off script and the first function I call returns a function meaning I either need to suffer `.then` or use an `async function main() {}; main();` approach. It is nice to know that deno works as expected here.

For Detwit, I wanted to minimize the number of third-party packages a) because `yarn add some-package-i-just-googled-for` is a plague and b) I wanted to gain experience with the stdlib. Primarily, I worked with the [http](https://deno.land/std/http) library. To get an http server running is simple enough:

```
import { serve } from "https://deno.land/std@0.55.0/http/server.ts";
const s = serve({ port: 8000 });
console.log("http://localhost:8000/");
for await (const req of s) {
  req.respond({ body: "Hello World\n" });
}
```

However, as I started to do more, it became apparent that the API here was either a) intentionally sparse or b) yet to be developed further. On the [deno runtime docs](https://doc.deno.land), there is a global `Request` class, which appears to have a number of useful functions like `formData(): Promise<FormData>;`. The `http` library uses a different api with a `ServerRequest` class which is far slimmer than the global `Request` object. So at this point, I grabbed the third-party [`multiparser`](https://deno.land/x/multiparser). Looking at that [library](https://deno.land/x/multiparser/std/http), it seems that it pulls in the entire deno stdlib (is that common?). I also wanted to use the equivalent of node's `__dirname`, but `const __filename = new URL('', import.meta.url).pathname;` was the closest I got.

As another toy project, I wanted to write something similar to [pm2](https://pm2.keymetrics.io/) with deno. Part of this project required using `fork`, which was not implemented at the time - so I considered the project dead on arrival.

The standard library lacked the functionality I expected. I didn't fully understand the separation between "runtime" and "standard library" documentation.

With those negative pieces of feedback out of the way - the documentation is pretty and easy to read and I _love_ that the intent is to (loosely) port Go's standard library to Deno - I have found node's standard library to be lacking.

There is no `package.json` to define third-party modules in Deno. Instead, you import directly from a url: `import { multiParser } from 'https://deno.land/x/multiparser/mod.ts';`. When you `deno run myfile.ts`, the dependencies are downloaded (to where, I don't know). The implications of this aren't entirely clear to me yet. To pin a version, do I need to make sure all my `import`s use that version? It also appears that the standard library is distributed as a third-party library and will need to be downloaded on first-run. None of these questions are particularly difficult to answer. I found it _easier_ than node to pull in a third-party library. I am hoping that over time, the standard library will cover a lot of cases that third-party modules cover in node.js, decreasing the need for third-party libraries.

It is nice to know that Deno is "secure" by default. I ended up using the `--allow-net --allow-env --allow-read` flags. I like that I need to be explicit about what my application is going to be accessing. Just the action of saying "I am allowing my application to read files", forces you to think "is there anything else that might maliciously read files?". It looks like you can [control granularity for permissions](https://deno.land/manual/getting_started/permissions#permissions-whitelist) as well. I would love to see the granularity extended to third-party modules, so that you can say "yes it is okay for `aws-sdk` to read files, it looks for my `.aws` credentials", but "if `leftpad` starts trying to run a subprocess, we have a problem".

I am tired of configuring tools in node, so default support for TypeScript is huge.

I write most of my code in neovim with [coc.nvim](https://github.com/neoclide/coc.nvim) for auto-complete. It didn't like jumping right into a deno project. That is probably a vim thing, I didn't look into it too much.

## So...?

Well after this excursion, here are my thoughts.

I have a low tolerance for "things being slow" and one of those things is modern JavaScript development. For this one-day project, I felt far more productive without JavaScript in the browser. For future personal projects, I will probably continue to _not_ use JavaScript in the frontend unless it is absolutely needed.

I enjoyed my experiences with Deno. I hope the [call to re-implement TypeScript in Rust](https://deno.land/v1#tsc-bottleneck) is taken seriously. I will be looking for opportunities to use Deno again especially since there are many aspects/features/experiences I have not covered yet. Even with a young standard library, and an ecosystem that has yet to grow - I would say that working with `deno` was a marked improvement from whatever mess of `package.json`, `.babelrc` and `tsconfig.json` I was using previously.

---

[0] Actually I used `watchexec -s SIGKILL --restart 'POSTGRES_URI="postgres://postgres:passowrd@localhost:5555" deno run --allow-net --allow-env --allow-read server.ts'` but keeping it short better illustrated the point I was trying to make.
