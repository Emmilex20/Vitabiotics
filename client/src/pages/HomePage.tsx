// /client/src/pages/HomePage.tsx
import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import { Mail, CheckCircle, ArrowRight } from 'lucide-react';

/**
 * HomePage - Warm & Organic redesign
 * - Elegant hero with parallax overlay
 * - Glassmorphism cards, subtle micro-interactions
 * - Better spacing, typography scale, and transitions
 *
 * NOTE: keep ProductCard and useAuth as-is (this file expects existing components/context).
 */

/* ---------- Placeholder Data (kept intentionally) ---------- */
const featuredProductsPlaceholder = [
  { _id: 'p1', name: 'Wellman Original', slug: 'magnesium', price: 37485, category: 'Minerals', imageUrls: ['https://cdn.shopify.com/s/files/1/0027/7263/1621/files/wellman_original_30_front_2D-CTWEL030T24WL1E_resized.png?v=1746718726'], stockQuantity: 50, scientificName: 'Mg Citrate', keyBenefits: ['Sleep', 'Energy'], suggestedDosage: '1 cap daily', contraindications: 'N/A', averageRating: 4.8 },
  { _id: 'p2', name: 'Wellwoman Original', slug: 'vitd3k2', price: 48750, category: 'Vitamins', imageUrls: ['https://www.vitabiotics.com/cdn/shop/products/wellwoman-originalusethisfront.png?v=1587029033'], stockQuantity: 80, scientificName: 'Cholecalciferol', keyBenefits: ['Immunity', 'Joint Health'], suggestedDosage: '1 drop daily', contraindications: 'Blood thinners', averageRating: 4.6 },
  { _id: 'p3', name: 'Wellkid Soft Jelly Pastilles', slug: 'probiotic', price: 43500, category: 'Vitamins', imageUrls: ['https://www.vitabiotics.com/cdn/shop/products/wellkid_soft_jelly_orange_front_CTWKD030J8WL3E_resized.png?v=1646324351'], stockQuantity: 60, scientificName: 'Lactobacillus spp.', keyBenefits: ['Digestion', 'Immunity'], suggestedDosage: '1 sachet daily', contraindications: 'N/A', averageRating: 4.9 },
];

const healthPostsPlaceholder = [
  { id: 1, title: 'The Link Between Magnesium and Sleep Quality', summary: 'Discover how this essential mineral can transform your nightly rest.', link: '#' },
  { id: 2, title: 'Boosting Immunity: The Power of Zinc and Vitamin C', summary: 'A guide to the foundational supplements that protect your health year-round.', link: '#' },
  { id: 3, title: 'Gut Health is Brain Health: Understanding Probiotics', summary: 'Explore the fascinating connection between your gut microbiome and mood.', link: '#' },
];

const testimonials = [
  { id: 1, name: 'Amira Hassan', location: 'Lagos', quote: 'The personalized quiz helped me find exactly what I needed. My energy levels have never been better!', rating: 5, product: 'Energy Complex' },
  { id: 2, name: 'Chioma Okonkwo', location: 'Abuja', quote: 'I love how each product comes with detailed scientific backing. I finally understand what I\'m taking and why.', rating: 5, product: 'Vitamin D3 & K2' },
  { id: 3, name: 'Oluwaseun Adeyemi', location: 'Ibadan', quote: 'Customer service is exceptional, and the supplements are high quality. Highly recommend to anyone serious about wellness.', rating: 5, product: 'Probiotic Complex' },
];

const productBrands = [
  { id: 1, name: 'Energy & Vitality', icon: '⚡', color: 'from-amber-300 to-amber-500', description: 'Boost energy and endurance' },
  { id: 2, name: 'Immune Defense', icon: '🛡️', color: 'from-green-200 to-green-400', description: 'Strengthen immunity' },
  { id: 3, name: 'Sleep & Rest', icon: '🌙', color: 'from-indigo-200 to-indigo-400', description: 'Better sleep quality' },
  { id: 4, name: 'Joint & Mobility', icon: '🌿', color: 'from-emerald-200 to-emerald-400', description: 'Support joint health' },
];

const coreGoals = ['Energy', 'Immunity', 'Joint Health', 'Sleep', 'Digestion'];

