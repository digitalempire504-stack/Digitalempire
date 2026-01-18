
import { SiteConfig, Package, User, Transaction, TransactionType, TransactionStatus } from './types';

export const INITIAL_SITE_CONFIG: SiteConfig = {
  heroHeadline: "আপনার ডিজিটাল সাম্রাজ্য গড়ুন আজই!",
  heroTagline: "আধুনিক ডিজিটাল প্ল্যাটফর্মে নিরাপদ বিনিয়োগ এবং দ্রুত আয়ের নিশ্চয়তা।",
  ctaText: "Login",
  supportEmail: "digitalempire504@gmail.com",
  whatsappNumber: "880123456789",
  bkashNumber: "017XXXXXXXX",
  nagadNumber: "018XXXXXXXX",
  announcement: "📢 স্বাগতম ডিজিটাল এম্পায়ার-এ! এখন থেকে ফেসবুক এবং হোয়াটসঅ্যাপ টাস্ক পূরণ করে ইনকাম করুন দ্বিগুণ।",
  features: [
    { icon: "fa-bolt-lightning", title: "সুপার ফাস্ট সার্ভিস", desc: "আমরা সর্বোচ্চ ৫ মিনিটে আপনার পেমেন্ট এবং উইথড্রয়াল নিশ্চিত করি।" },
    { icon: "fa-shield-halved", title: "হাই-গ্রেড সিকিউরিটি", desc: "আপনার ইনভেস্টমেন্ট এবং পার্সোনাল ডাটা আমাদের এন্ড-টু-এন্ড এনক্রিপশন দ্বারা সুরক্ষিত।" },
    { icon: "fa-crown", title: "প্রিমিয়াম সাপোর্ট", desc: "রয়াল মেম্বারদের জন্য আমাদের ডেডিকেটেড সাপোর্ট টিম ২৪/৭ লাইভ আছে।" },
  ],
  isMaintenanceMode: false
};

export const INITIAL_PACKAGES: Package[] = [
  { id: 'free', name: 'ফ্রি মেম্বারশিপ', price: 0, durationDays: 365, dailyTasks: 1, earningsPerTask: 2, features: ['প্রতিদিন ১টি কাজ', 'লাইফটাইম সাপোর্ট', 'সহজ উইথড্রয়াল'] },
  { id: 'p1', name: 'ব্রোঞ্জ এম্পায়ার', price: 500, durationDays: 30, dailyTasks: 5, earningsPerTask: 2, features: ['প্রতিদিন ৫টি কাজ', 'মাসিক ইনকাম ৩০০৳+', 'দ্রুত উইথড্রয়াল', '২৪/৭ সাপোর্ট'] },
  { id: 'p2', name: 'সিলভার এম্পায়ার', price: 1000, durationDays: 30, dailyTasks: 10, earningsPerTask: 2, features: ['প্রতিদিন ১০টি কাজ', 'মাসিক ইনকাম ৬০০৳+', 'বিশেষ বোনাস সুবিধা', 'প্রিমিয়াম মেম্বারশিপ'] },
  { id: 'p3', name: 'গোল্ড এম্পায়ার', price: 2000, durationDays: 45, dailyTasks: 15, earningsPerTask: 3, features: ['প্রতিদিন ১৫টি কাজ', 'টোটাল ইনকাম ২০০০৳+', 'লং টার্ম ভ্যালিডিটি', 'ভিআইপি সাপোর্ট'] },
  { id: 'p4', name: 'প্লাটিনাম এম্পায়ার', price: 5000, durationDays: 60, dailyTasks: 20, earningsPerTask: 5, features: ['প্রতিদিন ২০টি কাজ', 'মাসিক ইনকাম ৩০০০৳+', 'হাই স্পিড পেমেন্ট', 'পার্সোনাল ম্যানেজার'] },
  { id: 'p5', name: 'ডায়মন্ড এম্পায়ার', price: 10000, durationDays: 60, dailyTasks: 30, earningsPerTask: 7, features: ['প্রতিদিন ৩০টি কাজ', 'হাই প্রফিট মার্জিন', 'স্পেশাল রেফারেল বোনাস', 'ফাস্ট ট্র্যাক উইথড্র'] },
  { id: 'p6', name: 'এলিট এম্পায়ার', price: 20000, durationDays: 90, dailyTasks: 40, earningsPerTask: 10, features: ['প্রতিদিন ৪০টি কাজ', 'টপ টায়ার ইনকাম', 'লাইভ ভিডিও কনসাল্টেশন', 'অফিসিয়াল মেম্বার কার্ড'] },
  { id: 'p7', name: 'মাস্টার এম্পায়ার', price: 30000, durationDays: 90, dailyTasks: 50, earningsPerTask: 12, features: ['প্রতিদিন ৫০টি কাজ', 'আনলিমিটেড আর্নিং পটেনশিয়াল', 'এক্সক্লুসিভ রিওয়ার্ডস', 'প্রায়োরিটি উইথড্রয়াল'] },
  { id: 'p8', name: 'গ্র্যান্ড এম্পায়ার', price: 50000, durationDays: 120, dailyTasks: 70, earningsPerTask: 15, features: ['প্রতিদিন ৭০টি কাজ', 'রাজকীয় ইনকাম সুবিধা', 'ফ্যামিলি ইন্স্যুরেন্স সাপোর্ট', 'বিশাল রেফারেল কমিশন'] },
  { id: 'p9', name: 'রয়াল এম্পায়ার', price: 75000, durationDays: 150, dailyTasks: 90, earningsPerTask: 20, features: ['প্রতিদিন ৯০টি কাজ', 'সাম্রাজ্যের শ্রেষ্ঠ মেম্বারশিপ', 'বিলাসবহুল রিওয়ার্ড সিস্টেম', '২৪/৭ ডেডিকেটেড টিম'] },
  { id: 'p10', name: 'ইম্পেরিয়াল কিং', price: 100000, durationDays: 180, dailyTasks: 100, earningsPerTask: 30, features: ['প্রতিদিন ১০০টি কাজ', 'সর্বোচ্চ আয়ের সুযোগ', 'লাইফটাইম রয়্যালটি', 'ভিআইপি ইনভেস্টর স্ট্যাটাস'] },
];

export const INITIAL_USERS: User[] = [];

export const INITIAL_TRANSACTIONS: Transaction[] = [];
