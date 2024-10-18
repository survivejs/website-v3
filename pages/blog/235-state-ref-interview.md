---
title: "state-ref - Easy to integrate state management library - Interview with Kim Jinwoo"
date: 2024-10-18
keywords: ["interview", "javascript", "state-management"]
---

State management is one of those recurring themes in frontend development. State becomes an issue when you try to build something even a little complex.

This time I'm interviewing [Kim Jinwoo](https://x.com/superlucky84) about `state-ref`, his technology agnostic solution to the problem.

## Can you tell a bit about yourself?

![Kim Jinwoo|100|100|author](assets/img/interviews/kim.jpg)

Hello, I am Kim Jinwoo, an ordinary web developer living in Korea. I work as a programmer. I enjoy coding outside of work like it's a game. It's a bit embarrassing, but I believe I have strong expertise in web development, and I have a very high self-esteem as a developer. :)

I'm not sure if I'm doing well, but since I was born a programmer, I have a dream to contribute to the world in some way with good ideas or code. I don't know how much time I have left, but as long as I can live as a programmer, I want to create something even more amazing. It's not easy.

## How would you describe `state-ref` to someone who has never heard of it?

`state-ref` is a state management system based on the [Observer pattern](https://en.wikipedia.org/wiki/Observer_pattern). It was designed with easy integration with popular UI libraries in mind. `state-ref` implements the Observer pattern for you. As developers, you may already have a good understanding of this pattern, but grasping it makes it clear how programs manage state and how code that depends on that state automatically reflects the new state.

`state-ref` simplifies the Observer pattern and transforms it into an API that can be easily accessed and utilized in various situations. While `state-ref` was created with the intention of being easily used alongside many different UI libraries (such as React, Preact, Vue, Svelte, and SolidJS), it does not have dependencies on any specific library and can be used independently as well.

## How does `state-ref` work?

`state-ref` was designed with a focus on data immutability to determine value changes. It tracks when users directly read values from the store and adds those references to the dependency callbacks. The pattern for remembering or locating references uses the lenses pattern from functional programming, allowing for accurate identification of reference locations.

When users attempt to change values, they do so according to the interface I have designed, and within `state-ref`, values are safely modified using a memory management technique called [copyOnWrite](https://en.wikipedia.org/wiki/Copy-on-write). Due to the characteristics of the `copyOnWrite` technique, `state-ref` accurately determines which references are affected by the changed value, finds the corresponding dependent callbacks, and executes them.

## How does `state-ref` differ from other solutions?

Compared to other solutions, the way of accessing and modifying values is much easier and more intuitive. For example, in other solutions, when dealing with objects or arrays that have nested sub-nodes, users have to manually handle the `copyOnWrite` process, which can be inconvenient.

In contrast, `state-ref` automatically handles `copyOnWrite`, making it more user-friendly. Additionally, other solutions are often created for specific UI libraries, meaning they are tied to the lifecycle of those libraries. However, state-ref has no dependencies on any specific UI libraries, allowing for greater flexibility in modifications and extensions.

## Why did you develop `state-ref`?

I felt that most JavaScript state management libraries are too tightly coupled with specific UI libraries. For instance, I have been alternating between React and Preact in my project, and I wanted to use a state management library called [Zustand](https://github.com/pmndrs/zustand) with Preact. However, since Zustand does not officially support Preact, I ended up not being able to use it and gave up.

Backend frameworks tend to provide interfaces that generalize connections with similar external modules, allowing for easy dependency swapping. In contrast, most frontend libraries offer weak support for this. Initially, my idea was to create a connector that would easily link a normal state management library with UI libraries while keeping the coupling as low as possible. However, I thought it would be fun also to create a state management library while I was at it, which led me to start the `state-ref` project.

## What next?

I don't consider `state-ref` to be a particularly complex library. Also, since it started as a personal hobby project, I don't expect to attract a large number of users. However, if a few users show interest in this library, I plan to provide them with detailed documentation and tutorials. Currently, `state-ref` supports connectors for Vue, Preact, React, Svelte, and Solid. I also plan to implement connectors for many other UI libraries.

## What does the future look like for `state-ref` and web development in general? Can you see any particular trends?

Currently, frameworks like Next.js for React, Nuxt for Vue, and SvelteKit for Svelte, along with state management libraries like Recoil, Vuex, and Svelte/store, are tightly integrated through strong coupling. However, personally, I hope that in the future, these libraries, frameworks, and state management solutions will have lower coupling with various modules, allowing for more flexible integration and easier replacement. In this context, I expect `state-ref` to become an exemplary case that inspires many.

## What advice would you give to programmers getting into web development?

I, too, experienced this, but many people start coding with the pure curiosity and fun of a child. However, when coding becomes a profession, that joy often fades, and curiosity tends to diminish. Don't lose the curiosity you had in the beginning, and try various things. If you have even a small idea, make sure to realize it and share it with those around you, even if it's not directly related to programming.

The ideas you come up with are not trivial or personal; they might be messages from a higher power urging you to contribute to the world, even if just a little. Thinking this way adds meaning to life. I only recently realized this, and it took me a long time. In my case, by thinking this way, I’ve found new joy in coding and significantly improved my skills (though I still have a long way to go).

## Who should I interview next?

I recommend an interview with `Tao Xin`, the creator of [VanJS](https://vanjs.org/about). While I don't know him personally, I've always admired his passion for developing VanJS with good intentions and ideas. I believe he is a great developer who can inspire many people.

## Any last remarks?

`state-ref` is simply a project I created as a hobby. However, I have poured a lot of passion into it, so I take great pride in it. I would like to express my heartfelt gratitude once again to Juho for showing interest in my project and suggesting this interview.

## Conclusion

Thank you for the interview Kim! I think it is great to see innovation in the space and the fundamental ideas behind `state-ref` seem solid to me. Especially the fact that you separated state management from a specific UI library seems like a smart move to me.

You can [learn more about `state-ref` on GitHub.](https://github.com/superlucky84/state-ref)
