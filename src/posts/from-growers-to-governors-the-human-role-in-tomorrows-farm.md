---
title: "From Growers to Governors: The Human Role in Tomorrow's Farm"
meta_desc: "AI in agriculture can automate growing food, but farmers still need the skills to understand, supervise, and repair precision farming systems."
description: "AI in agriculture can automate growing food, but farmers still need the skills to understand, supervise, and repair precision farming systems."
excerpt: "The risk is not that AI takes over farming. The risk is that it does so while humans quietly lose the capacity to step in when it breaks."
displayDate: May 8, 2026
date: 2026-05-08
tags:
  - posts
topic: AI
topics:
  - AI
  - Technology
layout: main.njk
permalink: "/blog/from-growers-to-governors-the-human-role-in-tomorrows-farm/"
url: https://scottjhunter.org/blog/from-growers-to-governors-the-human-role-in-tomorrows-farm/
img: /images/farm.jpg
alt: "Illustration of an automated indoor vertical farm with stacked crops, workers, and digital monitoring screens."
cardType: summary_large_image
---

<div class="about-me-content">
  <h1>{{ title }}</h1>

  <figure style="margin: 0 0 1em 0;">
    <img src="/images/farm.jpg" alt="Illustration of an automated indoor vertical farm with stacked crops, workers, and digital monitoring screens." style="width: 100%; height: auto; margin-bottom: 0.5em;">
    <figcaption><em>The next farm may need governors as much as growers.</em></figcaption>
  </figure>

  <p>
    There is a version of the future where no one knows how to grow food.
  </p>

  <p>
    Not because food stops being grown. It gets grown, continuously and efficiently, by systems that monitor soil chemistry, adjust irrigation in real time, predict pest pressure before it appears, and optimize yield against a hundred variables simultaneously. This is the direction <a href="https://www.nifa.usda.gov/grants/programs/precision-geospatial-sensor-technologies-programs/precision-agriculture-crop-production" target="_blank" rel="noopener noreferrer">precision agriculture</a> has already been moving: location-specific data, sensor networks, remote sensing, and treatment decisions tailored to the actual conditions in a field. The food arrives. Nobody starves. And nobody in the loop actually understands what the system is doing or why.
  </p>

  <p>
    That is the failure mode worth worrying about. Not AI taking over farming. AI taking over farming while humans quietly lose the capacity to step in when it breaks.
  </p>

  <p>
    The more interesting question is what a well-designed hybrid system looks like. One where automation does what it does well, and people do what they still do better. The answer, I think, reframes what farming even means as a profession.
  </p>

  <hr>

  <p><strong>The Pilot Model</strong></p>

  <p>
    Think about commercial aviation. Autopilot handles most of a flight. The plane can practically land itself. And yet we do not hand tickets to passengers and tell them to sort it out if something goes wrong. Pilots train continuously. They understand the systems they oversee. They can take manual control when the automation behaves unexpectedly, because the expectation is that they understand the system deeply enough to recognize when something is wrong. The FAA makes the same point in its work on <a href="https://www.faa.gov/aircraft/air_cert/airworthiness_certification/certification_reform" target="_blank" rel="noopener noreferrer">automation and manual flying skills</a>: highly automated systems still require crews who understand the flight path and can intervene when necessary.
  </p>

  <p>
    That is the model worth building toward in AI-driven agriculture. Not a farm where people are replaced. A farm where people become something closer to pilots: system-aware, intervention-capable, and continuously trained on both the technology and the underlying biology it manages.
  </p>

  <p>
    The shift is from doing the work to understanding and governing the system that does the work.
  </p>

  <hr>

  <p><strong>What People Still Do Better</strong></p>

  <p>
    There are specific places where human judgment still outperforms optimization algorithms, and they matter.
  </p>

  <p>
    Biological intuition is one of them. A farmer who has spent years in the field notices things that sensors do not yet capture reliably: the particular way a leaf curls under certain stress conditions, the smell of soil that is trending wrong, the way a crop that looks fine on the data dashboard is behaving strangely in the corner of the field. This is not sentiment. It is pattern recognition built from embodied experience. AI systems can be trained to approximate it, but the people who can verify whether the approximation is correct are the ones who developed the intuition in the first place.
  </p>

  <p>
    Tradeoff decisions are another. Optimization requires knowing what you are optimizing for, and those goals are not given. Maximizing yield is different from maximizing nutrition. Speed to harvest is different from resilience across a bad season. Flavor, which matters enormously to the people eating the food and almost not at all to a yield metric, falls entirely outside what an AI will prioritize unless a human insists on it. The system optimizes. People decide what matters.
  </p>

  <p>
    System design and tuning sit in this space too. Choosing crop mixes, setting constraints, deciding what the AI is even allowed to do. These are governance decisions, not technical ones. They require the kind of contextual, values-driven thinking that AI is not equipped to supply.
  </p>

  <hr>

  <p><strong>The Redundancy Problem</strong></p>

  <p>
    Here is the part that gets skipped in most optimistic accounts of agricultural automation: what happens when the system fails?
  </p>

  <p>
    Power goes out. A software update breaks a critical process. A cyberattack hits the infrastructure. A sensor array goes down during the wrong week of the growing season. This is not theoretical; the FBI has warned that ransomware can disrupt the <a href="https://www.aha.org/fbi-tlp-alert/2021-09-01-fbi-tlp-white-pin-cyber-criminal-actors-targeting-food-and-agriculture" target="_blank" rel="noopener noreferrer">food and agriculture sector</a>, especially as farms and producers rely more heavily on smart technologies, industrial control systems, and internet-based automation.
  </p>

  <p>
    In a well-designed system, there are people who know what to do without the automation. They understand basic plant care. They know how nutrient cycles work. They can manage water and deal with pests without the algorithms. The farm degrades gracefully to a simpler mode of operation rather than collapsing entirely.
  </p>

  <p>
    In a poorly designed system, nobody knows any of that anymore. The knowledge was never transferred because it was never needed. Until it was.
  </p>

  <p>
    This is not a hypothetical concern. It is the same risk that shows up anywhere complex automation displaces human skill without preserving it somewhere. The FAA has called out <a href="https://www.faa.gov/newsroom/safety-briefing/cfitautomation-overreliance" target="_blank" rel="noopener noreferrer">automation overreliance</a> as a safety issue in aviation, where pilots still need proficiency with and without automated systems. Agriculture is not aviation, but the human factors lesson travels well. The more complete the automation, the more catastrophic the gap when it fails. Redundancy is not a nostalgic attachment to the old way of doing things. It is a structural requirement for resilience.
  </p>

  <hr>

  <p><strong>Making It Learnable</strong></p>

  <p>
    For this model to work, the technology itself has to be designed with human understanding in mind. That is not the default.
  </p>

  <p>
    A black-box AI that produces outputs without explaining its reasoning is fine for some applications. In a context where people need to understand what the system is doing well enough to intervene when it goes wrong, it is a problem. The system needs to be transparent: explaining decisions in plain language, making its logic visible, giving operators enough context to evaluate whether the reasoning makes sense. NIST's <a href="https://www.nist.gov/publications/four-principles-explainable-artificial-intelligence" target="_blank" rel="noopener noreferrer">Four Principles of Explainable Artificial Intelligence</a> frames explanation as part of making AI understandable, trustworthy, and usable by the people affected by its decisions.
  </p>

  <p>
    Training environments matter too. Pilots spend time in simulators before they are responsible for actual planes. Agricultural systems should have analogs: "what if" modes where operators can test scenarios, explore edge cases, and build the kind of intuitive understanding that only comes from repeated engagement with failure conditions in a safe context.
  </p>

  <p>
    The architecture should also support what you might call step-down modes. Full automation as the default. Assisted operation when someone wants to be more hands-on. Manual operation when they have to be. The ability to move down the stack without losing the farm is what separates a resilient system from a fragile one.
  </p>

  <hr>

  <p><strong>What the Profession Becomes</strong></p>

  <p>
    If this is designed well, farming does not disappear as a skilled profession. It transforms into something closer to engineering combined with agronomy combined with system governance. People who understand biology deeply, can read a system's behavior accurately, know how to tune goals and constraints, and can operate manually when necessary.
  </p>

  <p>
    That is a high-skill role. It is not the same skill set as traditional farming, and the transition is not automatic or painless. But it is a real profession with real stakes, not a ceremonial presence alongside a machine that does the actual work.
  </p>

  <p>
    The risk is not that AI takes over farming. The risk is that it does so in a way that hollows out the human knowledge base without preserving what people actually need to know. The goal is a system where the automation handles the execution and the people handle the understanding.
  </p>

  <p>
    Humans move from growing plants to understanding, guiding, and backing up the system that grows them. That is not a lesser role. It is just a different one, and it requires being deliberate about what gets built, what gets taught, and what never gets fully handed off.
  </p>

  <p class="post-meta">{{ displayDate }} - SJH</p>
</div>
