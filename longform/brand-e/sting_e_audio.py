# Sound for the Reckon sting, direction E: a pencil over paper as the loop is drawn, then a small tick as
# "look closer" lands, over a quiet pad. Synthesised here, so there are no samples and no licences.
import sys
import numpy as np, soundfile as sf, pyloudnorm
SR, D = 48000, 3.5
t = np.arange(int(SR * D)) / SR
rng = np.random.default_rng(11)

def window(a, b, fade=0.05):
    return np.clip((t - a) / fade, 0, 1) * np.clip((b - t) / fade, 0, 1) * ((t >= a) & (t <= b))

# graphite on paper: band-limited noise, fluttering as the lead catches the paper's grain
noise = rng.standard_normal(len(t))
f = np.fft.rfftfreq(len(t), 1 / SR)
scratch = np.fft.irfft(np.fft.rfft(noise) * ((f > 2200) & (f < 7000)), len(t))
scratch /= np.abs(scratch).max()
flutter = 0.55 + 0.45 * np.sin(2 * np.pi * 29 * t + 2.5 * np.sin(2 * np.pi * 2.3 * t))
pencil = scratch * flutter * (0.9 * window(1.1, 1.8) + 0.8 * window(1.6, 2.25))

# the tick as "look closer" lands
t0 = 2.36
tick = np.sin(2 * np.pi * 2300 * (t - t0)) * np.exp(-np.clip(t - t0, 0, None) / 0.012) * (t >= t0)

# a quiet warm pad under the word
pad = (np.sin(2 * np.pi * 196 * t) + 0.5 * np.sin(2 * np.pi * 293.66 * t)) * np.clip(t / 0.6, 0, 1) * np.clip((D - t) / 0.7, 0, 1)

mono = 0.35 * pencil + 0.5 * tick + 0.05 * pad
mono *= np.clip((D - t) / 0.25, 0, 1)
stereo = np.stack([mono, np.roll(mono, 180)], axis=1)
meter = pyloudnorm.Meter(SR)
stereo *= 10 ** ((-18 - meter.integrated_loudness(stereo)) / 20)
stereo *= min(1, 10 ** (-3 / 20) / np.abs(stereo).max())
sf.write(sys.argv[1], stereo.astype('float32'), SR)
print(f'{sys.argv[1]}: {meter.integrated_loudness(stereo):.1f} LUFS, peak {20 * np.log10(np.abs(stereo).max()):.1f} dBFS')
