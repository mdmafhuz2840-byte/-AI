#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
=============================================================================
🤖 মাহফুজুর রহমান AI — একক প্রজেক্ট টেলিগ্রাম বট ও লাইভ সার্চ ইঞ্জিন
বট ইউজারনেম: @mahfuzur_rahman_ai_bot
সংগঠন: বাংলাদেশ সেবামূলক সংগঠন (পরিচালক: মাহফুজুর রহমান)
=============================================================================
"""

import os
import sys
import time
import json
import urllib.request
import urllib.error

# ১. বট ও গুগল এআই কনফিগারেশন
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "8843464101:AAFR2n7aqB0yjZv6RCbUMiXVwsHPjE2wJkU")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

# ২. এআই ব্রেইন ও লাইভ ইন্টারনেট সার্চ নির্দেশিকা (System Instruction)
system_instruction = """
আপনি 'মাহফুজুর রহমান AI' — মাহফুজুর রহমান কর্তৃক পরিচালিত 'বাংলাদেশ সেবামূলক সংগঠন' ও সার্বিক প্রজেক্টের স্বয়ংক্রিয় লাইভ সুপার এআই সেকেন্ড ব্রেইন।

আপনার মূল ক্ষমতা ও ফিচারসমূহ (ব্যবহারকারী জানতে চাইলে বিস্তারিত বলবেন):
১. 🤖 [মোবাইল লক ও ডিভাইস স্পেশালিস্ট]: Vivo, Samsung, Xiaomi ইত্যাদির অন-অফ/লক সফটওয়্যার সংক্রান্ত তথ্য সমাধান।
২. 🤖 [কিস্তি ও ফিন্যান্স ম্যানেজার]: কিস্তি, হিসাব, আয়-ব্যয় এবং ফিন্যান্সিয়াল হিসাব ক্যালকুলেট করা।
৩. 🤖 [হার্ডওয়্যার ও সফটওয়্যার স্পেশালিস্ট]: কোডিং, সার্কিট, মোবাইল সফটওয়্যার এবং অ্যান্ড্রয়েড APK অ্যাপ সংক্রান্ত দিকনির্দেশনা।
৪. 🤖 [মানবসেবা ও সমাজকল্যাণ অ্যাসিস্ট্যান্ট]: রক্তদান, ত্রাণ বিতরণ, সদস্য ব্যবস্থাপনা ও সংগঠনের নোটিশ।
৫. 🌐 [গুগল লাইভ সার্চ ইঞ্জিন]: ইন্টারনেটের সাম্প্রতিকতম খবর, তথ্যাদি ও আপডেট রিয়েল-টাইমে সার্চ করে জানানো।

