import { MapPin, Phone, Mail, Facebook, Youtube, Instagram, Twitter, Send } from "lucide-react"

export default function ContactPage() {
    const contactInfo = [
        {
            icon: MapPin,
            title: "Our Location",
            details: ["30 Sijuade Str, By Odo-Olowu B/Stop", "Liesha, Surulere, Lagos, Nigeria"],
        },
        {
            icon: Phone,
            title: "Phone Number",
            details: ["+234 (0) 123 456 7890", "+234 (0) 098 765 4321"],
        },
        {
            icon: Mail,
            title: "Email Address",
            details: ["info@bgministry.com", "pastor@bgministry.com"],
        },
    ]

    const socialLinks = [
        { icon: Facebook, name: "Facebook", href: "https://www.facebook.com/bgmwonderland", color: "hover:text-blue-600" },
        { icon: Youtube, name: "YouTube", href: "https://www.youtube.com/@bgmwonderland", color: "hover:text-red-600" },
    ]

    return (
        <div className="min-h-screen bg-background text-foreground">

            {/* Hero Section */}
            <section className="relative pt-32 pb-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-6xl font-display font-bold mb-6">Get In Touch</h1>
                    <p className="text-xl text-muted-foreground font-body">
                        Have questions or need prayer? We're here to listen and support you in your spiritual journey.
                    </p>
                </div>
            </section>

            {/* Contact Grid */}
            <section className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-3 gap-12">
                        {/* Contact Info Cards */}
                        <div className="lg:col-span-1 space-y-6">
                            {contactInfo.map((info, idx) => (
                                <div key={idx} className="glass-card p-8 rounded-3xl">
                                    <div className="p-3 bg-primary/10 rounded-2xl w-fit mb-6">
                                        <info.icon className="w-6 h-6 text-primary" />
                                    </div>
                                    <h3 className="text-xl font-display font-bold mb-3">{info.title}</h3>
                                    <div className="space-y-1">
                                        {info.details.map((detail, dIdx) => (
                                            <p key={dIdx} className="text-muted-foreground font-body">
                                                {detail}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            <div className="glass-card p-8 rounded-3xl">
                                <h3 className="text-xl font-display font-bold mb-6">Follow Our Journey</h3>
                                <div className="flex gap-4">
                                    {socialLinks.map((social, idx) => (
                                        <a
                                            key={idx}
                                            href={social.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`p-3 rounded-xl bg-secondary transition-all duration-300 ${social.color} hover:scale-110`}
                                            aria-label={social.name}
                                        >
                                            <social.icon className="w-6 h-6 text-secondary-foreground" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="lg:col-span-2">
                            <div className="glass-strong p-8 md:p-12 rounded-3xl h-full">
                                <h2 className="text-3xl font-display font-bold mb-8">Send Us a Message</h2>
                                <form className="grid sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold font-body text-muted-foreground ml-2">Full Name</label>
                                        <input
                                            type="text"
                                            className="glass w-full px-6 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary bg-background/50 font-body"
                                            placeholder="Enter your name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold font-body text-muted-foreground ml-2">Email Address</label>
                                        <input
                                            type="email"
                                            className="glass w-full px-6 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary bg-background/50 font-body"
                                            placeholder="Enter your email"
                                        />
                                    </div>
                                    <div className="sm:col-span-2 space-y-2">
                                        <label className="text-sm font-bold font-body text-muted-foreground ml-2">Subject</label>
                                        <input
                                            type="text"
                                            className="glass w-full px-6 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary bg-background/50 font-body"
                                            placeholder="How can we help?"
                                        />
                                    </div>
                                    <div className="sm:col-span-2 space-y-2">
                                        <label className="text-sm font-bold font-body text-muted-foreground ml-2">Your Message</label>
                                        <textarea
                                            rows={6}
                                            className="glass w-full px-6 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary bg-background/50 font-body resize-none"
                                            placeholder="Write your message here..."
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <button className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-3 group">
                                            Send Message
                                            <Send className="w-5 h-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Map Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-secondary/30">
                <div className="max-w-7xl mx-auto">
                    <div className="rounded-3xl overflow-hidden h-[400px] glass-card grayscale hover:grayscale-0 transition-all duration-700">
                        <iframe
                            title="Church Location"
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.4443229729835!2d3.34241517588383!3d6.465261393526132!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103b8c005f77838d%3A0xe5493019808a3852!2s30%20Sijuwade%20St%2C%20Surulere%2C%20Lagos!5e0!3m2!1sen!2sng!4v1714000000000!5m2!1sen!2sng"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                        />
                    </div>
                </div>
            </section>
        </div>
    )
}