/* ---------- Component ---------- */
const HomePage: React.FC = () => {
  useAuth();
  const [emailNewsletter, setEmailNewsletter] = useState('');
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);

  // Parallax refs
  const heroRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Parallax effect for hero overlay (subtle)
    const onScroll = () => {
      if (!heroRef.current || !overlayRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      const progress = Math.min(Math.max(-rect.top / (rect.height || 1), 0), 1); // 0..1
      // Move overlay slightly and scale for depth
      overlayRef.current.style.transform = `translateY(${progress * 24}px) scale(${1 + progress * 0.02})`;
      overlayRef.current.style.opacity = `${0.95 - progress * 0.35}`;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNewsletterSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailNewsletter.trim()) {
      setNewsletterSuccess(true);
      setEmailNewsletter('');
      // since this is demo, we clear success after short time
      setTimeout(() => setNewsletterSuccess(false), 3000);
    }
  };

  return (
    <div className="bg-neutral-50 text-neutral-900">
      {/* Inline styles & keyframes for micro-animations */}
      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .glass-card {
          background: linear-gradient(180deg, rgba(255,255,255,0.65), rgba(245,248,244,0.6));
          backdrop-filter: blur(8px) saturate(120%);
          -webkit-backdrop-filter: blur(8px) saturate(120%);
        }
        .soft-shadow { box-shadow: 0 6px 30px rgba(30,41,34,0.06); }
        .accent-underline::after {
          content: "";
          display: block;
          height: 4px;
          width: 48px;
          margin-top: 10px;
          border-radius: 9999px;
          background: linear-gradient(90deg, rgba(144,238,144,0.9), rgba(255,223,186,0.9));
        }
      `}</style>

      {/* ---------- HERO ---------- */}
      <section
        ref={heroRef}
        className="relative overflow-hidden min-h-[640px] lg:min-h-[720px] flex items-center"
        aria-label="Homepage hero"
      >
        {/* Background image (warm nature) */}
        <div
          className="absolute inset-0 bg-cover bg-center transform-gpu transition-transform duration-700"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=1800&h=1000&fit=crop&q=80)', filter: 'brightness(.88) saturate(.95)' }}
          aria-hidden
        />

        {/* Decorative soft shapes */}
        <div className="absolute -left-24 -top-10 w-96 h-96 rounded-full bg-gradient-to-tr from-amber-100/40 to-emerald-100/30 filter blur-3xl opacity-80 animate-[floatUp_8s_ease-in-out_infinite]" aria-hidden />

        {/* Warm overlay for contrast */}
        <div ref={overlayRef} className="relative z-10 container mx-auto px-6 py-24 transition-all duration-700">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-2xl">
              <span className="inline-block px-3 py-1 rounded-full bg-amber-50 text-amber-700 font-semibold text-sm mb-6 soft-shadow">Plant-forward • Expert-backed • Pure sourcing</span>

              <h1 className="text-4xl md:text-5xl lg:text-6xl leading-tight font-extrabold text-emerald-900 drop-shadow-sm">
                Nourish your body, gently.
                <span className="block text-3xl md:text-4xl text-amber-700 font-semibold mt-3">Natural ingredients. Thoughtful science.</span>
              </h1>

              <p className="mt-6 text-lg md:text-xl text-emerald-800/80 max-w-xl leading-relaxed">
                Tailored herbal and nutritional formulas crafted to support daily vitality, restful sleep, and balanced digestion — with transparency you can trust.
              </p>

              <div className="mt-8 flex flex-wrap gap-4 items-center">
                <Link to="/quiz" className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-amber-400 text-emerald-900 font-semibold transition transform hover:-translate-y-1 hover:scale-[1.02] shadow-md">
                  Take the Quick Quiz <ArrowRight size={16} />
                </Link>

                <Link to="/products" className="inline-flex items-center gap-3 px-6 py-3 rounded-full border-2 border-amber-100 bg-white/60 glass-card text-emerald-900 font-semibold transition transform hover:-translate-y-1">
                  Explore Collections
                </Link>
              </div>

              <div className="mt-8 flex gap-6 items-center text-sm text-emerald-700/80">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-amber-100/80 text-amber-800 font-semibold">✓</span>
                  <span>Organic & ethically sourced</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-emerald-100/80 text-emerald-800 font-semibold">✓</span>
                  <span>Third-party tested</span>
                </div>
              </div>
            </div>

            {/* Hero Feature Card */}
            <div className="relative">
              <div className="glass-card rounded-3xl p-6 md:p-8 soft-shadow transform transition-all duration-500 hover:scale-[1.015]">
                <div className="flex items-start gap-5">
                  <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 shadow-inner">
                    <img
                      src="/images.png"
                      alt="Herbal extract"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-emerald-900/80 font-semibold">Curation Spotlight</p>
                    <h3 className="text-xl md:text-2xl font-bold text-emerald-900 mt-1">Calm Night — Magnesium + Chamomile</h3>
                    <p className="mt-2 text-sm text-emerald-800/80 line-clamp-3">
                      A gentle sleep blend featuring well-tolerated magnesium citrate and chamomile extract to support restorative sleep and calm.
                    </p>

                    <div className="mt-4 flex items-center gap-3">
                      <Link to="/products/vitd3k2" className="text-sm inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 text-amber-700 font-semibold hover:scale-105 transition">
                        Shop product
                      </Link>
                      <span className="px-3 py-2 text-sm rounded-full bg-emerald-50 text-emerald-700 font-medium">4.8 ★</span>
                    </div>
                  </div>
                </div>

                {/* subtle decorative herbs */}
                <div className="absolute -right-6 -bottom-6 w-40 h-40 bg-emerald-50 rounded-full opacity-70 blur-[34px] pointer-events-none" aria-hidden />
              </div>

              {/* Tiny badges under card */}
              <div className="mt-4 flex gap-3 items-center text-sm">
                <div className="inline-flex items-center gap-2 px-3 py-2 bg-white rounded-full shadow-sm">
                  <span className="text-amber-600 font-semibold">🌿</span> Plant-forward
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-2 bg-white rounded-full shadow-sm">
                  <span className="text-emerald-600 font-semibold">🔬</span> Clinically-informed
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- USPs ---------- */}
      <section className="py-20 px-6 lg:py-28">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-amber-600 uppercase">Our Promise</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-emerald-900 mt-3">Clean ingredients, honest science</h2>
            <p className="mt-4 text-neutral-700 max-w-2xl mx-auto">We combine traditional botanicals and modern nutritional science to make effective, gentle supplements.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '🌱', title: 'Sustainably Sourced', desc: 'We partner with ethical growers to ensure integrity from seed to bottle.' },
              { icon: '🧪', title: 'Third-Party Tested', desc: 'Purity and potency verified by independent labs.' },
              { icon: '💚', title: 'Gentle & Effective', desc: 'Formulations designed for everyday use and long-term wellness.' }
            ].map((item, idx) => (
              <div key={idx} className="glass-card p-6 rounded-2xl soft-shadow hover:-translate-y-2 transition-transform duration-400 border border-emerald-50">
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="text-xl font-bold text-emerald-900">{item.title}</h3>
                <p className="mt-2 text-neutral-700">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- FEATURED PRODUCTS ---------- */}
      <section className="py-16 px-6 bg-emerald-50/30">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-sm text-amber-700 font-semibold uppercase">Bestsellers</p>
              <h3 className="text-3xl md:text-4xl font-extrabold text-emerald-900">Customer Favorites</h3>
            </div>
            <Link to="/products" className="text-sm font-semibold inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm hover:shadow-md">
              View all <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProductsPlaceholder.map((product) => (
              <div key={product._id} className="transition-transform duration-400 hover:scale-[1.01]">
                <ProductCard product={product as any} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- COLLECTIONS / BRANDS ---------- */}
      <section className="py-16 px-6">
        <div className="container mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-emerald-900">Collections</h2>
          <p className="mt-3 text-neutral-700">Curated sets to match common wellness goals</p>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {productBrands.map((b) => (
              <div key={b.id} className={`p-6 rounded-2xl text-emerald-900 glass-card soft-shadow transform hover:-translate-y-2 transition-all duration-400 border border-emerald-50`}>
                <div className="text-3xl mb-3">{b.icon}</div>
                <h4 className="font-bold text-lg">{b.name}</h4>
                <p className="mt-2 text-sm text-neutral-700">{b.description}</p>
                <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-amber-700">
                  Learn more <ArrowRight size={14} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- GOALS FILTER ---------- */}
      <section className="py-16 px-6 bg-gradient-to-b from-white to-emerald-50/20">
        <div className="container mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-emerald-900">What are your health goals?</h2>
          <p className="mt-3 text-neutral-700">Filter the range by the outcomes you care about most</p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {coreGoals.map((g, idx) => (
              <Link
                key={g}
                to={`/products?benefit=${encodeURIComponent(g)}`}
                className="inline-flex items-center gap-3 px-5 py-3 rounded-full bg-white shadow-sm hover:shadow-md transition transform hover:-translate-y-1 text-neutral-800 font-semibold"
                style={{ transitionDelay: `${idx * 40}ms` }}
              >
                {g} <ArrowRight size={14} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- TESTIMONIALS ---------- */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-8">
            <p className="text-sm font-semibold text-amber-600 uppercase">Success Stories</p>
            <h3 className="text-2xl md:text-3xl font-extrabold text-emerald-900">What customers say</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <blockquote key={t.id} className="glass-card p-6 rounded-2xl soft-shadow border border-emerald-50">
                <div className="flex gap-3 items-start">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-800">{t.name.charAt(0)}</div>
                  <div>
                    <p className="text-neutral-800 italic">“{t.quote}”</p>
                    <div className="mt-4 text-sm">
                      <p className="font-semibold text-emerald-900">{t.name}</p>
                      <p className="text-neutral-600">{t.location} • {t.product}</p>
                    </div>
                  </div>
                </div>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- NEWSLETTER CTA ---------- */}
      <section className="py-16 px-6 bg-amber-50/40">
        <div className="container mx-auto">
          <div className="bg-white rounded-3xl p-8 md:p-12 soft-shadow glass-card border border-emerald-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div>
                <h4 className="text-2xl font-extrabold text-emerald-900">Stay in the loop</h4>
                <p className="mt-2 text-neutral-700">Get seasonal tips, early access to new formulas, and subscriber-only discounts.</p>
              </div>

              <form onSubmit={handleNewsletterSignup} className="flex gap-3 items-center">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={emailNewsletter}
                  onChange={(e) => setEmailNewsletter(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-full border border-emerald-100 outline-none focus:ring-2 focus:ring-amber-200 transition"
                  required
                />
                <button type="submit" className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-amber-400 text-emerald-900 font-semibold hover:scale-[1.02] transition">
                  <Mail size={16} /> Subscribe
                </button>
              </form>
            </div>

            {newsletterSuccess && (
              <div className="mt-6 inline-flex items-center gap-3 bg-emerald-100/50 text-emerald-900 px-4 py-2 rounded-full">
                <CheckCircle size={18} /> Thanks — check your inbox!
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ---------- BLOG POSTS (small) ---------- */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-extrabold text-emerald-900">From the Wellness Hub</h3>
            <Link to="/blog" className="text-sm font-semibold inline-flex items-center gap-2">See all <ArrowRight size={14} /></Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {healthPostsPlaceholder.map((post) => (
              <article key={post.id} className="glass-card p-6 rounded-2xl soft-shadow border border-emerald-50 hover:-translate-y-2 transition-transform">
                <div className="inline-block px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">Health Tips</div>
                <h4 className="mt-3 font-bold text-lg text-emerald-900">{post.title}</h4>
                <p className="mt-2 text-neutral-700 text-sm">{post.summary}</p>
                <a href={post.link} className="mt-4 inline-flex items-center gap-2 text-amber-700 font-semibold">Read <ArrowRight size={14} /></a>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- FOOTER (simple) ---------- */}
      <footer className="py-10 px-6 bg-emerald-900 text-white">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-lg font-bold">Vital & Co</div>
            <div className="text-sm text-amber-200/90">Gentle nutrition for daily living</div>
          </div>

          <div className="text-sm text-amber-100/90">© {new Date().getFullYear()} Vital & Co — All rights reserved</div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
