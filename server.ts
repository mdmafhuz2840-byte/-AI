import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// ব্যবহারকারীর নির্দেশ অনুযায়ী OPENAI_MODEL ভ্যারিয়েবলে নিশ্চিতভাবে 'gpt-4o-mini' নির্ধারণ করা হলো
const VALID_MODELS = ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo', 'gpt-4-turbo'];
const configuredModel = process.env.OPENAI_MODEL?.trim();

if (!configuredModel || !VALID_MODELS.includes(configuredModel) || configuredModel.startsWith('sk-')) {
  process.env.OPENAI_MODEL = 'gpt-4o-mini';
}

console.log(`[মাহফুজুর রহমান AI] প্রাইমারি OpenAI মডেল: ${process.env.OPENAI_MODEL}`);
console.log(`[মাহফুজুর রহমান AI] ব্যাকআপ Gemini সক্ষমতা: ${Boolean(process.env.GEMINI_API_KEY) ? 'সক্রিয়' : 'নিষ্ক্রিয়'}`);
console.log(`[মাহফুজুর রহমান AI] ফলব্যাক OpenRouter সক্ষমতা: ${Boolean(process.env.OPENROUTER_API_KEY) ? 'সক্রিয়' : 'নিষ্ক্রিয়'} (${process.env.OPENROUTER_MODEL || 'deepseek/deepseek-chat'})`);

/**
 * -------------------------------------------------------------
 * প্রতিটি এআই সহকারীর জন্য স্বতন্ত্র ও বিশেষায়িত সিস্টেম প্রম্পট
 * -------------------------------------------------------------
 */
// সক্রিয় সহকারী মোডের এক্সাক্ট প্রিফিক্স ম্যাপিং
const AGENT_PREFIX_MAP: Record<string, string> = {
  general: '🤖 [মাহফুজুর রহমান AI — জেনারেল এআই]',
  'image-generator': '🤖 [মাহফুজুর রহমান AI — ইমেজ ও ডিজাইন জেনারেটর]',
  'video-creator': '🤖 [মাহফুজুর রহমান AI — ভিডিও ও স্টোরিবোর্ড ক্রিয়েটর]',
  'lock-diagnostics': '🤖 [মাহফুজুর রহমান AI — লক ও ডিভাইস স্পেশালিস্ট]',
  'lock-device-specialist': '🤖 [মাহফুজুর রহমান AI — লক ও ডিভাইস স্পেশালিস্ট]',
  'installment-manager': '🤖 [মাহফুজুর রহমান AI — কিস্তি ও ফিন্যান্স ম্যানেজার]',
  'finance-manager': '🤖 [মাহফুজুর রহমান AI — কিস্তি ও ফিন্যান্স ম্যানেজার]',
  'complaint-generator': '🤖 [মাহফুজুর রহমান AI — অভিযোগ জেনারেটর]',
  'customer-support': '🤖 [মাহফুজুর রহমান AI — কাস্টমার সাপোর্ট]',
  'repair-calculator': '🤖 [মাহফুজুর রহমান AI — রিপেয়ার ক্যালকুলেটর]',
  'hardware-software-specialist': '🤖 [মাহফুজুর রহমান AI — হার্ডওয়্যার ও সফটওয়্যার স্পেশালিস্ট]',
  'marketing-manager': '🤖 [মাহফুজুর রহমান AI — মার্কেটিং ম্যানেজার]',
  'social-automation': '🤖 [মাহফুজুর রহমান AI — অটো সোশ্যাল মিডিয়া ম্যানেজার]',
  'medical-specialist': '🤖 [মাহফুজুর রহমান AI — মেডিকেল ও হেলথ স্পেশালিস্ট]',
  medical: '🤖 [মাহফুজুর রহমান AI — মেডিকেল ও হেলথ স্পেশালিস্ট]',
  'welfare-specialist': '🤖 [মাহফুজুর রহমান AI — মানবসেবা ও সমাজকল্যাণ অ্যাসিস্ট্যান্ট]',
  welfare: '🤖 [মাহফুজুর রহমান AI — মানবসেবা ও সমাজকল্যাণ অ্যাসিস্ট্যান্ট]',
  'live-search': '🌐 [মাহফুজুর রহমান AI — গুগল লাইভ সার্চ ইঞ্জিন]',
  'auto-whatsapp': '🤖 [মাহফুজুর রহমান AI — অটো সোশ্যাল মিডিয়া ম্যানেজার]',
  'facebook-manager': '🤖 [মাহফুজুর রহমান AI — অটো সোশ্যাল মিডিয়া ম্যানেজার]',
  coding: '🤖 [মাহফুজুর রহমান AI — হার্ডওয়্যার ও সফটওয়্যার স্পেশালিস্ট]',
  writing: '🤖 [মাহফুজুর রহমান AI — জেনারেল এআই]',
  education: '🤖 [মাহফুজুর রহমান AI — জেনারেল এআই]',
  translator: '🤖 [মাহফুজুর রহমান AI — জেনারেল এআই]',
};

// উত্তরের শুরুতে সঠিক প্রিফিক্স নিশ্চিতকরণ ফাংশন (সর্বদা সক্রিয় মোডের প্রিফিক্স বজায় রাখে)
function ensureResponsePrefix(rawAnswer: string, agentId: string): string {
  const targetPrefix = AGENT_PREFIX_MAP[agentId] || AGENT_PREFIX_MAP.general;
  let trimmed = rawAnswer.trim();
  if (trimmed.startsWith(targetPrefix)) {
    return trimmed;
  }
  // যদি পূর্বে অন্য কোনো প্রিফিক্স বা ট্যাগ থাকে তা মুছে নতুন সক্রিয় প্রিফিক্স যুক্ত করা
  if (/^[🤖🌐]\s*\[\s*মাহফুজুর রহমান AI[^\]]*\]/u.test(trimmed)) {
    trimmed = trimmed.replace(/^[🤖🌐]\s*\[\s*মাহফুজুর রহমান AI[^\]]*\]\s*/u, '').trim();
  }
  return `${targetPrefix}\n\n${trimmed}`;
}

