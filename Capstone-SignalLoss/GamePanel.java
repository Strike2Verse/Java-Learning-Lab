import java.awt.*;
import java.awt.event.*;
import java.util.*;
import java.util.List;
import javax.swing.*;

public class GamePanel extends JPanel implements KeyListener, MouseListener, MouseMotionListener {

    // ── ENUMS & INNER CLASSES ────────────────────────────────────────────────────
    public enum GameState { MENU, PLAYING, GAMEOVER, WIN }

    static class Particle {
        double x, y, vx, vy, life, maxLife, size;
        Color color;
        Particle(double x, double y, Color c) {
            this.x = x; this.y = y;
            double angle = Math.random() * Math.PI * 2;
            double speed = 1.5 + Math.random() * 5;
            vx = Math.cos(angle) * speed;
            vy = Math.sin(angle) * speed;
            maxLife = life = 25 + Math.random() * 35;
            size = 3 + Math.random() * 7;
            color = c;
        }
        void update() { x += vx; y += vy; vy += 0.12; life--; vx *= 0.95; vy *= 0.95; }
        boolean dead() { return life <= 0; }
        float alpha() { return (float) Math.max(0, Math.min(1, life / maxLife)); }
    }

    static class FloatText {
        String text; double x, y; int life; Color color; float size;
        FloatText(String t, double x, double y, Color c, float s) {
            text = t; this.x = x; this.y = y; life = 70; color = c; size = s;
        }
        void update() { y -= 1.2; life--; }
        boolean dead() { return life <= 0; }
        float alpha() { return (float) Math.max(0, Math.min(1, life / 40f)); }
    }

    static class Btn {
        final String text; final int x, y, w, h; final Color col;
        Btn(String t, int x, int y, int w, int h, Color c) {
            text = t; this.x = x; this.y = y; this.w = w; this.h = h; col = c;
        }
        boolean hit(Point p) { return p != null && p.x >= x && p.x <= x+w && p.y >= y && p.y <= y+h; }
    }

    // ── CONSTANTS ────────────────────────────────────────────────────────────────
    static final int W = 1100, H = 700;
    static final Color CYAN   = new Color(0, 229, 255);
    static final Color GREEN  = new Color(0, 235, 120);
    static final Color RED    = new Color(255, 45, 85);
    static final Color PURPLE = new Color(200, 60, 255);
    static final Color AMBER  = new Color(255, 190, 0);
    static final Color BG     = new Color(4, 7, 16);

    // Game timer — seconds per level
    static final int LEVEL_TIME_SECONDS = 45;

    // ── STATE ────────────────────────────────────────────────────────────────────
    private List<Node>      nodes       = new ArrayList<>();
    private Packet          packet;
    private GameState       state       = GameState.MENU;
    private List<Particle>  particles   = new ArrayList<>();
    private List<FloatText> floatTexts  = new ArrayList<>();
    private Point           mousePos    = new Point(0, 0);
    private Node            hoveredNode;
    private int             frame       = 0;
    private int             score       = 0;
    private int             level       = 1;
    private int             highScore   = 0;

    // Timer
    private int   timerTicks  = LEVEL_TIME_SECONDS * 60; // in render frames (60fps)
    private int   timerWarnAt = 10 * 60; // warn last 10 seconds

    // Combo
    private int   combo         = 0;
    private int   comboShowLife = 0;
    private long  lastMoveTime  = 0;
    static final long COMBO_WINDOW_MS = 1500; // moves within 1.5s = combo

    // Screen flash
    private Color flashColor = null;
    private int   flashLife  = 0;
    private int   shakeFrames = 0, shakeX = 0, shakeY = 0;

    // Solve
    private List<Node> solutionPath;

    // ── BUTTONS ─────────────────────────────────────────────────────────────────
    // Menu
    Btn btnStart = new Btn("PLAY",           400, 310, 300, 58, CYAN);
    Btn btnNew   = new Btn("RANDOM PUZZLE",  400, 385, 300, 58, PURPLE);
    Btn btnVol   = new Btn("VOLUME",         400, 460, 300, 58, AMBER);
    Btn btnExit  = new Btn("EXIT",           400, 535, 300, 58, RED);
    // HUD
    Btn hudMenu  = new Btn("MENU",  10, 10, 72, 32, CYAN);
    Btn hudReset = new Btn("RESET", 90, 10, 72, 32, AMBER);
    Btn hudNew2  = new Btn("NEW",  170, 10, 72, 32, PURPLE);
    Btn hudQuit  = new Btn("QUIT", W-82, 10, 72, 32, RED);

    // ── CONSTRUCTOR ─────────────────────────────────────────────────────────────
    public GamePanel() {
        setPreferredSize(new Dimension(W, H));
        setBackground(BG);
        setFocusable(true);
        addKeyListener(this);
        addMouseListener(this);
        addMouseMotionListener(this);
        SoundManager.startBackgroundMusic();
        initGrid();
        new javax.swing.Timer(16, e -> tick()).start();
    }

    // ── TICK ─────────────────────────────────────────────────────────────────────
    private void tick() {
        frame++;
        particles.removeIf(Particle::dead);
        particles.forEach(Particle::update);
        floatTexts.removeIf(FloatText::dead);
        floatTexts.forEach(FloatText::update);
        if (flashLife > 0) flashLife--;
        if (shakeFrames > 0) {
            shakeFrames--;
            shakeX = (int)((Math.random()-0.5)*12);
            shakeY = (int)((Math.random()-0.5)*12);
        } else { shakeX = 0; shakeY = 0; }
        if (comboShowLife > 0) comboShowLife--;

        // Timer countdown (only while playing and not dead/won)
        if (state == GameState.PLAYING && packet != null && !packet.isDead() && !packet.isReachedExit()) {
            if (timerTicks > 0) {
                timerTicks--;
                // Warn at 10s, 5s, each second after 5s
                if (timerTicks == timerWarnAt) SoundManager.playTimerWarn();
                if (timerTicks <= 5*60 && timerTicks % 60 == 0) SoundManager.playTimerWarn();
                // Time up
                if (timerTicks == 0) {
                    packet.setDeadlocked(true);
                    SoundManager.playTimeUp();
                    flash(new Color(255, 80, 0), 30);
                    shake(25);
                    addFloat("TIME'S UP!", W/2, H/2-60, RED, 32);
                }
            }
        }

        // Menu ambient particles
        if (state == GameState.MENU && frame % 5 == 0) {
            particles.add(new Particle(Math.random()*W, Math.random()*H,
                new Color(0, 180+rng.nextInt(50), 220+rng.nextInt(35))));
        }

        repaint();
    }

