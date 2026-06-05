import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const StatsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  change, 
  isPositive = true, 
  description,
  variant = 'indigo'
}) => {
  const iconVariants = {
    indigo: 'bg-brand/20 text-brand-light border-brand/30',
    emerald: 'bg-status-success/20 text-status-success border-status-success/30',
    amber: 'bg-status-warning/20 text-status-warning border-status-warning/30',
    rose: 'bg-status-danger/20 text-status-danger border-status-danger/30',
  };

  return (
    <div className="glass-card flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl md:text-3xl font-extrabold font-heading text-white mt-1.5">{value}</h3>
        </div>
        
        {Icon && (
          <div className={`p-2.5 rounded-xl border ${iconVariants[variant] || iconVariants.indigo}`}>
            <Icon size={20} />
          </div>
        )}
      </div>

      {(change || description) && (
        <div className="flex items-center gap-2 text-xs">
          {change && (
            <span className={`inline-flex items-center font-semibold rounded-full px-1.5 py-0.5 ${
              isPositive 
                ? 'bg-status-success/15 text-status-success' 
                : 'bg-status-danger/15 text-status-danger'
            }`}>
              {isPositive ? <ArrowUpRight size={14} className="mr-0.5" /> : <ArrowDownRight size={14} className="mr-0.5" />}
              {change}
            </span>
          )}
          {description && <span className="text-slate-400 font-medium truncate">{description}</span>}
        </div>
      )}
    </div>
  );
};

export default StatsCard;
