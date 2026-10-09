# Tribe Wellness Co — Website Rebuild

> Single source of truth for the rebuild. Every page, every word, every image and every integration from the current Squarespace site is captured here, plus the new design direction. Use this file as context for all design and build work.

---

## 1. Project summary

| | |
|---|---|
| **Client** | Tribe Wellness Co (TWC) — boutique gym, Jolimont WA |
| **Current site** | https://www.tribewellnessco.com.au (Squarespace 7.1) |
| **Goal** | Leave Squarespace. Rebuild from scratch in clean, owned code with a premium, bold fitness look. |
| **Stack** | Plain HTML + CSS + light JS (no framework), one folder, deploy to Netlify / Vercel / Cloudflare Pages / GitHub Pages |
| **Location** | 25 Bishop Street, Jolimont WA 6014 |
| **Phone** | 0405 476 121 |
| **Email** | info@tribewellnessco.com.au |
| **Instagram** | https://www.instagram.com/tribewellnessco/ |
| **Facebook** | https://www.facebook.com/tribewellnessco |
| **Member portal** | GymMaster — https://tribewellnessco.gymmasteronline.com/portal/ |

---

## 2. Brand & story

**Name meaning.** A *tribe* is a social group of people or a community with similar values or interests. Tribe Wellness Co is built around that: a small, supportive community rather than a big anonymous gym.

**What they stand for.** Three things: **Health, Fitness & Wellbeing**. Busy lives make people take these for granted; Tribe exists to build sustainable training programs that pay off for years.

**Positioning.** Small group training and personal training specialists, one boutique location, tailored programs for every member, regular check-ins with expert coaches, superb customer service, strong community. 24/7 gym access.

**Tone of voice.** Warm, direct, encouraging, no-nonsense. Confident about results, never intimidating. "Non-judgemental", "supportive", "you walk out feeling better than when you walked in."

**Logo.** Black square with "TWC" in white, wordmark "TRIBE WELLNESS CO." in white beside it. Monochrome. Current file: `https://images.squarespace-cdn.com/content/v1/5e2e6416ab72a14d5b9bf441/876164c8-23cd-48b8-8b5d-2fa1eb09f92c/tribe+wellness+logo.png` (419×156). Client to supply a high-res original (ideally SVG, plus a version with black text on transparent for light backgrounds).

---

## 3. Design direction

**Original brief:** warm orange and white, bold way of showing fitness, premium-gym feel, must sit well with the black/white TWC logo.

**Revised direction (Oct 2026):** black, vibrant orange and white. Classy and editorial rather than loud: every section fits one viewport, generous whitespace, refined type sizes (not "zoomed in"), big photography with a consistent dark grade. Reference: https://tribewellness.vercel.app/

### Palette

| Token | Hex | Use |
|---|---|---|
| `--orange` / `--lime` | `#F2621E` | Primary accent: CTAs, highlights, section labels, hover states |
| `--orange-2` / `--lime-2` | `#C94A12` | Deep orange accent for hover states & borders |
| `--orange-soft` | `#FFF1E8` | Soft orange background tint for alerts & highlights |
| `--yellow` | `#FF8A00` | Secondary accent: gradient partner for orange on CTA bands |
| `--black` | `#0B0B0B` | Logo field, dark hero sections, headings |
| `--ink` | `#141414` | Secondary dark sections, cards on black |
| `--white` | `#FFFFFF` | Primary background |
| `--off-white` | `#F4F3EF` | Alternating light sections |
| `--grey` | `#8C8C88` | Captions, meta |

Rule: logo always sits on black or white, never on orange. Orange is the energy; black and white are the structure. White text is used on orange backgrounds for maximum contrast and legibility.

### Typography

- **Display / headings:** *Archivo* (variable: weight + width axes), uppercase, tight tracking. One word per headline may be set in *Instrument Serif* italic for an editorial accent.
- **Body:** *Manrope* 400/500 (continuity with the current site).
- Pull-quotes / testimonials: serif, larger size, lime opening quote mark on dark.

