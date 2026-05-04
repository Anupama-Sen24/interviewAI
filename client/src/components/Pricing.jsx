import React from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, Zap, Shield, ChevronRight } from 'lucide-react';
import Button from './ui/Button';
import Card from './ui/Card';
import { useNavigate } from 'react-router-dom';

const Pricing = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: "Starter",
      price: "0",
      description: "Perfect for students practicing their first interviews.",
      features: ["2 AI Interviews / mo", "Basic Performance Report", "Community Support", "Standard Sarah AI Avatar"],
      icon: <Zap className="w-6 h-6 text-primary" />,
      color: "border-gray-100"
    },
    {
      name: "Pro",
      price: "1,499",
      description: "For serious candidates aiming for top-tier companies.",
      features: ["Unlimited AI Interviews", "Advanced Skill Analytics", "Priority Support", "All AI Interrogators", "Downloadable PDF Reports"],
      popular: true,
      icon: <Sparkles className="w-6 h-6 text-secondary" />,
      color: "border-primary shadow-2xl shadow-primary/10"
    },
    {
      name: "Elite",
      price: "4,999",
      description: "Complete career transformation with dedicated insights.",
      features: ["Everything in Pro", "1-on-1 Expert Review", "Company Specific Mocks", "Referral Network Access"],
      icon: <Shield className="w-6 h-6 text-accent" />,
      color: "border-gray-100"
    }
  ];

  const handleSubscription = (plan) => {
    if (plan.price === "0") {
      navigate('/dashboard');
    } else {
      // Razorpay Integration Placeholder
      alert(`Razorpay Payment Gateway would open for ${plan.name} Plan (₹${plan.price})`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-24 px-8">
      <div className="text-center max-w-3xl mx-auto mb-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-2 text-primary font-bold mb-4"
        >
          <Sparkles className="w-5 h-5" />
          <span className="uppercase tracking-[0.3em] text-xs">Flexible Pricing</span>
        </motion.div>
        <h1 className="text-5xl font-black mb-6 tracking-tight">Invest in Your Career</h1>
        <p className="text-xl text-text-muted font-medium">Choose a plan that fits your preparation stage. No hidden fees, cancel anytime.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-10 items-stretch">
        {plans.map((plan, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card 
              className={`p-10 h-full flex flex-col relative overflow-hidden bg-white ${plan.color}`}
              hover={true}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-bl-2xl">
                  Most Popular
                </div>
              )}
              
              <div className="mb-10">
                <div className="mb-4">{plan.icon}</div>
                <h3 className="text-2xl font-black mb-2">{plan.name}</h3>
                <p className="text-sm text-text-muted font-medium">{plan.description}</p>
              </div>

              <div className="mb-10 flex items-baseline gap-1">
                <span className="text-4xl font-black">₹{plan.price}</span>
                <span className="text-text-muted font-bold">/lifetime</span>
              </div>

              <ul className="space-y-4 mb-10 flex-grow">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-center gap-3 text-sm font-bold text-gray-700">
                    <div className="bg-success/10 p-1 rounded-full">
                      <Check className="w-3 h-3 text-success" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>

              <Button 
                variant={plan.popular ? 'primary' : 'outline'}
                className="w-full py-4 text-sm"
                onClick={() => handleSubscription(plan)}
              >
                Get Started
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="mt-24 p-12 bg-gray-50/50 rounded-[3rem] border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-10">
        <div className="max-w-xl">
          <h3 className="text-2xl font-black mb-2">Need a custom plan for your university?</h3>
          <p className="text-text-muted font-medium italic">"We provide special enterprise licenses for educational institutions and coaching centers."</p>
        </div>
        <Button variant="ghost" className="whitespace-nowrap px-10 border border-gray-200">
          Contact Sales
        </Button>
      </div>
    </div>
  );
};

export default Pricing;
