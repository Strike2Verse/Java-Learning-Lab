import javax.sound.sampled.AudioFormat;
import javax.sound.sampled.AudioSystem;
import javax.sound.sampled.SourceDataLine;

public class SoundManager {
    private static final int SAMPLE_RATE = 44100; // Higher quality

    // Volume: 1.0 = High, 0.5 = Mid, 0.0 = Mute
    private static double volumeScale = 0.6;
    private static boolean musicRunning = false;
    private static Thread musicThread = null;

    public static double getVolumeScale() { return volumeScale; }
    public static void setVolumeScale(double v) { volumeScale = Math.max(0, Math.min(1.0, v)); }

    // ── BACKGROUND MUSIC ────────────────────────────────────────────────────────
    // Catchy chiptune arpeggio melody — upbeat, ringy, fun
    public static void startBackgroundMusic() {
        if (musicRunning) return;
        musicRunning = true;

        musicThread = new Thread(() -> {
            // Fun arpeggio melody (frequencies in Hz)
            // Sounds like classic 8-bit chiptune — catchy, ringy, upbeat
            double[] melody = {
                523, 659, 784, 1047,   // C5 E5 G5 C6  (up)
                784, 659, 523, 392,    // G5 E5 C5 G4  (down)
                440, 554, 659, 880,    // A4 C#5 E5 A5 (up)
                659, 554, 440, 330,    // E5 C#5 A4 E4 (down)
                349, 440, 523, 698,    // F4 A4 C5 F5  (up)
                523, 440, 349, 262,    // C5 A4 F4 C4  (down)
                392, 494, 587, 784,    // G4 B4 D5 G5  (up)
                587, 494, 392, 294,    // D5 B4 G4 D4  (down)
            };
            int[] durations = {
                110, 110, 110, 180,
                110, 110, 110, 300,
                110, 110, 110, 180,
                110, 110, 110, 300,
                110, 110, 110, 180,
                110, 110, 110, 300,
                110, 110, 110, 180,
                110, 110, 110, 400,
            };

            int idx = 0;
            while (musicRunning) {
                if (volumeScale > 0.01) {
                    playBell(melody[idx], durations[idx], 0.045);
                }
                try {
                    Thread.sleep(durations[idx] + 15);
                } catch (InterruptedException e) { break; }
                idx = (idx + 1) % melody.length;
            }
        });
        musicThread.setDaemon(true);
        musicThread.start();
    }

    public static void stopBackgroundMusic() {
        musicRunning = false;
        if (musicThread != null) musicThread.interrupt();
    }

    // ── CORE SOUND GENERATORS ───────────────────────────────────────────────────

    // Bell tone: fast attack, slow exponential decay — "ringy" feeling
    public static void playBell(double freq, int durationMs, double vol) {
        double finalVol = vol * volumeScale;
        if (finalVol <= 0) return;

        new Thread(() -> {
            try {
                int length = SAMPLE_RATE * durationMs / 1000;
                byte[] buf = new byte[length];
                for (int i = 0; i < length; i++) {
                    double t = i / (double) SAMPLE_RATE;
                    double frac = i / (double) length;
                    // Bell envelope: fast attack (5ms), exponential decay
                    double attack = Math.min(1.0, i / (SAMPLE_RATE * 0.005));
                    double decay = Math.exp(-frac * 5.0);
                    double envelope = attack * decay;
                    // Slightly detuned harmonics for richness
                    double wave = 0.7 * Math.sin(2 * Math.PI * freq * t)
                                + 0.2 * Math.sin(2 * Math.PI * freq * 2.0 * t)
                                + 0.1 * Math.sin(2 * Math.PI * freq * 3.01 * t);
                    buf[i] = clampByte(wave * finalVol * envelope * 100);
                }
                playBuffer(buf);
            } catch (Exception ignored) {}
        }).start();
    }

