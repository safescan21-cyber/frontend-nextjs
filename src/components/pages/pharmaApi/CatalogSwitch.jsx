import { useLocale } from '../../../i18n/LocaleContext';
import React from 'react';
import { Link } from '../../../shell/router';
import { Factory, FlaskConical } from 'lucide-react';

// Switch between the two catalogues: machinery (/shop) and pharma APIs (/pharma-api)
const CatalogSwitch = ({ active, className = '' }) => {
  const { t } = useLocale();
  const item = (key, to, Icon, label, sub) => (
    <Link
      to={to}
      aria-current={active === key ? 'page' : undefined}
      className={`flex flex-1 items-center gap-2.5 rounded-lg px-3 py-2.5 text-left transition-colors sm:px-4 ${
        active === key ? 'bg-blue-600 text-white shadow' : 'bg-white text-slate-700 hover:bg-blue-50'
      }`}
    >
      <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
      <span>
        <span className="block text-sm font-semibold">{label}</span>
        <span className={`block text-xs ${active === key ? 'text-white' : 'text-slate-600'}`}>{sub}</span>
      </span>
    </Link>
  );
  return (
    <nav aria-label={t("Catalogue")} className={`flex gap-2 rounded-xl border border-slate-200 bg-slate-100 p-1.5 ${className}`}>
      {item('machinery', '/shop', Factory, 'Machinery', 'Pharma & food machines')}
      {item('api', '/pharma-api', FlaskConical, 'Pharma APIs', 'Active ingredients & bulk drugs')}
    </nav>
  );
};

export default CatalogSwitch;
