#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
=============================================================================
🤖 মাহফুজুর রহমান AI — Flask APK সার্ভার ও ব্যাকএন্ড স্ক্রিপ্ট
=============================================================================
আপনার অ্যান্ড্রয়েড ফোন, Termux বা পাইথন সার্ভারে সরাসরি রান করার জন্য:
1. pip install flask
2. python flask_app.py
সার্ভার পোর্ট 5000 বা আপনার নির্দিষ্ট পোর্টে রান হবে এবং
/download/Mahfuzur_Rahman_AI.apk এন্ডপয়েন্ট থেকে APK ফাইল ডেলিভারি করবে।
=============================================================================
"""

import os
from flask import Flask, send_from_directory, jsonify

app = Flask(__name__, static_folder='static')

# APK ফাইল সেভ রাখার ফোল্ডার (প্রজেক্টে static ফোল্ডার তৈরি করে রাখুন)
APK_DIRECTORY = os.path.join(app.root_path, 'static')
APK_FILENAME = 'Mahfuzur_Rahman_AI.apk'

@app.route('/')
def home():
    return jsonify({
        "status": "online",
        "app": "মাহফুজুর রহমান AI (Flask Server)",
        "download_url": "/download/Mahfuzur_Rahman_AI.apk",
        "version": "3.5.0",
        "message": "সার্ভার সক্রিয় রয়েছে। APK ডাউনলোড করতে /download/Mahfuzur_Rahman_AI.apk ভিজিট করুন।"
    })

@app.route('/download/Mahfuzur_Rahman_AI.apk')
def download_app():
    """সরাসরি Mahfuzur_Rahman_AI.apk ফাইল হিসেবে ডেলিভারি হবে"""
    apk_file_path = os.path.join(APK_DIRECTORY, APK_FILENAME)
    
    # যদি ফাইল না থাকে তবে স্বয়ংক্রিয়ভাবে তৈরি করা
    if not os.path.exists(apk_file_path):
        os.makedirs(APK_DIRECTORY, exist_ok=True)
        # ব্যাকআপ লোকাল পাথ চেক
        backup_path = os.path.join(app.root_path, 'public', 'download', APK_FILENAME)
        if os.path.exists(backup_path):
            import shutil
            shutil.copyfile(backup_path, apk_file_path)

    return send_from_directory(
        directory=APK_DIRECTORY,
        path=APK_FILENAME,
        as_attachment=True,
        mimetype='application/vnd.android.package-archive'
    )

@app.route('/api/apk-status')
def apk_status():
    apk_path = os.path.join(APK_DIRECTORY, APK_FILENAME)
    exists = os.path.exists(apk_path)
    size_bytes = os.path.getsize(apk_path) if exists else 0
    return jsonify({
        "available": exists,
        "filename": APK_FILENAME,
        "downloadUrl": "/download/Mahfuzur_Rahman_AI.apk",
        "version": "3.5.0",
        "package": "com.mafhuz.ai",
        "sizeBytes": size_bytes,
        "sizeFormatted": f"{round(size_bytes / 1024)} KB" if size_bytes < 1048576 else f"{round(size_bytes / 1048576, 1)} MB"
    })

if __name__ == '__main__':
    port = int(os.environ.get('FLASK_PORT', 5000))
    print("=" * 65)
    print(f"🤖 মাহফুজুর রহমান AI Flask APK সার্ভার চালু হচ্ছে...")
    print(f"📥 ডাউনলোড লিঙ্ক: http://0.0.0.0:{port}/download/Mahfuzur_Rahman_AI.apk")
    print("=" * 65)
    app.run(host='0.0.0.0', port=port, debug=False)
