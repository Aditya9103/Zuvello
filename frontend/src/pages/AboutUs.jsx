import React from 'react';
import SEO from '../components/SEO';

const AboutUs = () => {
    return (
    <main className="pt-4 pb-20 min-h-screen bg-[#fdfaf7] font-sans">
      <SEO 
        title="About Us" 
        description="Learn more about Zuvello, our story, and our mission to spread happiness through premium soft toys."
        schema={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          "name": "About Zuvello",
          "description": "Founded with a simple mission—to spread happiness through cuddles—Zuvello began as a small passion project.",
          "url": "https://www.zuvello.in/about"
        }}
      />
            <div className="max-w-4xl mx-auto px-4">
                <header className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-black text-[#1c1c1c] tracking-tight mb-4">About Zuvello</h1>
                    <p className="text-lg text-gray-500 font-medium max-w-2xl mx-auto">
                        Bringing joy, comfort, and the softest hugs to kids and adults alike.
                    </p>
                </header>
                
                <article className="bg-white rounded-[30px] p-8 md:p-12 shadow-xl shadow-[#cf7e28]/5 border border-[#f5eadb]">
                    <div className="space-y-8 text-[#483d36] leading-relaxed">
                        <section aria-labelledby="our-story">
                            <h2 id="our-story" className="text-2xl font-extrabold text-[#1c1c1c] mb-4">Our Story</h2>
                            <p className="mb-4">
                                Founded with a simple mission—to spread happiness through cuddles—<strong>Zuvello</strong> began as a small passion project. We noticed that finding truly premium, incredibly soft, and safe toys was harder than it should be. 
                            </p>
                            <p>
                                We set out to change that by curating and creating a collection of soft toys that aren't just toys, but companions. From giant fluffy teddy bears to magical unicorns, every Zuvello plushie is made with love and the highest quality materials.
                            </p>
                        </section>

                        <section aria-labelledby="our-promise">
                            <h2 id="our-promise" className="text-2xl font-extrabold text-[#1c1c1c] mb-4">Our Promise</h2>
                            <ul className="list-disc pl-5 space-y-2">
                                <li><strong>Unmatched Softness:</strong> We source only the most premium, hypoallergenic fabrics.</li>
                                <li><strong>Safety First:</strong> All our toys undergo rigorous safety testing, ensuring they are perfect for children of all ages.</li>
                                <li><strong>Smiles Guaranteed:</strong> We believe in the magic of a good hug, and we guarantee our toys will bring a smile to your face.</li>
                            </ul>
                        </section>

                        <section aria-labelledby="why-choose-us">
                            <h2 id="why-choose-us" className="text-2xl font-extrabold text-[#1c1c1c] mb-4">Why Choose Zuvello?</h2>
                            <p>
                                At Zuvello, we don't just sell soft toys; we deliver memories. Whether it's a birthday gift, a romantic gesture, or just a little something to make someone's day brighter, a Zuvello plushie is the perfect way to show you care. Join our family today and experience the joy of Zuvello!
                            </p>
                        </section>
                    </div>
                </article>
            </div>
        </main>
    );
};

export default AboutUs;
