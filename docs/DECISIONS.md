# Decisions and changes from the V1 spec

Agreed on 29 September 2026, before the build. The Android build should carry these forward.

## Your decisions

| Topic | Decision |
|---|---|
| Stack | React + TypeScript + Vite; Vitest for tests. Runtime dependencies: react, react-dom only |
| Phone testing | Dev server on this PC, opened from the phone over home Wi-Fi |
| Pictures until real art | Emoji art for all 24 animals (development only) |
| Review style | Build everything; verify each checkpoint myself |
| Voice until recordings | The device's own text-to-speech, on-device voices only; tones if a language has no voice |
| Gendered Arabic praise | Gender-neutral lines: جميل! replaces أحسنت, session end becomes انتهينا! برافو! |
| Arabic words | MSA as scripted, but goat is عنزة (singular), not ماعز (collective) |
| Confusable pairs | Added bear ↔ lion and bear ↔ tiger |
| Toddler mode | Tapping any animal plays that animal's own sound and name, then praise, then moves on |
| Right tap | The animal's name, then praise |
| Wrong tap | Soft tone, picture fades, the target sound replays straight away |
| 2 pictures in portrait | Stacked top/bottom (~31–35% of the screen each instead of ~12%); side by side in landscape |
| Animal picker | "Animals" in Settings with presets (All, With real sounds, and the manifest's groups); animals without a real sound are off by default; minimum 5 |
| Forgot PIN | Type a number written in words (e.g. ثلاثمئة وثمانية وأربعون), then set a new PIN; the report is kept |
| Several pictures per animal | Supported: `"images": [...]` in the manifest, one picked at random each time |
| Arabic app name | Keep "Kids Sound Match" in both languages |

## Added on 30 September 2026

| Feature | How it works |
|---|---|
| Name-only questions | Third "What your child hears" option. The question is only the word ("Where's the cat?"). Items may now have no `sound`; they only appear in this mode, which opens the way for Clothes, Food and Family packs |
| Adaptive practice | On by default (Settings switch). When a game starts, each animal's last 10 tries in the Report set how often it's asked: first-try rate under 60% (2+ tries) = twice per round; 90%+ (4+ tries) = every other round. Toddler games are ignored |
| Gentle hints | On by default (Settings switch). The right picture wiggles after 8 s without a tap (again every 8 s), or straight after two wrong taps. Hinted answers are saved as not-first-try and marked "with a hint" in the Report. Never in Toddler mode |
| Both languages | Third game-language option: every name in Arabic, then English. Praise is picked from both languages; the end-of-game line plays in both |
| Explore mode | Second button on Home. All chosen animals, 6 per page with arrow buttons; tap one to hear its sound and name. No questions, nothing recorded. Same lock and exit as the game |
| Ready for more? | When the last 3 finished games at the current number of pictures reach 80% first try, Home suggests one more picture. Accepting goes through the PIN; "Not now" waits for 3 more games |
| Photo helper | `npm run photos`: shrinks photos with Windows' built-in imaging and adds them as `images`. Photos and emoji never share a question or an Explore page |
| Real app on the phone | Cloudflare Pages (private code, free HTTPS). `npm run deploy` uploads the test build (emoji and device voice included) so the phone can install it, keep the screen on and work offline |

## Added on 30 September 2026 (second round)

These override parts of the V1 spec at the owner's request: rule 6 ("no accounts, no login"), rule 4
("nothing leaves the device" — now true for the child's results, not for parents' own packs if they
sign in), rule 5 (microphone permission) and the V1 out-of-scope list (parent photos, voice
recording, cloud sync). The privacy promise and policy were rewritten to match.

| Feature | Decision |
|---|---|
| 30 more animals | 20 with sounds (chick, turkey, goose, parrot, peacock, eagle, seal, dolphin, whale, fox, zebra, deer, hippo, gorilla, crocodile, cricket, mosquito, bat, penguin, leopard) and 10 quiet ones for Name-only/Explore (rabbit, giraffe, turtle, fish, butterfly, snail, ladybug, ant, kangaroo, panda). No pig or boar. New sound-alike pairs: dog/seal/fox, horse/donkey/zebra, donkey/penguin, duck/goose, lion/tiger/bear/leopard, monkey/gorilla, bird/chick/cricket, bee/mosquito, snake/crocodile, mouse/bat, cat/peacock, dolphin/whale. New groups: Birds, Sea animals, Little creatures |
| Play again | A big ▶ on the end screen starts a new game with the same settings, up to a daily limit set in Settings (Off / 1 / 3 / 5 / no limit; default 3). After that the end screen waits for a parent |
| My packs | Parents create their own packs (5+ finished items to play). Item = square picture (photo from camera/gallery with crop, or an icon) + names + the name recorded in Arabic and/or English (record, then trim with two handles) + optional sound. Stored on the device (IndexedDB) |
| Cloud backup | Supabase, optional: "Sign in with Google" in My packs backs packs up and restores them on other devices (last change wins; deletions sync). Rows and files are private per account (Row Level Security). The app only contacts Supabase after a parent signs in. "Delete my cloud data" removes everything. Custom packs never go into telemetry |
| GitHub | Private repository, published from GitHub Desktop |

### More clips for the voice session

60 more name recordings, same naming as before (`<key>_name_ar.mp3`, `<key>_name_en.mp3`) for:
chick (كتكوت), turkey (ديك رومي), goose (إوزة), parrot (ببغاء), peacock (طاووس), eagle (نسر),
seal (فقمة), dolphin (دلفين), whale (حوت), fox (ثعلب), zebra (حمار وحشي), deer (غزال),
hippo (فرس النهر), gorilla (غوريلا), crocodile (تمساح), cricket (صرصور الليل), mosquito (بعوضة),
bat (خفاش), penguin (بطريق), leopard (فهد), rabbit (أرنب), giraffe (زرافة), turtle (سلحفاة),
fish (سمكة), butterfly (فراشة), snail (حلزون), ladybug (دعسوقة), ant (نملة), kangaroo (كنغر),
panda (باندا). Plus 20 animal sound effects (`<key>_sound.mp3`) for the first 20. Worth checking:
"deer" is named غزال (gazelle), the word most families use.

## Added on 30 September 2026 (third round)

| Feature | Decision |
|---|---|
| New packs | Things at home (15, with sounds), Vehicles (14, with sounds), Musical instruments (11, with sounds), Food (25), Body parts (13) and Family (9). The last three are name-only. Sound-alikes are never asked together: doorbell/phone/alarm clock, tap/shower/frying pan, door/hammer, keys/scissors, ambulance/police car/fire truck, car/bus/truck, plane/helicopter/rocket, train/ship, motorbike/tractor, drum/darbuka, oud/guitar, trumpet/saxophone, piano/accordion, hand/finger/arm, foot/leg, mouth/tongue/teeth, hummus/labneh, tomato/apple, Mama/Aunt, Baba/Uncle |
| Pack order | Manifests have an `order`: Animals, Things at home, Vehicles, Instruments, Food, Body parts, Family, Who eats what?, then Mixed, then your own packs |
| Who eats what? | A new kind of pack (`"kind": "association"`). The child sees and hears an animal (its sound, name, then "What does it eat?") and taps its food; a right answer plays the food's name, a "yum" and praise, and the food is "eaten". 15 foods for 39 animals. An animal that eats several of the foods (the horse: apple, carrot, grass) never sees its other foods as wrong answers. The Arabic question follows the animal's gender (ماذا يأكل؟ / ماذا تأكل؟), taken from a final ة or the manifest's `ar_feminine` (أفعى). Always sound + name + question, whatever "What your child hears" says; no Toddler mode and no Explore for this pack |
| Mixed game | A "Mixed" pack in Settings: every ready pack together, each with the pictures chosen for it; packs can be left out. Wrong answers come from the same side as the right one (built-in packs, or your own packs), so your photos are only asked with each other. A few sound-alikes across packs are kept apart (bell/doorbell/phone/alarm clock, drum/darbuka/door/hammer, trumpet/elephant, snake/frying pan/shower). Not sent in telemetry |
| Your voice and photos | My packs → Your voice and photos: record any name in the built-in packs in your own voice (Arabic and/or English), a sound, the praise lines, the end-of-game line and the Who-eats-what lines, or replace a picture with your own photo (Grandma's photo for "Grandma"). Anything not changed keeps the original; "Use original" undoes it. A file shared by two packs (the carrot in Food and Who eats what?) changes in both. Stored on the device and, when signed in, backed up with the packs (new table `custom_overrides`) |
| Settings | The pack choice is now a grid of pictures at the top; your own packs are marked "yours" |
| Report | "By picture", one section per pack. Mixed-game answers count for the pack each picture came from; Who eats what? counts separately from Food (naming a carrot and knowing who eats it are different skills). Game details show "Rabbit → Carrot" |
| Left out on purpose | "Teacher" (not family) and, in Who eats what?, peanuts and corn (the right answer wasn't clear-cut) |

### More clips for the voice session (third round)

- **190 name recordings** (Arabic + English) for 95 new pictures: the six new packs plus Who eats what?'s own
  foods (grass عشب, bone عظمة, seeds حبوب, bamboo خيزران, leaves أوراق الشجر, flower زهرة, meat لحم, lettuce خس).
- **40 sound effects** for Things at home, Vehicles and Musical instruments (`<key>_sound.mp3`).
- **4 lines**: `eat_question_ar.mp3` ماذا يأكل؟, `eat_question_ar_f.mp3` ماذا تأكل؟,
  `eat_question_en.mp3` "What does it eat?", and `yum.mp3` (a happy "mmm, yum!" or munching sound).
- Worth checking: Family uses the words toddlers say at home (ماما، بابا، تيتا، جدّو، عمّو، خالتو، بيبي), not MSA;
  Uncle and Aunt are one of each (عمّو, خالتو), and families can record their own word in "Your voice and photos".
- Pictures still to draw: dates (the placeholder is a palm tree), labneh and hummus have no emoji of their own.

## Added on 1 October 2026

| Feature | Decision |
|---|---|
| Where does it live? | A second association pack: see and hear an animal, then "أين يعيش؟ / أين تعيش؟ / Where does it live?", and tap its home. 9 homes: farm, house, sea, river, jungle, desert, snow, nest, hive. Animals with two homes (duck: farm and river; penguin: sea and snow) never see their other home as a wrong answer; farm/house and sea/river are never shown together. A right answer shows the home behind the animal, which hops |
| Colours, Shapes, Feelings | Starter sets of 6: red, yellow, blue, green, orange, purple; circle, square, triangle, star, heart, moon; happy, sad, angry, scared, sleepy, surprised. Colours are paint splats (never a circle) and the shapes are all one grey-blue, so only the shape differs; both are drawn as final art. Feelings have sounds (laugh, sob, "hmph", gasp, yawn, "wow"); scared and surprised are never shown together. The Arabic feeling words are the usual masculine forms (سعيد), describing the face |
| Counting 1 to 5 | واحد … خمسة. Each number is drawn five ways as final art: dice dots, apples, stars, balloons, fish. A question always uses one kind (3 apples next to 5 apples) |
| Mixed game | Colours, shapes and feelings join the mix, but their questions only show their own kind (no banana next to "yellow", no smiling Mama next to "happy"). Counting stays out |
| Packs without sounds | Packs with fewer than 5 sounds (Food, Body, Family, Colours, Shapes, Counting, a parent's pack of photos) are always played by name; "What your child hears" is hidden for them instead of warning |
| Child profiles | Up to 4 children, each an animal on a colour (no names or photos). Chosen above START on Home; Settings has a Children card (switch, change animal, add, delete). Each child has their own settings, Report, practice and daily play-again count; the PIN, My packs and your voice are shared. The first child keeps everything saved before profiles; deleting a child deletes their results on the phone |
| Share the Report | "Share as a picture" draws one page on the phone (the child's animal, games, answers, first-try %, a bar per pack, what they know well and are still learning) and opens the share menu (WhatsApp, email…); where sharing isn't available, "Save picture". Arabic is drawn right to left |
| Recording studio | Development only, on this PC (Home → Recording studio): every name, sound and line still using a stand-in, filtered by pack and Arabic / English / sounds. Space records (stops by itself after the word), Enter saves and moves on, P plays, R records again. Saves WAV straight into `public/assets` next to the manifest's file (`cat_name_ar.wav` for `cat_name_ar.mp3`; the app accepts either). Accepted only from this computer; a file it replaces is moved to `dev-assets/replaced`, never deleted |
| Cloud backup | Packs keep backing up even if `schema.sql` hasn't been run again since "Your voice and photos"; only that part waits |

### More clips for the voice session (fourth round)

- **64 name recordings** for 32 new pictures: colours (أحمر، أصفر، أزرق، أخضر، برتقالي، بنفسجي), shapes
  (دائرة، مربع، مثلث، نجمة، قلب، هلال), feelings (سعيد، حزين، غاضب، خائف، نعسان، متفاجئ), numbers
  (واحد، اثنان، ثلاثة، أربعة، خمسة) and homes (مزرعة، بيت، بحر، نهر، غابة، صحراء، ثلج، عش، خلية).
- **6 feeling sounds**: laugh, sob, "hmph", gasp, yawn, "wow".
- **3 lines**: `home_question_ar.mp3` أين يعيش؟, `home_question_ar_f.mp3` أين تعيش؟, `home_question_en.mp3` "Where does it live?".
- The studio (`Home → Recording studio` on this PC) is the quickest way to record all of these.

## Added on 2 October 2026

| Feature | Decision |
|---|---|
| Real pictures | Every built-in picture is a Microsoft Fluent Emoji "Color" drawing (MIT licence, credited in About, licence in `public/assets/licenses/`), downloaded with your approval: crisp at any size and the same on every phone. No emoji fitted dates, a beehive, a vacuum cleaner or an oud, so those four were drawn for the app in the same style |
| Your old photos | The 23 cat, dog and duck photos left the built-in pack (copies kept on this PC in `dev-assets/removed-photos`, not in git) and the photo helper (`npm run photos`) was retired: one consistent look. Your own photos still go in through "Your voice and photos" |
| Photos vs drawings | A question shows photos only when every picture in it is a photo (a parent's photo of Grandma falls back to the pack's drawing otherwise), then drawings, then development stand-ins |
| Memory | Pairs face down; turning a card says its sound and name; a found pair stays open with confetti; two different cards turn back after 1.3 s. No score or timer. Starts at 3 pairs; after 3 finished games with every pair found in at most two turns per pair, Home suggests 4, then 6 (behind the PIN; also in Settings). Uses the chosen pack's pictures |
| Odd one out | "أين المختلف؟ / Which one is different?" with 3 or 4 pictures (always at least 3). Easy: different packs (three animals and a car). After 3 finished easy games at 80%+ first try it moves to harder: groups inside a pack (three farm animals and a fish; three fruits and a vegetable); two hard games under 50% move it back. Groups overlap (a duck is a farm animal and a bird), so the odd one is checked against every group the others share: every question has one clear answer |
| Animal babies | A third question pack: see and hear a mother, "أين صغيره؟ / أين صغيرها؟ / Where is its baby?", tap the baby, who appears beside her. 10 babies: عِجل calf, حَمَل lamb, جَدي kid, مُهر foal, جَرو puppy, هُرَيرة kitten, كتكوت chick, شِبل lion cub, حُوار baby camel, فرخ البط duckling. Lamb/kid and calf/baby camel are never asked together. Real baby photos come from the studio's "Find real sounds and photos" once you approve them; until then the pack uses emoji in development and is hidden in release builds |
| Sticker album | After each finished game the child gets a sticker of a picture they found and don't have yet; it pops up on the end screen and flies into a book. The book (next to play again) opens the album: a page per pack, found stickers in colour, the rest as faint shapes; tapping one plays it. Per child, on this phone. (The V1 spec avoided rewards; you chose to add this one.) |
| Print flashcards | Home → Print flashcards: any pack, 4, 6 or 9 cards per A4 page with dashed cut lines, the picture with its Arabic and English names (names can be switched off). On a phone the print screen can save a PDF |
| Real sounds | The studio's "Find real sounds and photos" lists Pixabay candidates (free for apps, no credit needed) for every sound still on a tone: you listen, choose, trim and save; each file's source goes in `public/assets/licenses/sources.csv`. Nothing is downloaded until you choose it |

## Added on 2 October 2026 (second round)

Chosen for a 1.5-year-old (the main player): games she can play now, and a word list for her parents.

| Feature | Decision |
|---|---|
| First words | A new pack, second in the list: ball كرة, teddy دبدوب, balloon بالون, bubbles فقاعات, book كتاب, shoe حذاء, socks جوارب, hat قبعة, cup كوب, spoon ملعقة, bottle رضّاعة, bed سرير, chair كرسي, bath حمّام. Names only. 14 Fluent pictures (MIT), downloaded with your approval. Ball and balloon are never asked together |
| Peekaboo | For the youngest: a blue spotted blanket hides a picture of the chosen pack while its sound plays (every 4 s); one tap anywhere pulls it off: "بَخ!" / "Peekaboo!", the name, the sound again. The next tap brings the blanket back over the next picture. 10 pictures a game (the questions setting), a sticker at the end, nothing to get wrong. Things without a sound stay quiet under a wiggling blanket |
| Find it in the picture | Two scenes, drawn for the app and fitted to any screen: a farm (sky, tree, barn door, fence, field, pond) and a doll's house (bedroom, bathroom, kitchen, living room, with First words, Things at home and Family). "Where's the cow?" (its sound, then its name). It shows 2 more things than the picture setting (4-6), one area at a time so they spread out, each where it belongs (the duck in the pond), never two look-alikes (sheep and goat; clock and alarm clock). Tapping something else makes it hop and say what it is, then the question comes again; after 8 s or two other taps, the right one wiggles. The scenes take turns. "Sound only" leaves out things without a sound |
| Where's your nose? | "Find it at home" became body parts only: a big picture and "أين أنفُكِ؟" (asked up to 3 times, 6 s apart); she points at her own nose and you tap the big green tick (or skip). Tapping the picture asks again. 11 parts: eyes, nose, mouth, ears, hands, finger, arm, feet, leg, teeth, tongue (not face or heart) |
| Girl or boy | Each child's profile can say girl or boy, used only for Arabic grammar (أنفُكِ / أنفُكَ). Asked once, the first time Where's your nose? is played in Arabic; changeable in Settings → Children → Edit child. Kept on this phone, never backed up |
| Words I know | Home → Words I know (and a card in the Report), per child. A word counts as understood after 3 first-try rights on at least 2 different days; a miss takes one right away (so lucky guesses with 2 pictures don't add up); a hint without a wrong tap counts neither way; once known it stays. Counted from the matching game (not Toddler mode), Find it in the picture and Where's your nose? (your tick); not from Memory, Odd one out, Peekaboo or the association packs. Parents mark the words she says ("Says it?") and add words outside the app ("ماء", "bye-bye"). Share as a picture (her animal, the counts, up to 24 words) or print 9 to an A4 page with a title card. On this phone only |
| Real sounds, chosen for you | You asked me to fill the gaps myself: 82 Pixabay sound effects chosen from the studio's candidates (shorter single calls first), each cut to its loudest 3 s (vehicles 3.5 s, instruments 4 s) and saved as 22 kHz WAV through the studio, plus a seal (sea lions in Santa Cruz) and a language-neutral "mmm" for yum instead of the English "yummy". Every sound in the app is now real; all sources are in `public/assets/licenses/sources.csv`. Swap any you dislike in the studio (the old file is kept in `dev-assets/replaced`) |
| Baby photos, chosen for you | 10 Pixabay photos, one clear baby each, cropped square (720 px): calf, lamb, kid, foal, puppy, kitten, lion cub, a new baby camel (the earlier options were a crowded herd or black-and-white) and duckling, plus a real chick so the whole pack is photos |
| Soft "try again" tone | The spec's muted marimba note (0.35 s), made for the app instead of a Pixabay pop |
| The 8 sounds from your Drive | Confirmed on Pixabay: "Free for use under the Pixabay Content License" (cat, dog, frog, monkey, bear, sheep, tiger, duck); listed in sources.csv |
| "Name only" games | Now start with every picture, the quiet animals included; the "real sounds first" default only applies when sounds are played |
| Full screen | Some in-app browsers never answer a full-screen request; the game now starts anyway after 1.5 s |

### More clips for the voice session (sixth round)

- `feedback/peekaboo_ar.mp3` **بَخ!**, `feedback/peekaboo_en.mp3` **Peekaboo!**
- `packs/body/<part>_point_ar_f.mp3` for a girl: أين عيناكِ؟، أين أنفُكِ؟، أين فمُكِ؟، أين أُذُناكِ؟، أين يداكِ؟، أين إصبعُكِ؟، أين ذراعُكِ؟، أين قدماكِ؟، أين رِجلُكِ؟، أين أسنانُكِ؟، أين لسانُكِ؟ (11)
- `packs/body/<part>_point_en.mp3`: Where are your eyes? / nose / mouth / ears / hands / finger / arm / feet / leg / teeth / tongue (11)
- `packs/body/<part>_point_ar_m.mp3` for a boy (أين أنفُكَ؟...): only needed if a boy plays; the studio lists them once a child is a boy
- First words names: 14 in Arabic and 14 in English
- The studio lists all of these, and "Your voice and photos" lets you record them on your phone

## Added on 6 October 2026

| Feature | Decision |
|---|---|
| Hold time | Settings → Leaving a game: hold the corner circle 3, 5, 7 or 10 seconds (1 and 2 added on 11 October; 3 by default); the ring fills over that time. For the whole phone, like the PIN |
| Picture lock | Settings → Leaving a game → "Then ask for": PIN or 4 pictures. With pictures, leaving a game shows 9 big pictures (cat, dog, frog, apple, banana, car, ball, rocket, star); you tap your 4 in order. No delete key: after the 4th tap it checks and clears itself, so a wrong try just starts again. 3 wrong tries start the PIN's 30-second wait (they share the count). "Use the PIN" is always there. The code is stored salted and hashed like the PIN. Settings, the Report and My packs still ask for the PIN (changed on 11 October: they open without it) |
| Faster right answers | A right answer gets a second of confetti, no words (changed on 7 October: no name either), then the next question. Toddler mode too. The praise ("رائع!") is said once at the end of the game, before "انتهينا! برافو!", and the play-again screen comes after about 2 s instead of up to 6. Same in Find it in the picture and Where's your nose?; a Memory pair says its name |
| End screen | A much bigger play-again button in the middle, the sticker album bottom left, and a small "choose" button bottom right: pick the game, the pack and one of its groups (Farm, Wild, Birds, Fruit...), then Play. No lock (nothing else can be changed there); groups with fewer than 5 pictures are greyed out; the choice is saved for that child and counts as one of the day's play-agains. Only offered while play-agains are left |
| Pictures per question | 2, 3, 4, 5, 6, 7, 8 or 10 (as asked; 9 was left out). 5 to 10 are laid out 2 across when the phone is upright and in two rows when it's sideways. A small pack shows as many different pictures as it can. Odd one out stays at 3 or 4. "Ready for more?" still only suggests up to 4 |
| Names on the pictures | Every card shows its English name in the top left corner and its Arabic name in the bottom right, sized to the card (on by default; Settings → Names on the pictures). Matching game, Explore, Memory (face up), Peekaboo (once the blanket is off) and Where's your nose?. Not in the scenes, where things are small |

## Added on 11 October 2026

| Feature | Decision |
|---|---|
| Home without the PIN | Settings, the Report, My packs, Words I know, the studio and the "Ready for more?" buttons open straight from Home. Leaving a game (hold the corner, then the PIN or the 4 pictures) is the only lock: a child only reaches Home by getting past it. Changing the PIN still asks for the current one |
| Hold time | 1, 2, 3, 5, 7 or 10 seconds (3 by default) |
| Settings order | Pictures per question first, then the pack (group), then that pack's pictures, then everything else |
| Voices on this phone | A Settings card (test builds only, where the phone reads the names): for Arabic and English, the voice that will speak, a choice among the phone's own voices ("Automatic" picks Jordanian, Saudi, Emirati, then Egyptian Arabic) and a Test button. With no Arabic voice it says so and gives the install steps for this phone's system (Android, iPhone/iPad, Windows or Mac). Online voices are still never used. The choice is for the whole phone |
| Voices that load late | Phones often list their voices a second after the page opens. Whether to speak or play the placeholder is now decided when each word is played, not when the game starts, so the first questions no longer beep on a phone that has the voice |
| New packs | **Clothes** (9: T-shirt, dress, trousers, shorts, coat, scarf, gloves, glasses, boot), **Toys and play** (10: kite, puzzle, doll, robot, crayon, slide, scooter, skateboard, dice, yo-yo), **Weather and nature** (13: sun, moon, star, cloud, rain, thunder, wind, snow, rainbow, waves, fire, tree, flower), **Jobs and helpers** (10: doctor, police officer, firefighter, cook, farmer, pilot, builder, teacher, astronaut, mechanic). Fluent Emoji pictures. Weather has 5 real Pixabay sounds (rain, thunder, wind, waves, fire), so its sound game plays those 5 and "Name only" plays all 13; the other three are played by name. All four join the Mixed game; Clothes and Toys also join Odd one out. Never asked together: trousers/shorts, scooter/skateboard, and cloud/rain/thunder |
| Feelings pictures | Redrawn for the app, one colour per feeling and one big sign each: a wide smile (yellow), tears (blue), angry eyebrows and steam (red), wide eyes and a wobbly mouth (purple), closed eyes and Zzz (green), a round "O" mouth (pink). The old Fluent faces are in `dev-assets/replaced/feelings` |

### More clips for the voice session (seventh round)

- Names of the 42 new pictures, in Arabic and English: Clothes (قميص، فستان، بنطال، شورت، معطف، وشاح، قفازات، نظارة، جزمة), Toys (طائرة ورقية، أحجية، دمية، روبوت، قلم تلوين، زحليقة، سكوتر، لوح تزلج، نرد، يويو), Weather (شمس، قمر، نجمة، غيمة، مطر، رعد، ريح، ثلج، قوس قزح، أمواج، نار، شجرة، وردة), Jobs (طبيب، شرطي، إطفائي، طبّاخ، مزارع، طيّار، عامل بناء، معلّم، رائد فضاء، ميكانيكي)
- The studio lists them all

## Added on 11 October 2026 (second round): clearer pictures

| Pack | Decision |
|---|---|
| Body parts | Redrawn for the app: one child, each picture zoomed in on its part through a round window (a big eye with its eyebrow, the nose in the middle of the face, closed lips, a smile with both rows of teeth, the tongue sticking out, an ear beside the hair, an open hand, one finger pointing up, a whole arm, a bare foot with five toes, a leg with shorts and a shoe, a heart held against the chest, the whole face). Used by the matching game and Where's your nose? |
| Family | Redrawn as whole people, each on its own coloured circle and with one big difference: Mama (long hair, pink dress), Baba (beard, blue shirt), Grandma (grey bun, glasses), Grandpa (grey beard, glasses, walking stick), brother (red T-shirt with a star), sister (pigtails with bows), a baby in a nappy with a bottle, uncle (curly hair, moustache), aunt (short hair, headband). No hijab, as chosen. Your own photos (My packs → Your voice and photos) still replace any of them |
| Jobs and helpers | Redrawn as one big man per picture (the Arabic words are masculine) in the clearest uniform with a big tool: doctor (white coat, stethoscope, red cross), police officer (cap, badge, hand up), firefighter (red helmet, yellow suit, hose and water), cook (tall white hat, frying pan with an egg), farmer (straw hat, basket of carrots), pilot (cap, plane), builder (hard hat, hammer, bricks), teacher (board with A B C and أ ب ت), astronaut (helmet, stars), mechanic (spanner, tyre) |
| Animal babies | 10 new Pixabay photos where the baby fills the picture, alone: calf, lamb, kid, foal, puppy, kitten, chick, lion cub, camel calf and duckling. Listed in sources.csv |

The old pictures are in `dev-assets/replaced`.

## Added on 13 October 2026

| Feature | Decision |
|---|---|
| Record the words | My packs → Your voice and photos → **Record the words**: one word at a time, big picture and big word, Record (stops by itself after the word, then trim), and the next one comes up; "Hear it now" plays the phone's voice; Skip moves on. Order: every Arabic name still read by the phone's voice (no real recording and none of yours), pack by pack, then the English ones; a name two packs share is asked once. 5 a day suggested (five dots), stop any time. Saved like the other recordings of your voice (this phone, plus the backup if signed in) |
| Play time | Settings → Play time: Off (default), 5, 10, 15, 20 or 30 minutes, per child. A sitting starts with the first game from Home and goes on through play-agains and the end screen's picker; leaving to Home ends it. When the time is up, the question being played finishes (at most 30 more seconds), then a sleepy moon among the stars says "وقت الراحة" / "Time to rest". The game is paused underneath; tapping says it again; only the corner circle and the PIN (or pictures) lead out, to Home. On the end screen, after a reload or in Explore it starts straight away |
| Milestones | A new parent screen, "Milestones" (Home → For parents): 16 things many children start doing between 18 and 24 months, in four groups (talking, understanding, moving and hands, playing and feelings). The parent ticks what they've seen (dated, per child); each item links to the games that practise it. Gentle by design: "every child grows at her own pace: this isn't a test", and a line to talk to her doctor if something worries them. Not a medical screening |
| Certificates | Earned at 10, 25 and 50 words (the Words I know count: understood or said, plus words added outside the app) and for her first sentence (ticking "two words together" in Milestones). Shown in Words I know and Milestones; a new one is celebrated once on Home. Tapping one makes a shareable picture: her drawn character, her name if the parent types it (kept only on this phone), a rosette and the date it was first reached. A certificate stays earned |
| Do it with me | A new game, played like Where's your nose?: one action at a time, said in Levantine Arabic for a girl or a boy (from the child's profile; asked once if unknown) and in English, and the parent taps ✓ when the child does it (or skips). 18 actions: moving (clap سقّفي، jump نُطّي، wave باي باي، dance ارقصي، spin round دوري، stamp دبّكي), daily life (eat كُلي، drink اشربي، sleep نامي، wash your hands اغسلي إيديكِ، brush your teeth فرّشي سنانِك), love (kiss بوسيني، hug عبطيني، high five كفِّك) and calm (sit down اقعدي، lie down تمدّدي، shh ششش، cover your eyes خبّي عيونِك). Pictures drawn for the app: one toddler doing each action. Ticks count towards Words I know. The actions are only in this game (not in the pack list, the Mixed game or Odd one out) |
| Which language first | With both languages, Settings → Which first: Arabic first (as before) or English first, everywhere both are spoken. The anonymous statistics still just say "both" |
| Things at home | 6 more real sounds (Pixabay, about 3 seconds each): crying baby, washing machine, microwave beeps, toilet flush, hair dryer and blender. The door already plays a knock, so a blender came instead of knocking. Pictures drawn for the app in the Fluent style, the toilet from Fluent Emoji. Never asked together: vacuum, hair dryer and blender (motor sounds); tap, shower and toilet (water); washing machine and microwave (boxes with a round window) |

### More clips for the voice session (eighth round)

- "Time to rest": `feedback/rest_ar.mp3` **وقت الراحة**, `feedback/rest_en.mp3` **Time to rest**
- Do it with me: `packs/actions/<action>_do_ar_f.mp3` (girl), `_do_ar_m.mp3` (boy, only once a child is a boy), `_do_en.mp3`, with the words above; plus the 18 action names
- Things at home: the names of the 6 new sounds (طفل يبكي، غسّالة، ميكروويف، تواليت، مجفّف شعر، خلّاط)
- The studio lists them all

## Added on 3 November 2026: about 25 cards per group, clearer pictures, a new look

| Change | Decision |
|---|---|
| Pictures | Photos for the groups of things (Animals, Food, First words, Things at home, Clothes, Toys, Vehicles, Weather and nature, Instruments, Animal babies, Who eats what?): about 280 Pixabay photos, each picked by eye for one clear subject, cropped square around the subject on a plain background (720 px). Drawings stay for people, body parts, feelings, actions, colours, shapes and counting. Every photo card keeps its old 3D emoji as its "drawing": a screen shows photos only when every card on it has one (the Mixed game next to Body parts shows the drawings), and the drawn scenes and the stickers use the drawings |
| 25 cards | First words, Things at home, Clothes, Toys, Vehicles, Weather and nature, Instruments, Body parts, Jobs and Do it with me have 25; Animals 54 and Food 25 already had them. Colours, shapes and feelings 12, Family 14, Counting 1 to 10. Animal babies 20, Who eats what? 25. Names in Standard Arabic, with the everyday Levantine word where it differs (بندورة-style: حرام، مخدّة، شبّاك، عربايّة، كنزة، شحّاطة، قشاط، تكسي، جرّافة، سوّاق، كهربجي…) |
| Changed from the agreed list | Pixabay had nothing clear for some words, so they were swapped for close ones: swimsuit → raincoat (only bikinis and children in swimwear came up), bib → soap, potty → sofa, triangle → trombone, rababa → ukulele, mizmar → clarinet |
| New sounds | 34 real Pixabay sounds, 1 to 4 seconds each: the 11 new vehicles, the 14 new instruments (the trombone is a cartoon "wah-wah": no plain recording), trampoline, rubber duck, rattle, whistle, fan, and hungry (tummy rumble), thirsty (gulps), sick (cough), cold (chattering teeth). Things that sound alike are never asked together (taxi and car; the trucks; tram, train and bus; flute, nay and clarinet…) |
| A new look | Game cards: rounder, a soft orange ring and a deeper shadow, photos as rounded tiles, a press-in when tapped, a golden glow on the right answer, still soft bubbles in the background. Home: each game tile has its own colour and a round icon, the START button breathes gently, the logo bobs (both stop when the phone asks for less motion). Parent screens: rounder cards, coloured icon squares, brighter buttons and pack tiles |
| Drawing scripts | Kept in `tools/art/` this time (the earlier ones lived in a scratch folder that was cleared): `people-lib.mjs` (the kit), `draw-people-more.mjs`, `draw-more.mjs`, `draw-basics.mjs` |

### More clips for the voice session (ninth round)

- The names of the 165 new cards in Arabic and English, the 12 new body parts' "أين…؟" lines (girl and boy) and the 7 new actions' lines; the Recording session lists the names Arabic first

## Added on 3 November 2026: Feelings and Body parts redrawn as one whole child

Chosen from 10 sketched options: 1 (the part lit up), 2 (the whole child acts the feeling), 3 (a little scene that shows why) and 7 (movement).

| Change | Decision |
|---|---|
| Why | The old feelings were coloured balls, one colour per feeling, so a child could learn "yellow = happy" without looking at the face; tired and sleepy looked alike. The old body parts were close-ups in a round window, so back read as hair, tummy as a head, and chin, cheek, neck, elbow, shoulder and knee as patches of skin |
| Feelings (12) | A boy (the feeling words are masculine, سعيد) acting the feeling with his whole body, in a scene that shows why: happy jumps with a balloon; sad has dropped his ice cream; angry stands hands on hips by a knocked-over tower, steam above; scared holds his cheeks at a storm in the window; surprised opens a present; sleepy yawns in pyjamas and a nightcap with a teddy and the moon; hungry holds his tummy by an empty plate, thinking of food; thirsty holds an empty cup in the hot sun, thinking of water; tired sits slumped and sweaty after football; sick lies in bed with a thermometer and a cool cloth; shy peeks from behind a door, blushing; cold shivers in the snow in a hat and scarf. Each feeling has its own scene, so no two look alike (tired vs sleepy, scared vs surprised vs cold, happy vs shy, sad vs sick) |
| Body parts (25) | One girl, seen whole, the same in every picture. Everything but the part fades back, the part glows, and a magnifier top right (top left when the part is on the right) shows it close up. Big parts (face, hair, arm, leg, back) have no magnifier. Some pictures change her to show the part: barefoot for foot, toes, leg and knee; sleeveless for shoulder, elbow and arm; arm held out for arm; waving with an open hand, a pointing finger or her nails showing; a big smile with teeth; tongue out; shirt lifted for tummy; seen from behind for back; head lifted for neck; a red heart on her chest |
| Movement | Each picture moves a little: the glow pulses on every body part and the heart beats; tears roll, steam puffs, Zzz float up, the balloon sways, the cold boy shivers and the snow falls, the present's lid hops, the tummy rumbles, the sun turns, the tired boy breathes. The movement is inside each SVG (no app code), stops when the phone's own "reduce motion" setting is on, and the still picture is complete (the Report and printed cards draw it still) |
| Shape | A rounded square tile instead of the circle the other drawn packs use, so the whole child and the scene fit |
| Drawing script | `tools/art/draw-feelings-body.mjs` draws all 37; `draw-more.mjs` now draws only the actions |

## Added on 3 November 2026: games to play together, and more life in the pictures

For playing with a 20-month-old: five new things on Home, and three visual changes.

| Change | Decision |
|---|---|
| Talk time | Built on Where's your nose?: one big picture from the chosen pack, its sound, then "شو هاد؟" / "What's this?", asked up to 3 times with 6-second gaps so she has time. When she says it (or tries), the parent taps ✓: the name is said back, the word is marked "Says it" in Words I know (a mark is never taken away by the game), and it counts as understood like a right answer. Skip still says the name, so she always hears the word. Saved in the Report as "Talk time · N said" |
| Her picture book | A goodnight book from the words she understands or says, newest first (at most 10), topped up from the chosen pack when she knows fewer than 6. Cover (her animal on her colour), one page per word ("ليلة سعيدة" + the word, in each spoken language), then "ليلة سعيدة! نوم الهنا". Big arrows to turn the pages, the next page on the left in Arabic; tapping the picture reads the page again. Nothing is scored |
| Look after the baby | Pretend play. The baby (drawn in the app so it can react) is hungry (its tummy rumbles), thirsty, dirty (mud and stink lines), sleepy (yawns) or sad (tears), with "البيبي جوعان!" and the Feelings sound. She taps the bowl, the bottle, the bath, the bed or the teddy (a hug): the baby is fed, bathed in bubbles, tucked in or hugged, then laughs. A wrong one is named ("حليب") while the baby shakes its head, then it asks again. Every need once, in a new order. New pack `care` (own game): its pictures are drawn like Do it with me |
| My turn, your turn | The matching game with turns: her animal pops up for her turn ("دورك!"), a grown-up for yours ("دوري!", best recorded in your own voice in Your voice and photos). Only her answers go into the Report, practice and stickers |
| Our day | Routine cards for the parent to show her: a big "Now" card, a smaller "Next" one and a strip of the day. "Done!" praises, then says "حمّام… وبعدين قصة". "Change the day" adds, removes and reorders the 12 cards (wake up, eat, brush teeth, get dressed, shoes, go out, park, play, wash hands, bath, story, sleep). Per child, on this phone; a new day starts at the first card. New pack `routine` (own game); eat, brush teeth, wash hands and sleep reuse the Do it with me pictures |
| New lines | 6 shared lines in the Animals manifest (`feedback_audio.lines`): شو هاد؟، ليلة سعيدة، ليلة سعيدة! نوم الهنا، وبعدين، دورك!، دوري! (and English). The phone reads them until recorded; the Recording studio and Your voice and photos list them. The baby's 5 needs and the 12 routine names are new words to record too |
| Do it with me redrawn | The 25 actions are now the girl from Body parts, and each moves: the hands clap, she jumps, the arm waves, the legs dance and stamp, the spoon goes to her mouth, the ball rolls away, Zzz float up, hearts float from a kiss. Drawn by `tools/art/draw-play.mjs` (with the baby's things and the routine cards); the child kit is now shared in `tools/art/child-lib.mjs` |
| Family and Jobs move | Every person sways gently on the spot. Their original drawing script was lost, so `tools/art/add-motion.mjs` adds the movement to the existing pictures (safe to run again) |
| Come alive | A right answer moves for a moment inside the existing celebration: animals hop, vehicles drive off and come back, food is munched, weather floats up, instruments shake, toys and things bounce, people wave. Also on Talk time's ✓ |
| Evening calm | Settings → Evening calm: off (default), or from 6, 7 or 8 pm until 6 in the morning. The games turn dark blue with soft stars, the cards beige and dimmer, the celebrations slower and softer |
| Movement and less motion | All the new movement stops when the phone asks for less motion |
| Hold to leave: 1 second | The corner circle now needs 1 second by default instead of 3. Phones still on 3 seconds moved to 1 once; choosing another time in Settings → Leaving a game is kept |
| No PIN just after starting | For 2 minutes after a game is started from Home, holding the corner goes straight back to Home without the PIN or the pictures (the parent is still there, often trying a game out). Play again and the end screen's picker don't restart the 2 minutes, and the rest screen always asks |

## Added on 4 November 2026: eight more games to play together, and a cuter look

| Change | Decision |
|---|---|
| A cuter child | The drawn child (Feelings, Body parts, Do it with me, Look after the baby, Our day) now has a bigger head (1.3x, scaled about the neck), big shiny eyes with two sparkles (and lashes for the girl), rosier round cheeks with a highlight, a hair shine, a rounder body, and softer warm-brown outlines instead of near-black. Each picture's tile has a soft glow and a few tiny sparkles. The body-part highlights follow the bigger head (`headPt` in `tools/art/child-lib.mjs`). The baby has the same shiny eyes. Family and Jobs keep their older drawings |
| Home | The games are in two groups: **Play together** (you tick when she does it: Talk time, Animal sounds, Sing with me, Where's your nose?, Do it with me, Colour hunt, Her picture book, My turn your turn, Our day) and **Her games** (she taps, the app answers: Peekaboo, Pop the bubbles, Look after the baby, Explore, Big and little, Count with me, What's missing?, Tidy up, Find it in the picture, Memory, Odd one out). Pastel tiles, one colour per game. The games' background is a soft pastel sky with tiny dots |
| Animal sounds | Talk time for animal sounds: an animal, "بقرة… شو بتقول؟" (شو بيقول؟ for a masculine animal), then a quiet wait. When she makes the sound, you tick and the real sound plays; skip plays it too. Animals with a sound, from those chosen in Settings (all of them if fewer than 4). Report: "Animal sounds · N said" |
| Colour hunt | "دوّري على شي… أحمر" (دوّر to a boy): she points at something red around her, you tick, the colour is said again. The 12 colour splats. Counts towards Words I know like Where's your nose? |
| Big and little | The same picture twice, big and little, sides swapped at random: "قطة… وين الصغيرة؟" or "وين الكبير؟" (Arabic follows the word's gender). Right: confetti and the picture comes alive; wrong: the soft tone and the question again. Up to 10 questions, from the chosen pack |
| What's missing? | Three pictures pop onto a shelf, each named; a dotted blanket falls over one: "قطة… وين راحت؟" Tapping the blanket lifts it ("بَخ!" and the name); tapping one still there says its name and asks again. Up to 6 rounds |
| Count with me | "يلّا نعدّ!" and 1 to 3 of an animal (mostly 2 or 3). Each tap: it hops, a number badge appears and the number is said (Counting's واحد، اثنين، ثلاثة); then the total in a big circle with the animal's sound. Up to 6 rounds |
| Pop the bubbles | Soft rainbow bubbles float up with a picture inside each; a tap pops it (a short pop and drops) and the picture says its name. Ends after 20 pops (twice the questions setting). Free play: nothing is right or wrong |
| Tidy up | "يلّا نرتّب!" Six things on the floor (2 toys, 2 foods, 2 clothes); she drags each to the toy box, the fridge or the wardrobe (drop anywhere near it counts). For small fingers, tap a thing (its place glows and it says its name) then tap the place. The right place opens and swallows it; a wrong one shakes. Up to 3 rounds |
| Sing with me | Three songs, picked by picture: "راس، كتاف، رُكَب، وأصابع" (Head, shoulders, knees and toes), "إذا كنت فرحان" (If you're happy and you know it) and "مين بالمزرعة؟" (Who's on the farm?, written for the app). Each line is sung with its picture, the last word left out; the picture wiggles with a "?" for 2.6 s so she can say it, then the word comes (with the animal's sound on the farm). With both languages, the song is sung in one then the other. The ✓ is for you when she says it. New pack `songs` (own game): each line is an item (the line is its "name", the last word its point line), each song a group, so the studio and Your voice and photos list every line. **Record them singing**: until then the phone speaks them |
| New lines | 12 more shared lines: شو بيقول؟ / شو بتقول؟، وين الصغير/ة؟، وين الكبير/ة؟، دوّري / دوّر على شي، وين راح/ت؟، يلّا نعدّ!، يلّا نرتّب! (and English), plus a pop sound (`feedback/pop.wav`, made for the app) |
| Not in the Report | Big and little, What's missing?, Count with me, Pop the bubbles, Tidy up and Sing with me are play: they aren't saved in the Report |

## Added on 4 November 2026: 18 ways to look after the baby

| Change | Decision |
|---|---|
| Work on main | From now on every change goes straight to `main` (and so to the live app) without asking first, as asked. Noted in `CLAUDE.md` |
| 18 activities | Look after the baby grew from 5 needs to 18. Each need is drawn on the baby itself, and each fix is animated: hungry → food (spoon); thirsty → milk (bottle); dirty → bath (bubbles wash the mud off); sleepy → bed (blanket, Zzz); sad → hug (arms up, hearts); cold (snowflakes, chattering teeth, shivers) → woolly hat; hot (sun, red cheeks, sweat) → fan (spinning, wind); wet nappy (drips) → nappy (sparkles); runny nose (a drip) → tissue; ouchie (a scratch, a tear) → plaster (and kiss-hearts); bored (looks away, "…") → rattle (shaken in its hand); wants a song (a note in a thought bubble) → song (notes float, it sways); messy hair (sticking up) → hairbrush; teeth (food bits) → toothbrush (brushing, bubbles); dirty hands → soap (bubbles); sick (green cheeks, thermometer) → doctor's kit (stethoscope, a beating heart); wants to go out (thinks of a tree and the sun) → pram (rolls along); no clothes (in a nappy) → clothes (arms up, sparkles) |
| Three to choose from | With 18 things, all at once is too many at 20 months: each need shows the right thing and two others. A game is 6 needs, with ones not played last time first |
| Lines | "البيبي بردان!"، "البيبي شوبان!"، "حفاضة البيبي مبلولة!"، "مناخير البيبي عم تسيل!"، "البيبي تعوّر!"، "البيبي بدّه يلعب!"، "البيبي بدّه غنّية!"، "شعر البيبي منكوش!"، "يلّا نفرّش سنان البيبي!"، "إيدين البيبي وسخين!"، "البيبي مريض!"، "البيبي بدّه يطلع مشوار!"، "البيبي بدّه أواعي!" (and English), with the Feelings sound where one fits (shivers, a cough, a sob). The 13 new names: طاقية، مروحة، حفاضة، محرمة، لزقة، خشخيشة، غنّية، فرشاية الشعر، فرشاية السنان، صابون، سمّاعة الدكتور، عربايّة، أواعي. The phone reads them until recorded |

## Added on 5 November 2026: nine more things to learn and play

| Change | Decision |
|---|---|
| Her voice book | Words I know: each word has 🎙️ to record her saying it (stops by itself after 4 s; tap again to stop sooner) and ▶ to hear it. "Play her voice book" plays every recording, oldest first. One recording per word and child, kept in this browser only (IndexedDB `ksm-her-voice`), never backed up or sent; deleted with the child's profile |
| This week's card | Words I know → "Share this week's words": the same share picture, only with the words she understood, was marked as saying or was recorded saying in the last 7 days, and "N new this week" |
| Today's play | A card at the top of Home: three games for today, one to talk together (Talk time, Animal sounds, How do you feel?, Where's your nose?, Do it with me, Sing, Colour hunt), one to play (Bubbles, the baby, Peekaboo, Puzzles, Shape sorter, Tidy up, Count), one to think (matching, Big and little, Opposites, What's missing?, Memory, Explore, Find it in the picture). Within each, the game not played for longest comes first, so the days rotate; the plan stays the same all day and ticks a game once played (per child, on this phone) |
| How do you feel? | "كيف حاسّة اليوم؟" (حاسس to a boy) and six faces (happy, sad, angry, sleepy, scared, hungry). She taps one: it grows, says its name and sound. Each check-in is kept (the last 60, per child, on this phone); the Report shows a "How she felt" strip for the last 7 days |
| Opposites | New pack `opposites` (own game), drawn for the app: hot/cold, open/closed, up/down, full/empty, day/night. The pair side by side: "وين السخن؟" / "Which one is hot?"; right: the name and a bounce; wrong: the soft tone and the question again. Up to 10 questions |
| Puzzles | A picture from the chosen pack cut into 2 (side by side), then 3 (strips), then 4 (2 × 2). The board shows it faintly with dashed places; drag a piece onto its place (dropped near enough snaps in, with a pop) or tap a piece then its place. Finished: the picture comes alive and says its name |
| Shape sorter | A box with holes and shapes beside it: circle, square, triangle, then circle, star, heart, then square, triangle, star, heart. Drag a shape into its hole, or tap it (it says its name and its hole glows) and tap the hole. A wrong hole shakes |
| Bedtime | Her picture book with the Evening calm look whatever the time, then a lullaby with pictures (a star, the moon, sleeping): "نجمة صغيرة بتلمع فوق بالـ… سما!" / "Twinkle, twinkle, little… star!", then the sleepy moon. The lullaby is also a 4th song in Sing with me |
| Arabic letters | New pack `letters` (in the pack list, not in the Mixed game): the 28 letters, each a big coloured letter with a picture of a word that starts with it (أ أرنب 🐰، ب بطة 🦆 … ي يد ✋). Names "أ… أرنب" / "Alif, rabbit". The group "First letters" has 8 to start with. For later, around 2½ to 3 |
| New lines | كيف حاسّة اليوم؟ / كيف حاسس اليوم؟ / How do you feel today?; the 10 opposites' names and questions; the 28 letter names; the lullaby's 3 lines and words. The phone reads them until recorded |

## Added on 5 November 2026: which update is open

| Change | Decision |
|---|---|
| Update stamp | Home always shows, under the title, when this version was built ("Updated 5 Nov 2026, 14:32", in the phone's time), the version, the commit and the commit's first line. Baked in at build time (`__BUILD_TIME__`, `__BUILD_COMMIT__`, `__BUILD_MESSAGE__` in `vite.config.ts`; Vercel's commit details, else git). If it still shows an older time after an update, close the app and open it again |

## Added on 5 November 2026: a more polished look

| Change | Decision |
|---|---|
| Photos as stickers | The 287 photos are now cut out (rembg's `isnet-general-use` model, on this PC) and put on a soft pastel circle with a white sticker outline and a soft shadow, so they match the drawings. Whole scenes (Weather and nature, Where does it live?) and 32 photos that didn't cut out cleanly (the bus, the rocket, the whale, socks, the sofa...) keep the whole photo, framed in the circle. Same files, same names. Scripts: `tools/art/cutout.py` then `tools/art/compose.py` (its keep list says which stay whole) |
| Scenes behind the games | Each picture set has a soft illustrated background: a farm (animals), a road (vehicles), a kitchen (food), a playroom (home, toys, clothes, the baby), a garden (weather, Mixed), a park (people, body, feelings, jobs), space (shapes, colours, counting, letters, opposites), a stage (instruments, songs) and the sea (Where does it live?). Pale, detail at the edges, clouds and stars drifting. Darker and dimmer in Evening calm. Drawn by `tools/art/draw-scenes.mjs` into `public/backgrounds/` |
| Bunny | A bunny drawn for the app: it peeks in from a bottom corner and cheers on a right answer (at most every 1.5 s), cheers at the end of a game, and sleeps in a nightcap on the end screen. Hidden when the phone asks for less motion |
| Celebrations | A right answer bursts into confetti, stars, hearts or bubbles, at random |
| Family and Jobs redrawn | The last old drawings, now in the cute style: grown-ups have a slightly smaller head, trousers or a dress; Grandma a grey bun and glasses, Grandpa a grey beard and a stick, Baba a beard, the uncles a moustache or glasses; each job its uniform, hat and tool. Everyone sways gently. `tools/art/draw-people.mjs` (the older scripts that drew them are removed) |
| Letters | Each letter card shows a cut-out photo of its word (the rabbit, the duck, the apple...) where the app has one; the 5 without a photo keep their emoji |
| Home | The header is a little scene that follows the time of day (a rising sun in the morning, a sunset in the evening, the moon and stars at night) with the bunny waving (asleep at night) and the child's avatar. Every game tile shows a small drawing from its own game (the cow for Animal sounds, the baby for Look after the baby...) instead of a line icon. Tiles rise in one after another; screens fade in (parent screens rise a little) |
| Her drawn character | Settings → Children → Edit: besides the animals, 12 drawn children (6 girls, 6 boys, different hair and skin) to choose from, on the child's colour. Shown wherever the animal was: Home, the header, her turns, her book's cover, and the shared Report and Words pictures. A drawing, never a photo. `tools/art/draw-avatars.mjs` into `public/avatars/` |
| Her word garden | Words I know opens with a garden: a flower for each word she knows (its picture in the middle, the newest 40), a butterfly when she says it, a ♪ when her voice is recorded; tapping a flower plays her voice |
| Sticker book | The sticker album is now a book: each page is its picture set's scene with her stickers on it, gently wobbling. She can drag them anywhere (remembered per child); a tap plays the sound and name. The stickers still to find wait faintly under the page |

## Added on 5 November 2026: her favourites, tips, play time, milestones and certificates

| Change | Decision |
|---|---|
| Her favourites | Home → "Choose her favourite games" (or "Change"): tick the games she loves. They show first in a gold "Her favourites" group; every other game folds under "More games". Per child. Today's play then suggests only from her favourites (one each from talking, playing and thinking where it can, then her other favourites; topped up with the usual picks if she has fewer than three) |
| Tips | Every game tile has a small ⓘ: how to play it together and what it helps her learn, in English and Arabic, with a "Play now" button. Texts in `src/ui/parent/tips.ts` |
| Play time | Each game played is logged on this phone (which game, when, how long; a game left open counts at most 30 minutes, a peek under 3 seconds not at all). The Report opens with "Play time this week": minutes per day for the last 7 days (today in green) and her three most-chosen games |

## Added on 5 November 2026: Ramadan and Eid

| Change | Decision |
|---|---|
| When | Read from the phone's own Islamic (Umm al-Qura) calendar, so it moves with the moon each year: Ramadan is the 9th month; Eid is 1 to 3 Shawwal (Eid al-Fitr) and 10 to 13 Dhu al-Hijja (Eid al-Adha). Phones without that calendar simply don't show it. Settings → Ramadan and Eid: in season (default), Ramadan now, Eid now, or off |
| The look | Lanterns swing from the top of Home's sky with a "Ramadan Kareem" / "Eid Mubarak" ribbon (Eid adds little flags); a garland of lanterns, crescents and stars (Ramadan) or lanterns and flags (Eid) hangs over every game. Paler in Evening calm |
| Ramadan and Eid pack | 12 new drawings, in the cute style, gently moving: lantern (فانوس), crescent (هلال), dates (تمر), new clothes (أواعي العيد), Eid money (عيدية), ka'ak (كعك), ma'amoul (معمول), balloons, a present, a mosque (جامع), the drum (طبل) and qatayef (قطايف). A normal pack all year (Settings), not in the Mixed game; in season a card on Home starts the matching game or Explore with it, without changing the chosen pack. Names are read by the phone until recorded. `tools/art/draw-eid.mjs` |
| Eid Mubarak! | On Eid, the first time Home opens each day: "عيد مبارك / Eid Mubarak!" with her character, the bunny cheering, confetti and the Eid sweets. A tap closes it |

## Added on 5 November 2026: stories

| Change | Decision |
|---|---|
| Stories | A new game on Home ("Stories"). She chooses one of three covers (no words): **Bunny goes to the farm**, **Bath time** and **Going to Teta's**. Her own drawn character (or animal) and the bunny stand on every page; each page says its line ("مين بيقول مووو؟ البقرة!") and shows one or two things to tap: each jumps, bursts into confetti, makes its sound and says its name, and the bunny cheers. Big arrows turn the pages (right to left in Arabic); tapping the bunny or the page says the line again. 5 pages a story, over the farm, playroom, road and kitchen scenes |
| Its lines | The 15 lines are a new pack, "Stories" (its own game, not in the Mixed game), so they show up in the recording studio like any other word; the phone reads them until recorded. Arabic is gender-neutral. The page layouts are in `src/ui/kid/KidStory.tsx` |

## Added on 5 November 2026: backing up her things

| Change | Decision |
|---|---|
| Backing up her things | My packs → Cloud backup, once signed in: a new switch, "Also back up her things" (off by default). It copies each child's voice recordings, Words I know marks and added words, feelings check-ins, milestones, certificates, play time and favourite games to the parent's private cloud folder (the same storage and rules as the packs: `children/<child>/data.json` and `children/<child>/voice/<word>`; no new tables, so schema.sql doesn't change). Phones are merged, never overwritten: what either phone has is kept, the first date of a word or milestone wins, and the newer recording of a word wins. So un-marking a word on one phone can come back from the other. The first child has the same id on every phone, so one child just works across phones; other children are matched by their id on the phone that made them. "Delete my cloud data" removes these too. The game results in the Report still never leave the phone. The privacy page says all of this |

## Added on 5 November 2026: a phone check

Every screen and game was opened in Chromium at 320×568 (the smallest phones), 375×667 (iPhone SE),
360×740 (Android), 740×360 (sideways) and 820×1180 (tablet), in English and Arabic, with a script that
flags anything wider than the screen, cut-off text or page errors. Not a real phone: worth one try on
hers.

| Change | Decision |
|---|---|
| Offline on the first visit | The app used to download everything for offline use at once, about 60 MB including the stand-in voices, before it could work offline: slow on an older phone or mobile data. Now the app itself (8 MB: code, drawings, scenes, pack lists) is cached first; the photos and sounds are cached when they're first shown or played, and the rest a few at a time in the background, 8 seconds after opening (not with Data Saver on). Photos and sounds sit in their own cache, kept across app updates unless one of them changed, so an update no longer downloads them all again |
| Offline fix | Cached files are now matched whatever `Vary` header the server sent. A server that sends one (the local preview server does) made the cached app files never match, so the app opened blank offline. Not checked on Vercel (blocked from here), but the fix is harmless either way |
| Small phones | On 320–360 px phones the Home header's title and line are smaller so they no longer run into her avatar and the Ramadan ribbon; the header's lanterns hang where a small phone still shows them |
| Stories | The page arrows sit between the things and the two friends on any phone, higher when held sideways; the bunny no longer pops in twice when she taps |
| Found fine | No screen wider than the phone, no cut-off text, no page errors, in either language or orientation. Arabic screens read right to left, including the new ones (favourites, tips, play time, milestones, certificates, Ramadan and Eid, stories). Left as is: on the very smallest phones (320 px) the matching game's picture cards come close to the screen's edges, and held sideways the names on them sit near the bottom edge |

## Added on 5 November 2026: painting, music, hide and seek, the sleep light, snap a word, potty time, her week

| Change | Decision |
|---|---|
| Finger painting | She paints with her finger (several fingers at once) on a big white page, in thick soft strokes that sparkle as she goes. 8 colours from the Colours pack, each saying its name when picked (and again when she starts painting, at most every 6 seconds), and a magic rainbow paint. The page icon (top corner) starts a new page; the star saves and ends with stars. Each page she painted on is kept on this phone as a picture (the newest 40 per child), shown in the Report under "Her paintings" and in the week's picture. A game ends after 4 pages |
| Make music | Three ways to play, switched at the top: a xylophone of 8 coloured bars (a colour's name now and then), 6 animal drums (a drum beat and the animal's sound) and play-along, where any tap plays the next note of Twinkle, twinkle or Happy birthday while the next bar glows, so she always makes the song. The notes are made on the phone (no recordings needed). Ends after 120 taps |
| Hide and seek | Bunny hides in a drawn room: under the bed, behind the curtain, behind the door, behind the sofa, in the box, under the table. Each place she taps says itself ("تحت التخت؟"), then "مش هون!" or "هيّاه! لقيناه!" as he pops out with confetti. After two wrong places his ears peek out. Five hides a game. The places are a new Hide pack (recordable); three new shared lines (Where's Bunny?, Not there!, There he is!). `tools/art/draw-home-play.mjs` draws the room, the places, and the new games' tile pictures |
| Sleep light | A new tile in Play together. Choose rain, waves, the lullaby or quiet, and 10, 20, 30 or 45 minutes: a softly glowing moon with a sleeping face and the bunny asleep on it, twinkling stars, and the sound (made on the phone). Bright for the first two thirds, then the screen darkens slowly; at the end the sound fades out over 20 seconds, the screen goes black and the phone is allowed to turn it off. Locked like a game; no rest screen, and it doesn't count as play time. "After Bedtime too" makes it come on by itself when Bedtime's lullaby ends |
| Snap a word | For parents → Snap a word: "Take a photo" opens the camera straight away; name it (and record it if you like) and it becomes a card in a pack called "Her world" (one of My packs, so it is backed up with them), playable at once from that screen (Explore, or the matching game once it has enough cards) and counted in Words I know like any other pack |
| Her family in a photo | The same screen lists the family (Mama, Baba, Teta, Jiddo, brother, sister...): a photo of each replaces the drawing everywhere, as "Your voice and photos" already could, now in one place. The stories use them (Going to Teta's shows the real Teta; Bath time ends with Mama's hug), and her picture book now picks each page's picture on its own, so a page with a family photo shows it |
| Potty time | A tile in Play together opens Potty time: a gentle note (many children show they're ready between 20 and 30 months; no pressure), "Read the potty story" (a fourth story, Bunny's potty: a wee, pants down, did it!, paper and flush, wash hands; new Potty pack drawings), and a sticker chart for the week: a star for every try, a big star when she does it, with a celebration to show her, and an undo. Per child; included in "Also back up her things". A new milestone, "Shows interest in the potty", links to it |
| Her week, for the family | The Report has "Her week, for the family": one picture with her character and the dates, her new words this week with their pictures, how she felt, her latest painting, and a few happy lines (minutes of play, new words, potty stars, a certificate earned this week), ready for WhatsApp. On Fridays a card on Home reminds you (until opened or closed that day) |
| Her paintings | The Report shows her paintings (the newest 12; 40 are kept); tapping one opens it to save or share |

## Added on 9 November 2026: choose the look

| Change | Decision |
|---|---|
| Five looks | Settings > Look: As it is now (the old look, untouched, and the default), Sticker book, Storybook, Puffy toys, Bunny's show. Spotlight stage was mocked up and left out |
| Per child | Saved with each child's settings, so switching child switches the look |
| How far it reaches | Every game and parent screen has each look: its colours, lettering, card shapes and buttons, with a background colour per game. Painting, Make music, the bedtime book and the sleep light keep their own backgrounds. The parent asked for all the remaining games at once instead of three at a time |
| Pictures | Sticker book: each photo lifted off its pastel circle with a thick white edge (a whole scene in a round frame stays a round sticker; six pale subjects use rembg). Storybook: the card's drawing. Puffy toys: Microsoft Fluent Emoji 3D where one exists (223 cards); the rest keep their drawing. Bunny's show keeps the photos. A parent's own photo is never replaced. Scripts: `tools/art/sticker-cutouts.py`, `tools/art/puffy-3d.mjs` |
| Lettering | Baloo 2, Baloo Bhaijaan 2, Fredoka, Patrick Hand and El Messiri, packed with the app (SIL Open Font License); nothing is fetched while she plays |
| Size | A look's pictures and fonts are fetched for offline use only for a child using that look, so other phones don't download them |
| Evening calm | Takes over the look's colours at night; the look's cards and shapes stay |
| New words on screen | Sound words on Animal sounds and Bunny's questions (`src/content/lookWords.ts`), switched on after the parent saw the list and said to go ahead with everything |
| Pictures on one screen | In Puffy toys and Storybook every picture a look uses counts as that look's kind, so a card with nothing for the look keeps its drawing or photo instead of emptying the screen. The jigsaw uses the square photo in Sticker book |

## Added on 10 November 2026: seven more, to help her talk

The parent asked what to add, then to build all of it, after an interview.

| Change | Decision |
|---|---|
| 5 words today | A card on Home while words still have no recording and fewer than 5 were recorded today: "Record now" opens the existing recording session, "Not today" hides it until tomorrow. Arabic first, then English; within each, the words she has played most come first |
| Voice notes | The family keep using WhatsApp. Your voice and photos > A voice note from the family: choose the file, or share it to Sound Match from WhatsApp once the app is installed (`share_target` in the web manifest, kept by the service worker until the app reads it). Choose the word and language, trim, save. One voice per word, a new one replaces the old; one note can be cut for several words. The private link for relatives was not chosen |
| Two-word time | A tile in Play together. A picture, the phrase said twice with quiet waits, the parent ticks or skips and the phrase is said back. 8 phrases a game, those built from words she understands or says first (`src/content/phrases.ts`). Pack `phrases` (30, reusing existing pictures, own game). Saved in the Report, not in Words I know. The first tick brings a Home card offering to tick "says two words together" |
| Hello and thank you | Pack `manners` (17, drawn by `tools/art/draw-manners.mjs`): greetings, manners, Arabic blessings and asking (بدي، كمان، خلص، لا، آه). A tile in Play together that plays like Two-word time; a tick marks the word as said. In the pack list, not in the Mixed game |
| Checked first | Both packs stay off the live app until `NEW_WORDS_APPROVED` in `src/content/newWords.ts` is true, as the parent asked to see the words first. The parent saw the list and said to go ahead on 10 November 2026, so it is now on |
| Find the real one | At most once a sitting, on the end screen: "يلّا دوّري على… طابة" / "Can you find a real… ball?", with a word she just heard and only things on a safe list (`src/content/realThings.ts`: no sharp, hot or electric things, no animals). The parent ticks or skips; a tick counts towards Words I know. Not after the books, stories or the sleep light |
| Her own menu | "Let her choose" on Home opens four giant pictures with no words, locked like a game: her favourites, then her most-played, then games she can play alone. Never the bedtime book. After a game she comes back to it while today's play-again limit allows; the first choice isn't counted |
| For the doctor | A card in the Report: one page in Arabic or English, printed or shared as a picture. Age (from a birth month, optional, on this phone only and not backed up), words understood (split by the language of the games where it can be), words said, phrases tried, milestones ticked and not ticked. Counts only: it never says on track or behind |
| Android app | The parent chose the website installed as an app (a Trusted Web Activity made with Bubblewrap, in `android/`), not a Kotlin rewrite, and an APK for the family's phones rather than Google Play. Same games as the site, updated with it. It opens from the live site, then works offline once loaded. It can't pin the screen by itself: use Android's own App pinning. Voice notes can be shared into it from WhatsApp. The signing key is outside the repo; `public/.well-known/assetlinks.json` holds its fingerprint so the app opens without an address bar. How to rebuild: `android/README.md` |

## Added on 10 November 2026: getting the latest update

| Change | Decision |
|---|---|
| Update on Home | The stamp now says what this device has, checks the live site when Home opens or comes back into view, and says either that it is the latest or that a newer update is ready, with its date, its note and a "Get the update" button. Every build publishes `build-info.json`, which is never cached for offline |
| What updating touches | Only the app's own stored files. Cookies, sign-in, settings, Words I know, recordings and the photos and sounds cache stay. If the same update was tried and the device is still behind, the second press replaces the stored app files outright, again keeping all of those |
| Only on Home | Nothing updates by itself in the middle of a game because of this button |

## Fixes applied by default

1. Feedback paths (`feedback/...`) resolve from the assets root, matching spec 3.1; item paths resolve from `packs/`. `asset_root` is ignored because the item paths already include the pack folder.
2. A wrong tap stops the repeating sound before the soft tone, so nothing overlaps.
3. The celebration waits for the name and praise to finish (at least 1.2 s), so it never cuts a clip off or overlaps the next question.
4. Taps are ignored for 0.5 s after a question appears, so a finger still tapping can't skip it.
5. Targets come from a shuffle bag: every enabled animal is asked once before any repeats, never twice in a row.
6. If confusable pairs make a full question impossible (small packs), the game shows fewer pictures instead of failing; validation warns.
7. The report shows "1 of 5" style counts and hides percentages until an animal has 3 tries. Animals are listed hardest first.
8. Every clip is volume-levelled, trimmed of silence, and animal sounds are capped at 3 s with a fade. Your downloaded sounds have not been through the -16 LUFS step yet (the frog clip is about 4 s).

## Web versions of Android-only features

| Spec | Web version |
|---|---|
| Screen pinning | Fullscreen, Back button swallowed, screen kept awake, long-press/selection/zoom blocked, plus a one-time note on the phone's own lock (Android App pinning, iPhone Guided Access). A web page can't fully lock a phone; the first-run copy says so. |
| Silent / volume check | Browsers can't read the volume. A sound check plays a real animal sound; the parent confirms or gets tips. Once per visit. |
| Folder scan for packs | `assets/packs/index.json`, generated by the build (served live in development) |
| Room, DataStore, WorkManager | IndexedDB, localStorage; telemetry uploads when the app is opened (no background jobs on the web) |
| AD_ID removal, SDK allowlist | A Content-Security-Policy that blocks every other server, and a release gate that fails the build on placeholders, tracker domains or unlisted dependencies |
| Process death | The game is saved after every question; a reload returns to the same question behind a big play button |
| Offline | A service worker caches everything (HTTPS or localhost only) |

## Changes to make in the voice recording script (PDF) before the session

- Total clips is **60**, not 59 (24 + 24 + 10 + 2). The checklist mentions both.
- `correct_ar_1.mp3`: **جميل!** instead of أحسنت!
- `session_end_ar.mp3`: **انتهينا! برافو!** instead of أحسنت! لقد أنهيت اللعبة
- `goat_name_ar.mp3`: **عنزة** (ʿanza) instead of ماعز
- Worth a listen during the 8-of-10 adult test: camel (unfamiliar groan), owl vs pigeon, mouse vs bird. Add confusable pairs if they fail.
- The 8 downloaded sounds are confirmed Pixabay files (Pixabay Content License), listed in `public/assets/licenses/sources.csv`.

## Notes for later

- Photos only show when every picture on the screen has one (the rule above), including a parent's own
  photos. For Family, add photos to everyone you use, or turn the others off in Settings.

- With 3 or 4 pictures on a phone held upright, each picture is ~150 px (about 7% of the screen) because two share the width. Stacking 3 vertically would give ~225 px; the spec's 2 + 1 layout is kept for now.
- Emoji pictures depend on the phone's emoji font. The donkey (a 2022 emoji) is dropped automatically on phones that can't draw it.
- A release build (`npm run build`) shows "Nothing to play yet" until real pictures and name recordings exist, as the spec requires.
- The 23 photos from `Test-1` (cat, dog, duck) may be from the web. Confirm you're allowed to use them before publishing or releasing; the Dress and Glasses photos were skipped (no such animals).