    private final Random rng = new Random();

    // ── GRID ─────────────────────────────────────────────────────────────────────
    private void initGrid() {
        nodes.clear();
        Node start = new Node(0, 130, 340, Node.Type.START);
        Node n1    = new Node(1, 310, 180, Node.Type.NORMAL);
        Node n2    = new Node(2, 310, 490, Node.Type.BOOST);
        Node n3    = new Node(3, 510, 180, Node.Type.TELEPORT);
        Node n4    = new Node(4, 510, 490, Node.Type.CORRUPT);
        Node n7    = new Node(7, 690, 180, Node.Type.FLIP);  n7.setFlipInterval(2);
        Node n8    = new Node(8, 690, 490, Node.Type.FLIP);  n8.setFlipInterval(3);
        Node n5    = new Node(5, 690, 340, Node.Type.NORMAL);
        Node exit  = new Node(6, 880, 340, Node.Type.EXIT);
        n3.setTeleportTarget(n5);
        nodes.addAll(Arrays.asList(start, n1, n2, n3, n4, n7, n8, n5, exit));
        start.addConnection(n1); start.addConnection(n2);
        n1.addConnection(n3);   n1.addConnection(n4);
        n2.addConnection(n4);   n2.addConnection(n3);
        n3.addConnection(n7);   n4.addConnection(n8);
        n7.addConnection(n5);   n8.addConnection(n5);
        n5.addConnection(exit);
    }

    private void generateRandom() {
        int attempts = 0;
        while (attempts++ < 300) {
            nodes.clear();
            Node start = new Node(0, 130, 340, Node.Type.START);
            Node n1 = new Node(1, 310, 180, rtype(.18, .18, .18, .18));
            Node n2 = new Node(2, 310, 490, rtype(.18, .18, .18, .18));
            Node n3 = new Node(3, 510, 180, rtype(.18, .18, .18, .18));
            Node n4 = new Node(4, 510, 490, rtype(.18, .18, .18, .18));
            Node n7 = new Node(7, 690, 180, rtype(.10, .10, .10, .40));
            Node n8 = new Node(8, 690, 490, rtype(.10, .10, .10, .40));
            Node n5 = new Node(5, 690, 340, rtype(.12, .12, .12, .10));
            Node exit = new Node(6, 880, 340, Node.Type.EXIT);
            n7.setFlipInterval(rng.nextBoolean() ? 2 : 3);
            n8.setFlipInterval(rng.nextBoolean() ? 2 : 3);
            if (n3.getType() == Node.Type.TELEPORT) n3.setTeleportTarget(n5);
            if (n4.getType() == Node.Type.TELEPORT) n4.setTeleportTarget(n5);
            nodes.addAll(Arrays.asList(start, n1, n2, n3, n4, n7, n8, n5, exit));
            start.addConnection(n1); start.addConnection(n2);
            if (rng.nextDouble() < .85) n1.addConnection(n3);
            if (rng.nextDouble() < .85) n2.addConnection(n4);
            if (rng.nextDouble() < .55) n1.addConnection(n4);
            if (rng.nextDouble() < .55) n2.addConnection(n3);
            if (rng.nextDouble() < .85) n3.addConnection(n7);
            if (rng.nextDouble() < .85) n4.addConnection(n8);
            if (rng.nextDouble() < .85) n7.addConnection(n5);
            if (rng.nextDouble() < .85) n8.addConnection(n5);
            n5.addConnection(exit);
            List<Node> sol = LevelSolver.solve(nodes);
            if (sol != null && sol.size() >= 5) break;
        }
        resetGame();
    }

    private Node.Type rtype(double b, double c, double t, double f) {
        double r = rng.nextDouble();
        if (r < b) return Node.Type.BOOST;
        if (r < b+c) return Node.Type.CORRUPT;
        if (r < b+c+t) return Node.Type.TELEPORT;
        if (r < b+c+t+f) return Node.Type.FLIP;
        return Node.Type.NORMAL;
    }

    private void resetGame() {
        nodes.forEach(n -> n.setActive(true));
        solutionPath = LevelSolver.solve(nodes);
        int sig = 100;
        if (solutionPath != null) sig = Math.min(100, Math.max(25, pathCost(solutionPath) + 10));
        packet = new Packet(nodes.get(0), sig);
        syncFlips();
        timerTicks = LEVEL_TIME_SECONDS * 60;
        combo = 0; comboShowLife = 0;
        particles.clear();
        floatTexts.clear();
    }

    private int pathCost(List<Node> path) {
        int sig = 100; long used = 0;
        for (int i = 1; i < path.size(); i++) {
            Node n = path.get(i); sig -= 10;
            if (n.getType() == Node.Type.BOOST) {
                long b = 1L << n.getId();
                if ((used & b) == 0) { sig += 20; used |= b; }
            } else if (n.getType() == Node.Type.CORRUPT) sig -= 15;
            if (sig > 100) sig = 100;
        }
        return 100 - sig;
    }

    private void syncFlips() {
        if (packet == null) return;
        int s = packet.getStepsTaken();
        for (Node n : nodes)
            if (n.getType() == Node.Type.FLIP)
                n.setActive((s / n.getFlipInterval()) % 2 == 0);
    }

    private void checkDeadlock() {
        if (packet == null || packet.isDead() || packet.isReachedExit()) return;
        Node cur = packet.getCurrentNode();
        for (Node nb : cur.getConnections())
            if (nb.getType() != Node.Type.FLIP || nb.isActive()) return;
        packet.setDeadlocked(true);
        SoundManager.playLose();
        flash(RED, 35); shake(25);
        addFloat("DEADLOCK!", cur.getX(), cur.getY()-50, RED, 26);
    }

    // ── HELPERS ──────────────────────────────────────────────────────────────────
    private void burst(int x, int y, Color col, int n) {
        for (int i = 0; i < n; i++) particles.add(new Particle(x, y, col));
    }
    private void flash(Color col, int frames) { flashColor = col; flashLife = frames; }
    private void shake(int frames) { shakeFrames = frames; }
    private void addFloat(String text, double x, double y, Color col, float size) {
        floatTexts.add(new FloatText(text, x, y, col, size));
    }

