// api/deals.js — Vercel Serverless Function
//
// Generates a live-feeling feed WITHOUT a database: every request
// deterministically derives which deals are "live" from the current
// clock minute. Because it's a pure function of time, every visitor
// hitting this endpoint in the same minute sees the exact same feed —
// and next minute, some deals age out and different ones rotate in.
//
// This is a real, working stopgap for "add/remove every minute" while
// you don't yet have a live scraping/affiliate-API pipeline. Once you
// do, replace POOL with a fetch() to your real data source and this
// rotation logic becomes unnecessary — just return live prices directly.

const POOL = [
  { title:"Bosch 9 kg 5 Star Front Load Fully-Automatic Washing Machine, AI ActiveWater, Black Grey", store:"Amazon", category:"Home", price:27140, mrp:59990, image:null, link:"https://visit.desidime.com/visit/home-get-deals-1/2134699" },
  { title:"Samsung 12 kg 5 Star AI Ecobubble Fully Automatic Front Load Washing Machine", store:"Flipkart", category:"Home", price:30740, mrp:52990, image:null, link:"https://visit.desidime.com/visit/home-get-deals-1/2133740" },
  { title:"OnePlus Nord Buds 4 TWS Earbuds, 52dB Real-time ANC", store:"Flipkart", category:"Electronics", price:3049, mrp:3499, image:null, link:"https://visit.desidime.com/visit/home-get-deals-1/2134662" },
  { title:"Gillette Men Fusion5 Premium Gift Set — Handle, 2 Blades, Travel Case", store:"Myntra", category:"Grooming", price:299, mrp:999, image:null, link:"https://visit.desidime.com/visit/home-get-deals-1/2134687" },
  { title:"OnePlus Buds 4 TWS, Up To 45 Hrs Playback, In-Ear Earbuds", store:"Myntra", category:"Electronics", price:4967, mrp:6499, image:null, link:"https://visit.desidime.com/visit/home-get-deals-1/2134623" },
  { title:"OnePlus Nord Buds 3 Truly Wireless Bluetooth Earbuds", store:"Myntra", category:"Electronics", price:1802, mrp:2799, image:null, link:"https://visit.desidime.com/visit/home-get-deals-1/2134629" },
  { title:"Zebronics Premium Gaming Cabinet, Mid-Tower, 4 ARGB Fans, Tempered Glass", store:"Amazon", category:"Electronics", price:2831, mrp:13499, image:null, link:"https://visit.desidime.com/visit/home-get-deals-1/2134497" },
  { title:"Blue Star 2025 Model 1.5 Ton 5 Star Split Inverter AC", store:"Flipkart", category:"Home", price:35630, mrp:68600, image:null, link:"https://visit.desidime.com/visit/home-get-deals-1/2134531" },
  { title:"boAt Stone Arc Pro Plus Speaker, Spatial Audio, 45W Signature Sound", store:"Amazon", category:"Electronics", price:2699, mrp:10990, image:null, link:"https://visit.desidime.com/visit/home-get-deals-1/2134560" },
  { title:"Chamria Anardana Goli 100 gm", store:"DigiHaat", category:"Grocery", price:29, mrp:60, image:null, link:"https://visit.desidime.com/visit/home-get-deals-1/2134685" },
  { title:"Food Shape Fridge Magnets, Set of 9", store:"Meesho", category:"Home Decor", price:9, mrp:106, image:null, link:"https://www.meesho.com/search?q=Food%20Shape%20Fridge%20Magnets%20Set%20of%209" },
  { title:"Premium Acrylic \"Annadata Sukhi Bhav\" Fridge Magnet", store:"Meesho", category:"Home Decor", price:11, mrp:107, image:null, link:"https://www.meesho.com/search?q=Premium%20Acrylic%20Annadata%20Sukhi%20Bhav%20Fridge%20Magnet" },
  { title:"The Power of Your Subconscious Mind (Book)", store:"Meesho", category:"Books", price:11, mrp:107, image:null, link:"https://www.meesho.com/search?q=The%20Power%20of%20Your%20Subconscious%20Mind" },
  { title:"Rivoli Stones, 100 Pcs, 10×14mm Rectangle", store:"Meesho", category:"Craft", price:11, mrp:107, image:null, link:"https://www.meesho.com/search?q=Rivoli%20100%20Pcs%2010x14mm%20Rectangle%20Stone" },
  { title:"Stranger Things Poster Card Combo, 25 A6 Cards", store:"Meesho", category:"Home Decor", price:11, mrp:107, image:null, link:"https://www.meesho.com/search?q=Stranger%20Things%20Poster%20Card%20Combo%20A6" },
  { title:"Activities for Adults Bundle 1 (6×1 pc)", store:"Blinkit", category:"Books", price:25, mrp:120, image:null, link:"https://blinkit.com/s/?q=Activities%20for%20Adults%20Bundle" },
  { title:"Kids Activities Ages 3–6, Bundle 1 (5×1 pc)", store:"Blinkit", category:"Kids", price:25, mrp:120, image:null, link:"https://blinkit.com/s/?q=Kids%20Activities%20Ages%203-6" },
  { title:"Kids Activities Ages 3–6, Bundle 5 (5×1 pc)", store:"Blinkit", category:"Kids", price:25, mrp:120, image:null, link:"https://blinkit.com/s/?q=Kids%20Activities%20Ages%203-6" },
  { title:"Kids Activities Ages 7–11, Bundle 1 (5×1 pc)", store:"Blinkit", category:"Kids", price:25, mrp:120, image:null, link:"https://blinkit.com/s/?q=Kids%20Activities%20Ages%207-11" },
  { title:"Kids Activities Ages 7–11, Bundle 2 (5×1 pc)", store:"Blinkit", category:"Kids", price:25, mrp:120, image:null, link:"https://blinkit.com/s/?q=Kids%20Activities%20Ages%207-11" },
  { title:"Kids Activities Ages 7–11, Bundle 3 (5×1 pc)", store:"Blinkit", category:"Kids", price:25, mrp:120, image:null, link:"https://blinkit.com/s/?q=Kids%20Activities%20Ages%207-11" },
  { title:"Kids Activities Ages 7–11, Bundle 4 (5×1 pc)", store:"Blinkit", category:"Kids", price:25, mrp:120, image:null, link:"https://blinkit.com/s/?q=Kids%20Activities%20Ages%207-11" },
  { title:"Jai Ganesh Deva (2×1 pc)", store:"Blinkit", category:"Books", price:19, mrp:60, image:null, link:"https://blinkit.com/s/?q=Jai%20Ganesh%20Deva" },
  { title:"Somwar Vrat Katha (2×1 pc)", store:"Blinkit", category:"Books", price:19, mrp:60, image:null, link:"https://blinkit.com/s/?q=Somwar%20Vrat%20Katha" },
  { title:"DOVE Serum Bar with Sandalwood Oil (3 x 125 g)", store:"Flipkart", category:"Grooming", price:169, mrp:295, image:null, link:"https://visit.desidime.com/visit/home-new-get-deals-1/2133722" },
  { title:"Dettol Skincare Bathing Soap Combo, Face/Body/Hands (5 x 150 g)", store:"Flipkart", category:"Grooming", price:184, mrp:206, image:null, link:"https://visit.desidime.com/visit/home-new-get-deals-1/2133719" },
  { title:"Nilkamal Sierra Velvet Fabric Manual Recliner, Single Sofa", store:"Amazon", category:"Home", price:9749, mrp:47900, image:null, link:"https://visit.desidime.com/visit/home-new-get-deals-1/2133718" },
  { title:"Teakwood 8-Wheel Trolley Bag Set of 3 (Small/Medium/Large)", store:"Amazon", category:"Travel", price:2979, mrp:29999, image:null, link:"https://visit.desidime.com/visit/home-new-get-deals-1/2133717" },
  { title:"Samsung 150W Dolby Digital Bluetooth Soundbar, 2.1 Channel", store:"Amazon", category:"Electronics", price:5299, mrp:16999, image:null, link:"https://visit.desidime.com/visit/home-new-get-deals-1/2133714" },
  { title:"Aristocrat Lava Black 17-inch Laptop Backpack, 25L", store:"Myntra", category:"Fashion", price:329, mrp:1849, image:null, link:"https://visit.desidime.com/visit/home-new-get-deals-1/2133712" },
  { title:"Aristocrat 39L Hand Duffel Bag, Teal Blue", store:"Flipkart", category:"Fashion", price:440, mrp:1499, image:null, link:"https://visit.desidime.com/visit/home-new-get-deals-1/2133709" },
  { title:"Insta360 Action Camera X3, Sports and Action Camera", store:"Flipkart", category:"Electronics", price:20215, mrp:51999, image:null, link:"https://visit.desidime.com/visit/home-new-get-deals-1/2133707" },
  { title:"boAt Aavante Bar 3600, 500W Signature Sound, 5.1CH", store:"Amazon", category:"Electronics", price:8999, mrp:44990, image:null, link:"https://visit.desidime.com/visit/home-new-get-deals-1/2133705" },
  { title:"JCBL RGB Mouse Pad with 15W Wireless Charger", store:"Amazon", category:"Electronics", price:1999, mrp:4999, image:null, link:"https://visit.desidime.com/visit/home-new-get-deals-1/2133704" },
  { title:"Hitachi 1.5 Ton 5 Star Split AC, Anti-Bacterial Mesh Filter", store:"Amazon", category:"Home", price:39999, mrp:80990, image:null, link:"https://visit.desidime.com/visit/home-new-get-deals-1/2133703" },
  { title:"Giordano Analog Watch for Women, Stainless Steel Case", store:"Amazon", category:"Fashion", price:1511, mrp:8195, image:null, link:"https://visit.desidime.com/visit/home-new-get-deals-1/2133701" },
];

// Simple deterministic PRNG (mulberry32) — same seed always gives the
// same sequence, which is what lets every visitor in the same minute
// see an identical feed.
function seededRandom(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffle(arr, rng) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

module.exports = (req, res) => {
  const WINDOW_MS = 60000; // one rotation "tick" = 1 minute
  const windowIndex = Math.floor(Date.now() / WINDOW_MS);
  const windowStart = windowIndex * WINDOW_MS;
  const rng = seededRandom(windowIndex);

  const shuffled = shuffle(POOL, rng);
  const liveCount = Math.min(shuffled.length, 14 + Math.floor(rng() * 5)); // 14-18 live at once
  const live = shuffled.slice(0, liveCount);

  const deals = live.map((item, idx) => {
    const lifespanMinutes = 2 + Math.floor(rng() * 4); // each deal stays live 2-5 minutes from when it entered rotation
    return {
      ...item,
      id: `${windowIndex}-${idx}`,
      expiresAt: windowStart + lifespanMinutes * WINDOW_MS,
    };
  });

  res.setHeader("Cache-Control", "no-store");
  res.status(200).json(deals);
};
