# 🤖 মাহফুজুর রহমান AI — Native Android (Kotlin + Jetpack Compose) প্রজেক্ট গাইড

এই ফোল্ডারে "মাহফুজুর রহমান AI" এর জন্য তৈরি করা সম্পূর্ণ Native Android প্রজেক্টের সোর্স কোড সংরক্ষিত রয়েছে।

## 📱 প্রজেক্ট আর্কিটেকচার
- **ভাষা:** Kotlin
- **UI ফ্রেমওয়ার্ক:** Jetpack Compose (Material 3)
- **প্যাকেজ নাম:** `com.mafhuz.ai`
- **টার্গেট SDK:** Android 34 (Android 14)
- **মিনিমাম SDK:** Android 24 (Android 7.0+)
- **APK ফাইলের নাম:** `Mahfuzur_Rahman_AI.apk`

---

## 🛠️ Android Studio-তে ওপেন ও APK বিল্ড করার ধাপ:

### ধাপ ১: প্রজেক্ট ওপেন করুন
1. আপনার কম্পিউটারে **Android Studio (Iguana / Jellyfish / Ladybug বা নতুন সংস্করণ)** চালু করুন।
2. **Open** এ ক্লিক করে এই `android` ফোল্ডারটি সিলেক্ট করুন।
3. Gradle Sync স্বয়ংক্রিয়ভাবে সব ডিপেন্ডেন্সি ডাউনলোড করবে।

### ধাপ ২: APK বিল্ড ও এক্সপোর্ট করুন
1. Android Studio-এর উপরের মেনু থেকে:
   **Build > Build Bundle(s) / APK(s) > Build APK(s)** এ ক্লিক করুন।
2. বিল্ড সম্পন্ন হলে নিচের ডান কোনায় নোটিফিকেশন আসবে:
   `APK(s) generated successfully for 1 module: 'app'. locate`
3. **locate** লিংকে ক্লিক করলে আপনি সরাসরি `Mahfuzur_Rahman_AI.apk` ফাইলটি পাবেন।

### ধাপ ৩: টার্মিনাল বা কমান্ড লাইন দিয়ে এক ক্লিকে বিল্ড:
```bash
# Debug APK তৈরি
./gradlew assembleDebug

# Release APK তৈরি (Mahfuzur_Rahman_AI.apk)
./gradlew assembleRelease
```
তৈরিকৃত APK ফাইলের লোকেশন:
`android/app/build/outputs/apk/release/app-release-unsigned.apk` -> রিনেম করুন `Mahfuzur_Rahman_AI.apk`।

---

## 🔗 সরাসরি ডাউনলোড বিকল্প (Web / PWA)
আপনি যদি কোনো কম্পিউটার বা Android Studio ছাড়া সরাসরি ফোনে ব্যবহার করতে চান:
1. অ্যাপের **“মাহফুজুর রহমান AI ডাউনলোড করুন”** বাটনে ক্লিক করে সরাসরি `Mahfuzur_Rahman_AI.apk` ডাউনলোড করুন।
2. অথবা Chrome ব্রাউজারে সাইটটি খুলে থ্রি-ডট (⋮) থেকে **“Install app” / “Add to Home screen”** এ চাপুন।
