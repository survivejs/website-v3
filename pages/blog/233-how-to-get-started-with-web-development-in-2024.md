---
title: "How to get started with web development in 2024?"
date: 2024-09-23
keywords: ["web development", "web frameworks"]
---

In the past few years, technologies such as ChatGPT have changed the way we work.
It has never been as easy to develop web applications as today, but it also presents challenges of its own since the web was not originally meant as an application platform given the web comes with unique constraints.
Clients may have a limited amount of bandwidth available, and certain care has to be taken to deliver your sites and applications effectively.

In this blog post, I will recap how we arrived at the current situation and discuss how you might get started with web development in 2024.
The post was motivated by a question I was asked at the end of a recent lecture ([see slides](https://www.researchgate.net/publication/384102326_Web_application_development_-_The_past_the_present_the_future_2024_version)), and I have specifically aimed the post at a beginner web developer.

## How did we arrive at modern web applications?

The web is the most prominent application platform available, making it an ideal distribution platform for your applications in terms of reach.
It is good to remember that the web was not originally designed as an application platform, and its content-oriented origins are visible in the way web technology has evolved.
It was only with the introduction of AJAX at the end of the 1990s that it became possible to build websites that could process queries to a backend in the background without a full page refresh.
AJAX opened the way for Single-Page Applications (SPAs) a few years later, and that model is still the prevalent one for developing complex web applications.

Although SPAs are the current model for developing large-scale web applications and have solid benefits, especially in terms of Developer eXperience (DX), it can be argued that the model isn't ideal in all ways.
There can be concrete costs to the client, as frameworks often ship a lot of code, and the amount of code shipped tends to grow as applications become complex.
Techniques, such as code splitting, can help delay the cost, but they are more like bandages than solutions, as they don't fix fundamental issues.

As noted by the [Web Almanac](https://almanac.httparchive.org/en/2022/page-weight), the median page weight on mobile grew almost sixfold between 2012 and 2022, representing over half of the overall traffic globally based on [DataReportal](https://datareportal.com/global-digital-overview). If you dig closer to the numbers, you will notice JavaScript, third-party scripts, and images can lead to a high loading cost, meaning there is work to be done for web developers to address these problem points if we consider website size a problem worth addressing.

The latest frameworks have introduced ideas, such as islands architecture (see [Astro](https://astro.build/)) or resumability (see [Qwik](https://qwik.dev/) or more specifically the paper [Resumability — A New Primitive for Developing Web Applications](https://ieeexplore.ieee.org/abstract/document/10388344/)), to address the size problem. The new approaches change the way you think about how you compose your sites and applications by acknowledging that it makes sense to maintain boundaries between static and dynamic.
Interestingly enough, a similar idea is visible in [React Server Components](https://react.dev/reference/rsc/server-components) as it changed the way React approaches what is rendered on the client and the server while giving developers a good amount of control.

## Why do we need web frameworks?

Web frameworks exist for several reasons:

1. To solve common problems related to web application development.
2. To capture the technical opinions of their authors.
3. To avoid repetition when doing multiple projects.
4. To accelerate application development.

Some of these reasons are interrelated, and sometimes, some may work against you.
For example, strong opinions encoded in a framework at a fundamental level may become a problem if you have to disagree with them.
Perhaps an assumption does not hold in your case, and then you will literally have to fight against the framework or try to adjust it somehow.

Although you could argue there is perhaps less innovation in web frameworks these days than in the past, we still see development in the space. For example, [Solid.js](https://www.solidjs.com/) is exploring the boundaries of reactivity, while [Marko.js](https://markojs.com/) is figuring out how far you can go with templating.
In my work, I decided to [merge HTML with LISP](https://gustwind.js.org/templating/), which turned out to be a great fit for my purposes.

Another way to see web frameworks is that they address gaps visible in the web platform. As I mentioned earlier, the web platform was never meant as an application platform.
The standards space is still catching up with the required capabilities, and to make things worse, the expectations for what web applications should do increase year by year as applications become more sophisticated.
That is not necessarily bad, but it helps explain why you often resort to a framework when developing your application.
It is another question of which framework you should choose.

Regardless of your choice, it seems many frameworks have converged on a similar set of core ideas you should be aware of: 1. component orientation, 2. templating, and 3. hydration. By component orientation, I mean that most frameworks let you compose your applications out of named components that capture a part of your application templates, logic, and potential state.
Templating describes how the state of your application maps to a markup, and often, it includes logical support for logical constructs to allow the development of complex UIs.
The third dimension, hydration refers to a common technique used with Server-Side Rendering (SSR) to convert static markup provided by a server into an interactive version the user can manipulate.
As mentioned earlier, Qwik has innovated in the space by leveraging resumability to avoid hydration-related effort.

## Could I develop a web application without a framework?

It is a good question are we far enough to develop websites and complex web applications without a framework.
The answer is likely the classic "it depends," given that there are many things you can do easily with the platform and many things that are difficult to do without some kind of library, at least.
Approaches, such as [HTML First development](https://html-first.com/), advocate using the platform as much as possible.
Once you adopt the mindset, you might be amazed at how much you can do with plain HTML and sometimes with a sprinkle of CSS without resorting to JavaScript.
Eventually, JavaScript might be needed, but likely, you will need less of it than you might expect.

Adopting ideas like HTML First does not mean you should not use a framework.
The implication is that relying more on the platform should also make your code more portable across frameworks.
One view is that standards, such as [Web Components](https://developer.mozilla.org/en-US/docs/Web/API/Web_components), can eventually bridge the gap between the component libraries of frameworks.

## Invest in learning fundamentals as they age slowly

When you invest time learning basic HTML and CSS, you invest in skills less likely to lose their value than specific knowledge related to a particular web framework.
At the framework level, it is valuable to master concepts over specifics, as understanding often transfers from one framework to another, assuming you have to work on different types of projects.
It is also important to note that frameworks tend to evolve over time, meaning that your knowledge will have to be kept up to date as you continue to use them.

## Leverage AI tools to speed up your learning

Although Artificial Intelligence (AI) based tools are not without faults, they can be decent at tasks such as summarizing information, converting drawings to HTML, or generating mockups. It is still worth it to use them to support your learning.
When you use the tools, however, you should be critical and verify the information they provide.
Furthermore, it is important to document any prompts you might be using, as that will help you understand how to formulate your prompts effectively.

## Conclusion

2024 is an interesting year to enter web development, as the industry is experiencing a shift in working practices due to the introduction of AI.
We are still in the process of figuring out the best ways to integrate it to our workflows.

For a new web developer, the question is where to start.
I would start with an exciting web project I might have in mind and then research what I would need to implement to motivate learning and have a clear target.
It is likely that your project vision will change as your skills improve, but that is a natural part of learning.

Specifically, I would invest time, especially into understanding how the basic technologies (HTML, CSS, JavaScript, DOM) work, as that is the knowledge you keep regardless of other choices.
Understanding at least one popular web framework well is valuable, but you will get more out of any framework if you understand the underlying technologies at some level and appreciate what problems frameworks solve for you.
