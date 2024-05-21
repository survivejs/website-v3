---
title: "SurviveJS - What did I learn by rewriting this site"
date: 2024-05-21
keywords: ["survivejs", "website", "javascript"]
---

If you have used this site earlier, you might have noticed it looks different now. That is because I did a massive rewrite of it. I had the following targets with the work:

1. The new site should build faster - I built the old one with [Antwar](https://antwar.js.org/), my now deprecated site generator, and it took 17 minutes to build on top of Cloudflare
2. The site should use a saner styling approach - the old one used [SCSS](https://sass-lang.com/) and separate CSS files, which goes against my current philosophy of styling and building websites
3. The new site should be lighter - although the old site was relatively light, I realized there are ways to slim it down further
4. The new site should reflect my current profile better as it goes beyond [books](/books/)

Instead of using mainstream technologies, I built most of the tooling that powers this site. In this post, I'll cover how I addressed each of the goals while showcasing the new tooling. The tooling is probably not mainstream-friendly, but not all is meant to be.

## From Antwar to Gustwind, a new site generator

As mentioned, I chose to completely rewrite the new site. It was likely a more significant project than I anticipated, and it took a couple of tries and smaller projects to find a comfortable place. Before doing this site, I used smaller sites such as [Future Frontend](https://futurefrontend.com/) and [JSter](https://jster.net/) as my prototyping grounds as there was less work to do. Especially when doing exploratory work, you want to avoid being bogged in details, so this was a good approach that helped me discover core concepts for my new tooling.

My earlier tool, Antwar, was built around [webpack](https://webpack.js.org/) and [React](https://react.dev/). As a unique feature at the time, it included what I call `Interactive` sections that became alive on their own on top of a static backdrop. Since then, tools like [Astro](https://astro.build/) have formalized the concept as the [islands architecture](https://jasonformat.com/islands-architecture/).

Gustwind, the new tool I cover next, has worked well for this site. One of the main benefits is that it builds the entire site (about 400 pages as of writing) in less than two minutes using Cloudflare Pages infrastructure, which is fast enough for now. There is a lot of potential for improvements should I need them, as I do not currently leverage caching, for example.

Gustwind has been built with incremental compilation in mind, although I still need to implement the feature. The idea would be to compile only pages affected by the latest changes since the previous compilation and overlay the new build on top of the previous one. In ideal cases, this should provide a 40% improvement in build time, as Cloudflare Pages currently spend roughly half of the build time installing project dependencies (Deno, etc.). If I could figure out how to cache build dependencies, that would be another big win for the project.

## Gustwind - HTMLisp-driven site generator

With my new tool, [Gustwind](https://gustwind.js.org/), the primary design constraint was creating websites that could be modified on top of the web itself. Although I have yet to reach this goal fully, I have built the tool with this constraint in mind to achieve the goal one day, should I want to. Due to the constraint, I started by defining the entire site using JSON, as it is easy to serialize and send across the client and the server. I wrote a small editor to manipulate the site in a browser in an early prototype. Even then, I wrote the early sites with Gustwind using Visual Code while having a simple refresh process to update the browser window when changing code to have a good feedback loop.

Eventually, I arrived at several vital problems I had to address in my solution: templating, routing, and data sourcing. I also had to consider development and production modes and how the tool is structured. Although I wrote it as a monolith initially, I eventually refactored it as plugins to give flexibility and allow easier experimentation.

One non-technical goal of the project was to learn a lot about [Deno](https://deno.com/) and [Cloudflare Pages](https://pages.cloudflare.com/). As a side effect, I was exposed to [Cloudflare Workers](https://workers.cloudflare.com/) and began understanding their value and usefulness.

### Templating - HTMLisp, HTML combined with Lisp

After the early prototype sites, I became tired of writing my sites in JSON, so I decided to port the tool to HTML instead. The problem is that basic HTML lacks several basic features I was expecting. Most importantly, I needed components, an ability to bind data to HTML structure, and iteration helpers, not to mention smaller ergonomic things. That is fine as HTML was never designed with this sort of usage in mind, so I expanded HTML by merging it with [Lisp](https://en.wikipedia.org/wiki/Lisp_(programming_language)) and calling the new creation as [HTMLisp](https://gustwind.js.org/templating/). If you are not familiar with Lisp, it is a simple language that allows you to build complex applications as it captures the critical concept of function application. Most importantly, it is easy to write a Lisp, so it was a good choice for me. In the example below, I show you how you can use a component while binding data:

```html
<div>
  <SiteLink
    &children="(get props title)"
    &href="(urlJoin blog (get props slug))"
  />
</div>
```

It is important to note that those Lisp application calls are compiled to JavaScript function applications, and the functions are still defined using JavaScript/TypeScript. You can consider this as an `eval`-free way to inject logic into templates. The benefit of going `eval` free is that the approach works directly in platforms like Cloudflare. You can also run the engine within the browser.

The next part I had to solve had to do with iteration, and I came up with syntax like this:

```html
<ul &foreach="(get context blogPosts)">
  <li class="inline">
    <SiteLink
      &children="(get props title)"
      &href="(urlJoin blog (get props slug))"
    />
  </li>
</ul>
```

There are many other features, like comments, slots, `noop`, and others, but the examples above give you some idea of what HTMLisp is about. If you are interested in the templating engine, [see more HTMLisp examples](https://gustwind.js.org/templating/) or [find HTMLisp on npm](https://www.npmjs.com/package/htmlisp).

Interestingly, my approach aligns well with the ideas behind [HTML First development](https://html-first.com/). It is somewhat natural to develop with it as it's close to HTML while giving it the additional muscles it needs to work for my purposes. The implementation alone is quite interesting as I wrote an HTML/XML parser that emits AST that's then converted to HTML, as it allows flexibility in terms of integration. For example, I could add a small Markdown parser on top one day to avoid using [marked](https://www.npmjs.com/package/marked) or a similar solution, although that is another big chunk of work.

### Routing - Configuration over convention

To describe a website, you need a solution to declare its routing. These days, many solutions have opted for directory and file-naming-based conventions, but I have always found that slightly awkward and magical. As with Antwar, I went with configuration-based routing that has been described using JSON for now, although a JavaScript API exists. I wrote two routers: one for static site generation and one for edge computing. I'll cover the former briefly next to give you a better idea. For me, a router should handle the following two things: 1. allow declaring routes and 2. allow data-driven route expansions.

The first requirement is obvious since that's what routers do - declare routes. The second one is a notch harder as it couples data-related concerns with routing and implies either build or runtime-related binding between data and routes. I have opted for the former in my main router, while the latter case can be handled dynamically on the edge as needed. I won't go into the latter in the context of this post, but the idea is to have a catch-all type route that returns markup dynamically and optionally caches it. I solved the first requirement with the configuration below:

```json
{
  "/": {
    "layout": "siteIndex",
    "context": {
      "meta": {
        "title": "SurviveJS",
        "description": "Get started with JavaScript and related technologies",
        "keywords": "JavaScript, React, webpack, web development"
      }
    },
    "dataSources": {
      "blogPosts": {
        "operation": "indexBlog",
        "parameters": ["./pages/blog", 3]
      }
    }
  }
}
```

As you can see, the route declaration is quite simple to parse. For this site, you have an index route mapping to a layout that gets context and has data related to blog posts bound to it. Technically, these concepts could be merged into a single `context` property, but the separation has its benefits, as I don't have to guess if you are trying to pass an object or fetch data through a context property. That said, this could be solved with a naming convention like `&blogPosts`, and I might revisit this decision later.

The second requirement of dynamically constructing routes is a notch more difficult as there is more to model in terms of configuration. I've outlined my basic solution below:

```json
{
  "blog": {
    "layout": "blogIndex",
    "context": { ... },
    "dataSources": {
      "blogPosts": {
        "operation": "indexBlog",
        "parameters": ["./pages/blog"]
      }
    },
    "expand": {
      "matchBy": {
        "name": "blogPosts",
        "indexer": {
          "operation": "indexBlog",
          "parameters": ["./pages/blog"]
        },
        "slug": "data.slug"
      },
      "layout": "documentationPage",
      "dataSources": {
        "document": {
          "operation": "processBlogPost",
          "parameters": [
            { "parseHeadmatter": true }
          ]
        }
      },
      "context": {
        "meta": {
          "title": {
            "utility": "get",
            "parameters": ["context", "document.data.title"]
          },
          ...
        }
      }
    },
    ...
  }
}
```

Simply put, I modeled a system using an `expand` property that indexes data while binding it to a property available later in a layout. Each indexing result is then passed through logic, where data related to the initial results is fetched and bound to the template context, thereby achieving the idea of route expansion. The same data is available to the `context` so that individual pieces of data can be bound dynamically.

The route declaration can likely be evolved further, and in practice, the declarations you end up writing can be quite long. At the same time, I like the fact that I can see how the site has been built by looking at a single file, and it has been easy to expand sites built like this.

There's one key concept I haven't touched on yet, and that's called data sourcing, which you can already see in the route definition in the form of `dataSources`.

### Data sourcing

For a data-driven website, you need some way to declare your data dependencies and a way to implement them. In my case, the route declaration handles the first part. To tackle the second part, I went with a module-based approach that looks like this:

**dataSources.ts**

```typescript
import type { DataSourcesApi } from "https://deno.land/x/gustwind@v0.71.2/types.ts";

function init({ load, render, renderSync }: DataSourcesApi) {
  async function indexBlog(directory: string, amount?: number) {
    // Returns an array of found blog pages (for example, only metadata)
    ...
  }

  async function processBlogPost({ path }: { path: string }) {
    // Takes path, reads the post, and returns the result
    ...
  }

  return { indexBlog, processBlogPost };
}

export { init };
```

Although simple, I have found this model good enough for my purposes as you have a single place to handle data fetching-related concerns. Technically, my solution also allows data fetching within view logic as template rendering logic supports asynchronous functions, but I haven't found many use cases for that.

T> [Check the site source for the entire data source declaration](https://github.com/survivejs/website-v3).

## Tailwind - the new styling approach of the new site

As mentioned above, I decided to drop SCSS from the new site and rewrite the styling approach. To achieve a nice coupling with my HTML-based components, I decided to go with [Tailwind](https://tailwindcss.com/) syntax, and I used [Twind](https://twind.style/) to implement it into my project. I'll likely move to official Tailwind one day as Twind isn't well maintained at the moment.

One of the exciting things about the current approach is that you can copy pieces from the site source to use in other projects, as I did not hash the classes. That makes the site a learning resource itself. The main caveat is that components and iteration have been compiled out of the result, so it does not completely match the input. However, it is still a good compromise.

## How did I make the new site lighter

Although the old site was relatively light, I found several ways to make it even lighter: 1. simplifying the layout. 2. avoiding unnecessary images 3. loading [Disqus comments](https://disqus.com/) later.

It likely does not make a big difference, but I found ways to make the site layout lighter than before. The amount of CSS the site needs is so minuscule that I ended up inlining it directly to HTML. I know this avoids caching benefits, but I am not sure if those would be worth it in this particular case.

In the old version, I used header images for book chapters and blog pages, but then I realized that it needed to be revised to serve the content. To make things worse, I was loading them through CSS, which was [contributing to worse LCP value](https://sudh.online/blog/improving-lcp). Dropping the header images solved this problem, and as a result, my bandwidth usage went down. The site may have lost some visual appeal, but this is a reasonable tradeoff.

The third fix is the most impactful as I realized that Disqus was loaded for book chapters and blog pages even if you never reached the functionality on the page. My initial solution was to apply lazy-loading and load the widget only if it was in the view using [IntersectionObserver](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API), but then I understood even this was too much. The simplest solution was to offer a button to the user to load the comments on demand, and now we get the heavy loading operation only if the user wants it. Ideally, I would get rid of Disqus altogether, but I have yet to go this far as it's a more significant change.

As of writing, the site achieves 99/100 for performance on [mobile PageSpeed Insights check](https://pagespeed.web.dev/analysis/https-survivejs-com/wc2ed2u3q0?form_factor=mobile) for the landing page at least, which is reasonable. There is not much to optimize, although I can likely drop the [Sidewind](https://sidewind.js.org/) runtime I use for state management one day in favor of a compiler-based approach to eliminate another 5 kilobytes (the runtime is about 7 kilobytes, and it needs to be loaded once).

## How did I change the site to reflect my current profile

As a site like this is supposed to reflect its author as it's a mixture of a learning resource and portfolio, I decided to rework the information infrastructure. The idea was to introduce new sections to navigation to capture the different facets of what I have been doing better. As a result, I revamped the main navigation of the site while introducing new sections for [research](/research/), [workshops](/workshops/), [presentations](/presentations/), [open source](/open-source/), and [consulting](/consulting/). During the restructuring, I took care to define redirects between possible old pages and new ones while maintaining a similar visual identity through component-driven design as I designed a `Card` component and necessary variants to capture specialized needs.

It's a good idea to occasionally reflect on the site structure, especially if you develop the site organically over time. This work makes your content easier to find and is an excellent chance to introduce navigational aids. For example, I implemented [a topic index for the blog](/blog/topics/). The index allows you to discover content related to a specific theme easily. I still want to add better filtering to the [blog index](/blog/) one day, as the current version is a little heavy with all its items.

## Conclusion

Although it was a long post, I did not cover each new feature of the new site, and it is up to you to find the improvements. I hope you find the latest version useful. In case you want to see how the new site was built, [see the site source at GitHub](https://github.com/survivejs/website-v3).