    // ── MOVE ─────────────────────────────────────────────────────────────────────
    private void tryMove(Node target) {
        if (packet == null || packet.isDead() || packet.isReachedExit()) return;
        Node cur = packet.getCurrentNode();
        if (!cur.getConnections().contains(target)) return;

        boolean moved = packet.moveTo(target);
        if (!moved) {
            SoundManager.playBlocked();
            shake(8); flash(new Color(255, 0, 0, 80), 12);
            addFloat("BLOCKED!", target.getX(), target.getY()-40, RED, 20);
            return;
        }

        // Combo tracking
        long now = System.currentTimeMillis();
        if (now - lastMoveTime < COMBO_WINDOW_MS) {
            combo++;
            if (combo >= 2) {
                SoundManager.playCombo();
                addFloat("x" + combo + " COMBO!", target.getX(), target.getY()-50, AMBER, 22);
                comboShowLife = 90;
            }
        } else {
            combo = 1;
        }
        lastMoveTime = now;

        // Node effect visuals
        switch (target.getType()) {
            case BOOST:
                if (target.isActive()) { // isActive is checked in moveTo, but boost was active before moveTo
                    burst(target.getX(), target.getY(), GREEN, 30);
                    flash(new Color(0, 200, 80, 60), 20);
                    addFloat("+20%  BOOST!", target.getX(), target.getY()-45, GREEN, 22);
                } else {
                    burst(target.getX(), target.getY(), CYAN, 10);
                }
                break;
            case CORRUPT:
                burst(target.getX(), target.getY(), RED, 25);
                flash(new Color(255, 0, 60, 70), 18);
                shake(12);
                addFloat("-15%  CORRUPT!", target.getX(), target.getY()-45, RED, 22);
                break;
            case TELEPORT:
                burst(target.getX(), target.getY(), AMBER, 20);
                Node tp = target.getTeleportTarget();
                if (tp != null) burst(tp.getX(), tp.getY(), AMBER, 20);
                addFloat("WARPED!", target.getX(), target.getY()-45, AMBER, 22);
                break;
            case EXIT:
                // handled below
                break;
            default:
                burst(target.getX(), target.getY(), CYAN, 8);
                break;
        }

        syncFlips();
        checkDeadlock();

        if (packet.isReachedExit()) {
            int timeBonus = (timerTicks / 60) * 20;
            int sigBonus  = packet.getSignalStrength() * 5;
            int comboBonus = combo * 50;
            int gained = 500 + timeBonus + sigBonus + comboBonus;
            score += gained;
            if (score > highScore) highScore = score;
            burst(target.getX(), target.getY(), GREEN, 80);
            burst(target.getX(), target.getY(), Color.WHITE, 40);
            flash(new Color(0, 255, 120, 80), 40);
            addFloat("+" + gained + " pts!", target.getX(), target.getY()-60, GREEN, 28);
            SoundManager.playWin();
        } else if (packet.isDead() && !packet.isDeadlocked()) {
            flash(RED, 30); shake(20);
            SoundManager.playLose();
            addFloat("SIGNAL LOST!", cur.getX(), cur.getY()-50, RED, 26);
        }
    }

    private void dirMove(double ix, double iy) {
        if (packet == null || packet.isDead() || packet.isReachedExit()) return;
        Node cur = packet.getCurrentNode(); Node best = null; double bestS = 0.4;
        for (Node nb : cur.getConnections()) {
            double dx = nb.getX()-cur.getX(), dy = nb.getY()-cur.getY();
            double len = Math.hypot(dx, dy);
            if (len > 0) { dx /= len; dy /= len; }
            double s = dx*ix + dy*iy;
            if (s > bestS) { bestS = s; best = nb; }
        }
        if (best != null) tryMove(best);
    }

    // ── PAINT ─────────────────────────────────────────────────────────────────────
    @Override
    protected void paintComponent(Graphics g) {
        super.paintComponent(g);
        Graphics2D g2 = (Graphics2D) g;
        g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        g2.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);

        if (state == GameState.MENU) { drawMenu(g2); return; }

        // Screen shake translation
        g2.translate(shakeX, shakeY);
        drawBg(g2);
        drawEdges(g2);
        drawParticles(g2);
        drawNodes(g2);
        drawPacket(g2);
        drawFloatTexts(g2);
        g2.translate(-shakeX, -shakeY);

        // Flash overlay
        if (flashLife > 0 && flashColor != null) {
            float fa = Math.max(0, Math.min(1, flashLife / 25f));
            g2.setColor(new Color(flashColor.getRed(), flashColor.getGreen(), flashColor.getBlue(),
                Math.max(0, Math.min(255, (int)(fa * 100)))));
            g2.fillRect(0, 0, W, H);
        }

        drawHUD(g2);
        drawTimer(g2);