### Layout & feel

- Full-bleed dark hero with a gym photo, dark gradient overlay, large (not enormous) uppercase headline, lime CTA.
- Every section is `min-height: 100svh` on desktop and vertically centred; content is sized to fit a 1440×900 viewport.
- Sections alternate white / off-white / black. Lime→yellow gradient used as a band only for the final CTA strip ("Start your 7-day free trial").
- Big photography, rounded-corner (24–28px) image cards, generous whitespace.
- Membership tiers as cards with a lime "From $X/week" price chip.
- Fixed header: logo left, nav right, lime "Join Now" button. Transparent over heroes, solid black on scroll. Full-screen overlay menu below 1200px.
- Micro-interactions: subtle fade-up on scroll, button hover lift, image zoom on hover. No heavy animation. Respects `prefers-reduced-motion`.
- Mobile first. Max content width 1280px.

### Site-wide CTA hierarchy

1. **Join Now** → `/join`
2. **7 Day Free Trial** → `/join` (GymMaster portal)
3. **28 Day Kickstarter** → `/kickstarter`

---

## 4. Site map

| Page | New path | Old path | Notes |
|---|---|---|---|
| Home | `/` | `/` | |
| About | `/about` | `/about` | |
| Our Team | `/team` | `/our-team` | |
| Timetable | `/timetable` | `/timetable` | Live timetable rendered from the GymMaster class schedule API; sample data until the API key is connected |
| Prana Physio | `/physio` | `/prana-physiotherapy` | Was an iframe of pranaphysioandwellness.com.au; now an intro page that links out (better for SEO) |
| Memberships | `/memberships` | `/services-6-1` | |
| 28 Day Kickstarter | `/kickstarter` | `/28-day-trial-offer` | |
| Join | `/join` | `/join` | GymMaster signup embed |
| Contact | `/contact` | `/contact` | Form + map |
| Leaderboard | `/leaderboard` | — | New. "Who's showing up": points, streaks, podium |
| Community | `/community` | — | New. Member wall: wins, questions, shoutouts |
| Partners | `/partners` | — | New. Strategic partnerships (Prana Physio first; template for more) |
| Member Portal | `/portal` | — | New. Tribe UI over the GymMaster member login |

**Header nav order:** About · Our Team · Timetable · Memberships · 28 Day Kickstarter · Partners · Leaderboard · Community · Contact · [Join Now] (Prana Physio lives under Partners)

**Footer (all pages):** logo + tagline, social icons, Quick Links (Memberships, 7 Day Free Trial, Our Team, Timetable, Contact), Contact block (address, email, phone), Google Map embed.

Keep redirects from old paths (`/services-6-1`, `/28-day-trial-offer`, `/our-team`, `/prana-physiotherapy`) so existing links and Google results keep working.

---

## 5. Page content

All copy below is verbatim from the current site unless marked *[suggested]*. Light grammar fixes are noted in §8.

### 5.1 Home `/`

**Meta title:** TRIBE WELLNESS CO | Achieve Wellness Today – Join Us!
**Meta description:** Tribe Wellness Co offers personalized fitness, strength training, and wellness programs with 7-day free trials, group classes, and 24/7 gym access to support your health goals.

**Hero**
Full-bleed image (`Untitled design (7).png`, 3780×1890), dark overlay. Current hero has no text. *[suggested headline: "FIND YOUR TRIBE." / sub: "Small group & personal training in Jolimont. 24/7 gym access." / CTA: "Start your 7 day free trial"]*

**About us strip**
- Label: About us
- Heading: TRIBE WELLNESS CO
- Body: At Tribe Wellness Co, we only have three things in mind: *Health, Fitness & Wellbeing!* We know that our hectic day-to-day lives can often lead us to take these three important things for granted. This is the reason why we exist as we develop a sustainable training program for you that will benefit you for the years to come.
- Button: Read more → `/about`

