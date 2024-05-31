---
title: "JavaScript patterns - Pyramid of doom"
date: 2024-05-31
keywords: ["javascript", "patterns"]
---

I wrote my first book on JavaScript a decade ago and it was called "Survive JavaScript - a Web Developer's Guide". [The content is still available at GitHub](https://github.com/survivejs/js_tricks_and_tips) although it's severely outdated by now. That said, I thought it might be interesting to look how some of the content has evolved and give it a refresh. Who knows, maybe I'll evolve the content later on into a small book of its own.

The first pattern, or let's say anti-pattern, I want to cover is called the pyramid of doom. You could say it's the JavaScript version of div soup. Next I'll show you what the pyramid is and what are the current solutions to solving it.

## Pyramid of doom defined

In the example below, I have illustrated what the pyramid of doom looks like by using original Node.js API callback style where the first parameter captures a potential error while the second parameter captures a possible value:

```javascript
import db from "./db";

db.set("key1", "value1", (err) => {
  if(err) {
    throw err;
  }

  db.set("key2", "value2", (err) => {
    if(err) {
      throw err;
    }

    db.set("key3", "value3", (err) => {
      if(err) {
        throw err;
      }

      db.get("key1", (err, value) => {
        if(err) {
          throw err;
        }

        console.log(value + 'bar');
      });
    });
  });
});
```

The name pyramid of doom derives directly from the shape of the code that resembles a pyramid in terms of nesting. You could argue nesting is not good for code readability and makes it more difficult to follow the logic.

In case you came to the ecosystem late enough, it is likely you have never seen this type of convention. The convention vanished for a good reason as now we have better ways to solve the problem of asynchronous chaining.

## First solution - Promises

Pyramid of doom was initially solved by the introduction of [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) that allow wrapping asynchronous functionality behind a clean interface that resolves in a value eventually. The solution also allows error handling through its [catch method](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/catch). The example below uses promises to rewrite the example above in a more succinct form:

```javascript
import db from "./db";

db.set("key1", "value1")
  .then(() => db.set("key2", "value2"))
  .then(() => db.set("key3", "value3"))
  .then(() => db.get("key1"))
  .then(value => console.log(value + 'bar'));
```

As you can see, it is far less code than in the original example and shows the power of promises well.

## Second solution - Async/await

To improve on promises further, a feature called [asynchronous functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) was standardized. You could argue the new syntax has its faults due to partly magical behavior (as in, it's not always obvious what is happening under the hood), but still it allows us to simplify the example further:

```javascript
import db from "./db";

async function operate() {
  await db.set("key1", "value1");
  await db.set("key2", "value2");
  await db.set("key3", "value3");

  return (await db.get("key1")) + 'bar';
}

operate();
```

We have slightly more code here than in the promise case but the flow is clear to read at least. Essentially it is still the same code but with syntax sugar on top.

Note that I wrapped the functionality within a function in this case as not all popular environments support top-level async/await yet. In some cases this wrapping could be avoided.

## Caveats of the solutions

blocking
error handling
