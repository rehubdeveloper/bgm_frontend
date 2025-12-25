import { Clock, Calendar, MapPin, Facebook, Youtube } from "lucide-react"

export default function AboutPage() {
    const schedule = [
        { day: "1st Sunday", activity: "Anointing Service", time: "7:30 AM" },
        { day: "Last Sunday", activity: "Enough is Enough Service", time: "7:30 AM" },
        { day: "Thursdays", activity: "Prayer Summit", time: "7:30 AM" },
        { day: "1st Day of Month", activity: "Commanding the Month", time: "7:00 AM" },
    ]

    return (
        <div className="min-h-screen bg-background text-foreground">

            {/* Hero Section */}
            <section className="relative pt-32 pb-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto text-center">
                    <h1 className="text-4xl md:text-6xl font-display font-bold mb-6">About BGM</h1>
                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-body">
                        Believers Glorious Ministry is a community of faith dedicated to spiritual transformation and empowerment.
                    </p>
                </div>
            </section>

            {/* Pastor & Schedule Grid */}
            <section className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-start">
                        {/* Pastor Profile */}
                        <div className="space-y-8">
                            <div className="relative rounded-3xl overflow-hidden aspect-[4/5] glass-card">
                                <img
                                    src="/public.jpeg"
                                    alt="Pastor Uche E. Ndah"
                                    className="w-full h-full object-contain"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                <div className="absolute bottom-8 left-8">
                                    <h2 className="text-3xl font-display font-bold text-white">Pastor Uche E. Ndah</h2>
                                    <p className="text-primary font-semibold font-body">General Overseer</p>
                                </div>
                            </div>

                            <div className="glass-card p-8 rounded-3xl space-y-4">
                                <h3 className="text-2xl font-display font-bold">Connect With Pastor</h3>
                                <div className="flex gap-4">
                                    <a
                                        href="https://www.facebook.com/bgmwonderland"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-glass flex-1 flex items-center justify-center gap-2"
                                    >
                                        <Facebook className="w-5 h-5" />
                                        Facebook
                                    </a>
                                    <a
                                        href="https://www.youtube.com/@bgmwonderland"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-glass flex-1 flex items-center justify-center gap-2"
                                    >
                                        <Youtube className="w-5 h-5" />
                                        YouTube
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Schedule & Info */}
                        <div className="space-y-8">
                            <div className="glass-card p-8 rounded-3xl">
                                <div className="flex items-center gap-3 mb-8">
                                    <Calendar className="w-8 h-8 text-primary" />
                                    <h2 className="text-3xl font-display font-bold">Weekly Activities</h2>
                                </div>

                                <div className="space-y-4">
                                    {schedule.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between p-4 rounded-2xl bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors"
                                        >
                                            <div>
                                                <p className="font-display font-bold text-lg">{item.day}</p>
                                                <p className="text-muted-foreground font-body">{item.activity}</p>
                                            </div>
                                            <div className="flex items-center gap-2 text-primary">
                                                <Clock className="w-4 h-4" />
                                                <span className="font-bold font-body">{item.time}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-8 p-6 rounded-2xl bg-secondary text-secondary-foreground">
                                    <div className="flex gap-4">
                                        <MapPin className="w-6 h-6 text-primary flex-shrink-0" />
                                        <div>
                                            <p className="font-display font-bold mb-1">Our Location</p>
                                            <p className="text-sm font-body opacity-80">
                                                30 Sijuade Str, By Odo-Olowu B/Stop, Liesha, Surulere, Lagos
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="glass-card p-8 rounded-3xl bg-primary text-primary-foreground">
                                <h3 className="text-2xl font-display font-bold mb-4">Every Sunday</h3>
                                <p className="text-3xl font-display font-bold mb-2">Join Us at 7:30 AM</p>
                                <p className="font-body opacity-90">Experience spiritual growth and fellowship in person or online.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