**What we do best**
- Heading: What we do best
- Body: At Tribe Wellness Co, our Strength & Functional Fitness sessions are designed to help you move better, feel stronger, and train with purpose. We combine the foundations of traditional strength training with dynamic, real-world movement patterns to build a resilient, capable body.
  From lifting weights and mastering bodyweight movements to high-energy, circuit-based training, every session is intentional, adaptable, and built for long-term results.
- Button: 7 day FREE Trial → `/join`

**Three service tiles** (circular images, hover tilt)
1. 24/7 Gym Access — image `22.png`
2. Group Classes — image `23.png`
3. One on One Training — image `24.png`

**Memberships overview**
- Heading: Memberships
- Three columns, each with a looping muted video:
  1. **Class Membership** — Semi-Private Personal Training (Maximum 5 in Group) · Small Group Fitness Training · One on One Fitness Training · Over 60s Classes · *Price varies $50 to $80 per week*. Video: `10ca093a-4930-446a-b4a8-55c54c8049c1` (1:1, 6.6s)
  2. **Gym Membership** — From $15/week · 24/7 Access · Free 7 Day Trial Pass · Convenient access to top-notch equipment. Video: `62ac99b9-e738-4faf-9395-f82ce824e693` (16:9, 4.5s)
  3. **FIFO Membership** — From $34.50/week · 24/7 Gym Access · Unlimited Group Training. Video: `7bc16336-36fa-4ec9-83df-3c9bef140e98` (16:9, 4.6s)

**Testimonials** — heading: Hear from our community
1. "Tribe is a fantastic gym. Very supportive coaches, trainers and other gym goers. You can work at your own pace and receive help and guidance for training, managing injuries, nutrition, sleep, stress and general wellness." — Tribe Member
2. "I absolutely love this gym. The trainers are supportive and knowledgeable. Tribe caters for all fitness levels and provides a fun non judgemental environment. Everyone is super friendly and you always walk out feeling better than when you walked in. I cannot recommend Tribe highly enough!" — Tribe Member
3. "Joining Tribe Wellness has made the greatest impact to my physical and mental health. The coaches are great and supportive. They get to know each client and support them throughout the fitness and wellness journey." — Tribe Member

Full-width image below: building exterior (`4e9016dc…/TRIBE+WELLNESS+CO..png`, 3314×1639).

---

### 5.2 About `/about`

**Meta title:** About | Transform Your Fitness Today — TRIBE WELLNESS CO
**Meta description:** Discover personalized fitness and wellness programs at Tribe Wellness Co. Join our supportive community and achieve your health goals today.

**Hero:** "About us" over building exterior image (`1fae2d3e…/TRIBE+WELLNESS+CO..png`), 25% overlay.

**What we are about**
- At Tribe Wellness Co, we only have three things in mind:
- **Health, Fitness & Wellbeing!**
- We know that our hectic day-to-day lives can often lead us to take these three important things for granted. This is the reason why we exist!
- We are small group training and Personal Training specialists, working from one boutique location that helps people around the area with their health and fitness goals.
- We believe that there are no two people alike, so every member has a tailored training and nutrition program to meet their goals.
- We have regular check-ins with expert coaches and superb customer service set us apart from general gyms.
- We have an amazing community to support you!

Images: `Small+Group+Training.jpg` (4795×3200, sled push), `IMG_6915.jpeg` (1536×2048, group smiling).

**Closing line:** Fitness is not a destination, it is a way of life

---

### 5.3 Our Team `/team`

**Meta title:** Our Team | Join Our Wellness Community Today — TRIBE WELLNESS CO
**Meta description:** Meet the expert team at Tribe Wellness Co, specializing in personalized fitness, physiotherapy, and holistic health programs for all ages.

**Hero:** "Our Team" over `97995769…_o.webp` (1000×667), 54% overlay.
**Section heading:** MEET OUR TEAM!

Three circular portrait cards:

