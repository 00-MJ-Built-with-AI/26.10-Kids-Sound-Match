import type { Lang } from '../../content/types';

/**
 * A tip for the parent on each game (the ⓘ on its tile): how to play it together, and what it
 * helps her learn. Short enough to read while she waits.
 */
export interface GameTip {
  how: string;
  learns: string;
}

export const TIPS: Record<string, Record<Lang, GameTip>> = {
  talk: {
    en: {
      how: 'Sit with her and look at the picture together. Ask "What\'s this?" and wait a few seconds: the waiting is the lesson. Tap ✓ for any try, even half a word.',
      learns: 'Saying words out loud, and that talking gets a happy answer.',
    },
    ar: {
      how: 'اجلسوا معها وانظروا إلى الصورة سوا. اسألوا «شو هاد؟» وانتظروا بضع ثوانٍ: الانتظار هو الدرس. المسوا ✓ لأي محاولة، حتى لو نصف كلمة.',
      learns: 'قول الكلمات بصوت عالٍ، وأن الكلام يلقى جواباً فرحاً.',
    },
  },
  sounds: {
    en: {
      how: '"What does the cow say?" Make the sound first a few times, then let her try. Moo, baa and quack are some of the first "words" children say.',
      learns: 'Copying sounds, the first step to copying words.',
    },
    ar: {
      how: '«البقرة شو بتقول؟» قولوا الصوت أنتم أولاً بضع مرات، ثم دعوها تحاول. «مووو» و«ماع» من أوائل «الكلمات» التي يقولها الأطفال.',
      learns: 'تقليد الأصوات، أول خطوة لتقليد الكلمات.',
    },
  },
  sing: {
    en: {
      how: 'Sing the song with the app, then stop before the last word and look at her. If she fills it in (even "aa"), cheer!',
      learns: 'Rhythm, memory, and finishing a sentence.',
    },
    ar: {
      how: 'غنّوا مع التطبيق، ثم توقفوا قبل الكلمة الأخيرة وانظروا إليها. إن أكملتها (ولو «آآ»)، صفّقوا لها!',
      learns: 'الإيقاع والذاكرة وإكمال الجملة.',
    },
  },
  point: {
    en: {
      how: '"Where\'s your nose?" Point to your own nose first, then hers. Tap ✓ when she points, on herself, on you or on the screen.',
      learns: 'Body parts, and understanding a question without gestures.',
    },
    ar: {
      how: '«وين أنفك؟» أشيروا إلى أنفكم أولاً، ثم إلى أنفها. المسوا ✓ حين تشير، إلى نفسها أو إليكم أو إلى الشاشة.',
      learns: 'أعضاء الجسم، وفهم السؤال دون إشارة.',
    },
  },
  actions: {
    en: {
      how: 'Do each action with her: clap, jump, wave. Stand up, it\'s more fun! Tap ✓ when she does it.',
      learns: 'Following one-step directions, and action words (verbs).',
    },
    ar: {
      how: 'افعلوا كل حركة معها: صفّقوا، اقفزوا، لوّحوا. قفوا، أمتع! المسوا ✓ حين تفعلها.',
      learns: 'اتباع تعليمة من خطوة واحدة، وكلمات الأفعال.',
    },
  },
  hunt: {
    en: {
      how: 'Walk around the room together looking for something red. Name what she finds: "A red cup!" Then tap ✓.',
      learns: 'Colours, and linking words on the screen to things around her.',
    },
    ar: {
      how: 'تجوّلوا في الغرفة معاً بحثاً عن شيء أحمر. سمّوا ما تجده: «كاسة حمراء!» ثم المسوا ✓.',
      learns: 'الألوان، وربط الكلمات على الشاشة بالأشياء حولها.',
    },
  },
  feel: {
    en: {
      how: 'Ask "How do you feel?" and make the faces with her. Name the feeling: "You\'re happy!" There\'s no wrong answer.',
      learns: 'Words for feelings, the start of calming down by herself.',
    },
    ar: {
      how: 'اسألوها «كيف حاسة؟» واعملوا الوجوه معها. سمّوا الشعور: «إنتِ مبسوطة!» لا يوجد جواب خاطئ.',
      learns: 'كلمات للمشاعر، وبداية تهدئة نفسها بنفسها.',
    },
  },
  book: {
    en: {
      how: 'Read it like a real book, on your lap. Point at each picture and wait for her to name it before you turn the page.',
      learns: 'Her own words, again and again: repetition is how words stick.',
    },
    ar: {
      how: 'اقرؤوه ككتاب حقيقي، في حضنكم. أشيروا إلى كل صورة وانتظروا أن تسمّيها قبل قلب الصفحة.',
      learns: 'كلماتها هي، مرة بعد مرة: التكرار يثبّت الكلمات.',
    },
  },
  story: {
    en: {
      how: 'Let her tap the things on each page and say what happens: "The cow says moo!" Ask "Where\'s the duck?" before she taps.',
      learns: 'Following a little story, and new words in a scene.',
    },
    ar: {
      how: 'دعوها تلمس الأشياء في كل صفحة وقولوا ما يحدث: «البقرة بتقول مووو!» اسألوا «وين البطة؟» قبل أن تلمس.',
      learns: 'متابعة قصة صغيرة، وكلمات جديدة في مشهد.',
    },
  },
  bedtime: {
    en: {
      how: 'Dim the lights, hold her close and say goodnight to each picture together. The lullaby ends with the sleepy moon.',
      learns: 'A calm routine before sleep, with her favourite words.',
    },
    ar: {
      how: 'خففوا الضوء، احضنوها وقولوا تصبحين على خير لكل صورة معاً. تنتهي التهويدة بالقمر النعسان.',
      learns: 'روتين هادئ قبل النوم، مع كلماتها المفضلة.',
    },
  },
  turns: {
    en: {
      how: 'Take turns at the matching game: her picture shows on her turns, yours on yours. Sometimes get it "wrong" on purpose and let her help you.',
      learns: 'Waiting, taking turns, and the joy of helping.',
    },
    ar: {
      how: 'تناوبوا في لعبة المطابقة: صورتها في دورها وصورتكم في دوركم. أخطئوا أحياناً عن قصد ودعوها تساعدكم.',
      learns: 'الانتظار وتبادل الأدوار ومتعة المساعدة.',
    },
  },
  routine: {
    en: {
      how: 'Go through the day\'s cards in the morning: "First breakfast, then the park." Tick each one as you do it.',
      learns: 'What comes next, which makes changes easier and tantrums fewer.',
    },
    ar: {
      how: 'مرّوا على بطاقات اليوم في الصباح: «أولاً الفطور، ثم الحديقة.» علّموا كل واحدة حين تنتهون منها.',
      learns: 'ماذا يأتي بعد، مما يسهّل التغيير ويقلل نوبات البكاء.',
    },
  },
  peekaboo: {
    en: {
      how: 'Say "Where is it?" in a big voice, then "There it is!" when she lifts the blanket. Play peekaboo with your hands too.',
      learns: 'Things still exist when hidden, and the fun of surprise.',
    },
    ar: {
      how: 'قولوا «وين راح؟» بصوت كبير، ثم «هياه!» حين ترفع البطانية. العبوا الغميضة بأيديكم أيضاً.',
      learns: 'أن الأشياء موجودة حتى لو اختبأت، ومتعة المفاجأة.',
    },
  },
  bubbles: {
    en: {
      how: 'Let her pop freely. Say "pop!" with each one and name what comes out. Blow real bubbles afterwards!',
      learns: 'Hand-eye control, and words heard many times in a short game.',
    },
    ar: {
      how: 'دعوها تفقع بحرية. قولوا «بوب!» مع كل فقاعة وسمّوا ما يخرج منها. انفخوا فقاعات حقيقية بعدها!',
      learns: 'التحكم بين العين واليد، وكلمات تسمعها مرات كثيرة في لعبة قصيرة.',
    },
  },
  care: {
    en: {
      how: 'Ask "The baby is hungry, what does she need?" Then do it with a real doll: feed it, put it to bed.',
      learns: 'Pretend play and caring for others, the root of empathy.',
    },
    ar: {
      how: 'اسألوها «البيبي جوعانة، شو بدها؟» ثم افعلوها مع دمية حقيقية: أطعموها ونوّموها.',
      learns: 'اللعب التخيلي والاهتمام بالآخرين، أساس التعاطف.',
    },
  },
  explore: {
    en: {
      how: 'Let her swipe through and tap, and name each thing with her. Add a little more: "A dog! The dog says woof."',
      learns: 'New words with no pressure: she leads, you name.',
    },
    ar: {
      how: 'دعوها تقلّب وتلمس، وسمّوا كل شيء معها. زيدوا قليلاً: «كلب! الكلب بيقول هو هو.»',
      learns: 'كلمات جديدة دون ضغط: هي تقود وأنتم تسمّون.',
    },
  },
  puzzle: {
    en: {
      how: 'Start with 2 pieces. If she gets stuck, guide her hand once, then let her try again by herself.',
      learns: 'Seeing parts and wholes, patience and hand control.',
    },
    ar: {
      how: 'ابدؤوا بقطعتين. إن علقت، وجّهوا يدها مرة واحدة، ثم دعوها تحاول وحدها.',
      learns: 'رؤية الأجزاء والكل، والصبر، والتحكم باليد.',
    },
  },
  shapes: {
    en: {
      how: 'Name each shape as she drags it: "The circle goes here!" If you have a real shape sorter, play it next.',
      learns: 'Shapes, and solving a problem by trying.',
    },
    ar: {
      how: 'سمّوا كل شكل وهي تسحبه: «الدائرة هون!» إن كان عندكم مُصنّف أشكال حقيقي، العبوا به بعدها.',
      learns: 'الأشكال، وحل المشكلة بالمحاولة.',
    },
  },
  big: {
    en: {
      how: 'Use your voice: "BIG" in a deep voice, "little" in a tiny one. Find big and little things at home too.',
      learns: 'Comparing sizes, one of the first ideas behind maths.',
    },
    ar: {
      how: 'استعملوا صوتكم: «كبير» بصوت غليظ، و«صغير» بصوت رفيع. ابحثوا عن أشياء كبيرة وصغيرة في البيت أيضاً.',
      learns: 'مقارنة الأحجام، من أولى أفكار الرياضيات.',
    },
  },
  opposites: {
    en: {
      how: 'Act each one out: shiver for cold, fan yourself for hot, reach up high, crouch down low.',
      learns: 'Describing words, and that words come in pairs.',
    },
    ar: {
      how: 'مثّلوا كل واحدة: ارتجفوا للبرد، هوّوا على أنفسكم للحر، امتدوا للأعلى، انزلوا للأسفل.',
      learns: 'كلمات الوصف، وأن الكلمات تأتي أزواجاً.',
    },
  },
  count: {
    en: {
      how: 'Count out loud slowly while she taps each one: one, two, three! Touch real things as you count during the day.',
      learns: 'One number for each thing, the start of counting.',
    },
    ar: {
      how: 'عدّوا بصوت عالٍ وببطء وهي تلمس كل واحد: واحد، اثنين، ثلاثة! المسوا أشياء حقيقية وأنتم تعدّون خلال اليوم.',
      learns: 'رقم لكل شيء، بداية العدّ.',
    },
  },
  missing: {
    en: {
      how: 'Look at all the pictures together and name them. When one hides, ask "Who went away?"',
      learns: 'Memory and paying attention.',
    },
    ar: {
      how: 'انظروا إلى كل الصور معاً وسمّوها. حين تختفي واحدة، اسألوا «مين راح؟»',
      learns: 'الذاكرة والانتباه.',
    },
  },
  tidy: {
    en: {
      how: 'Say where each thing goes: "Milk in the fridge!" Then tidy her real toys together with the same words.',
      learns: 'Sorting into groups, and helping at home.',
    },
    ar: {
      how: 'قولوا أين يذهب كل شيء: «الحليب بالثلاجة!» ثم رتّبوا ألعابها الحقيقية معاً بنفس الكلمات.',
      learns: 'التصنيف في مجموعات، والمساعدة في البيت.',
    },
  },
  scene: {
    en: {
      how: '"Can you find the horse?" Let her search the big picture. Give a hint with your finger if she needs it.',
      learns: 'Finding one thing among many, and names in context.',
    },
    ar: {
      how: '«بتلاقي الحصان؟» دعوها تبحث في الصورة الكبيرة. أعطوها تلميحاً بإصبعكم إن احتاجت.',
      learns: 'إيجاد شيء بين أشياء كثيرة، والأسماء في سياقها.',
    },
  },
  memory: {
    en: {
      how: 'Name each card when it turns over. Start with few pairs; the app offers more when she\'s ready.',
      learns: 'Remembering where things are.',
    },
    ar: {
      how: 'سمّوا كل بطاقة حين تنقلب. ابدؤوا بأزواج قليلة؛ التطبيق يقترح المزيد حين تكون جاهزة.',
      learns: 'تذكّر أماكن الأشياء.',
    },
  },
  odd: {
    en: {
      how: '"Which one is different?" Talk about why: "Three animals and a car!"',
      learns: 'Noticing what\'s the same and what\'s different.',
    },
    ar: {
      how: '«أيها مختلف؟» تحدثوا عن السبب: «ثلاثة حيوانات وسيارة!»',
      learns: 'ملاحظة المتشابه والمختلف.',
    },
  },
  game: {
    en: {
      how: 'Let her play, and cheer each right answer with her. Repeat the word after the app.',
      learns: 'Linking a sound or a word to its picture.',
    },
    ar: {
      how: 'دعوها تلعب، وافرحوا معها بكل جواب صحيح. كرروا الكلمة بعد التطبيق.',
      learns: 'ربط الصوت أو الكلمة بصورتها.',
    },
  },
};
