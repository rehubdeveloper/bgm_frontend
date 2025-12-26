import { Clock, Calendar, MapPin, Facebook, Youtube } from "lucide-react"

export default function AboutPage() {
    const sundayServices = [
        {
            title: "Last Sunday of Month",
            service: "Enough is Enough Programme",
            times: "6:45 AM & 10:00 AM"
        },
        {
            title: "First Sunday of Month",
            service: "Anointing Service",
            times: "6:45 AM & 10:00 AM"
        },
        {
            title: "Other Sundays",
            service: "Regular Service",
            times: "6:45 AM & 10:00 AM"
        }
    ]

    const weeklyActivities = [
        {
            day: "Tuesday",
            activity: "Revelation Hour (Bible Study)",
            time: "6:00 PM"
        },
        {
            day: "Thursday",
            activity: "Prayer Summit/Counseling",
            time: "9:00 AM"
        },
        {
            day: "2nd Friday of Month",
            activity: "Youth Fellowship",
            time: "6:00 PM"
        }
    ]

    const monthlyActivities = [
        {
            day: "2nd Wednesday of Month",
            activity: "Women's Fellowship",
            time: "5:30 PM"
        },
        {
            day: "Last Saturday of Month",
            activity: "Men's Fellowship",
            time: "6:00 PM"
        }
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

                            {/* Location Card */}
                            <div className="glass-card p-8 rounded-3xl">
                                <div className="flex gap-4 items-start">
                                    <div className="p-3 bg-primary/10 rounded-2xl">
                                        <MapPin className="w-6 h-6 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-display font-bold mb-2">Our Location</h3>
                                        <p className="text-muted-foreground font-body leading-relaxed">
                                            30 Sijuade Str, By Odo-Olowu B/Stop, Liesha, Surulere, Lagos
                                        </p>
                                        <div className="mt-4 pt-4 border-t border-border/50">
                                            <p className="text-sm text-muted-foreground font-body">
                                                Join us in person or online for all our services and activities
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Schedule & Info */}
                        <div className="space-y-8">
                            {/* Church Activities - Organized Layout */}
                            <div className="glass-card p-8 rounded-3xl">
                                <div className="flex items-center gap-3 mb-10">
                                    <Calendar className="w-8 h-8 text-primary" />
                                    <h2 className="text-3xl font-display font-bold">Church Activities</h2>
                                </div>

                                {/* Sunday Services Section */}
                                <div className="mb-12">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-2 h-8 bg-primary rounded-full"></div>
                                        <h3 className="text-2xl font-display font-bold text-primary">Sunday Services</h3>
                                    </div>
                                    <div className="grid gap-4">
                                        {sundayServices.map((service, idx) => (
                                            <div
                                                key={idx}
                                                className="p-6 rounded-2xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:scale-[1.02]"
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <h4 className="font-display font-bold text-xl text-primary">{service.title}</h4>
                                                    <div className="flex items-center gap-2 text-primary/80">
                                                        <Clock className="w-5 h-5" />
                                                        <span className="font-bold font-body text-sm">{service.times}</span>
                                                    </div>
                                                </div>
                                                <p className="text-muted-foreground font-body text-lg">{service.service}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Weekly Activities Section */}
                                <div className="mb-12">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-2 h-8 bg-accent rounded-full"></div>
                                        <h3 className="text-2xl font-display font-bold text-accent">Weekly Activities</h3>
                                    </div>
                                    <div className="grid gap-4">
                                        {weeklyActivities.map((activity, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center justify-between p-5 rounded-2xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:scale-[1.02]"
                                            >
                                                <div className="flex-1">
                                                    <p className="font-display font-bold text-lg">{activity.day}</p>
                                                    <p className="text-muted-foreground font-body">{activity.activity}</p>
                                                </div>
                                                <div className="flex items-center gap-2 text-primary ml-4">
                                                    <Clock className="w-4 h-4" />
                                                    <span className="font-bold font-body">{activity.time}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Monthly Activities Section */}
                                <div className="mb-8">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-2 h-8 bg-accent rounded-full"></div>
                                        <h3 className="text-2xl font-display font-bold text-accent">Monthly Activities</h3>
                                    </div>
                                    <div className="grid gap-4">
                                        {monthlyActivities.map((activity, idx) => (
                                            <div
                                                key={idx}
                                                className="flex items-center justify-between p-5 rounded-2xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:scale-[1.02]"
                                            >
                                                <div className="flex-1">
                                                    <p className="font-display font-bold text-lg">{activity.day}</p>
                                                    <p className="text-muted-foreground font-body">{activity.activity}</p>
                                                </div>
                                                <div className="flex items-center gap-2 text-primary ml-4">
                                                    <Clock className="w-4 h-4" />
                                                    <span className="font-bold font-body">{activity.time}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>


                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