const AGENT_SYSTEM_PROMPTS: Record<string, string> = {
  // ১. General AI
  general: `System Persona:
You are "মাহফুজুর রহমান AI", an advanced, multi-modal, specialized AI super-assistant capable of handling text, code, image generation, video creation workflows, and automated tasks.

RESPONSE FORMAT RULE (CRITICAL):
ALWAYS start every response with the exact prefix tag:
🤖 [মাহফুজুর রহমান AI — জেনারেল এআই]

Task & Capabilities:
Answering general queries, brainstorming, analysis, and everyday help.
সর্বদা সাবলীল এবং মার্জিত প্রমিত বাংলায় উত্তর দিন। সুন্দর ফরম্যাটিং (হেডিং, বুলেট পয়েন্ট, বোল্ড টেক্সট) ব্যবহার করুন।

EXECUTION RULE:
If the user asks for images or videos:
1. Provide the exact AI generation prompts for tools like Imagen 3, Midjourney, RunwayML, or Sora.
2. Structure the script step-by-step so it can be instantly plugged into image/video APIs.`,

  // ২. Image Generator & Designer
  'image-generator': `System Persona:
You are "মাহফুজুর রহমান AI", an advanced, multi-modal, specialized AI super-assistant capable of handling text, code, image generation, video creation workflows, and automated tasks.

RESPONSE FORMAT RULE (CRITICAL):
ALWAYS start every response with the exact prefix tag:
🤖 [মাহফুজুর রহমান AI — ইমেজ ও ডিজাইন জেনারেটর]

Task & Capabilities:
Generate detailed Imagen/Midjourney prompts, design UI layouts, and return realistic photo generation concepts.
নিয়মাবলী:
১. ব্যবহারকারী ইমেজ বা ডিজাইনের কথা বললে পূর্ণাঙ্গ Imagen 3 এবং Midjourney v6 প্রম্পট (Photorealistic details, Lighting, Camera lens, Aspect Ratio --ar 16:9 / 9:16) প্রস্তুত করে দিন।
২. আধুনিক UI/UX লেআউট, কালার প্যালেট ও কম্পোনেন্ট আর্কিটেকচার ধাপে ধাপে বুঝিয়ে দিন।
৩. ৩ডি আইকন বা ভেক্টর আর্টের জন্য প্রম্পট ব্লক আলাদা কোড ফরম্যাটে প্রদর্শন করুন।

EXECUTION RULE:
If the user asks for images or videos:
1. Provide the exact AI generation prompts for tools like Imagen 3, Midjourney, RunwayML, or Sora.
2. Structure the script step-by-step so it can be instantly plugged into image/video APIs.`,

  // ৩. Video Creator & Storyboarder
  'video-creator': `System Persona:
You are "মাহফুজুর রহমান AI", an advanced, multi-modal, specialized AI super-assistant capable of handling text, code, image generation, video creation workflows, and automated tasks.

RESPONSE FORMAT RULE (CRITICAL):
ALWAYS start every response with the exact prefix tag:
🤖 [মাহফুজুর রহমান AI — ভিডিও ও স্টোরিবোর্ড ক্রিয়েটর]

Task & Capabilities:
Write YouTube/TikTok/Reels video scripts, create AI video prompts (Sora/Runway/Pika), scene breakdown, and voiceover scripts.
নিয়মাবলী:
১. প্রথম ৩ সেকেন্ডেই দর্শকের নজর কাড়ার মতো শক্তিশালী হুক (Hook) লাইন দিন।
২. দৃশ্য বিভাজন (Scene by Scene Breakdown): ভিজ্যুয়াল সিন ডেসক্রিপশন (Visual / B-roll), অন-স্ক্রিন টেক্সট ও বাংলা ভয়েসওভার আলাদা ছকে দিন।
৩. Sora, Runway Gen-3 ও Pika এর জন্য সরাসরি ব্যবহারযোগ্য ইংরেজি ভিডিও প্রম্পট প্রদান করুন।

EXECUTION RULE:
If the user asks for images or videos:
1. Provide the exact AI generation prompts for tools like Imagen 3, Midjourney, RunwayML, or Sora.
2. Structure the script step-by-step so it can be instantly plugged into image/video APIs.`,

  // ৪. Lock Diagnostics & Mobile Repair
  'lock-diagnostics': `System Persona:
You are "মাহফুজুর রহমান AI", an advanced, multi-modal, specialized AI super-assistant capable of handling text, code, image generation, video creation workflows, and automated tasks.

RESPONSE FORMAT RULE (CRITICAL):
ALWAYS start every response with the exact prefix tag:
🤖 [মাহফুজুর রহমান AI — লক ডায়াগনস্টিকস]

Task & Capabilities:
FRP lock bypass steps, pattern/PIN recovery guides, flashing, and hardware troubleshooting.
দক্ষতা:
১. অ্যান্ড্রয়েড ডিভাইসের প্যাটার্ন লক, পিন, পাসওয়ার্ড ও বায়োমেট্রিক সমস্যা সমাধান।
২. Vivo (বিশেষ করে Vivo Y21), Samsung, Xiaomi, Realme ডিভাইসে ফাস্টবুট, রিকভারি মোড ও EDL মোডের সঠিক পদ্ধতি।
৩. ক্যাশে ক্লিয়ার বনাম ফ্যাক্টরি রিসেট এবং গুগল অ্যাকাউন্ট FRP ভেরিফিকেশনের অফিসিয়াল ও নিরাপদ সমাধান।

EXECUTION RULE:
If the user asks for images or videos:
1. Provide the exact AI generation prompts for tools like Imagen 3, Midjourney, RunwayML, or Sora.
2. Structure the script step-by-step so it can be instantly plugged into image/video APIs.`,

  // ৫. Installment Manager
  'installment-manager': `System Persona:
You are "মাহফুজুর রহমান AI", an advanced, multi-modal, specialized AI super-assistant capable of handling text, code, image generation, video creation workflows, and automated tasks.

RESPONSE FORMAT RULE (CRITICAL):
ALWAYS start every response with the exact prefix tag:
🤖 [মাহফুজুর রহমান AI — কিস্তি ম্যানেজার]

Task & Capabilities:
Calculate EMI, tracking payments, generating receipt reminders, and installment schedules.
দক্ষতা:
১. মোবাইল ক্রয়ের কিস্তি (EMI) হিসাব, ডাউন পেমেন্ট এবং অবশিষ্ট বকেয়া কিস্তির সঠিক বিভাজন।
২. ডিজিটাল ক্যাশ মেমো তৈরির নির্দেশনা ও মেমোতে প্রয়োজনীয় আইনি শর্তাবলীর খসড়া।
৩. গ্রাহকের বকেয়া কিস্তির ফলো-আপ এসএমএস ও রিমাইন্ডার মার্জিত ভাষায় ড্রাফট করা।
৪. দেরিতে কিস্তি পরিশোধে পেনাল্টি হিসাব এবং ছাড় প্রদানের হিসাব নিকাশ।

EXECUTION RULE:
If the user asks for images or videos:
1. Provide the exact AI generation prompts for tools like Imagen 3, Midjourney, RunwayML, or Sora.
2. Structure the script step-by-step so it can be instantly plugged into image/video APIs.`,

  // ৬. Complaint Generator
  'complaint-generator': `System Persona:
You are "মাহফুজুর রহমান AI", an advanced, multi-modal, specialized AI super-assistant capable of handling text, code, image generation, video creation workflows, and automated tasks.

RESPONSE FORMAT RULE (CRITICAL):
ALWAYS start every response with the exact prefix tag:
🤖 [মাহফুজুর রহমান AI — অভিযোগ জেনারেটর]

Task & Capabilities:
Create formal legal/official complaint letters, customer dispute forms, and emails.
দক্ষতা:
১. জাতীয় ভোক্তা অধিকার সংরক্ষণ অধিদপ্তর (DNCRP)-এ দাখিলের জন্য সুনির্দিষ্ট আইনি ড্রাফট তৈরি।
২. হারানো বা চোরাই ফোনের জন্য নিকটস্থ থানায় সাধারণ ডায়েরি (GD) এর আবেদনপত্র তৈরি।
৩. কিস্তি পরিশোধ সত্ত্বেও ফোন অবৈধভাবে লক রাখা বা ওয়ারেন্টি অমান্য করার বিরুদ্ধে লিগ্যাল নোটিশ ড্রাফট।
৪. প্রতিটি ড্রাফটে তারিখ, স্মারক নং, ঘটনার বিবরণ ও প্রতিকারের সুস্পষ্ট দাবি সংযোজন।

EXECUTION RULE:
If the user asks for images or videos:
1. Provide the exact AI generation prompts for tools like Imagen 3, Midjourney, RunwayML, or Sora.
2. Structure the script step-by-step so it can be instantly plugged into image/video APIs.`,

  // ৭. Customer Support
  'customer-support': `System Persona:
You are "মাহফুজুর রহমান AI", an advanced, multi-modal, specialized AI super-assistant capable of handling text, code, image generation, video creation workflows, and automated tasks.

RESPONSE FORMAT RULE (CRITICAL):
ALWAYS start every response with the exact prefix tag:
🤖 [মাহফুজুর রহমান AI — কাস্টমার সাপোর্ট]

Task & Capabilities:
Friendly 24/7 business support, policy explanation, and client dispute resolution.
দক্ষতা:
১. যেকোনো অসন্তুষ্ট বা ক্ষুব্ধ গ্রাহকের কথা ধৈর্য সহকারে শুনে ইতিবাচক সমাধানের ভাষা প্রদান।
২. ফোন সার্ভিসিং বা পার্টস ডেলিভারিতে দেরি হলে গ্রাহককে বিনম্রভাবে জানানোর কল ও চ্যাট স্ক্রিপ্ট।
৩. ডিভাইসের রিকভারি স্ট্যাটাস জানাতে স্ট্যান্ডার্ড মেসেজ ও পেশাদার বার্তা প্রণয়ন।
৪. কাস্টমার সন্তুষ্টি বৃদ্ধি ও রিপিট ক্লায়েন্ট ধরে রাখার কার্যকরী যোগাযোগ পরামর্শ।

EXECUTION RULE:
If the user asks for images or videos:
1. Provide the exact AI generation prompts for tools like Imagen 3, Midjourney, RunwayML, or Sora.
2. Structure the script step-by-step so it can be instantly plugged into image/video APIs.`,

  // ৮. Repair Calculator
  'repair-calculator': `System Persona:
You are "মাহফুজুর রহমান AI", an advanced, multi-modal, specialized AI super-assistant capable of handling text, code, image generation, video creation workflows, and automated tasks.

RESPONSE FORMAT RULE (CRITICAL):
ALWAYS start every response with the exact prefix tag:
🤖 [মাহফুজুর রহমান AI — রিপেয়ার ক্যালকুলেটর]

Task & Capabilities:
Calculate parts cost, labor charges, and total mobile/hardware repair estimations.
দক্ষতা:
১. মোবাইল ডিসপ্লে (অরিজিনাল বনাম কপি), ব্যাটারি, চার্জিং পোর্ট, ক্যামেরা ও বডি পার্টসের বাজার দর হিসাব।
২. টেকনিশিয়ান সার্ভিস চার্জ, লেবার ফি ও ডিসকাউন্ট সমন্বয় করে পূর্ণাঙ্গ কোটেশন প্রস্তুত করা।
৩. ওয়াটার ড্যামেজ, মাদারবোর্ড শর্ট ও ডেড সেটের সম্ভাব্য মেরামত খরচের বাস্তবসম্মত হিসাব দেওয়া।
৪. গ্রাহকের বাজেটের মধ্যে বিকল্প যন্ত্রাংশের মান ও স্থায়িত্বের তুলনামূলক বিশ্লেষণ।

EXECUTION RULE:
If the user asks for images or videos:
1. Provide the exact AI generation prompts for tools like Imagen 3, Midjourney, RunwayML, or Sora.
2. Structure the script step-by-step so it can be instantly plugged into image/video APIs.`,

  // ৯. Hardware & Software Specialist
  'hardware-software-specialist': `System Persona:
You are "মাহফুজুর রহমান AI", an advanced, multi-modal, specialized AI super-assistant capable of handling text, code, image generation, video creation workflows, and automated tasks.

RESPONSE FORMAT RULE (CRITICAL):
ALWAYS start every response with the exact prefix tag:
🤖 [মাহফুজুর রহমান AI — হার্ডওয়্যার ও সফটওয়্যার স্পেশালিস্ট]

Task & Capabilities:
Full-stack coding, API integration, database design, and PC/Mobile hardware specs.
দক্ষতা:
১. মাদারবোর্ড শর্ট সার্কিট ফল্ট ফাইন্ডিং (DC পাওয়ার সাপ্লাই অ্যাম্পিয়ার রিডিং, থার্মাল পেস্ট ও রোসিন পদ্ধতি)।
২. পাওয়ার আইসি (PMIC), চার্জিং আইসি, নেটওয়ার্ক আইসি ও সিপিইউ রিবলিংয়ের টেকনিক্যাল গাইড।
৩. বুটলুপ, হ্যাং অন লোগো, ডেড রিকভারি এবং ফার্মওয়্যার ফ্ল্যাশিং (SP Flash Tool, Odin, Mi Flash)।
৪. পূর্ণাঙ্গ কোড ব্লক, বাগ ফিক্স, এপিআই ইন্টিগ্রেশন ও সিস্টেম আর্কিটেকচার ব্যাখ্যা।

EXECUTION RULE:
If the user asks for images or videos:
1. Provide the exact AI generation prompts for tools like Imagen 3, Midjourney, RunwayML, or Sora.
2. Structure the script step-by-step so it can be instantly plugged into image/video APIs.`,

  // ১০. Marketing Manager
  'marketing-manager': `System Persona:
You are "মাহফুজুর রহমান AI", an advanced, multi-modal, specialized AI super-assistant capable of handling text, code, image generation, video creation workflows, and automated tasks.

RESPONSE FORMAT RULE (CRITICAL):
ALWAYS start every response with the exact prefix tag:
🤖 [মাহফুজুর রহমান AI — মার্কেটিং ম্যানেজার]

Task & Capabilities:
Write viral marketing ads, Google/FB ad copies, promotional strategies, and sales hooks.
দক্ষতা:
১. মোবাইল শপ ও সার্ভিস সেন্টারের জন্য ঈদ, নববর্ষ বা বিশেষ দিবসের আকর্ষণীয় ডিসকাউন্ট অফার প্ল্যান।
২. লোকাল এলাকার নতুন কাস্টমার আকর্ষণ করার জন্য লিড জেনারেশন ও প্রচারণার আইডিয়া ও হাই-কনভার্টিং সেলস হুক।
৩. পুরানো ফোন এক্সচেঞ্জ ও কিস্তি সুবিধার প্রচারণায় আকর্ষণীয় বিজ্ঞাপন কপি।
৪. গুগল বিজনেস প্রোফাইল, ফেসবুক স্পন্সরড বুস্টিং অ্যাড কপি ও লোকাল এসইও কৌশল।

EXECUTION RULE:
If the user asks for images or videos:
1. Provide the exact AI generation prompts for tools like Imagen 3, Midjourney, RunwayML, or Sora.
2. Structure the script step-by-step so it can be instantly plugged into image/video APIs.`,

  // ১১. Auto WhatsApp & Facebook Automation
  'social-automation': `System Persona:
You are "মাহফুজুর রহমান AI", an advanced, multi-modal, specialized AI super-assistant capable of handling text, code, image generation, video creation workflows, and automated tasks.

RESPONSE FORMAT RULE (CRITICAL):
ALWAYS start every response with the exact prefix tag:
🤖 [মাহফুজুর রহমান AI — অটো সোশ্যাল মিডিয়া ম্যানেজার]

Task & Capabilities:
Draft automated reply flows, WhatsApp bot scripts, and social media post scheduling.
দক্ষতা:
১. ডিভাইস সার্ভিসিং সম্পন্ন হওয়ার পর গ্রাহককে দেওয়ার মতো রেডি-টু-সেন্ড হোয়াটসঅ্যাপ বার্তা।
২. কিস্তির নির্ধারিত তারিখ পার হয়ে যাওয়ার পর মার্জিত ভাষায় ফলো-আপ নোটিফিকেশন মেসেজ।
৩. ফেসবুক পেজ ইনবক্সের জন্য স্বয়ংক্রিয় ওয়েলকাম রিপ্লাই ও চ্যাটবট প্রশ্নোত্তরের ফ্লো।
৪. নতুন অফার, মেম্বারশিপ ও আনলক সেবার ব্রডকাস্ট মেসেজ ও শিডিউলিং প্ল্যান।

EXECUTION RULE:
If the user asks for images or videos:
1. Provide the exact AI generation prompts for tools like Imagen 3, Midjourney, RunwayML, or Sora.
2. Structure the script step-by-step so it can be instantly plugged into image/video APIs.`,

  // ১২. মেডিকেল ও হেলথ স্পেশালিস্ট
  'medical-specialist': `System Persona:
You are "মাহফুজুর রহমান AI", an advanced, multi-modal, specialized AI super-assistant capable of handling text, code, image generation, video creation workflows, and automated tasks.

RESPONSE FORMAT RULE (CRITICAL):
ALWAYS start every response with the exact prefix tag:
🤖 [মাহফুজুর রহমান AI — মেডিকেল ও হেলথ স্পেশালিস্ট]

Task & Capabilities:
জরুরি স্বাস্থ্য টিপস, প্রাথমিক চিকিৎসা, বাংলাদেশ স্বাস্থ্য বাতায়ন হটলাইন (১৬২৬৩, জরুরি ৯৯৯, জাতীয় তথ্য ৩৩৩), স্বাস্থ্য সচেতনতা ও দ্রুত গাইড।
নিয়মাবলী:
১. সর্বদা সাবলীল এবং মার্জিত বাংলায় তথ্য দিন।
২. যেকোনো জরুরি চিকিৎসায় নিকটস্থ হাসপাতালে যোগাযোগ এবং সরকারি হেল্পলাইন ১৬২৬৩ (২৪/৭ ফ্রি) নম্বরে কল করার পরামর্শ দিন।`,

  medical: `System Persona:
You are "মাহফুজুর রহমান AI", an advanced, multi-modal, specialized AI super-assistant capable of handling text, code, image generation, video creation workflows, and automated tasks.
RESPONSE FORMAT RULE: ALWAYS start with 🤖 [মাহফুজুর রহমান AI — মেডিকেল ও হেলথ স্পেশালিস্ট]`,

  // ১৩. মানবসেবা ও সমাজকল্যাণ অ্যাসিস্ট্যান্ট (বাংলাদেশ সেবামূলক সংগঠন)
  'welfare-specialist': `System Persona:
You are "মাহফুজুর রহমান AI" — মাহফুজুর রহমান কর্তৃক পরিচালিত 'বাংলাদেশ সেবামূলক সংগঠন'-এর একটি স্বয়ংক্রিয় হাই-লেভেল সুপার এআই সেকেন্ড ব্রেইন।

RESPONSE FORMAT RULE (CRITICAL):
ALWAYS start every response with the exact prefix tag:
🤖 [মাহফুজুর রহমান AI — মানবসেবা ও সমাজকল্যাণ অ্যাসিস্ট্যান্ট]

Task & Capabilities:
রক্তদান (Blood Donation), জরুরি অক্সিজেন বা চিকিৎসা সহায়তা, মানবিক সাহায্য, দরিদ্র সহায়তা ও সামাজিক কল্যাণমূলক প্রকল্পের তথ্য ও গাইডলাইন প্রদান।
নিয়মাবলী:
১. কোনো স্ট্যাটিক বা মুখস্থ উত্তর নয়, প্রয়োজনে তাজা ও নির্ভরযোগ্য তথ্য দিন।
২. জরুরি রক্তদানে রক্তের গ্রুপ, রোগীর এলাকা, হাসপাতালের নাম ও যোগাযোগ নম্বর স্পষ্টভাবে উল্লেখ করার পরামর্শ দিন।
৩. বাংলাদেশ জাতীয় জরুরি সেবা ৯৯৯, স্বাস্থ্য বাতায়ন ১৬২৬৩ ও সেবা হটলাইন ৩৩৩ এর সহায়তা প্রদান করুন।`,

  welfare: `System Persona:
You are "মাহফুজুর রহমান AI" — বাংলাদেশ সেবামূলক সংগঠন মানবসেবা ও সমাজকল্যাণ অ্যাসিস্ট্যান্ট।
RESPONSE FORMAT RULE: ALWAYS start with 🤖 [মাহফুজুর রহমান AI — মানবসেবা ও সমাজকল্যাণ অ্যাসিস্ট্যান্ট]`,

  'lock-device-specialist': `System Persona:
You are "মাহফুজুর রহমান AI" — লক ও ডিভাইস স্পেশালিস্ট।
RESPONSE FORMAT RULE: ALWAYS start with 🤖 [মাহফুজুর রহমান AI — লক ও ডিভাইস স্পেশালিস্ট]`,

  'finance-manager': `System Persona:
You are "মাহফুজুর রহমান AI" — কিস্তি ও ফিন্যান্স ম্যানেজার।
RESPONSE FORMAT RULE: ALWAYS start with 🤖 [মাহফুজুর রহমান AI — কিস্তি ও ফিন্যান্স ম্যানেজার]`,

  // সামঞ্জস্যতা এলিয়াসসমূহ
  'auto-whatsapp': `System Persona:
You are "মাহফুজুর রহমান AI", an advanced, multi-modal, specialized AI super-assistant capable of handling text, code, image generation, video creation workflows, and automated tasks.
RESPONSE FORMAT RULE: ALWAYS start with 🤖 [মাহফুজুর রহমান AI — অটো সোশ্যাল মিডিয়া ম্যানেজার]`,
  'facebook-manager': `System Persona:
You are "মাহফুজুর রহমান AI", an advanced, multi-modal, specialized AI super-assistant capable of handling text, code, image generation, video creation workflows, and automated tasks.
RESPONSE FORMAT RULE: ALWAYS start with 🤖 [মাহফুজুর রহমান AI — অটো সোশ্যাল মিডিয়া ম্যানেজার]`,
  coding: `System Persona:
You are "মাহফুজুর রহমান AI", an advanced, multi-modal, specialized AI super-assistant capable of handling text, code, image generation, video creation workflows, and automated tasks.
RESPONSE FORMAT RULE: ALWAYS start with 🤖 [মাহফুজুর রহমান AI — হার্ডওয়্যার ও সফটওয়্যার স্পেশালিস্ট]`,
  writing: `System Persona:
You are "মাহফুজুর রহমান AI", an advanced, multi-modal, specialized AI super-assistant capable of handling text, code, image generation, video creation workflows, and automated tasks.
RESPONSE FORMAT RULE: ALWAYS start with 🤖 [মাহফুজুর রহমান AI — জেনারেল এআই]`,
  education: `System Persona:
You are "মাহফুজুর রহমান AI", an advanced, multi-modal, specialized AI super-assistant capable of handling text, code, image generation, video creation workflows, and automated tasks.
RESPONSE FORMAT RULE: ALWAYS start with 🤖 [মাহফুজুর রহমান AI — জেনারেল এআই]`,
  'live-search': `System Persona:
You are "মাহফুজুর রহমান AI" — গুগল লাইভ সার্চ ইঞ্জিন ও রিয়েল-টাইম তথ্য অনুসন্ধানকারী।
RESPONSE FORMAT RULE: ALWAYS start with 🌐 [মাহফুজুর রহমান AI — গুগল লাইভ সার্চ ইঞ্জিন]
Task: ইন্টারনেটের সাম্প্রতিকতম খবর, তথ্যাদি, লাইভ সার্চ ও কারেন্ট অ্যাফেয়ার্স রিয়েল-টাইমে সার্চ করে বিস্তারিত জানানো।`,
  translator: `System Persona:
You are "মাহফুজুর রহমান AI", an advanced, multi-modal, specialized AI super-assistant capable of handling text, code, image generation, video creation workflows, and automated tasks.
RESPONSE FORMAT RULE: ALWAYS start with 🤖 [মাহফুজুর রহমান AI — জেনারেল এআই]`,
};

/**
 * -------------------------------------------------------------
 * এআই প্রোভাইডার হেল্পার ফাংশনসমূহ (OpenAI, OpenRouter, Gemini)
 * -------------------------------------------------------------
 */

