const noopurPhoto = '/assets/noopur_3.png'

type AboutPageProps = {
  bookingSessionUrl: string
}

const qualifications = [
  {
    label: 'Master\'s in Clinical Psychology',
    desc: 'Formally trained in human behavior, emotional processes, and mental health with a strong foundation in evidence-based psychological theories.',
  },
  {
    label: 'Counselling Skills & Therapy Techniques',
    suffix: '3-month certification',
    desc: 'Core training in active listening, empathy, rapport building, and structured therapeutic interventions.',
  },
  {
    label: 'Expressive Art Therapy',
    suffix: '3-month certification',
    desc: 'Specialized in using creative processes — art, reflection, and expression — as tools for emotional exploration and healing.',
  },
  {
    label: 'Cognitive Behavioural Therapy (CBT)',
    suffix: '3-month certification',
    desc: 'Trained in CBT techniques to identify and reframe negative thought patterns, enabling practical ways to manage emotions and behaviours.',
  },
  {
    label: 'Therapeutic Approaches & Philosophy',
    desc: 'Deeply influenced by existential, humanistic, and gestalt frameworks — focused on meaning, self-awareness, and understanding the deeper "why."',
  },
  {
    label: 'Integrative Techniques',
    desc: 'Working knowledge of NLP, Emotional Freedom Technique (EFT), and Shadow Work for a holistic and flexible approach to each individual.',
  },
]

const stats = [
  { number: '3+', label: 'Years of pro bono experience', sub: 'Diverse backgrounds & real-life concerns' },
  { number: '2+', label: 'Years of supervised practice', sub: 'Ethical, guided & reflective therapeutic work' },
  { number: 'Various', label: 'Workshops & group sessions', sub: 'Self-growth, emotional awareness & life skills' },
]

export default function About({ bookingSessionUrl }: AboutPageProps) {
  return (
    <div className="about-page">

      {/* ── Hero ── */}
      <section className="about-hero">
        <div className="about-hero-inner">
          <div className="about-hero-text">
            <p className="about-eyebrow">About</p>
            <h1 className="about-name">Noopur Asthana</h1>
            <p className="about-role">Trainee Psychologist · Founder of Detangle</p>
            <p className="about-intro">
              Hi, I'm Noopur — the person behind Detangle. My approach to therapy is simple: to
              create a space where you feel safe, heard, and understood, without any judgment.
            </p>
            <a
              href={bookingSessionUrl}
              target="_blank"
              rel="noreferrer"
              className="about-hero-cta"
            >
              Let's Detangle Together
            </a>
          </div>

          <div className="about-hero-photo-wrap">
            <img
              src={noopurPhoto}
              alt="Noopur Asthana"
              className="about-hero-photo"
            />
          </div>
        </div>
      </section>

      {/* ── Philosophy pull-quote ── */}
      <section className="about-philosophy">
        <div className="about-philosophy-inner">
          <blockquote className="about-philosophy-quote">
            "Be kind to others, especially yourself. Therapy is a brave choice to do that."
          </blockquote>
          <cite className="about-philosophy-cite">— Noopur Asthana</cite>
        </div>
      </section>

      {/* ── Qualifications ── */}
      <section className="about-quals-section">
        <div className="about-quals-inner">
          <p className="about-section-eyebrow">Training & Qualifications</p>
          <h2 className="about-section-heading">Built on a Strong Foundation</h2>
          <div className="about-quals-grid">
            {qualifications.map((q) => (
              <article key={q.label} className="about-qual-card">
                <div className="about-qual-card-top">
                  <h3 className="about-qual-title">{q.label}</h3>
                  {q.suffix && <span className="about-qual-badge">{q.suffix}</span>}
                </div>
                <p className="about-qual-desc">{q.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Experience stats ── */}
      <section className="about-stats-section">
        <div className="about-stats-inner">
          {stats.map((s) => (
            <div key={s.label} className="about-stat">
              <span className="about-stat-number">{s.number}</span>
              <span className="about-stat-label">{s.label}</span>
              <span className="about-stat-sub">{s.sub}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA strip ── */}
      <section className="about-cta-strip">
        <div className="about-cta-inner">
          <p className="about-cta-text">
            Ready to begin? This space is yours — whenever you are.
          </p>
          <a
            href={bookingSessionUrl}
            target="_blank"
            rel="noreferrer"
            className="event-register-btn"
          >
            Book a Session
          </a>
        </div>
      </section>

    </div>
  )
}
