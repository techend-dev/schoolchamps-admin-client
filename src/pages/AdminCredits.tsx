import { useState, useEffect } from 'react';
import {
    Coins,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    History,
    School as SchoolIcon,
    DollarSign,
    Filter,
    Download
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { adminService } from '@/lib/services/adminService';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface CreditAnalytics {
    stats: {
        totalCoins: number;
        totalRevenue: number;
        activeSchools: number;
    };
    schools: any[];
    dailyTrends: any[];
    recentTransactions: any[];
}

export default function AdminCredits() {
    const [data, setData] = useState<CreditAnalytics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const res = await adminService.getCreditAnalytics();
            setData(res);
        } catch (error) {
            console.error('Error fetching credit analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    const stats = [
        {
            label: 'Total Revenue',
            value: `₹${data?.stats.totalRevenue.toLocaleString()}`,
            icon: DollarSign,
            description: 'Lifetime purchases'
        },
        {
            label: 'Circulating Coins',
            value: data?.stats.totalCoins.toLocaleString(),
            icon: Coins,
            description: 'Currently in school wallets'
        },
        {
            label: 'Active Schools',
            value: data?.stats.activeSchools.toString(),
            icon: SchoolIcon,
            description: 'Schools with credit system'
        },
        {
            label: 'Avg. Revenue/School',
            value: `₹${Math.round(data?.stats.totalRevenue! / (data?.stats.activeSchools || 1)).toLocaleString()}`,
            icon: TrendingUp,
            description: 'Monetization efficiency'
        }
    ];

    const maxValue = Math.max(...(data?.dailyTrends.map(d => d.purchases + d.usage) || [1]), 1);

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 uppercase tracking-wider">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-white mb-2">Credit Analytics</h1>
                    <p className="text-xs text-muted-foreground font-bold flex items-center gap-2">
                        <History className="h-4 w-4 text-primary" />
                        System-wide coin movement and revenue
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" size="sm" className="h-10 bg-white/5 border-white/10 font-bold gap-2">
                        <Filter className="h-4 w-4" />
                        Filter
                    </Button>
                    <Button variant="outline" size="sm" className="h-10 bg-white/5 border-white/10 font-bold gap-2">
                        <Download className="h-4 w-4" />
                        Export Report
                    </Button>
                </div>
            </header>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <Card key={stat.label} className="p-6 bg-card border-white/[0.05] shadow-medium group hover:border-primary/20 transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors">
                                <stat.icon className="h-5 w-5 text-primary" />
                            </div>
                        </div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{stat.label}</p>
                        <p className="text-2xl font-black text-white mb-1">{stat.value}</p>
                        <p className="text-[10px] text-muted-foreground font-medium">{stat.description}</p>
                    </Card>
                ))}
            </div>

            {/* Trends Chart */}
            <Card className="p-8 bg-card border-white/[0.05] shadow-medium">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-xl font-bold text-white mb-1">Coin Trends</h2>
                        <p className="text-sm text-muted-foreground">Daily purchases vs usage (Last 30 days)</p>
                    </div>
                </div>

                <div className="flex items-end justify-between gap-2 h-64 border-b border-white/5 pb-2">
                    {data?.dailyTrends.map((day) => (
                        <div key={day._id} className="flex-1 flex flex-col items-center gap-1 group">
                            <div className="relative w-full flex flex-col items-center gap-0.5 h-full justify-end">
                                <div
                                    className="w-full bg-primary/40 rounded-t-sm transition-all group-hover:bg-primary/60"
                                    style={{ height: `${(day.purchases / maxValue) * 100}%` }}
                                    title={`Purchased: ${day.purchases}`}
                                />
                                <div
                                    className="w-full bg-red-500/40 rounded-t-sm transition-all group-hover:bg-red-500/60"
                                    style={{ height: `${(day.usage / maxValue) * 100}%` }}
                                    title={`Used: ${day.usage}`}
                                />
                            </div>
                            <span className="text-[8px] text-muted-foreground font-bold rotate-45 mt-4 origin-left whitespace-nowrap">
                                {format(new Date(day._id), 'MMM dd')}
                            </span>
                        </div>
                    ))}
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* School Balances */}
                <Card className="p-8 bg-card border-white/[0.05] shadow-medium">
                    <h2 className="text-xl font-bold text-white mb-6">School Balances</h2>
                    <div className="space-y-4">
                        {data?.schools.sort((a, b) => b.coins - a.coins).map((school) => (
                            <div key={school._id} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-primary/10">
                                        <SchoolIcon className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white">{school.name}</p>
                                        <p className="text-[10px] text-muted-foreground">{school.city}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-black text-white">{school.coins}</p>
                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">COINS</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Recent Transactions */}
                <Card className="p-8 bg-card border-white/[0.05] shadow-medium">
                    <h2 className="text-xl font-bold text-white mb-6">Recent Transactions</h2>
                    <div className="space-y-4">
                        {data?.recentTransactions.map((tx) => (
                            <div key={tx._id} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "p-2 rounded-lg",
                                        tx.type === 'purchase' ? "bg-green-500/10" : tx.type === 'reward' ? "bg-primary/10" : "bg-red-500/10"
                                    )}>
                                        <History className={cn(
                                            "h-4 w-4",
                                            tx.type === 'purchase' ? "text-green-500" : tx.type === 'reward' ? "text-primary" : "text-red-500"
                                        )} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white uppercase tracking-tight">{tx.schoolId?.name || 'System'}</p>
                                        <p className="text-[10px] text-muted-foreground max-w-[200px] truncate">{tx.description}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center gap-1 justify-end">
                                        <Badge variant="outline" className={cn(
                                            "text-[10px] font-black uppercase tracking-widest px-1",
                                            tx.type === 'purchase' ? "border-green-500/20 text-green-500" : tx.type === 'reward' ? "border-primary/20 text-primary" : "border-red-500/20 text-red-500"
                                        )}>
                                            {tx.type === 'purchase' ? '+' : tx.type === 'reward' ? '+' : '-'}{tx.coins}
                                        </Badge>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground mt-1">{format(new Date(tx.createdAt), 'MMM dd, HH:mm')}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
}
