type SectionIntroProps = {
  title: string;
  eyebrow: string;
  description: string;
  chip: string;
};

export function SectionIntro({ title, eyebrow, description, chip }: SectionIntroProps) {
  return (
    <section className="operations-section-intro">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        <p className="operations-section-intro__text">{description}</p>
      </div>
      <span className="screen-chip">{chip}</span>
    </section>
  );
}