**ROSELY** — image `3.png` (3105×3105)
Rosely is a seasoned Personal Trainer with extensive experience in Musculoskeletal Injury Prevention and Physical Conditioning. As a certified Pilates instructor with a degree in Physical Education, she has been helping clients achieve their fitness goals for over a decade.

**JERMAINE** — image `Untitled+design.png` (2970×2970)
Jermaine got into the health and fitness industry in 2013, completed his Exercise and Sport Science degree in 2016 and is currently enrolled in a post-grad degree in Clinical Exercise Physiology.

**SHIV** — image `a83191e8-….jpeg` (1600×1552)
Shiv is an experienced female health and fitness coach with over 10 years in the dance and fitness industry. As a former professional dancer trained in multiple lifting styles, specializing in strength training for women, female health, functional fitness, and strength and conditioning.
Shiv is passionate about supporting positive body image and a healthy relationship with food. Shiv empowers women to build strength, confidence, and sustainable wellness.

---

### 5.4 Timetable `/timetable`

Rendered from `GET /portal/api/v1/booking/classes/schedule` (GymMaster Member Portal API) through the Netlify function proxy. Until the API key is configured the page shows a clearly-labelled sample week from `data/timetable.json`.

---

### 5.5 Prana Physio `/physio`

**Meta title:** Prana Physio | Achieve Wellness Today - Book Now — TRIBE WELLNESS CO
**Meta description:** Prana Physio at Tribe Wellness Co offers expert physiotherapy and wellness services to support your health and fitness goals in Jolimont.

Old page body was empty; the whole thing was an `<iframe src="https://pranaphysioandwellness.com.au/" height="800">` injected in the head. New page: a short intro section — "Physiotherapy on site at Tribe" — with a "Book with Prana Physio" button opening pranaphysioandwellness.com.au in a new tab (chosen for SEO; the iframe snippet is kept in an HTML comment in case the client wants it back).

---

### 5.6 Memberships `/memberships`

**Meta title:** Memberships | Join Now - Achieve Your Fitness Goals — TRIBE WELLNESS CO
**Meta description:** Explore membership options at Tribe Wellness Co, including gym access, personal training, group classes, and programs for ladies over 60 to achieve your fitness goals. Join today!

**Hero:** "Memberships" over `22.png` (4fb41ca0 version, 2268×2268, focal 32%/54%).
**Section heading:** Our Services

Six cards (3×2 grid), each: portrait image, title, body, price button.

| # | Title | Image | Body | Button | Link |
|---|---|---|---|---|---|
| 1 | **Gym Membership** | `TRIBE+WELLNESS+CO.+(9).png` | Join our community of fitness enthusiasts and experience the benefits of our affordable 24/7 gym membership in Jolimont. With convenient access to top-notch equipment, one-on-one In-body scans, and goal setting sessions, you'll have everything you need to reach your full potential! $15.00 per week (12 months payment) $25 per week (monthly) | From $15.00 per week | `/join` (old link `/jo` is broken) |
| 2 | **Group Classes** | `40.png` (bc2360ea) | At Tribe Wellness Co, our Strength & Functional Fitness sessions are designed to help you move better, feel stronger, and train with purpose. These sessions blend the best of traditional strength training with dynamic, real-world movement patterns to build a resilient, capable body. Under the guidance of our expert coaches, you'll follow a structured program that balances progressive strength development with functional exercises that enhance mobility, coordination, and endurance. Whether you're lifting weights, mastering bodyweight movements, or tackling circuit-based training, every session is intentional, adaptable, and geared toward long-term results. | From $50.00 per week | `/join` |
| 3 | **Semi-Private Group Classes** | `39.png` | At Tribe Wellness Co, our Semi-Private Personal Training sessions offer the perfect balance between personalised coaching and the motivational energy of a small group setting. Each session is limited to a maximum of four members, ensuring you receive individual attention and tailored support while still benefiting from the camaraderie and accountability of training alongside others. | From $69 per week | `/join` |
| 4 | **Personal Training** | `42.png` | We carefully match you with a personal trainer whose expertise aligns perfectly with your goals. Whether you're looking to build strength, lose weight, improve athletic performance, or simply live a healthier lifestyle, our team of certified coaches will help you succeed. | From $80.00 per week | `/contact` |
| 5 | **Ladies over 60** | `41.png` | Regain your strength, confidence, and vitality with our specialised semi-private training program for Ladies over 60. Our certified trainers will guide you through safe and effective workouts designed to improve your fitness, health, and overall wellbeing. *(text is duplicated on the live site — use once)* | From $69.00 per week | `/contact` |
| 6 | **FIFO Performance** | `38.png` (32608e5a) | Managing health and routine on a FIFO roster shouldn't be a hassle. Our specialised FIFO Membership offers unlimited access to all classes and gym facilities during your off-weeks and days off. | From $34.50 per week | `/contact` |