নির্দেশনা:
- ব্যবহারকারী যদি জিজ্ঞেস করে "তুমি কি করতে পারো?", "তোমার ফিচার কি?", "কাজ কি?" বা /help চাপ দেয়, তবে আপনার ১১টি এজেন্ট ও ফিচারের তালিকা সুন্দরভাবে উপস্থাপন করবেন।
- যেকোনো প্রশ্নের উত্তর দিতে বাধ্যতামূলকভাবে গুগল লাইভ সার্চের সর্বশেষ তথ্য ব্যবহার করবেন।
- কোনো স্ট্যাটিক বা মুখস্থ উত্তর দেওয়া যাবে না।
- প্রজেক্টের প্রশ্ন অনুযায়ী স্বয়ংক্রিয়ভাবে উপযুক্ত এজেন্ট ট্যাগ বসিয়ে উত্তর প্রদান করবেন।
"""

TELEGRAM_URL = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}"

# ৩. এজেন্ট ট্যাগ ডিটেকশন
def detect_agent_tag(query):
    lower = query.lower()
    if any(k in lower for k in ["রক্ত", "blood", "সেবা", "সংগঠন", "সাহায্য", "দান", "অক্সিজেন", "ত্রাণ"]):
        return "🤖 [মাহফুজুর রহমান AI — মানবসেবা ও সমাজকল্যাণ অ্যাসিস্ট্যান্ট]"
    if any(k in lower for k in ["vivo", "লক", "প্যাটার্ন", "unlock", "fastboot", "recovery", "অন-অফ", "frp"]):
        return "🤖 [মাহফুজুর রহমান AI — লক ও ডিভাইস স্পেশালিস্ট]"
    if any(k in lower for k in ["কিস্তি", "টাকা", "মেমো", "রশিদ", "installment", "হিসাব", "ফিন্যান্স", "আয়-ব্যয়"]):
        return "🤖 [মাহফুজুর রহমান AI — কিস্তি ও ফিন্যান্স ম্যানেজার]"
    if any(k in lower for k in ["কোড", "আইসি", "মাদারবোর্ড", "সার্কিট", "hardware", "software", "apk", "পাইথন", "অ্যাপ"]):
        return "🤖 [মাহফুজুর রহমান AI — হার্ডওয়্যার ও সফটওয়্যার স্পেশালিস্ট]"
    if any(k in lower for k in ["ডাক্তার", "মেডিকেল", "ওষুধ", "রোগ", "স্বাস্থ্য"]):
        return "🤖 [মাহফুজুর রহমান AI — মেডিকেল ও হেলথ স্পেশালিস্ট]"
    if any(k in lower for k in ["খবর", "সংবাদ", "আজকের", "তাজা", "লাইভ", "বর্তমান", "সার্চ"]):
        return "🌐 [মাহফুজুর রহমান AI — গুগল লাইভ সার্চ ইঞ্জিন]"
    return "🤖 [মাহফুজুর রহমান AI — জেনারেল এআই]"

# ৪. ১১টি এজেন্ট ও ফিচার প্রদর্শনী মেন্যু
HELP_MESSAGE = """🤖 [মাহফুজুর রহমান AI — সুপার এআই সেকেন্ড ব্রেইন]

আসসালামু আলাইকুম!
আমি **মাহফুজুর রহমান AI** — মাহফুজুর রহমান কর্তৃক পরিচালিত **"বাংলাদেশ সেবামূলক সংগঠন"** ও সার্বিক প্রজেক্টের স্বয়ংক্রিয় লাইভ সুপার এআই সেকেন্ড ব্রেইন।

🎯 **আমার ১১টি বিশেষায়িত এজেন্ট ও মূল ফিচারসমূহ:**

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
   • Imagen 3, Midjourney v6 ও DALL-E 3 এর জন্য ফটোরিয়ালিস্টিক প্রম্পট আর্কিটেকচার।

৮. 🎬 **[ভিডিও ও স্টোরিবোর্ড ক্রিয়েটর]**:
   • YouTube Shorts/Reels-এর ৩-সেকেন্ড হুক, সিন-বাই-সিন স্টোরিবোর্ড ও Sora/Runway ভিডিও প্রম্পট।

৯. ⚖️ **[অভিযোগ জেনারেটর]**:
   • ভোক্তা অধিকার সংরক্ষণ অধিদপ্তর ও থানায় জিডি করার আইনি আবেদনপত্র ড্রাফট।

১০. 💼 **[কাস্টমার সাপোর্ট ও রিপেয়ার ক্যালকুলেটর]**:
   • ডিসপ্লে, ব্যাটারি ও সার্ভিস চার্জের নিখুঁত হিসাব ও ২৪/৭ গ্রাহক সেবা।

১১. 📣 **[মার্কেটিং ও অটো সোশ্যাল মিডিয়া ম্যানেজার]**:
   • ভাইরাল ফেসবুক ও গুগল অ্যাড কপি এবং স্বয়ংক্রিয় হোয়াটসঅ্যাপ রিপ্লাই স্ক্রিপ্ট।

