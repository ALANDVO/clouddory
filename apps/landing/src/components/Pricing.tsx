export default function Pricing() {
  return (
    <section id="pricing" className="relative py-24 lg:py-32">
      <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center">
        <h2 className="font-display font-bold text-3xl sm:text-4xl text-white tracking-tight mb-6">
          Open Source & Free to Self-Host
        </h2>
        <p className="text-lg text-slate-400 leading-relaxed">
          CloudDory is open source and free to self-host. See the{' '}
          <a
            href="https://github.com/clouddory/clouddory"
            className="text-cyan-400 hover:text-cyan-300 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub repo
          </a>{' '}
          for deployment instructions.
        </p>
      </div>
    </section>
  );
}
