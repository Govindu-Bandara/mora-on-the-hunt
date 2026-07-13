import { motion } from 'framer-motion';

const POINTS = [
  {
    num: '01',
    title: 'Organized by MORA Baseball',
    text: 'This campaign is run independently by the MORA Baseball team to rally support ahead of the Inter University Games.',
  },
  {
    num: '02',
    title: 'One community, one hunt',
    text: 'We want students, alumni, and supporters wearing the same colors, uniting everyone behind MORA on game day.',
  },
  {
    num: '03',
    title: 'Not an official university initiative',
    text: 'This is an independent campaign, not an official University of Moratuwa website or merchandise store.',
  },
];

export function AboutCampaign() {
  return (
    <section id="about" className="bg-mora-black px-6 py-28 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
          className="mb-16 flex items-end justify-between gap-6 border-b border-white/10 pb-6"
        >
          <h2 className="text-4xl font-black uppercase tracking-tight text-mora-white sm:text-5xl">
            About the <span className="text-mora-gold">Campaign</span>
          </h2>
          <span className="hidden text-xs font-bold uppercase tracking-[0.3em] text-mora-white/30 sm:block">
            Independent · MORA Baseball
          </span>
        </motion.div>

        <div className="grid gap-10 sm:grid-cols-3">
          {POINTS.map((point, i) => (
            <motion.div
              key={point.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative border-l-2 border-mora-gold/30 pl-6"
            >
              <span className="text-outline-gold text-6xl font-black leading-none">
                {point.num}
              </span>
              <h3 className="mt-4 mb-3 text-lg font-bold uppercase tracking-wide text-mora-white">
                {point.title}
              </h3>
              <p className="text-sm leading-relaxed text-mora-white/60">{point.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