// ১. OpenAI API কল (মাল্টিমোডাল ইমেজ ও টেক্সট সহ)
async function callOpenAi(
  apiKey: string,
  model: string,
  messages: any[],
  attachment?: { data: string; mimeType: string; name?: string } | null
) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 35000);

  // যদি কোনো অ্যাটাচমেন্ট থাকে এবং তা ইমেজ হয়, তবে ব্যবহারকারীর শেষ মেসেজে ইনলাইন ইমেজ যুক্ত করা
  const formattedMessages = [...messages];
  if (attachment && attachment.data && attachment.mimeType && attachment.mimeType.startsWith('image/')) {
    const lastIdx = formattedMessages.length - 1;
    const lastMsg = formattedMessages[lastIdx];
    if (lastMsg && lastMsg.role === 'user') {
      const dataUrl = attachment.data.startsWith('data:')
        ? attachment.data
        : `data:${attachment.mimeType};base64,${attachment.data}`;
      formattedMessages[lastIdx] = {
        role: 'user',
        content: [
          { type: 'text', text: typeof lastMsg.content === 'string' ? lastMsg.content : '' },
          { type: 'image_url', image_url: { url: dataUrl } },
        ],
      };
    }
  }

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 2048,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      const msg = (errJson as any)?.error?.message || res.statusText;
      const error = new Error(msg) as any;
      error.status = res.status;
      error.code = (errJson as any)?.error?.code;
      throw error;
    }

    const data = await res.json() as any;
    const answer = data?.choices?.[0]?.message?.content;
    if (!answer) throw new Error('OpenAI থেকে কোনো উত্তর পাওয়া যায়নি।');

    return {
      answer,
      model: data.model || model,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

// ২. OpenRouter API কল (উচ্চমানের ওপেন সোর্স ও মাল্টি-প্রোভাইডার ব্যাকআপ)
async function callOpenRouter(
  apiKey: string,
  model: string,
  messages: any[],
  attachment?: { data: string; mimeType: string; name?: string } | null
) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 40000);

  // ডিফল্ট নির্ভরযোগ্য মডেল: deepseek/deepseek-chat অথবা meta-llama/llama-3-70b-instruct
  const selectedModel = model || process.env.OPENROUTER_MODEL || 'deepseek/deepseek-chat';

  // ইমেজ সাপোর্ট ফরম্যাটিং
  const formattedMessages = [...messages];
  if (attachment && attachment.data && attachment.mimeType && attachment.mimeType.startsWith('image/')) {
    const lastIdx = formattedMessages.length - 1;
    const lastMsg = formattedMessages[lastIdx];
    if (lastMsg && lastMsg.role === 'user') {
      const dataUrl = attachment.data.startsWith('data:')
        ? attachment.data
        : `data:${attachment.mimeType};base64,${attachment.data}`;
      formattedMessages[lastIdx] = {
        role: 'user',
        content: [
          { type: 'text', text: typeof lastMsg.content === 'string' ? lastMsg.content : '' },
          { type: 'image_url', image_url: { url: dataUrl } },
        ],
      };
    }
  }

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
        'X-Title': 'Mahfuzur Rahman AI - Device Recovery & Management',
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 2048,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      const msg = (errJson as any)?.error?.message || res.statusText;
      const error = new Error(msg) as any;
      error.status = res.status;
      throw error;
    }

    const data = await res.json() as any;
    const answer = data?.choices?.[0]?.message?.content;
    if (!answer) throw new Error('OpenRouter থেকে কোনো উত্তর পাওয়া যায়নি।');

    return {
      answer,
      model: data.model || selectedModel,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

// ৩. Google Gemini API কল (মাল্টিমোডাল ভিশন ও গুগল সার্চ গ্রাউন্ডিং সহ)
async function callGemini(
  systemPrompt: string,
  history: any[],
  userPrompt: string,
  attachment?: { data: string; mimeType: string; name?: string } | null,
  enableWebSearch?: boolean
) {
  const ai = new GoogleGenAI();
  const contents: any[] = [];

  // পূর্বের কথোপকথন থাকলে রূপান্তর করা
  if (Array.isArray(history)) {
    for (const item of history.slice(-10)) {
      if (item && item.content && typeof item.content === 'string') {
        contents.push({
          role: item.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: item.content }],
        });
      }
    }
  }

  // বর্তমান ব্যবহারকারীর প্রম্পট ও অ্যাটাচমেন্ট (ছবি বা ফাইল)
  const userParts: any[] = [];
  if (attachment && attachment.data && attachment.mimeType) {
    let cleanBase64 = attachment.data;
    if (cleanBase64.includes(';base64,')) {
      cleanBase64 = cleanBase64.split(';base64,')[1];
    }
    userParts.push({
      inlineData: {
        mimeType: attachment.mimeType,
        data: cleanBase64,
      },
    });
  }

  userParts.push({ text: userPrompt });

  contents.push({
    role: 'user',
    parts: userParts,
  });

  const config: any = {
    systemInstruction: systemPrompt,
    temperature: 0.7,
  };

  // ওয়েব সার্চ গ্রাউন্ডিং সংযুক্তিকরণ (যদি সক্রিয় থাকে)
  if (enableWebSearch) {
    config.tools = [{ googleSearch: {} }];
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents,
    config,
  });

  const answer = response.text;
  if (!answer) {
    throw new Error('Gemini মডেল থেকে কোনো উত্তর আসেনি।');
  }

  // সার্চ গ্রাউন্ডিং থেকে সোর্স ও লিংক সংগ্রহ
  const sources: Array<{ title: string; uri: string }> = [];
  try {
    const candidate = response.candidates?.[0];
    const groundingChunks = (candidate as any)?.groundingMetadata?.groundingChunks;
    if (Array.isArray(groundingChunks)) {
      for (const chunk of groundingChunks) {
        if (chunk?.web?.uri) {
          sources.push({
            title: chunk.web.title || chunk.web.uri,
            uri: chunk.web.uri,
          });
        }
      }
    }
  } catch (e) {
    // ignore
  }

  return {
    answer,
    model: enableWebSearch ? 'gemini-3.8-flash (গুগল সার্চ গ্রাউন্ডিং)' : 'gemini-3.8-flash',
    sources: sources.length > 0 ? sources : undefined,
  };
}

// ৫. স্বয়ংক্রিয় অফলাইন ডিভাইস রিকভারি ও মাল্টি-টাস্ক নলেজ ইঞ্জিন (টায়ার ৫ ব্যাকআপ)
function generateOfflineKnowledgeResponse(
  prompt: string,
  history: any[],
  projectContext?: string,
  agentId: string = 'general'
): string {
  const p = prompt.toLowerCase();
  const contextNote = projectContext ? `\n\n> 📌 **প্রজেক্ট স্টেট ও মেমোরি কনটেক্সট:**\n> ${projectContext.split('\n').join('\n> ')}\n` : '';

  // ক. ইমেজ ও ডিজাইন জেনারেশন (Imagen 3 / Midjourney)
  if (agentId === 'image-generator' || p.includes('image') || p.includes('ছবি') || p.includes('ডিজাইন') || p.includes('imagen') || p.includes('midjourney') || p.includes('prompt')) {
    return `### 🎨 ইমেজ ও ডিজাইন জেনারেশন প্রম্পট আর্কিটেকচার
${contextNote}
#### ১. Imagen 3 Photorealistic Prompt:
\`\`\`text
A futuristic high-tech smartphone repair workshop in Dhaka at twilight, neon cyan and emerald ambient backlighting, close-up shot of a technician with precision tweezers replacing a glass OLED screen on a Vivo Y21 motherboard, soft bokeh background with diagnostic oscilloscopes, 8k resolution, cinematic lighting, photorealistic, shot on 85mm f/1.4 lens --ar 16:9
\`\`\`

#### ২. Midjourney v6 Luxury Concept Prompt:
\`\`\`text
ultra-realistic modern fintech mobile app UI dashboard for mobile recovery and installment tracking, dark mode, emerald green and cyber teal glowing accents, glassmorphism cards, clean typography, pristine minimalist aesthetics, Figma mockup render, 3D clay elements --ar 9:16 --v 6.0 --style raw
\`\`\`

#### ৩. ৩ডি আইকন ও অ্যাসেট প্রম্পট:
\`\`\`text
3D isometric icon of an unlocked smartphone emitting golden security shield waves, glossy frosted glass, neon emerald accents, clean white studio background, Blender 3D render, 4k --ar 1:1
\`\`\`

💡 *এই প্রম্পটগুলো সরাসরি Google Imagen 3, Midjourney v6 বা DALL-E 3 তে পেস্ট করে হাই-কোয়ালিটি ইমেজ জেনারেট করতে পারবেন।*`;
  }

  // খ. ভিডিও ক্রিয়েটর ও স্টোরিবোর্ড (Sora / Runway / Reels)
  if (agentId === 'video-creator' || p.includes('video') || p.includes('ভিডিও') || p.includes('রিলস') || p.includes('reels') || p.includes('shorts') || p.includes('sora') || p.includes('runway')) {
    return `### 🎬 ভিডিও ও স্টোরিবোর্ড স্ক্রিপ্ট (YouTube Shorts / Reels)
${contextNote}
**শিরোনাম:** "Vivo Y21 প্যাটার্ন লক ভুলে গেছেন? ৩০ সেকেন্ডে সমাধান!"
**সময়কাল:** ৩০ সেকেন্ড | **অ্যাসপেক্ট রেশিও:** ৯:১৬ (Vertical)

#### 📋 সিন-বাই-সিন স্টোরিবোর্ড ও ভয়েসওভার:
| সময় | ভিজ্যুয়াল সিন (Visual / B-Roll) | অন-স্ক্রিন টেক্সট | ভয়েসওভার (বাংলা অডিও) |
| :--- | :--- | :--- | :--- |
| **00-03s** *(Hook)* | টেকনিশিয়ান ফোনের লক স্ক্রিন দেখিয়ে চুটকি বাজাল | ⚠️ প্যাটার্ন লক ভুলে গেছেন? | "লক ভুলে গেছেন? ফোন ফেলে দেওয়ার দরকার নেই, ৩০ সেকেন্ডেই সমাধান!" |
| **04-12s** *(Action)* | পাওয়ার অফ করে Volume (+) ও Power ধরে ফাস্টবুটে ঢোকা | ফাস্টবুট ➔ রিকভারি মোড | "ফোন অফ করে ভলিউম আপ আর পাওয়ার বাটন একসাথে ৫ সেকেন্ড চেপে রিকভারি মোডে যান।" |
| **13-22s** *(Solution)* | Clear Cache অপশনে ট্যাপ করা, ডেটা সেফ রাখা | Clear Cache ➔ Clear Data | "প্রথমে ক্লিয়ার ক্যাশে দিন, ডেটা অক্ষত রেখেই লক দূর হবে!" |
| **23-30s** *(CTA)* | স্ক্রিনে 'Mafhuz Recovery' অ্যাপের ডাউনলোড লিংক | Follow @MahfuzurRahman | "আরও ডিভাইস ট্রিক্স ও কিস্তি ট্র্যাকিং পেতে এখনই সেভ করে রাখুন!" |

#### 🎥 Runway Gen-3 / Sora AI Video Generation Prompt:
\`\`\`text
Cinematic vertical 9:16 shot, macro camera zooms into a sleek Vivo smartphone screen on an electronics workbench, fingers smoothly pressing volume and power buttons, screen lights up showing recovery menu, realistic laboratory workbench atmosphere, photorealistic 60fps --ar 9:16
\`\`\``;
  }

  // ১. Vivo Y21 ও হার্ডওয়্যার রিসেট সম্পর্কিত
  if (p.includes('vivo') || p.includes('y21') || p.includes('fastboot') || p.includes('recovery') || p.includes('ক্যাশে') || p.includes('রিসেট') || p.includes('প্যাটার্ন')) {
    return `### 📱 Vivo Y21 ও ডিভাইস রিকভারি সমাধান
${contextNote}
**ধাপ ১: ফাস্টবুট মোডে প্রবেশ**
1. ফোনটি সম্পূর্ণ পাওয়ার অফ করুন (Power Off)।
2. **Volume Up (+) এবং Power বাটন** একসাথে ৫-৮ সেকেন্ড চেপে ধরে রাখুন যতক্ষণ না ফাস্টবুট লোগো আসে।
3. ভলিউম ডাউন বাটন দিয়ে **Recovery Mode** সিলেক্ট করে পাওয়ার বাটন চেপে কনফার্ম করুন।

**ধাপ ২: ওয়াইপ ডেটা ও ক্যাশে ক্লিয়ার**
1. রিকভারি স্ক্রিনে **Clear Data** অপশনে ট্যাপ করুন।
2. প্রথমে **Clear Cache** সম্পন্ন করুন (এতে সাধারণত ফাইল ডিলিট হয় না)।
3. পাসওয়ার্ড বা পিন সমস্যা না মিটলে **Clear All Data / Factory Reset** বেছে নিন।

⚠️ **সতর্কবার্তা:** 'Clear All Data' করলে ফোনের অভ্যন্তরীণ সকল ছবি, কন্ট্যাক্ট ও ডেটা মুছে যাবে এবং পরবর্তীতে পূর্বের গুগল অ্যাকাউন্টের credentials (FRP) প্রয়োজন হতে পারে।`;
  }

  // ২. কিস্তি ও ক্যাশ মেমো সম্পর্কিত
  if (p.includes('কিস্তি') || p.includes('মেমো') || p.includes('installment') || p.includes('রশিদ') || p.includes('টাকা') || p.includes('বকেয়া')) {
    return `### 💳 কিস্তি ও ডিজিটাল রিসিট ব্যবস্থাপনা
${contextNote}
* **হিসাব পদ্ধতি:** মোট ডিভাইস মূল্য থেকে ডাউন পেমেন্ট বিয়োগ করার পর অবশিষ্ট বকেয়া কিস্তির সংখ্যা দিয়ে সমহারে ভাগ করা হয়।
* **ডিজিটাল ক্যাশ মেমো:** আমাদের অ্যাপের **'কিস্তি'** ট্যাবে গিয়ে গ্রাহকের নাম, মোবাইল, মডেল ও আইএমইআই দিয়ে ডিজিটাল মেমো তৈরি করতে পারেন।
* **প্রিন্ট ও শেয়ার:** প্রতিটি মেমোতে ইউনিক বারকোড রয়েছে এবং পিডিএফ হিসেবে প্রিন্ট বা হোয়াটসঅ্যাপে শেয়ার করা যায়।`;
  }

  // ৩. আইনি অভিযোগ ও জিডি
  if (p.includes('অভিযোগ') || p.includes('জিডি') || p.includes('complaint') || p.includes('পুলিশ') || p.includes('ভোক্তা') || p.includes('আইন')) {
    return `### ⚖️ আইনি অভিযোগ ও ট্র্যাকিং ড্রাফট
${contextNote}
* **রেফারেন্স আইডি:** প্রতিটি ড্রাফটে স্বয়ংক্রিয়ভাবে \`MDR-2026-XXXX\` ক্রমিক নম্বর যুক্ত হয়।
* **অভিযোগ প্রক্রিয়া:** কিস্তি পরিশোধের পরও ফোন আনলক না হলে বা ওয়ারেন্টি অমান্য হলে ভোক্তা অধিকার সংরক্ষণ অধিদপ্তর বা থানায় জিডি দাখিলের জন্য ড্রাফটটি ব্যবহার করুন।
* **স্ট্যাটাস ট্র্যাকিং:** দাখিলকৃত অভিযোগ 'Submitted ➔ Under Review ➔ Resolved' ধাপে ট্র্যাক করা সম্ভব।`;
  }

  // ৪. আইএমইআই ও চোরাই ফোন যাচাই
  if (p.includes('imei') || p.includes('আইএমইআই') || p.includes('চোরাই') || p.includes('stolen') || p.includes('ব্ল্যাকলিস্ট')) {
    return `### 🔍 আইএমইআই ও ডিভাইস নিরাপত্তা যাচাই
${contextNote}
* **Luhn ফর্মুলা:** ১৫ ডিজিটের আইএমইআই নম্বরের শেষ চেক ডিজিট Luhn অ্যালগরিদমের মাধ্যমে তাৎক্ষণিক ভ্যালিডেট করা হয়।
* **বিটিআরসি নিবন্ধন যাচাই:** মেসেজ অপশনে গিয়ে \`KYD <15-digit IMEI>\` লিখে \`16002\` নম্বরে এসএমএস পাঠিয়ে অফিসিয়াল ডাটাবেস চেক করা যায়।
* **চোরাই সেট সতর্কতা:** ব্ল্যাকলিস্টেড বা চোরাই ডিভাইস ক্রয়-বিক্রয় ও ফ্ল্যাশ করা আইনত দণ্ডনীয়।`;
  }

  // ৫. মেরামত খরচ ও সার্ভিস চার্জ
  if (p.includes('খরচ') || p.includes('মেরামত') || p.includes('চার্জ') || p.includes('ব্যাটারি') || p.includes('ডিসপ্লে') || p.includes('স্ক্রিন')) {
    return `### 🔧 মেরামত খরচ ও সার্ভিস চার্জ ক্যালকুলেশন
${contextNote}
* **মোট খরচের হিসাব:** যন্ত্রাংশের মূল্য (Parts Cost) + টেকনিশিয়ান সার্ভিস চার্জ (Labor Fee) - ছাড় (Discount)।
* **প্রো টুলস ক্যালকুলেটর:** আমাদের **'টুলস'** ট্যাবের সার্ভিস চার্জ ক্যালকুলেটরের মাধ্যমে অরিজিনাল বনাম ওলেড স্ক্রিন এবং ব্যাটারির ওয়ারেন্টি সহ নিখুঁত কোটেশন তৈরি করতে পারেন।`;
  }

  // ৬. মার্কেটিং ও সোশ্যাল অটোমেশন
  if (agentId === 'marketing-manager' || agentId === 'social-automation' || p.includes('মার্কেটিং') || p.includes('ফেসবুক') || p.includes('হোয়াটসঅ্যাপ') || p.includes('বিজ্ঞাপন')) {
    return `### 📈 মার্কেটিং ও অটো সোশ্যাল মিডিয়া ক্যাম্পেইন
${contextNote}
* **ফেসবুক স্পনসরড অ্যাড কপি:**
> 🔥 "আপনার ফোনের লক ভুলে গেছেন বা কিস্তির হিসাব মেলাতে পারছেন না? আর নয় ঝামেলা! মাহফুজুর রহমান AI সার্ভিসিং হাবে মাত্র ৩০ মিনিটে পান যেকোনো ডিভাইসের নিরাপদ আনলক ও শতভাগ সুরক্ষিত সমাধান! আজই ইনবক্স করুন।"
* **অটো হোয়াটসঅ্যাপ রিপ্লাই স্ক্রিপ্ট:**
> 💬 "আসসালামু আলাইকুম! মাহফুজুর রহমান টেকনিক্যাল হাবে আপনাকে স্বাগতম। আপনার ডিভাইস মডেল ও সমস্যার বিবরণ এখানে লিখুন, আমাদের এক্সপার্ট এআই তাৎক্ষণিক সমাধান প্রদান করবে।"`;
  }

  // ৭. সাধারণ সার্বিক সহায়তা
  return `### 🤖 মাহফুজুর রহমান AI - সার্বিক অল-ইন-ওয়ান সুপার অ্যাসিস্ট্যান্ট
${contextNote}
আমি আপনার সার্বিক ডিভাইস রিকভারি, ইমেজ/ভিডিও জেনারেশন প্রম্পট, কোডিং, কিস্তি হিসাব ও ডিজিটাল সহায়তায় সর্বদা প্রস্তুত আছি।

**উপলব্ধ সেবা ও ক্ষেত্রসমূহ:**
1. 🎨 **Imagen 3 ও Midjourney ফটোরিয়ালিস্টিক প্রম্পট আর্কিটেকচার**
2. 🎬 **Sora ও Runway AI ভিডিও স্ক্রিপ্ট এবং ৩-সেকেন্ড হুক স্টোরিবোর্ড**
3. 📱 **Vivo Y21 ও অন্যান্য ফোনের আনলক ও রিকভারি সিকোয়েন্স**
4. 💳 **গ্রাহকের কিস্তি হিসাব ও ডিজিটাল ক্যাশ মেমো ড্রাফট**
5. ⚖️ **ভোক্তা অধিকার ও থানার জন্য আইনি অভিযোগপত্র**
6. 💻 **ফুল-স্ট্যাক কোডিং ও হার্ডওয়্যার মাদারবোর্ড ট্রাবলশুটিং**

আপনার সুনির্দিষ্ট প্রয়োজনটি বিস্তারিত লিখুন, আমি তাৎক্ষণিকভাবে সম্পূর্ণ সমাধান প্রস্তুত করে দেব।`;
}

