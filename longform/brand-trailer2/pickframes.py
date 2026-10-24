# Pick varied, busy frames from across each long video for the pile (not near-duplicates of each other or the hero frames).
import subprocess, sys, json
import numpy as np
O, D, PER, HERO = sys.argv[1], sys.argv[2], int(sys.argv[3]), sys.argv[4]   # videos, output folder, frames per video, hero frames
vids = ['the-birthday-problem', 'why-the-sky-is-blue', 'eratosthenes-measures-the-earth', 'the-four-stroke-engine', 'kepler-equal-areas',
        'the-double-slit-experiment', 'public-key-cryptography', 'enigma-never-itself', 'mendels-peas', 'zeno-achilles-and-the-tortoise']
heroes = [np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', f'{HERO}/{i:02d}.jpg', '-vf', 'scale=160:90', '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], capture_output=True).stdout, np.uint8).astype(float).reshape(90, 160) for i in range(1, 11)]
picked = []
for v in vids:
    path = f'{O}/{v}.mp4'
    dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path], capture_output=True, text=True).stdout)
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-vf', 'fps=1/5,scale=160:90', '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], capture_output=True).stdout
    fr = np.frombuffer(raw, np.uint8).astype(float).reshape(-1, 90, 160)
    ts = np.arange(len(fr)) * 5.0
    ok = (ts > 25) & (ts < dur - 40)
    edges = np.abs(np.diff(fr, axis=1)).mean((1, 2)) + np.abs(np.diff(fr, axis=2)).mean((1, 2))
    score = np.where(ok, edges, -1)
    chosen = []
    for i in np.argsort(-score):
        if score[i] < 0 or len(chosen) >= PER: break
        if any(abs(ts[i] - ts[j]) < 25 for j in chosen): continue
        if any(np.abs(fr[i] - fr[j]).mean() < 7 for j in chosen) or any(np.abs(fr[i] - h).mean() < 7 for h in heroes): continue
        chosen.append(i)
    for n, i in enumerate(sorted(chosen)):
        name = f'{v[:12]}-{n}'
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', str(ts[i] + 2.5), '-i', path, '-frames:v', '1', '-vf', 'scale=800:450', '-q:v', '4', f'{D}/{name}.jpg'])
        picked.append([name, v, float(ts[i] + 2.5)])
    print(v, [round(float(ts[i] + 2.5), 1) for i in sorted(chosen)])
json.dump(picked, open(f'{D}/picked.json', 'w'), indent=0)
