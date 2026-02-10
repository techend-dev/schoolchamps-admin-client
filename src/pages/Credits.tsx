import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Coins,
    Zap,
    ArrowRight,
    CheckCircle2,
    TrendingUp,
    CreditCard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { schoolService, School } from '@/lib/services/schoolService';
import { paymentService } from '@/lib/services/paymentService';
import { useToast } from '@/hooks/use-toast';

export default function Credits() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [school, setSchool] = useState<School | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.schoolId) {
            fetchSchool();
        }
    }, [user?.schoolId]);

    const fetchSchool = async () => {
        try {
            setLoading(true);
            const data = await schoolService.getById(user!.schoolId!);
            setSchool(data);
        } catch (error) {
            console.error('Error fetching school:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleBuyCredits = async () => {
        const res = await loadRazorpay();
        if (!res) {
            toast({ title: 'Error', description: 'Razorpay SDK failed to load', variant: 'destructive' });
            return;
        }

        try {
            const { order } = await paymentService.createOrder();

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: 'SchoolChamps',
                description: 'Purchase 99 Credits',
                order_id: order.id,
                handler: async (response: any) => {
                    try {
                        await paymentService.verifyPayment(response);
                        toast({ title: 'Success', description: 'Credits added successfully!' });
                        fetchSchool();
                    } catch (err) {
                        toast({ title: 'Error', description: 'Payment verification failed', variant: 'destructive' });
                    }
                },
                prefill: {
                    name: user?.name,
                    email: user?.email,
                },
                theme: {
                    color: '#0D9488',
                },
            };

            const paymentObject = new (window as any).Razorpay(options);
            paymentObject.open();
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to initiate payment', variant: 'destructive' });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-2">School Credits</h1>
                    <p className="text-muted-foreground font-medium uppercase tracking-[0.2em] text-xs">Fuel your school's digital presence</p>
                </div>
                {school && (
                    <Card className="px-6 py-4 bg-primary/10 border-primary/20 shadow-glow flex items-center gap-6">
                        <div>
                            <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Current Balance</p>
                            <div className="flex items-center gap-2">
                                <Coins className="h-6 w-6 text-primary" />
                                <span className="text-3xl font-black text-white">{school.coins}</span>
                            </div>
                        </div>
                        <Zap className="h-10 w-10 text-primary opacity-20" />
                    </Card>
                )}
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Offer */}
                <Card className="lg:col-span-2 p-8 bg-card border-white/[0.05] shadow-medium relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                        <TrendingUp className="w-64 h-64 -mr-16 -mt-16" />
                    </div>

                    <div className="relative z-10 space-y-8">
                        <div>
                            <Badge className="bg-primary/20 text-primary border-primary/30 mb-4 px-3 py-1 font-bold uppercase tracking-widest text-[10px]">Most Popular</Badge>
                            <h2 className="text-4xl font-black text-white">Refill Credits</h2>
                            <p className="text-muted-foreground mt-2 font-medium">Get 99 coins to publish your next batch of amazing stories.</p>
                        </div>

                        <div className="flex items-baseline gap-4">
                            <span className="text-6xl font-black text-white">₹99</span>
                            <span className="text-muted-foreground font-bold">/ 99 COINS</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                '1 Post = 99 Points',
                                'Earn 50 Points back per post',
                                'Coins stack every month',
                                'Instant WordPress publishing',
                                'Premium AI Tools access',
                                'Priority support'
                            ].map((feature) => (
                                <div key={feature} className="flex items-center gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                                    <span className="text-sm font-medium text-white/80">{feature}</span>
                                </div>
                            ))}
                        </div>

                        <div className="pt-4 border-t border-white/5">
                            <div className="flex justify-between items-center mb-6">
                                <div className="text-sm text-muted-foreground">
                                    Total Payable: <span className="text-white font-bold">₹101.35</span>
                                    <p className="text-[10px] opacity-60">(Includes ₹2.35 convenience fee)</p>
                                </div>
                                <Button onClick={handleBuyCredits} size="lg" className="h-14 px-8 bg-primary hover:bg-primary-light shadow-glow gap-3 font-bold text-lg">
                                    Buy Now
                                    <ArrowRight className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Info Sidebar */}
                <div className="space-y-6">
                    <Card className="p-6 bg-white/5 border-white/10 space-y-6">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-primary" />
                            How it works
                        </h3>
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-white">1. Buy Credits</p>
                                <p className="text-xs text-muted-foreground">Purchase coins at ₹1 per coin (min 99 coins).</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-white">2. Publish Post</p>
                                <p className="text-xs text-muted-foreground">Every WordPress post costs 99 coins from your balance.</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-white">3. Get Rewarded</p>
                                <p className="text-xs text-muted-foreground">After every successful post, you earn 50 coins back!</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-white">4. Stack & Grow</p>
                                <p className="text-xs text-muted-foreground">Coins never expire and stack month over month.</p>
                            </div>
                        </div>
                    </Card>

                    <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10">
                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">Need Help?</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Questions about your credits or billing? Our support team is here to help 24/7.
                        </p>
                        <Button variant="link" className="text-primary text-xs font-bold p-0 mt-4">Contact Support →</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