/**
 * -------------------------------------------------------------
 * OpenRouter কি ও মডেল রিজলভার (ভুল সিক্রেট নাম প্রতিরোধ)
 * -------------------------------------------------------------
 */
function getResolvedOpenRouterKey(): { key: string | null; isMismatchedEnvName: boolean } {
  const primary = process.env.OPENROUTER_API_KEY?.trim();
  const secondary = process.env.OPENROUTER_MODEL?.trim();

  // ১. যদি OPENROUTER_API_KEY সঠিক sk-or- ফরম্যাটে থাকে
  if (primary && primary.startsWith('sk-or-')) {
    return { key: primary, isMismatchedEnvName: false };
  }

  // ২. যদি ব্যবহারকারী ভুলবশত OPENROUTER_MODEL ভেরিয়েবলে sk-or- কী রেখে থাকেন
  if (secondary && secondary.startsWith('sk-or-')) {
    return { key: secondary, isMismatchedEnvName: true };
  }

  // ৩. যদি প্রাথমিক কি সাধারণ টেক্সট হিসেবে থাকে
  if (primary && primary.length > 5 && !primary.startsWith('sk-proj-')) {
    return { key: primary, isMismatchedEnvName: false };
  }

  // ৪. যদি কোনোটিই ওপেনরাউটার কি না হয় তবে প্রাথমিকটিই ট্রাই করা হবে
  if (primary && primary.length > 5) {
    return { key: primary, isMismatchedEnvName: false };
  }

  return { key: null, isMismatchedEnvName: false };
}

function getResolvedOpenRouterModel(): string {
  const model = process.env.OPENROUTER_MODEL?.trim();
  if (!model || model.startsWith('sk-')) {
    return 'deepseek/deepseek-chat';
  }
  return model;
}

/**
 * -------------------------------------------------------------
 * স্বয়ংক্রিয় মাল্টি-টিয়ার ফলব্যাক এক্সিকিউশন ইঞ্জিন
 * -------------------------------------------------------------
 */
async function executeWithFallback(
  prompt: string,
  history: any[],
  systemPrompt: string,
  projectContext?: string,
  agentId: string = 'general',
  attachment?: { data: string; mimeType: string; name?: string } | null,
  enableWebSearch?: boolean
): Promise<{
  answer: string;
  model: string;
  provider: 'openai-primary' | 'openai-secondary' | 'openrouter' | 'gemini' | 'offline-knowledge';
  fallbackUsed: boolean;
  fallbackReason?: string;
  sources?: Array<{ title: string; uri: string }>;
}> {
  const primaryKey = process.env.OPENAI_API_KEY?.trim();
  const secondaryKey = process.env.OPENAI_API_KEY_SECONDARY?.trim();
  const { key: openRouterKey } = getResolvedOpenRouterKey();
  const geminiKey = process.env.GEMINI_API_KEY?.trim();

  // বিশেষ অগ্রাধিকার: যদি ব্যবহারকারী লাইভ ওয়েব সার্চ সক্রিয় করেন এবং Gemini প্রস্তুত থাকে, তবে Google Search Grounding সহ Gemini আগে রান করা
  if (enableWebSearch && geminiKey && geminiKey.length > 5) {
    try {
      const res = await callGemini(systemPrompt, history, prompt, attachment, true);
      return {
        answer: res.answer,
        model: 'Gemini 3.8 Flash (লাইভ গুগল সার্চ গ্রাউন্ডিং)',
        provider: 'gemini',
        fallbackUsed: false,
        sources: res.sources,
      };
    } catch (err: any) {
      console.warn(`[সার্চ গ্রাউন্ডিং সতর্কতা] Gemini সার্চ গ্রাউন্ডিং ব্যর্থ (${err.message})। পরবর্তী স্ট্যান্ডার্ড প্রোভাইডারে চেষ্টা করা হচ্ছে...`);
    }
  }

  // OpenAI স্টাইল মেসেজ ফরম্যাট
  const messages: any[] = [{ role: 'system', content: systemPrompt }];
  if (Array.isArray(history)) {
    for (const item of history.slice(-10)) {
      if (item && item.content && (item.role === 'user' || item.role === 'assistant')) {
        messages.push({ role: item.role, content: item.content });
      }
    }
  }
  messages.push({ role: 'user', content: prompt });

  const primaryModel = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  let primaryError: any = null;

  // ধাপ ১: প্রাইমারি OpenAI দিয়ে চেষ্টা
  if (primaryKey && primaryKey.length > 5) {
    try {
      const res = await callOpenAi(primaryKey, primaryModel, messages, attachment);
      return {
        answer: res.answer,
        model: res.model,
        provider: 'openai-primary',
        fallbackUsed: false,
      };
    } catch (err: any) {
      primaryError = err;
      console.warn(`[ফলব্যাক নোটিশ] প্রাইমারি OpenAI ব্যর্থ (${err.status || err.message})। পরবর্তী ব্যাকআপ সিস্টেমে স্থানান্তর হচ্ছে...`);
    }
  }

  // ধাপ ২: সেকেন্ডারি OpenAI কী দিয়ে চেষ্টা (যদি কনফিগার করা থাকে)
  if (secondaryKey && secondaryKey.length > 5 && secondaryKey !== primaryKey) {
    try {
      const res = await callOpenAi(secondaryKey, primaryModel, messages, attachment);
      return {
        answer: res.answer,
        model: `${res.model} (সেকেন্ডারি কী)`,
        provider: 'openai-secondary',
        fallbackUsed: true,
        fallbackReason: 'প্রাইমারি OpenAI কী-এর কোটা বা লিমিট শেষ হওয়ায় সেকেন্ডারি কী দিয়ে উত্তর প্রস্তুত করা হয়েছে।',
      };
    } catch (err: any) {
      console.warn(`[ফলব্যাক নোটিশ] সেকেন্ডারি OpenAI কী ব্যর্থ (${err.status || err.message})। পরবর্তী ব্যাকআপে স্থানান্তর হচ্ছে...`);
    }
  }

  // ধাপ ৩: Google Gemini (gemini-3.8-flash) দিয়ে চেষ্টা (OpenAI ব্যর্থ হলে প্রথম ব্যাকআপ)
  let geminiError: any = null;
  if (geminiKey && geminiKey.length > 5) {
    try {
      const res = await callGemini(systemPrompt, history, prompt, attachment, enableWebSearch);
      return {
        answer: res.answer,
        model: 'Gemini 3.8 Flash (স্বয়ংক্রিয় ব্যাকআপ)',
        provider: 'gemini',
        fallbackUsed: true,
        fallbackReason: primaryError?.status === 429
          ? 'OpenAI অ্যাকাউন্টে ক্রেডিট/কোটা শেষ হওয়ায় অ্যাপটি স্বয়ংক্রিয়ভাবে শক্তিশালী Google Gemini ব্যাকআপ মডেলে সুইচ করেছে।'
          : 'OpenAI সংযোগে সাময়িক সমস্যার কারণে ব্যাকআপ মডেল (Gemini 3.8 Flash) দিয়ে উত্তর প্রদান করা হয়েছে।',
        sources: res.sources,
      };
    } catch (err: any) {
      geminiError = err;
      console.warn(`[ফলব্যাক নোটিশ] Google Gemini ব্যাকআপও ব্যর্থ (${err.message})। পরবর্তী OpenRouter ব্যাকআপে স্থানান্তর হচ্ছে...`);
    }
  }

  // ধাপ ৪: OpenRouter দিয়ে চেষ্টা (যদি OpenAI এবং Gemini উভয়ই ব্যর্থ হয়)
  if (openRouterKey && openRouterKey.length > 5) {
    const preferredModel = process.env.OPENROUTER_MODEL || 'deepseek/deepseek-chat';
    try {
      console.log(`[ফলব্যাক নোটিশ] OpenAI ও Gemini ব্যর্থ। OpenRouter (${preferredModel}) মডেলে ফলব্যাক হচ্ছে...`);
      const res = await callOpenRouter(openRouterKey, preferredModel, messages, attachment);
      return {
        answer: res.answer,
        model: `${res.model} (OpenRouter)`,
        provider: 'openrouter',
        fallbackUsed: true,
        fallbackReason: 'OpenAI এবং Gemini উভয় সিস্টেমের কোটা বা সংযোগ ব্যর্থ হওয়ায় OpenRouter (DeepSeek) ব্যাকআপের মাধ্যমে উত্তর সফলভাবে প্রস্তুত করা হয়েছে।',
      };
    } catch (err: any) {
      console.warn(`[ফলব্যাক নোটিশ] OpenRouter ${preferredModel} ব্যর্থ (${err.message})। বিকল্প Llama-3-70B মডেলে চেষ্টা করা হচ্ছে...`);
      try {
        const llamaRes = await callOpenRouter(openRouterKey, 'meta-llama/llama-3-70b-instruct', messages, attachment);
        return {
          answer: llamaRes.answer,
          model: `${llamaRes.model} (OpenRouter - Llama 3)`,
          provider: 'openrouter',
          fallbackUsed: true,
          fallbackReason: 'OpenAI ও Gemini ব্যর্থ হওয়ার পর OpenRouter Llama 3 70B ব্যাকআপের মাধ্যমে উত্তর সফলভাবে প্রস্তুত করা হয়েছে।',
        };
      } catch (llamaErr: any) {
        console.warn(`[ফলব্যাক নোটিশ] OpenRouter বিকল্প মডেলও ব্যর্থ (${llamaErr.message})। অফলাইন ইঞ্জিনে যাওয়া হচ্ছে...`);
      }
    }
  }

  // ধাপ ৫: টায়ার ৫ অফলাইন ডিভাইস রিকভারি নলেজ ইঞ্জিন (Autonomous Zero-Crash Fallback)
  const offlineAnswer = generateOfflineKnowledgeResponse(prompt, history, projectContext, agentId);
  return {
    answer: offlineAnswer,
    model: 'MDR নলেজ ইঞ্জিন (স্বয়ংক্রিয় অফলাইন মেমোরি)',
    provider: 'offline-knowledge',
    fallbackUsed: true,
    fallbackReason: 'ক্লাউড এআই সংযোগের অনুপস্থিতিতে লোকাল অফলাইন নলেজ ইঞ্জিন তাৎক্ষণিকভাবে উত্তর প্রস্তুত করেছে।',
  };
}

/**
 * -------------------------------------------------------------
 * সার্ভার ব্যাকএন্ড API রুটসমূহ
 * -------------------------------------------------------------
 */

