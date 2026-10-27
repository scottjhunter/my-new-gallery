---
title: "The Mad Poet"
meta_desc: "A humorous original poem about the senses, introduced with a memory of anonymous poetry on dorm-room doors at Hunter College in New York."
description: "A humorous original poem about the senses, introduced with a memory of anonymous poetry on dorm-room doors at Hunter College in New York."
excerpt: "A college memory from 1990 and a favorite poem once posted anonymously as The Mad Poet."
displayDate: April 10, 2026
date: 2026-04-10
tags:
  - posts
topic: Poetry
topics:
  - Poetry
  - Creative Writing
  - Memory
layout: main.njk
permalink: "/blog/the-mad-poet/"
url: https://scottjhunter.org/blog/the-mad-poet/
img: /images/prose.jpg
alt: "Illustration of a bearded poet playing a stringed instrument in a candlelit room, accompanying a poem about the senses."
cardType: summary_large_image
---

<div class="about-me-content">
  <h1>The Mad Poet</h1>

  <p>
    When I was in college in 1990, I went to Hunter College in New York on an exchange program. I lived in the dorms and everyone had notepaper on their doors for messages. I began anonymously writing poetry on people's doors, identifying myself only as The Mad Poet. Rumors swirled for months before I was caught. Some of the poems were controversial. I kept a few that I will post here. This is my favorite.
  </p>

  <style>
    .mad-poet-stage {
      position: relative;
      margin: 2rem 0;
      padding: 1.4rem;
      border-radius: 14px;
      background: linear-gradient(140deg, #12151d 0%, #1d1623 55%, #26181a 100%);
      color: #f7f3eb;
      overflow: hidden;
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.22);
    }

    .mad-poet-stage::before,
    .mad-poet-stage::after {
      content: "";
      position: absolute;
      border-radius: 999px;
      filter: blur(36px);
      opacity: 0.35;
      pointer-events: none;
    }

    .mad-poet-stage::before {
      width: 260px;
      height: 260px;
      top: -120px;
      left: -80px;
      background: #d14545;
      animation: pulse-warm 7s ease-in-out infinite;
    }

    .mad-poet-stage::after {
      width: 220px;
      height: 220px;
      right: -70px;
      bottom: -110px;
      background: #2b7a98;
      animation: pulse-cool 6s ease-in-out infinite;
    }

    .mad-poet-poem {
      position: relative;
      z-index: 1;
      margin: 0;
      text-align: center;
      font-family: "Segoe Script", "Brush Script MT", "Lucida Handwriting", cursive;
      font-size: clamp(1.65rem, 4.4vw, 2.45rem);
      line-height: 1.28;
      letter-spacing: 0.02em;
      color: #f7f3eb;
      text-shadow: 0 2px 7px rgba(0, 0, 0, 0.38);
    }

    .mad-poet-line {
      margin: 0.22rem 0;
      animation: drift 8s ease-in-out infinite;
    }

    .mad-poet-line:nth-child(2n) {
      animation-delay: 0.45s;
    }

    .mad-word {
      color: #ff1f1f;
      font-weight: 700;
      text-shadow: 0 0 6px rgba(255, 31, 31, 0.45);
    }

    .mad-poet-final {
      position: relative;
      z-index: 1;
      text-align: center;
      margin: 0.6rem 0 0;
      font-size: clamp(1.85rem, 5vw, 2.8rem);
      letter-spacing: 0.01em;
      font-family: "Segoe Script", "Brush Script MT", "Lucida Handwriting", cursive;
    }

    .mad-poet-byline {
      position: relative;
      z-index: 1;
      margin-top: 0.9rem;
      text-align: right;
      font-style: italic;
      color: #ffffff;
      font-size: 1.12rem;
      font-family: "Segoe Script", "Brush Script MT", "Lucida Handwriting", cursive;
    }

    @keyframes pulse-warm {
      0%, 100% { transform: scale(1); opacity: 0.32; }
      50% { transform: scale(1.1); opacity: 0.45; }
    }

    @keyframes pulse-cool {
      0%, 100% { transform: scale(1); opacity: 0.28; }
      50% { transform: scale(1.12); opacity: 0.42; }
    }

    @keyframes drift {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-3px); }
    }

    @media (max-width: 680px) {
      .mad-poet-stage {
        padding: 1rem;
      }

      .mad-poet-final {
        font-size: clamp(1.75rem, 8vw, 2.2rem);
      }
    }
  </style>

  <section class="mad-poet-stage" aria-label="Featured poem visual">
    <div class="mad-poet-poem">
      <div class="mad-poet-line"><span class="mad-word">Sight</span> is disturbing,</div>
      <div class="mad-poet-line"><span class="mad-word">Hearing</span> is a curse,</div>
      <div class="mad-poet-line"><span class="mad-word">Touch</span> is disgusting,</div>
      <div class="mad-poet-line"><span class="mad-word">Smell</span> is the worst.</div>
      <div class="mad-poet-line"><span class="mad-word">Taste</span> is nasty,</div>
      <div class="mad-poet-line"><span class="mad-word">Intuition</span> is bad,</div>
      <div class="mad-poet-line">All these senseless <span class="mad-word">senses</span>,</div>
    </div>
    <div class="mad-poet-final">Might make a poet<br>go <span class="mad-word">mad</span>.</div>
    <div class="mad-poet-byline">- The Mad Poet</div>
  </section>

  <p class="post-meta">April 10, 2026 - SJH</p>
</div>
