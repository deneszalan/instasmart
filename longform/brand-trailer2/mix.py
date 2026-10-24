# Sound for the fast-cut Reckon trailer: "Rynos Theme" from its build (26.11 s, on the beat) to the cut, synthesised hits,
# whooshes and pencil sounds on the picture's beats (scene.js), then the voice in near silence.
# Usage: mix.py rynos.wav vo.wav out.wav VO1 VO1_LEN VO2 VO2_LEN DURATION   (times as in scene.js)
import sys, json
import numpy as np, soundfile as sf, pyloudnorm
music_path, vo_path, out_path = sys.argv[1:4]
VO1, VO1_LEN, VO2, VO2_LEN, D = map(float, sys.argv[4:9])
SR = 48000; N = int(SR * D); t = np.arange(N) / SR
rng = np.random.default_rng(31); meter = pyloudnorm.Meter(SR)
B = 60 / 128; ENTRY = 8 * B; SLAM = ENTRY + 16 * B; FAST = SLAM + 4 * B; SHEET = FAST + 12 * B; CUT = SHEET + 4 * B
M0, WHIP = 0.33 + 55 * 0.4688, 0.1
SHOTS = [(ENTRY + j * 4 * B, 4 * B, j > 0) for j in range(4)] + [(FAST + j * 2 * B, 2 * B, j > 0) for j in range(6)]

def band(x, lo, hi):
    f = np.fft.rfftfreq(len(x), 1 / SR)
    return np.fft.irfft(np.fft.rfft(x) * ((f > lo) & (f < hi)), len(x))
def norm(x): return x / np.abs(x).max()
def win(a, b, fade=0.03): return np.clip((t - a) / fade, 0, 1) * np.clip((b - t) / fade, 0, 1) * ((t >= a) & (t <= b))
def env(t0, decay): return np.exp(-np.clip(t - t0, 0, None) / decay) * (t >= t0)

scratch = norm(band(rng.standard_normal(N), 2200, 7000))
flutter = 0.55 + 0.45 * np.sin(2 * np.pi * 29 * t + 2.5 * np.sin(2 * np.pi * 2.3 * t))
low = norm(band(rng.standard_normal(N), 40, 400)); mid = norm(band(rng.standard_normal(N), 300, 3000)); hiss = norm(band(rng.standard_normal(N), 3000, 12000))

def boom(t0, size=1.0, tail=0.6):   # a sub drop with a dull transient
    u = np.clip(t - t0, 0, None); f = 32 + 48 * np.exp(-u / 0.09)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return size * (np.sin(ph) * env(t0, tail) + 0.6 * low * env(t0, 0.05) + 0.25 * mid * env(t0, 0.02))
def hit(t0, size=0.6): return boom(t0, size, 0.18) + size * 0.35 * hiss * env(t0, 0.03)
def whoosh(a, b):   # noise swelling and falling, brighter in the middle
    p = np.clip((t - a) / (b - a), 0, 1) * ((t >= a) & (t <= b))
    return np.sin(np.pi * p) ** 2 * (0.6 * mid + 0.5 * hiss)
def slap(t0): return 0.5 * hiss * env(t0, 0.012) + 0.6 * low * env(t0, 0.03)

pencil = np.zeros(N); fx = np.zeros(N)
# 1. the build: a scribble for each question, the underline, and a riser into the entry
for i in range(8): pencil += win(i * B, i * B + 0.24)
pencil += win(7 * B + 0.18, 7 * B + 0.4)
p = np.clip((t - 1.9) / (ENTRY - 1.9), 0, 1) * (t < ENTRY - 0.01)
fx += 0.5 * p ** 2.5 * (hiss + 0.6 * np.sin(2 * np.pi * np.cumsum(200 + 700 * p ** 2) / SR))
fx += boom(ENTRY, 0.8, 0.7)
# 2 and 4. the frames: whoosh and landing for each whip, a hit for each punch, the pencil, the paper tag
for t0, ln, whip in SHOTS:
    if whip: fx += 0.8 * whoosh(t0 - 0.06, t0 + WHIP + 0.05) + 0.45 * hit(t0 + WHIP, 0.5)
    elif t0 != ENTRY: fx += hit(t0, 0.9)
    a = t0 + (WHIP if whip else 0) + (0.14 if ln > 1 else 0.1)
    pencil += 0.9 * win(a, a + 0.2) + 0.8 * win(a + 0.16, a + 0.32)
    fx += 0.5 * slap(t0 + (WHIP if whip else 0) + (0.34 if ln > 1 else 0.2))