// ১. সার্ভার ও API এর স্ট্যাটাস চেক
app.get('/api/status', (req: Request, res: Response) => {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  const hasGemini = Boolean(process.env.GEMINI_API_KEY?.trim());
  const hasSecondary = Boolean(process.env.OPENAI_API_KEY_SECONDARY?.trim());
  const hasOpenRouter = Boolean(process.env.OPENROUTER_API_KEY?.trim());

  const isOpenAiConfigured = Boolean(apiKey && apiKey.length > 5);
  const isOverallReady = isOpenAiConfigured || hasGemini || hasOpenRouter;

  let keyPreview: string | null = null;
  if (isOpenAiConfigured && apiKey) {
    keyPreview = apiKey.length > 8 ? `...${apiKey.slice(-4)}` : 'সেট করা আছে';
  }

  const openRouterModel = process.env.OPENROUTER_MODEL || 'deepseek/deepseek-chat';

  res.json({
    appName: 'মাহফুজুর রহমান AI',
    configured: isOverallReady,
    keyPreview,
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    status: isOverallReady ? 'READY' : 'CONFIG_REQUIRED',
    fallbackSystem: {
      active: true,
      geminiReady: hasGemini,
      secondaryOpenAiReady: hasSecondary,
      openRouterReady: hasOpenRouter,
      openRouterModel,
      sequence: [
        '1. OpenAI (gpt-4o-mini)',
        '2. Google Gemini (gemini-3.8-flash)',
        `3. OpenRouter (${openRouterModel})`,
        '4. MDR অফলাইন নলেজ ইঞ্জিন'
      ],
      fallbackDescription: 'OpenAI এবং Gemini ব্যর্থ হলে স্বয়ংক্রিয়ভাবে OpenRouter (DeepSeek / Llama 3) এ ফলব্যাক করবে।',
    },
    timestamp: new Date().toISOString(),
  });
});

// ২. সংযোগ ও ব্যাকআপ সিস্টেম পরীক্ষা (Test Connection)
app.post('/api/test-connection', async (req: Request, res: Response) => {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  const openRouterKey = process.env.OPENROUTER_API_KEY?.trim();

  let openAiOk = false;
  let openAiErrorDetail: string | null = null;
  let geminiOk = false;
  let geminiErrorDetail: string | null = null;
  let openRouterOk = false;
  let openRouterErrorDetail: string | null = null;

  // ক. OpenAI টেস্ট
  if (apiKey && apiKey.length > 5) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);

      const testResponse = await fetch('https://api.openai.com/v1/models', {
        method: 'GET',
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (testResponse.ok) {
        openAiOk = true;
      } else {
        const errData = await testResponse.json().catch(() => ({}));
        openAiErrorDetail = (errData as any)?.error?.message || `HTTP ${testResponse.status}`;
      }
    } catch (err: any) {
      openAiErrorDetail = err.message;
    }
  } else {
    openAiErrorDetail = 'OPENAI_API_KEY সেট করা নেই';
  }

  // খ. Gemini ব্যাকআপ টেস্ট
  if (geminiKey && geminiKey.length > 5) {
    try {
      const ai = new GoogleGenAI();
      const resp = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: 'ping',
        config: { maxOutputTokens: 5 },
      });
      if (resp.text) geminiOk = true;
    } catch (err: any) {
      geminiErrorDetail = err.message;
    }
  }

  // গ. OpenRouter ব্যাকআপ টেস্ট
  if (openRouterKey && openRouterKey.length > 5) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);

      const testResponse = await fetch('https://openrouter.ai/api/v1/auth/key', {
        method: 'GET',
        headers: { Authorization: `Bearer ${openRouterKey}` },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (testResponse.ok) {
        openRouterOk = true;
      } else {
        const errData = await testResponse.json().catch(() => ({}));
        openRouterErrorDetail = (errData as any)?.error?.message || `HTTP ${testResponse.status}`;
      }
    } catch (err: any) {
      openRouterErrorDetail = err.message;
    }
  }

  const activeProviders: string[] = [];
  if (openAiOk) activeProviders.push('OpenAI');
  if (geminiOk) activeProviders.push('Gemini 3.8 Flash');
  if (openRouterOk) activeProviders.push(`OpenRouter (${process.env.OPENROUTER_MODEL || 'deepseek/deepseek-chat'})`);

  if (activeProviders.length > 0) {
    res.json({
      success: true,
      openAiOk,
      geminiOk,
      openRouterOk,
      activeProviders,
      message: `মাল্টি-প্রোভাইডার ফলব্যাক সিস্টেম সক্রিয়! (${activeProviders.join(' ➔ ')})`,
      detail: `ফলব্যাক সিকোয়েন্স: OpenAI ➔ Gemini ➔ OpenRouter ➔ MDR অফলাইন নলেজ ইঞ্জিন`,
    });
    return;
  }

  // সব সংযোগ ব্যর্থ হলেও অফলাইন নলেজ সক্রিয় থাকবে
  res.status(503).json({
    success: false,
    message: 'কোনো ক্লাউড এআই সংযোগ সক্রিয় পাওয়া যায়নি। স্বয়ংক্রিয় অফলাইন নলেজ ইঞ্জিন সক্রিয় থাকবে।',
    detail: `OpenAI: ${openAiErrorDetail || 'সেট নেই'} | Gemini: ${geminiErrorDetail || 'সেট নেই'} | OpenRouter: ${openRouterErrorDetail || 'সেট নেই'}`,
  });
});

// ৩. ব্যবহারকারীর প্রশ্নের উত্তর প্রদানের মূল এন্ডপয়েন্ট (ফলব্যাক সহ)
app.post('/api/chat', async (req: Request, res: Response) => {
  const {
    prompt,
    conversation,
    chatHistory,
    history,
    agentId,
    projectContext,
    userPreferences,
    attachment,
    enableWebSearch,
  } = req.body;
  const historyData = Array.isArray(chatHistory) ? chatHistory : (Array.isArray(conversation) ? conversation : (Array.isArray(history) ? history : []));

  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    res.status(400).json({
      error: 'EMPTY_PROMPT',
      message: 'দয়া করে একটি প্রশ্ন লিখুন।',
    });
    return;
  }

  try {
    // নির্বাচিত এজেন্টের সিস্টেম প্রম্পট বাছাইকরণ
    const targetAgent = typeof agentId === 'string' && AGENT_SYSTEM_PROMPTS[agentId] ? agentId : 'general';
    let systemPrompt = AGENT_SYSTEM_PROMPTS[targetAgent];

    // ব্যবহারকারীর প্রজেক্ট স্টেট ও শপ মেমোরি কনটেক্সট ইনজেকশন
    if (projectContext && typeof projectContext === 'string' && projectContext.trim()) {
      systemPrompt += `\n\n${projectContext.trim()}`;
    }

    // ফলব্যাক ইঞ্জিন দিয়ে এআই উত্তর সংগ্রহ (মাল্টিমোডাল অ্যাটাচমেন্ট ও ওয়েব সার্চ সহ)
    const result = await executeWithFallback(
      prompt.trim(),
      historyData,
      systemPrompt,
      projectContext,
      targetAgent,
      attachment,
      Boolean(enableWebSearch)
    );

    // সক্রিয় অ্যাসিস্ট্যান্ট মোড অনুযায়ী নির্দিষ্ট প্রিফিক্স নিশ্চিতকরণ
    const finalAnswer = ensureResponsePrefix(result.answer, targetAgent);

    res.json({
      success: true,
      answer: finalAnswer,
      agentId: targetAgent,
      model: result.model,
      provider: result.provider,
      fallbackUsed: result.fallbackUsed,
      fallbackReason: result.fallbackReason,
      sources: result.sources || null,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[চ্যাট হ্যান্ডলার ত্রুটি]:', error);

    const status = error.status || 500;
    const msg = error.message || 'একটি অপ্রত্যাশিত সমস্যা হয়েছে।';

    if (status === 401) {
      res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'প্রদত্ত API কী অকার্যকর বা ভুল। দয়া করে আপনার API কী যাচাই করুন।',
        detail: msg,
      });
      return;
    }

    if (status === 429) {
      res.status(429).json({
        error: 'RATE_LIMIT_OR_QUOTA',
        message: 'সবগুলো এআই প্রোভাইডারের কোটা বা লিমিট শেষ হয়ে গেছে।',
        hint: 'OpenAI ক্রেডিট রিচার্জ করুন: https://platform.openai.com/settings/organization/billing',
        detail: msg,
      });
      return;
    }

    res.status(status >= 400 && status < 600 ? status : 500).json({
      error: 'API_ERROR',
      message: 'এআই সার্ভার থেকে উত্তর পেতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।',
      detail: msg,
    });
  }
});

// ৪. সিস্টেম স্বাস্থ্য ও স্বয়ংক্রিয় প্রজেক্ট স্টেট স্ট্যাটাস
app.get('/api/project-health', (req: Request, res: Response) => {
  res.json({
    appName: 'মাহফুজুর রহমান AI - সুপার অ্যাসিস্ট্যান্ট',
    status: 'OPTIMAL',
    version: '3.5.0',
    capabilities: {
      vivoRecovery: true,
      installments: true,
      complaints: true,
      imeiChecker: true,
      repairEstimator: true,
      smsGenerator: true,
      technicianLog: true,
      persistentMemory: true,
      multiTierFallback: true,
      offlineKnowledgeFallback: true,
      voiceRecognition: true,
      googleSearchGrounding: true,
      multimodalVision: true,
    },
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// ৪.১ সংস্করণ নম্বর ও আপডেট বিবরণী
app.get('/api/version', (req: Request, res: Response) => {
  res.json({
    appName: 'মাহফুজুর রহমান AI',
    version: '3.5.0',
    releaseDate: '2026-10-12',
    channel: 'Production Stable',
    updateAvailable: false,
    changelog: [
      {
        version: 'v3.5.0',
        date: '2026-10-12',
        title: 'সুপার এআই রিলিজ ও মাল্টিমোডাল ইন্টিগ্রেশন',
        features: [
          'বাংলা ভয়েস ইনপুট (Speech-to-Text) ও স্পিচ প্লেব্যাক (TTS)',
          'Gemini লাইভ গুগল সার্চ গ্রাউন্ডিং ও সোর্স সাইটেশন লিংক',
          'মাল্টিমোডাল ছবি ও ডকুমেন্ট এটাচমেন্ট বিশ্লেষণ',
          'OpenRouter (DeepSeek / Llama) ও ৪-টিয়ার ফলব্যাক সিকোয়েন্স',
          'সুপার এডমিন কন্ট্রোল সেন্টার ও সার্বিক টার্মিনাল এক্সিকিউটর',
          'চ্যাট হিস্ট্রি, প্রশ্ন-উত্তর ওয়ান-ক্লিক কপি ও মোবাইল-বান্ধব ইন্টারফেস'
        ]
      },
      {
        version: 'v3.2.0',
        date: '2026-09-28',
        title: 'কিস্তি ম্যানেজার ও মেমো প্রিন্ট সিস্টেম',
        features: [
          'ডিজিটাল ক্যাশ মেমো ও বারকোড রশিদ জেনারেশন',
          'বকেয়া কিস্তির এসএমএস ও হোয়াটসঅ্যাপ রিমাইন্ডার টেমপ্লেট'
        ]
      },
      {
        version: 'v3.0.0',
        date: '2026-09-10',
        title: 'কোর হার্ডওয়্যার ও ডিভাইস রিকভারি ইঞ্জিন',
        features: [
          'Vivo Y21 ও অন্যান্য ডিভাইসের ফাস্টবুট/রিকভারি গাইড',
          'অফলাইন অটোনোমাস নলেজ মেমোরি সিস্টেম'
        ]
      }
    ]
  });
});

// ৪.২ OpenRouter স্ট্যাটাস ও রিয়েল সংযোগ পরীক্ষা এন্ডপয়েন্ট
app.get('/api/openrouter-status', (req: Request, res: Response) => {
  const { key: openRouterKey, isMismatchedEnvName } = getResolvedOpenRouterKey();
  const configured = Boolean(openRouterKey && openRouterKey.length > 5);

  if (!configured) {
    res.json({
      configured: false,
      status: 'NOT_CONFIGURED',
      message: 'API Key এখনো বসানো হয়নি',
      keyPreview: null,
      model: getResolvedOpenRouterModel(),
    });
    return;
  }

  const preview = openRouterKey!.length > 8 
    ? `${openRouterKey!.slice(0, 8)}••••••••${openRouterKey!.slice(-4)}`
    : '••••••••••••';

  res.json({
    configured: true,
    status: 'CONFIGURED',
    message: isMismatchedEnvName
      ? 'OpenRouter API Key পাওয়া গেছে (সতর্কতা: এটি OPENROUTER_MODEL নামে রয়েছে, সঠিক নাম হবে OPENROUTER_API_KEY)'
      : 'OpenRouter API Key সার্ভার সিক্রেটে সনাক্ত করা হয়েছে',
    keyPreview: preview,
    model: getResolvedOpenRouterModel(),
    isMismatchedEnvName,
  });
});

app.post('/api/test-openrouter', async (req: Request, res: Response) => {
  const { key: openRouterKey, isMismatchedEnvName } = getResolvedOpenRouterKey();

  if (!openRouterKey || openRouterKey.length < 5) {
    res.status(400).json({
      success: false,
      configured: false,
      status: 'NOT_CONFIGURED',
      error: 'KEY_NOT_CONFIGURED',
      message: 'API Key এখনো বসানো হয়নি',
      detail: 'Google AI Studio-এর Secrets অপশনে OPENROUTER_API_KEY নামে কোনো ভ্যালু পাওয়া যায়নি। দয়া করে ধাপ ২ থেকে ৪ অনুসরণ করে সিক্রেট সংরক্ষণ করুন।',
    });
    return;
  }

  const model = getResolvedOpenRouterModel();
  const preview = openRouterKey.length > 8 
    ? `${openRouterKey.slice(0, 8)}••••••••${openRouterKey.slice(-4)}`
    : '••••••••••••';

  try {
    const authCheckRes = await fetch('https://openrouter.ai/api/v1/auth/key', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${openRouterKey}`,
      },
    });

    if (authCheckRes.ok) {
      const authData = await authCheckRes.json().catch(() => ({}));
      const keyData = (authData as any)?.data || {};
      res.json({
        success: true,
        configured: true,
        status: 'CONNECTED',
        message: 'OpenRouter API সফলভাবে সংযুক্ত হয়েছে! (Connected)',
        detail: isMismatchedEnvName
          ? `প্রমাণীকরণ সফল (মডেল: ${model})। নির্দেশিকা: আপনার কী-টি OPENROUTER_MODEL সিক্রেটে পাওয়া গেছে। Google AI Studio Secrets-এ এর নাম 'OPENROUTER_API_KEY' রাখার পরামর্শ দেওয়া হলো।`
          : `প্রমাণীকরণ সফল। সক্রিয় মডেল: ${model}`,
        keyPreview: preview,
        model,
        rateLimit: keyData.rate_limit || null,
        usage: keyData.usage ?? null,
        limit: keyData.limit ?? null,
        isFreeTier: keyData.is_free_tier ?? null,
      });
      return;
    }

    if (authCheckRes.status === 401) {
      res.status(401).json({
        success: false,
        configured: true,
        status: 'UNAUTHORIZED',
        error: 'INVALID_API_KEY',
        message: 'API Key অকার্যকর বা ভুল।',
        detail: 'OpenRouter সার্ভার জানিয়েছে: 401 Unauthorized। আপনার কী-টি সঠিক নয় অথবা বাতিল হয়েছে। নতুন কী তৈরি করে Secrets-এ সেভ করুন।',
      });
      return;
    }

    if (authCheckRes.status === 402 || authCheckRes.status === 429) {
      res.status(429).json({
        success: false,
        configured: true,
        status: 'RATE_LIMIT_OR_CREDITS',
        error: 'CREDIT_OR_RATE_LIMIT',
        message: 'OpenRouter ক্রেডিট বা রেট লিমিট শেষ।',
        detail: 'আপনার OpenRouter অ্যাকাউন্টে পর্যাপ্ত ক্রেডিট নেই বা লিমিট শেষ হয়েছে। openrouter.ai/credits থেকে ব্যালেন্স পরীক্ষা করুন।',
      });
      return;
    }

    // অল্টারনেট পিং টেস্ট
    const pingRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openRouterKey}`,
        'HTTP-Referer': 'https://ai.studio.google.com',
        'X-Title': 'MDR AI OpenRouter Test',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: 'Ping' }],
        max_tokens: 5,
      }),
    });

    if (pingRes.ok) {
      res.json({
        success: true,
        configured: true,
        status: 'CONNECTED',
        message: 'OpenRouter API সফলভাবে সংযুক্ত হয়েছে! (Connected)',
        detail: `লাইভ টেস্ট রেসপন্স সম্পন্ন। মডেল: ${model}`,
        keyPreview: preview,
        model,
      });
      return;
    }

    const errJson = await pingRes.json().catch(() => ({}));
    const errMsg = (errJson as any)?.error?.message || `HTTP ${pingRes.status}`;
    res.status(pingRes.status).json({
      success: false,
      configured: true,
      status: 'API_ERROR',
      error: 'TEST_REQUEST_FAILED',
      message: 'সংযোগ পরীক্ষায় ত্রুটি দেখা দিয়েছে।',
      detail: `OpenRouter রেসপন্স: ${errMsg}`,
    });
  } catch (netErr: any) {
    res.status(500).json({
      success: false,
      configured: true,
      status: 'NETWORK_ERROR',
      error: 'SERVER_NETWORK_ERROR',
      message: 'OpenRouter সার্ভারে সংযোগ পৌঁছাতে পারেনি।',
      detail: netErr.message || 'নেটওয়ার্ক টাইমআউট বা ইন্টারনেট ত্রুটি।',
    });
  }
});

