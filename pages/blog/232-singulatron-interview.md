---
title: "Singulatron - AI On-Premise - Interview with Janos Dobronszki"
date: 2024-08-22
keywords: ["interview", "ai"]
---

You could say Artificial Intelligence (AI) is eating the world. The problem is that often, you have to use an external service to leverage its benefits.

Another option is to host AI solutions on your own, and that is where [Singulatron](https://superplatform.ai/) by [Janos Dobronszki](https://crufter.com/) comes in. This interview will teach you more about his approach and thoughts on the topic.

## Can you tell me a bit about yourself?

![Janos Dobronszki|100|100|author](https://avatars.githubusercontent.com/u/1193872?v=4)

I'm a programmer who has been mesmerized by technology's ability to create things since I was a child.
I have mostly worked as a backend or platform engineer in startups all my life, and my passion for doing things as efficiently as possible has remained a theme over the last twenty years.

## How would you describe _Singulatron_ to someone who has never heard of it?

We describe it as an AI management and development platform, which is intentionally broad to cover many things you can do with it.
At its core, it enables your company to have its own self-hosted ChatGPT-inspired platform, and it focuses on allowing your developers to extend and customize it.

To provide a practical example, we recently developed a tool for our sales team that we humorously named "Spamder" (a blend of Spam and Tinder). Users input their ideal prospects (e.g., "Companies that use ChatGPT"), and the tool generates potential clients, including a summary of each company and a customized cold email. Our salespeople can review and edit these emails before sending them.

We created this tool during a weekend hackathon without writing any custom backend logic. It utilizes Singulatron for prompting, data storage, authentication, and login functionalities.

## How does _Singulatron_ work?

It's a server that you can install on your computers. You download a few free, open-source models through the UI, and you're good to go — you can start chatting with LLMs, generate images, and more! It's also a set of batteries-included microservices you can reuse while building your own AI-driven apps.

T> The recommended way to install and run Singulatron is via Docker; it's all containerized, making the process relatively straightforward. [See Singulatron documentation to learn how to get started.](https://superplatform.ai/docs/category/running)

## How does _Singulatron_ differ from other solutions?

I would say it's mostly our focus on being a framework/development platform, but to be honest, I don't really pay attention to the complete competitor landscape for a few reasons. The biggest one is that this space is so new that there is room for a lot of projects!

I cross my fingers and hope that someone else isn't making the same two hundred design decisions daily, day after day, haha!

## Why did you develop _Singulatron_?

I really built it to help my friends and I build AI apps. We think the next ten years will be about finding places where AI can benefit economically.

Algorithms and traditional software engineering have entirely transformed the world over the past four decades, and now AI will open new frontiers.

I also spent the last 10+ years using and building proprietary and open-source microservices platforms and various PaaS tools. Over those long years, I've accumulated many ideas to pour into Singulatron.

## What next?

I am stabilizing and writing more documentation! I'm building a few projects on top of Singulatron ('eating my dog food'), and things keep popping up!
Unreal!

## What does the future look like for _Singulatron_ and AI in general? Can you see any particular trends?

One of the trends I see is that after an AI binge, companies are sobering up and looking to self-host their own models to avoid giving data away. Despite being a cloud engineer, I was always horrified by how quickly and uncritically companies adopt cloud technologies. I believe this will change.

People are realizing how well AI summarises information, and suddenly, the old excuse of 'who would take the time to go through all my stuff' isn't so reassuring anymore.

AI is there to understand what you give away relentlessly. Every bit of your information can be easily analyzed in thousands of ways with AI. Do you have an excellent startup idea that's gaining traction? IncumbenTron v2.4.1 flagged your product for review so the BigTech execs can decide whether to launch a competing product before you gain significant market share.

The access to these insights suddenly puts cloud providers in a much more adversarial light.

## What advice would you give to programmers getting into AI?

Have fun and build things! We are very lucky to be born in an age when an enjoyable form of self-expression (development) can result in immense monetary gains. What's not to like?

## Conclusion

Thanks for the interview, Janos! It is great to see a self-hosted option for AI, as it allows you to experiment locally on your machine while controlling your data.

If you want to follow Singulatron's development, consider one of the links below:

* [Singulatron on GitHub](https://github.com/singulatron/singulatron)
* [Singulatron on X](https://twitter.com/singulatron)
* [Singulatron on LinkedIn](https://www.linkedin.com/company/singulatron/).
