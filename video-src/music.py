# Synthesizes a soft ambient bed + a few SFX, then mixes with the voiceover lines.
import numpy as np, wave, sys
SR = 44100; DUR = 73.0
N = int(SR * DUR); t = np.arange(N) / SR
def note(n): return 440.0 * 2 ** ((n - 69) / 12)
def env(start, end, a=1.5, r=1.5):
    e = np.zeros(N); i0, i1 = int(start * SR), min(int(end * SR), N)
    seg = np.arange(i1 - i0) / SR; L = (i1 - i0) / SR
    e[i0:i1] = np.minimum(1, seg / a) * np.minimum(1, np.maximum(0, (L - seg) / r)); return e
def pad(freqs, start, end, vol):
    out = np.zeros(N); e = env(start, end)
    for f in freqs:
        for h, g in ((1, 1), (2, .35), (3, .12)):
            out += g * np.sin(2 * np.pi * f * h * t + np.sin(2 * np.pi * 0.2 * t) * 0.3)
    return out * e * vol / len(freqs)
mus = np.zeros(N)
# warm/neutral intro (install), tense minor (problem), hopeful major (reveal → end)
prog = [
  (0, 10.8, [57, 64, 69, 72], .10),     # A minor-ish airy
  (10.6, 17.6, [53, 60, 65, 68], .10),  # F minor color (on your own)
  (17.4, 26.9, [50, 57, 62, 65], .11),  # D minor
  (26.7, 33.2, [52, 59, 64, 67], .11),  # E minor
  (33.0, 39.0, [48, 55, 64, 67, 72], .13),  # C major lift
  (38.8, 47.8, [53, 60, 65, 69, 72], .13),  # F major
  (47.6, 57.8, [55, 62, 67, 71, 74], .13),  # G major
  (57.6, 65.0, [57, 64, 69, 72, 76], .12),  # A minor 7
  (64.8, 73.0, [48, 55, 64, 67, 72, 76], .14),  # C major resolve
]
for s, e, ns, v in prog: mus += pad([note(n) for n in ns], s, e, v)
# gentle pulse after the reveal
for beat in np.arange(35.0, 70.0, 0.5):
    i = int(beat * SR); L = int(0.25 * SR)
    if i + L > N: break
    k = np.arange(L) / SR
    mus[i:i+L] += 0.10 * np.sin(2 * np.pi * (60 + 40 * np.exp(-k * 30)) * k) * np.exp(-k * 14)
def sfx_click(at, vol=.35):
    i = int(at * SR); L = int(0.06 * SR); k = np.arange(L) / SR
    mus[i:i+L] += vol * np.random.default_rng(1).standard_normal(L) * np.exp(-k * 120)
def sfx_blip(at, f, vol=.12):
    i = int(at * SR); L = int(0.12 * SR); k = np.arange(L) / SR
    mus[i:i+L] += vol * np.sin(2 * np.pi * f * k) * np.exp(-k * 30)
def sfx_thud(at, vol=.5):
    i = int(at * SR); L = int(0.35 * SR); k = np.arange(L) / SR
    mus[i:i+L] += vol * np.sin(2 * np.pi * (55 + 60 * np.exp(-k * 25)) * k) * np.exp(-k * 12)
sfx_click(2.4); sfx_click(2.9, .2); sfx_click(3.4, .2)
for at, f in ((4.0, 880), (4.6, 988), (4.9, 1175), (5.1, 1319)): sfx_blip(at, f)
sfx_thud(10.25)
def sfx_whoosh(at, d=0.9, vol=.12):
    i = int(at * SR); L = int(d * SR); k = np.arange(L) / L
    n = np.random.default_rng(2).standard_normal(L); n = np.convolve(n, np.ones(30) / 30, 'same')
    mus[i:i+L] += vol * n * np.sin(np.pi * k) * 3
sfx_whoosh(13.4); sfx_whoosh(33.0, 1.4); sfx_whoosh(42.8, .6)
for i, at in enumerate((58.6, 59.3, 60.3, 61.2, 62.6)): sfx_blip(at, 1047 + i * 120, .08)
def read(p):
    w = wave.open(p); a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32768; return a
vo = np.zeros(N)
cues = [('l01', 5.0), ('l02', 10.8), ('l03', 13.4), ('l04', 17.8), ('l05', 27.0), ('l06', 33.4), ('l07', 34.9),
        ('l08', 38.8), ('l09', 47.9), ('l10', 57.8), ('l11', 64.9)]
for name, at in cues:
    a = read(f'vo/{name}.wav'); i = int(at * SR); vo[i:i+len(a)] += a[:N-i]
# duck music under voice
v_env = np.convolve(np.abs(vo), np.ones(int(.3 * SR)) / int(.3 * SR), 'same')
duck = 1 - 0.45 * np.clip(v_env / (v_env.max() * .25), 0, 1)
fade = np.minimum(1, t / 0.6) * np.minimum(1, (DUR - t) / 1.2)
mix = (mus * duck * 0.9 + vo * 1.0) * fade
mix /= max(1e-9, np.abs(mix).max()) / 0.89
out = wave.open(sys.argv[1], 'w'); out.setnchannels(1); out.setsampwidth(2); out.setframerate(SR)
out.writeframes((mix * 32767).astype(np.int16).tobytes()); out.close()
print('audio ok')
