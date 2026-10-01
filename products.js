const PRODUCTS = [
  // =========================================================
  // বিস্কুট
  // =========================================================
  {
    id: "বিস্কুট-1",
    name: "মিল্ক ফ্লেভার বিস্কুট",
    category: "বিস্কুট",
    categoryName: "বিস্কুট",
    price: 2750, // অফার প্রাইস
    oldPrice: 3050, // পূর্বের রেগুলার প্রাইস
    unit: "কার্টুন",
    stock: true, // স্টকে আছে
    badge: "১০% OFF", // ডিসকাউন্ট ব্যাজ
    description: "মচমচে দুধের স্বাদে ভরপুর কিউট মিনি বিস্কুট।",
    specs: [
      "SKU: 201-1",
      "Company: QiaQia Milk"
    ],
    images: ["products/biscuit/milk.jpg"]
  },
  {
    id: "বিস্কুট-2",
    name: "টিফিন টাইম ফ্লেভার বিস্কুট",
    category: "বিস্কুট",
    categoryName: "বিস্কুট",
    price: 3050,
    unit: "কার্টুন",
    stock: false, // স্টক শেষ (এটি false রাখলে কার্ট বাটন স্বয়ংক্রিয়ভাবে ডিসেবল হবে)
    badge: "স্টক আউট", // স্টক শেষের ব্যাজ
    description: "সকালের নাস্তা ও টিফিনের জন্য চমৎকার বিস্কুট।",
    specs: [
      "SKU: 2012",
      "Company: QiaQia Milk"
    ],
    images: ["products/biscuit/tiffin_time.jpg"]
  },

  // =========================================================
  // চিপস
  // =========================================================
  {
    id: "চিপস-1",
    name: "স্পাইসি মাসালা পটেটো চিপস",
    category: "চিপস",
    categoryName: "চিপস",
    price: 1800,
    unit: "কার্টুন",
    stock: true,
    badge: "HOT DEAL", // হট অফার ব্যাজ
    description: "খাঁটি আলুর পাতলা স্লাইস আর দেশি ঝাল মসলার দারুণ কম্বিনেশন।",
    specs: [
      "SKU: CHP-101",
      "ফ্লেভার: স্পাইসি মাসালা"
    ],
    images: ["products/chips/spicy_masala.jpg"]
  },
  {
    id: "চিপস-2",
    name: "ক্লাসিক সল্টেড ওয়েফার চিপস",
    category: "চিপস",
    categoryName: "চিপস",
    price: 1600,
    oldPrice: 1800,
    unit: "কার্টুন",
    stock: true,
    badge: "২০০৳ ছাড়", // নির্দিষ্ট টাকার ছাড় ব্যাজ
    description: "ফ্রেশ পটেটোর সাথে পরিমিত লবণের ক্রাঞ্চি বাইট।",
    specs: [
      "SKU: CHP-102",
      "ফ্লেভার: ক্লাসিক সল্টেড"
    ],
    images: ["products/chips/salted.jpg"]
  }
];