Note: home page says semi-private max **5**, memberships page says max **4**. Confirm with client.

---

### 5.7 28 Day Kickstarter `/kickstarter`

**Meta title:** 28 DAY KICKSTARTER OFFER — TRIBE WELLNESS CO
**Meta description:** Experience health and fitness with a 28-day trial at Tribe Wellness Co. Join now to enjoy classes, gym access, and a supportive community dedicated to wellness.
**OG image:** `TRIBE+WELLNESS+CO.+(6).png` (1200×628)

**Hero:** "28 DAY **KICK STARTER OFFER**" over `TRIBE+WELLNESS+CO.+(3).png` (3780×1890, focal 55%/17%), 38% overlay. No header nav on this page currently (landing-page style) — *[suggested: keep header for consistency]*.

**Offer**
- Heading: UNLIMITED Gym & Classes Trial
- Getting started is easy. Just register online to claim your **28-Day Free Trial Pass** and come in anytime during staffed hours.
- Enjoy affordable, convenient training and see if our gym is the right place for you. **Classes and Gym Access included.**
- **Semi-private Training $250** *(WAS $340)*
- **Small Group Training $199** *(WAS $250)*
- **NOT SURE? 7 DAY FREE TRIAL AVAILABLE via sign up portal**

**Signup:** GymMaster portal iframe (see §6) beside image `97995769…_o.webp` with 30px rounded corners.

**Follow Us on Social** — three images (`TRIBE+WELLNESS+CO.+(1).png` group floor, `38.png` (0593d879) bench press, `40.png` (84aa3dfb) rowers, `TRIBE+WELLNESS+CO..png` building) + Instagram/Facebook icons.

---

### 5.8 Join `/join`

**Meta title:** Join | Get Fit Today — Join Us Now — TRIBE WELLNESS CO
**Meta description:** Join Tribe Wellness Co for health and fitness with flexible memberships, a free trial, and expert team support. Start your wellness journey today.

**Hero:** "JOIN OUR TRIBE" over `TRIBE+WELLNESS+CO.+(4).png` (3780×1890), 23% overlay. Sub: Enjoy 7 day free trial. Button: SIGN UP TODAY → `/7dayfreetrial` (points to the GymMaster portal; on the new site scroll to the embed).

**Signup:** GymMaster portal iframe + image `97995769…_o.webp`.

**Visit Us**
- 25 Bishop Street, Jolimont
- **Phone** 0405 476 121
- **E-mail** info@tribewellnessco.com.au *(live site shows a typo "info@tribewellness.com.au" — use the correct one)*
- Button: Get Directions → https://www.google.com/maps/dir//25+Bishop+St,+Jolimont+WA+6014
- Map block (Tribe Wellness Co, 25 Bishop Street, Jolimont, WA, 6014)

**Social icons** (Instagram, Facebook)

**Gallery** (3-col grid, lightbox): `51.png`, `57.png`, `97.png`, `100.png`, `PT.webp`, `TRIBE+WELLNESS+CO..png` (8b77cbd4).

---

### 5.9 Contact `/contact`

