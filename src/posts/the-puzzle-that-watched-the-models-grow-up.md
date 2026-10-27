---
title: "The Puzzle That Watched the Models Grow Up"
meta_desc: "A family scheduling puzzle tests AI reasoning from 2024 to 2026, revealing progress in constraint solving and the continuing role of human correction."
description: "A family scheduling puzzle tests AI reasoning from 2024 to 2026, revealing progress in constraint solving and the continuing role of human correction."
excerpt: "A homemade scheduling puzzle became an accidental AI benchmark, testing whether models could distrust intuition long enough to do the arithmetic."
displayDate: July 12, 2026
date: 2026-07-12
tags:
  - posts
topic: AI
topics:
  - AI
  - Math
  - Reasoning
layout: main.njk
permalink: "/blog/the-puzzle-that-watched-the-models-grow-up/"
url: https://scottjhunter.org/blog/the-puzzle-that-watched-the-models-grow-up/
img: /images/family.jpg
alt: "Illustration of a family gathered around a newborn, accompanying a scheduling puzzle about daughters, grandchildren, and AI reasoning."
cardType: summary_large_image
---

<div class="about-me-content">
  <h1>{{ title }}</h1>

  <figure style="margin: 0 0 1em 0;">
    <img src="/images/family.jpg" alt="Illustration of a family gathered around a newborn, accompanying a scheduling puzzle about daughters, grandchildren, and AI reasoning." style="width: 100%; height: auto; margin-bottom: 0.5em;">
    <figcaption><em>The puzzle was patient.</em></figcaption>
  </figure>

  <p>
    Two years ago I made up a puzzle. It started as an idle thought experiment: a man with three adult daughters wants twelve grandchildren, four from each daughter, with every calendar month of the year represented exactly once among the birthdays. No two daughters can be pregnant at the same time. Each pregnancy lasts 40 weeks. And a daughter can only start her next pregnancy after both of her sisters have completed theirs. The question: what is the most compact schedule that satisfies all of this?
  </p>

  <p>
    It sounds like a word problem from a slightly unhinged math textbook. It is actually a <a href="https://en.wikipedia.org/wiki/Constraint_satisfaction_problem" target="_blank" rel="noopener noreferrer">constraint-satisfaction problem</a> with a trap buried in the middle of it, though I didn't know that when I wrote it. I just thought it was fun.
  </p>

  <p><strong>The trap</strong></p>

  <p>
    The intuitive move is to think in month labels. A 40-week pregnancy is about nine months, so consecutive births need to be at least nine months apart, and if you eyeball it, nine calendar months apart feels too tight. Ten months seems safer. Build the schedule on ten-month gaps and you get a total span of around 110 months or more.
  </p>

  <p>
    But month labels and day counts are not the same thing. Forty weeks is 280 days. If the day of the month drifts later with each birth, a 281-day gap fits inside a nine-calendar-month step: January 1 to October 9, October 9 to July 16, July 16 to April 23, and so on. The drift does the work. Each sister can conceive the day after the previous sister delivers, and the whole thing compresses.
  </p>

  <p>
    There was one more wrinkle. Nine-month steps repeat the same months after a few cycles. In <a href="https://mathworld.wolfram.com/ModularArithmetic.html" target="_blank" rel="noopener noreferrer">modular</a> terms, nine is divisible by three, so pure nine-month steps never escape the starting <a href="https://en.wikipedia.org/wiki/Modular_arithmetic#Congruence_classes" target="_blank" rel="noopener noreferrer">residue class mod 3</a>, meaning the months stay trapped in one of three remainder groups: January/April/July/October, February/May/August/November, or March/June/September/December. You can never reach all twelve months that way. You need at least two steps stretched to ten months, placed carefully, to break out. Eleven gaps of at least nine months gives a floor of 99, plus the two required extra months, makes 101. That is the true minimum, and there is a schedule that achieves it. The oldest grandchild is about eight years and five months old when the youngest arrives.
  </p>

  <p>
    I am not a great mathematician. I worked all of this out by hand, noticed the months kept repeating, kept asking why, and eventually landed on the mod-3 argument. Then I did what any sensible amateur does: I handed it to my son, who is a great mathematician, and asked him to break it. He couldn't. It was correct.
  </p>

  <p><strong>The benchmark I didn't mean to build</strong></p>

  <p>
    In 2024 I fed the puzzle to <a href="https://chatgpt.com/" target="_blank" rel="noopener noreferrer">ChatGPT</a>. It failed. Confidently, as was the style at the time. It produced a schedule, got the arithmetic subtly wrong, and defended its answer. The puzzle asked for three separate insights that all had to survive contact with each other: the day-drift trick, the modular argument, and the discipline to count actual days instead of trusting month labels. The model had none of them.
  </p>

  <p>
    This week I tried again, two years later, with two different models.
  </p>

  <p>
    <a href="https://claude.com/product/overview" target="_blank" rel="noopener noreferrer">Claude Fable</a> got it wrong on the first pass. It made the same eyeballed assumption a human would make, that consecutive births couldn't be closer than about ten months, and built a comfortable 119-month schedule on that foundation. When I showed it my 101-month solution, it checked every gap by exact day count, verified the schedule, confirmed the minimality proof, and owned the error cleanly. Two rounds, with a human correction in the middle.
  </p>

  <p>
    ChatGPT 5.6, running in its high-reasoning mode, solved it cold. First try. Drift trick, minimality proof, the whole package, unprompted.
  </p>

  <p>
    I was surprised, and then I wasn't. The <a href="https://platform.openai.com/docs/guides/reasoning" target="_blank" rel="noopener noreferrer">reasoning-heavy models</a> of 2026 are built for exactly this failure mode. The mistake I watched Claude Fable make, and the mistake I watched ChatGPT make in 2024, is pattern-matching to a plausible framing instead of grinding through the arithmetic. Extended reasoning chains exist to catch that. The model that counts days instead of trusting its intuition about months is doing something that, frankly, most humans don't do either.
  </p>

  <p><strong>What the puzzle actually tests</strong></p>

  <p>
    Somewhere along the way my little scheduling problem became a private benchmark, and probably a better one than most published benchmarks, for a simple reason: it has never appeared in any training data, and it has an objectively checkable answer with a proof attached. No model ever memorized it. Every attempt was a genuine attempt.
  </p>

  <p>
    But I think what it tests is more interesting than arithmetic. It punishes plausible-sounding intuition and rewards the unglamorous work of checking. The wrong answers, mine included at first, and both models' at various points, all came from the same place: a framing that felt right and went unexamined. The correct answer came from refusing to trust the frame.
  </p>

  <p>
    That is also why I asked my son to check my work. Nobody should trust their own proof until someone has tried to break it. It turns out that principle applies to machines too, and to the humans evaluating them. In 2024 the puzzle beat the AI outright. In 2026 one model needed my correction and another didn't need me at all. I don't know what the 2028 result will be, but I have the receipts, and the puzzle is patient.
  </p>

  <p class="post-meta">{{ displayDate }} - SJH</p>
</div>
