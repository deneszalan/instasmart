# Sound for the Reckon trailer: "Dreamy Flashback" under synthesised paper and pencil sounds that follow the
# picture (scene.js), and the two voice lines. Usage: mix.py music.wav vo-measure.wav out.wav
import sys
import numpy as np, soundfile as sf, pyloudnorm
SR, D = 48000, 33.0
N = int(SR * D)
t = np.arange(N) / SR
rng = np.random.default_rng(23)
meter = pyloudnorm.Meter(SR)
START, STEP, CARDS = 0.25, 2.25, 10

def win(a, b, fade=0.05):
    return np.clip((t - a) / fade, 0, 1) * np.clip((b - t) / fade, 0, 1) * ((t >= a) & (t <= b))

def band(x, lo, hi):
    f = np.fft.rfftfreq(len(x), 1 / SR)
    return np.fft.irfft(np.fft.rfft(x) * ((f > lo) & (f < hi)), len(x))

# graphite on paper: band-limited noise that flutters as the lead catches the grain
scratch = band(rng.standard_normal(N), 2200, 7000); scratch /= np.abs(scratch).max()
flutter = 0.55 + 0.45 * np.sin(2 * np.pi * 29 * t + 2.5 * np.sin(2 * np.pi * 2.3 * t))
# a sheet landing on the pile: a short low thump with a soft papery top
thud = band(rng.standard_normal(N), 60, 900); thud /= np.abs(thud).max()
rustle = band(rng.standard_normal(N), 1500, 6000); rustle /= np.abs(rustle).max()

def env(t0, decay):
    return np.exp(-np.clip(t - t0, 0, None) / decay) * (t >= t0)

pencil = np.zeros(N); paper = np.zeros(N)
for i in range(CARDS):
    cs = START + i * STEP
    paper += 0.9 * thud * env(cs + 0.18, 0.045) + 0.35 * rustle * env(cs + 0.15, 0.09)
    # the loop's two passes (doubleLoop): 0–62 % and 50–100 % of cs+0.4 … cs+1.05
    pencil += 0.9 * win(cs + 0.4, cs + 0.8) + 0.8 * win(cs + 0.73, cs + 1.05)
# the ten cards slide into the contact sheet
paper += 0.5 * rustle * win(22.75, 24.3, 0.3) * (0.6 + 0.4 * np.sin(2 * np.pi * 7 * t))
# the sting (27 s on): two loops round the R, then a tick as "look closer" lands
pencil += 0.9 * win(28.1, 28.75) + 0.8 * win(28.6, 29.2)
tick = np.sin(2 * np.pi * 2300 * (t - 29.36)) * env(29.36, 0.012)
fx = 0.32 * scratch * flutter * pencil + 0.5 * paper + 0.45 * tick

# voice: the two lines, cut from the measured recording (cue start, length) and placed under the picture
vo_src, vsr = sf.read(sys.argv[2], always_2d=True)
assert vsr == 24000
vo_src = np.interp(np.arange(int(len(vo_src) * SR / vsr)) / SR, np.arange(len(vo_src)) / vsr, vo_src[:, 0])
voice = np.zeros(N)
for (src, length), at in [((1.0, 2.85), 23.3), ((31.0, 1.46), 29.45)]:
    a = int(src * SR); clip = vo_src[a:a + int(length * SR)].copy()
    fade = np.clip(np.arange(len(clip)) / (0.01 * SR), 0, 1) * np.clip((len(clip) - np.arange(len(clip))) / (0.03 * SR), 0, 1)
    voice[int(at * SR):int(at * SR) + len(clip)] += clip * fade
speaking = np.abs(voice) > 0
duck = np.convolve(speaking.astype(float), np.ones(int(0.25 * SR)) / (0.25 * SR), 'same')   # smooth on and off
duck = np.clip(duck * 3, 0, 1)

music, msr = sf.read(sys.argv[1], always_2d=True)
assert msr == SR
music = music[:N]
music *= np.clip(t / 0.4, 0, 1)[:, None] * np.clip((D - t) / 1.6, 0, 1)[:, None]   # out with the picture
music *= (1 - 0.6 * duck)[:, None]   # about −8 dB under the voice

def level(x, lufs):
    x2 = x if x.ndim == 2 else np.stack([x, x], 1)
    return x * 10 ** ((lufs - meter.integrated_loudness(x2)) / 20)

voice = level(voice, -17)
fx = level(fx, -25)
music = level(music, -19)
mix = music + np.stack([voice + fx, voice + np.roll(fx, 160)], 1)
mix = level(mix, -16)
peak = np.abs(mix).max(); ceiling = 10 ** (-1.5 / 20)
if peak > ceiling:   # gentle soft-knee limit on the few peaks above the ceiling
    mix = np.where(np.abs(mix) > ceiling * 0.8, np.sign(mix) * (ceiling * 0.8 + ceiling * 0.2 * np.tanh((np.abs(mix) - ceiling * 0.8) / (ceiling * 0.2))), mix)
sf.write(sys.argv[3], mix.astype('float32'), SR)
print(f'{sys.argv[3]}: {meter.integrated_loudness(mix):.1f} LUFS, peak {20 * np.log10(np.abs(mix).max()):.1f} dBFS')