**Meta title:** Contact | Get Started Today — TRIBE WELLNESS CO
**Meta description:** Contact Tribe Wellness Co. for memberships, appointments, and inquiries. Join our health-focused community in Jolimont for personalized wellness services.

**Hero:** "Contact us" over `TRIBE+WELLNESS+CO.+(2).png` (3024×2268), 38% overlay.

**Left: Contact form** (was Squarespace Forms + reCAPTCHA; now Netlify Forms with honeypot)
- Heading: Contact Us · Sub: Have Questions?
- Fields: First Name*, Last Name*, Email* (mailing-list opt-in), Subject*, Message*
- Submit: Submit · Success message: Thank you!
- 20px rounded corners on the form block

**Right: Tribe HQ**
- 25 Bishop Street, Jolimont.
- **Phone** 0405476121 (sms link)
- **E-mail** info@tribewellnessco.com.au
- **Hours**
  - 5.30am to 7.00pm – Mon to Thurs
  - 5.30am to 12.00pm – Friday
  - 8.00am to 12.00pm – Saturday
  - Appointments by bookings only.

---

### 5.10 Footer (global)

- Logo (419×156) + caption: As defined in the dictionary, a "**TRIBE**" is a social group of people or a community with similar values or interests. Here at Tribe Wellness Co, we only have three things in mind: *Health, Fitness & Wellbeing!* *(live site footer said "two things"; standardised)*
- Social: Instagram, Facebook
- **Quick Links:** Memberships · 7 day Free Trial · Our Team · Timetable · Contact
- **Contact us:** 25 Bishop Street, Jolimont. · info@tribewellnessco.com.au · 0405 476 121
- Google Maps embed: 25 Bishop St, Jolimont WA 6014 (place id `0x2a32a50cc997a873:0x98eee6c6fe149bde`, lat -31.94499, lng 115.81010)

---

## 6. Integrations & third-party code

| What | Detail | Action |
|---|---|---|
| **GymMaster signup portal** | `<iframe class="gmiframe" src="https://tribewellnessco.gymmasteronline.com/portal/?logo=0" width="100%" scrolling="no" frameborder="0" allow="camera *">` + `https://tribewellnessco.gymmasteronline.com/portal/static/js/hostpage.js` (auto-resizes the iframe; needs jQuery 1.11.2 loaded first via noConflict) | Kept as-is on Join and Kickstarter |
| **GymMaster Member Portal API** | https://www.gymmaster.com/gymmaster-api/ — base `https://tribewellnessco.gymmasteronline.com/portal/api/`, every call needs `api_key`. Used for: class schedule (`v1/booking/classes/schedule`), membership list (`v1/memberships`), prospects from the trial form (`v1/prospect/create`), member login + visits for personal stats (`v1/login`, `v2/member/visits/daily`). | Called through `netlify/functions/gm.js` so the key never ships to the browser. Set `GYMMASTER_API_KEY` in Netlify env. |
| **Facebook Pixel** | ID `229332431401549` | Kept in `<head>` of every page |
| **Loopa SmartEvents** | pId `68526157e3630c12d3aafe3d` (`rtb.loopa.net.au` + `ads-cdn.loopaautomate.com`) | Kept (marketing tracking) — confirm with client |
| **Google Maps embed** | Footer iframe (see §5.10) | Kept, lazy-loaded |
| **Contact form** | Squarespace Forms | Replaced with Netlify Forms (honeypot spam field). Formspree works too: swap the `action`. |
| **Prana Physio iframe** | pranaphysioandwellness.com.au | Link out (iframe snippet kept in a comment) |
| **Font Awesome 4.7** | Loaded but unused | Dropped |

---

## 7. Image inventory

Originals downloaded from the Squarespace CDN into `assets/img/src/` (target names below). Optimised WebP/JPEG derivatives in `assets/img/`. Keep PNG for the logo only.

