---
title: "JavaScript patterns - Pyramid of doom"
date: 2024-05-31
keywords: ["javascript", "patterns"]
---

In this post, I will introduce you to the concept of the pyramid of doom. Although the pattern is not typical anymore, it is good to know how you might solve this anti-pattern, as there are several ways to approach it. The pyramid of doom could be characterized as the JavaScript version of div soup familiar from HTML, where you have plenty of nesting obscuring meaning.

> I wrote my first book about JavaScript a decade ago, and it was called "Survive JavaScript - a Web Developer's Guide". [The content is still available at GitHub](https://github.com/survivejs/js_tricks_and_tips). While the book is severely outdated, there are still some good bits I thought might be nice to revisit and expand.

## Definition - Pyramid of doom

In the example below, I have illustrated what the pyramid of doom looks like using the original Node.js API callback style, where the first parameter captures a potential error. In contrast, the second parameter captures a possible value:

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

The name pyramid of doom derives directly from the shape of the code that resembles a pyramid in terms of nesting. Nesting is not good for code readability, making it more difficult to follow the logic.

If you came to the ecosystem late enough, you likely have never seen this convention. The convention vanished for a good reason, as we now have better ways to solve the problem of asynchronous chaining.

## First solution - `Promise`s

The pyramid of doom was initially solved by the introduction of [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) that allows wrapping asynchronous functionality behind a clean interface that resolves in a value eventually. The solution also provides error handling through its [catch method](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/catch). The example below uses promises to rewrite the example above in a more concise form:

```javascript
import db from "./db";

db.set("key1", "value1")
  .then(() => db.set("key2", "value2"))
  .then(() => db.set("key3", "value3"))
  .then(() => db.get("key1"))
  .then(value => console.log(value + 'bar'));
```

As you can see, it has far less code than the original example and shows the power of promises well.

## Second solution - `async` / `await`

To improve on promises further, a feature called [asynchronous functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function) was standardized. You could argue the new syntax has its faults due to partly magical behavior (as in, it's not always obvious what is happening under the hood), but still it allows us to simplify the example further:

```javascript
import db from "./db";

async function main() {
  await db.set("key1", "value1");
  await db.set("key2", "value2");
  await db.set("key3", "value3");

  return (await db.get("key1")) + 'bar';
}

main();
```

We have slightly more code here than in the promise case, but the flow is clear to read, at least. Essentially, it is still the same code but with syntax sugar on top. The important thing to keep in mind is that using that `async` keyword promisifies the result of your function.

In this case, I wrapped the functionality within a function as not all popular environments support top-level `async`/`await` yet. This wrapping can be avoided in some runtimes, such as [Deno](https://deno.com/).

## Third solution - `Promise.all`

The problem with the earlier solutions is that they are blocking execution while setting data. It may be potentially faster to run the operations simultaneously and [Promise.all](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all) method allows that as below:

```javascript
import db from "./db";

async function main() {
  await Promise.all([
    db.set("key1", "value1"),
    db.set("key2", "value2"),
    db.set("key3", "value3")]
  );

  return (await db.get("key1")) + 'bar';
}

main();
```

Technically speaking, the solution is not exactly the same, given that `Promise.all` can throw an exception if any of the operations fail, meaning that depending on the order of execution, some operations might go through or not. In the earlier solutions, the order is guaranteed, and depending on the use case, this may be an acceptable tradeoff.

An excellent way to solve this problem might be to wrap the operations within a transaction that allows the operations to be undone should any fail. The exact implementation method depends on the underlying API, and in this case, we could assume the database driver supports transactions directly.

## Error handling

 The main drawback of all the examples is that they need more error handling. It is easy to write `await`/`async` style code while forgetting to handle exceptions. It is good to remember that `await` works with `Promise`s internally, meaning you can use the standard [catch method](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/catch) with it (i.e., `await db.get("key1").catch(...)`). The same applies to `Promise.all`. You can also use the standard `try`/`catch` structure with these primitives and construct the type of error handling you prefer. The question is, what kind of errors do you want to handle and how.

## Conclusion

Our solutions went quite far from the pyramid of doom and ended up with somewhat flat solutions that are easy to interpret. Adding error handling would complicate them, but it is important to consider which error handling approach to take in production-level code to avoid leaking errors to the user. For a rough developer tool, leaking errors might be acceptable and even expected, but for anything client-facing, a good strategy should be decided.

The list of solutions here is not exhaustive, as you could try using a different programming model entirely. Reactive programming using a library, such as [RxJS](https://rxjs.dev/), would be an interesting direction. It provides an event bus, and you can decouple your events from their handling without having to introduce a library to your codebase.

