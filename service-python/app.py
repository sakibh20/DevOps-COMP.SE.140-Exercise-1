from flask import Flask, Response
import requests, os, time, datetime, shutil

app = Flask(__name__)
start_time = time.time()

VOLUME_PATH = '/vStorage'
os.makedirs(VOLUME_PATH, exist_ok=True)
LOG_FILE = os.path.join(VOLUME_PATH, 'logs.txt')

STORAGE_URL = 'http://storage:5000/log'

def get_timestamp2():
    uptime_hours = "{:.2f}".format((time.time() - start_time)/3600)
    total, used, free = shutil.disk_usage('/')
    free_mb = round(free/(1024*1024))
    time_stamp = datetime.datetime.utcnow().replace(microsecond=0).isoformat() + 'Z'
    return f"Timestamp2: {time_stamp}: uptime {uptime_hours} hours, free disk in root: {free_mb} MBytes"

def log_to_vstorage(record):
    with open(LOG_FILE, 'a', encoding='utf-8') as f:
        f.write(record + '\n')

def post_to_storage(record):
    try:
        requests.post(STORAGE_URL, data=record, headers={'Content-Type': 'text/plain'}, timeout=2)
    except Exception as e:
        print(f"Could not POST to Storage: {e}")

@app.route('/status', methods=['GET'])
def status():
    ts2 = get_timestamp2()
    post_to_storage(ts2)
    log_to_vstorage(ts2)
    return Response(ts2, mimetype='text/plain')

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