💡 **ব্যবহারবিধি:**
যেকোনো প্রশ্ন লিখে পাঠান — লাইভ ইন্টারনেট সার্চ (Google Search Grounding) ও উপযুক্ত এজেন্টের মাধ্যমে সরাসরি উত্তর প্রদান করা হবে!"""

# ৫. জেমিনি লাইভ সার্চ API কল (Standard Library ব্যবহার করে যাতে pip প্যাকেজ ছাড়াও যে কোনো পরিবেশে চলে)
def call_gemini_live_search(user_query, target_tag):
    if not GEMINI_API_KEY:
        return None
    
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"
    payload = {
        "contents": [
            {
                "role": "user",
                "parts": [{"text": user_query}]
            }
        ],
        "systemInstruction": {
            "parts": [{"text": f"{system_instruction}\n\nসক্রিয় এজেন্ট ট্যাগ: {target_tag}"}]
        },
        "tools": [
            {"googleSearch": {}}
        ]
    }
    
    try:
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            candidates = data.get("candidates", [])
            if candidates:
                parts = candidates[0].get("content", {}).get("parts", [])
                text_parts = [p.get("text", "") for p in parts if "text" in p]
                if text_parts:
                    return "".join(text_parts).strip()
    except Exception as e:
        print(f"Gemini API লাইভ সার্চ কল ত্রুটি: {e}")
        # লাইভ সার্চ ব্যর্থ হলে সাধারণ জেমিনি কল দিয়ে চেষ্টা
        try:
            payload.pop("tools", None)
            req2 = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json"},
                method="POST"
            )
            with urllib.request.urlopen(req2, timeout=25) as resp2:
                data2 = json.loads(resp2.read().decode("utf-8"))
                candidates2 = data2.get("candidates", [])
                if candidates2:
                    parts2 = candidates2[0].get("content", {}).get("parts", [])
                    text_parts2 = [p.get("text", "") for p in parts2 if "text" in p]
                    if text_parts2:
                        return "".join(text_parts2).strip()
        except Exception as e2:
            print(f"Gemini সাধারণ কল ত্রুটি: {e2}")
    return None

# ৬. টেলিগ্রাম নেটওয়ার্ক মেথডস
def get_updates(offset=None):
    try:
        url = f"{TELEGRAM_URL}/getUpdates?timeout=30"
        if offset:
            url += f"&offset={offset}"
        req = urllib.request.Request(url, headers={"User-Agent": "MahfuzurRahmanAI/3.5"})
        with urllib.request.urlopen(req, timeout=35) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except Exception as e:
        return {}

def send_message(chat_id, text):
    try:
        url = f"{TELEGRAM_URL}/sendMessage"
        payload = {"chat_id": chat_id, "text": text, "parse_mode": "Markdown"}
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        try:
            with urllib.request.urlopen(req, timeout=20) as resp:
                pass
        except urllib.error.HTTPError:
            # Markdown ফরম্যাট ব্যর্থ হলে প্লেইন টেক্সট হিসেবে পাঠানো
            payload.pop("parse_mode", None)
            req_plain = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json"},
                method="POST"
            )
            with urllib.request.urlopen(req_plain, timeout=20) as resp:
                pass
    except Exception as e:
        print(f"Send Error: {e}")

# ৭. অফলাইন ও ব্যাকআপ ফলব্যাক জেনারেটর
def generate_fallback_reply(user_query, target_tag):
    lower = user_query.lower()
    if "রক্ত" in lower or "blood" in lower or "সেবা" in lower:
        return f"""{target_tag}

🩸 **জরুরি রক্তদান ও মানবসেবা গাইডলাইন (বাংলাদেশ সেবামূলক সংগঠন)**:
১. রোগীর রক্তের গ্রুপ, বর্তমান হাসপাতাল এবং রোগীর আত্মীয়ের মোবাইল নম্বর স্পষ্টভাবে উল্লেখ করুন।
২. রক্তদানের জরুরি হটলাইন: জাতীয় জরুরি সেবা **৯৯৯** এবং স্বাস্থ্য বাতায়ন **১৬২৬৩**।
৩. মাহফুজুর রহমান পরিচালিত 'বাংলাদেশ সেবামূলক সংগঠন'-এর ভলান্টিয়ার টিম জরুরি রক্তদানে সহায়তা প্রদান করতে প্রতিশ্রুতিবদ্ধ।"""

    if "vivo" in lower or "লক" in lower or "unlock" in lower or "fastboot" in lower:
        return f"""{target_tag}

📱 **Vivo Y21 ও ডিভাইস নিরাপদ আনলক সিকোয়েন্স**:
১. ফোন সম্পূর্ণ Power Off করুন।
২. **Volume Up (+) এবং Power বাটন** একসাথে ৫-৮ সেকেন্ড চেপে Fastboot মোডে প্রবেশ করুন।
৩. Recovery Mode নির্বাচন করে **Clear Data ➔ Clear Cache** দিন (এতে ফাইল সুরক্ষিত থাকে)।
৪. পাসওয়ার্ড সমস্যা সমাধান না হলে অনুমোদিত টেকনিশিয়ান সহায়তা নিন।"""

    if "কিস্তি" in lower or "টাকা" in lower or "মেমো" in lower or "হিসাব" in lower:
        return f"""{target_tag}