        if (packet != null && packet.isDead())           drawGameOver(g2);
        else if (packet != null && packet.isReachedExit()) drawWin(g2);
    }

    // ── BACKGROUND ───────────────────────────────────────────────────────────────
    private void drawBg(Graphics2D g2) {
        g2.setColor(BG); g2.fillRect(0, 0, W, H);
        // Scrolling grid
        g2.setStroke(new BasicStroke(1));
        int gs = 55, off = (frame) % gs;
        g2.setColor(new Color(0, 180, 255, 14));
        for (int x = -gs+off; x < W; x += gs) g2.drawLine(x, 55, x, H-95);
        for (int y = 55; y < H-95; y += gs) g2.drawLine(0, y, W, y);

        // Star field
        Random sr = new Random(99);
        for (int i = 0; i < 100; i++) {
            int sx = sr.nextInt(W), sy = sr.nextInt(H);
            double tw = 0.5 + 0.5*Math.abs(Math.sin(frame*0.04+i*0.6));
            int sa = Math.max(0, Math.min(255, (int)(tw * 160)));
            g2.setColor(new Color(255, 255, 255, sa));
            int ss = (i % 5 == 0) ? 2 : 1;
            g2.fillOval(sx, sy, ss, ss);
        }
    }

    // ── EDGES ────────────────────────────────────────────────────────────────────
    private void drawEdges(Graphics2D g2) {
        Set<String> drawn = new HashSet<>();
        for (Node n : nodes) {
            for (Node nb : n.getConnections()) {
                String key = Math.min(n.getId(), nb.getId())+"_"+Math.max(n.getId(), nb.getId());
                if (!drawn.add(key)) continue;

                boolean blocked = (n.getType()==Node.Type.FLIP&&!n.isActive())
                               || (nb.getType()==Node.Type.FLIP&&!nb.isActive());
                if (blocked) {
                    g2.setStroke(new BasicStroke(4, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND));
                    g2.setColor(new Color(180, 20, 50, 80));
                } else {
                    g2.setStroke(new BasicStroke(4, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND));
                    g2.setColor(new Color(20, 40, 70));
                }
                g2.drawLine(n.getX(), n.getY(), nb.getX(), nb.getY());

                if (!blocked) {
                    // Animated pulse bead per edge
                    double r = ((frame * 0.014) + n.getId()*0.4) % 1.0;
                    int px = (int)(n.getX() + (nb.getX()-n.getX())*r);
                    int py = (int)(n.getY() + (nb.getY()-n.getY())*r);
                    g2.setColor(new Color(0, 229, 255, 220));
                    g2.fillOval(px-4, py-4, 9, 9);
                }
            }
        }
        // Teleport dashed lines
        float[] dash = {8f, 6f};
        g2.setStroke(new BasicStroke(2, BasicStroke.CAP_BUTT, BasicStroke.JOIN_ROUND, 1, dash, frame*0.5f));
        g2.setColor(new Color(255, 190, 0, 180));
        for (Node n : nodes)
            if (n.getType()==Node.Type.TELEPORT && n.getTeleportTarget()!=null)
                g2.drawLine(n.getX(), n.getY(), n.getTeleportTarget().getX(), n.getTeleportTarget().getY());
    }

    // ── NODES ────────────────────────────────────────────────────────────────────
    private void drawNodes(Graphics2D g2) {
        for (Node n : nodes) {
            Color col = nodeCol(n);
            boolean hov = (n == hoveredNode);
            boolean isPacketHere = packet != null && packet.getCurrentNode() == n;
            int r = hov ? 32 : 28;

            // Flip warning ring
            if (n.getType()==Node.Type.FLIP && packet!=null) {
                int ttf = n.getFlipInterval() - (packet.getStepsTaken()%n.getFlipInterval());
                if (ttf == 1) {
                    double fl = 0.5 + 0.5*Math.abs(Math.sin(frame*0.28));
                    int fa = Math.max(0, Math.min(255, (int)(220*fl)));
                    g2.setColor(new Color(255, 45, 85, fa));
                    g2.setStroke(new BasicStroke(3));
                    g2.drawOval(n.getX()-r-12, n.getY()-r-12, (r+12)*2, (r+12)*2);
                }
            }

            // Glow halo
            double pulse = 1 + 0.15*Math.abs(Math.sin(frame*0.07 + n.getId()));
            int gr = (int)(r*pulse) + 10;
            int ga = hov ? 90 : (isPacketHere ? 110 : 40);
            g2.setColor(new Color(col.getRed(), col.getGreen(), col.getBlue(),
                Math.max(0, Math.min(255, ga))));
            g2.fillOval(n.getX()-gr, n.getY()-gr, gr*2, gr*2);

            // Node body
            g2.setColor(new Color(8, 14, 28));
            g2.fillOval(n.getX()-r, n.getY()-r, r*2, r*2);
            g2.setStroke(new BasicStroke(hov||isPacketHere ? 3.5f : 2.5f));
            g2.setColor(col);
            g2.drawOval(n.getX()-r, n.getY()-r, r*2, r*2);

            // Inner core
            int cr = hov ? 11 : 9;
            g2.fillOval(n.getX()-cr/2, n.getY()-cr/2, cr, cr);

            // Label
            String lbl = nodeLabel(n);
            if (!lbl.isEmpty()) {
                g2.setFont(new Font("Monospaced", Font.BOLD, 11));
                int sw = g2.getFontMetrics().stringWidth(lbl);
                g2.setColor(col);
                g2.drawString(lbl, n.getX()-sw/2, n.getY()-r-9);
            }
        }
    }

    private Color nodeCol(Node n) {
        if (n.getType()==Node.Type.FLIP) return n.isActive() ? new Color(255,220,50) : new Color(255,45,85);
        if (!n.isActive()) return new Color(55, 65, 85);
        switch (n.getType()) {
            case START:    return CYAN;
            case EXIT:     return PURPLE;
            case BOOST:    return GREEN;
            case CORRUPT:  return RED;
            case TELEPORT: return AMBER;
            default:       return new Color(195, 210, 225);
        }
    }

    private String nodeLabel(Node n) {
        switch (n.getType()) {
            case START:    return "[ START ]";
            case EXIT:     return "[ EXIT ]";
            case BOOST:    return n.isActive() ? "BOOST +20%" : "USED";
            case CORRUPT:  return "CORRUPT -15%";
            case TELEPORT: return "PORTAL";
            case FLIP:
                if (packet == null) return "FLIP";
                int ttf = n.getFlipInterval()-(packet.getStepsTaken()%n.getFlipInterval());
                return "FLIP "+(n.isActive()?"[ON]":"[OFF]")+" "+ttf+"s";
            default: return "";
        }
    }

    // ── PACKET ───────────────────────────────────────────────────────────────────
    private void drawPacket(Graphics2D g2) {
        if (packet == null) return;
        Node cur = packet.getCurrentNode();
        int ps = (int)(18 + 5*Math.abs(Math.sin(frame*0.2)));
        g2.setColor(new Color(0, 229, 255, 70));
        g2.fillRect(cur.getX()-ps-4, cur.getY()-ps-4, (ps+4)*2, (ps+4)*2);
        g2.setStroke(new BasicStroke(3));
        g2.setColor(CYAN);
        g2.drawRect(cur.getX()-ps/2, cur.getY()-ps/2, ps, ps);
        g2.setColor(Color.WHITE);
        g2.fillRect(cur.getX()-7, cur.getY()-7, 14, 14);
    }

    // ── PARTICLES ────────────────────────────────────────────────────────────────
    private void drawParticles(Graphics2D g2) {
        for (Particle p : particles) {
            int pa = Math.max(0, Math.min(255, (int)(p.alpha()*220)));
            g2.setColor(new Color(p.color.getRed(), p.color.getGreen(), p.color.getBlue(), pa));
            int s = Math.max(1, (int)(p.size*p.alpha()));
            g2.fillOval((int)p.x-s/2, (int)p.y-s/2, s, s);
        }
    }

    private void drawFloatTexts(Graphics2D g2) {
        for (FloatText ft : floatTexts) {
            int fa = Math.max(0, Math.min(255, (int)(ft.alpha()*240)));
            g2.setFont(new Font("Monospaced", Font.BOLD, (int)ft.size));
            g2.setColor(new Color(ft.color.getRed(), ft.color.getGreen(), ft.color.getBlue(), fa));
            int sw = g2.getFontMetrics().stringWidth(ft.text);
            g2.drawString(ft.text, (int)(ft.x - sw/2), (int)ft.y);
        }
    }

    // ── HUD ──────────────────────────────────────────────────────────────────────
    private void drawHUD(Graphics2D g2) {
        g2.setColor(new Color(5, 9, 22, 245));
        g2.fillRect(0, 0, W, 54);
        g2.setColor(new Color(0, 200, 255, 80));
        g2.setStroke(new BasicStroke(2));
        g2.drawLine(0, 54, W, 54);

        // Signal bar
        if (packet != null) {
            int sig = packet.getSignalStrength();
            int maxSig = packet.getMaxStartingSignal();
            g2.setFont(new Font("Monospaced", Font.BOLD, 14));
            g2.setColor(Color.WHITE);
            g2.drawString("SIG:", 265, 32);
            g2.setColor(new Color(15, 25, 50));
            g2.fillRoundRect(298, 16, 180, 21, 7, 7);
            Color bar = sig>50?CYAN:sig>20?AMBER:RED;
            g2.setColor(bar);
            g2.fillRoundRect(298, 16, Math.max(0,(int)(180*(sig/(double)maxSig))), 21, 7, 7);
            g2.setColor(bar.brighter());
            g2.drawRoundRect(298, 16, 180, 21, 7, 7);
            g2.setColor(Color.WHITE);
            g2.drawString(sig+"%", 488, 32);

            g2.setColor(PURPLE);
            g2.drawString("LV "+level, 540, 32);
            g2.setColor(AMBER);
            g2.drawString("Score: "+score, 595, 32);
            g2.setColor(new Color(120, 140, 170));
            g2.drawString("Best: "+highScore, 710, 32);
        }

        drawSmallBtn(g2, hudMenu);
        drawSmallBtn(g2, hudReset);
        drawSmallBtn(g2, hudNew2);
        drawSmallBtn(g2, hudQuit);

        // Combo badge
        if (comboShowLife > 0 && combo >= 2) {
            double cf = Math.min(1, comboShowLife/30.0);
            int ca = Math.max(0, Math.min(255, (int)(cf*255)));
            g2.setFont(new Font("Monospaced", Font.BOLD, 20));
            String ct = "x"+combo+" COMBO";
            int ctw = g2.getFontMetrics().stringWidth(ct);
            g2.setColor(new Color(255, 190, 0, ca));
            g2.drawString(ct, W-160-ctw/2, 85);
        }

        // Footer bar
        g2.setColor(new Color(5, 9, 22, 230));
        g2.fillRect(0, H-95, W, 95);
        g2.setColor(new Color(0, 200, 255, 55));
        g2.drawLine(0, H-95, W, H-95);
        g2.setFont(new Font("Monospaced", Font.BOLD, 11));
        g2.setColor(new Color(140, 165, 200));
        g2.drawString("MOVE: WASD or Arrow Keys  |  Click a node to move there  |  GREEN = +20% signal  |  RED = -15% signal  |  ORANGE = Teleport  |  YELLOW = Timed gate", 18, H-72);
        g2.setColor(new Color(100, 120, 155));
        g2.drawString("Route the packet from START to EXIT before signal or timer hits zero!  Wrong moves cost signal — plan your path!", 18, H-50);
        g2.setColor(new Color(70, 90, 120));
        g2.drawString("FLIP nodes toggle ON/OFF every [N] steps — counter shows steps until next flip — move FAST for COMBO bonuses!", 18, H-28);
    }

    // ── TIMER BAR ────────────────────────────────────────────────────────────────
    private void drawTimer(Graphics2D g2) {
        int totalTicks = LEVEL_TIME_SECONDS * 60;
        float frac = Math.max(0, Math.min(1, timerTicks / (float)totalTicks));
        int secsLeft = timerTicks / 60;
        boolean warn = timerTicks <= timerWarnAt;
        boolean critical = timerTicks <= 5*60;

        // Timer bar strip at the very top
        g2.setColor(new Color(8, 14, 30));
        g2.fillRect(0, 0, W, 6);
        Color tbar = critical ? RED : warn ? AMBER : new Color(0, 200, 255);
        // Pulse urgency
        if (critical) {
            double pulse = 0.5 + 0.5*Math.abs(Math.sin(frame*0.3));
            int ta = Math.max(0, Math.min(255, (int)(pulse*255)));
            g2.setColor(new Color(tbar.getRed(), tbar.getGreen(), tbar.getBlue(), ta));
        } else {
            g2.setColor(tbar);
        }
        g2.fillRect(0, 0, (int)(W*frac), 6);

        // Timer text (top right of HUD)
        g2.setFont(new Font("Monospaced", Font.BOLD, 18));
        String ts = secsLeft + "s";
        g2.setColor(critical ? RED : warn ? AMBER : new Color(160, 200, 230));
        g2.drawString(ts, W-130, 34);

        // Volume text
        g2.setFont(new Font("Monospaced", Font.PLAIN, 10));
        g2.setColor(new Color(70, 90, 120));
        g2.drawString("VOL "+(int)(SoundManager.getVolumeScale()*100)+"%  [V]", W-100, H-110);
    }

    // ── GAME OVER / WIN OVERLAYS ─────────────────────────────────────────────────
    private void drawGameOver(Graphics2D g2) {
        g2.setColor(new Color(4, 7, 16, 215));
        g2.fillRect(0, 0, W, H);

        String title = packet.isDeadlocked() ?
            (timerTicks == 0 ? "TIME'S UP!" : "DEADLOCK") : "CONNECTION LOST";
        drawGlow(g2, new Font("Monospaced", Font.BOLD, 56), title, RED, H/2-90);

        g2.setFont(new Font("Monospaced", Font.PLAIN, 18));
        g2.setColor(new Color(190, 200, 215));
        String sub = packet.isDeadlocked() && timerTicks==0 ?
            "Timer ran out before the packet reached the exit." :
            packet.isDeadlocked() ?
            "All routes blocked. Packet stranded in subnet." :
            "Signal strength reached zero.";
        drawCentered(g2, sub, new Font("Monospaced", Font.PLAIN, 18), new Color(190,200,215), H/2-30);
        drawCentered(g2, "Score: "+score+"   Best: "+highScore, new Font("Monospaced", Font.BOLD, 16), AMBER, H/2+10);

        drawOverlayBtns(g2, false);
    }

    private void drawWin(Graphics2D g2) {
        g2.setColor(new Color(4, 7, 16, 215));
        g2.fillRect(0, 0, W, H);

        // Continuous celebration particles
        if (frame % 4 == 0) burst(rng.nextInt(W), rng.nextInt(H/2)+100, GREEN, 4);
        if (frame % 6 == 0) burst(rng.nextInt(W), rng.nextInt(H/2)+100, PURPLE, 4);
        drawParticles(g2);

        drawGlow(g2, new Font("Monospaced", Font.BOLD, 52), "UPLINK ESTABLISHED!", GREEN, H/2-90);
        drawCentered(g2, "Packet delivered!  Steps: "+packet.getStepsTaken()+"   Signal left: "+packet.getSignalStrength()+"%",
            new Font("Monospaced", Font.PLAIN, 18), new Color(190, 210, 225), H/2-30);
        drawCentered(g2, "Score: "+score+"   Best: "+highScore, new Font("Monospaced", Font.BOLD, 16), AMBER, H/2+10);

        drawOverlayBtns(g2, true);
    }

    private void drawOverlayBtns(Graphics2D g2, boolean win) {
        int bw=180, bh=52, gap=24;
        int totalW = 3*(bw+gap)-gap;
        int bx = (W-totalW)/2;
        int by = H/2+60;
        Btn[] bs = {
            new Btn(win?"NEXT LEVEL":"RETRY",  bx,         by, bw, bh, win?GREEN:AMBER),
            new Btn("NEW PUZZLE",               bx+bw+gap,  by, bw, bh, PURPLE),
            new Btn("MAIN MENU",                bx+2*(bw+gap), by, bw, bh, CYAN),
        };
        for (Btn b : bs) drawLargeBtn(g2, b);
    }

    // ── MENU ─────────────────────────────────────────────────────────────────────
    private static final int MBX = (1100-430)/2; // menu button x (centered)
    private static final int MBW = 430, MBH = 65;

    private void drawMenu(Graphics2D g2) {
        // Deep dark base
        g2.setColor(new Color(3, 5, 14));
        g2.fillRect(0, 0, W, H);

        // CRT scanlines
        for (int y = 0; y < H; y += 4) {
            g2.setColor(new Color(0, 0, 0, 25));
            g2.drawLine(0, y, W, y);
        }

        // Animated circuit traces — horizontal
        g2.setStroke(new BasicStroke(1));
        int[] traceY = {90, 195, 330, 460, 565};
        for (int i = 0; i < traceY.length; i++) {
            double p = 0.3 + 0.25*Math.abs(Math.sin(frame*0.018 + i*1.3));
            int ta = Math.max(0, Math.min(255, (int)(p*80)));
            g2.setColor(new Color(0, 200, 255, ta));
            g2.drawLine(0, traceY[i], W, traceY[i]);
        }
        // Vertical circuit traces
        int[] traceX = {55, 240, 490, 740, 990};
        for (int i = 0; i < traceX.length; i++) {
            double p = 0.3 + 0.2*Math.abs(Math.sin(frame*0.022 + i*1.0));
            int ta = Math.max(0, Math.min(255, (int)(p*55)));
            g2.setColor(new Color(0, 200, 255, ta));
            g2.drawLine(traceX[i], 0, traceX[i], H);
        }

        // Twinkling star field
        Random sr = new Random(42);
        for (int i = 0; i < 160; i++) {
            int sx = sr.nextInt(W), sy = sr.nextInt(H);
            double tw = 0.5 + 0.5*Math.abs(Math.sin(frame*0.04+i*0.72));
            int sa = Math.max(0, Math.min(255, (int)(tw*200)));
            int ss = (i%8==0)?3:(i%3==0)?2:1;
            g2.setColor(new Color(200, 220, 255, sa));
            g2.fillOval(sx, sy, ss, ss);
        }
        drawParticles(g2);

        // ── TITLE ─────────────────────────────────────────────────────────────
        Font titleFont = new Font("Monospaced", Font.BOLD, 90);
        g2.setFont(titleFont);
        String title = "SIGNAL LOSS";
        int tw = g2.getFontMetrics().stringWidth(title);
        int tx = (W-tw)/2, ty = 135;

        // Drop shadow
        g2.setColor(new Color(0, 30, 60, 180));
        g2.drawString(title, tx+7, ty+7);

        // Wide layered glow
        for (int i = 16; i > 0; i--) {
            int ga = Math.max(0, Math.min(255, (int)(255.0/i*0.65)));
            g2.setColor(new Color(0, 215, 255, ga));
            g2.drawString(title, tx-i/2, ty);
        }
        // Animated colour shift on title
        double shift = 0.5 + 0.5*Math.abs(Math.sin(frame*0.025));
        g2.setColor(new Color((int)(shift*70), (int)(215+shift*20), 255));
        g2.drawString(title, tx, ty);

        // Subtitle
        Font subFont = new Font("Monospaced", Font.BOLD, 16);
        g2.setFont(subFont);
        String sub = "// ROUTE THE PACKET  —  REACH EXIT BEFORE SIGNAL DECAYS //";
        int sw2 = g2.getFontMetrics().stringWidth(sub);
        g2.setColor(new Color(0, 200, 255, 55));
        g2.drawString(sub, (W-sw2)/2+1, 168);
        g2.setColor(new Color(90, 165, 210));
        g2.drawString(sub, (W-sw2)/2, 168);

        // ── BUTTONS ───────────────────────────────────────────────────────────
        drawMenuBtn(g2, MBX, 206, MBW, MBH, "PLAY",          CYAN,   new Color(0,45,80),  ">");
        drawMenuBtn(g2, MBX, 287, MBW, MBH, "RANDOM PUZZLE", PURPLE, new Color(38,0,65),  "?");
        drawMenuBtn(g2, MBX, 368, MBW, MBH,
            "VOLUME: "+(int)(SoundManager.getVolumeScale()*100)+"%",
            AMBER, new Color(55,38,0), "V");
        drawMenuBtn(g2, MBX, 449, MBW, MBH, "EXIT",          RED,    new Color(58,0,14),  "X");

        // ── LEGEND CARD ───────────────────────────────────────────────────────
        int lcy = 538, lcx = 80, lcw = W-160, lch = 120;
        g2.setColor(new Color(6, 12, 28, 210));
        g2.fillRoundRect(lcx, lcy, lcw, lch, 12, 12);
        g2.setStroke(new BasicStroke(1));
        g2.setColor(new Color(0, 200, 255, 40));
        g2.drawRoundRect(lcx, lcy, lcw, lch, 12, 12);

        g2.setFont(new Font("Monospaced", Font.BOLD, 12));
        g2.setColor(new Color(0, 200, 255, 200));
        g2.drawString("NODE GUIDE:", lcx+16, lcy+20);

        g2.setFont(new Font("Monospaced", Font.PLAIN, 12));
        int rx = lcx+16, ry = lcy+38, gcol = 205;
        drawLegItem(g2, rx,       ry, CYAN,                   "START / NORMAL");
        drawLegItem(g2, rx+210,   ry, GREEN,                  "BOOST  +20% signal");
        drawLegItem(g2, rx+445,   ry, RED,                    "CORRUPT  -15% signal");
        drawLegItem(g2, rx+690,   ry, AMBER,                  "PORTAL — teleport");
        ry += 26;
        drawLegItem(g2, rx,       ry, new Color(255,220,50),  "FLIP — timed gate ON/OFF");
        drawLegItem(g2, rx+265,   ry, PURPLE,                 "EXIT — reach this to WIN!");
        g2.setColor(new Color(gcol, gcol, gcol));
        g2.drawString("Move: WASD / Arrow Keys / Click a node", rx+530, ry+2);
        ry += 26;
        g2.setColor(new Color(90, 110, 145));
        g2.drawString("Move FAST for COMBO bonus!  45s countdown per level.  Wrong moves drain signal!", rx, ry+2);

        // Version tag
        g2.setFont(new Font("Monospaced", Font.PLAIN, 11));
        g2.setColor(new Color(35, 52, 80));
        g2.drawString("v3.2  Java Capstone — Signal Loss", W-286, H-6);
    }

    private void drawLegItem(Graphics2D g2, int x, int y, Color col, String text) {
        // Small colored square (not a dot) for each legend item
        g2.setColor(col);
        g2.fillRoundRect(x, y-9, 12, 12, 3, 3);
        g2.setColor(new Color(160, 185, 215));
        g2.drawString(text, x+18, y+2);
    }

    private void drawMenuBtn(Graphics2D g2, int x, int y, int w, int h,
                             String label, Color borderCol, Color fillCol, String icon) {
        boolean hov = mousePos!=null && mousePos.x>=x && mousePos.x<=x+w && mousePos.y>=y && mousePos.y<=y+h;

        // Glow halo on hover
        if (hov) {
            for (int i = 12; i > 0; i--) {
                int ga = Math.max(0, Math.min(255, 11*i));
                g2.setColor(new Color(borderCol.getRed(),borderCol.getGreen(),borderCol.getBlue(),ga));
                g2.fillRoundRect(x-i, y-i, w+2*i, h+2*i, 18, 18);
            }
        }

        // Button body
        Color bodyCol = hov
            ? new Color(borderCol.getRed(),borderCol.getGreen(),borderCol.getBlue(),55)
            : new Color(Math.min(255,fillCol.getRed()+12), Math.min(255,fillCol.getGreen()+12),
                        Math.min(255,fillCol.getBlue()+12), 215);
        g2.setColor(bodyCol);
        g2.fillRoundRect(x, y, w, h, 14, 14);

        // Border
        g2.setStroke(new BasicStroke(hov ? 3f : 2f));
        g2.setColor(hov ? borderCol : new Color(borderCol.getRed(),borderCol.getGreen(),borderCol.getBlue(),185));
        g2.drawRoundRect(x, y, w, h, 14, 14);

        // Icon box on the left
        int ibw = h - 10;
        g2.setColor(new Color(borderCol.getRed(),borderCol.getGreen(),borderCol.getBlue(),55));
        g2.fillRoundRect(x+6, y+5, ibw, h-10, 8, 8);
        g2.setFont(new Font("Monospaced", Font.BOLD, 24));
        g2.setColor(hov ? Color.WHITE : borderCol);
        int isw = g2.getFontMetrics().stringWidth(icon);
        g2.drawString(icon, x+6+(ibw-isw)/2, y+h/2+9);

        // Label text
        g2.setFont(new Font("Monospaced", Font.BOLD, 20));
        g2.setColor(hov ? Color.WHITE : new Color(222,230,242));
        int lw = g2.getFontMetrics().stringWidth(label);
        int labelX = x + ibw + 14 + ((w - ibw - 20 - lw)/2);
        g2.drawString(label, labelX, y+h/2+7);
    }

    // ── DRAW HELPERS ─────────────────────────────────────────────────────────────
    private void drawGlow(Graphics2D g2, Font font, String text, Color col, int y) {
        g2.setFont(font);
        int tw = g2.getFontMetrics().stringWidth(text);
        int x = (W-tw)/2;
        for (int i = 8; i > 0; i--) {
            int ga = Math.max(0, Math.min(255, 8*i));
            g2.setColor(new Color(col.getRed(), col.getGreen(), col.getBlue(), ga));
            g2.drawString(text, x+i, y+i);
        }
        g2.setColor(col);
        g2.drawString(text, x, y);
    }

    private void drawCentered(Graphics2D g2, String text, Font font, Color col, int y) {
        g2.setFont(font);
        int tw = g2.getFontMetrics().stringWidth(text);
        g2.setColor(col);
        g2.drawString(text, (W-tw)/2, y);
    }

    private void drawSmallBtn(Graphics2D g2, Btn btn) {
        boolean hov = btn.hit(mousePos);
        g2.setColor(hov ? new Color(btn.col.getRed(),btn.col.getGreen(),btn.col.getBlue(),60) : new Color(10,18,38));
        g2.fillRoundRect(btn.x, btn.y, btn.w, btn.h, 5, 5);
        g2.setStroke(new BasicStroke(hov ? 2 : 1));
        g2.setColor(hov ? btn.col : new Color(btn.col.getRed(),btn.col.getGreen(),btn.col.getBlue(),110));
        g2.drawRoundRect(btn.x, btn.y, btn.w, btn.h, 5, 5);
        g2.setFont(new Font("Monospaced", Font.BOLD, 11));
        g2.setColor(hov ? Color.WHITE : new Color(200, 212, 225));
        int tw = g2.getFontMetrics().stringWidth(btn.text);
        g2.drawString(btn.text, btn.x+(btn.w-tw)/2, btn.y+(btn.h+g2.getFontMetrics().getAscent()-4)/2);
    }

    private void drawLargeBtn(Graphics2D g2, Btn btn) {
        boolean hov = btn.hit(mousePos);
        if (hov) {
            for (int i = 8; i > 0; i--) {
                int ba = Math.max(0, Math.min(255, 9*i));
                g2.setColor(new Color(btn.col.getRed(),btn.col.getGreen(),btn.col.getBlue(), ba));
                g2.fillRoundRect(btn.x-i, btn.y-i, btn.w+2*i, btn.h+2*i, 14, 14);
            }
        }
        g2.setColor(hov ? new Color(btn.col.getRed(),btn.col.getGreen(),btn.col.getBlue(),50) : new Color(9,16,32));
        g2.fillRoundRect(btn.x, btn.y, btn.w, btn.h, 12, 12);
        g2.setStroke(new BasicStroke(hov ? 2.5f : 1.5f));
        g2.setColor(hov ? btn.col : new Color(btn.col.getRed(),btn.col.getGreen(),btn.col.getBlue(),150));
        g2.drawRoundRect(btn.x, btn.y, btn.w, btn.h, 12, 12);
        g2.setFont(new Font("Monospaced", Font.BOLD, 16));
        g2.setColor(hov ? Color.WHITE : new Color(210, 220, 235));
        int tw = g2.getFontMetrics().stringWidth(btn.text);
        g2.drawString(btn.text, btn.x+(btn.w-tw)/2, btn.y+(btn.h+g2.getFontMetrics().getAscent()-4)/2);
    }

    // ── MOUSE ─────────────────────────────────────────────────────────────────────
    @Override
    public void mouseClicked(MouseEvent e) {
        Point p = e.getPoint();

        if (state == GameState.MENU) {
            // Coordinates match drawMenuBtn calls: MBX, y, MBW, MBH
            if      (new Btn("",MBX,206,MBW,MBH,CYAN).hit(p))   { initGrid(); resetGame(); state=GameState.PLAYING; SoundManager.playBoost(); }
            else if (new Btn("",MBX,287,MBW,MBH,PURPLE).hit(p)) { generateRandom(); state=GameState.PLAYING; SoundManager.playBoost(); }
            else if (new Btn("",MBX,368,MBW,MBH,AMBER).hit(p))  cycleVol();
            else if (new Btn("",MBX,449,MBW,MBH,RED).hit(p))    System.exit(0);
            return;
        }

        if (hudMenu.hit(p))  { state=GameState.MENU; SoundManager.playMove(); return; }
        if (hudReset.hit(p)) { resetGame(); SoundManager.playMove(); return; }
        if (hudNew2.hit(p))  { generateRandom(); SoundManager.playMove(); return; }
        if (hudQuit.hit(p))  System.exit(0);

        // Overlay button detection on win/lose
        if (packet != null && (packet.isDead() || packet.isReachedExit())) {
            int bw=180, bh=52, gap=24, totalW=3*(bw+gap)-gap;
            int bx=(W-totalW)/2, by=H/2+60;
            boolean win=packet.isReachedExit();
            if (new Btn("",bx,by,bw,bh,CYAN).hit(p)) {
                if (win) { level++; score+=300; generateRandom(); } else resetGame();
                SoundManager.playBoost();
            } else if (new Btn("",bx+bw+gap,by,bw,bh,CYAN).hit(p)) {
                generateRandom(); SoundManager.playBoost();
            } else if (new Btn("",bx+2*(bw+gap),by,bw,bh,CYAN).hit(p)) {
                state=GameState.MENU;
            }
            return;
        }

        if (hoveredNode != null && packet != null) tryMove(hoveredNode);
    }

    @Override public void mousePressed(MouseEvent e) {}
    @Override public void mouseReleased(MouseEvent e) {}
    @Override public void mouseEntered(MouseEvent e) {}
    @Override public void mouseExited(MouseEvent e) {}

    @Override
    public void mouseMoved(MouseEvent e) {
        mousePos = e.getPoint();
        if (state != GameState.PLAYING) return;
        hoveredNode = null;
        for (Node n : nodes)
            if (Math.hypot(n.getX()-mousePos.x, n.getY()-mousePos.y) < 32) { hoveredNode=n; break; }
    }
    @Override public void mouseDragged(MouseEvent e) { mouseMoved(e); }

    // ── KEYBOARD ──────────────────────────────────────────────────────────────────
    @Override
    public void keyPressed(KeyEvent e) {
        int k = e.getKeyCode();
        if (state == GameState.MENU) {
            if (k==KeyEvent.VK_ENTER||k==KeyEvent.VK_SPACE) { initGrid(); resetGame(); state=GameState.PLAYING; }
            if (k==KeyEvent.VK_N) { generateRandom(); state=GameState.PLAYING; }
            if (k==KeyEvent.VK_V) cycleVol();
            if (k==KeyEvent.VK_ESCAPE) System.exit(0);
            return;
        }
        if (k==KeyEvent.VK_ESCAPE||k==KeyEvent.VK_M) { state=GameState.MENU; return; }
        if (k==KeyEvent.VK_R) { resetGame(); return; }
        if (k==KeyEvent.VK_N||k==KeyEvent.VK_SPACE) { generateRandom(); return; }
        if (k==KeyEvent.VK_V) { cycleVol(); return; }
        if (k==KeyEvent.VK_UP   ||k==KeyEvent.VK_W) dirMove(0,-1);
        if (k==KeyEvent.VK_DOWN ||k==KeyEvent.VK_S) dirMove(0, 1);
        if (k==KeyEvent.VK_LEFT ||k==KeyEvent.VK_A) dirMove(-1, 0);
        if (k==KeyEvent.VK_RIGHT||k==KeyEvent.VK_D) dirMove(1, 0);
    }
    @Override public void keyReleased(KeyEvent e) {}
    @Override public void keyTyped(KeyEvent e) {}

    private void cycleVol() {
        double v = SoundManager.getVolumeScale();
        SoundManager.setVolumeScale(v < 0.05 ? 0.5 : v < 0.75 ? 1.0 : 0.0);
        SoundManager.playMove();
    }
}