| Target filename | Source path | Size | Used on | Alt |
|---|---|---|---|---|
| `logo.png` | `876164c8-…/tribe+wellness+logo.png` | 419×156 | header, footer | Tribe Wellness Co |
| `favicon.ico` | `1f3a8a32-…/favicon.ico` | — | all | — |
| `hero-home.png` | `3c7c3f75-…/Untitled+design+(7).png` | 3780×1890 | Home hero | gym interior |
| `tile-gym-access.png` | `8842a93a-…/22.png` | 2268² | Home tiles | — |
| `tile-group-classes.png` | `19545b6b-…/23.png` | 2268² | Home tiles | — |
| `tile-one-on-one.png` | `c3c15803-…/24.png` | 2268² | Home tiles | — |
| `building-exterior-1.png` | `4e9016dc-…/TRIBE+WELLNESS+CO..png` | 3314×1639 | Home | Exterior of Tribe Wellness Co building with signage, large windows, potted plants, and a wooden bench, under a bright blue sky |
| `building-exterior-2.png` | `1fae2d3e-…/TRIBE+WELLNESS+CO..png` | 3314×1639 | About hero, Kickstarter | Front view of a wellness center building with a white sign reading 'Tribe Wellness Co' and TWC logo |
| `building-exterior-3.png` | `8b77cbd4-…/TRIBE+WELLNESS+CO..png` | 3314×1639 | Join gallery | — |
| `sled-push.jpg` | `157795db-…/Small+Group+Training.jpg` | 4795×3200 | About | People exercising in a gym, lifting and pushing weighted sleds |
| `group-smiling.jpeg` | `95be54c7-…/IMG_6915.jpeg` | 1536×2048 | About | Group of people in a gym, smiling and raising their hands |
| `team-hero.webp` | `012ba44d-…/97995769_…_o.webp` | 1000×667 | Team hero | — |
| `gym-floor.webp` | `17cdd437-…/97995769_…_o.webp` | 1000×667 | Join, Kickstarter | — |
| `team-rosely.png` | `36a15774-…/3.png` | 3105² | Team | Rosely |
| `team-jermaine.png` | `9ca5682a-…/Untitled+design.png` | 2970² | Team | Jermaine |
| `team-shiv.jpeg` | `27e5968d-…/a83191e8-….jpeg` | 1600×1552 | Team | Shiv |
| `hero-memberships.png` | `4fb41ca0-…/22.png` | 2268² | Memberships hero | — |
| `membership-gym.png` | `f0099197-…/TRIBE+WELLNESS+CO.+(9).png` | 2268×3024 | Memberships | — |
| `membership-group.png` | `bc2360ea-…/40.png` | 2268×3024 | Memberships | Four people working out on rowing machines |
| `membership-semi-private.png` | `8b41ac1c-…/39.png` | 2268×3024 | Memberships | Three people performing plank exercises on mats |
| `membership-pt.png` | `676b911b-…/42.png` | 2268×3024 | Memberships | Man kneeling on gym floor with kettlebell, woman standing beside him |
| `membership-over60.png` | `6e0bcc1c-…/41.png` | 2268×3024 | Memberships | A woman lifting a barbell with green weight plates |
| `membership-fifo.png` | `32608e5a-…/38.png` | 2268×3024 | Memberships | — |
| `hero-kickstarter.png` | `b683429e-…/TRIBE+WELLNESS+CO.+(3).png` | 3780×1890 | Kickstarter hero | — |
| `og-kickstarter.png` | `…/6a22dfeb…/TRIBE+WELLNESS+CO.+(6).png` | 1200×628 | Kickstarter OG | — |
| `social-group-floor.png` | `c2e7f2d8-…/TRIBE+WELLNESS+CO.+(1).png` | 3024×2268 | Kickstarter | Five people exercising on the floor |
| `social-bench.png` | `0593d879-…/38.png` | 2268×3024 | Kickstarter | A man lifting weights using a bench press |
| `social-rowers.png` | `84aa3dfb-…/40.png` | 2268×3024 | Kickstarter | Four people on rowing machines |
| `hero-join.png` | `12fd3570-…/TRIBE+WELLNESS+CO.+(4).png` | 3780×1890 | Join hero | — |
| `gallery-51.png` | `54e39ae5-…/51.png` | 1080×1350 | Join gallery | — |
| `gallery-57.png` | `4487cb7b-…/57.png` | 1080×1350 | Join gallery | — |
| `gallery-97.png` | `76ae9c66-…/97.png` | 1080² | Join gallery | — |
| `gallery-100.png` | `3c1bab76-…/100.png` | 1080×1350 | Join gallery | — |
| `gallery-pt.webp` | `3a9995e1-…/PT.webp` | 2448×1836 | Join gallery | — |
| `hero-contact.png` | `69947c4f-…/TRIBE+WELLNESS+CO.+(2).png` | 3024×2268 | Contact hero | — |