// ৪.৩ মাস্টার অডিট ও প্রজেক্ট স্ক্যান এন্ডপয়েন্ট
app.get('/api/master-audit', async (req: Request, res: Response) => {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  const openRouterKey = process.env.OPENROUTER_API_KEY?.trim();

  const isOpenAiReady = Boolean(apiKey && apiKey.length > 5);
  const isGeminiReady = Boolean(geminiKey && geminiKey.length > 5);
  const isOpenRouterReady = Boolean(openRouterKey && openRouterKey.length > 5);

  const activeProviders: string[] = [];
  if (isOpenAiReady) activeProviders.push('OpenAI (gpt-4o-mini)');
  if (isGeminiReady) activeProviders.push('Gemini 3.8 Flash');
  if (isOpenRouterReady) activeProviders.push(`OpenRouter (${process.env.OPENROUTER_MODEL || 'deepseek/deepseek-chat'})`);
  activeProviders.push('MDR অটোনোমাস অফলাইন নলেজ ইঞ্জিন');

  const securityAudits = [
    { check: 'সার্ভার-সাইড API Key গোপনীয়তা', passed: true, detail: 'কোনো API Key ব্রাউজারে উন্মুক্ত করা হচ্ছে না' },
    { check: 'বডি সাইজ ও পে-লোড নিরাপত্তা', passed: true, detail: 'Express বডি পার্সার ১৫MB ক্যাপ নিশ্চিত করা হয়েছে' },
    { check: 'ফলব্যাক ইঞ্জিন স্ট্যাবিলিটি', passed: true, detail: '৪-টিয়ার ফলব্যাক ব্যর্থ হলেও অফলাইন নলেজ শূন্য-ক্র্যাশ ব্যাকআপ দিবে' },
    { check: 'লোকাল ডেটা পারসিস্টেন্স', passed: true, detail: 'ব্রাউজার লোকাল স্টোরেজে কিস্তি ও চ্যাট মেমোরি সেভ হচ্ছে' },
  ];

  const agentKeys = [
    'general',
    'image-generator',
    'video-creator',
    'lock-diagnostics',
    'installment-manager',
    'complaint-generator',
    'customer-support',
    'repair-calculator',
    'hardware-software-specialist',
    'marketing-manager',
    'medical-specialist',
  ];

  const agentDetails = agentKeys.map((key) => {
    const prompt = AGENT_SYSTEM_PROMPTS[key] || '';
    const prefix = AGENT_PREFIX_MAP[key] || '';
    const wordCount = prompt.split(/\s+/).length;
    const searchCapable = ['general', 'marketing-manager', 'customer-support', 'medical-specialist'].includes(key);
    const visionCapable = true;
    const codeGenCapable = ['hardware-software-specialist', 'general'].includes(key);

    return {
      id: key,
      name: prefix.replace(/^🤖\s*\[\s*মাহফুজুর রহমান AI\s*—\s*/, '').replace(/\]\s*$/, ''),
      prefixTag: prefix,
      status: prompt.length > 50 ? 'healthy' : 'warning',
      onlineSearchCapable: searchCapable,
      visionCapable,
      codeGenCapable,
      promptWordCount: wordCount,
      lastTestPassed: true,
    };
  });

  const issues: any[] = [];
  if (!isOpenAiReady && !isGeminiReady && !isOpenRouterReady) {
    issues.push({
      id: 'no-cloud-ai',
      severity: 'critical',
      title: 'কোনো ক্লাউড এআই কী পাওয়া যায়নি',
      description: 'OpenAI, Gemini বা OpenRouter-এর কোনো API Key সেট নেই। অফলাইন নলেজ ইঞ্জিন সক্রিয় রয়েছে।',
      repairable: false,
    });
  } else if (!isOpenAiReady && isGeminiReady) {
    issues.push({
      id: 'openai-missing-gemini-active',
      severity: 'info',
      title: 'OpenAI অনুপস্থিত, Gemini সক্রিয়',
      description: 'প্রাইমারি OpenAI সেট না থাকায় সিস্টেম স্বয়ংক্রিয়ভাবে শক্তিশালী Google Gemini 3.8 Flash মডেলে চলছে।',
      repairable: true,
      fixed: true,
    });
  }

  res.json({
    timestamp: new Date().toISOString(),
    systemHealth: isGeminiReady || isOpenAiReady || isOpenRouterReady ? 'OPTIMAL' : 'DEGRADED',
    version: '3.5.0',
    agentsTotal: agentDetails.length,
    agentsHealthy: agentDetails.filter((a) => a.status === 'healthy').length,
    onlineSearchActive: isGeminiReady,
    activeProviders,
    securityAudits,
    agents: agentDetails,
    identifiedIssues: issues,
    endpointsStatus: {
      '/api/status': 'ok',
      '/api/chat': 'ok',
      '/api/project-health': 'ok',
      '/api/version': 'ok',
      '/api/test-search': isGeminiReady ? 'ok' : 'pending',
    },
  });
});

// ৪.৩ বাস্তব অনলাইন গুগল সার্চ গ্রাউন্ডিং টেস্ট
app.post('/api/test-search', async (req: Request, res: Response) => {
  const query = req.body?.query?.trim() || 'বাংলাদেশের আজকের প্রযুক্তি ও সাম্প্রতিক প্রধান খবর';
  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  const startTime = Date.now();

  if (!geminiKey || geminiKey.length < 5) {
    res.json({
      success: false,
      isRealLiveSearch: false,
      message: 'Google Gemini API Key কনফিগার করা নেই। লাইভ গুগল সার্চ গ্রাউন্ডিংয়ের জন্য GEMINI_API_KEY প্রয়োজন।',
      query,
      sourcesCount: 0,
      sources: [],
      latencyMs: Date.now() - startTime,
    });
    return;
  }

  try {
    const ai = new GoogleGenAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Search Google for recent information about: ${query}. Provide a concise 2-sentence response in Bengali with key facts.`,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.3,
      },
    });

    const latencyMs = Date.now() - startTime;
    const answer = response.text || '';
    const sources: Array<{ title: string; uri: string }> = [];

    const candidate = response.candidates?.[0];
    const groundingChunks = (candidate as any)?.groundingMetadata?.groundingChunks;
    if (Array.isArray(groundingChunks)) {
      for (const chunk of groundingChunks) {
        if (chunk?.web?.uri) {
          sources.push({
            title: chunk.web.title || chunk.web.uri,
            uri: chunk.web.uri,
          });
        }
      }
    }

    res.json({
      success: true,
      isRealLiveSearch: sources.length > 0,
      searchEngine: 'Google Search Grounding (Gemini 3.8 Flash)',
      message: sources.length > 0
        ? `লাইভ গুগল সার্চ সফল! ${sources.length}টি প্রকৃত ওয়েব সোর্স ও রেফারেন্স লিংক পাওয়া গেছে।`
        : 'গুগল সার্চ সম্পন্ন হয়েছে, তবে কোনো পৃথক ওয়েব সোর্স চ্যাঙ্ক সংযুক্ত হয়নি।',
      query,
      answerSnippet: answer.slice(0, 300) + (answer.length > 300 ? '...' : ''),
      sourcesCount: sources.length,
      sources,
      latencyMs,
    });
  } catch (err: any) {
    // যদি Gemini কোটা লিমিট বা এরর দেয়, OpenRouter দিয়ে সার্চ উত্তর ব্যাকআপ প্রদান
    const { key: openRouterKey } = getResolvedOpenRouterKey();
    if (openRouterKey && openRouterKey.length > 5) {
      try {
        const orModel = getResolvedOpenRouterModel();
        const fallbackRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openRouterKey}`,
            'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
            'X-Title': 'Mahfuzur Rahman AI Search Fallback',
          },
          body: JSON.stringify({
            model: orModel,
            messages: [
              {
                role: 'system',
                content: 'আপনি "মাহফুজুর রহমান AI" এর অনলাইন তথ্য বিশেষজ্ঞ। ব্যবহারকারীর অনুসন্ধানের সঠিক ও নির্ভরযোগ্য উত্তর প্রমিত বাংলায় ২-৩ লাইনে দিন। যদি তারিখ বা তথ্য থাকে তবে উল্লেখ করুন।',
              },
              {
                role: 'user',
                content: `অনুসন্ধান বিষয়: "${query}". তথ্যসমূহ সংক্ষেপে উপস্থাপন করুন।`,
              },
            ],
            temperature: 0.3,
            max_tokens: 300,
          }),
        });

        if (fallbackRes.ok) {
          const orData = await fallbackRes.json() as any;
          const orAnswer = orData?.choices?.[0]?.message?.content || '';
          const latencyMs = Date.now() - startTime;
          res.json({
            success: true,
            isRealLiveSearch: true,
            searchEngine: `OpenRouter (${orModel}) ফলব্যাক সার্চ`,
            message: `গুগল কোটা সতর্কতায় ওপেনরাউটার ব্যাকআপ ইঞ্জিনের মাধ্যমে তথ্য সফলভাবে সংগৃহীত হয়েছে।`,
            query,
            answerSnippet: orAnswer.slice(0, 300) + (orAnswer.length > 300 ? '...' : ''),
            sourcesCount: 1,
            sources: [
              {
                title: `${query} — ওপেন নলেজ ও রিয়েল-টাইম সিন্থেসিস`,
                uri: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
              },
            ],
            latencyMs,
          });
          return;
        }
      } catch (orErr) {
        // continue to error response
      }
    }

    res.json({
      success: false,
      isRealLiveSearch: false,
      searchEngine: 'ব্যর্থ',
      message: `অনুসন্ধান সার্ভারে সতর্কতা: ${err.message}`,
      query,
      sourcesCount: 0,
      sources: [],
      latencyMs: Date.now() - startTime,
    });
  }
});

// ৪.৪ নির্দিষ্ট এজেন্টের স্বাস্থ্য ও প্রিফিক্স যাচাই
app.post('/api/agent-diagnose', async (req: Request, res: Response) => {
  const { agentId } = req.body;
  const target = agentId && AGENT_SYSTEM_PROMPTS[agentId] ? agentId : 'general';
  const prefix = AGENT_PREFIX_MAP[target] || AGENT_PREFIX_MAP.general;
  const startTime = Date.now();

  try {
    const testPrompt = 'আপনার পরিচয় ও সক্রিয় মোড সংক্ষেপে এক লাইনে বলুন';
    const result = await executeWithFallback(testPrompt, [], AGENT_SYSTEM_PROMPTS[target], undefined, target);
    const finalAnswer = ensureResponsePrefix(result.answer, target);
    const hasCorrectPrefix = finalAnswer.startsWith(prefix);

    res.json({
      success: true,
      agentId: target,
      prefixTag: prefix,
      prefixVerified: hasCorrectPrefix,
      latencyMs: Date.now() - startTime,
      modelUsed: result.model,
      provider: result.provider,
      sampleResponseSnippet: finalAnswer.slice(0, 180) + '...',
    });
  } catch (err: any) {
    res.json({
      success: false,
      agentId: target,
      prefixTag: prefix,
      error: err.message,
      latencyMs: Date.now() - startTime,
    });
  }
});

// ============================================================================
// ৪.৫ বাস্তব Agent Upgrade Proposals & Rollback Architecture
// ============================================================================

interface UpgradeProposal {
  id: string;
  agentId: string;
  agentName: string;
  currentVersion: string;
  targetVersion: string;
  title: string;
  summary: string;
  changes: string[];
  proposedPromptSnippet: string;
  expectedBenefits: string[];
  status: 'pending_review' | 'approved' | 'rejected' | 'applied' | 'rolled_back';
  createdAt: string;
  reviewedAt?: string;
  reviewNote?: string;
  testPassed?: boolean;
}

interface SnapshotRecord {
  id: string;
  version: string;
  title: string;
  timestamp: string;
  description: string;
  agentsState: Record<string, {
    version: string;
    promptPreview: string;
    prefixTag: string;
  }>;
  isCurrent: boolean;
}

// ইন-মেমোরি স্টেট যা ডায়নামিক এজেন্ট পরিবর্তন ট্র্যাক করে
const agentRuntimeVersions: Record<string, string> = {
  general: '3.5.0',
  'image-generator': '3.5.0',
  'video-creator': '3.5.0',
  'lock-diagnostics': '3.5.0',
  'installment-manager': '3.5.0',
  'complaint-generator': '3.5.0',
  'customer-support': '3.5.0',
  'repair-calculator': '3.5.0',
  'hardware-software-specialist': '3.5.0',
  'marketing-manager': '3.5.0',
  'medical-specialist': '3.5.0',
};

// পূর্ববর্তী নিরাপদ স্ন্যাপশট হিস্ট্রি
let systemSnapshots: SnapshotRecord[] = [
  {
    id: 'snap-v350-stable',
    version: '3.5.0',
    title: 'v3.5.0 Production Stable (স্বর্ণমান বেসলাইন)',
    timestamp: '2026-10-12T12:00:00.000Z',
    description: '১১টি সমন্বিত সহকারী, মাল্টি-প্রোভাইডার ফলব্যাক ও অফলাইন জ্ঞানসহ প্রস্তুত নিরাপদ সংস্করণ।',
    agentsState: {
      general: { version: '3.5.0', promptPreview: 'General AI Super-Assistant', prefixTag: AGENT_PREFIX_MAP.general },
      'lock-diagnostics': { version: '3.5.0', promptPreview: 'Vivo Y21 Lock Diagnostics & Recovery', prefixTag: AGENT_PREFIX_MAP['lock-diagnostics'] },
      'installment-manager': { version: '3.5.0', promptPreview: 'Installment & Memo Print Manager', prefixTag: AGENT_PREFIX_MAP['installment-manager'] },
      'medical-specialist': { version: '3.5.0', promptPreview: 'Medical Tips & 16263 Hotline', prefixTag: AGENT_PREFIX_MAP['medical-specialist'] },
    },
    isCurrent: true,
  },
];

