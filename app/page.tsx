"use client"

import { useState, useEffect } from "react"
import { Sparkles, Users, BookOpen, Heart, MapPin, Phone, Mail, ArrowRight } from "lucide-react"
import Image from "next/image"

export default function LandingPage() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 2500)
    return () => clearInterval(timer)
  }, [])

  const slides = [
    {
      title: "Divine Grace Awaits",
      subtitle: "Experience Spiritual Transformation",
      image: "/hero1.jpg",
      cta: "Join Our Worship",
      bgImage: "/church-worship-altar-light-spiritual.jpg",
    },
    {
      title: "Community of Faith",
      subtitle: "Growing Together in Christ",
      image: "/hero3.jpg",
      cta: "Become Part of Us",
      bgImage: "/community-worship-congregation-fellowship.jpg",
    },
    {
      title: "Spiritual Growth",
      subtitle: "Deepening Your Connection",
      image: "/hero2.jpg",
      cta: "Start Learning",
      bgImage: "/bible-study-learning-spiritual-growth.jpg",
    },
  ]

  const ministries = [
    {
      icon: Sparkles,
      title: "Live Sermons",
      description: "Experience powerful messages from Pastor Uche every Sunday",
    },
    {
      icon: BookOpen,
      title: "Daily Devotionals",
      description: "Spiritual nourishment delivered to your inbox daily",
    },
    {
      icon: Users,
      title: "Community Groups",
      description: "Connect with believers and grow in fellowship",
    },
    {
      icon: Heart,
      title: "Support & Care",
      description: "We're here for you through every season of life",
    },
  ]

  const testimonials = [
    {
      name: "Sarah Okafor",
      role: "Member since 2022",
      text: "This ministry completely transformed my understanding of faith. The community here is like family.",
      image: "/pastor.jpg",
    },
    {
      name: "David Aminu",
      role: "Youth Leader",
      text: "Finding BGM was life-changing. The teachings are profound yet relatable to modern challenges.",
      image: "/pastor.jpg",
    },
    {
      name: "Grace Emmanuel",
      role: "Member since 2021",
      text: "The love and support I've received here is unmatched. I feel truly welcomed and valued.",
      image: "/pastor.jpg",
    },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-strong">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="w-15 h-15 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                <Image src="/BGM.png" alt="BGM Logo" width={50} height={50} />
              </div>
              <div className="hidden sm:block">
                <p className="font-display font-bold text-lg">BGM</p>
                <p className="text-xs text-muted-foreground">Believers Glorious</p>
              </div>
            </div>

            {/* Nav */}
            <nav className="hidden md:flex items-center gap-8">
              {["Home", "About", "Ministries", "Contact"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-sm font-body font-medium hover:text-primary transition-colors relative group"
                >
                  {item}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
                </a>
              ))}
            </nav>

            {/* CTA Button */}
            <button className="btn-primary text-sm">Watch Live</button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-28 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Main Hero Carousel */}
          <div className="relative h-96 md:h-[500px] rounded-3xl overflow-hidden group">
            {/* Images */}
            {slides.map((slide, idx) => (
              <div
                key={idx}
                className={`absolute inset-0 transition-opacity duration-500 ${idx === currentSlide ? "opacity-100" : "opacity-0"
                  }`}
              >
                <img
                  src={slide.image || "/placeholder.svg?height=500&width=800&query=church worship"}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40" />
              </div>
            ))}

            {/* Content Overlay */}
            <div className="relative h-full flex flex-col items-center justify-center text-center text-white px-6 z-10">
              <div className="space-y-6">
                <div className="inline-block glass-strong px-4 py-2 rounded-2xl">
                  <p className="text-sm font-semibold text-primary">Welcome to BGM</p>
                </div>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-balance leading-tight">
                  {slides[currentSlide].title}
                </h1>
                <p className="text-lg md:text-2xl text-white/90 max-w-2xl mx-auto font-body">
                  {slides[currentSlide].subtitle}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <button className="btn-primary">
                    {slides[currentSlide].cta}
                    <ArrowRight className="w-4 h-4 ml-2 inline" />
                  </button>
                  <button className="btn-outline text-white border-white/40 hover:bg-white/10">Learn More</button>
                </div>
              </div>
            </div>

            {/* Carousel Controls */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`transition-all duration-300 rounded-full h-2 ${idx === currentSlide ? "bg-white w-8" : "bg-white/50 w-2 hover:bg-white/70"
                    }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <div
        className="fixed top-0 left-0 w-full h-full -z-10"
        style={{
          backgroundImage: "url('/bible-study-learning-spiritual-growth.jpg')",
          backgroundAttachment: "fixed",
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/20 to-background" />
      </div>

      {/* Stats Section */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {[
              { number: "2K+", label: "Members Nationwide" },
              { number: "3", label: "Weekly Programs" },
              { number: "24/7", label: "Prayer Support" },
              { number: "100%", label: "Faith-Driven" },
            ].map((stat, idx) => (
              <div key={idx} className="text-center glass p-6 rounded-2xl">
                <p className="text-3xl md:text-4xl font-display font-bold text-primary mb-2">{stat.number}</p>
                <p className="text-sm text-muted-foreground font-body">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ministries Section */}
      <section id="ministries" className="relative py-24 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-primary font-body font-semibold mb-4 text-lg">Our Ministries</p>
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 text-balance">
              Multiple Ways to Grow & Connect
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-body">
              Discover the diverse opportunities to deepen your faith and connect with our vibrant community
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {ministries.map((ministry, idx) => {
              const Icon = ministry.icon
              return (
                <div key={idx} className="glass-card p-8 rounded-2xl">
                  <div className="flex items-start gap-6">
                    <div className="p-4 bg-primary/10 rounded-xl transition-colors flex-shrink-0">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-display font-bold mb-3">{ministry.title}</h3>
                      <p className="text-muted-foreground leading-relaxed text-lg font-body">{ministry.description}</p>
                      <button className="mt-4 inline-flex items-center text-primary font-body font-semibold hover:gap-2 gap-1 transition-all">
                        Learn More <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="relative py-24 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="space-y-8">
              <div>
                <p className="text-primary font-body font-semibold mb-4 text-lg">About Our Leader</p>
                <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">Pastor Uche E. Ndah</h2>
              </div>

              <div className="space-y-4">
                <p className="text-xl text-muted-foreground leading-relaxed font-body">
                  With over 20 years of dedicated ministry, Pastor Uche has been a beacon of spiritual guidance and
                  transformation. His vision is to build a community where faith, love, and service intersect.
                </p>
                <p className="text-xl text-muted-foreground leading-relaxed font-body">
                  Through powerful, relatable sermons, he bridges ancient biblical wisdom with modern challenges,
                  helping thousands discover their spiritual purpose and potential.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="glass-card p-4 rounded-xl text-center">
                  <p className="text-2xl font-display font-bold text-primary">1000+</p>
                  <p className="text-sm text-muted-foreground font-body">Lives Transformed</p>
                </div>
                <div className="glass-card p-4 rounded-xl text-center">
                  <p className="text-2xl font-display font-bold text-primary">50+</p>
                  <p className="text-sm text-muted-foreground font-body">Sermons Annually</p>
                </div>
                <div className="glass-card p-4 rounded-xl text-center">
                  <p className="text-2xl font-display font-bold text-primary">Global</p>
                  <p className="text-sm text-muted-foreground font-body">Reach & Impact</p>
                </div>
              </div>

              <button className="btn-primary w-full md:w-auto text-lg">Get to Know Pastor Uche</button>
            </div>

            {/* Image */}
            <div className="hidden md:block rounded-2xl overflow-hidden h-96 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <img
                src="/pastor.jpg"
                alt="Pastor Uche"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonies Section */}
      <section id="testimonies" className="relative py-24 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-primary font-body font-semibold mb-4 text-lg">Member Stories</p>
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 text-balance">
              Real Lives, Real Transformation
            </h2>
            <p className="text-xl text-muted-foreground font-body">
              Hear from our community members about their spiritual journey
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimony, idx) => (
              <div key={idx} className="glass-card p-8 rounded-2xl">
                <div className="flex items-center gap-4 mb-6">
                  <img
                    src={testimony.image || "/placeholder.svg?height=56&width=56&query=portrait"}
                    alt={testimony.name}
                    className="w-14 h-14 rounded-full object-cover ring-2 ring-primary/20"
                  />
                  <div>
                    <h3 className="font-display font-bold text-lg">{testimony.name}</h3>
                    <p className="text-sm text-muted-foreground font-body">{testimony.role}</p>
                  </div>
                </div>
                <p className="text-lg leading-relaxed italic text-muted-foreground font-body">"{testimony.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background image with overlay */}
        <div
          className="absolute inset-0 -z-10"
          style={{
            backgroundImage: "url('/church-worship-altar-light-spiritual.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-black/50" />
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div className="space-y-8 relative z-10">
              <div className="space-y-4">
                <h2 className="text-5xl md:text-6xl font-display font-bold text-primary text-balance leading-tight">
                  Ready to Begin Your Journey?
                </h2>
                <p className="text-xl text-slate-500 leading-relaxed font-body max-w-xl">
                  Join thousands who have found spiritual fulfillment and community with BGM. Experience the
                  transformation that awaits you.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
                <button className="btn-glass">
                  Join Our Community
                  <ArrowRight className="w-4 h-4 ml-2 inline" />
                </button>
                <button className="btn-outline text-blue-700 border-blue-700/40 hover:bg-blue-700/10">Explore Events</button>
              </div>
            </div>

            {/* Right: Stats Card */}
            <div className="relative z-10 glass-strong p-8 rounded-2xl">
              <div className="space-y-8">
                <div className="space-y-2">
                  <p className="text-primary font-bold text-sm font-body uppercase tracking-wider">Why Join BGM</p>
                  <h3 className="text-2xl font-display font-bold text-slate-500">Transformative Impact</h3>
                </div>

                <div className="space-y-4">
                  {[
                    { index: 1, stat: "15K+", text: "Members in our community" },
                    { index: 2, stat: "24/7", text: "Spiritual support available" },
                    { index: 3, stat: "100%", text: "Faith-driven ministry" },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <p className="font-display font-bold text-primary text-lg">{item.index}</p>
                      </div>
                      <div>
                        <p className="font-display font-bold text-primary text-lg">{item.stat}</p>
                        <p className="text-slate-500 font-body">{item.text}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <button className="btn-primary w-full">
                  Give & Support
                  <ArrowRight className="w-4 h-4 ml-2 inline" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">Get In Touch</h2>
            <p className="text-xl text-muted-foreground font-body">We'd love to hear from you. Reach out anytime.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="glass-card p-8 rounded-2xl text-center">
              <div className="p-4 bg-primary/10 rounded-xl w-fit mx-auto mb-4">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display font-bold text-xl mb-2">Location</h3>
              <p className="text-muted-foreground font-body">123 Faith Avenue, Grace City, Nigeria</p>
            </div>

            <div className="glass-card p-8 rounded-2xl text-center">
              <div className="p-4 bg-primary/10 rounded-xl w-fit mx-auto mb-4">
                <Phone className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display font-bold text-xl mb-2">Phone</h3>
              <p className="text-muted-foreground font-body">+234 (0) 123 456 7890</p>
            </div>

            <div className="glass-card p-8 rounded-2xl text-center">
              <div className="p-4 bg-primary/10 rounded-xl w-fit mx-auto mb-4">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display font-bold text-xl mb-2">Email</h3>
              <p className="text-muted-foreground font-body">info@bgministry.com</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="glass-strong p-8 md:p-12 rounded-2xl max-w-2xl mx-auto">
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <input
                  type="text"
                  placeholder="Your Name"
                  className="glass px-6 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary bg-background/50 font-body"
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  className="glass px-6 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary bg-background/50 font-body"
                />
              </div>
              <input
                type="text"
                placeholder="Subject"
                className="glass w-full px-6 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary bg-background/50 font-body"
              />
              <textarea
                placeholder="Your Message"
                rows={4}
                className="glass w-full px-6 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary bg-background/50 font-body resize-none"
              />
              <button type="submit" className="btn-primary w-full text-lg">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-display font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2 font-body">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary transition">
                    Home
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary transition">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary transition">
                    Ministries
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-display font-bold mb-4">Resources</h3>
              <ul className="space-y-2 font-body">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary transition">
                    Sermons
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary transition">
                    Events
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary transition">
                    Give & Support
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-display font-bold mb-4">Community</h3>
              <ul className="space-y-2 font-body">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary transition">
                    Groups
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary transition">
                    Prayer Requests
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary transition">
                    Stories
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-display font-bold mb-4">Follow Us</h3>
              <ul className="space-y-2 font-body">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary transition">
                    Facebook
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary transition">
                    Instagram
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary transition">
                    Twitter
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-8">
            <p className="text-center text-muted-foreground font-body">
              &copy; 2025 Believers Glorious Ministry. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
