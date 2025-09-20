from flask import Flask, request, Response
import os

app = Flask(__name__)

LOG_DIR = '/storage'
os.makedirs(LOG_DIR, exist_ok=True)
LOG_FILE = os.path.join(LOG_DIR, 'logs.txt')

@app.route('/log', methods=['POST'])
def add_log():
    record = request.get_data(as_text=True)
    if not record:
        return "No data received", 400
    with open(LOG_FILE, 'a', encoding='utf-8') as f:
        f.write(record.strip() + '\n')
    return 'OK', 201

@app.route('/log', methods=['GET'])
def get_log():
    if not os.path.exists(LOG_FILE):
        return Response('', mimetype='text/plain')
    with open(LOG_FILE, 'r', encoding='utf-8') as f:
        content = f.read()
    return Response(content, mimetype='text/plain')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)