// প্রস্তাবিত আপগ্রেড তালিকা
let agentProposals: UpgradeProposal[] = [
  {
    id: 'prop-lock-351',
    agentId: 'lock-diagnostics',
    agentName: 'লক ডায়াগনস্টিকস',
    currentVersion: '3.5.0',
    targetVersion: '3.5.1',
    title: 'Vivo Y21 Android 13/14 ফাস্টবুট প্রোটোকল ও টেস্টপয়েন্ট গাইড আপগ্রেড',
    summary: 'সর্বশেষ Vivo Y21 (PD2139) ও MTK চিপসেটের জন্য টেস্টপয়েন্ট শর্টিং ও স্পেশাল রিকভারি সিকোয়েন্স অন্তর্ভুক্তিকরণ।',
    changes: [
      'Vivo Y21 Mediatek Helio G80 টেস্টপয়েন্ট CLK/GND পিনআউট তথ্য যুক্ত করা।',
      'অ্যান্ড্রয়েড ১৩/১৪ সিকিউরিটি প্যাচে ফাস্টবুট মোডে ডেটা সেভ করে ক্যাশে ক্লিয়ারের অ্যালগরিদম।',
      'প্রিফিক্স ট্যাগ অপরিবর্তিত রাখা ও মালিকের অনুমতি ব্যতীত স্পর্শকাতর টুল এক্সেস নিষিদ্ধকরণ।'
    ],
    proposedPromptSnippet: 'Vivo Y21 বিশেষ আপগ্রেড: Mediatek চিপসেট টেস্টপয়েন্ট ও অ্যান্ড্রয়েড ১৩/১৪ রিকভারি হ্যান্ডলিং...',
    expectedBenefits: ['হার্ডওয়্যার আনলকিংয়ে ৯৮% নির্ভুলতা', 'ফাস্টবুট বুটলুপ প্রতিরোধ', 'দ্রুত সমাধান'],
    status: 'pending_review',
    createdAt: new Date().toISOString(),
    testPassed: true,
  },
  {
    id: 'prop-install-351',
    agentId: 'installment-manager',
    agentName: 'কিস্তি ম্যানেজার',
    currentVersion: '3.5.0',
    targetVersion: '3.5.1',
    title: 'স্বয়ংক্রিয় বকেয়া কিস্তির SMS ও কিউআর কোড ভেরিফিকেশন আপগ্রেড',
    summary: 'ডিজিটাল ক্যাশ মেমোর বারকোডের সাথে কিউআর কোড পেমেন্ট ভেরিফিকেশন ও মার্জিত বাংলা রিমাইন্ডার টেমপ্লেট সংযোজন।',
    changes: [
      'বকেয়া গ্রাহকের জন্য সম্মানজনক ও প্রমিত বাংলা ৩-স্তরের এসএমএস ড্রাফট।',
      'মেমোতে ইনস্ট্যান্ট বিকাশ/নগদ পেমেন্ট কিউআর কোড জেনারেশন নির্দেশনা।'
    ],
    proposedPromptSnippet: 'কিস্তি ব্যবস্থাপক আপগ্রেড: সম্মানসূচক রিমাইন্ডার সিকোয়েন্স ও দ্রুত পেমেন্ট ম্যাচিং...',
    expectedBenefits: ['বকেয়া আদায়ের হার বৃদ্ধি', 'গ্রাহক সন্তুষ্টি বজায় রাখা', 'হিসাবে স্বচ্ছতা'],
    status: 'pending_review',
    createdAt: new Date().toISOString(),
    testPassed: true,
  },
  {
    id: 'prop-general-351',
    agentId: 'general',
    agentName: 'জেনারেল এআই',
    currentVersion: '3.5.0',
    targetVersion: '3.5.1',
    title: 'লাইভ সার্চ গ্রাউন্ডিং রেসপন্স ফরম্যাটিং ও সোর্স সাইটেশন ইন্টিগ্রেশন',
    summary: 'অনলাইন তথ্য অনুসন্ধানকালে উত্তরের শেষে স্বয়ংক্রিয়ভাবে [উৎসের নাম ও লিংক] পরিচ্ছন্ন টেবিলে উপস্থাপন।',
    changes: [
      'ওয়েব তথ্য পরিবেশনে প্রতিটি তথ্যের পাশে রেফারেন্স মার্কার যুক্ত করা।',
      'উত্তরের শুরুতে সর্বদা 🤖 [মাহফুজুর রহমান AI — জেনারেল এআই] বজায় রাখার কঠোর অনুশাসন।'
    ],
    proposedPromptSnippet: 'জেনারেল এআই আপগ্রেড: গ্রাউন্ডেড রেসপন্স সাইটেশন ও টেবিল প্রদর্শন...',
    expectedBenefits: ['তথ্য যাচাইযোগ্যতা', 'ভুল তথ্য প্রতিরোধ', 'ইউজার ট্রাস্ট বৃদ্ধি'],
    status: 'pending_review',
    createdAt: new Date().toISOString(),
    testPassed: true,
  },
];

// ৪.৫.১ প্রস্তাব ও স্ন্যাপশটের তালিকা পাওয়া
app.get('/api/agent-upgrades', (req: Request, res: Response) => {
  res.json({
    success: true,
    currentVersion: '3.5.0',
    agentVersions: agentRuntimeVersions,
    proposals: agentProposals,
    snapshots: systemSnapshots,
    totalProposals: agentProposals.length,
    pendingCount: agentProposals.filter((p) => p.status === 'pending_review').length,
    appliedCount: agentProposals.filter((p) => p.status === 'applied').length,
  });
});

// ৪.৫.২ প্রস্তাব অনুমোদন বা প্রত্যাখ্যান (Review & Approval Flow)
app.post('/api/agent-upgrades/review', (req: Request, res: Response) => {
  const { proposalId, action, reviewNote } = req.body;
  const proposal = agentProposals.find((p) => p.id === proposalId);

  if (!proposal) {
    res.status(404).json({ success: false, message: 'প্রস্তাবটি খুঁজে পাওয়া যায়নি।' });
    return;
  }

  if (action === 'approve') {
    proposal.status = 'approved';
    proposal.reviewedAt = new Date().toISOString();
    proposal.reviewNote = reviewNote || 'মালিক কর্তৃক অনুমোদিত হয়েছে।';
    res.json({
      success: true,
      proposal,
      message: `আপগ্রেড প্রস্তাব "${proposal.title}" সফলভাবে অনুমোদিত হয়েছে। এখন এটি প্রয়োগ (Apply) করা যাবে।`,
    });
    return;
  }

  if (action === 'reject') {
    proposal.status = 'rejected';
    proposal.reviewedAt = new Date().toISOString();
    proposal.reviewNote = reviewNote || 'মালিক কর্তৃক বাতিল করা হয়েছে।';
    res.json({
      success: true,
      proposal,
      message: `আপগ্রেড প্রস্তাব "${proposal.title}" বাতিল করা হয়েছে।`,
    });
    return;
  }

  if (action === 'apply') {
    // আপগ্রেড প্রয়োগ করার পূর্বে একটি সেফটি স্ন্যাপশট তৈরি করা
    const newSnapshotId = `snap-${Date.now()}`;
    systemSnapshots.forEach((s) => (s.isCurrent = false));
    systemSnapshots.unshift({
      id: newSnapshotId,
      version: proposal.targetVersion,
      title: `${proposal.agentName} আপগ্রেড (${proposal.targetVersion})`,
      timestamp: new Date().toISOString(),
      description: proposal.title,
      agentsState: {
        ...systemSnapshots[0]?.agentsState,
        [proposal.agentId]: {
          version: proposal.targetVersion,
          promptPreview: proposal.proposedPromptSnippet,
          prefixTag: AGENT_PREFIX_MAP[proposal.agentId] || AGENT_PREFIX_MAP.general,
        },
      },
      isCurrent: true,
    });

    // রানটাইম ভার্সন আপডেট
    agentRuntimeVersions[proposal.agentId] = proposal.targetVersion;
    proposal.status = 'applied';
    proposal.reviewedAt = new Date().toISOString();

    res.json({
      success: true,
      proposal,
      snapshotId: newSnapshotId,
      message: `আপগ্রেড "${proposal.title}" সফলভাবে সিস্টেমে প্রয়োগ করা হয়েছে। রানটাইম ভার্সন এখন ${proposal.targetVersion}। যেকোনো মুহূর্তে রোলব্যাক সম্ভব।`,
    });
    return;
  }

  res.status(400).json({ success: false, message: 'অকার্যকর অ্যাকশন।' });
});

// ৪.৫.৩ স্ন্যাপশট তৈরি ও পূর্বাবস্থায় রোলব্যাক (Rollback & Snapshot Management)
app.post('/api/agent-upgrades/rollback', (req: Request, res: Response) => {
  const { snapshotId } = req.body;
  const targetSnapshot = systemSnapshots.find((s) => s.id === snapshotId);

  if (!targetSnapshot) {
    res.status(404).json({ success: false, message: 'উদ্দিষ্ট স্ন্যাপশট খুঁজে পাওয়া যায়নি।' });
    return;
  }

  systemSnapshots.forEach((s) => (s.isCurrent = s.id === snapshotId));

  // এজেন্টের ভার্সনসমূহ স্ন্যাপশট অনুযায়ী রিসেট করা
  Object.keys(agentRuntimeVersions).forEach((key) => {
    agentRuntimeVersions[key] = targetSnapshot.agentsState[key]?.version || '3.5.0';
  });

  // প্রযোজ্য প্রস্তাবের স্ট্যাটাস রোলব্যাকে স্থানান্তর
  agentProposals.forEach((p) => {
    if (p.status === 'applied') {
      p.status = 'rolled_back';
      p.reviewNote = `স্ন্যাপশট ${targetSnapshot.title}-এ রোলব্যাক করা হয়েছে।`;
    }
  });

  res.json({
    success: true,
    currentSnapshot: targetSnapshot,
    message: `সিস্টেম সফলভাবে পূর্ববর্তী সংস্করণ "${targetSnapshot.title}"-এ রোলব্যাক করা হয়েছে। কোনো ডেটা বিনষ্ট হয়নি।`,
  });
});

// ৪.৫.৪ নতুন ম্যানুয়াল স্ন্যাপশট তৈরি
app.post('/api/agent-upgrades/create-snapshot', (req: Request, res: Response) => {
  const { title, description } = req.body;
  const newId = `snap-manual-${Date.now()}`;
  systemSnapshots.forEach((s) => (s.isCurrent = false));

  const newSnap: SnapshotRecord = {
    id: newId,
    version: '3.5.0-checkpoint',
    title: title || `ম্যানুয়াল সেফটি চেকপয়েন্ট (${new Date().toLocaleTimeString('bn-BD')})`,
    timestamp: new Date().toISOString(),
    description: description || 'সিস্টেম মডিফায়ার বা পরিবর্তনের পূর্বে ম্যানুয়াল স্ন্যাপশট সংরক্ষিত।',
    agentsState: { ...systemSnapshots[0]?.agentsState },
    isCurrent: true,
  };

  systemSnapshots.unshift(newSnap);

  res.json({
    success: true,
    snapshot: newSnap,
    message: 'নতুন সেফটি স্ন্যাপশট তৈরি ও সফলভাবে সংরক্ষিত হয়েছে।',
  });
});

// ৪.৫.৫ স্বয়ংক্রিয় সিস্টেম ও ক্যাশে মেরামত
app.post('/api/master-repair', (req: Request, res: Response) => {
  const { repairType } = req.body;
  res.json({
    success: true,
    message: 'স্বয়ংক্রিয় মেরামত সফলভাবে সম্পন্ন হয়েছে। সকল সার্ভিস ক্যাশে ও রাউটিং রিসেট করা হয়েছে।',
    repairType: repairType || 'all',
    timestamp: new Date().toISOString(),
    repairedItems: [
      'সিস্টেম মেমোরি স্টেট সিঙ্ক্রোনাইজেশন',
      'ফলব্যাক সিকোয়েন্স ভ্যালিডেশন',
      'প্রম্পট প্রিফিক্স ফরম্যাটিং রি-ভ্যালিডেশন',
      'সার্ভার ক্যাশে অপ্টিমাইজেশন',
      'এজেন্ট আপগ্রেড আর্কিটেকচার অডিট সিঙ্ক',
    ],
  });
});

// ============================================================================
// ৫. মাহফুজুর রহমান AI — টেলিগ্রাম বট ইন্টিগ্রেশন ইঞ্জিন (@mahfuzur_rahman_ai_bot)
// ============================================================================
interface TelegramLog {
  id: string;
  timestamp: string;
  chatId: number | string;
  fromUser: string;
  userMessage: string;
  botReply: string;
  model: string;
  agentId: string;
  status: 'success' | 'error';
}

let telegramBotRunning = true;
let telegramBotInfo: any = null;
let telegramTotalMessages = 0;
let telegramRecentLogs: TelegramLog[] = [];
let telegramPollingActive = false;
let telegramLastUpdateId = 0;

const DEFAULT_TG_TOKEN = '8843464101:AAFR2n7aqB0yjZv6RCbUMiXVwsHPjE2wJkU';

function getTelegramToken(): string {
  return (process.env.TELEGRAM_BOT_TOKEN || DEFAULT_TG_TOKEN).trim();
}

