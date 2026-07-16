# Lallo — Gamification System Design

Adapted from Duolingo's core loop, redesigned for the constraint that matters most here: **the player is 4–8 years old, but the buyer/decision-maker is a parent, and the content authority is a logopedista.** Every mechanic below is filtered through that triangle.

---

## 1. Core Loop (the Duolingo skeleton)

Duolingo's loop is: **Session → XP → Streak → League/Leaderboard → Loss Aversion Notification → Return.**

For Lallo, the loop becomes: **Micro-session (3–5 min) → Stars (not XP) → Streak (parent-visible) → Therapist Milestone Unlock → Parent Nudge → Return.**

Key change: Duolingo's engine is built around a *solo adult learner* optimizing for daily habit. Lallo's engine has to work for a *child who can't read a leaderboard* and a *parent who needs proof of clinical progress*, not just proof of engagement. So the reward layer is split into two parallel tracks running off the same underlying data:

- **Child-facing layer**: sensory, immediate, character-driven
- **Parent-facing layer**: legible, progress-oriented, low-anxiety

---

## 2. Currency & Points

**Stars** (not "XP" — too abstract for age 4-8)
- Earned per correctly-articulated attempt, weighted by the exercise's clinical difficulty level (Level 1 phoneme = 1 star, Level 5 = 3 stars)
- Awarded via the articulatory feedback engine's confidence score, not binary pass/fail — partial credit for improving attempts avoids punishing kids with real speech difficulty
- Visible as a filling jar/character accessory meter, not a number (numbers don't motivate a 5-year-old)

**Gems** (secondary/premium-adjacent currency)
- Earned only from *streak milestones* and *therapist-assigned bonus challenges*
- Spent on cosmetic unlocks (Lallo's outfits, sidekick animals, background scenes)
- Never spent on skipping exercises — cosmetic-only economy avoids "pay to skip therapy" perception with parents/therapists

---

## 3. Streaks — redesigned for a therapy context

Standard Duolingo streaks punish missed days hard, which is dangerous here: kids get sick, families travel, therapy has natural gaps, and guilt-tripping a parent of a child with a speech delay is a bad look and bad retention math.

**Lallo Streak Rules:**
- Streak = "practice weeks," not days. A week counts if the child completes ≥3 sessions in 7 days (matches typical logopedista-recommended home practice cadence)
- **Freeze by default, not by purchase**: every account gets 2 built-in "grace days" per month automatically — no monetized streak-freeze like Duolingo. This is a clinical tool, not a habit-gambling app; monetizing guilt on a pediatric medical-adjacent product is a real reputational and possibly regulatory risk in Italy.
- Streak is shown to the *parent* on their dashboard as "settimane consecutive di pratica" alongside actual clinical metric (phonemes mastered), never as an isolated vanity number to the child

---

## 4. Progression Structure

Maps 1:1 onto the existing 5-level clinical phoneme scale — this is your biggest gamification asset, most apps have to invent a skill tree, you already have a clinically validated one.

```
World Map (per phoneme group, e.g. "R sounds", "S sounds")
  └─ Level 1: Isolated sound
       └─ 3-5 mini-games (unlocked sequentially)
  └─ Level 2: Syllables
  └─ Level 3: Words
  └─ Level 4: Phrases
  └─ Level 5: Spontaneous speech
       └─ "Boss round" — free conversation/story retelling scored by the model
```

- Each phoneme group is a visual "island" on a map (mirrors Duolingo's path but themed as an adventure world, not a language tree)
- A level only unlocks after the *therapist* toggles it available in their dashboard, OR after a mastery threshold is hit in-app — **this is the critical difference from Duolingo**: progression gating is clinically supervised, not purely algorithmic. This is also your strongest B2B2C trust argument to logopediste.

---

## 5. Reward Cadence (what fires when)

| Trigger | Child sees | Parent sees |
|---|---|---|
| Single correct attempt | Sound + star burst + character reaction | — |
| Session complete | Character celebration animation, sticker | Push: "Emma completed today's practice 🎉" |
| Weekly streak hit | Costume unlock for Lallo mascot | Weekly progress email with phoneme accuracy chart |
| Level mastery | Badge + map island "unlocks" visually | In-app + email: milestone tied to clinical scale, shareable PDF for therapist |
| Founding clinician program milestone | — | Therapist dashboard: cohort comparison, de-identified benchmark data |

---

## 6. Social/Competitive Layer — handle with care

Duolingo leaderboards work because adult learners like competing. **Do not build a cross-child public leaderboard** — safeguarding risk with minors, plus most parents of kids in speech therapy don't want their child ranked against others on a sensitive delay. Instead:

- **Family-only "co-op" mode**: siblings or parent+child can do challenges together, framed as teamwork not ranking
- **Self-competition only**: "beat your own best week" mechanics, framed to the child as racing a ghost of their past self
- Optional **anonymized cohort progress** shown only to the therapist (not other families) — this is the professional value-add, not a consumer social feature

---

## 7. Monetization touchpoints (tying back to your Pro-tier model)

- Free tier (parent-paid): full core loop, ads-free (non-negotiable for a kids' app — also required by App Store/Play Store kids policies)
- Therapist Pro tier: free, unlocked cosmetic sets as a subtle upsell nudge to invite more families ("Sblocca nuovi personaggi invitando altri pazienti" — but never gate clinical content behind referrals)
- No loot boxes, no randomized rewards, no dark patterns — Apple/Google kids-category review is strict on this, and it would undercut the clinical credibility you're building with logopediste

---

## 8. What NOT to copy from Duolingo

- ❌ Aggressive push notification guilt loops ("Duo is sad you missed practice") — wrong tone for a therapy app, risk of parent backlash
- ❌ Hearts/lives system that blocks practice after failures — a child struggling with articulation failing repeatedly and getting locked out is clinically counterproductive
- ❌ Public global leaderboards — safeguarding + sensitivity issue
- ❌ Streak-freeze as IAP — already covered above, reputational risk

---

## Next: Onboarding

Once you send the Speech Blubs screenshots, I'll map their onboarding flow against this system and adapt it for the B2B2C flow — i.e., accounting for the extra step of a therapist-issued invite code, which Speech Blubs (pure B2C) doesn't need to handle.
