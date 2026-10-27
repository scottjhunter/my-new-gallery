---
title: "Answers Are Not Understanding"
meta_desc: "OpenAI's AI-generated mathematics papers raise questions about proof verification, research transparency, and the difference between answers and understanding."
description: "OpenAI's AI-generated mathematics papers raise questions about proof verification, research transparency, and the difference between answers and understanding."
excerpt: "That is not a paperwork problem. In mathematics, understanding is part of the result."
displayDate: October 11, 2026
date: 2026-10-11
tags:
  - posts
topic: AI
topics:
  - AI
  - Science
  - Ethics
  - Society
layout: main.njk
permalink: "/blog/answers-are-not-understanding/"
url: https://scottjhunter.org/blog/answers-are-not-understanding/
img: /images/math.jpg
alt: "Comic illustration of a robot writing mathematical equations on a chalkboard while researchers watch."
cardType: summary_large_image
---

<div class="about-me-content">
  <h1>{{ title }}</h1>

  <figure class="blog-page-image" style="margin: 0 0 1em 0;">
    <img src="/images/math.jpg" alt="Comic illustration of a robot writing mathematical equations on a chalkboard while researchers watch." data-lightbox="true" style="width: 100%; height: auto; margin-bottom: 0.5em; cursor: zoom-in;">
  </figure>

  <p>
    On October 6, OpenAI <a href="https://openai.com/index/sharing-ai-progress-in-mathematics/" target="_blank" rel="noopener noreferrer">posted 722 mathematical papers to GitHub</a>, grouped into 372 families of claimed results. The response from mathematicians was neither simple celebration nor simple fear. It was something more unnerving: disorientation.
  </p>

  <p>
    Some of the work may be extraordinary. Mathematicians who have looked at parts of it say a few results appear to be <a href="https://www.theverge.com/ai-artificial-intelligence/1008726/openai-mathematics-solutions-chaos" target="_blank" rel="noopener noreferrer">the kind of thing that could make a human researcher's career</a>. But the release is so large and so unevenly documented that nobody can yet say with confidence what it means. <a href="https://decrypt.co/380366/openai-secret-ai-model-cracked-hundreds-math-problems-one-prompt" target="_blank" rel="noopener noreferrer">Only 162 of the papers come with a computer-checked main result</a>. The rest will have to be read, tested, and argued over by people, and the field expects that kind of review to take <a href="https://www.theverge.com/ai-artificial-intelligence/1008726/openai-mathematics-solutions-chaos" target="_blank" rel="noopener noreferrer">months, if not years</a>.
  </p>

  <p>
    That is not a paperwork problem. In mathematics, understanding is part of the result.
  </p>

  <p>
    A proof is not an answer at the back of the book. A good proof shows why something is true. It connects ideas. It lets other people test the argument, find where it applies, discover what it rules out, and use it to ask the next question. Even a formally verified proof only establishes that a precisely stated proposition follows from stated assumptions. It does not establish that the proposition is the right one, that it says what the accompanying paper claims, or why anyone should care.
  </p>

  <p>
    OpenAI seems to understand this in the abstract. It consulted <a href="https://agmai.org/" target="_blank" rel="noopener noreferrer">an independent advisory group of mathematicians at the Institute for Advanced Study</a> and published supporting material alongside the papers. It also <a href="https://openai.com/index/sharing-ai-progress-in-mathematics/" target="_blank" rel="noopener noreferrer">committed to funding workshops, conferences, and special programs</a> to help mathematicians understand the results. That deserves credit. But a promise to support the work of understanding does not resolve the problems with how the material was released. The advisers had <a href="https://agmai.org/general-sep29/" target="_blank" rel="noopener noreferrer">recommended that labs disclose the prompts behind AI-generated results</a>, and <a href="https://decrypt.co/380366/openai-secret-ai-model-cracked-hundreds-math-problems-one-prompt" target="_blank" rel="noopener noreferrer">OpenAI kept them private</a>. Then it released the whole mountain at once, at a pace the field cannot absorb.
  </p>

  <p>
    This may be the central mistake technology companies keep making. They treat discovery as a finish line. In a human field, it is the beginning. OpenAI's own advisers said nearly the same thing in <a href="https://agmai.org/" target="_blank" rel="noopener noreferrer">their statement on the release</a>: publishing the papers starts the work of understanding them. It does not finish it.
  </p>

  <p>
    There is a real difference between making information public and making it available to human understanding. If I put 700 papers on a website, they are public. If the people capable of evaluating them will need years to determine which claims are correct, original, consequential, or even clearly stated, they are not yet available in any meaningful sense. The burden has simply moved from the company that produced the material to the community expected to live with it.
  </p>

  <p>
    None of this is an argument for keeping AI out of mathematics. It would be absurd to reject a tool capable of finding real new results. The better version of this future has mathematicians using these systems to explore far more possibilities, check difficult work, and make connections they might otherwise miss.
  </p>

  <p>
    But that future requires some humility from the people building the systems. A private company cannot flood an academic discipline with hundreds of unvetted papers, call it progress, and expect the people whose careers and research plans are being disrupted to be grateful for the homework.
  </p>

  <p>
    The striking question is not whether OpenAI saw this coming. It almost certainly did. It had been warned, it had advisers, and it knew enough to publish material to help people navigate its own release. The real question is why that knowledge did not control the decision.
  </p>

  <p>
    The obvious answer is other incentives: competition, attention, investor confidence, and the urge to show that your model is ahead. A result announced first has enormous strategic value, even when its meaning is still murky. In that environment, the desire to show capability can outweigh the quieter responsibility to make that capability legible and useful.
  </p>

  <p>
    That competition has a name on the other side, and it is worth saying plainly. Anthropic is in this race too. This year it announced that an unreleased version of Claude had <a href="https://www.anthropic.com/research/riemann-zeta" target="_blank" rel="noopener noreferrer">raised a long-standing bound connected to the Riemann hypothesis</a>, and one of its researchers <a href="https://theweek.com/tech/mathematicians-are-buzzing-about-an-ai-solution-to-a-math-mystery" target="_blank" rel="noopener noreferrer">announced a counterexample to the Jacobian conjecture on social media</a>. When OpenAI's release landed, an Anthropic researcher <a href="https://letsdatascience.com/blog/openai-posted-722-ai-written-math-papers-kept-the-prompts" target="_blank" rel="noopener noreferrer">publicly hailed it as a historic moment for mathematics</a>. Anthropic cannot ride in from outside as the rescuer. It is part of the pressure.
  </p>

  <p>
    That is exactly why it has an opening. Anthropic has built much of its public identity on the claim that AI development should be careful and accountable. The most useful thing it could do now is not announce its own pile of results. It is to put its models, its compute, and some of its people to work for the mathematicians trying to sort through this one: checking which claims are clearly stated, flagging where a formal proof and the paper describing it don't match, tracing which results duplicate known work, and doing it under the direction of the reviewers rather than the company. It could also hold its own future releases to the standards the mathematicians have already asked for.
  </p>

  <p>
    That help would need conditions to mean anything. The mathematicians set the priorities. The tools serve the review, not the marketing. And nobody turns the cleanup into a press release about whose model is smarter. If the problem is that capability outran understanding, the answer cannot be more capability aimed at the same finish line. It has to be capability placed in service of the slower human work of deciding what is true and what matters.
  </p>

  <p>
    So far, I haven't seen Anthropic or any other lab make that offer. It would be a quiet thing to do, which is part of the point.
  </p>

  <p>
    All of this should concern everyone, not just mathematicians. We are moving toward systems that may give us more correct answers than we can readily understand. That sounds like wisdom only if you forget that human beings do not live by correct answers alone. We have to decide what they mean, whether to trust them, how to use them, and what kind of world they create.
  </p>

  <p>
    Answers are powerful. Understanding is what makes them ours.
  </p>

  <p class="post-meta">October 11, 2026 - SJH</p>
</div>
