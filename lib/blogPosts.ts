export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  publishedDate: string; // ISO format
  city?: string;
  content: { heading?: string; paragraphs: string[] }[];
  contentUrdu?: { heading?: string; paragraphs: string[] }[];
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "moving-to-riyadh-expat-guide",
    title: "Moving to Riyadh: A Complete Guide for Expats",
    description:
      "Everything expats need to know before moving to Riyadh — housing, neighborhoods, cost of living, and how to settle in quickly.",
    publishedDate: "2026-08-23",
    city: "Riyadh",
    content: [
      {
        paragraphs: [
          "Moving to Riyadh as an expat can feel overwhelming at first — a new city, a new pace of life, and dozens of small decisions to make before you even unpack your bags. This guide walks through the essentials: where to live, what to expect, and how to get set up quickly.",
        ],
      },
      {
        heading: "Choosing a Neighborhood",
        paragraphs: [
          "Riyadh is spread across several distinct districts, each with a different feel. Al Olaya and Al Malqa are popular with expat families for their compounds, international schools, and shopping access. Al Nakheel and Al Sulimaniyah offer a more central, walkable feel closer to business districts. Budget-conscious renters often look toward Al Aqiq or Al Rabwah for lower rents with easy commutes.",
          "Before committing to a lease, it's worth spending a weekend visiting a few neighborhoods in person — traffic patterns and noise levels can vary a lot street to street.",
        ],
      },
      {
        heading: "Finding Housing",
        paragraphs: [
          "Apartments, villas, and furnished rooms in Riyadh are commonly listed by individual landlords rather than large agencies, so classifieds platforms are often faster than going through a broker. You can browse live housing listings in Riyadh, filtered by budget and area, directly on KSA-Connect.",
          "When viewing a place, always confirm the deposit amount, whether utilities are included, and get the agreement in writing before transferring any money — see our full safety guide for more on avoiding rental scams.",
        ],
      },
      {
        heading: "Cost of Living Basics",
        paragraphs: [
          "Riyadh's cost of living varies widely by district. A furnished studio in a central compound can run significantly higher than a similar unit further out. Groceries, transport, and dining are generally affordable compared to Western capitals, though imported goods carry a premium.",
        ],
      },
      {
        heading: "Getting Settled",
        paragraphs: [
          "Once you've found a place, the next few weeks usually involve furnishing your home, finding a reliable driver or navigating ride-hailing apps, and connecting with the local expat community. Secondhand furniture and household items are widely available through local classifieds — often at a fraction of retail price, and a practical way to furnish quickly without waiting for shipments.",
          "Joining local expat groups (in person or online) is one of the fastest ways to get answers to the small, practical questions that come up in your first month — from which supermarket has the best selection to which clinics take your insurance.",
        ],
      },
      {
        heading: "Quick Checklist for Your First Month",
        paragraphs: [
          "Register your residence with your employer or sponsor as required, set up a local bank account, get a local SIM card, and take time to explore your neighborhood on foot before relying entirely on taxis. Keep copies of your Iqama and passport in a safe, accessible place.",
        ],
      },
    ],
    contentUrdu: [
      {
        paragraphs: [
          "Bahaisiyat expat Riyadh shift hona shuru mein thoda overwhelming lag sakta hai — naya shehar, zindagi ka naya andaz, aur samaan unpack karne se pehle hi dus chhoti-chhoti decisions leni padti hain. Ye guide zaroori baaton ko cover karti hai: kahan rahein, kya expect karein, aur jaldi kaise settle hoon.",
        ],
      },
      {
        heading: "Neighborhood Choose Karna",
        paragraphs: [
          "Riyadh kai alag-alag districts mein phaila hua hai, har ek ka apna alag feel hai. Al Olaya aur Al Malqa expat families mein popular hain — compounds, international schools, aur shopping tak aasan pahunch ki wajah se. Al Nakheel aur Al Sulimaniyah zyada central, walkable feel dete hain, business districts ke kareeb. Budget-conscious renters aksar Al Aqiq ya Al Rabwah dekhte hain — kam kiraya, aasan commute ke saath.",
          "Lease finalize karne se pehle, ek weekend nikal ke kuch neighborhoods khud visit karna acha rehta hai — traffic aur noise level street se street bahut different ho sakta hai.",
        ],
      },
      {
        heading: "Housing Dhoondhna",
        paragraphs: [
          "Riyadh mein apartments, villas, aur furnished rooms zyada tar individual landlords hi list karte hain, bade agencies nahi — isliye classifieds platforms aksar broker ke through jaane se jaldi kaam kar dete hain. Riyadh ke live housing listings budget aur area ke hisaab se filter karke seedha KSA-Connect par dekh sakte ho.",
          "Koi jagah dekhte waqt hamesha deposit amount confirm karo, utilities included hain ya nahi, aur paisa transfer karne se pehle agreement likhit mein le lo — rental scams se bachne ke liye humari poori safety guide dekh lo.",
        ],
      },
      {
        heading: "Cost of Living Basics",
        paragraphs: [
          "Riyadh ka cost of living district ke hisaab se kaafi vary karta hai. Kisi central compound mein furnished studio ka kiraya thoda door wali similar unit se kaafi zyada ho sakta hai. Grocery, transport, aur khana-peena Western capitals ke muqable mein generally affordable hai, lekin imported cheezon par thoda premium lagta hai.",
        ],
      },
      {
        heading: "Settle Hona",
        paragraphs: [
          "Jagah mil jaane ke baad, agle kuch hafte usually ghar furnish karna, reliable driver dhoondhna ya ride-hailing apps use karna, aur local expat community se connect hone mein guzarte hain. Secondhand furniture aur household items local classifieds par aasani se mil jaate hain — aksar retail price se kaafi kam mein, aur shipment ka wait kiye bina jaldi ghar set karne ka practical tareeka hai.",
          "Local expat groups join karna (in-person ya online) pehle mahine ke chhote-chhote practical sawalon ke jawab jaldi paane ka sabse aasan tareeka hai — kaunsi supermarket mein best selection hai se lekar kaunsi clinic tumhara insurance leti hai tak.",
        ],
      },
      {
        heading: "Pehle Mahine Ka Quick Checklist",
        paragraphs: [
          "Apne employer ya sponsor ke saath residence register karo (jaisa zaroori ho), local bank account khulwao, local SIM lo, aur taxis par poori tarah depend hone se pehle apne neighborhood ko paidal explore karne ka time nikalo. Iqama aur passport ki copies kisi safe, easily accessible jagah rakho.",
        ],
      },
    ],
  },
  {
    slug: "how-to-avoid-rental-scams-saudi-arabia",
    title: "How to Avoid Rental Scams in Saudi Arabia",
    description:
      "Practical tips to spot fake listings, verify landlords, and pay safely when renting an apartment or villa as an expat in Saudi Arabia.",
    publishedDate: "2026-08-24",
    content: [
      {
        paragraphs: [
          "Rental scams follow a familiar pattern almost everywhere in the world — and Saudi Arabia is no exception. A listing looks perfect, the price is unusually low, and the \"landlord\" is always conveniently unavailable to meet in person. Here's how to protect yourself while apartment hunting.",
        ],
      },
      {
        heading: "Common Scam Tactics to Watch For",
        paragraphs: [
          "A price noticeably below market rate for the area and photos is the single biggest red flag — scammers use attractive pricing to create urgency and get you to act before thinking it through.",
          "Other warning signs: the person refuses a video call or in-person viewing, claims to be traveling or working abroad and can't show the unit, asks for a deposit or first month's rent before you've seen the property, or pushes you to decide within hours because \"someone else is interested.\"",
        ],
      },
      {
        heading: "Always Verify Before You Pay",
        paragraphs: [
          "Insist on viewing the property in person, or at minimum a live video call where you can ask the person to walk around and show specific details (the view from the balcony, the meter numbers, the building entrance).",
          "Ask for the landlord's Iqama or ID and cross-check the name against the rental contract or utility bills for the unit if possible. A genuine landlord won't be offended by reasonable verification questions.",
          "If an agent or broker is involved, confirm they're actually authorized to represent the property — a quick call to the building's management office or neighbors can confirm this in minutes.",
        ],
      },
      {
        heading: "Safe Payment Practices",
        paragraphs: [
          "Never transfer money — deposit, rent, or \"reservation fee\" — before signing a written agreement and seeing the property in person. Legitimate landlords expect this and won't pressure you otherwise.",
          "Avoid cash-only arrangements with no receipt or paper trail. A bank transfer with a clear reference, alongside a signed contract, gives you a record if anything goes wrong later.",
          "Be especially cautious with anyone who only communicates via WhatsApp with a foreign number and refuses any other form of contact.",
        ],
      },
      {
        heading: "If Something Feels Off, Walk Away",
        paragraphs: [
          "Trust your instincts. If a deal feels rushed, if the story keeps changing, or if you're asked to pay before basic questions are answered — it's okay to walk away, even if the listing looked great. There will always be other apartments.",
          "On KSA-Connect specifically, you can browse listings and message sellers directly, and we encourage everyone to follow the same verify-first approach outlined in our full safety and fraud prevention guide before completing any deal.",
        ],
      },
    ],
    contentUrdu: [
      {
        paragraphs: [
          "Rental scams duniya bhar mein taqreeban ek jaisa pattern follow karte hain — aur Saudi Arabia bhi isse alag nahi hai. Listing perfect lagti hai, price ajeeb tarah se kam hoti hai, aur \"landlord\" hamesha in-person milne ke liye conveniently unavailable hota hai. Apna bachao kaise karein, yahan dekho.",
        ],
      },
      {
        heading: "Common Scam Tactics Jinse Bachna Hai",
        paragraphs: [
          "Area aur photos ke hisaab se market rate se kaafi kam price sabse bada red flag hai — scammers attractive pricing use karte hain taaki tum sochne se pehle hi jaldi decide kar lo.",
          "Baaki warning signs: banda video call ya in-person viewing se mana kare, kahe ki wo travel par hai ya bahar kaam kar raha hai isliye unit dikha nahi sakta, property dekhne se pehle deposit ya pehle mahine ka rent maange, ya few hours mein decide karne ka pressure banaye kyunki \"koi aur bhi interested hai\".",
        ],
      },
      {
        heading: "Paisa Dene Se Pehle Hamesha Verify Karo",
        paragraphs: [
          "Property khud jaake dekhne par zor do, ya kam se kam ek live video call karo jisme banda ghoom ghoom ke specific details dikhaye (balcony se view, meter numbers, building ka entrance).",
          "Landlord ka Iqama ya ID maango aur naam ko rental contract ya utility bills se match karo agar mumkin ho. Genuine landlord reasonable verification questions se bura nahi manega.",
          "Agar koi agent ya broker involved hai, confirm karo ki wo actually property represent karne ke liye authorized hai — building ke management office ya neighbours ko ek call karke ye chand minute mein confirm ho sakta hai.",
        ],
      },
      {
        heading: "Safe Payment Practices",
        paragraphs: [
          "Deposit, rent, ya \"reservation fee\" — koi bhi paisa transfer mat karo jab tak written agreement sign na ho jaaye aur property khud dekh na lo. Genuine landlords yehi expect karte hain aur pressure nahi dalte.",
          "Cash-only arrangements se bacho jisme koi receipt ya paper trail na ho. Clear reference ke saath bank transfer, signed contract ke saath, tumhe baad mein kuch galat hone par record deta hai.",
          "Especially cautious raho us insaan se jo sirf WhatsApp par foreign number se baat kare aur contact ka koi aur tareeka mana kare.",
        ],
      },
      {
        heading: "Agar Kuch Ajeeb Lage, Walk Away Kar Jao",
        paragraphs: [
          "Apne instinct par bharosa karo. Agar deal rushed lage, story badalti rahe, ya basic sawalon ka jawab diye bina paisa maanga jaaye — walk away karna bilkul theek hai, chahe listing kitni bhi achi kyun na lagi ho. Aur apartments hamesha milenge.",
          "KSA-Connect par specifically, tum listings browse kar sakte ho aur sellers ko direct message kar sakte ho, aur hum sabko encourage karte hain ki koi bhi deal complete karne se pehle humari poori safety aur fraud prevention guide mein diya wahi verify-first approach follow karein.",
        ],
      },
    ],
  },
];