import React, { useState } from 'react';
import axios from 'axios';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { API_BASE_URL } from '../api';
import SEO from '../components/SEO';

const ContactUs = () => {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_BASE_URL}/enquiry`, formData);
            alert('Thank you for contacting Zuvello! We will get back to you shortly.');
            setFormData({ name: '', email: '', message: '' });
        } catch (error) {
            console.error('Error submitting form:', error);
            alert('Sorry, there was an issue submitting your message. Please try again.');
        }
    };

    return (
    <div className="pt-4 pb-20 min-h-screen bg-[#fdfaf7] font-sans">
      <SEO 
        title="Contact Us" 
        description="Get in touch with the Zuvello team. We're here to help with your premium plushies and soft toy orders."
        keywords={["contact zuvello", "zuvello customer support", "clothing item store contact"]}
        schema={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          "name": "Contact Zuvello",
          "description": "Contact our customer happiness team for any inquiries about our plushies and soft toys.",
          "url": "https://www.zuvello.in/contact"
        }}
      />
            <div className="max-w-6xl mx-auto px-4">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-black text-[#1c1c1c] tracking-tight mb-4">Contact Zuvello</h1>
                    <p className="text-lg text-gray-500 font-medium max-w-2xl mx-auto">
                        Have a question about our plushies? Want to partner with us? We'd love to hear from you!
                    </p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-12 bg-white rounded-[30px] p-8 md:p-12 shadow-xl shadow-[#cf7e28]/5 border border-[#f5eadb]">
                    
                    {/* Contact Info */}
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-2xl font-extrabold text-[#1c1c1c] mb-6">Get in Touch</h2>
                            <p className="text-[#483d36] leading-relaxed mb-8">
                                Our customer happiness team is available Monday through Friday, 9 AM to 6 PM. We aim to respond to all inquiries within 24 hours.
                            </p>
                        </div>
                        
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-[#fdfaf7] text-[#cf7e28] rounded-xl flex items-center justify-center shrink-0 border border-[#f5eadb]">
                                    <Phone size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-[#1c1c1c] mb-1">Call Us (Proprietor)</h4>
                                    <p className="text-[#483d36] font-medium text-sm">+91 8873405595</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-[#fdfaf7] text-[#cf7e28] rounded-xl flex items-center justify-center shrink-0 border border-[#f5eadb]">
                                    <Mail size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-[#1c1c1c]">Email Us</h4>
                                    <p className="text-[#483d36] mt-1">info@zuvello.com</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-[#fdfaf7] text-[#cf7e28] rounded-xl flex items-center justify-center shrink-0 border border-[#f5eadb]">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-[#1c1c1c]">Visit Us</h4>
                                    <p className="text-[#483d36] mt-1 leading-relaxed">
                                        C-31, Nawada Housing Complex, <br/>
                                        New Delhi-110059
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-[#fdfaf7] rounded-2xl p-6 md:p-8 border border-[#f5eadb]">
                        <h3 className="text-xl font-bold text-[#1c1c1c] mb-6">Send us a Message</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-[#483d36] mb-1">Your Name</label>
                                <input 
                                    type="text" 
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#cf7e28]"
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-[#483d36] mb-1">Your Email</label>
                                <input 
                                    type="email" 
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#cf7e28]"
                                    placeholder="john@example.com"
                                    value={formData.email}
                                    onChange={e => setFormData({...formData, email: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-[#483d36] mb-1">Message</label>
                                <textarea 
                                    required
                                    rows="4"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#cf7e28] resize-none"
                                    placeholder="How can we help you today?"
                                    value={formData.message}
                                    onChange={e => setFormData({...formData, message: e.target.value})}
                                ></textarea>
                            </div>
                            <button 
                                type="submit" 
                                className="w-full bg-[#cf7e28] hover:bg-[#b56e22] transition-colors text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2"
                            >
                                <Send size={18} /> Send Message
                            </button>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ContactUs;
