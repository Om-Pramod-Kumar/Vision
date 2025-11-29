from flask import Flask, render_template, request
import tensorflow as tf
import numpy as np
from tensorflow.keras.utils import load_img, img_to_array
import os
import requests

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = "static/uploads"

# ===============================
# MODEL + CLASS NAMES CONFIG
# ===============================
MODEL_PATH = "model/image_classifier_model.h5"
CLASS_PATH = "model/class_names.npy"

MODEL_URL = "https://www.dropbox.com/scl/fi/xhvefhpfmqqokq6pr5cw0/image_classifier_model.h5?rlkey=854pmzzyp15l3o5647jfzlf7o&raw=1"
CLASS_URL = "https://www.dropbox.com/scl/fi/rcmgebe9vmop0hp0hcend/class_names.npy?rlkey=n59pf984lc41zs7gysa3fpg88&raw=1"

os.makedirs("model", exist_ok=True)

# ===============================
# DOWNLOAD MODEL IF MISSING
# ===============================
if not os.path.exists(MODEL_PATH):
    print("🔥 Model not found. Downloading...")
    r = requests.get(MODEL_URL)
    with open(MODEL_PATH, "wb") as f:
        f.write(r.content)
    print("✅ Model downloaded!")

# ===============================
# DOWNLOAD CLASS NAMES IF MISSING
# ===============================
if not os.path.exists(CLASS_PATH):
    print("🔥 class_names.npy not found. Downloading...")
    r = requests.get(CLASS_URL)
    with open(CLASS_PATH, "wb") as f:
        f.write(r.content)
    print("✅ class_names downloaded!")

# ===============================
# LOAD MODEL + CLASS NAMES
# ===============================
model = tf.keras.models.load_model(MODEL_PATH)
class_names = np.load(CLASS_PATH, allow_pickle=True)

img_size = 128


@app.route('/', methods=['GET'])
def index():
    return render_template('index.html', prediction=None)

@app.route('/predict', methods=['POST'])
def predict():
    file = request.files['image']
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    file.save(file_path)

    img = load_img(file_path, target_size=(img_size, img_size))
    x = img_to_array(img) / 255.0
    x = np.expand_dims(x, axis=0)

    prediction = model.predict(x)[0]
    idx = np.argmax(prediction)
    predicted_class = class_names[idx]
    confidence = round(float(prediction[idx]) * 100, 2)

    return render_template(
        'index.html',
        prediction=predicted_class,
        confidence=confidence,
        image_path=file_path
    )

if __name__ == "__main__":
    app.run(debug=True)