    // Sweep: frequency glide (used for whoosh/damage/teleport effects)
    public static void playSweep(double f1, double f2, int ms, double vol, String wave) {
        double finalVol = vol * volumeScale;
        if (finalVol <= 0) return;

        new Thread(() -> {
            try {
                int length = SAMPLE_RATE * ms / 1000;
                byte[] buf = new byte[length];
                for (int i = 0; i < length; i++) {
                    double frac = i / (double) length;
                    double freq = f1 + (f2 - f1) * frac;
                    double t = i / (double) SAMPLE_RATE;
                    double envelope = 1.0 - frac;
                    double sample;
                    if (wave.equals("square")) {
                        sample = Math.signum(Math.sin(2 * Math.PI * freq * t));
                    } else if (wave.equals("triangle")) {
                        sample = 2.0 / Math.PI * Math.asin(Math.sin(2 * Math.PI * freq * t));
                    } else {
                        sample = Math.sin(2 * Math.PI * freq * t);
                    }
                    buf[i] = clampByte(sample * finalVol * envelope * 120);
                }
                playBuffer(buf);
            } catch (Exception ignored) {}
        }).start();
    }

    private static void playBuffer(byte[] buf) throws Exception {
        AudioFormat fmt = new AudioFormat(SAMPLE_RATE, 8, 1, true, true);
        SourceDataLine line = AudioSystem.getSourceDataLine(fmt);
        line.open(fmt, buf.length);
        line.start();
        line.write(buf, 0, buf.length);
        line.drain();
        line.close();
    }

    private static byte clampByte(double val) {
        return (byte) Math.max(-127, Math.min(127, (int) val));
    }

    // ── GAME SOUND EFFECTS ──────────────────────────────────────────────────────

    // Move: crisp high bell ping
    public static void playMove() {
        playBell(880, 80, 0.18);
    }

    // Boost pickup: rising arpeggio — very satisfying "ding-ding-ding!"
    public static void playBoost() {
        new Thread(() -> {
            try {
                playBell(523, 70, 0.30);
                Thread.sleep(65);
                playBell(659, 70, 0.30);
                Thread.sleep(65);
                playBell(784, 70, 0.30);
                Thread.sleep(65);
                playBell(1047, 160, 0.35);
            } catch (Exception ignored) {}
        }).start();
    }

    // Damage/corrupt: crunchy descending buzz
    public static void playDamage() {
        new Thread(() -> {
            try {
                playSweep(300, 80, 80, 0.45, "square");
                Thread.sleep(60);
                playSweep(200, 50, 100, 0.35, "square");
            } catch (Exception ignored) {}
        }).start();
    }

    // Teleport: sci-fi laser zap rising sweep
    public static void playTeleport() {
        playSweep(300, 1800, 200, 0.28, "triangle");
    }

    // Blocked: short harsh buzz
    public static void playBlocked() {
        playSweep(120, 80, 120, 0.40, "square");
    }

    // Timer warning: urgent beeping pulse
    public static void playTimerWarn() {
        playBell(1100, 60, 0.20);
    }

    // Win: triumphant major fanfare
    public static void playWin() {
        new Thread(() -> {
            try {
                playBell(523, 80, 0.35);  Thread.sleep(75);
                playBell(659, 80, 0.35);  Thread.sleep(75);
                playBell(784, 80, 0.35);  Thread.sleep(75);
                playBell(1047, 90, 0.40); Thread.sleep(85);
                playBell(1175, 90, 0.40); Thread.sleep(85);
                playBell(1319, 300, 0.50);
            } catch (Exception ignored) {}
        }).start();
    }

    // Game over: descending sad arpeggio
    public static void playLose() {
        new Thread(() -> {
            try {
                playBell(523, 120, 0.35); Thread.sleep(110);
                playBell(440, 120, 0.35); Thread.sleep(110);
                playBell(349, 120, 0.35); Thread.sleep(110);
                playBell(262, 300, 0.40);
            } catch (Exception ignored) {}
        }).start();
    }

    // Combo: short rising double ping
    public static void playCombo() {
        new Thread(() -> {
            try {
                playBell(880,  60, 0.22); Thread.sleep(55);
                playBell(1175, 90, 0.28);
            } catch (Exception ignored) {}
        }).start();
    }

    // Timer out: alarm-like rapid pulses
    public static void playTimeUp() {
        new Thread(() -> {
            try {
                for (int i = 0; i < 4; i++) {
                    playSweep(900, 400, 100, 0.45, "square");
                    Thread.sleep(120);
                }
            } catch (Exception ignored) {}
        }).start();
    }
}
