function AboutSection({ about }) {
  return (
    <section className="profile-section">
      <h2 className="profile-section-title">ABOUT</h2>
      <p className="profile-about-text">{about}</p>
    </section>
  );
}

export default AboutSection;