💳 **কিস্তি ও ডিজিটাল ফিন্যান্স হিসাব**:
- মোট মূল্য থেকে ডাউন পেমেন্ট বাদ দিয়ে অবশিষ্ট টাকা সমহারে মাসিক কিস্তিতে ভাগ হয়।
- ডিজিটাল ক্যাশ মেমোতে কিউআর কোড ও বারকোড রশিদ স্বয়ংক্রিয়ভাবে জেনারেট করা হয়।
- বিস্তারিত কিস্তি হিসাব পেতে ডিভাইসের মোট মূল্য ও ডাউন পেমেন্ট উল্লেখ করুন।"""

    return f"""{target_tag}

আসসালামু আলাইকুম!
আপনার প্রশ্ন: "{user_query}"
আমি বাংলাদেশ সেবামূলক সংগঠনের স্বয়ংক্রিয় এআই সেকেন্ড ব্রেইন হিসেবে রক্তদান, চিকিৎসা সহায়তা, কিস্তি হিসাব, লক ডায়াগনস্টিকস ও প্রযুক্তিগত ট্রাবলশুটিংয়ে সর্বদা নিয়োজিত আছি। /help লিখে আমার ১১টি এজেন্টের বিবরণ দেখতে পারেন।"""

# ৮. একক রানিং লুপ (Main Engine)
def main():
    print("=" * 65)
    print("⚡ মাহফুজুর রহমান AI - একক সিস্টেম ব্যাকএন্ড সফলভাবে চালু হয়েছে...")
    print(f"🔗 টেলিগ্রাম বট লিংক: https://t.me/mahfuzur_rahman_ai_bot")
    print(f"🤖 লাইভ সার্চ (Google Search Retrieval) স্ট্যাটাস: {'সক্রিয়' if GEMINI_API_KEY else 'অফলাইন ব্যাকআপ'}")
    print("=" * 65)

    last_update_id = None
    while True:
        try:
            updates = get_updates(last_update_id)
            if "result" in updates and isinstance(updates["result"], list):
                for update in updates["result"]:
                    last_update_id = update["update_id"] + 1
                    if "message" in update and "text" in update["message"]:
                        chat_id = update["message"]["chat"]["id"]
                        user_query = update["message"]["text"].strip()
                        user_name = update["message"].get("from", {}).get("first_name", "User")
                        
                        print(f"📩 ইনকামিং কমান্ড [{user_name} - {chat_id}]: {user_query}")
                        lower = user_query.lower()
                        
                        # হেল্প বা ফিচার সম্পর্কিত প্রশ্ন
                        is_help = (
                            lower in ["/start", "/help", "help", "start"] or
                            "তুমি কি করতে পারো" in lower or
                            "তোমার ফিচার কি" in lower or
                            "কাজ কি" in lower or
                            "ফিচার" in lower or
                            "এজেন্ট" in lower
                        )
                        
                        if is_help:
                            reply_text = HELP_MESSAGE
                        else:
                            target_tag = detect_agent_tag(user_query)
                            ai_answer = call_gemini_live_search(user_query, target_tag)
                            
                            if ai_answer:
                                if not ai_answer.startswith("🤖 [মাহফুজুর রহমান AI") and not ai_answer.startswith("🌐 [মাহফুজুর রহমান AI"):
                                    reply_text = f"{target_tag}\n\n{ai_answer}"
                                else:
                                    reply_text = ai_answer
                            else:
                                reply_text = generate_fallback_reply(user_query, target_tag)
                        
                        # টেলিগ্রামে উত্তর পাঠানো
                        send_message(chat_id, reply_text)
                        print(f"📤 উত্তর সফলভাবে পাঠানো হয়েছে।")
                        
            time.sleep(1)
        except KeyboardInterrupt:
            print("\nবট বন্ধ করা হয়েছে।")
            break
        except Exception as e:
            print(f"লুপ এরর: {e}")
            time.sleep(3)

if __name__ == "__main__":
    main()