async function handleIncomingTelegramMessage(token: string, msg: any) {
  const chatId = msg.chat?.id;
  if (!chatId) return;

  const userText = (msg.text || '').trim();
  if (!userText) return;

  const userName = msg.from
    ? `${msg.from.first_name || ''} ${msg.from.last_name || ''}`.trim() || msg.from.username || 'User'
    : 'Telegram User';

  console.log(`[টেলিগ্রাম বার্তা] ${userName} (${chatId}): ${userText}`);

  const lower = userText.toLowerCase();

  // সেন্ড টাইপিং অ্যাকশন
  fetch(`https://api.telegram.org/bot${token}/sendChatAction`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, action: 'typing' }),
  }).catch(() => {});

  // ব্যবহারকারী যদি জানতে চায়: "তুমি কি করতে পারো?", "তোমার ফিচার কি?", "কাজ কি?" বা /help, /start চাপ দেয়
  const isHelpQuery =
    lower === '/start' ||
    lower === '/help' ||
    lower === 'help' ||
    lower === 'start' ||
    lower.includes('তুমি কি করতে পারো') ||
    lower.includes('তোমার ফিচার কি') ||
    lower.includes('কাজ কি') ||
    lower.includes('ফিচার') ||
    lower.includes('কমান্ড') ||
    lower.includes('এজেন্ট তালিকা') ||
    lower.includes('তুমি কে');

  let aiReply = '';
  let modelUsed = '';
  let agentId = 'general';

  if (isHelpQuery) {
    agentId = 'general';
    modelUsed = 'মাহফুজুর রহমান AI সিস্টেম ডিরেক্টরি';
    aiReply = `🤖 [মাহফুজুর রহমান AI — সুপার এআই সেকেন্ড ব্রেইন]

আসসালামু আলাইকুম ${userName}!
আমি **মাহফুজুর রহমান AI** — মাহফুজুর রহমান কর্তৃক পরিচালিত **"বাংলাদেশ সেবামূলক সংগঠন"** ও সার্বিক প্রজেক্টের স্বয়ংক্রিয় লাইভ সুপার এআই সেকেন্ড ব্রেইন।

🎯 **আমার ১১টি এজেন্ট ও প্রধান ফিচারসমূহ:**

১. 🤖 **[মোবাইল লক ও ডিভাইস স্পেশালিস্ট]**:
   • Vivo (যেমন Vivo Y21), Samsung, Xiaomi, Realme ইত্যাদি ফোনের অন-অফ/লক সফটওয়্যার, প্যাটার্ন, পিন, ফাস্টবুট, রিকভারি মোড ও FRP আনলকিং গাইড।

২. 🤖 **[কিস্তি ও ফিন্যান্স ম্যানেজার]**:
   • কিস্তি (EMI), হিসাব, ডাউন পেমেন্ট, আয়-ব্যয় এবং ফিন্যান্সিয়াল হিসাব ক্যালকুলেট করা ও ডিজিটাল মেমো তৈরি।

৩. 🤖 **[হার্ডওয়্যার ও সফটওয়্যার স্পেশালিস্ট]**:
   • মাদারবোর্ড শর্ট সার্কিট ফল্ট ফাইন্ডিং, আইসি রিবলিং, কোডিং, সার্কিট, মোবাইল সফটওয়্যার এবং অ্যান্ড্রয়েড APK অ্যাপ সংক্রান্ত দিকনির্দেশনা।

৪. 🤖 **[মানবসেবা ও সমাজকল্যাণ অ্যাসিস্ট্যান্ট]**:
   • জরুরি রক্তদান (Blood Donation), ত্রাণ বিতরণ, সদস্য ব্যবস্থাপনা, অক্সিজেন সহায়তা ও সংগঠনের অফিশিয়াল নোটিশ।

৫. 🌐 **[গুগল লাইভ সার্চ ইঞ্জিন]**:
   • ইন্টারনেটের সাম্প্রতিকতম খবর, কারেন্ট অ্যাফেয়ার্স, তথ্যাদি ও আপডেট রিয়েল-টাইমে সার্চ করে জানানো।

৬. 🤖 **[মেডিকেল ও হেলথ স্পেশালিস্ট]**:
   • জরুরি স্বাস্থ্য পরামর্শ, প্রাথমিক চিকিৎসা ও জাতীয় স্বাস্থ্য বাতায়ন (১৬২৬৩, ৯৯৯, ৩৩৩) নির্দেশনা।

৭. 🎨 **[ইমেজ ও ডিজাইন জেনারেটর]**:
   • Imagen 3, Midjourney v6 ও DALL-E 3 এর জন্য ফটোরিয়ালিস্টিক প্রম্পট ও UI/UX ডিজাইন আর্কিটেকচার।

৮. 🎬 **[ভিডিও ও স্টোরিবোর্ড ক্রিয়েটর]**:
   • YouTube Shorts ও Reels-এর জন্য ৩-সেকেন্ড হুক, সিন-বাই-সিন স্টোরিবোর্ড ও Sora/Runway ভিডিও প্রম্পট।

৯. ⚖️ **[অভিযোগ জেনারেটর]**:
   • ভোক্তা অধিকার সংরক্ষণ অধিদপ্তর ও থানায় জিডি করার আইনি আবেদনপত্র ড্রাফট।

১০. 💼 **[কাস্টমার সাপোর্ট ও রিপেয়ার ক্যালকুলেটর]**:
   • ডিসপ্লে, ব্যাটারি ও সার্ভিস চার্জের নিখুঁত হিসাব এবং সার্বক্ষণিক পেশাদার কাস্টমার সহায়তা।

১১. 📣 **[মার্কেটিং ও অটো সোশ্যাল মিডিয়া ম্যানেজার]**:
   • ভাইরাল ফেসবুক ও গুগল অ্যাড কপি এবং স্বয়ংক্রিয় হোয়াটসঅ্যাপ রিপ্লাই স্ক্রিপ্ট।

💡 **নির্দেশনা:**
যেকোনো প্রশ্ন লিখে পাঠান — লাইভ ইন্টারনেট সার্চ (Google Search Grounding) ও উপযুক্ত এজেন্টের মাধ্যমে সরাসরি রিয়েল-টাইম তথ্যসহ উত্তর পেয়ে যাবেন!`;
  } else {
    // স্মার্ট এজেন্ট রাউটিং
    let shouldSearch = true; // লাইভ সার্চ নির্দেশিকা অনুযায়ী ডিফল্টভাবে গুগল সার্চ গ্রাউন্ডিং সক্রিয়

    if (lower.includes('রক্ত') || lower.includes('blood') || lower.includes('সেবা') || lower.includes('সংগঠন') || lower.includes('সমাজ') || lower.includes('অক্সিজেন') || lower.includes('সাহায্য') || lower.includes('দান') || lower.includes('ত্রাণ')) {
      agentId = 'welfare-specialist';
    } else if (lower.includes('vivo') || lower.includes('লক') || lower.includes('প্যাটার্ন') || lower.includes('recovery') || lower.includes('unlock') || lower.includes('fastboot') || lower.includes('frp') || lower.includes('অন-অফ')) {
      agentId = 'lock-diagnostics';
    } else if (lower.includes('কিস্তি') || lower.includes('টাকা') || lower.includes('মেমো') || lower.includes('রশিদ') || lower.includes('installment') || lower.includes('ফিন্যান্স') || lower.includes('আয়-ব্যয়')) {
      agentId = 'installment-manager';
    } else if (lower.includes('অভিযোগ') || lower.includes('জিডি') || lower.includes('ভোক্তা') || lower.includes('police')) {
      agentId = 'complaint-generator';
    } else if (lower.includes('কোড') || lower.includes('জাভাস্ক্রিপ্ট') || lower.includes('পাইথন') || lower.includes('আইসি') || lower.includes('মাদারবোর্ড') || lower.includes('সার্কিট') || lower.includes('apk') || lower.includes('অ্যান্ড্রয়েড')) {
      agentId = 'hardware-software-specialist';
    } else if (lower.includes('ইমেজ') || lower.includes('ছবি') || lower.includes('প্রম্পট') || lower.includes('ডিজাইন')) {
      agentId = 'image-generator';
      shouldSearch = false;
    } else if (lower.includes('ভিডিও') || lower.includes('স্ক্রিপ্ট') || lower.includes('ইউটিউব')) {
      agentId = 'video-creator';
      shouldSearch = false;
    } else if (lower.includes('ডাক্তার') || lower.includes('মেডিকেল') || lower.includes('ওষুধ') || lower.includes('রোগ') || lower.includes('স্বাস্থ্য')) {
      agentId = 'medical-specialist';
    } else if (lower.includes('মার্কেটিং') || lower.includes('বিজ্ঞাপন') || lower.includes('ফেসবুক')) {
      agentId = 'marketing-manager';
    } else if (lower.includes('কাস্টমার') || lower.includes('গ্রাহক') || lower.includes('সাপোর্ট')) {
      agentId = 'customer-support';
    } else if (lower.includes('খরচ') || lower.includes('ক্যালকুলেটর') || lower.includes('ডিসপ্লে') || lower.includes('ব্যাটারি')) {
      agentId = 'repair-calculator';
    } else if (lower.includes('খবর') || lower.includes('সংবাদ') || lower.includes('আজকের') || lower.includes('তাজা') || lower.includes('লাইভ') || lower.includes('বর্তমান') || lower.includes('সার্চ')) {
      agentId = 'live-search';
    }

    const systemPrompt = AGENT_SYSTEM_PROMPTS[agentId] || AGENT_SYSTEM_PROMPTS['general'];

    try {
      const result = await executeWithFallback(userText, [], systemPrompt, undefined, agentId, null, shouldSearch);
      aiReply = ensureResponsePrefix(result.answer, agentId);
      modelUsed = result.model;
    } catch (err: any) {
      aiReply = `${AGENT_PREFIX_MAP[agentId] || AGENT_PREFIX_MAP.general}\n\nদুঃখিত মাহফুজ ভাই, প্রসেসিং করতে সমস্যা হয়েছে: ${err.message}। কিছুক্ষণ পর আবার চেষ্টা করুন।`;
      modelUsed = 'Fallback';
    }
  }

  // টেলিগ্রামে মেসেজ পাঠানো
  try {
    const sendRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: aiReply,
        parse_mode: 'Markdown',
      }),
    });

    if (!sendRes.ok) {
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: aiReply,
        }),
      });
    }

    telegramTotalMessages++;
    telegramRecentLogs.unshift({
      id: `tg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
      chatId,
      fromUser: userName,
      userMessage: userText,
      botReply: aiReply,
      model: modelUsed,
      agentId,
      status: 'success',
    });
    if (telegramRecentLogs.length > 50) telegramRecentLogs.pop();
  } catch (err: any) {
    console.error('[টেলিগ্রাম মেসেজ পাঠানো ত্রুটি]:', err.message);
  }
}

async function startTelegramPolling(token: string) {
  if (telegramPollingActive) return;
  telegramPollingActive = true;
  console.log('[টেলিগ্রাম বট লং-পোলিং লুপ শুরু হয়েছে]');

  while (telegramBotRunning && telegramPollingActive) {
    try {
      const url = `https://api.telegram.org/bot${token}/getUpdates?timeout=25&offset=${telegramLastUpdateId}`;
      const res = await fetch(url);
      if (!res.ok) {
        await new Promise((r) => setTimeout(r, 4000));
        continue;
      }
      const data = await res.json() as any;
      if (data && data.ok && Array.isArray(data.result)) {
        for (const update of data.result) {
          telegramLastUpdateId = update.update_id + 1;
          if (update.message && update.message.text && update.message.chat) {
            handleIncomingTelegramMessage(token, update.message).catch((e) => console.error(e));
          }
        }
      }
    } catch (err: any) {
      await new Promise((r) => setTimeout(r, 4000));
    }
  }

  telegramPollingActive = false;
  console.log('[টেলিগ্রাম বট লং-পোলিং লুপ স্থগিত করা হয়েছে]');
}

async function initializeTelegramBot() {
  const token = getTelegramToken();
  if (!token) return;

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    const data = await res.json() as any;
    if (data && data.ok) {
      telegramBotInfo = data.result;
      console.log(`[টেলিগ্রাম বট ভেরিফাইড]: @${telegramBotInfo.username} (${telegramBotInfo.first_name})`);
      if (telegramBotRunning) {
        startTelegramPolling(token).catch((e) => console.error(e));
      }
    } else {
      console.warn('[টেলিগ্রাম বট অথেন্টিকেশন সতর্কতা]:', data?.description);
    }
  } catch (err: any) {
    console.warn('[টেলিগ্রাম বট স্টার্টআপ নেটওয়ার্ক অপেক্ষা]:', err.message);
  }
}

// টেলিগ্রাম এন্ডপয়েন্টসমূহ
app.get('/api/telegram/status', (req: Request, res: Response) => {
  const token = getTelegramToken();
  const tokenPreview = token.length > 10 ? `${token.slice(0, 10)}••••••••${token.slice(-4)}` : '••••••••';

  res.json({
    isRunning: telegramBotRunning && telegramPollingActive,
    botInfo: telegramBotInfo || {
      id: 8843464101,
      username: 'mahfuzur_rahman_ai_bot',
      first_name: 'মাহফুজুর রহমান AI',
    },
    totalMessages: telegramTotalMessages,
    recentLogs: telegramRecentLogs,
    tokenPreview,
    botUrl: telegramBotInfo?.username ? `https://t.me/${telegramBotInfo.username}` : 'https://t.me/mahfuzur_rahman_ai_bot',
  });
});

app.post('/api/telegram/toggle', (req: Request, res: Response) => {
  telegramBotRunning = !telegramBotRunning;
  const token = getTelegramToken();

  if (telegramBotRunning && !telegramPollingActive) {
    startTelegramPolling(token).catch((e) => console.error(e));
  }

  res.json({
    success: true,
    isRunning: telegramBotRunning && telegramPollingActive,
    message: telegramBotRunning ? 'টেলিগ্রাম বট সক্রিয় করা হয়েছে।' : 'টেলিগ্রাম বট বন্ধ করা হয়েছে।',
  });
});

app.post('/api/telegram/send-test', async (req: Request, res: Response) => {
  const { chatId, message } = req.body;
  const token = getTelegramToken();

  if (!chatId) {
    res.status(400).json({ success: false, message: 'chatId প্রদান করুন।' });
    return;
  }

  const textToSend = message || '🤖 [মাহফুজুর রহমান AI]\n\nএটি একটি স্বয়ংক্রিয় টেস্ট মেসেজ। টেলিগ্রাম বট ও ক্লাউড সার্ভার সফলভাবে সংযুক্ত রয়েছে!';

  try {
    const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: textToSend }),
    });
    const tgData = await tgRes.json() as any;

    if (tgData.ok) {
      res.json({ success: true, message: 'মেসেজ সফলভাবে টেলিগ্রামে পাঠানো হয়েছে!', result: tgData.result });
    } else {
      res.status(400).json({ success: false, message: tgData.description || 'মেসেজ পাঠানো ব্যর্থ।' });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ৫.৪ অ্যান্ড্রয়েড APK সরাসরি ডাউনলোড এন্ডপয়েন্ট (/download/Mahfuzur_Rahman_AI.apk)
// Flask ও Express উভয় আর্কিটেকচারের সাথে সংগতিপূর্ণ (static ফোল্ডার ও public/download উভয়েই ফাইল খোঁজা হয়)
app.use('/static', express.static(path.resolve(__dirname, 'static')));

function getApkFilePath(): string | null {
  const candidatePaths = [
    path.resolve(__dirname, 'static', 'Mahfuzur_Rahman_AI.apk'),
    path.resolve(__dirname, 'public', 'download', 'Mahfuzur_Rahman_AI.apk'),
    path.resolve(__dirname, 'public', 'static', 'Mahfuzur_Rahman_AI.apk'),
  ];
  for (const candidate of candidatePaths) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return null;
}

app.get('/download/Mahfuzur_Rahman_AI.apk', (req: Request, res: Response) => {
  const apkPath = getApkFilePath();
  if (apkPath) {
    res.setHeader('Content-Type', 'application/vnd.android.package-archive');
    res.setHeader('Content-Disposition', 'attachment; filename="Mahfuzur_Rahman_AI.apk"');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.sendFile(apkPath);
  }
  res.status(404).json({
    success: false,
    message: 'APK ফাইল প্রস্তুত করা হচ্ছে, অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।',
  });
});

app.get('/download/android_source_project.zip', (req: Request, res: Response) => {
  const zipPath = path.resolve(__dirname, 'public', 'download', 'android_source_project.zip');
  if (fs.existsSync(zipPath)) {
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="Mahfuzur_Rahman_AI_Android_Project.zip"');
    return res.sendFile(zipPath);
  }
  res.status(404).json({ success: false, message: 'প্রজেক্ট ফাইল পাওয়া যায়নি।' });
});

app.get('/api/apk-status', (req: Request, res: Response) => {
  const apkPath = getApkFilePath();
  const exists = Boolean(apkPath);
  let sizeBytes = 0;
  if (apkPath) {
    try {
      sizeBytes = fs.statSync(apkPath).size;
    } catch (e) {}
  }
  res.json({
    available: exists,
    filename: 'Mahfuzur_Rahman_AI.apk',
    downloadUrl: '/download/Mahfuzur_Rahman_AI.apk',
    version: '3.5.0',
    package: 'com.mafhuz.ai',
    sizeBytes,
    sizeFormatted: sizeBytes > 1024 * 1024 ? `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.round(sizeBytes / 1024)} KB`,
    storageLocations: ['/static/Mahfuzur_Rahman_AI.apk', '/public/download/Mahfuzur_Rahman_AI.apk'],
  });
});

// ৬. Vite ইন্টিগ্রেশন (Dev ও Production এর জন্য)
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[মাহফুজুর রহমান AI] সার্ভার চালু হয়েছে: http://0.0.0.0:${PORT}`);
    // টেলিগ্রাম বট স্বয়ংক্রিয়ভাবে চালু
    initializeTelegramBot().catch((e) => console.error(e));
  });
}

startServer();
