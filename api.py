from flask import Flask, request, send_file
from PIL import Image
import os
import time
from threading import Timer

app = Flask(__name__)

UPLOAD_FOLDER = 'uploads'
OUTPUT_FOLDER = 'enhanced'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

def delete_file_later(file_path, delay=180):
    Timer(delay, lambda: os.remove(file_path) if os.path.exists(file_path) else None).start()

@app.route('/enhance', methods=['POST'])
def enhance_image():
    if 'image' not in request.files:
        return {'error': 'No image uploaded'}, 400

    image = request.files['image']
    if image.filename == '':
        return {'error': 'Empty filename'}, 400

    input_path = os.path.join(UPLOAD_FOLDER, image.filename)
    output_path = os.path.join(OUTPUT_FOLDER, f"{int(time.time())}_{image.filename}")

    image.save(input_path)

    try:
        img = Image.open(input_path)
        img = img.resize((2000, int(img.height * (2000 / img.width))))  # Resize width to 2000px
        img.save(output_path, 'JPEG', quality=90)

        delete_file_later(input_path)
        delete_file_later(output_path)

        return send_file(output_path, mimetype='image/jpeg')
    except Exception as e:
        return {'error': str(e)}, 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
