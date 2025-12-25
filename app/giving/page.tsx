import { Heart, Landmark, Globe, Receipt, Copy } from "lucide-react"

export default function GivingPage() {
    const accounts = [
        { currency: "Naira", number: "0125848372", icon: Landmark },
        { currency: "USD", number: "0621684380", icon: Globe },
        { currency: "EUR", number: "0621684359", icon: Globe },
        { currency: "GBP", number: "0621684373", icon: Globe },
    ]

    return (
        <div className="min-h-screen bg-background text-foreground">

            {/* Hero Section */}
            <section className="relative pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-primary/5">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex p-3 bg-primary/10 rounded-2xl mb-6">
                        <Heart className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-display font-bold mb-6">Tithes, Seed & Offerings</h1>
                    <p className="text-xl text-muted-foreground font-body">
                        "Every man according as he purposeth in his heart, so let him give; not grudgingly, or of necessity: for God
                        loveth a cheerful giver." — 2 Corinthians 9:7
                    </p>
                </div>
            </section>

            {/* Bank Details Section */}
            <section className="py-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="glass-card p-8 md:p-12 rounded-3xl space-y-12">
                        <div className="text-center">
                            <p className="text-sm font-bold uppercase tracking-widest text-primary mb-2">Banking Details</p>
                            <h2 className="text-3xl font-display font-bold">WEMA BANK</h2>
                            <p className="text-muted-foreground font-body mt-2">Believers Glorious Ministry</p>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-6">
                            {accounts.map((acc, idx) => (
                                <div key={idx} className="glass p-6 rounded-2xl border-2 border-primary/10 group">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-primary/10 rounded-lg">
                                                <acc.icon className="w-5 h-5 text-primary" />
                                            </div>
                                            <span className="font-display font-bold text-lg">{acc.currency}</span>
                                        </div>
                                        <button className="text-primary hover:bg-primary/5 p-2 rounded-lg transition-colors">
                                            <Copy className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <p className="text-2xl font-mono font-bold tracking-wider">{acc.number}</p>
                                </div>
                            ))}
                        </div>

                        <div className="grid sm:grid-cols-2 gap-8 pt-8 border-t border-primary/10">
                            <div className="space-y-1">
                                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Sort Code</p>
                                <p className="text-xl font-display font-bold">035151050</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Swift Code</p>
                                <p className="text-xl font-display font-bold">WEMANGLA</p>
                            </div>
                        </div>

                        <div className="bg-secondary p-8 rounded-2xl flex items-start gap-4">
                            <Receipt className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                            <div className="space-y-2">
                                <p className="font-display font-bold">Notification of Giving</p>
                                <p className="text-sm text-secondary-foreground/70 font-body leading-relaxed">
                                    After making your contribution, please send a confirmation message to our finance team at{" "}
                                    <span className="font-bold">finance@bgministry.com</span> or via WhatsApp so we can appropriately
                                    acknowledge your seed.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    )
}
