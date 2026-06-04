import React from "react";
import { motion } from "framer-motion";

export const SuperAdminSettings: React.FC = () => {
  return (
    <div className="flex flex-col gap-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl bg-surface border border-border flex flex-col gap-6 shadow-sm"
      >
        <div>
          <h3 className="font-extrabold text-lg">Platform Settings</h3>
          <p className="text-xs text-muted font-medium">Manage global platform configurations and policies</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-1">Platform Name</label>
              <input type="text" className="w-full bg-background border border-input rounded-xl py-2 px-4 focus:ring-2 focus:ring-primary" defaultValue="FitCore Multi-tenant" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Support Email</label>
              <input type="email" className="w-full bg-background border border-input rounded-xl py-2 px-4 focus:ring-2 focus:ring-primary" defaultValue="support@fitcore.com" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Global Notification</label>
              <textarea className="w-full bg-background border border-input rounded-xl py-2 px-4 focus:ring-2 focus:ring-primary min-h-[100px]" placeholder="Broadcast a message to all Gym Owners..."></textarea>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 border border-border rounded-xl bg-background/50">
              <h4 className="font-bold mb-2">Billing Integrations</h4>
              <div className="flex items-center justify-between text-sm py-2">
                <span className="font-medium">Stripe Gateway</span>
                <span className="text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">Connected</span>
              </div>
              <div className="flex items-center justify-between text-sm py-2 border-t border-border mt-2">
                <span className="font-medium">PayPal</span>
                <button className="text-primary font-bold hover:underline">Connect</button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="pt-4 flex justify-end">
          <button className="px-6 py-2 bg-primary text-primary-foreground font-bold rounded-xl shadow hover:bg-primary/90 transition-colors">
            Save Configuration
          </button>
        </div>
      </motion.div>
    </div>
  );
};