**Videos** (Squarespace-hosted, `https://video.squarespace-cdn.com/content/v1/5e2e6416ab72a14d5b9bf441/{id}/`; client must supply originals):
- `10ca093a-4930-446a-b4a8-55c54c8049c1` — 1:1, 6.6s (Class Membership)
- `62ac99b9-e738-4faf-9395-f82ce824e693` — 16:9, 4.5s (Gym Membership)
- `7bc16336-36fa-4ec9-83df-3c9bef140e98` — 16:9, 4.6s (FIFO Membership)

---

## 8. Content fixes made in the rebuild

1. Footer says "two things in mind: Health and Fitness" — everywhere else says three. Standardised to **Health, Fitness & Wellbeing**.
2. Join page email typo `info@tribewellness.com.au` → `info@tribewellnessco.com.au`.
3. Gym Membership button links to `/jo` (404) → `/join`.
4. Ladies over 60 paragraph is pasted twice → used once.
5. Semi-private max group size: home says 5, memberships says 4 → confirm.
6. "Semi-Private Group Classes" card is really semi-private PT; "FIFO PERFORMANCE" heading vs "FIFO Membership" on home → confirm naming.
7. Site timezone/state in Squarespace is set to Victoria; business is in WA. Irrelevant after migration but note for any date logic.
8. Home hero has no headline text — written (see §5.1 suggestion).
9. Prana Physio page was an iframe only — now links out.
10. Testimonials are unattributed ("Tribe Member") — ask client for first names if happy to use them.

---

## 9. Open items needed from client

- [ ] GymMaster API key (Settings → Integrations in GymMaster) for the live timetable, membership prices and trial-lead capture
- [ ] Original logo file (SVG/PNG, high res) + light-background version
- [ ] The three membership videos (MP4 originals)
- [ ] Confirm semi-private group size (4 or 5)
- [ ] Confirm Loopa tracking should stay
- [ ] Where contact form submissions should go (email address)
- [ ] Hosting choice (Netlify / Vercel / Cloudflare Pages) and domain DNS access
- [ ] Whether the Leaderboard and Community pages go live now, later, or not at all (they ship as demo-data modules; both are members-only and show no member data to visitors)
- [ ] Logos and blurbs for the other strategic partners (Partners page has a ready template; Prana Physio is live)

---

## 10. Build plan

```
tribe-wellness/
├── index.html … contact.html, leaderboard.html, community.html   (generated static pages)
├── src/                      partials (head, header, footer) + page bodies — edit these
├── tools/build.mjs           zero-dependency generator: node tools/build.mjs
├── css/style.css             tokens, layout, components
├── js/main.js                nav, reveal, lightbox, forms
├── js/gymmaster.js           API client (via Netlify function proxy, static fallback)
├── js/timetable.js · leaderboard.js · community.js
├── data/                     timetable.json, leaderboard.json, community.json (sample/seed data)
├── netlify/functions/gm.js   GymMaster API proxy (holds the key)
├── assets/img/               optimised images · assets/img/src originals
├── _redirects · netlify.toml · robots.txt · sitemap.xml · site.webmanifest
└── PROJECT.md
```
