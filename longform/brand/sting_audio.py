# The sting's sound, synthesised (no samples, so no licence): whoosh, two pops, a bell arpeggio, a warm pad.
import sys
import numpy as np, soundfile as sf, pyloudnorm
SR, D = 48000, 3.5
t = np.arange(int(SR * D)) / SR
out = np.zeros_like(t)
rng = np.random.default_rng(7)
def env(t0, a, d):  # attack a, exponential decay d, from t0
    x = t - t0
    return np.where(x < 0, 0, np.where(x < a, x / a, np.exp(-(x - a) / d)))
# whoosh: noise through a band that sweeps upward
noise = rng.standard_normal(len(t))
spec = np.fft.rfft(noise * np.clip(1 - np.abs(t - 0.28) / 0.3, 0, 1) ** 2)
f = np.fft.rfftfreq(len(t), 1 / SR)
spec *= np.exp(-((np.log(f + 1) - np.log(1800)) ** 2) / 0.8)
out += 0.18 * np.fft.irfft(spec, len(t))
# pops as the icon and the question mark land
for t0, hz in ((0.32, 620), (0.6, 930)):
    out += 0.35 * np.sin(2 * np.pi * hz * (t - t0) * (1 + 0.4 * np.exp(-(t - t0).clip(0) / 0.02))) * env(t0, 0.003, 0.045)
# bell arpeggio (A major) as the wordmark writes
for i, hz in enumerate((880.0, 1108.73, 1318.51, 1760.0)):
    t0 = 1.0 + 0.085 * i
    for mult, amp, dec in ((1, 1.0, 0.9), (2.0, 0.35, 0.35), (3.01, 0.18, 0.18)):
        out += 0.16 * amp * np.sin(2 * np.pi * hz * mult * (t - t0)) * env(t0, 0.004, dec)
# warm pad underneath
pad = sum(np.sin(2 * np.pi * hz * t) for hz in (220.0, 329.63, 440.0)) / 3
out += 0.12 * pad * np.clip(t / 0.9, 0, 1) * np.clip((3.4 - t) / 0.9, 0, 1)
out *= np.clip((D - t) / 0.55, 0, 1)                     # fade with the picture
stereo = np.stack([out, np.roll(out, 240)], axis=1)        # a touch of width
meter = pyloudnorm.Meter(SR)
stereo *= 10 ** ((-18 - meter.integrated_loudness(stereo)) / 20)
peak = np.abs(stereo).max(); stereo *= min(1, 10 ** (-3 / 20) / peak)
sf.write(sys.argv[1], stereo.astype('float32'), SR)
print(f'{sys.argv[1]}: {meter.integrated_loudness(stereo):.1f} LUFS, peak {20 * np.log10(np.abs(stereo).max()):.1f} dBFS')
