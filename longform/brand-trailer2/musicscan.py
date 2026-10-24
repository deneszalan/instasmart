# Loudness and low-end (drum) energy per 2 s, and a tempo estimate, for picking a music section.
import sys, subprocess, numpy as np
SR = 22050
for path in sys.argv[1:]:
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
    x = np.frombuffer(raw, np.float32)
    hop = 512; n = len(x) // hop
    fr = x[:n * hop].reshape(n, hop)
    rms = np.sqrt((fr ** 2).mean(1) + 1e-12)
    spec = np.abs(np.fft.rfft(fr * np.hanning(hop), axis=1))
    f = np.fft.rfftfreq(hop, 1 / SR)
    low = spec[:, f < 150].sum(1); flux = np.maximum(0, np.diff(np.log(spec + 1e-6), axis=0)).sum(1)
    flux = flux - np.convolve(flux, np.ones(43) / 43, 'same')
    ac = np.correlate(flux[:4000], flux[:4000], 'full')[3999:]
    lags = np.arange(len(ac)) * hop / SR; ok = (lags > 0.35) & (lags < 1.0)
    beat = lags[ok][np.argmax(ac[ok])]
    per = int(2 * SR / hop)
    db = [20 * np.log10(rms[i:i + per].mean()) for i in range(0, n - per, per)]
    lo = [20 * np.log10(low[i:i + per].mean() + 1e-9) for i in range(0, n - per, per)]
    print(f'== {path.split("/")[-1]}: {len(x)/SR:.0f} s, beat ≈ {beat:.3f} s ({60/beat:.0f} bpm)')
    print('  loud/2s: ' + ' '.join(f'{v:.0f}' for v in db[:60]))
    print('  low /2s: ' + ' '.join(f'{v - max(lo):.0f}' for v in lo[:60]))