# 3. the slams
fx += hit(SLAM, 1.0) + hit(SLAM + 2 * B, 1.0); pencil += win(SLAM + 3 * B, SLAM + 3 * B + 0.22)
# 5. the contact sheet: cards dropping, the subtitle written, a swell into the cut, and the cut itself
for j in range(10): fx += 0.35 * slap(SHEET + j * 0.12 + 0.1)
pencil += 0.6 * win(SHEET + 1.2, SHEET + 1.6)
p = np.clip((t - (SHEET + 0.9)) / (CUT - SHEET - 0.9), 0, 1) * (t < CUT)
fx += 0.45 * p ** 3 * hiss
fx += boom(CUT, 1.0, 1.4)
# 6. after the cut: a low drone under the voice, the loops round the R, a soft low hit after "look closer"
fx += 0.05 * (np.sin(2 * np.pi * 55 * t) + 0.5 * np.sin(2 * np.pi * 82.5 * t)) * np.clip((t - CUT) / 0.5, 0, 1) * np.clip((D - 0.3 - t) / 1.5, 0, 1) * (t >= CUT)
pencil += 0.9 * win(VO1 + VO1_LEN + 0.05, VO1 + VO1_LEN + 0.4) + 0.8 * win(VO1 + VO1_LEN + 0.3, VO1 + VO1_LEN + 0.62)
fx += 0.5 * boom(VO2 + VO2_LEN + 0.12, 0.6, 1.0)
fx += 0.3 * scratch * flutter * pencil

# the music: from M0, out at the cut with an echo of its last moment ringing on
music, msr = sf.read(music_path, always_2d=True); assert msr == SR
a = int(M0 * SR); music = music[a:a + N].copy()
music *= np.clip(t / 0.25, 0, 1)[:, None]
c = int(CUT * SR); last = music[c - int(0.35 * SR):c].copy()
music[c:] = 0; music[c - int(0.025 * SR):c] *= np.linspace(1, 0, int(0.025 * SR))[:, None]
ir_t = np.arange(int(2.2 * SR)) / SR; ir = rng.standard_normal((len(ir_t), 2)) * np.exp(-ir_t / 0.45)[:, None]
tail = np.stack([np.convolve(last[:, i], ir[:, i])[:len(ir_t)] for i in range(2)], 1)
tail *= 0.3 * np.abs(last).max() / np.abs(tail).max()
music[c:c + len(tail)] += tail[:N - c]

# the voice: each line cut from the recording, a touch of room, placed at VO1 and VO2
vo, vsr = sf.read(vo_path, always_2d=True); vo = vo[:, 0]
vo = np.interp(np.arange(int(len(vo) * SR / vsr)) / SR, np.arange(len(vo)) / vsr, vo)
lines = json.loads(sys.argv[9])   # [[start, length], …] in the recording
voice = np.zeros(N)
for (src, ln), at in zip(lines, [VO1, VO2]):
    s = vo[int(src * SR):int((src + ln) * SR)].copy()
    s *= np.clip(np.arange(len(s)) / (0.008 * SR), 0, 1) * np.clip((len(s) - np.arange(len(s))) / (0.04 * SR), 0, 1)
    voice[int(at * SR):int(at * SR) + len(s)] += s
# compress it a little (3:1 above a third of its peak), as a trailer voice would be, so the limiter leaves it alone
from scipy.ndimage import maximum_filter1d
envl = np.convolve(maximum_filter1d(np.abs(voice), int(0.01 * SR)), np.hanning(int(0.01 * SR)) / np.hanning(int(0.01 * SR)).sum(), 'same')
thr = envl.max() / 3; cg = np.where(envl > thr, (np.maximum(envl, 1e-9) / thr) ** (1 / 3 - 1), 1)
voice *= np.convolve(cg, np.hanning(int(0.02 * SR)) / np.hanning(int(0.02 * SR)).sum(), 'same')
room_t = np.arange(int(1.2 * SR)) / SR; room = rng.standard_normal(len(room_t)) * np.exp(-room_t / 0.25); room[:int(0.02 * SR)] = 0
wet = np.convolve(voice, room)[:N]; voice = voice + 0.12 * wet * np.abs(voice).max() / np.abs(wet).max()

def level(x, lufs):
    x2 = x if x.ndim == 2 else np.stack([x, x], 1)
    return x * 10 ** ((lufs - meter.integrated_loudness(x2)) / 20)
act = np.convolve((np.abs(voice) > 1e-4).astype(float), np.ones(int(0.15 * SR)) / (0.15 * SR), 'same')
fx *= 1 - 0.6 * np.clip(act * 3, 0, 1)   # the effects step back while the voice speaks
music = level(music, -16); fx = level(fx, -19); voice = level(voice, -15)
mix = music + np.stack([voice + fx, voice + np.roll(fx, 120)], 1)
mix = level(mix, -16)
# a look-ahead peak limiter: the gain each sample needs, held for the release time, reached over the attack time
from scipy.ndimage import minimum_filter1d
ceiling = 10 ** (-1.5 / 20); att, rel = int(0.004 * SR), int(0.08 * SR)
need = np.minimum(1, ceiling / np.maximum(np.abs(mix).max(1), 1e-9))
held = minimum_filter1d(need, att + rel, origin=(rel - att) // 2)
gain = np.convolve(np.pad(held, att, mode='edge'), np.hanning(att) / np.hanning(att).sum(), 'same')[att:-att]
print(f'limiter: up to {-20 * np.log10(gain.min()):.1f} dB on {(gain < 0.99).mean() * 100:.1f}% of the time')
mix *= gain[:, None]
mix *= np.clip((D - t) / 0.4, 0, 1)[:, None]
sf.write(out_path, mix.astype('float32'), SR)
print(f'{out_path}: {meter.integrated_loudness(mix):.1f} LUFS, peak {20 * np.log10(np.abs(mix).max()):.1f} dBFS')
